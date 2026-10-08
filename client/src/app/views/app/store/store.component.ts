import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { StoreService } from 'src/app/data/store_service';
import { IStoreSub } from 'src/app/apis/store';

@Component({
    selector: 'app-store-menu',
    templateUrl: './store.component.html',
    styles: [`
        .content_box { max-width: 800px; margin: 0 auto; }
        .content_box > .col-md-6 { border-bottom: 1px solid #d4d4d4; }
        .content_box > .col-md-6:nth-child(2n-1) { border-right: 0.5px solid #d4d4d4; }
        .content_box > .col-md-6:nth-child(2n) { border-left: 0.5px solid #d4d4d4; }
        .content_box > .col-md-6:nth-last-child(1), .content_box > .col-md-6:nth-last-child(2) { border-bottom: none; }
        .card { box-shadow: none; }
		.desc { font-size: 0.8rem; }
        .pic_case { align-items: center; }
        .pic_box { width: 80px; padding: 6px; background-color:#444; box-sizing: border-box; }
        .pic { width: 100%; }
        .detail_box {
            .banner { width: 100px; &:last-child { width: 140px; }}
            .content { color: #909090; text-indent: 2em; }
        }
	`]
})
export class StoreComponent implements AfterViewInit, OnDestroy {
    @ViewChild('storeTab', { static: false }) storeTab!: TabsetComponent;
    dataList: any = [];
    tabList: IStoreSub[] = [];
    lang = 'zh-CN';
    private langSub: Subscription;

    constructor(private route: ActivatedRoute, private translate: TranslateService, private store: StoreService) {
        this.lang = this.translate.currentLang;
        this.langSub = this.translate.onLangChange.subscribe((ev) => { this.lang = ev.lang; });
        this.store.getSubs(this.route.snapshot.data['tab']).then((subs) => {
            this.tabList = subs;
            this.handleChangeTab(0);
        });
    }

    handleChangeTab(idx: number): void {
        const sub = this.tabList[idx];
        if (sub) {
            this.dataList = sub.data;
        }
    }

    ngAfterViewInit() {
        this.handleChangeTab(0);
    }

    ngOnDestroy() {
        this.langSub.unsubscribe();
    }
}
