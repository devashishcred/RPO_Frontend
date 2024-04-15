import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { TaskTypeServices } from '../taskType.services';
import { TaskType } from '../taskType';
import { Message } from "../../../app.messages";

declare const $: any

/**
 *  This component contains all function that are used in TaskTypeForm
 * @class TaskTypeForm
 */
@Component({
  selector: '[add-task-type]',
  templateUrl: './taskTypeForm.component.html',
  styleUrls: ['./taskTypeForm.component.scss']
})
export class TaskTypeForm implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() taskTypeId: number

  taskType: TaskType
  loading: boolean = false
  errorMsg: any
  private dropdownSettings: any = {};

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private taskTypeServices: TaskTypeServices,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {

    this.taskType = {} as TaskType
    this.loading = true


    if (!this.isNew && this.taskTypeId && this.taskTypeId > 0) {
      this.taskTypeServices.getById(this.taskTypeId).subscribe(r => {
        this.taskType = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.taskType.isActive = true;
      this.loading = false
    }
  }

  /**
   * This method is used to save record
   * @method saveTaskType
   */
  saveTaskType() {
    this.loading = true
    if (this.isNew) {
      this.taskTypeServices.create(this.taskType).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.taskTypeServices.update(this.taskType.id, this.taskType).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record updated successfully');
        this.loading = false
      }, (e: any) => {
        this.loading = false
      })
    }
  }


}