import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    Output,
    TemplateRef
} from '@angular/core';
import { CommonModalService } from './modal.service';

@Directive({
    selector: '[appModalLongContent]'
})
export class CommonModalDirective {
    @Input() titleTpl?: TemplateRef<any>;
    @Input() contentTpl?: TemplateRef<any>;
    @Output() modalOpened = new EventEmitter<void>();
    @Output() modalClosed = new EventEmitter<void>();

    constructor(
        private el: ElementRef,
        private commonModalService: CommonModalService
    ) { }

    @HostListener('click', ['$event'])
    handleClick(event: MouseEvent): void {
        const hostElement = this.el.nativeElement as HTMLElement;
        const contentHtml = hostElement.innerHTML;

        this.commonModalService.open({
            titleTpl: this.titleTpl,
            contentHtml,
            contentTpl: this.contentTpl,
            trigger: this
        });
    }
}