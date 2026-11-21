import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApisResponse } from '../data/api_service';

export interface ClipI18nText {
    'zh_CN': string;
    'en_US': string;
    'ru_RU': string;
    'be_BY': string;
}

// id and category come from table columns, the rest is flattened out of the payload
export interface IClip {
    id: number;
    category: string;
    title: ClipI18nText;
    desc: ClipI18nText;
    platform: 'youtube' | 'bilibili' | 'mp4';
    src: string;
    poster: string;
    duration: string;
}

// The clip list uses a plain envelope
export type ClipListResponse = ApisResponse<IClip[]>;

export interface ClipApi {
    getClips(queries: { category: string; search: string; lang: string; }): Observable<ClipListResponse>;
}

export function loadClipApi(http: HttpClient, baseURL: string): ClipApi {
    return {
        getClips(queries: { category: string; search: string; lang: string; }): Observable<ClipListResponse> {
            return http.get<ClipListResponse>(`${baseURL}/apis/clips`, { params: queries });
        }
    };
}
