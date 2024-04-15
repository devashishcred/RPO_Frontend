import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'underscore';
import * as moment from 'moment';

import { Message } from '../../../app.messages';
import { constantValues } from '../../../app.constantValues';
import { SubJobTypeCategoryServices } from '../subjobtypecategory.services';
import { SubJobTypeCategoryDTO } from '../subjobtypecategory';
import { JobTypeServices } from '../../jobtype/jobType.services';


declare const $: any

/**
 * This component contains all function that are used in FormSubJobTypeCategory
 * @class FormSubJobTypeCategory
 */
@Component({
  selector: '[form-sub-job-type-category]',
  templateUrl: './formSubJobTypeCategory.component.html'
})

export class FormSubJobTypeCategory implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() subJobTypeCategoryId: number

  errorMessage: any
  loading: boolean = false
  subJobTypeCategory: any
  jobTypes: any

  constructor(
    private toastr: ToastrService,
    private message: Message,
    private constantValues: constantValues,
    private subJobTypeCategoryServices: SubJobTypeCategoryServices,
    private jobTypeServices: JobTypeServices,
  ) {
    this.errorMessage = this.message.msg;
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.subJobTypeCategory = {} as SubJobTypeCategoryDTO
    this.loading = true
    this.subJobTypeCategory.level = 2
    if (this.subJobTypeCategoryId && !this.isNew) {
      this.loading = true
      this.subJobTypeCategoryServices.getById(this.subJobTypeCategoryId).subscribe(r => {
        this.subJobTypeCategory = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
    this.getJobTypes()
  }

  /**
   * This method will be used for getting all job types
   * @method getJobTypes
   */
  getJobTypes() {
    this.jobTypeServices.getDropDown().subscribe(r => {
      this.jobTypes = r.filter((x: any) => x.level == 1)
      this.loading = false

    }, e => {
      this.loading = false
    })
  }

  /**
   * This method is used to save record
   * @method saveJobType
   * @param {data} type request Object
   */
  saveJobType() {
    this.loading = true
    this.subJobTypeCategory.level = 2
    this.subJobTypeCategory.idParent = this.subJobTypeCategory.idRfpJobType
    this.subJobTypeCategory.isActive = true;
    if (!this.subJobTypeCategoryId) {
      this.jobTypeServices.create(this.subJobTypeCategory).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.jobTypeServices.update(this.subJobTypeCategoryId, this.subJobTypeCategory).subscribe(r => {
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