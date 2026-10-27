import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApisResponse, EncryptedPayload } from '../data/api_service';

export interface StoreI18nText {
    'zh_CN': string;
    'en_US': string;
    'ru_RU': string;
    'be_BY': string;
}

export interface StoreItem {
    picture: string;
    name: StoreI18nText;
    desc: StoreI18nText;
    amount: number;
    unit: string;
    price_normal: number;
    price_member: number;
    price_list?: { currency: string; type: string; price: string; }[];
    text_unit?: string;
}

export interface IStoreSub {
    key: string;
    title: StoreI18nText;
    data: StoreItem[];
}

// 后端返回的是密文信封，解密统一放在 StoreService 里做，这里只声明密文类型
export type StoreResponse = ApisResponse<EncryptedPayload>;

// 单个二级分类的一页数据，同样是密文信封
export type StoreDataResponse = ApisResponse<EncryptedPayload>;

export function loadStoreApi(http: HttpClient, baseURL: string) {
    return {
        getSubs(queries: { tab: string; }): Observable<StoreResponse> {
            return http.get<StoreResponse>(`${baseURL}/apis/store/subs`, { params: queries });
        },

        // pageSize 由前端决定，两种模式共用同一个值；后端把它写进 SQL 的 LIMIT
        getData(queries: {
            tab: string;
            sub: string;
            pageSize: number;
            currentPage: number;
            search: string;
            orderBy: string;
            lang: string;
        }): Observable<StoreDataResponse> {
            const queriesFMT = Object.assign(queries, {
                pageSize: queries.pageSize.toString(),
                currentPage: queries.currentPage.toString()
            });
            return http.get<StoreDataResponse>(`${baseURL}/apis/store/items`, { params: queriesFMT });
        }
    };
}