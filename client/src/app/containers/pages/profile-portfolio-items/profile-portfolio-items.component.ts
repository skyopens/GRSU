import { Component } from '@angular/core';
import products from '../../../data/products';

@Component({
    selector: 'app-profile-portfolio-items',
    templateUrl: './profile-portfolio-items.component.html'
})
export class ProfilePortfolioItemsComponent {
    data: any[] = products.slice(0, 18);

    constructor() { }



}
