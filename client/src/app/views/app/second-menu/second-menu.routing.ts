import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SecondMenuComponent } from './second-menu.component';
import { RoleComponent } from './role/role.component';
import { ModeComponent } from './mode/mode.component';

const routes: Routes = [
    {
        path: '', component: SecondMenuComponent,
        children: [
            { path: '', redirectTo: 'role', pathMatch: 'full' },
            { path: 'role', component: RoleComponent },
            { path: 'mode', component: ModeComponent },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SecondMenuRoutingModule { }
