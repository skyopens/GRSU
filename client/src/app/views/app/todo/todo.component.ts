import { Component, AfterViewInit, ViewChild, OnDestroy, Renderer2 } from '@angular/core';
import { AddNewTodoModalComponent } from 'src/app/containers/applications/add-new-todo-modal/add-new-todo-modal.component';
import { ITodo, LEVEL_DICT } from 'src/app/apis/todo';
import { ApiService } from 'src/app/data/api_service';
import { NotificationsService, NotificationType } from 'angular2-notifications';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-todo',
    templateUrl: './todo.component.html'
})
export class TodoComponent implements AfterViewInit, OnDestroy {
    selected = [];
    selectAllState = '';
    itemOptionsOrders = ['Title', 'Category', 'Status', 'Label'];
    displayOptionsCollapsed = false;

    todoItems: ITodo[] = [{
        id: 1,
        title: "Finish database schema design",
        detail: "Complete ER diagram and normalize tables for project",
        category: "Study",
        status: 1,
        label: "High Priority",
        date: "2026-06-16"
    }, {
        id: 2,
        title: "Implement login API",
        detail: "Create authentication endpoint with JWT support",
        category: "Development",
        status: 2,
        label: "Backend",
        date: "2026-06-17"
    }, {
        id: 3,
        title: "UI prototype in Figma",
        detail: "Design dashboard layout and user flow",
        category: "Design",
        status: 1,
        label: "UI/UX",
        date: "2026-06-14"
    }];

    @ViewChild('addNewModalRef', { static: true }) addNewModalRef: AddNewTodoModalComponent;

    constructor(
        private renderer: Renderer2,
        private notifications: NotificationsService,
        private translate: TranslateService,
        private apiService: ApiService
    ) { }

    getData(): void {
        this.renderer.addClass(document.body, 'right-menu');
        this.apiService.todo.getList().subscribe(res => {
            this.todoItems = res.data;
        });
    }

    dataForm: Partial<ITodo> = {};
    showAddNewModal(): void {
        this.addNewModalRef.show(null);
    }

    showDetailModal(item: ITodo): void {
        this.dataForm = item;
        this.addNewModalRef.show(this.dataForm as ITodo);
    }

    isSelected(p: ITodo): boolean {
        return this.selected.findIndex(x => x.id === p.id) > -1;
    }

    onSelect(item: ITodo): void {
        if (this.isSelected(item)) {
            this.selected = this.selected.filter(x => x.id !== item.id);
        } else {
            this.selected.push(item);
        }
        this.setSelectAllState();
    }

    setSelectAllState(): void {
        if (this.selected.length === this.todoItems.length) {
            this.selectAllState = 'checked';
        } else if (this.selected.length !== 0) {
            this.selectAllState = 'indeterminate';
        } else {
            this.selectAllState = '';
        }
    }

    selectAll($event): void {
        if ($event.target.checked) {
            this.selected = [...this.todoItems];
        } else {
            this.selected = [];
        }
        this.setSelectAllState();
    }

    getStatusClass(status: string): string {
        let color = '';
        let result = 'badge badge-pill ';
        switch (status) {
            case 'COMPLETED': color = 'badge-success'; break;
            case 'PROGRESSING': color = 'badge-info'; break;
        }
        return result + color;
    }

    getStatusText(status: number): string {
        const label = LEVEL_DICT.find(item => item.value === status)?.label;
        return this.translate.instant(label);
    }

    handleSaveData(data) {
        const saveAPI = data.id ? this.apiService.todo.putUpdate(data) : this.apiService.todo.postCreate(data);
        saveAPI.subscribe(() => {
            this.addNewModalRef.hide();
            this.notifications.create(
                this.translate.instant('alert.success'),
                this.translate.instant('alert.notification-success'),
                NotificationType.Success, { theClass: 'outline', timeOut: 2200, showProgressBar: false }
            );
            this.getData();
        });
    }

    handleDelete(): void {
        const data = this.selected.map(item => item.id);
        this.apiService.todo.requestDelete(data).subscribe(() => {
            this.notifications.create(
                this.translate.instant('alert.success'),
                this.translate.instant('alert.notification-success'),
                NotificationType.Success, { theClass: 'outline', timeOut: 2200, showProgressBar: false }
            );
            this.getData();
        });
    }

    ngAfterViewInit() {
        this.getData();
    }

    ngOnDestroy(): void {
        this.renderer.removeClass(document.body, 'right-menu');
    }
}
