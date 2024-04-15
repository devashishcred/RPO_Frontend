import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { PrimaryStructuralSystemsServices } from '../primarystructuralsystems.services';
import { PrimaryStructuralSystems } from '../primarystructuralsystems';
import { Message } from "../../../app.messages";
import { EmployeeServices } from '../../employee/employee.services';

declare const $: any
/**
* This component contains all function that are used in PrimaryStructuralSystemsForm
* @class PrimaryStructuralSystemsForm
*/
@Component({
  selector: '[add-primarystructural-systems]',
  templateUrl: './primarystructuralsystemsform.component.html',
  styleUrls: ['./primarystructuralsystemsform.component.scss']
})
export class PrimaryStructuralSystemsForm implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() PrimaryStructuralSystemsId: number

  PrimaryStructuralSystems: PrimaryStructuralSystems
  loading: boolean = false
  errorMsg: any
  private dropdownSettings: any = {};

  private employees: any = []
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private PrimaryStructuralSystemsServices: PrimaryStructuralSystemsServices,
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

    this.PrimaryStructuralSystems = {} as PrimaryStructuralSystems
    this.loading = true
    
   
    if (!this.isNew && this.PrimaryStructuralSystemsId && this.PrimaryStructuralSystemsId > 0) {
      this.PrimaryStructuralSystemsServices.getById(this.PrimaryStructuralSystemsId).subscribe(r => {
        this.PrimaryStructuralSystems = r
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
  savePrimaryStructure() {
    this.loading = true
    if (this.isNew) {
      this.PrimaryStructuralSystemsServices.create(this.PrimaryStructuralSystems).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.PrimaryStructuralSystemsServices.update(this.PrimaryStructuralSystems.id, this.PrimaryStructuralSystems).subscribe(r => {
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