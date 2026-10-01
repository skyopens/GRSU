import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // 1. request hook
        const handledReq = this.handleRequest(req);

        return next.handle(handledReq).pipe(
            // 2. response hook
            map((ev: HttpEvent<any>) => {
                if (ev instanceof HttpResponse) {
                    const httpStatus = ev.status;
                    const body = ev.body;
                    const respStat = body && body.status;

                    if ((httpStatus !== 200 && httpStatus !== 201) || (respStat !== 200 && respStat !== 201)) {
                        throw new HttpErrorResponse({
                            error: body,
                            headers: ev.headers,
                            status: httpStatus,
                            statusText: `Request failed: httpStatus=${httpStatus}, respStat=${respStat}`,
                            url: ev.url || undefined
                        });
                    } else {
                        return ev;
                    }

                }

                return ev;
            }),

            // 3. response error 钩子：真正的 4xx/5xx 也统一处理
            catchError((error: any) => {
                const handledError = this.handleResponseError(error);
                return throwError(() => handledError);
            })
        );
    }

    private handleRequest(req: HttpRequest<any>): HttpRequest<any> {
        let body = req.body;

        // 这里只是示例：请求前做一些统一小处理
        if (body && typeof body === 'object' && !(body instanceof FormData)) {
            // body = {
            //     ...body,
            //     _ts: Date.now()
            // };

            // 例如把空字符串去掉前后空格
            Object.keys(body).forEach(key => {
                if (typeof body[key] === 'string') {
                    body[key] = body[key].trim();
                }
            });
        }

        return req.clone({
            body,
            setHeaders: {
                Accept: 'application/json'
            }
        });
    }

    private handleResponseError(error: any): HttpErrorResponse {
        if (error instanceof HttpErrorResponse) {
            return error;
        }

        return new HttpErrorResponse({
            error,
            status: 500,
            statusText: 'Unknown Error'
        });
    }
}