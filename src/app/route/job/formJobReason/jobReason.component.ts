import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'underscore';
import * as moment from 'moment';
import { Message } from '../../../app.messages';
import { constantValues } from '../../../app.constantValues';
import { JobReasonType } from '../../../types/jobReason';
import { Job } from '../../../types/job';
import { JobReasonServices } from './jobReason.services';
import { JobServices } from '../job.services';

import { AppComponent } from '../../../app.component';
declare const $: any

@Component({
  selector: '[add-reason]',
  templateUrl: './jobReason.component.html'
})

/**
* This component contains all function that are used in Job Reason Form
* @class JobReasonForm
*/
export class JobReasonForm implements OnInit {
  @Input() modalRef: BsModalRef
  @Input() idJob: number
  @Input() statusToSet: string
  @Input() changeStatusFromReason: any
  @Input() jobObj: Job
  @Output() EventToFire = new EventEmitter<any>();

  errorMessage: any
  loading: boolean = false
  ReasonType: any
  constructor(
    private toastr: ToastrService,
    private message: Message,
    private constantValues: constantValues,
    private JobReasonServices: JobReasonServices,
    private JobServices: JobServices,
    private appComponent: AppComponent,
    

  ) {
    this.errorMessage = this.message.msg;
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    this.ReasonType = {} as JobReasonType
    this.ReasonType.jobHistoryType = 1
    this.ReasonType.idJob = this.idJob
  }

  /**
  * This method is used to save reason in database, an event emitter is executed which update other components
  * @method saveReason
  */
  saveReason() {
    this.loading = true;

    let data = {
      jobStatus: this.changeStatusFromReason,
      statusReason: this.ReasonType.description,
    }
    this.JobServices.changeJobStatus(this.idJob, data, true).subscribe(response => {
      this.jobObj.status = this.changeStatusFromReason
      this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, this.jobObj)
      let sendData = {
        isFromReason: true,
        jobDetail: this.jobObj
      }
      this.EventToFire.emit(sendData);
      this.loading = false;
      this.modalRef.hide()
    })
  }

}