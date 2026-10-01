import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { loadTodoApi } from '../apis/todo';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    todo;

    constructor(private http: HttpClient) {
        this.todo = loadTodoApi(this.http, environment.baseURL);
    }
}