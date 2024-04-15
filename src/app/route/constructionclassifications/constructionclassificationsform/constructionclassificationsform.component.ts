import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { ConstructionClassificationsServices } from '../constructionclassifications.services';
import { constructionClassifications } from '../../../types/classifications';
import { Message } from "../../../app.messages";
import { EmployeeServices } from '../../employee/employee.services';

declare const $: any
/**
*  This component contains all function that are used in ConstructionClassificationsForm
* @class ConstructionClassificationsForm
*/
@Component({
  selector: '[add-construction-classifications]',
  templateUrl: './constructionclassificationsform.component.html',
  styleUrls: ['./constructionclassificationsform.component.scss']
})
export class ConstructionClassificationsForm implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() ConstructionClassificationsId: number

  ConstructionClassifications: any
  loading: boolean = false
  errorMsg: any
  private dropdownSettings: any = {};

  private employees: any = []
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private ConstructionClassificationsServices: ConstructionClassificationsServices,
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

    this.ConstructionClassifications = {} as constructionClassifications
    this.ConstructionClassifications.is_2008_2014 = 0
    this.loading = true


    if (!this.isNew && this.ConstructionClassificationsId && this.ConstructionClassificationsId > 0) {
      this.ConstructionClassificationsServices.getById(this.ConstructionClassificationsId).subscribe(r => {
        this.ConstructionClassifications = r
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
  * @method saveConstruction
  */
  saveConstruction() {
    this.loading = true

    if (this.isNew) {
      this.ConstructionClassificationsServices.create(this.ConstructionClassifications).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.ConstructionClassificationsServices.update(this.ConstructionClassifications.id, this.ConstructionClassifications).subscribe(r => {
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