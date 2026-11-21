import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiService } from './api_service';
import { IClip } from '../apis/clip';

// Branching on environment.hasBackend
@Injectable({
    providedIn: 'root'
})
export class ClipService {
    private cache: Promise<IClip[]> | null = null;

    constructor(private api: ApiService) { }

    getClips(queries: { category: string; search: string; lang: string; }): Observable<IClip[]> {
        let result: Observable<IClip[]>;

        if (environment.hasBackend) {
            result = this.api.clip.getClips(queries).pipe(map((res) => {
                return res.data;
            }));
        } else {
            result = from(this.loadLocal()).pipe(map((all) => {
                return this.filterClips(all, queries);
            }));
        }

        return result.pipe(catchError((err) => {
            console.error('视频列表加载失败', err);
            return of<IClip[]>([]);
        }));
    }

    // 本地模式只拉一次文件，之后都走内存
    // The local file is fetched once, later calls are served from memory
    private loadLocal(): Promise<IClip[]> {
        if (!this.cache) {
            // 本地数据没有数据库 id，用数组下标补上，trackBy 才有唯一键
            // The local file has no database id, so the array index stands in as the trackBy key
            this.cache = fetch('/resources/data_clip/clip.json').then((res) => {
                return res.json();
            }).then((all) => {
                return all.map((item: IClip, index: number) => {
                    return Object.assign(item, { id: index });
                });
            });
        }
        return this.cache;
    }

    // 本地模式没有 SQL，分类筛选和标题搜索在这里模拟，口径与后端保持一致
    // There is no SQL in local mode, so the category filter and the title search are emulated here
    private filterClips(all: IClip[], queries: { category: string; search: string; lang: string; }): IClip[] {
        const keyword = queries.search.trim().toLowerCase();
        return all.filter((item) => {
            const inCategory = queries.category === '' || item.category === queries.category;
            const title = (item.title[queries.lang] || '').toLowerCase();
            return inCategory && (keyword === '' || title.indexOf(keyword) >= 0);
        });
    }
}
