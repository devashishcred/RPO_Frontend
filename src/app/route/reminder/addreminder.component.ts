import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { TaskServices } from '../task/task.services';
import { Task, Reminder } from '../../types/task';
import { Message } from "../../app.messages";
declare const $: any

/**
* This component contains all function that are used in ReminderComponent
* @class ReminderComponent
*/
@Component({
  selector: '[add-reminder]',
  templateUrl: './addreminder.component.html',
  styleUrls: ['./addreminder.component.scss']
})
export class ReminderComponent implements OnInit {
  @Input() reminder: any
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() idTask: number

  private sub: any
  private idJob: number
  loading: boolean = false
  errorMsg: any
  exsitingReminder: any = []
  reminders: any
  private filter: any

  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private taskServices: TaskServices,
    private message: Message,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    this.sub = this.route.parent.params.subscribe(params => {
      this.idJob = +params['id']; // (+) converts string 'id' to a number
    });
    this.reminders = {} as Reminder
    this.loading = true
    this.getReminders()
    $('input').keypress(function (e: any) {
      if (this.value.length == 0 && e.which == 48) {
        return false;
      }
    });
  }

  /**
   * This method gets reminders from database
   * @method getReminders
   */
  getReminders() {
    if (this.idTask) {
      this.reminders.idTask = this.idTask
      let IsMyReminder = true
      this.taskServices.getReminders(this.idTask, IsMyReminder).subscribe(r => {
        if (r.data.length > 0) {
          this.exsitingReminder = r.data
        }
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.loading = false
    }
  }

  /**
   * This method close popup
   * @method closePopup
   */
  private closePopup() {
    this.modalRef.hide()
  }

  /* dropdown should not close */
  private dropdownPropagation(event: any) {
    event.stopPropagation();
  }

  /**
   * This method save Reminder
   * @method saveReminder
   */
  saveReminder() {
    this.loading = true
    this.taskServices.setReminder(this.reminders).subscribe(r => {
      this.toastr.success('Reminder set successfully')
      this.modalRef.hide()
      this.loading = false
    }, e => {
      this.loading = false
    })
  }
}