import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { StatesServices } from '../states.services';
import { States } from '../states';
import { Message } from "../../../app.messages";
import { EmployeeServices } from '../../employee/employee.services';

declare const $: any

@Component({
  selector: '[add-state]',
  templateUrl: './statesform.component.html',
  styleUrls: ['./statesform.component.scss']
})
/**
* This component contains all function that are used in StatesForm
* @class StatesForm
*/
export class StatesForm implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() StatesId: number

  States: States
  loading: boolean = false
  errorMsg: any
  private dropdownSettings: any = {};

  private employees: any = []
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private StatesServices: StatesServices,
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

    this.States = {} as States
    this.loading = true
    
   
    if (!this.isNew && this.StatesId && this.StatesId > 0) {
      this.StatesServices.getById(this.StatesId).subscribe(r => {
        this.States = r
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
  * @method save
  */
  saveStates() {
    this.loading = true
    if (this.isNew) {
      this.StatesServices.create(this.States).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.StatesServices.update(this.States.id, this.States).subscribe(r => {
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