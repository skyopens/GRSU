import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared_module';
import { LayoutContainersModule } from 'src/app/containers/layout/layout.containers.module';
import { ComponentsPlayerModule } from 'src/app/components/player/components.player.module';
import { ClipComponent } from './clip.component';
import { ClipRoutingModule } from './clip.routing';

@NgModule({
    declarations: [ClipComponent],
    imports: [SharedModule, LayoutContainersModule, ComponentsPlayerModule, FormsModule, ClipRoutingModule]
})
export class ClipMenuModule { }