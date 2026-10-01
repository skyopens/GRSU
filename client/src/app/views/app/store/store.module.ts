import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { LayoutContainersModule } from 'src/app/containers/layout/layout.containers.module';
import { UiModalsContainersModule } from 'src/app/containers/ui/modals/ui.modals.containers.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { StoreComponent } from './store.component';
import { StoreRoutingModule } from './store.routing';

@NgModule({
    declarations: [StoreComponent],
    imports: [
        SharedModule,
        LayoutContainersModule,
        UiModalsContainersModule,
        TabsModule.forRoot(),
        StoreRoutingModule
    ]
})
export class StoreMenuModule { }
