import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { DwellingClassificationServices } from '../dwellingclassification.services';
import { DwellingClassification } from '../dwellingclassification';
import { Message } from "../../../app.messages";
import { EmployeeServices } from '../../employee/employee.services';

declare const $: any

/**
* This component contains all function that are used in DwellingClassificationForm
* @class DwellingClassificationForm
*/
@Component({
  selector: '[add-dwelling-classification]',
  templateUrl: './dwellingclassificationform.component.html',
  styleUrls: ['./dwellingclassificationform.component.scss']
})
export class DwellingClassificationForm implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() dwellingclassificationId: number

  dwellingClassification: DwellingClassification
  loading: boolean = false
  errorMsg: any
  private dropdownSettings: any = {};

  private employees: any = []
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private dwellingClassificationServices: DwellingClassificationServices,
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

    this.dwellingClassification = {} as DwellingClassification
    this.loading = true
    
   
    if (!this.isNew && this.dwellingclassificationId && this.dwellingclassificationId > 0) {
      this.dwellingClassificationServices.getById(this.dwellingclassificationId).subscribe(r => {
        this.dwellingClassification = r
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
  * @method saveDwelling
  */
  saveDwelling() {
    this.loading = true
    
    if (this.isNew) {
      this.dwellingClassificationServices.create(this.dwellingClassification).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.dwellingClassificationServices.update(this.dwellingClassification.id, this.dwellingClassification).subscribe(r => {
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