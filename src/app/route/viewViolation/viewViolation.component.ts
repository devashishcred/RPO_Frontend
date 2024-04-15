import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { EmployeeServices } from '../employee/employee.services';
import { TaskServices } from '../task/task.services';
import { JobApplicationService } from '../../services/JobApplicationService.services';
import { Message } from "../../app.messages";
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { constantValues } from '../../app.constantValues';
import { ContactServices } from '../contact/contact.services';
import { TransmittalServices } from '../job/jobDetail/jobTransmittal/jobTransmittal.service';
import * as _ from 'underscore';
import { Violation } from '../job/jobDetail/jobViolation/violation';
import { JobViolationServices } from '../job/jobDetail/jobViolation/jobViolation.service';
import { AppComponent } from '../../app.component';

/**
* This component contains all function that are used in ViewTaskComponent
* @class ViewTaskComponent
*/
@Component({
  selector: '[view-violation]',
  templateUrl: './viewViolation.component.html',
  styleUrls: ['./viewViolation.component.scss']
})
export class ViewViolationComponent implements OnInit {
  @Input() id: number
  @Input() modalRef: BsModalRef
  @Input() idJob: any
  @Input() isFromChecklist: boolean = false;
  @Input() isFromGlobalSearch: boolean = false;
  @Input() violationType: any = 'AOTH Violation';  // DOB Violation
  @Input() isGetBySummonsNumber: boolean = false;

  public data: any;
  public loading: boolean = false
  public errorMsg: any
  public jobContactName: string;
  partOfProjects: any = [];

  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private violationService: JobViolationServices,
    private jobApplicationService: JobApplicationService,
    private taskServices: TaskServices,
    private appComponent: AppComponent
  ) {
    this.errorMsg = this.message.msg
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    if (!this.isGetBySummonsNumber) {
      this.getData()
    } else {
      this.getDataBySummonsNumber()
    }
  }

  getData() {
    this.loading = true
    this.data = {} as Violation
    if (this.violationType === 'AOTH Violation') {
      this.violationService.getById(this.id).subscribe(r => {
        this.data = r
        if (this.data.dateIssued) {
          this.data.dateIssued = this.taskServices.dateFromUTC(this.data.dateIssued, true);
        }
        console.log('single violation data', this.data)

        this.loading = false
      }, e => {
        console.log(e, 'run')
        this.loading = false
        this.closePopup()
        this.toastr.warning("The provided ECB number is not available in Snapcor.")
      })
    } else if(this.violationType === 'DOB Violation') {
      this.violationService.getDobVioationById(this.id).subscribe(r => {
        this.data = r
        if (this.data.dateIssued) {
          this.data.dateIssued = this.taskServices.dateFromUTC(this.data.dateIssued, true);
        }
        if (this.data.dispositionDate) {
          this.data.dispositionDate = this.taskServices.dateFromUTC(this.data.dispositionDate, true);
        }
        console.log('single violation data', this.data)
        this.loading = false
      }, e => {
        console.log(e, 'run')
        this.loading = false
        this.closePopup()
        this.toastr.warning("The provided DOB number is not available in Snapcor.")
      }
      )
    } else if(this.violationType === 'DOB Safety Violation') {
      this.violationService.getDobSafetyVioationById(this.id).subscribe(r => {
        this.data = r
        if (this.data.dateIssued) {
          this.data.dateIssued = this.taskServices.dateFromUTC(this.data.dateIssued, true);
        }
        console.log('single violation data', this.data)
        this.loading = false
      }, e => {
        console.log(e, 'run')
        this.loading = false
        this.closePopup()
        this.toastr.warning("The provided DOB safety number is not available in Snapcor.")
      }
      )
    }
    this.getPartOfProjects(this.id)
  }

  getDataBySummonsNumber() {
    console.log('isGetBySummonsNumber')
    this.loading = true
    this.data = {} as Violation
    if (this.violationType === 'AOTH Violation' || this.isFromGlobalSearch) {
      this.violationService.getEcbBySummonsNumber(this.id).subscribe(r => {
        this.data = r
        if(this.data.type_ECB_DOB == 'ECB') {
          this.violationType = 'AOTH Violation'
        } else {
          this.violationType = 'DOB Violation'
        }
        this.getPartOfProjects(this.data.id)
        if (this.data.dateIssued) {
          this.data.dateIssued = this.taskServices.dateFromUTC(this.data.dateIssued, true);
        }
        console.log('single violation data', this.data)

        this.loading = false
      }, e => {
        console.log(e, 'run')
        this.loading = false
        this.closePopup()
        this.toastr.warning("The provided ECB number is not available in Snapcor.")
      }
      )
    }
  }

  /**
   * This method is used to close popup
   * @method closePopup
   */
  private closePopup() {
    this.modalRef.hide()
  }

  getPartOfProjects(violationId) {
    this.loading = true;
    this.violationService.getDobPartOfProjects(violationId).subscribe((res: any) => {
      this.partOfProjects = res.data
      if (this.partOfProjects.length > 0) {
        for (let index = 0; index < this.partOfProjects.length; index++) {
          console.log(this.partOfProjects[index].startDate)
          this.partOfProjects[index].startDate = this.taskServices.dateFromUTC(this.partOfProjects[index].startDate, true);
        }
      }
    }, err => {
      this.loading = false;
      this.toastr.error(err)
      console.log(err)
    })
  }

  redirectOnDetailPage(jobDetail) {
    console.log(jobDetail)
    if (!this.isFromGlobalSearch) {
      return
    }
    if (jobDetail.statusDescription === 'Hold' || jobDetail.statusDescription === 'Close') {
      this.toastr.warning("Please contact RPO administration")
    }
    else {
      if (jobDetail.statusDescription !== 'Hold' && jobDetail.statusDescription !== 'Close') {
        this.onOpenJobDetail(jobDetail);
      }
    }
  }

  private onOpenJobDetail(data: any) {
    //this call is used to set data in shared service
    this.appComponent.setCommonJobObject(data.id);
    this.modalRef.hide()
  }
}