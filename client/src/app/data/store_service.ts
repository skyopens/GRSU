import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiService, IPage } from './api_service';
import { IStoreSub, StoreItem } from '../apis/store';

// 运行时解密：AES-256-GCM，密钥由 environment.storeKey 经 SHA-256 派生。
// 密文由 tool/protect.cjs 生成，放在 src/resources/data_store/，不提交仓库。
const encoder = new TextEncoder();

// 图片密文格式：[12 字节 IV][密文 ‖ 16 字节 GCM 认证标签]
const PICTURE_IV_LEN = 12;
const PICTURE_PREFIX = '/resources/pictures/store/';

function fromBase64(text: string): Uint8Array {
    const binary = atob(text);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// 派生一次就缓存住：1779 张图不必重复 digest + importKey
let store_key: Promise<CryptoKey> | null = null;

function getStoreKey(): Promise<CryptoKey> {
    if (!store_key) {
        if (!environment.storeKey) {
            return Promise.reject(new Error('environment.storeKey 缺失，无法派生解密密钥。多半是 dev server 还在用旧 bundle，重启 ng serve 即可。'));
        }
        // TS 3.9 的 lib.dom 把 digest / importKey 声明成 PromiseLike 而不是 Promise，
        // 包一层 Promise.resolve 才能得到真正的 Promise
        store_key = Promise.resolve(crypto.subtle.digest('SHA-256', encoder.encode(environment.storeKey)))
            .then((digest) => crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['decrypt']));
    }
    return store_key;
}

async function decryptStore<T>(payload: { iv: string; data: string }): Promise<T> {
    const key = await getStoreKey();
    const plain = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: fromBase64(payload.iv) },
        key,
        fromBase64(payload.data)
    );
    return JSON.parse(new TextDecoder().decode(plain)) as T;
}

async function decryptPicture(buffer: ArrayBuffer): Promise<Uint8Array> {
    const key = await getStoreKey();
    const bytes = new Uint8Array(buffer);
    const plain = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: bytes.slice(0, PICTURE_IV_LEN) },
        key,
        bytes.slice(PICTURE_IV_LEN)
    );
    return new Uint8Array(plain);
}

// 取数入口：按 environment.hasBackend 分叉。
// false → 前端拉密文、解密、内存切片；true → 走 ApiService 请求后端。
// 两条分支返回同构的 Observable，组件只认 getSubs / getData 两个方法。
@Injectable({
    providedIn: 'root'
})
export class StoreService {
    private cache: { [tab_key: string]: Promise<IStoreSub[]> } = {};
    private picture_cache: { [rel_path: string]: Promise<Blob> } = {};

    constructor(private api: ApiService) { }

    getSubs(queries: { tab: string; }): Observable<IStoreSub[]> {
        let result: Observable<IStoreSub[]>;

        if (environment.hasBackend) {
            // 后端返回的是密文信封，解密方式与本地密文文件完全一样
            result = this.api.store.getSubs(queries).pipe(
                switchMap((res) => from(decryptStore<IStoreSub[]>(res.data))),
                catchError((err) => {
                    console.error('商城分类加载失败', err);
                    return of<IStoreSub[]>([]);
                })
            );
        } else {
            if (!this.cache[queries.tab]) {
                this.cache[queries.tab] = fetch(`/resources/data_store/${queries.tab}.json`).then((res) =>
                    res.json().then((payload) => decryptStore<IStoreSub[]>(payload))
                );
            }
            result = from(this.cache[queries.tab]);
        }

        return result;
    }

    // 取某个二级分类的第 currentPage 页。pageSize 由前端决定，两种模式共用同一个值。
    getData(queries: {
        tab: string;
        sub: string;
        pageSize: number;
        currentPage: number;
        search: string;
        orderBy: string;
        lang: string;
    }): Observable<IPage<StoreItem>> {
        let result: Observable<IPage<StoreItem>>;

        if (environment.hasBackend) {
            result = this.api.store.getData(queries).pipe(
                switchMap((res) => from(decryptStore<IPage<StoreItem>>(res.data))),
                catchError((err) => {
                    console.error('商城道具加载失败', err);
                    return of<IPage<StoreItem>>({ items: [], total: 0 });
                })
            );
        } else {
            result = this.getSubs({ tab: queries.tab }).pipe(map((subs) => {
                const sub = subs.filter((s) => s.key === queries.sub)[0];
                const all = sub && sub.data ? sub.data : [];
                const hits = all.filter((item) => this.matchName(item, queries.lang, queries.search));
                const sorted = this.sortItems(hits, queries.orderBy, queries.lang);
                const start = (queries.currentPage - 1) * queries.pageSize;
                return { items: sorted.slice(start, start + queries.pageSize), total: sorted.length };
            }));
        }

        return result;
    }

    // 和后端 SQLite 的 LIKE 对齐：ASCII 大小写不敏感、其它字符（西里尔）大小写敏感，所以两边都 toLowerCase 一次。
    private matchName(item: StoreItem, lang: string, search: string): boolean {
        const name = (item.name[lang] || '').toLowerCase();
        const keyword = search.trim().toLowerCase();
        return keyword === '' || name.indexOf(keyword) >= 0;
    }

    // 名称用码点序比较，和后端 SQLite 的 BINARY 排序一致；不用 localeCompare，
    // 那个对中文是拼音序，会让两个模式的第一页装不同的东西。
    private sortItems(items: StoreItem[], orderBy: string, lang: string): StoreItem[] {
        const result = items.slice(); // copy data
        switch (orderBy) {
            case 'name':
                result.sort((a, b) => {
                    return this.compareText(a.name[lang], b.name[lang]);
                });
                break;
            case 'price_asc':
                result.sort((a, b) => {
                    return a.price_normal - b.price_normal;
                });
                break;
            case 'price_desc':
                result.sort((a, b) => {
                    return b.price_normal - a.price_normal;
                });
                break;
        }

        return result;
    }

    private compareText(left: string, right: string): number {
        left = left || '';
        right = right || '';
        let result = 0;

        if (left < right) {
            result = -1;
        } else if (left > right) {
            result = 1;
        }
        return result;
    }

    // 拉图片密文 → 解密 → Blob。同一张图只解密一次，返回的是同一个 Blob 对象。
    // 这里**不** createObjectURL：blob URL 是一次性的，谁用谁负责 revoke（见 ObfuscateSrcDirective）。
    // 缓存 Blob 而不是 URL，是因为 revoke 掉的 URL 不能复用，而切 tab 时
    // dataList 被整体替换 → *ngFor 重建 <img> → 指令会重新绑定，届时需要一个新的 URL。
    loadPicture(rel_path: string): Promise<Blob> {
        if (!this.picture_cache[rel_path]) {
            this.picture_cache[rel_path] = fetch(PICTURE_PREFIX + rel_path).then((res) =>
                res.arrayBuffer().then((buffer) =>
                    decryptPicture(buffer).then((bytes) => new Blob([bytes], { type: 'image/png' }))
                )
            );
        }
        return this.picture_cache[rel_path];
    }
}