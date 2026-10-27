import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared_module';
import { LayoutContainersModule } from 'src/app/containers/layout/layout.containers.module';
import { UiModalsContainersModule } from 'src/app/containers/ui/modals/ui.modals.containers.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { FormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { StoreComponent } from './store.component';
import { StoreRoutingModule } from './store.routing';

@NgModule({
    declarations: [StoreComponent],
    imports: [
        SharedModule,
        LayoutContainersModule,
        UiModalsContainersModule,
        TabsModule.forRoot(),
        AlertModule.forRoot(),
        BsDropdownModule.forRoot(),
        FormsModule,
        PaginationModule.forRoot(),
        StoreRoutingModule
    ]
})
export class StoreMenuModule { }