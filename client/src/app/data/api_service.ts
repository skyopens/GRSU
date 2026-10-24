import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { loadTodoApi } from '../apis/todo';
import { loadStoreApi } from '../apis/store';

// 后端统一响应信封，与 server 端 common/ApisResponse.java 一一对应。
// status 是「数据状态」（OKAY / DATA_NOT_FOUND / PAGE_OUT_OF_RANGE ...），
// HTTP 状态码另管接口层，两者分开。
export interface ApisResponse<T> {
    status: string;
    data: T;
}

// 分页响应体：items 当前页数据，total 总条数
export interface IPage<T> {
    items: T[];
    total: number;
}

// 后端返回的密文信封，与 server 端 dto/EncryptedPayload.java 一一对应。
// 字段名必须是 iv / data，decryptStore 直接吃这个对象。
export interface EncryptedPayload {
    iv: string;
    data: string;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    todo: ReturnType<typeof loadTodoApi>;
    store: ReturnType<typeof loadStoreApi>;

    constructor(private http: HttpClient) {
        this.todo = loadTodoApi(this.http, environment.baseURL);
        this.store = loadStoreApi(this.http, environment.baseURL);
    }
}