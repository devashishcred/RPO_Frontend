import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { DepCostSettingServices } from '../depCostSetting.services';
import { DepCostSetting } from '../depCostSetting';
import { Message } from "../../../app.messages";
import { EmployeeServices } from '../../employee/employee.services';

declare const $: any
/**
* This component contains all function that are used in Dep Cost Setting Form
* @class DepCostSettingForm
*/
@Component({
  selector: '[add-dep-cost]',
  templateUrl: './depCostSettingform.component.html',
})
export class DepCostSettingForm implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() depCostSetttingId: number

  DepCostSetting: DepCostSetting
  loading: boolean = false
  errorMsg: any
  private dropdownSettings: any = {};

  private employees: any = []
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private depCostSettingServices: DepCostSettingServices,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {

    this.DepCostSetting = {} as any
    this.loading = true


    if (!this.isNew && this.depCostSetttingId && this.depCostSetttingId > 0) {
      this.depCostSettingServices.getById(this.depCostSetttingId).subscribe(r => {
        this.DepCostSetting = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.loading = false
    }
  }

  /**
     * This method check given data is number or not
     * @method isNumber
     * @param {any} evt event object
     */
  isNumber(evt: any) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  /**
  * This method check given data is decimal or not
  * @method isDecimal
  * @param {any} evt event object
  */
  isDecimal(evt: any) {
    //getting key code of pressed key
    var keycode = (evt.which) ? evt.which : evt.keyCode;
    //comparing pressed keycodes
    if (!(keycode == 8 || keycode == 46) && (keycode < 48 || keycode > 57)) {
      return false;
    }
    else {
      var parts = evt.srcElement.value.split('.');
      if (parts.length > 1 && keycode == 46)
        return false;
      return true;
    }
  }

  /**
  * This method is used to save record
  * @method saveDEPCost
  */
  saveDEPCost() {
    this.loading = true
    
    if (this.isNew) {
      this.depCostSettingServices.create(this.DepCostSetting).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.depCostSettingServices.update(this.DepCostSetting.id, this.DepCostSetting).subscribe(r => {
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