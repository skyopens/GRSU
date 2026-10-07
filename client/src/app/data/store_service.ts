import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IStoreSub } from '../apis/store';

// 运行时解密：AES-256-GCM，密钥由 environment.storeKey 经 SHA-256 派生。
// 密文由 tool/protect.cjs 生成，放在 src/resources/data_store/，不提交仓库。
const encoder = new TextEncoder();

function fromBase64(text: string): Uint8Array {
    const binary = atob(text);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

async function decryptStore<T>(payload: { iv: string; data: string }): Promise<T> {
    if (!environment.storeKey) {
        throw new Error('environment.storeKey 缺失，无法派生解密密钥。多半是 dev server 还在用旧 bundle，重启 ng serve 即可。');
    }
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(environment.storeKey));
    const key = await crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['decrypt']);
    const plain = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: fromBase64(payload.iv) },
        key,
        fromBase64(payload.data)
    );
    return JSON.parse(new TextDecoder().decode(plain)) as T;
}

// 取数入口：按一级分类拉密文、解密、缓存。
// 将来接后端时，只需在这里按 environment.hasBackend 分叉，组件不用动。
@Injectable({
    providedIn: 'root'
})
export class StoreService {
    private cache: { [menu_key: string]: Promise<IStoreSub[]> } = {};

    getSubs(menu_key: string): Promise<IStoreSub[]> {
        if (!this.cache[menu_key]) {
            this.cache[menu_key] = fetch(`/resources/data_store/${menu_key}.json`)
                .then((res) => res.json())
                .then((payload) => decryptStore<IStoreSub[]>(payload));
        }
        return this.cache[menu_key];
    }
}
