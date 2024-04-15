import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { ApplicationTypeServices } from '../applicationType.services';
import { ApplicationType } from '../applicationtype';
import { Message } from "../../../app.messages";

declare const $: any

/**
* This component contains all function that are used in ApplicationTypeFormComponent for create and update application type
* @class ApplicationTypeFormComponent
*/
@Component({
  selector: '[add-application-type]',
  templateUrl: './applicationtypeform.component.html',
})
export class ApplicationTypeFormComponent implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() applicationTypeId: number

  applicationType: ApplicationType
  loading: boolean = false
  errorMsg: any
  applicationTypeList: any

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private applicationTypeServices: ApplicationTypeServices,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {

    this.applicationType = {} as ApplicationType
    this.getApplicationTypes()
    if (!this.isNew && this.applicationTypeId && this.applicationTypeId > 0) {
      this.loading = true
      this.applicationTypeServices.getById(this.applicationTypeId).subscribe((r: any) => {
        this.applicationType = r
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
    this.applicationTypeServices.getAllApplicationTypesDD().subscribe(r => {
      this.loading = true
      if (r) {
        this.applicationTypeList=[]
        r.forEach((element: any) => {
          if (element.id == 1 || element.id == 2 || element.id == 4) {
            this.applicationTypeList.push({ id: element.id, itemName: element.itemName })
          }
        });
      } else {
        this.applicationTypeList = []
      }

      this.loading = false
    }, e => {
      this.loading = false
    })
  }

  /**
  * This method is used to save record
  * @method saveApplicationType
  */
  saveApplicationType() {
    this.loading = true
    if (this.isNew) {
      this.applicationTypeServices.create(this.applicationType).subscribe((r: any) => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, (e: any) => {
        this.loading = false
      })
    } else {
      this.applicationTypeServices.update(this.applicationType.id, this.applicationType).subscribe((r: any) => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record updated successfully');
        this.loading = false
      }, (e: any) => {
        this.loading = false
      })
    }
  }
}