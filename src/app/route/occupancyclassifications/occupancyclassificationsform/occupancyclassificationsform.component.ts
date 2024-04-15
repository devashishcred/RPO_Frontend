import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { OccupancyClassificationsServices } from '../occupancyclassifications.component.services';
import { OccupancyClassifications } from '../occupancyclassifications';
import { Message } from "../../../app.messages";


declare const $: any
/**
* This component contains all function that are used in OccupancyClassificationsForm 
* @class OccupancyClassificationsForm
*/

@Component({
  selector: '[add-occupancy-classifications]',
  templateUrl: './occupancyclassificationsform.component.html',
  styleUrls: ['./occupancyclassificationsform.component.scss']
})
export class OccupancyClassificationsForm implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() classificationId: number

  occupancyClassifications: any
  loading: boolean = false
  errorMsg: any
  private dropdownSettings: any = {};

  private employees: any = []
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private occupancyClassificationsServices: OccupancyClassificationsServices,
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

    this.occupancyClassifications = {} as OccupancyClassifications
    this.occupancyClassifications.is_2008_2014 = 0
    this.loading = true


    if (!this.isNew && this.classificationId && this.classificationId > 0) {
      this.occupancyClassificationsServices.getById(this.classificationId).subscribe(r => {
        this.occupancyClassifications = r
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
  * @method saveOccupancy
  * @param {data} type request Object
  */
  saveOccupancy() {
    this.loading = true
    if (this.isNew) {
      this.occupancyClassificationsServices.create(this.occupancyClassifications).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')

        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.occupancyClassificationsServices.update(this.occupancyClassifications.id, this.occupancyClassifications).subscribe(r => {
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