import { Component, OnInit, Renderer2, AfterViewInit } from '@angular/core';
import { LangService } from './shared/lang.service';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})

@Injectable()
export class AppComponent implements OnInit, AfterViewInit {
    isMultiColorActive = environment.isMultiColorActive;
    constructor(private langService: LangService, private renderer: Renderer2, private router: Router, private activatedRoute: ActivatedRoute) {

    }

    ngOnInit(): void {
        this.langService.init();
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.renderer.addClass(document.body, 'show');
        }, 1000);
        setTimeout(() => {
            this.renderer.addClass(document.body, 'default-transition');
        }, 1500);

        this.router.events.subscribe(ev => {
            if (ev instanceof NavigationEnd) {
                const onlyRoutePath = ev.url.split('?')[0];
                console.log('路由已经变化:', ev, this.activatedRoute.root);
            }
        });
    }
}
