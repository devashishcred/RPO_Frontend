import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'underscore';
import * as moment from 'moment';

import { Message } from '../../../app.messages';
import { constantValues } from '../../../app.constantValues';
import { JobTypeServices } from '../jobType.services';
import { JobTypeDTO } from '../jobType';

declare const $: any
/**
* This component contains all function that are used in FormJobType
* @class FormJobType
*/
@Component({
  selector: '[form-job-type]',
  templateUrl: './formJobType.component.html'
})

export class FormJobType implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() jobTypeId: number

  errorMessage: any
  loading: boolean = false
  jobType: any
  constructor(
    private toastr: ToastrService,
    private message: Message,
    private constantValues: constantValues,
    private jobTypeServices: JobTypeServices,
  ) {
    this.errorMessage = this.message.msg;
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    this.jobType = {} as JobTypeDTO
    this.jobType.level = 1
    this.jobType.idParent = null
    if (this.jobTypeId && !this.isNew) {
      this.loading = true
      this.jobTypeServices.getById(this.jobTypeId).subscribe(r => {
        this.jobType = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }

  /**
  * This method is used to save record
  * @method saveJobType
  * @param {data} type request Object
  */
  saveJobType() {
    this.loading = true
    this.jobType.level = 1
    this.jobType.idParent = null
    this.jobType.isActive = true;
    if (!this.jobTypeId) {
      this.jobTypeServices.create(this.jobType).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.jobType.isActive = true;
      this.jobTypeServices.update(this.jobTypeId, this.jobType).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record updated successfully');
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }
}