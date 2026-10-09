import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { Role } from '../types';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-role',
    templateUrl: './role.component.html',
    styles: [`
		.desc { max-width: 318px; font-size: 0.8rem; text-align: left!important; }
        .pic_case { align-items: center; }
        .pic_box { width: 80px; padding: 6px; background-color:#444; box-sizing: border-box; }
        .pic { width: 100%; }
        .detail_box {
            .banner { width: 100px; &:last-child { width: 140px; }}
            .content { color: #909090; text-indent: 2em; }
        }
	`]
})
export class RoleComponent implements AfterViewInit {
    constructor(private cdr: ChangeDetectorRef, private translate: TranslateService) {}

    detail: { title: string; content: string; banner: string[]; } = { title: '', content: '', banner: [] };
    dataObj: Role = { name: '', introduce: '' };

    getData() {
        const result = this.translate.instant(`qt.branch.role`);
        for (const key in result) {
            const path = '/resources/pictures/role/';
            result[key].pic_detail = Array.from({ length: 3 }, (_, index) => path + key + (index + 1) + '.gif');
            result[key].pic_detail.push(path + key + '.gif');
            result[key].pic_intro = [path + key + '.webp'];
        }
        this.dataObj = result;
    }

    openModal(item: { key: string; value: Role }) {
        Object.assign(this.detail, {
            title: this.loadText(item.key, 'name'),
            content: this.loadText(item.key, 'introduce'),
            banner: item.value.pic_detail
        });
    }

    hidePicture(ev: Event) {
        (ev.target as HTMLImageElement).style.display = 'none';
    }

    loadText(key: string, type: string) {
        return `qt.branch.role.${key}.${type}`
    }

    ngAfterViewInit() {
        this.getData();
        this.cdr.detectChanges();
    }

    // images = Array.from({ length: 72 }, (_, i) =>
    //     `http://ossweb-img.qq.com/images/qqtang/2006web/info/char_${String(i + 1).padStart(2, '0')}.gif`
    // );
    // pic_detail = ['http://ossweb-img.qq.com/images/qqtang/2006web/info/char_21.gif', 'http://ossweb-img.qq.com/images/qqtang/2006web/info/wk.gif']
}