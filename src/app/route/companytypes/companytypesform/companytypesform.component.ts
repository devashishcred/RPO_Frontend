import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { CompanyTypesServices } from '../companytypes.services';
import { CompanyTypes } from '../companytypes';
import { Message } from "../../../app.messages";
import { EmployeeServices } from '../../employee/employee.services';

declare const $: any
/**
*  This component contains all function that are used in CompanyTypesForm
* @class CompanyTypesForm
*/
@Component({
  selector: '[add-company-types]',
  templateUrl: './companytypesform.component.html',
  styleUrls: ['./companytypesform.component.scss']
})
export class CompanyTypesForm implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() CompanyTypesId: number

  CompanyTypes: CompanyTypes
  loading: boolean = false
  errorMsg: any
  private dropdownSettings: any = {};

  private employees: any = []
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private CompanyTypesServices: CompanyTypesServices,
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

    this.CompanyTypes = {} as CompanyTypes
    this.loading = true
    
   
    if (!this.isNew && this.CompanyTypesId && this.CompanyTypesId > 0) {
      this.CompanyTypesServices.getById(this.CompanyTypesId).subscribe(r => {
        this.CompanyTypes = r
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
  * @method saveCompanyTypes
    */
  saveCompanyTypes() {
    this.loading = true
   
    if (this.isNew) {
      this.CompanyTypesServices.create(this.CompanyTypes).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.CompanyTypesServices.update(this.CompanyTypes.id, this.CompanyTypes).subscribe(r => {
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