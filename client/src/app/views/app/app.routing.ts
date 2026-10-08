import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { BlankPageComponent } from './blank-page/blank-page.component';
import { TodoComponent } from './todo/todo.component';
import { VienComponent } from './vien/vien.component';

const routes: Routes = [{
    path: '', component: AppComponent,
    children: [{
        path: '', pathMatch: 'full', redirectTo: 'vien'
    }, {
        path: 'vien', component: VienComponent
    }, {
        path: 'second-menu', loadChildren: () => import('./second-menu/second-menu.module').then(m => m.SecondMenuModule)
    }, {
        path: 'store', loadChildren: () => import('./store/store.module').then(m => m.StoreMenuModule)
    }, {
        path: 'blank-page', component: BlankPageComponent
    }, {
        path: 'todo', component: TodoComponent
    }]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}