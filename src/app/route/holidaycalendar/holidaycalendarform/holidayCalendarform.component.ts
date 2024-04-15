import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { HolidayCalendarServices } from '../holidayCalendar.services';
import { HolidayCalendar } from '../holidayCalendar';
import { Message } from "../../../app.messages";
import { EmployeeServices } from '../../employee/employee.services';

declare const $: any

/**
* This component contains all function that are used in Holiday Calendar Form
* @class HolidayCalendarForm
*/
@Component({
  selector: '[add-holiday-calendar]',
  templateUrl: './holidayCalendarform.component.html',
})
export class HolidayCalendarForm implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() holidayId: number

  holidayCalendar: HolidayCalendar
  loading: boolean = false
  errorMsg: any
  private dropdownSettings: any = {};

  private employees: any = []
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private holidayCalendarServices: HolidayCalendarServices,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
  
    this.holidayCalendar = {} as HolidayCalendar
    this.loading = true
    
   
    if (!this.isNew && this.holidayId && this.holidayId > 0) {
      this.holidayCalendarServices.getById(this.holidayId).subscribe(r => {
        this.holidayCalendar = r
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
  * @method saveHoldiay
  */
  saveHoldiay() {
    this.loading = true
    
    if (this.isNew) {
      this.holidayCalendarServices.create(this.holidayCalendar).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.holidayCalendarServices.update(this.holidayCalendar.id, this.holidayCalendar).subscribe(r => {
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