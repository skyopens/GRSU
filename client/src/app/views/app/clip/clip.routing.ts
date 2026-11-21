import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClipComponent } from './clip.component';

const routes: Routes = [{
    path: '', component: ClipComponent
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ClipRoutingModule { }