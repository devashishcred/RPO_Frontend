import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { SentviaServices } from '../sentvia.services';
import { Sentvia } from '../sentvia';
import { Message } from "../../../app.messages";
import { EmployeeServices } from '../../employee/employee.services';

declare const $: any
/**
*  This component contains all function that are used in SentviaformComponent
* @class SentviaformComponent
*/
@Component({
  selector: '[add-sent-via]',
  templateUrl: './sentviaform.component.html',
  styleUrls: ['./sentviaform.component.scss']
})
export class SentviaformComponent implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() sentViaId: number

  sentVia: Sentvia
  loading: boolean = false
  errorMsg: any
  private dropdownSettings: any = {};
  private selectedDefaultCC: any = []
  private employees: any = []
  private selectedCC: boolean = false
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private sentviaServices: SentviaServices,
    private employeeServices: EmployeeServices,
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

    this.sentVia = {} as Sentvia
    this.loading = true
    this.sentVia.isSendEmail = false
    this.getSentVia()
  }

  /**
  * This method is used to get sentvia record
  * @method getSentVia
  */
  getSentVia() {
    if (!this.isNew && this.sentViaId && this.sentViaId > 0) {
      this.sentviaServices.getById(this.sentViaId).subscribe(r => {
        this.sentVia = r
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
  saveSentvia() {
    this.loading = true
    this.sentVia.defaultCC = []

    if (this.isNew) {
      this.sentviaServices.create(this.sentVia).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.sentviaServices.update(this.sentVia.id, this.sentVia).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record updated successfully');
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }

  /**
  *  Get selected item from dropdown
  * @method onItemSelect
  */
  onItemSelect(item: any) {
    this.isSendMailRecipient()
  }

  /**
 *  Deselect item from dropdown
 * @method OnItemDeSelect
 */
  OnItemDeSelect(item: any) {
    this.isSendMailRecipient()
  }

  /**
 *  all items are selected from dropdown
 * @method onSelectAll
 */
  onSelectAll(items: any) {
    this.isSendMailRecipient()
  }


  /**
 *  all items are deselected from dropdown
 * @method onDeSelectAll
 */
  onDeSelectAll(items: any) {
    this.isSendMailRecipient()
  }

  /**
   *  check whether mail is to be send to recipient
   * @method isSendMailRecipient
   */
  isSendMailRecipient() {
    this.selectedCC = false
    if (this.sentVia.isSendEmail && this.sentVia.isSendEmail == true) {
      if (this.selectedDefaultCC.length < 1) {
        this.selectedCC = true
      } else {
        this.selectedCC = false
      }
    }
  }
}