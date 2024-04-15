import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { SeismicDesignCategoriesServices } from '../seismicdesigncategories.services';
import { SeismicDesignCategories } from '../seismicdesigncategories';
import { Message } from "../../../app.messages";
import { EmployeeServices } from '../../employee/employee.services';

declare const $: any
/**
*  This component contains all function that are used in SeismicDesignCategoriesForm
* @class SeismicDesignCategoriesForm
*/
@Component({
  selector: '[add-seismicdesign-categories]',
  templateUrl: './seismicdesigncategoriesform.component.html',
  styleUrls: ['./seismicdesigncategoriesform.component.scss']
})
export class SeismicDesignCategoriesForm implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() SeismicDesignCategoriesId: number

  SeismicDesignCategories: SeismicDesignCategories
  loading: boolean = false
  errorMsg: any
  private dropdownSettings: any = {};

  private employees: any = []
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private SeismicDesignCategoriesServices: SeismicDesignCategoriesServices,
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

    this.SeismicDesignCategories = {} as SeismicDesignCategories
    this.loading = true
    
   
    if (!this.isNew && this.SeismicDesignCategoriesId && this.SeismicDesignCategoriesId > 0) {
      this.SeismicDesignCategoriesServices.getById(this.SeismicDesignCategoriesId).subscribe(r => {
        this.SeismicDesignCategories = r
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
  * @method saveSeismicDesign
  */
  saveSeismicDesign() {
    this.loading = true
    if (this.isNew) {
      this.SeismicDesignCategoriesServices.create(this.SeismicDesignCategories).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.SeismicDesignCategoriesServices.update(this.SeismicDesignCategories.id, this.SeismicDesignCategories).subscribe(r => {
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