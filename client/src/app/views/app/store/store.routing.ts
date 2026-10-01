import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreComponent } from './store.component';

const routes: Routes = [
    { path: '', redirectTo: 'function', pathMatch: 'full' },
    { path: 'function', component: StoreComponent, data: { tab: 'function' } },
    { path: 'decoration', component: StoreComponent, data: { tab: 'decoration' } },
    { path: 'gear', component: StoreComponent, data: { tab: 'gear' } },
    { path: 'pet', component: StoreComponent, data: { tab: 'pet' } },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StoreRoutingModule { }
