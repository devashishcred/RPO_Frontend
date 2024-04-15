import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { CompanyTaxTypesServices } from '../companytaxtypes.services';
import { CompanyTaxTypes } from '../companytaxtypes';
import { Message } from "../../../app.messages";
import { EmployeeServices } from '../../employee/employee.services';

declare const $: any

/**
* This component contains all function that are used in Company Tax Types
* @class CompanyTaxTypesForm
*/
@Component({
  selector: '[add-companytax-types]',
  templateUrl: './companytaxtypesform.component.html',
  styleUrls: ['./companytaxtypesform.component.scss']
})
export class CompanyTaxTypesForm implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() CompanyTaxTypesId: number

  CompanyTaxTypes: CompanyTaxTypes
  loading: boolean = false
  errorMsg: any
  private dropdownSettings: any = {};

  private employees: any = []
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private CompanyTaxTypesServices: CompanyTaxTypesServices,
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

    this.CompanyTaxTypes = {} as CompanyTaxTypes
    this.loading = true
    
   
    if (!this.isNew && this.CompanyTaxTypesId && this.CompanyTaxTypesId > 0) {
      this.CompanyTaxTypesServices.getById(this.CompanyTaxTypesId).subscribe(r => {
        this.CompanyTaxTypes = r
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
  * @method saveCompanyTax
  */
  saveCompanyTax() {
    this.loading = true
    if (this.isNew) {
      this.CompanyTaxTypesServices.create(this.CompanyTaxTypes).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.CompanyTaxTypesServices.update(this.CompanyTaxTypes.id, this.CompanyTaxTypes).subscribe(r => {
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