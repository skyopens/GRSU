import {
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { combineLatest, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModalConfig, CommonModalService } from './modal.service';

@Component({
    selector: 'app-common-modal',
    templateUrl: './modal.component.html'
})
export class CommonModalComponent implements OnInit, OnDestroy {
    @ViewChild('template') template!: TemplateRef<any>;

    modalRef!: BsModalRef;
    modalData: CommonModalConfig | null = null;

    subscriptions: Subscription[] = [];
    messages: string[] = [];

    private destroy$ = new Subject<void>();

    constructor(
        private modalService: BsModalService,
        private changeDetection: ChangeDetectorRef,
        private globalModalService: CommonModalService
    ) { }

    ngOnInit(): void {
        this.globalModalService.modalState$
            .pipe(takeUntil(this.destroy$))
            .subscribe((config: CommonModalConfig) => {
                this.openModal(config);
            });
    }

    openModal(config: CommonModalConfig): void {
        this.messages = [];
        this.unsubscribe();

        this.modalData = config;

        let combineSub: Subscription;
        combineSub = combineLatest([
            this.modalService.onShow,
            this.modalService.onShown,
            this.modalService.onHide,
            this.modalService.onHidden
        ]).subscribe(() => this.changeDetection.markForCheck());

        this.subscriptions.push(
            this.modalService.onShow.subscribe(() => {
                this.messages.push('onShow event has been fired');
            })
        );

        this.subscriptions.push(
            this.modalService.onShown.subscribe(() => {
                this.messages.push('onShown event has been fired');
                if (this.modalData?.trigger?.modalOpened) {
                    this.modalData.trigger.modalOpened.emit();
                    this.modalData.trigger = null;
                }
            })
        );

        this.subscriptions.push(
            this.modalService.onHide.subscribe((reason: string) => {
                const dismissReason = reason ? `, dismissed by ${reason}` : '';
                this.messages.push(`onHide event has been fired${dismissReason}`);
            })
        );

        this.subscriptions.push(
            this.modalService.onHidden.subscribe((reason: string) => {
                const dismissReason = reason ? `, dismissed by ${reason}` : '';
                this.messages.push(`onHidden event has been fired${dismissReason}`);
                if (this.modalData?.trigger?.modalClosed) {
                    this.modalData.trigger.modalClosed.emit();
                    this.modalData.trigger = null;
                }
                this.unsubscribe();
            })
        );

        this.subscriptions.push(combineSub);

        if (this.modalRef) {
            this.modalRef.hide();
        }

        setTimeout(() => {
            this.modalRef = this.modalService.show(this.template);
        }, 400);
    }

    unsubscribe(): void {
        this.subscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe();
        });
        this.subscriptions = [];
    }

    ngOnDestroy(): void {
        this.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}