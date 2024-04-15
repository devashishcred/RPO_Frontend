import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { JobContactTypesServices } from '../jobcontacttypes.services';
import { JobContactTypes } from '../jobcontacttypes';
import { Message } from "../../../app.messages";
import { EmployeeServices } from '../../employee/employee.services';

declare const $: any
/**
*  This component contains all function that are used in JobContactTypesForm
* @class JobContactTypesForm
*/
@Component({
  selector: '[add-jobcontact-types]',
  templateUrl: './jobcontacttypesform.component.html',
  styleUrls: ['./jobcontacttypesform.component.scss']
})
export class JobContactTypesForm implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() JobContactTypesId: number

  JobContactTypes: JobContactTypes
  loading: boolean = false
  errorMsg: any
  private dropdownSettings: any = {};

  private employees: any = []
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private JobContactTypesServices: JobContactTypesServices,
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

    this.JobContactTypes = {} as JobContactTypes
    this.loading = true
    if (!this.isNew && this.JobContactTypesId && this.JobContactTypesId > 0) {
      this.JobContactTypesServices.getById(this.JobContactTypesId).subscribe(r => {
        this.JobContactTypes = r
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
  * @method saveJobContactTypes
  */
  saveJobContactTypes() {
    this.loading = true
    if (this.isNew) {
      this.JobContactTypesServices.create(this.JobContactTypes).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.JobContactTypesServices.update(this.JobContactTypes.id, this.JobContactTypes).subscribe(r => {
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