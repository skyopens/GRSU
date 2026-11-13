import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

export interface IGuideVideo {
    title: string;
    type: 'youtube' | 'bilibili';
    src: string;
}

@Component({
    selector: 'app-vien',
    templateUrl: './vien.component.html',
    styles: [`
        .guide_toc { position: sticky; top: 110px; }
        .guide_toc_title { font-size: .72rem; letter-spacing: .08rem; margin-bottom: .9rem; }
        .guide_toc_list { list-style: none; padding: 0; margin: 0; }
        .guide_toc_list li { border-left: 2px solid transparent; padding-left: .65rem; margin-bottom: .55rem; }
        .guide_toc_list li.active { border-left-color: var(--theme-color-1); }
        .guide_toc_list a { font-size: .85rem; }
        .guide_toc_list li.active a { color: var(--theme-color-1) !important; }
        .guide_section { scroll-margin-top: 110px; }
        .guide_title { font-size: 1.15rem; margin-bottom: 1rem; }
        .guide_text { font-size: .95rem; line-height: 1.9; white-space: pre-line; margin-bottom: 0; }
        .guide_timeline { list-style: none; padding: 0; margin: 1.5rem 0 0; }
        .guide_time_item { position: relative; border-left: 1px solid rgba(128, 128, 128, .3); padding: 0 0 1.4rem 1.4rem; }
        .guide_time_item:last-child { border-left-color: transparent; padding-bottom: 0; }
        .guide_time_item::before { content: ''; position: absolute; top: .3rem; left: -4px; width: 7px; height: 7px; border-radius: 50%; background: var(--theme-color-1); }
        .guide_time_date { font-size: .78rem; color: var(--theme-color-1); margin-bottom: .2rem; }
        .guide_time_text { font-size: .9rem; margin: 0; }
        .guide_stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; margin-top: 1.5rem; }
        .guide_stat { background: rgba(128, 128, 128, .08); border-radius: .5rem; padding: .75rem 1rem; }
        .guide_stat_label { font-size: .72rem; margin-bottom: .2rem; }
        .guide_stat_value { font-size: 1.3rem; font-weight: 500; margin: 0; }
        .guide_steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; margin-top: 1.5rem; }
        .guide_step { background: rgba(128, 128, 128, .08); border-radius: .5rem; padding: .9rem 1rem; }
        .guide_step_no { font-size: .72rem; color: var(--theme-color-1); margin-bottom: .3rem; }
        .guide_step_name { font-size: .95rem; font-weight: 500; margin-bottom: .3rem; }
        .guide_step_desc { font-size: .78rem; line-height: 1.6; margin: 0; }
        .guide_chips { margin-top: 1.25rem; }
        .guide_chip_group { font-size: .78rem; margin: .9rem 0 .6rem; }
        .guide_chip { display: inline-block; border: 1px solid rgba(128, 128, 128, .35); border-radius: 1rem; padding: .28rem .85rem; margin: 0 .5rem .5rem 0; font-size: .82rem; color: inherit; cursor: pointer; }
        .guide_chip:hover { border-color: var(--theme-color-1); color: var(--theme-color-1); }
        .guide_keys { margin-top: 1.5rem; }
        .guide_key_row { display: flex; align-items: flex-start; padding: .7rem 0; border-top: 1px solid rgba(128, 128, 128, .18); }
        .guide_key { flex: 0 0 auto; min-width: 5rem; text-align: center; border: 1px solid rgba(128, 128, 128, .35); border-bottom-width: 2px; border-radius: .3rem; padding: .2rem .5rem; font-size: .8rem; margin-right: 1rem; }
        .guide_key_name { font-size: .9rem; font-weight: 500; margin-bottom: .15rem; }
        .guide_key_desc { font-size: .82rem; margin: 0; }
        .guide_audio_note { font-size: .8rem; margin: 1.5rem 0 0; }
        .guide_video { max-width: 600px; margin: 1.5rem auto 0 auto; }
        .video_frame { position: relative; padding-top: 56.25%; border-radius: .5rem; overflow: hidden; background: #000; }
        .video_frame iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
        .guide_video_title { font-size: .85rem; margin: .65rem 0 0; }
        @media (max-width: 767px) {
            .guide_stats, .guide_steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
    `]
})
export class VienComponent implements AfterViewInit, OnDestroy {
    stats: { label: string; value: string; }[] = [];
    timeline: { date: string; text: string; }[] = [];
    loopSteps: { name: string; desc: string; }[] = [];
    controls: { key: string; name: string; desc: string; }[] = [];
    advanced: { name: string; desc: string; }[] = [];

    // Mode chips: the data comes from qt.branch.mode, and each chip links to the "Game Modes" page.
    modeGroups: { title: string; list: { name: string; }[]; }[] = [];
    modeLink = environment.adminRoot + '/second-menu/mode';
    private langSub: Subscription;

    constructor(private translate: TranslateService, private sanitizer: DomSanitizer) {
        this.refreshText();
        this.langSub = this.translate.onLangChange.subscribe(() => {
            this.refreshText();
        });
    }

