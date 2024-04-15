import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { CompanyLicenseTypesServices } from '../companyLicensetypes.services';
import { LicenseTypes } from '../companyLicensetypes';
import { Message } from "../../../app.messages";
import { EmployeeServices } from '../../employee/employee.services';

declare const $: any
/**
*  This component contains all function that are used in LicenseTypesForm
* @class LicenseTypesForm
*/
@Component({
  selector: '[add-Company-License-types]',
  templateUrl: './companyLicensetypes.component.html',
  styleUrls: ['./companyLicensetypes.component.scss']
})
export class CompanyLicenseTypesForm implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() LicenseTypesId: number

  LicenseTypes: LicenseTypes
  loading: boolean = false
  errorMsg: any
  private dropdownSettings: any = {};

  private employees: any = []
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private LicenseTypesServices: CompanyLicenseTypesServices,
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

    this.LicenseTypes = {} as LicenseTypes
    this.loading = true
    
   
    if (!this.isNew && this.LicenseTypesId && this.LicenseTypesId > 0) {
      this.LicenseTypesServices.getById(this.LicenseTypesId).subscribe(r => {
        this.LicenseTypes = r
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
  * @method saveLicenseType
  */
  saveLicenseType() {
    this.loading = true
    if (this.isNew) {
      this.LicenseTypesServices.create(this.LicenseTypes).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.LicenseTypesServices.update(this.LicenseTypes.id, this.LicenseTypes).subscribe(r => {
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