import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from '../views/error/error.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { UnauthorizedComponent } from '../views/unauthorized/unauthorized.component';
import { CommonModalComponent } from './common_modal/modal.component';
import { CommonModalDirective } from './common_modal/modal.directive';
@NgModule({
    declarations: [ErrorComponent, UnauthorizedComponent, CommonModalComponent, CommonModalDirective],
    imports: [
        RouterModule,
        CommonModule,
        TranslateModule,
        PerfectScrollbarModule,
    ],
    exports: [
        PerfectScrollbarModule,
        RouterModule,
        ErrorComponent,
        UnauthorizedComponent,
        TranslateModule,
        CommonModule,
        CommonModalComponent,
        CommonModalDirective
    ],
})
export class SharedModule { }
