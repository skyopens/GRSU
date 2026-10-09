import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

import en from '../../lang/en_US.json';
import zh from '../../lang/zh_CN.json';
import ru from '../../lang/ru_RU.json';
import be from '../../lang/be_BY.json';
import { Router } from '@angular/router';
import { getThemeLang, setThemeLang } from 'src/app/utils/util';

const languageKey = '__lang';

@Injectable({
    providedIn: 'root',
})
export class LangService {
    isSingleLang = false;
    renderer: Renderer2;
    defaultLanguage = getThemeLang();
    supportedLanguages: Language[] = [
        { code: 'en_US', direction: 'ltr', label: 'English', shorthand: 'en' },
        { code: 'zh_CN', direction: 'ltr', label: '简体中文', shorthand: 'zh' },
        { code: 'ru_RU', direction: 'ltr', label: 'Русский', shorthand: 'ru' },
        { code: 'be_BY', direction: 'ltr', label: 'Беларуская', shorthand: 'be' },
        // {
        //     code: 'en_EN',
        //     direction: 'rtl',
        //     label: 'English - RTL',
        //     shorthand: 'enrtl',
        // },
    ];

    constructor(
        private translate: TranslateService,
        private rendererFactory: RendererFactory2,
        private router: Router
    ) {
        this.renderer = this.rendererFactory.createRenderer(null, null);
    }

    init(): void {
        this.translate.setTranslation('en_US', en);
        this.translate.setTranslation('zh_CN', zh);
        this.translate.setTranslation('ru_RU', ru);
        this.translate.setTranslation('be_BY', be);
        this.translate.setTranslation('en_EN', en);
        this.translate.setDefaultLang(this.defaultLanguage);
        if (this.isSingleLang) {
            this.translate.use(this.defaultLanguage);
        } else {
            this.language = '';
        }
    }

    checkForDirectionChange(): void {
        this.renderer.removeClass(document.body, 'ltr');
        this.renderer.removeClass(document.body, 'rtl');
        this.renderer.addClass(document.body, this.direction);
        this.renderer.setAttribute(
            document.documentElement,
            'direction',
            this.direction
        );
    }

    set language(lang: string) {
        let language = lang || getThemeLang();
        const isSupportedLanguage = this.supportedLanguages
            .map((item) => item.code)
            .includes(language);
        if (!isSupportedLanguage) {
            language = this.defaultLanguage;
        }

        if (
            lang !== '' &&
            this.supportedLanguages.map((item) => item.code).includes(lang) &&
            this.direction !==
            this.supportedLanguages.find((item) => item.code === lang).direction
        ) {
            setThemeLang(lang);
            window.location.reload();
        } else {
            this.translate.use(language);
        }
        this.checkForDirectionChange();
        setThemeLang(language);
    }

    get language(): string {
        return this.translate.currentLang;
    }

    get languageShorthand(): string {
        return this.supportedLanguages.find(
            (item) => item.code === this.translate.currentLang
        ).shorthand;
    }

    get direction(): string {
        return this.supportedLanguages.find(
            (item) => item.code === this.translate.currentLang
        ).direction;
    }

    get languageLabel(): string {
        return this.supportedLanguages.find(
            (item) => item.code === this.translate.currentLang
        ).label;
    }
}

export class Language {
    code: string;
    direction: string;
    label: string;
    shorthand: string;
}
