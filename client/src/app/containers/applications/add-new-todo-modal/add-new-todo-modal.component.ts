import { Component, TemplateRef, Output, ViewChild, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ITodo, LEVEL_DICT } from 'src/app/apis/todo';

@Component({
    selector: 'app-add-new-todo-modal',
    templateUrl: './add-new-todo-modal.component.html',
    styles: []
})
export class AddNewTodoModalComponent {
    modalRef: BsModalRef;
    config = {
        backdrop: true,
        ignoreBackdropClick: true,
        class: 'modal-right'
    };
    categories = [
        { label: 'todo.precedence.low', value: 1 },
        { label: 'todo.precedence.medium', value: 2 },
        { label: 'todo.precedence.high', value: 3 }
    ];
    levels = LEVEL_DICT;

    @ViewChild('template', { static: true }) template: TemplateRef<any>;
    @Output() save = new EventEmitter<ITodo>();

    constructor(private modalService: BsModalService) { }


    dataForm: ITodo = {
        title: '',
        detail: '',
        category: '',
        status: 1,
        label: ''
    };

    show(item?: ITodo): void {
        this.clearData();
        if (item && item.id) this.dataForm = JSON.parse(JSON.stringify(item));
        this.modalRef = this.modalService.show(this.template, this.config);
    }
    
    hide(): void {
        this.modalRef.hide();
        this.clearData();
    }

    clearData(): void {
        Object.keys(this.dataForm).forEach(key => {
            this.dataForm[key] = '';
        });
    }

    saveData(): void {
        this.save.emit(this.dataForm);
    }
}
