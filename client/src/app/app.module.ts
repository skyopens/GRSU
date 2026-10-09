import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';
import { ViewsModule } from './views/views.module';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { LayoutContainersModule } from './containers/layout/layout.containers.module';
import { ModalModule } from 'ngx-bootstrap/modal';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from './data/api_interceptor';

@NgModule({
    imports: [
        BrowserModule,
        ViewsModule,
        AppRoutingModule,
        LayoutContainersModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        ModalModule.forRoot(),
        HttpClientModule,
        AngularFireModule.initializeApp(environment.firebase)
    ],
    declarations: [
        AppComponent
    ],
    providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: ApiInterceptor,
        multi: true
    }],
    bootstrap: [AppComponent]
})
export class AppModule { }
