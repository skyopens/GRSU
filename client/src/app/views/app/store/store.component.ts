import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { StoreService } from 'src/app/data/store_service';
import { IStoreSub, StoreItem } from 'src/app/apis/store';

@Component({
    selector: 'app-store-menu',
    templateUrl: './store.component.html',
    styles: [`
        .content_box {
            margin: 0 -15px;
            padding-top: 15px;
            .pic_case { align-items: center; }
            .pic_box {
                width: 80px;
                padding: 6px;
                background-color:#444;
                box-sizing: border-box;
                .pic { width: 100%; }
            }
        }
        .desc { font-size: 0.8rem; }
        .price_box {
            justify-content: space-between;
            .price { min-width: 40px; margin-right: 10px; }
        }
        .detail_box {
            .banner { width: 100px; &:last-child { width: 140px; }}
            .introduce { min-height: 60px; }
            .pic_box {
                margin-top: 40px;
                .pic { width: 70px; }
            }
        }
        .btn_purchase {
            padding-bottom: 2px; align-content: end;
            > button { border-radius: 4px; box-sizing: content-box; }
        }
        .alert_box { margin-top: 100px; }
        .price_box > span { display: inline-block; width: 80px; }
        @media (min-width: 768px) {
            .price_box { display: flex; }
        }
	`]
})
export class StoreComponent implements AfterViewInit, OnDestroy {
    @ViewChild('storeTab', { static: false }) storeTab!: TabsetComponent;
    dataList: StoreItem[] = [];
    tabList: IStoreSub[] = [];
    activeIdx = 0;
    lang = 'zh_CN';
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
        this.activeIdx = idx;
        const sub = this.tabList[idx];
        if (sub) {
            this.dataList = sub.data;
        }
    }

    detail: StoreItem = {} as StoreItem;
    openModal(item: StoreItem): void {
        const price = item.price_normal;
        item.price_list = [{
            currency: this.translate.instant(`qt.branch.store.currency_QD`),
            type: 'info',
            price: (price * 10).toFixed(0),
        }, {
            currency: this.translate.instant(`qt.branch.store.currency_QB`),
            type: 'primary',
            price: price.toFixed(1),
        }, {
            currency: this.translate.instant(`qt.branch.store.currency_KB`),
            type: 'success',
            price: (price * 100).toFixed(0)
        }];
        item.text_unit = this.translate.instant(item.unit === 'count' ? 'qt.branch.store.amount' : 'qt.branch.store.duration');
        this.detail = item;
    }

    ngAfterViewInit() {
        this.handleChangeTab(0);
    }

    ngOnDestroy() {
        this.langSub.unsubscribe();
    }
}
