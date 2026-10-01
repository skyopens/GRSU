import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

@Component({
    selector: 'app-store-menu',
    templateUrl: './store.component.html'
})
export class StoreComponent {
    @ViewChild('storeTab', { static: false }) storeTab: TabsetComponent;

    constructor(private translate: TranslateService) { }

    get categories(): { title: string }[] {
        return this.translate.instant('qt.branch.store');
    }
}
