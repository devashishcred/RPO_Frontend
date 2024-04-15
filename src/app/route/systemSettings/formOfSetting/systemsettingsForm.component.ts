import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'underscore';
import * as moment from 'moment';
import { Message } from '../../../app.messages';
import { constantValues } from '../../../app.constantValues';
import { SystemSettingsServices } from '../systemsettings.services'
import { SystemField } from '../../../types/systemsettings';
import { EmployeeServices } from '../../employee/employee.services';
import { Employee } from '../../../types/employee';

declare const $: any

/**
 *  This component contains all function that are used in SettingType
 * @class SettingType
 */
@Component({
  selector: '[settings-type]',
  templateUrl: './systemsettingsForm.component.html'
})

export class SettingType implements OnInit {
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() SettingId: number
  dropdownSettings: any = {};
  errorMessage: any
  loading: boolean = false
  settingType: any;
  ListOfEmployeeEmails: Employee[] = []
  private SelectedEmails: Employee[] = []

  constructor(
    private toastr: ToastrService,
    private message: Message,
    private constantValues: constantValues,
    private SystemSettingsServices: SystemSettingsServices,
    private employeeService: EmployeeServices,
  ) {
    this.errorMessage = this.message.msg;
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.settingType = {} as SystemField
    this.dropdownSettings = {
      singleSelection: false,
      text: "Select Employee",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: true,
      badgeShowLimit: 1,
      classes: "myclass custom-class",
      tagToBody: false
    };
    this.loading = true
    this.SystemSettingsServices.getById(this.SettingId).subscribe(res => {
      this.settingType = res
      this.loading = false
    }, e => {
      this.loading = false
    })
    this.getEmployee();
  }

  /**
   * This method is used to get all employess
   * @method getEmployee
   */
  private getEmployee() {
    this.employeeService.getEmpDropdown().subscribe(res => {
      this.ListOfEmployeeEmails = _.sortBy(res, "itemName");
    })
  }

  /**
   * This method is used to save record
   * @method saveSetting
   */
  saveSetting() {
    if (this.settingType.value.length > 0) {
      this.SelectedEmails = this.settingType.value;
      this.settingType.value = []
      this.SelectedEmails.forEach((element: any) => {
        this.settingType.value.push(element.id)
      });
    } else {
      this.settingType.value = [];
    }
    this.loading = true
    this.SystemSettingsServices.updateSettings(this.SettingId, this.settingType).subscribe(r => {
      this.reload()
      this.modalRef.hide()
      this.toastr.success('System Settings updated successfully.');
      this.loading = false
    }, e => {
      this.loading = false
    })
  }

}