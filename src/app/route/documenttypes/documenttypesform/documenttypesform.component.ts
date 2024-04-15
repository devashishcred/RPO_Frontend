import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { DocumentTypesServices } from '../documenttypes.services';
import { DocumentTypes } from '../documenttypes';
import { Message } from "../../../app.messages";
import { EmployeeServices } from '../../employee/employee.services';

declare const $: any
/**
*  This component contains all function that are used in DocumentTypesForm
* @class DocumentTypesForm
*/
@Component({
  selector: '[add-document-types]',
  templateUrl: './documenttypesform.component.html',
  styleUrls: ['./documenttypesform.component.scss']
})
export class DocumentTypesForm implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() DocumentTypesId: number

  DocumentTypes: DocumentTypes
  loading: boolean = false
  errorMsg: any
  private dropdownSettings: any = {};

  private employees: any = []
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private DocumentTypesServices: DocumentTypesServices,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    this.dropdownSettings = {
      singleSelection: false,
      text: "Employees",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class"
    };

    this.DocumentTypes = {} as DocumentTypes
    this.loading = true
    
   
    if (!this.isNew && this.DocumentTypesId && this.DocumentTypesId > 0) {
      this.DocumentTypesServices.getById(this.DocumentTypesId).subscribe(r => {
        this.DocumentTypes = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.loading = false
    }
  }

  /**
  * This method is used to save record
  * @method saveDocumentType
  */
  saveDocumentType() {
    this.loading = true
   
    if (this.isNew) {
      this.DocumentTypesServices.create(this.DocumentTypes).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully.')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.DocumentTypesServices.update(this.DocumentTypes.id, this.DocumentTypes).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record updated successfully.');
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }

 
}