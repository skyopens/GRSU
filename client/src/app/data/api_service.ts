import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { loadTodoApi } from '../apis/todo';
import { loadStoreApi } from '../apis/store';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    todo;
    store;

    constructor(private http: HttpClient) {
        this.todo = loadTodoApi(this.http, environment.baseURL);
        this.store = loadStoreApi(this.http, environment.baseURL);
    }
}