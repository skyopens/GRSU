import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { loadTodoApi } from '../apis/todo';
import { loadStoreApi } from '../apis/store';
import { loadClipApi } from '../apis/clip';

// Backend response envelope
export interface ApisResponse<T> {
    status: string;
    data: T;
}

// Pagination
export interface IPage<T> {
    items: T[];
    total: number;
}

// Encrypted envelope returned by the backend
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
    clip: ReturnType<typeof loadClipApi>;

    constructor(private http: HttpClient) {
        this.todo = loadTodoApi(this.http, environment.baseURL);
        this.store = loadStoreApi(this.http, environment.baseURL);
        this.clip = loadClipApi(this.http, environment.baseURL);
    }
}