    private refreshText(): void {
        this.stats = this.listOf('qt.branch.guide.stats');
        this.timeline = this.listOf('qt.branch.guide.timeline');
        this.loopSteps = this.listOf('qt.branch.guide.loop.steps');
        this.controls = this.listOf('qt.branch.guide.controls.list');
        this.advanced = this.listOf('qt.branch.guide.advanced.list');
        this.modeGroups = this.listOf('qt.branch.mode');
    }

    private listOf(key: string): any[] {
        const value = this.translate.instant(key);
        return Array.isArray(value) ? value : [];
    }

    @ViewChildren('sectionEl') sectionEls: QueryList<ElementRef>;
    activeId = 'what';
    // TOC: each id matches the id of a section tags below, and each label is an i18n key.
    guideSections: { id: string; label: string; }[] = [{
        id: 'what', label: 'qt.branch.guide.what.title'
    }, {
        id: 'why', label: 'qt.branch.guide.why.title'
    }, {
        id: 'loop', label: 'qt.branch.guide.loop.title'
    }, {
        id: 'modes', label: 'qt.branch.guide.modes.title'
    }, {
        id: 'controls', label: 'qt.branch.guide.controls.title'
    }, {
        id: 'advanced', label: 'qt.branch.guide.advanced.title'
    }, {
        id: 'credit', label: 'qt.branch.guide.credit_title'
    }];
    private observer: IntersectionObserver;

    ngAfterViewInit(): void {
        // IntersectionObserver instead of a scroll listener: it does not care which element actually scrolls.
        this.observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry: IntersectionObserverEntry) => {
                if (entry.isIntersecting) {
                    this.activeId = entry.target.id;
                }
            });
        }, { rootMargin: '-110px 0px -72% 0px' });
        this.sectionEls.forEach((el: ElementRef) => {
            this.observer.observe(el.nativeElement);
        });
    }

    scrollTo(ev: Event, id: string): void {
        const target = document.getElementById(id);
        ev.preventDefault();
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Video: turn page links into player embed URLs, and cache what the sanitizer returns.
    // A section can hold more than one video, so every entry is an array and the template needs a single loop.
    videos: { [key: string]: IGuideVideo[] } = {
        what: [{
            title: 'QQ Games - Bubble Arena - Sir Banning Stats',
            type: 'youtube',
            src: 'https://www.youtube.com/watch?v=nNUgtF-_sz8'
        }, {
            title: 'QQ Games Bubble Arena',
            type: 'youtube',
            src: 'https://www.youtube.com/watch?v=mTyf06BWi2w'
        }],
        loop: [{
            title: 'QQ Tang - Gameplay Demo',
            type: 'youtube',
            src: 'https://www.youtube.com/watch?v=dsota-73z6I'
        }],
        modes: [{
            title: 'QQ Tang - Boss Battle on Water Surface 11',
            type: 'youtube',
            src: 'https://www.youtube.com/watch?v=YrGvotNgWDA'
        }],
        controls: [{
            title: 'QQ Tang Returns - Gameplay Test and Item Guide',
            type: 'youtube',
            src: 'https://www.youtube.com/watch?v=iPzV_oUFkIA'
        }],
        advanced: [{
            title: 'Bubble Combo Highlights, Part 1',
            type: 'youtube',
            src: 'https://www.youtube.com/watch?v=syh1Tdvzzsg'
        }]
    };

    // Chinese originals: dropped from the main sections because foreign visitors cannot follow them, kept as an entry in the credits.
    zhVideos: IGuideVideo[] = [{
        title: '凉透了的《QQ堂》，当年是怎么拯救腾讯游戏的？',
        type: 'youtube',
        src: 'https://www.youtube.com/watch?v=w1A5_JMaQPM'
    }, {
        title: 'QQ堂停服！作为腾讯的第一款“自研”游戏，终于也要离开了……',
        type: 'youtube',
        src: 'https://www.youtube.com/watch?v=kB8YpDpFYC8'
    }];

    private embedCache: { [key: string]: SafeResourceUrl } = {};

    // iframe src belongs to the RESOURCE_URL security context, so binding a plain string makes Angular throw
    // Cache by src: creating a new SafeResourceUrl on every change detection makes the iframe reload again and again.
    buildEmbedSrc(video: IGuideVideo): SafeResourceUrl {
        let result = this.embedCache[video.src];
        if (!result) {
            result = this.sanitizer.bypassSecurityTrustResourceUrl(this.toEmbedUrl(video));
            this.embedCache[video.src] = result;
        }
        return result;
    }

    private toEmbedUrl(video: IGuideVideo): string {
        let result = '';
        const youtube = /(?:v=|youtu\.be\/|embed\/)([\w-]{11})/.exec(video.src);
        const bilibili = /(BV[0-9A-Za-z]{10})/.exec(video.src);
        if (video.type === 'youtube' && youtube) {
            result = `https://www.youtube.com/embed/${youtube[1]}?rel=0`;
        }
        if (video.type === 'bilibili' && bilibili) {
            result = `https://player.bilibili.com/player.html?bvid=${bilibili[1]}&autoplay=0&danmaku=0&high_quality=1`;
        }
        return result;
    }

    ngOnDestroy(): void {
        this.langSub.unsubscribe();
        this.observer.disconnect();
    }
}