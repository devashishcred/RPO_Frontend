import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { JobApplication, Application } from '../../../../../types/jobApplication';
import { Message } from "../../../../../app.messages";
import { isIE } from '../../../../../utils/utils';
import { JobApplicationService } from '../../../../../services/JobApplicationService.services';
import { GetAppNoOnSelectRow } from '../../../../../app.constantValues';

declare const $: any
/**
* This component contains all function that are used in FormAddDot
* @class FormAddDot
*/
@Component({
  selector: '[form-add-dot]',
  templateUrl: './formAddDot.component.html'
})

export class FormAddDot {
  @Input() modalRef: BsModalRef
  @Input() onSave: Function
  @Input() idJob: number
  @Input() selectedJobType: number
  @Input() reload: Function
  @Input() idJobApp: number

  private project: any = []
  applicationType: any = []
  applicationStatus: any = []
  private selectUndefinedOptionValue: any
  errorMsg: any
  private app: any
  application: Application
  private new: boolean = true
  loading: boolean = false
  appNUmberRequired: boolean = false

  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(
    private toastr: ToastrService,
    private message: Message,
    private jobApplicationService: JobApplicationService,
    private getAppNoOnSelectRow:GetAppNoOnSelectRow,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
    * This method will be called once only when module is call for first time
    * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'Projects'
    this.application = {} as Application
    this.loading = true
    this.applicationType = []
    this.jobApplicationService.getApplicationTypeDD(2).subscribe(r => {
      this.applicationType = r;
      this.application.idJobApplicationType = this.applicationType[0].id;
      this.getAppStatus()
    }, e => {
      this.loading = false
    })
  }

  /**
    * This method get application status
    * @method getAppStatus
  */
  getAppStatus() {
    if (this.idJobApp && this.idJobApp > 0) {
      this.jobApplicationService.getApplicationById(this.idJobApp).subscribe(r => {
        this.application = r
        if (this.application.applicationNumber != null) {
          this.appNUmberRequired = true
        }
        if (this.application.floorWorking == null) {
          this.application.floorWorking = ""
        }
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.loading = false
    }
    this.application.idJob = this.idJob
    this.jobApplicationService.getApplicationStatus().subscribe(r => {
      let status: any = []
      if (this.selectedJobType) {
        status = r.filter((x: any) => x.idJobApplicationType == this.selectedJobType)
      }
      this.applicationStatus = status
    }, e => {
      this.loading = false
    })
  }

  /**
   * This method save job application
   * @method saveJobApplication
   */
  saveJobApplication() {
    this.loading = true
    let newApplication = false
    if (this.application.id && this.application.id > 0) {
      newApplication = false
    } else {
      newApplication = true
    }
    delete this.application.lastModifiedDate

    this.jobApplicationService.addEditApplication(this.application, newApplication).subscribe(r => {
      if (newApplication) {
        this.toastr.success('Location added successfully')
      } else {
        this.toastr.success('Location updated successfully')
      }
      this.modalRef.hide()
      this.reload()
    }, e => {
      this.loading = false
    })

  }

  /**
   * This method delete job application
   * @method deleteApplication
   */
  deleteApplication() {
    this.jobApplicationService.deleteApplication(this.application.id).subscribe(r => {
      this.toastr.success('Application deleted successfully')
      this.reload()
    }, e => {

    })
  }

}