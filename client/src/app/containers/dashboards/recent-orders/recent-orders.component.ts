import { Component } from '@angular/core';
import productItems from 'src/app/data/products';

@Component({
    selector: 'app-recent-orders',
    templateUrl: './recent-orders.component.html'
})
export class RecentOrdersComponent {

    constructor() { }

    data: any[] = productItems.slice(0, 6);


}
