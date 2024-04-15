import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { EmailtypeServices } from '../emailtype.services';
import { EmailType } from '../emailtype';
import { Message } from "../../../app.messages";
import { EmployeeServices } from '../../employee/employee.services';
import { constantValues } from '../../../app.constantValues';

declare const $: any

/**
 *  This component contains all function that are used in EmailtypeformComponent
 * @class EmailtypeformComponent
 */
@Component({
  selector: '[add-email-type]',
  templateUrl: './emailtypeform.component.html',
  styleUrls: ['./emailtypeform.component.scss']
})
export class EmailtypeformComponent implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() emailTypeId: number

  emailType: EmailType
  configuration: any;
  loading: boolean = false
  errorMsg: any
  dropdownSettings: any = {};
  showEmailType: boolean = false
  employees: any = []
  selectedDefaultCC: any = []

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private emailtypeServices: EmailtypeServices,
    private employeeServices: EmployeeServices,
    private constantValues: constantValues,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.constantValues.CKEDITORCONFIGSETTING.autoparagraph = true
    this.configuration = this.constantValues.CKEDITORCONFIGSETTING;
    this.dropdownSettings = {
      singleSelection: false,
      text: "Select Email",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      badgeShowLimit: 1,
      tagToBody: false

    };

    this.emailType = {} as EmailType
    this.emailType.isCompany = true
    this.emailType.isContact = true
    this.emailType.isRfp = true
    this.emailType.isJob = true
    this.emailType.emailBody = "Enter default message here"
    this.loading = true

    this.employeeServices.getEmpDropdown().subscribe(r => {
      this.employees = r


      if (!this.isNew && this.emailTypeId && this.emailTypeId > 0) {
        this.loading = true;
        this.emailtypeServices.getById(this.emailTypeId).subscribe(r => {
          this.emailType = r
          if (this.emailType.defaultCC.length > 0) {
            this.emailType.defaultCC.forEach((data: any) => {
              let selected = this.employees.filter((x: any) => x.id == data.idEmployee)[0]
              if (selected) {
                this.selectedDefaultCC.push({"id": selected.idEmployee, "itemName": selected.itemName})
              }
            })
          }
          setTimeout(() => {
            this.loading = false
          }, 1000)

        }, e => {
          this.loading = false
        })
      } else {
        this.loading = false
      }
    }, e => {
      this.loading = false
    })
  }

  /**
   * This method is used to save record
   * @method saveEmailType
   */
  saveEmailType() {
    this.loading = true
    this.emailType.defaultCC = []
    if (this.selectedDefaultCC.length > 0) {

      for (var i = 0; i < this.selectedDefaultCC.length; i++) {
        if (this.selectedDefaultCC[i].idEmployee) {
          this.emailType.defaultCC.push({
            "idEmployee": this.selectedDefaultCC[i].idEmployee,
            "itemName": this.selectedDefaultCC[i].itemName
          })
        } else {
          this.emailType.defaultCC.push({
            "idEmployee": this.selectedDefaultCC[i].id,
            "itemName": this.selectedDefaultCC[i].itemName
          })
        }

      }
    }
    if (this.isNew) {
      this.emailtypeServices.create(this.emailType).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.emailtypeServices.update(this.emailType.id, this.emailType).subscribe(r => {
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
   * This method is used to check email type
   * @method checkEmailType
   */

  checkEmailType(event) {
    if (!this.emailType.isCompany && !this.emailType.isContact && !this.emailType.isRfp && !this.emailType.isJob) {
      this.showEmailType = true
    } else {
      this.showEmailType = false
    }

  }


  /**
   *  Get selected item from dropdown
   * @method onItemSelect
   */
  onItemSelect(item: any) {

  }

  /**
   *  Deselect item from dropdown
   * @method OnItemDeSelect
   */
  OnItemDeSelect(item: any) {

  }

  /**
   *  all items are selected from dropdown
   * @method onSelectAll
   */
  onSelectAll(items: any) {

  }


  /**
   *  all items are deselected from dropdown
   * @method onDeSelectAll
   */
  onDeSelectAll(items: any) {

  }

}