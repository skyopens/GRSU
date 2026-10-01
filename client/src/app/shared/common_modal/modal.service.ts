import { Injectable, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';

export interface CommonModalConfig {
    titleTpl?: TemplateRef<any>;
    contentHtml?: string;
    contentTpl?: TemplateRef<any>;
    trigger?: any;
}

@Injectable({
    providedIn: 'root'
})
export class CommonModalService {
    private modalSubject = new Subject<CommonModalConfig>();
    modalState$ = this.modalSubject.asObservable();

    open(config: CommonModalConfig): void {
        this.modalSubject.next(config);
    }
}