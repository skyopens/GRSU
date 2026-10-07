import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StoreI18nText {
    'zh-CN': string;
    'en-US': string;
    'ru-RU': string;
    'be-BY': string;
}

export interface StoreItem {
    picture: string;
    name: StoreI18nText;
    desc: StoreI18nText;
    amount: number;
    unit: string;
    price_normal: number;
    price_member: number;
}

export interface IStoreSub {
    key: string;
    title: StoreI18nText;
    data: StoreItem[];
}

export interface StoreResponse {
    status: number;
    data: IStoreSub[];
}

export function loadStoreApi(http: HttpClient, baseURL: string) {
    return {
        getSubs(menu_key: string): Observable<StoreResponse> {
            return http.get<StoreResponse>(`${baseURL}/apis/store/${menu_key}`);
        }
    };
}
