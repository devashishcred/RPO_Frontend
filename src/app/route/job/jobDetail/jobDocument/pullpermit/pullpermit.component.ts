import { Component, Input, OnDestroy, OnInit, HostListener,TemplateRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Observable, Observer } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';
import { RelatedJob } from '../../../../../types/relatedJob';
import { FieldValue, ModelTosent } from '../../../../../types/document';
import { JobDocumentServices } from '../jobDocument.service';
import * as _ from 'underscore';
import { Message } from '../../../../../app.messages';
//import { ngfModule, ngf } from "angular-file"
import {BrowserModule, DomSanitizer} from '@angular/platform-browser'
declare const $: any

@Component({
  selector: '[pull-permit]',
  templateUrl:'./pullpermit.component.html'
})
export class PullPermitComponent {
  @Input() modalRef: BsModalRef
  @Input() idJob: number
  @Input() DocumentId?: number
  @Input() jobApp?: number
  @Input() permitID?: number
  @Input() reload: Function
  @Input() documentCode: string
  @Input() pullpermitData: any
  @Output() updatePermits? = new EventEmitter<any>();

  loading: boolean = false
  private errorMessage: any
  permitdata: any
  
  /**
  * viewAddressList add/edit form
  * @property viewAddressList
  */
 @ViewChild('viewAddressList',{static: true})
 
 private viewAddressList: TemplateRef<any>
 modalRefAddress: BsModalRef
 private pdflink: any
 private modalof: string

  constructor(
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private jobDocumentServices: JobDocumentServices,
    private sanitizer: DomSanitizer
  ) {
    this.errorMessage = this.message.msg;
  }

  ngOnInit() {

  }

  /**
  * This method will use to get data of selected pull permit request
  * @method permitSelected
  * @param {any} permit permit is an object of pull permit request which is selected
  */
  permitSelected(permit: any) {
    this.loading = true
    let sendPermit: any = {
      idJob: this.idJob,
      detailUrl: permit.detailUrl,
      numberDocType: permit.numberDocType
    }
    if (this.DocumentId != undefined) {
      sendPermit['idJobDocument'] = this.DocumentId;
    }
    if (this.documentCode == 'DOB') {
      sendPermit['idJobApplication'] = this.jobApp;
      this.jobDocumentServices.sendDOBSelectedPermit(sendPermit).subscribe(r => {
        if (r) {
          this.permitdata = r;
          this.modalof = 'ViewAddress';
          this.openModalAddressList(this.viewAddressList, this.permitdata);
        } else {
          this.toastr.info(this.errorMessage.permitNotExsits)
        }
        this.modalRef.hide()
        this.reload()
        this.loading = false
      }, e => {
        this.modalRef.hide()
        this.reload()
        this.loading = false
       })
    }
    if (this.documentCode != 'DOB') {
      this.jobDocumentServices.sendSelectedPermit(sendPermit).subscribe(r => {
        if (r && r.isPdfExist) {
          let nycUrl: any = r.jobDocumentUrl
          window.open(nycUrl, '_blank');
        } else {
          this.toastr.info(this.errorMessage.permitNotExsits)
        }
        this.modalRef.hide()
        this.reload()
        this.loading = false
      }, e => {
        this.modalRef.hide()
        this.reload()
        this.loading = false
      })
    }


  }
  updateData(data: any){
    console.log('updateData',data)
    this.loading = true;
    this.openModalAddressList(this.viewAddressList,data);
    this.loading = false;
  }

  varpmtPermitSelected(permit: any) {
    this.loading = true
    let sendPermit: any = {
      idJob: this.idJob,
      idJobDocument: this.DocumentId,
      detailUrl: permit.detailUrl,
      referenceNumber: permit.referenceNumber
    }
    this.jobDocumentServices.sendVARPMTSelectedPermit(sendPermit).subscribe(r => {
      if (r && r.isPdfExist) {
        let nycUrl: any = r.jobDocumentUrl
        window.open(nycUrl, '_blank');
      } else {
        this.toastr.info(this.errorMessage.permitNotExsits)
      }
      this.modalRef.hide()
      this.reload()
      this.loading = false
    }, e => {
      this.modalRef.hide()
      this.reload()
      this.loading = false
    })
  }



  /**
  * This method is used to open modal popup for openModalAddressList
  * @method openModalAddressList
  * @param {any} template type which contains template of create/edit module
  */

 downloadFile(url: any) {
   window.open(url, '_blank', 'toolbar=0,width=500,height=500');
  }

  /**
  * This method is used to open modal popup for openModalAddressList
  * @method openModalAddressList
  * @param {any} template type which contains template of create/edit module
  */
 private openModalAddressList(template: TemplateRef<any>, permitdata?: any) {
  this.permitdata = permitdata;
  this.modalRefAddress = this.modalService.show(template, { class: 'modal-address-list' })
}
  /**
    * This method will convert given string into title case
    * @method toTitleCase
    * @param {string} str request string 
    */
  toTitleCase(str: string) {
    if(str){
      return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    }else{
      return '-';
    }
    
  }
  /**
    * This method will convert given string into title case
    * @method updateDataFromPermitdetails
    * @param {string} permit request string 
    */
  updateFormFieldsFromGetInfo(permit: any) {
    this.loading = true;
    this.jobDocumentServices.savedates(permit).subscribe(r => {
      this.loading = false;
      this.toastr.success('Permit data updated successfully');
      this.updatePermits.emit(permit);
      this.modalRef.hide();
    }, e =>{
    this.modalRef.hide();
    });
  }
}







