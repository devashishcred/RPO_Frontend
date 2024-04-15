import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { JobTimenoteCategoriesServices } from '../jobtimenotecategories.services';
import { JobTimenoteCategories } from '../jobtimenotecategories';
import { Message } from "../../../app.messages";
import { EmployeeServices } from '../../employee/employee.services';

declare const $: any

/**
* This component contains all function that are used in Job Timenote Categories Form
* @class JobTimenoteCategoriesForm
*/
@Component({
  selector: '[add-jobtimenote-categories]',
  templateUrl: './jobtimenotecategoriesform.component.html',
  styleUrls: ['./jobtimenotecategoriesform.component.scss']
})
export class JobTimenoteCategoriesForm implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() JobTimenoteCategoriesId: number

  JobTimenoteCategories: JobTimenoteCategories
  loading: boolean = false
  errorMsg: any
  private dropdownSettings: any = {};

  private employees: any = []
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private JobTimenoteCategoriesServices: JobTimenoteCategoriesServices,
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

    this.JobTimenoteCategories = {} as JobTimenoteCategories
    this.loading = true
    
   
    if (!this.isNew && this.JobTimenoteCategoriesId && this.JobTimenoteCategoriesId > 0) {
      this.JobTimenoteCategoriesServices.getById(this.JobTimenoteCategoriesId).subscribe(r => {
        this.JobTimenoteCategories = r
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
  * @method saveTimeNoteCategory
  */
  saveTimeNoteCategory() {
    this.loading = true
    if (this.isNew) {
      this.JobTimenoteCategoriesServices.create(this.JobTimenoteCategories).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.JobTimenoteCategoriesServices.update(this.JobTimenoteCategories.id, this.JobTimenoteCategories).subscribe(r => {
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