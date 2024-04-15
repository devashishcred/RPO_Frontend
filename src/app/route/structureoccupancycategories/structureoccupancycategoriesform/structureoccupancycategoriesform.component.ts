import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { StructureOccupancyCategoriesServices } from '../structureoccupancycategories.services';
import { StructureOccupancyCategories } from '../structureoccupancycategories';
import { Message } from "../../../app.messages";
import { EmployeeServices } from '../../employee/employee.services';

declare const $: any
/**
*  This component contains all function that are used in StructureOccupancyCategoriesForm
* @class StructureOccupancyCategoriesForm
*/
@Component({
  selector: '[add-structureoccupancy-categories]',
  templateUrl: './structureoccupancycategoriesform.component.html',
  styleUrls: ['./structureoccupancycategoriesform.component.scss']
})
export class StructureOccupancyCategoriesForm implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() StructureOccupancyCategoriesId: number

   StructureOccupancyCategories: StructureOccupancyCategories
  loading: boolean = false
   errorMsg: any
  private dropdownSettings: any = {};

  private employees: any = []
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private StructureOccupancyCategoriesServices: StructureOccupancyCategoriesServices,
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

    this.StructureOccupancyCategories = {} as StructureOccupancyCategories
    this.loading = true
    
   
    if (!this.isNew && this.StructureOccupancyCategoriesId && this.StructureOccupancyCategoriesId > 0) {
      this.StructureOccupancyCategoriesServices.getById(this.StructureOccupancyCategoriesId).subscribe(r => {
        this.StructureOccupancyCategories = r
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
  * @method saveStructure
  */
  saveStructure() {
    this.loading = true
    if (this.isNew) {
      this.StructureOccupancyCategoriesServices.create(this.StructureOccupancyCategories).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.StructureOccupancyCategoriesServices.update(this.StructureOccupancyCategories.id, this.StructureOccupancyCategories).subscribe(r => {
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