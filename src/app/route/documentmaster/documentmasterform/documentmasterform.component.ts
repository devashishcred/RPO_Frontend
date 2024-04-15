import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { ApplicationTypeServices } from '../../applicationtype/applicationType.services';
import { ApplicationType } from '../applicationtype';
import { Message } from "../../../app.messages";

declare const $: any

/**
* This component contains all function that are used in ApplicationTypeFormComponent for create and update application type
* @class ApplicationTypeFormComponent
*/
@Component({
  selector: '[add-document-master]',
  templateUrl: './documentmasterform.component.html',
})
export class DocumentMasterFormComponent implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() applicationTypeId: number

  applicationType: ApplicationType
  loading: boolean = false
  errorMsg: any
  private applicationTypeList: any

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
    if (!this.isNew && this.applicationTypeId && this.applicationTypeId > 0) {
      this.loading = true
      this.applicationTypeServices.getDocumentMasterById(this.applicationTypeId).subscribe((r: any) => {
        this.applicationType = r
        this.loading = false
      }, (e: any) => {
        this.loading = false
      })
    }
  }

  /**
  * This method is used to save record
  * @method saveApplicationType
  */
  saveApplicationType() {
    this.loading = true
    if (this.isNew) {
      this.applicationType['isNewDocument'] = true;
      this.applicationTypeServices.createDocumentMaster(this.applicationType).subscribe((r: any) => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Document created successfully')
        this.loading = false
      }, (e: any) => {
        this.loading = false
      })
    } else {
      this.applicationTypeServices.updateDocumentMaster(this.applicationType.id, this.applicationType).subscribe((r: any) => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Document updated successfully');
        this.loading = false
      }, (e: any) => {
        this.loading = false
      })
    }
  }
}