import { Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ClipService } from 'src/app/data/clip_service';
import { IClip } from 'src/app/apis/clip';

@Component({
    selector: 'app-clip-menu',
    templateUrl: './clip.component.html',
    styles: [`
        app-player { display: block; width: 100%; }
        .btn_search > i { display: inline-block; transform: scale(1.3); }
        .introduce_box { padding: 1.1rem 1.7rem; }
        .video_box ::ng-deep .video-js {
            width: 100%;
            height: auto;
            .vjs-tech { position: relative; }
            .vjs-controls-enabled.vjs-v7 {
                height: auto;
                width: auto;
                padding-top: 0;
            }
        }
        .clip_pic { width: 100%; height: 170px; object-fit: cover; }
        .clip_embed { position: relative; width: 100%; padding-top: 56.25%; }
        .clip_embed iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
    `]
})
export class ClipComponent implements OnDestroy {
    @ViewChild('videoTpl', { static: true }) videoTpl: TemplateRef<any>;

    // The search matches the title in the current language only
    clips: IClip[] = [];
    categories = ['beginner', 'intermediate', 'advanced', 'other'];
    category = '';
    searchKey = '';
    lang = 'zh_CN';
    private langSub: Subscription;

    // mp4 goes through video.js, platform videos go through an iframe
    playerOptions = {};
    embedSrc: SafeResourceUrl = null;
    current: IClip = {} as IClip;
    modalRef: BsModalRef;

    constructor(
        private modalService: BsModalService,
        private sanitizer: DomSanitizer,
        private translate: TranslateService,
        private clip: ClipService
    ) {
        this.lang = this.translate.currentLang;
        this.langSub = this.translate.onLangChange.subscribe((ev) => {
            this.lang = ev.lang;
        });
        this.loadClips();
    }

    // Reload after the category changes, an empty string stands for all categories
    handleChangeCategory(key: string): void {
        this.category = key;
        this.loadClips();
    }

    handleSearch(): void {
        this.loadClips();
    }

    // Only selected category
    activeClass(key: string): string {
        return this.category === key ? 'btn-primary' : 'btn-outline-primary';
    }

    private loadClips(): void {
        this.clip.getClips({ category: this.category, search: this.searchKey, lang: this.lang })
            .subscribe((clips) => {
                this.clips = clips;
            });
    }

    // 切语言时列表对象本身不变，靠 trackBy 让 Angular 复用已有的卡片
    // The list objects survive a language switch, trackBy lets Angular reuse the existing cards
    trackById(index: number, item: IClip): number {
        return item.id;
    }

    openModal(item: IClip): void {
        this.current = item;
        // A plain string is rejected by Angular
        this.embedSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.buildEmbedSrc(item));
        if (item.platform === 'mp4') {
            this.playerOptions = {
                preload: 'auto',
                controls: true,
                autoplay: true,
                fluid: true,
                poster: item.poster,
                sources: [{ src: item.src, type: 'video/mp4' }]
            };
        }
        this.modalRef = this.modalService.show(this.videoTpl, { class: 'modal-lg' });
    }

    // Turn the page link into the embed address each platform player expects
    buildEmbedSrc(item: IClip): string {
        let result = '';
        const youtube = /(?:v=|youtu\.be\/|embed\/)([\w-]{11})/.exec(item.src);
        const bilibili = /(BV[0-9A-Za-z]{10})/.exec(item.src);
        if (item.platform === 'youtube' && youtube) {
            result = `https://www.youtube.com/embed/${youtube[1]}?autoplay=1&rel=0`;
        }
        if (item.platform === 'bilibili' && bilibili) {
            result = `https://player.bilibili.com/player.html?bvid=${bilibili[1]}&autoplay=1&danmaku=0&high_quality=1`;
        }
        return result;
    }

    closeModal(): void {
        if (this.modalRef) {
            this.modalRef.hide();
        }
    }

    ngOnDestroy(): void {
        this.langSub.unsubscribe();
    }
}