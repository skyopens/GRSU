import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from '../views/error/error.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { UnauthorizedComponent } from '../views/unauthorized/unauthorized.component';
import { CommonModalComponent } from './common_modal/modal.component';
import { CommonModalDirective } from './common_modal/modal.directive';
import { ObfuscateSrcDirective } from './obfuscate_src_directive';
@NgModule({
    declarations: [ErrorComponent, UnauthorizedComponent, CommonModalComponent, CommonModalDirective, ObfuscateSrcDirective],
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
        CommonModalDirective,
        ObfuscateSrcDirective
    ],
})
export class SharedModule { }
