import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'underscore';
import * as moment from 'moment';

import { Message } from '../../../app.messages';
import { constantValues } from '../../../app.constantValues';
import { RfpSubJobType } from '../rfpsubjobtype';
import { JobTypeServices } from '../../jobtype/jobType.services';
import { RfpSubJobTypeServices } from '../rfpsubjobtype.services';

declare const $: any
/**
* This component contains all function that are used in FormRfpSubJobType
* @class FormRfpSubJobType
*/
@Component({
  selector: '[form-rfp-sub-job-type]',
  templateUrl: './formRfpSubJobType.component.html'
})

export class FormRfpSubJobType implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() idRfpSubJobTypeCategory: number

  errorMessage: any
  loading: boolean = false
  rfpSubJobType: any
  jobTypes: any
  subJobTypes: any
  private id: number
  constructor(
    private toastr: ToastrService,
    private message: Message,
    private constantValues: constantValues,
    private rfpSubJobTypeServices: RfpSubJobTypeServices,
    private jobTypeServices: JobTypeServices,
  ) {
    this.errorMessage = this.message.msg;
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    this.rfpSubJobType = {} as RfpSubJobType
    this.loading = true
    this.rfpSubJobType.level = 3
    this.id = this.idRfpSubJobTypeCategory
    if (this.id && !this.isNew) {
      this.loading = true
      this.rfpSubJobTypeServices.getById(this.id).subscribe(r => {
        this.rfpSubJobType = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
    this.getJobTypes()
    this.getSubJobTypes(0, false)
  }

  /**
  *  Get all dropdown data from getJobTypes
  * @method getJobTypes
  */
  getJobTypes() {
    this.jobTypeServices.getDropDown().subscribe(r => {
      this.jobTypes =  r.filter((x: any) => x.level == 1)
      this.loading = false

    }, e => {
      this.loading = false
    })
  }

   /**
  *  Get all dropdown data from getSubJobTypes
  * @method getSubJobTypes
  */
  getSubJobTypes(idJobType: number, isNew?: boolean) {
    if (isNew) {
      this.rfpSubJobType.idRfpSubJobTypeCategory = null
    }
    if (idJobType != null) {
      this.jobTypeServices.getRfpSubJobType(idJobType).subscribe(r => {
        this.subJobTypes = r.filter((x: any) => x.level == 2)
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }

  /**
  * This method is used to save record
  * @method saveRfpSubJobType
  */
  saveRfpSubJobType() {
    this.loading = true
    this.rfpSubJobType.level = 3
    this.rfpSubJobType.isActive = true;
    if (this.rfpSubJobType.idRfpJobType) {
      this.rfpSubJobType.idParent = this.rfpSubJobType.idRfpJobType
    }
    if (this.rfpSubJobType.idRfpSubJobTypeCategory) {
      this.rfpSubJobType.idParent = this.rfpSubJobType.idRfpSubJobTypeCategory
    }
    if (!this.id) {
      this.jobTypeServices.create(this.rfpSubJobType).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.jobTypeServices.update(this.id, this.rfpSubJobType).subscribe(r => {
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