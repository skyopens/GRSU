import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { Mode } from '../types';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/data/api.service';

@Component({
    selector: 'app-mode',
    templateUrl: './mode.component.html',
    styles: [`
		.pic_box { width: 100%; margin: 0 auto; }
        .pic { height: 220px; max-width: 100%; margin: 0 4px 4px 0; }
        :host ::ng-deep .mode_box .accordion-toggle .btn { font-size: 1.2rem; }
	`]
})
export class ModeComponent implements AfterViewInit {
    constructor(private cdr: ChangeDetectorRef, private translate: TranslateService, private apiService: ApiService) { }

    dataList: Mode[] = [];
    getData() {
        const result = this.translate.instant(`qt.branch.mode`);
        for (const mode of result) {
            const path = '/resources/pictures/mode/';
            for (const item of mode.list) {
                item.pictures = Array.from({ length: 4 }, (_, index) => path + item.key + (index + 1) + '.webp');
            }
        }
        this.dataList = result;
    }

    hidePicture(ev: Event) {
        (ev.target as HTMLImageElement).style.display = 'none';
    }

    loadText(idx: number, key: number | string, type?: string) {
        const result = this.translate.instant(`qt.branch.mode`);
        console.log(result, idx, key, type);
        return !type ? result[idx][key] : result[idx].list[key][type];
    }

    ngAfterViewInit() {
        this.apiService.todo.getList().subscribe(res => {
            console.log(4433, res);
        });
        this.getData();
        this.cdr.detectChanges();
    }
}