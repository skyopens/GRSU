import { NgModule } from '@angular/core';
import { RoleComponent } from './role/role.component';
import { ModeComponent } from './mode/mode.component';
import { SecondMenuComponent } from './second-menu.component';
import { SecondMenuRoutingModule } from './second-menu.routing';
import { SharedModule } from 'src/app/shared/shared.module';
import { LayoutContainersModule } from 'src/app/containers/layout/layout.containers.module';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { UiModalsContainersModule } from 'src/app/containers/ui/modals/ui.modals.containers.module';

@NgModule({
    declarations: [SecondMenuComponent, RoleComponent, ModeComponent],
    imports: [
        SharedModule,
        LayoutContainersModule,
        SecondMenuRoutingModule,
        UiModalsContainersModule,
        AccordionModule.forRoot()
    ]
})
export class SecondMenuModule { }
