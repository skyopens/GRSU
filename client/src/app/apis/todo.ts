import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApisResponse } from '../data/api_service';

export interface ITodo {
    id?: number;
    title: string;
    detail: string;
    category: string;
    status: number;
    label: string;
    date?: string;
}

export const LEVEL_DICT = [{
    label: 'todo.levels.low', value: 1
}, {
    label: 'todo.levels.medium', value: 2
}, {
    label: 'todo.levels.high', value: 3
}, {
    label: 'todo.levels.critical', value: 4
}];

export function loadTodoApi(http: HttpClient, baseURL: string) {
    return {
        // 传参统一收成一个对象；没传的字段不进 query，等价于后端「缺省即不筛选」
        getList(queries: {
            search?: string;
            pageSize?: number;
            currentPage?: number;
            orderBy?: string;
        } = {}): Observable<ApisResponse<ITodo[]>> {
            const queriesFMT: { [key: string]: string } = {};
            if (queries.search) {
                queriesFMT.search = queries.search;
            }
            if (queries.pageSize !== undefined) {
                queriesFMT.pageSize = queries.pageSize.toString();
            }
            if (queries.currentPage !== undefined) {
                queriesFMT.currentPage = queries.currentPage.toString();
            }
            if (queries.orderBy) {
                queriesFMT.orderBy = queries.orderBy;
            }

            return http.get<ApisResponse<ITodo[]>>(`${baseURL}/apis/todos`, { params: queriesFMT });
        },

        getById(queries: { id: number; }): Observable<ApisResponse<ITodo>> {
            return http.get<ApisResponse<ITodo>>(`${baseURL}/apis/todos/${queries.id}`);
        },

        postCreate(data: ITodo): Observable<ApisResponse<ITodo>> {
            return http.post<ApisResponse<ITodo>>(`${baseURL}/apis/todos`, data);
        },

        putUpdate(data: ITodo): Observable<ApisResponse<ITodo>> {
            return http.put<ApisResponse<ITodo>>(`${baseURL}/apis/todos`, data);
        },

        requestDelete(queries: { ids: number[]; }): Observable<ApisResponse<string>> {
            console.log(34, queries.ids);
            return http.request<ApisResponse<string>>('DELETE', `${baseURL}/apis/todos`, { body: queries.ids, responseType: 'json' });
        }
    };
}