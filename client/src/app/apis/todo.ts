import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ITodo {
    id?: number;
    title: string;
    detail: string;
    category: string;
    status: number;
    label: string;
    date?: string;
}

export interface ApisResponse<T> {
    status: number;
    data: T;
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
        getList(search: string = '', pageSize?: number, currentPage?: number, orderBy: string = ''): Observable<ApisResponse<ITodo[]>> {
            let data = new HttpParams();

            if (search) {
                data = data.set('search', search);
            }
            if (pageSize !== undefined) {
                data = data.set('pageSize', pageSize.toString());
            }
            if (currentPage !== undefined) {
                data = data.set('currentPage', currentPage.toString());
            }
            if (orderBy) {
                data = data.set('orderBy', orderBy);
            }

            return http.get<ApisResponse<ITodo[]>>(`${baseURL}/apis/todos`, { params: data });
        },

        getById(id: number): Observable<ApisResponse<ITodo>> {
            return http.get<ApisResponse<ITodo>>(`${baseURL}/apis/todos/${id}`);
        },

        postCreate(data: ITodo): Observable<ApisResponse<ITodo>> {
            return http.post<ApisResponse<ITodo>>(`${baseURL}/apis/todos`, data);
        },

        putUpdate(data: ITodo): Observable<ApisResponse<ITodo>> {
            return http.put<ApisResponse<ITodo>>(`${baseURL}/apis/todos`, data);
        },

        requestDelete(ids: number[]): Observable<ApisResponse<string>> {
            console.log(34, ids);
            return http.request<ApisResponse<string>>('DELETE', `${baseURL}/apis/todos`, { body: ids, responseType: 'json' });
        }
    };
}