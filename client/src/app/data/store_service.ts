import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IStoreSub } from '../apis/store';

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

// 取数入口：按一级分类拉密文、解密、缓存。
// 将来接后端时，只需在这里按 environment.hasBackend 分叉，组件不用动。
@Injectable({
    providedIn: 'root'
})
export class StoreService {
    private cache: { [menu_key: string]: Promise<IStoreSub[]> } = {};
    private picture_cache: { [rel_path: string]: Promise<Blob> } = {};

    getSubs(menu_key: string): Promise<IStoreSub[]> {
        if (!this.cache[menu_key]) {
            this.cache[menu_key] = fetch(`/resources/data_store/${menu_key}.json`).then((res) =>
                res.json().then((payload) => decryptStore<IStoreSub[]>(payload))
            );
        }
        return this.cache[menu_key];
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
