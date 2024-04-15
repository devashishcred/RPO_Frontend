import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { WorkPermitTypeServices } from '../workPermitType.services';
import { ApplicationTypeServices } from '../../applicationtype/applicationType.services';

import { WorkPermitType } from '../workPermitType';
import { Message } from "../../../app.messages";

declare const $: any

/**
 * This component contains all function that are used in ApplicationTypeFormComponent for create and update application type
 * @class ApplicationTypeFormComponent
 */
@Component({
  selector: '[add-work-permit-type]',
  templateUrl: './workPermitTypeform.component.html',
})
export class WorkPermitTypeFormComponent implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() workPermitTypeId: number

   workPermitType: WorkPermitType
  loading: boolean = false
  errorMsg: any
  applicationTypeList: any
  jobTypeList: any

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private workPermitTypeServices: WorkPermitTypeServices,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.workPermitType = {} as WorkPermitType
    this.getApplicationTypes()
    if (this.workPermitTypeId && !this.isNew) {
      this.getEditWorkPermit()
    }

  }

  getEditWorkPermit() {
    if (!this.isNew && this.workPermitTypeId && this.workPermitTypeId > 0) {
      this.loading = true
      this.workPermitTypeServices.getById(this.workPermitTypeId).subscribe((r: any) => {
        this.workPermitType = r

        this.getApplicationTypeByJobType()
        this.loading = false
      }, (e: any) => {
        this.loading = false
      })
    }
  }


  /**
   * This method is used to get all application types
   * @method getApplicationTypes
   */
  getApplicationTypes() {
    this.workPermitTypeServices.getAllApplicationTypesDD().subscribe(r => {
      this.loading = true
      if (r) {
        this.jobTypeList = []
        r.forEach((element: any) => {
          if (element.id == 1 || element.id == 2 || element.id == 4) {
            this.jobTypeList.push({id: element.id, itemName: element.itemName})
          }
        });
      } else {
        this.jobTypeList = []
      }

      this.loading = false
    }, e => {
      this.loading = false
    })
  }

  /**
   * This method  is used to get application type of specific job type
   * @method getApplicationTypeByJobType
   *
   */
  getApplicationTypeByJobType() {
    if (this.workPermitType.idJobType) {
      this.workPermitTypeServices.getAllWorkPermitTypesDD(this.workPermitType.idJobType).subscribe(r => {
        this.loading = true
        if (r) {
          this.applicationTypeList = []
          this.applicationTypeList = r
          this.loading = false
        } else {
          this.applicationTypeList = []
        }

        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.workPermitType.idJobApplicationType = null
      this.applicationTypeList = []
    }
  }


  /**
   * This method is used to save record
   * @method saveWorkPermitType
   */
  saveWorkPermitType() {
    this.loading = true
    if (this.isNew) {
      this.workPermitTypeServices.create(this.workPermitType).subscribe((r: any) => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, (e: any) => {
        this.loading = false
      })
    } else {
      this.workPermitTypeServices.update(this.workPermitType.id, this.workPermitType).subscribe((r: any) => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record updated successfully');
        this.loading = false
      }, (e: any) => {
        this.loading = false
      })
    }
  }

  /**
   * This method is used to check whether enetered number is numeric or not
   * @method isNumber
   * @param {any} evt evt is used as object of input element
   */
  isNumber(evt: any) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}