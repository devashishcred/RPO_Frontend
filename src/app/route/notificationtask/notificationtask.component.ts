import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { EmployeeServices } from '../employee/employee.services';
import { TaskServices } from '../task/task.services';
import { Task } from '../../types/task';
import { JobApplicationService } from '../../services/JobApplicationService.services';
import { Message } from "../../app.messages";
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { constantValues } from '../../app.constantValues';
import { ContactServices } from '../contact/contact.services';
import { TransmittalServices } from '../job/jobDetail/jobTransmittal/jobTransmittal.service';
import { Router } from '@angular/router';
import * as _ from 'underscore';

/**
 * This component contains all function that are used in ViewTaskComponent
 * @class ViewTaskComponent
 */
@Component({
  selector: '[notification-task]',
  templateUrl: './notificationtask.component.html',
  styleUrls: ['./notificationtask.component.scss']
})
export class notificationTaskComponent implements OnInit {
  @Input() viewtask: any
  @Input() modalRef: BsModalRef
  @Input() idJob: number
  @Input() idRfp: number
  @Input() idCompany: number
  @Input() idContact: number
  @Input() idTask: number
  @Input() isNew: boolean
  @Input() isSendFromTask: boolean
  @Input() isHeader: boolean
  @Input() redirectionURL: any;

  private sub: any

  task: any
  loading: boolean = false
  private newApplication: boolean = false
  private employees: any = []
  private contactList: any = []
  private taskType: any = []
  private taskStatus: any = []
  private application: any = []
  private workpermit: any = []
  private errorMsg: any
  idTaskType: number
  private showExaminer: boolean = false
  private isDisabled: boolean = false

  @ViewChild('Edittask', {static: true})
  private Edittask: TemplateRef<any>
  @ViewChild('progressionnote', {static: true}) progressionNote: TemplateRef<any>

  frommodeule: string

  /**
   * This method define all services that requires in whole class
   * @method constructor
   */
  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private employeeServices: EmployeeServices,
    private taskServices: TaskServices,
    private applicationService: JobApplicationService,
    private message: Message,
    private constantValues: constantValues,
    private contactServices: ContactServices,
    private transmittalServices: TransmittalServices,
    private router: Router
  ) {
    this.errorMsg = this.message.msg
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.loading = true
    this.task = {} as Task
    if (this.idTask && this.idTask > 0 && !this.isNew) {
      this.taskServices.getTaskById(this.idTask).subscribe(r => {
        this.task = r
        if (typeof this.task.taskDuration != 'undefined' && this.task.taskDuration != null && this.task.taskDuration != '') {
          this.task.taskDuration = this.task.taskDuration.toString().replace('.', ':');
        }
        this.task.assignedDate = this.taskServices.dateFromUTC(this.task.assignedDate, true);
        this.idTaskType = this.task.idTaskType
        if (this.task.idTaskType == 2) {
          this.task.completeBy = this.taskServices.dateFromUTC(this.task.completeBy);
        } else {
          this.task.completeBy = this.taskServices.dateFromUTC(this.task.completeBy, true);
        }
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }

  /**
   * This method open trasmittal PDF in new tab
   * @method printTransmittal
   * @param {number} idTask ID of Task
   */
  printTrasmittal(idTask: number) {
    this.loading = true;
    this.transmittalServices.printTransmittal(idTask).subscribe(r => {
      this.loading = false;
      window.open(r.value, '_blank');
    })
  }

  /**
   * This method is used to close popup
   * @method closePopup
   */
  private closePopup() {
    this.modalRef.hide()
  }

  /**
   * This method is used to redirect job deail
   * @method redirectJobDetail
   */
  redirectJobDetail() {
    localStorage.setItem('isFromTask', 'true')
  }

  editTask() {
    this.modalRef.hide();
    this.openModalForm(this.Edittask, this.idTask)
  }

  addProgressNotes() {
    this.modalRef.hide();
    this.openModalForm(this.progressionNote, this.idTask);
  }

  reload() {
    if (this.idTask && this.idTask > 0 && !this.isNew) {
      this.taskServices.getTaskById(this.idTask).subscribe(r => {
        this.task = r
        if (typeof this.task.taskDuration != 'undefined' && this.task.taskDuration != null && this.task.taskDuration != '') {
          this.task.taskDuration = this.task.taskDuration.toString().replace('.', ':');
        }
        this.task.assignedDate = this.taskServices.dateFromUTC(this.task.assignedDate, true);
        this.idTaskType = this.task.idTaskType
        if (this.task.idTaskType == 2) {
          this.task.completeBy = this.taskServices.dateFromUTC(this.task.completeBy);
        } else {
          this.task.completeBy = this.taskServices.dateFromUTC(this.task.completeBy, true);
        }
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }

  openJob() {
    this.modalRef.hide();
    let url = this.redirectionURL.split('/');
    url.splice(0, 3)
    if (url.length > 0) {
      url = url.join("/");
    }
    this.router.navigate(['./' + url]);
  }

  openModalForm(template: TemplateRef<any>, id?: number, from?: string) {
    this.isNew = false
    if (!id) {
      this.isNew = true
    }
    if (from) {
      this.frommodeule = from;
    }
    this.modalRef = this.modalService.show(template, {class: 'modal-view-task', backdrop: 'static', 'keyboard': false})
  }
}
