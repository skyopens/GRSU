import { AfterContentInit, Component, ElementRef, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-modal-long-content',
    templateUrl: './modal-long-content.component.html',
})
export class ModalLongContentComponent implements AfterContentInit {
    modalRef: BsModalRef;
    items: any[];
    hasContent = false;

    constructor(private modalService: BsModalService, private el: ElementRef) {
        this.items = Array(15).fill(0);
    }

    openModal(template: TemplateRef<any>): void {
        this.modalRef = this.modalService.show(template);
    }

    ngAfterContentInit(): void {
        // 检测宿主元素是否有子节点内容
        const projected = this.el.nativeElement.childNodes;
        this.hasContent = Array.from(projected).some(
            (node: any) => (node.nodeType === Node.ELEMENT_NODE) || (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0)
        );
    }
}
