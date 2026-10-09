import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlankPageComponent } from './blank-page/blank-page.component';
import { TodoComponent } from './todo/todo.component';
import { ApplicationsContainersModule } from 'src/app/containers/applications/applications.containers.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { VienComponent } from './vien/vien.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { SharedModule } from 'src/app/shared/shared_module';
import { LayoutContainersModule } from 'src/app/containers/layout/layout.containers.module';
import { SimpleNotificationsModule } from 'angular2-notifications';

@NgModule({
    declarations: [BlankPageComponent, VienComponent, TodoComponent, AppComponent],
    imports: [
        CommonModule,
        AppRoutingModule,
        SharedModule,
        LayoutContainersModule,
        ApplicationsContainersModule,
        BsDropdownModule.forRoot(),
        CollapseModule.forRoot(),
        SimpleNotificationsModule.forRoot()
    ]
})
export class AppModule {}