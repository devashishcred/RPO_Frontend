import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'underscore';
import * as moment from 'moment';

import { Message } from '../../../app.messages';
import { constantValues } from '../../../app.constantValues';
import { WorkTypeCategory } from '../worktypecategory';
import { JobTypeServices } from '../../jobtype/jobType.services';
import { WorkTypeCategoryServices } from '../worktypecategory.services';

declare const $: any


/**
 * This component contains all function that are used in FormWorkTypeCategory
 * @class FormWorkTypeCategory
 */
@Component({
  selector: '[form-work-type-category]',
  templateUrl: './formWorkTypeCategory.component.html'
})

export class FormWorkTypeCategory implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() idRfpSubJobType: number

  errorMessage: any
  loading: boolean = false
  workTypeCategory: any
  jobTypes: any
  subJobTypes: any
  subJobTypesCategory: any
  private id: number

  constructor(
    private toastr: ToastrService,
    private message: Message,
    private constantValues: constantValues,
    private WorkTypeCategoryServices: WorkTypeCategoryServices,
    private jobTypeServices: JobTypeServices,
  ) {
    this.errorMessage = this.message.msg;
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.workTypeCategory = {} as WorkTypeCategory
    this.loading = true
    this.workTypeCategory.level = 4
    this.id = this.idRfpSubJobType
    this.getJobTypes()
    if (this.id && !this.isNew) {
      this.loading = true
      this.WorkTypeCategoryServices.getById(this.id).subscribe(r => {
        this.workTypeCategory = r
        this.getSubJobTypesCagetory(this.workTypeCategory.idRfpJobType, false)
        this.getSubJobTypes(this.workTypeCategory.idRfpSubJobTypeCategory, false)
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.getSubJobTypesCagetory(0, false)
      this.getSubJobTypes(0, false)
    }

  }

  /**
   * This method is used to get job types
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
   * This method is used to get sub job type category
   * @method getSubJobTypesCagetory
   * @param {number} idJobType for get sub job type category
   * @param {boolean} isNew to check whether record is new or old
   */
  getSubJobTypesCagetory(idJobType: number, isNew?: boolean) {
    if (isNew && this.workTypeCategory.idRfpSubJobTypeCategory != null) {
      this.workTypeCategory.idRfpSubJobTypeCategory = null
    } else {
      idJobType = this.workTypeCategory.idRfpJobType
    }
    if (idJobType != null) {
      this.jobTypeServices.getRfpSubJobType(idJobType).subscribe(r => {
        this.subJobTypesCategory = []
        if (this.workTypeCategory.idRfpSubJobTypeCategory == null) {
          this.subJobTypes = []
          this.workTypeCategory.idRfpSubJobType = null
        }
        this.subJobTypesCategory = r.filter((x: any) => x.level == 2)
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.subJobTypesCategory = []
      this.subJobTypes = []
      this.workTypeCategory.idRfpSubJobTypeCategory = null
      this.workTypeCategory.idRfpSubJobType = null
    }
  }


  /**
   * This method is used to get sub job types from database
   * @method getSubJobTypes
   * @param {number} idRfpSubJobTypeCategory for get sub job
   * @param {boolean} isNew to check whether record is new or old
   */
  getSubJobTypes(idRfpSubJobTypeCategory: number, isNew?: boolean) {
    if (this.workTypeCategory.idRfpSubJobTypeCategory) {
      idRfpSubJobTypeCategory = this.workTypeCategory.idRfpSubJobTypeCategory
    } else {
      idRfpSubJobTypeCategory = this.workTypeCategory.idRfpJobType
    }
    if (idRfpSubJobTypeCategory != null) {
      this.jobTypeServices.getRfpSubJob(idRfpSubJobTypeCategory).subscribe(r => {
        this.subJobTypes = []
        this.subJobTypes = r.filter((x: any) => x.level == 3)
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }


  /**
   * This method is used to save record
   * @method saveWorkTypeCategory
   */
  saveWorkTypeCategory() {
    this.loading = true
    this.workTypeCategory.level = 4
    this.workTypeCategory.isActive = true;
    if (this.workTypeCategory.idRfpJobType) {
      this.workTypeCategory.idParent = this.workTypeCategory.idRfpJobType
    }
    if (this.workTypeCategory.idRfpSubJobTypeCategory) {
      this.workTypeCategory.idParent = this.workTypeCategory.idRfpSubJobTypeCategory
    }
    if (this.workTypeCategory.idRfpSubJobType) {
      this.workTypeCategory.idParent = this.workTypeCategory.idRfpSubJobType
    }
    if (!this.id) {
      this.jobTypeServices.create(this.workTypeCategory).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.jobTypeServices.update(this.id, this.workTypeCategory).subscribe(r => {
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