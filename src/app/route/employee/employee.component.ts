import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { cloneDeep, intersectionBy } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { assign, identity, pickBy } from 'lodash';

import { AppComponent } from '../../app.component';
import { CityServices } from '../../services/city.services';
import { DocumentTypeServices } from '../../services/documentType.Services';
import { GroupServices } from '../../services/group.services';
import { StateServices } from '../../services/state.services';
import { City } from '../../types/city';
import { AgentCertificate, DocumentType, Employee, EmployeeDocument } from '../../types/employee';
import { Group } from '../../types/group';
import { State } from '../../types/state';
import { arrayBufferToBase64, downloadFile } from '../../utils/utils';
import { EmployeeServices } from './employee.services';
import { Message } from '../../app.messages';
import { SelectModule } from 'angular2-select';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';
import * as _ from 'underscore';

declare const $: any

/**
 * This component contains all function that are used in EmployeeComponent
 * @class EmployeeComponent
 */
@Component({
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
})
export class EmployeeComponent implements OnInit, OnDestroy {

  /**
   *  formEmployeeTpl add/edit form
   * @property formEmployeeTpl
   */
  @ViewChild('formEmployeeTpl', {static: true}) private formEmployeeTpl: TemplateRef<any>

  /**
   *  changePasswordTpl add/edit form
   * @property changePasswordTpl
   */
  @ViewChild('changePasswordTpl', {static: true}) private changePasswordTpl: TemplateRef<any>

  /**
   *  permissionsTpl add/edit form
   * @property permissionsTpl
   */
  @ViewChild('permissionsTpl', {static: true}) private permissionsTpl: TemplateRef<any>

  /**
   *  permissionUsergroup add/edit form
   * @property permissionUsergroup
   */
  @ViewChild('permissionUsergroup', {static: true}) private permissionUsergroup: TemplateRef<any>

  loading: boolean = false
  private selectUndefinedOptionValue: any

  //Button show hide
  showEmpAddBtn: string = 'hide'
  private showEmpEditBtn: string = 'hide'
  private showEmpDeleteBtn: string = 'hide'
  VIEWCONTACTINFO: string;
  EDITCONTACTINFO: string;
  VIEWPERSONALINFORMATION: string;
  EDITPERSONALINFORMATION: string;
  VIEWAGENTCERTIFICATES: string;
  EDITAGENTCERTIFICATES: string;
  VIEWSYSTEMACCESSINFORMATION: string;
  EDITSYSTEMACCESSINFORMATION: string;
  VIEWDOCUMENTS: string;
  EDITDOCUMENTS: string;
  VIEWEMERGENCYCONTACTINFO: string;
  EDITEMERGENCYCONTACTINFO: string;
  VIEWPHONEINFO: string;
  EDITPHONEINFO: string;
  EDITSTATUS: string;
  ViewEmployee: boolean = false;

  private userAccessRight: any = {}
  private dobWrong: any = moment().format("MM/DD/YYYY");
  private rows: any = [
    {id: 1, desc: 'Employee', prop: 'all'},
    {id: 2, desc: 'Employee Info', prop: 'employeeEmployeeInfo', prnt: 1},
    {id: 3, desc: 'Contact Info', prop: 'employeeContactInfo', prnt: 1},
    {id: 4, desc: 'Personal Information', prop: 'employeePersonalInfo', prnt: 1},
    {id: 5, desc: 'Agent Certificates', prop: 'employeeAgentCertificates', prnt: 1},
    {id: 6, desc: 'System Access Information', prop: 'employeeSystemAccessInformation', prnt: 1},
    {id: 7, desc: 'User Group', prop: 'employeeUserGroup', prnt: 1},
    {id: 8, desc: 'Document(s)', prop: 'employeeDocuments', prnt: 1},
    {id: 9, desc: 'Status', prop: 'employeeStatus', prnt: 1},
    {id: 10, desc: 'Company', prop: 'company'},
    {id: 11, desc: 'Contacts', prop: 'contacts'},
    {id: 12, desc: 'RFP', prop: 'rfp'},
    {id: 13, desc: 'Jobs', prop: 'jobs'},
    {id: 14, desc: 'Tasks', prop: 'tasks'},
    {id: 15, desc: 'Reports', prop: 'reports'},
    {id: 16, desc: 'Reference Links', prop: 'referenceLinks'},
    {id: 17, desc: 'Reference Documents', prop: 'referenceDocuments'},
    {id: 18, desc: 'User Group', prop: 'userGroup'},
    {id: 19, desc: 'Masters', prop: 'masters'}
  ]

  modalRef: BsModalRef

  new: boolean = true

  rec: Employee
  agentCertificate: AgentCertificate
  private idxAgentCertificate: number = -1

  private table: any
  private specialColumn: any
  private actionRow: any
  actionFormData: any
  private activeGroup: any = [];
  private activeState: any = [];

  private cities: City[] = []
  states: State[] = []
  documentTypes: DocumentType[] = []
  private documentTypesDrp: any = [];
  groups: Group[] = []
  groupsDrp: any = [];
  select2error: boolean = false

  ssnType: string = 'password'
  dobType: string = 'password'
  telephonePasswordType: string = 'password'
  computerPasswordType: string = 'password'
  efillingPasswordType: string = 'password'
  applicationPasswordType: string = 'password'
  lockScreenPasswordType: string = 'password'
  applePasswordType: string = 'password'
  pin: string = 'password'
  errorMessage: any

  itemList: any = [];
  selectedItems: any = [];
  settings: any = {};

  private groupsName: any = [];
  private statesName: any = [];

  private value: any = {};
  private _disabledV: string = '0';
  private disabled: boolean = false;
  isRequiredCertificate: boolean = false;
  isRequiredCertificateId: boolean = false;
  private active: any = {}
  private documents: any
  filterList: any
  filter: any = {}
  private empPermission: any = []
  private jobPermission: any = []
  private otherPermission: any = []
  private permission: any = []
  empId: number
  allergyTypes = [
    {id: 1, itemName: "Yes"},
    {id: 2, itemName: "None"},
    {id: 3, itemName: "None Provided"}
  ]
  private allergy: any

  private get disabledV(): string {
    return this._disabledV;
  }

  private set disabledV(value: string) {
    this._disabledV = value;
    this.disabled = this._disabledV === '1';
  }

  public chkFireEvent: number = 1;
  // public elementRef: any;
  srch: string;

  constructor(
    // private myElement: ElementRef,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private zone: NgZone,
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private stateServices: StateServices,
    private cityServices: CityServices,
    private groupServices: GroupServices,
    private employeeServices: EmployeeServices,
    private documentTypeServices: DocumentTypeServices,
    private message: Message,
  ) {
    // this.elementRef = myElement;
    this.showEmpAddBtn = this.userRight.checkAllowButton(constantValues.ADDEMPLOYEE)
    this.showEmpEditBtn = this.userRight.checkAllowButton(constantValues.ADDEMPLOYEE)
    this.showEmpDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETEEMPLOYEE)

    this.VIEWCONTACTINFO = this.userRight.checkAllowButton(constantValues.VIEWCONTACTINFO)
    this.EDITCONTACTINFO = this.userRight.checkAllowButton(constantValues.EDITCONTACTINFO)
    this.VIEWPERSONALINFORMATION = this.userRight.checkAllowButton(constantValues.VIEWPERSONALINFORMATION)
    this.EDITPERSONALINFORMATION = this.userRight.checkAllowButton(constantValues.EDITPERSONALINFORMATION)
    this.VIEWAGENTCERTIFICATES = this.userRight.checkAllowButton(constantValues.VIEWAGENTCERTIFICATES)
    this.EDITAGENTCERTIFICATES = this.userRight.checkAllowButton(constantValues.EDITAGENTCERTIFICATES)
    this.VIEWSYSTEMACCESSINFORMATION = this.userRight.checkAllowButton(constantValues.VIEWSYSTEMACCESSINFORMATION)
    this.EDITSYSTEMACCESSINFORMATION = this.userRight.checkAllowButton(constantValues.EDITSYSTEMACCESSINFORMATION)
    this.VIEWDOCUMENTS = this.userRight.checkAllowButton(constantValues.VIEWDOCUMENTS)
    this.EDITDOCUMENTS = this.userRight.checkAllowButton(constantValues.EDITDOCUMENTS)
    this.VIEWEMERGENCYCONTACTINFO = this.userRight.checkAllowButton(constantValues.VIEWEMERGENCYCONTACTINFO)
    this.EDITEMERGENCYCONTACTINFO = this.userRight.checkAllowButton(constantValues.EDITEMERGENCYCONTACTINFO)
    this.VIEWPHONEINFO = this.userRight.checkAllowButton(constantValues.VIEWPHONEINFO)
    this.EDITPHONEINFO = this.userRight.checkAllowButton(constantValues.EDITPHONEINFO)

    this.EDITSTATUS = this.userRight.checkAllowButton(constantValues.EDITSTATUS)
    this.errorMessage = this.message.msg;
    this.specialColumn = new $.fn.dataTable.SpecialColumn([

      {
        id: 'CHANGE_PASSWORD',
        title: 'Change Password',
        customClass: this.showEmpEditBtn
      }, {
        id: 'MAKE_USER_ACTIVE_OR_INACTIVE',
        title: 'Make User Inactive',
        customClass: this.showEmpEditBtn
      },

    ])

    this.delete = this.delete.bind(this)
    this.validatePassword = this.validatePassword.bind(this)
    this.changePassword = this.changePassword.bind(this)
    this.toggleStatus = this.toggleStatus.bind(this)
    this.editPermissions = this.editPermissions.bind(this)


  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    document.title = 'Employee'
    this.filterList = []

    if (this.filter['isActive'] != 'true' && this.filter['isActive'] != 'false') {
      this.filter['isActive'] = 'true'
    }

    this.filterList.push({"id": 'All', "itemName": "All"})
    this.filterList.push({"id": 'true', "itemName": "Active"})
    this.filterList.push({"id": 'false', "itemName": "Inactive"})
    const vm = this
    vm.table = $('#dt-employee').DataTable({
      paging: true,
      dom: "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-12 col-md-2'l><'col-sm-12 col-md-3'i><'col-sm-12 col-md-7'p>>",
      pageLength: 25,
      "bFilter": true,
      lengthChange: true,
      lengthMenu: [25, 50, 75, 100],
      language: {
        oPaginate: {
          sNext: `<span class="material-symbols-outlined">arrow_forward</span>`,
          sPrevious: `<span class="material-symbols-outlined">
            arrow_back
            </span>`,
        },
        lengthMenu: 'Rows per page _MENU_',
        infoFiltered: ""
      },
      "aaSorting": [],
      ajax: this.employeeServices.get({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'FIRST NAME',
          data: 'firstName',
          class: 'clickable',

        }, {
          title: 'LAST NAME',
          data: 'lastName',
          class: 'clickable',

        },
        {
          title: 'Address',
          data: 'address1',
          class: 'selectable clickable',
          visible: false,
          render: function (data: any, type: any, dataToSet: any) {
            let tmpaddr: any[] = [];

            for (let key in dataToSet) {
              if (dataToSet[key] === null) {
                dataToSet[key] = '';
              }
              if ((key == 'address1' || key == 'address2' || key == 'city' || key == 'state' || key == 'zipCode') && dataToSet[key] != "") {
                tmpaddr.push(dataToSet[key]);
              }
            }

            if (tmpaddr.length > 0) {
              return tmpaddr.join(', ');
            } else {
              return '';
            }

          }
        },
        {
          title: 'Work Phone',
          data: 'workPhone',
          class: 'selectable clickable',
          orderable: false,
          render: function (data: any, type: any, dataToSet: any) {
            let phn: any[] = [];

            for (let key in dataToSet) {
              if (dataToSet[key] === null) {
                dataToSet[key] = '';
              }
              if ((key == 'workPhone' || key == 'workPhoneExt') && dataToSet[key] != "") {
                phn.push(dataToSet[key]);
              }
            }

            if (phn.length > 0) {
              return phn.join(' + ');
            } else {
              return '';
            }

          }
        }, {
          title: 'Mobile',
          data: 'mobilePhone',
          orderable: false,
          class: 'selectable clickable'
        },
        {
          title: 'Home Phone',
          data: 'homePhone',
          orderable: false,
          class: 'selectable clickable'
        }, {
          title: 'Email',
          data: 'email',
          class: 'selectable clickable',
          width: 200,
          render: function (data: any, type: any) {
            if (type === 'display')
              return `<a href="mailto:${data}" target="_top" class="link-blue">${data}</a>`

            return data
          }
        }, {
          title: 'User Group',
          data: 'group',
          class: 'selectable clickable'
        },
        {
          title: 'Status',
          data: 'status',
          visible: false,
          class: 'selectable clickable'
        },
        {
          title: 'Start Date',
          data: 'startDate',
          visible: false,
          class: 'selectable clickable'
        }, {
          title: 'Final Date',
          data: 'finalDate',
          visible: false,
          class: 'selectable clickable'
        },
        {
          title: 'Notes',
          data: 'notes',
          visible: false,
          class: 'selectable clickable',
          render: function (data: any, type: any) {
            if (data == null) {
              return '';
            }
            return `<div class='notes-info'>${data}</div>`;
          }
        },
        this.specialColumn
      ],
      drawCallback: (setting: any) => {
        if (vm.showEmpEditBtn == "hide") {
          $('.select-column').hide()
        } else {
          $('.select-column').show()
        }
      },
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.delete-icon').hide();
        this.showEmpEditBtn
        $(row).find('.edit-permission').removeClass('hide');
        if (this.showEmpEditBtn == 'hide') {
          $(row).find('td').removeClass('clickable');
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('.edit-permission').addClass("disabled");
        }
      }),
      initComplete: () => {
        $('#dt-employee tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.documents = []
            vm.ViewEmployee = false;
            vm.loading = true
            vm.openModal(vm.formEmployeeTpl, data.id)
          }
        })

        this.specialColumn
          .ngZone(this.zone)
          .dataTable(vm.table)
          .onActionPopup((data: any, action: any) => {
            if (action.id === 'MAKE_USER_ACTIVE_OR_INACTIVE' && !data.isActive)
              action.title = 'Make User Active'
          })
          .onActionClick((row: any, actionId: any) => {
            this.actionRow = row

            if (actionId == 'EDIT_EMPLOYEE') {
              this.documents = []
              this.ViewEmployee = true;
              this.loading = true;

              this.openModal(vm.formEmployeeTpl, this.actionRow.data().id)
            } else if (actionId == 'CHANGE_PASSWORD') {
              this.changePassword()
            } else if (actionId == 'MAKE_USER_ACTIVE_OR_INACTIVE') {
              this.toggleStatus()
            } else if (actionId == 'EDIT_PERMISSIONS') {
              this.loading = true;
              this.editPermissions(vm.permissionUsergroup)
            } else if (actionId == 'DELETE_EMPLOYEE')
              this.appComponent.showDeleteConfirmation(this.delete, [this.actionRow.data.id, row])
          })
        $('#dt-employee tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          vm.actionRow = row
          if ($(this).hasClass('disabled')) {
            return
          }
          if ($(this).hasClass('edit-icon')) {
            vm.documents = []
            vm.ViewEmployee = true;
            vm.loading = true;
            vm.openModal(vm.formEmployeeTpl, data.id)
          }
          if ($(this).hasClass('edit-permission')) {
            vm.loading = true;
            vm.editPermissions(vm.permissionUsergroup)
          }
        })
      }
    })

  }

  /**
   * This method is used to check that data contains only number
   * @method isNumber
   * @param {any} evt evt is used to get event of that input
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
   * This method will be destroy all elements and other values from whole module
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    this.specialColumn.destroy()
    $('#dt-employee tbody').off('click')
  }

  /**
   * This method will be used for validating new password and confirm password
   * @method validatePassword
   * @param {any} newPassword new Password
   * @param {any} confirmPassword confirm Password  for matching new password
   */
  validatePassword(newPassword: any, confirmPassword: any) {
    if (confirmPassword.value == '') {
      confirmPassword.setCustomValidity("Please Enter Confirm Password.")
    } else if (newPassword.value != confirmPassword.value) {
      confirmPassword.setCustomValidity("Passwords don't match.")
    } else {
      confirmPassword.setCustomValidity('')
    }
  }

  /**
   * This method will be used for changing password
   * @method changePassword
   * @param {boolean} apply
   */
  private changePassword(apply: boolean = false) {
    if (!apply) {
      this.actionFormData = {
        newPassword: '',
        confirmPassword: '',
        newPasswordType: 'password',
        confirmPasswordType: 'password',
        action: this.changePassword,
        changePassword: true
      }

      this.modalRef = this.modalService.show(this.changePasswordTpl, {backdrop: 'static', 'keyboard': false})
    } else {
      const data = {...this.actionRow.data()}

      this.employeeServices.changePassword(data.id, this.actionFormData.newPassword).subscribe(r => {
        data.isActive = true
        data.status = 'Active'
        this.actionRow.update(data)
        this.actionRow = null
        this.toastr.success('Password has been changed successfully')
        this.modalRef.hide()
      })
    }
  }

  /**
   * This method will be used for changing status of employee
   * @method toggleStatus
   */
  private toggleStatus(apply: boolean = false) {
    this.loading = true
    const data = {...this.actionRow.data()}
    if (data.isActive) {
      this.employeeServices.statusInactive(data.id).subscribe(r => {
        this.loading = false
        data.isActive = false
        data.status = 'Inactive'
        this.reload()
        this.actionRow.update(data)
        this.actionRow = null
        this.table.row(this.table.rows.idxByDataId(data.id)).update(data)
        this.toastr.success('Status has been changed successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.employeeServices.statusActive(data.id, data.computerPassword).subscribe(r => {
        data.isActive = true
        data.status = 'Active'
        this.reload()
        this.actionRow.update(data)
        this.actionRow = null
        data.status = (data.isActive = data.isActive) ? 'Active' : 'Inactive'
        this.table.row(this.table.rows.idxByDataId(data.id)).update(data)
        this.toastr.success('Status has been changed successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }

  /**
   * This method is used for editing permission of employee
   * @method editPermissions
   * @param {any} template type which contains template of create/edit module
   * @param {apply} isNew it is optional which contains true if it is new record and false when it is old record
   */
  private editPermissions(template: any, apply: boolean = false) {
    if (!apply) {
      this.employeeServices.getById(this.actionRow.data().id).subscribe((r: any) => {
        this.empId = r.id
        if (r.allPermissions.length > 0) {
          this.permission = []
          this.permission = r.permissions
          r.allPermissions.forEach((element: any, index: number) => {
            if (element.moduleName == 'Employee') {
              this.empPermission = element.groups
            }
            if (element.moduleName == 'Job') {
              this.jobPermission = element.groups
            }
            if (element.moduleName == 'Other') {
              this.otherPermission = element.groups
            }
          });
        }
        this.loading = false;
        this.modalRef = this.modalService.show(template, {
          class: 'modal-user-group',
          backdrop: 'static',
          'keyboard': false
        })
      })
    } else {
      this.employeeServices.setGrants(this.actionRow.data().id, this.actionFormData).subscribe(r => {
        this.actionRow = null
        this.toastr.success('Permission has been changed successfully')
        this.modalRef.hide()
      })
    }
  }


  /**
   * This method is used while changing city or state
   * @method onStateCityChange
   * @param {boolean} state state is true if we are changing state
   */
  onStateCityChange(state: boolean) {
    const city = this.cities.find(c => c.id == this.rec.idCity)
    if (city && city.idState != this.rec.idState) {
      if (state)
        this.rec.idCity = 0
      else
        this.rec.idState = city.idState
    }
  }

  /**
   * This method is used when document type is changed
   * @method onChangeDocumentType
   */
  onChangeDocumentType() {
  }

  /**
   * This method is used for converting documents into base64
   * @method base64
   * @param {any} doc doc is used to get whole documents for read
   */
  private base64(doc: EmployeeDocument) {
    let reader = new FileReader()

    reader.onload = () => {
      doc.content = arrayBufferToBase64(reader.result)
    }
    reader.onerror = (error: any) => {
      this.toastr.error(error, 'Error')
    }

    reader.readAsArrayBuffer(doc.content)
  }

  /**
   * This method is used to open modal popup for openModalForm
   * @method _openModal
   * @param {any} template type which contains template of create/edit module
   */
  private _openModal(template: TemplateRef<any>) {
    this.ssnType = 'password'
    this.dobType = 'password'
    this.telephonePasswordType = 'password'
    this.computerPasswordType = 'password'
    this.efillingPasswordType = 'password'
    this.applicationPasswordType = 'password'
    this.lockScreenPasswordType = 'password'
    this.applePasswordType = 'password'
    this.pin = 'password'
    if (!this.states.length) {
      if (this.rec.idState)
        this.states.push({id: this.rec.idState, name: this.rec.state, acronym: this.rec.state} as State)

      this.stateServices.getDropdown().subscribe(r => {
        this.states = _.sortBy(r, 'itemName');

      })
    }

    if (!this.cities.length) {
      if (this.rec.idCity)
        this.cities.push({id: this.rec.idCity, name: this.rec.city, idState: this.rec.idState} as City)
      this.cityServices.get().subscribe(r => {
        this.cities = r
      })

    }

    if (!this.groups.length) {
      if (this.rec.idGroup)
        this.groups.push({id: this.rec.idGroup, name: this.rec.group} as Group)
      this.groupServices.list().subscribe(r => {
        this.groups = _.sortBy(r, 'name');
        for (let j = 0; j < this.groups.length; j++) {
          this.groupsDrp.push({"id": this.groups[j].id, "name": this.groups[j].name});
        }
        for (let key in this.groups) {
          this.groupsName.push({
            label: this.groups[key].name,
            value: this.groups[key].id
          });
        }

      })
    }

    if (this.rec) {
      this.activeGroup = [];
      this.activeGroup[0] = this.rec.idGroup;
      this.activeState = [];
      this.activeState[0] = this.rec.idState;
    }

    if (!this.documentTypes.length)
      this.documentTypeServices.get().subscribe(r => {
        this.documentTypes = _.sortBy(r['data'], 'name');
        for (let j = 0; j < this.documentTypes.length; j++) {
          this.documentTypesDrp.push({"id": this.documentTypes[j].id, "name": this.documentTypes[j].name});
        }
      })

    let subscriptions: Subscription[] = []

    subscriptions.push(this.modalService.onShown.subscribe(() => {

      $('.phone-number').mask('(000) 000-0000', {
        // placeholder: '(   )    -    '
      })

      $('.phone-number').attr("pattern", "\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}$")

      setTimeout(() => {
        $("[autofocus]").focus()
      })

    }))

    subscriptions.push(this.modalService.onHide.subscribe(() => {
      $('#employee-file-upload').parent().off('change')

      subscriptions.forEach((subscription: Subscription) => {
        subscription.unsubscribe()
      })

      subscriptions = null
    }))
    this.modalRef = this.modalService.show(template, {class: 'modal-employee', backdrop: 'static', 'keyboard': false})
    this.loading = false
    setTimeout(() => {
    })

    if (this.rec.id > 0) {
      this.chkFireEvent = 1;
    } else {
      this.chkFireEvent = 2;
    }
  }

  /**
   * This method is used to change password type either text or password
   * @method togglePassword
   * @param {any} p p which contains template of password
   * @param {any} obj it contains input element
   */
  togglePassword(p: any, obj: any = null) {
    obj = obj || this;
    obj[p] = obj[p] == 'password' ? 'text' : 'password'
  }

  /**
   * This method is used to open modal popup for openModalForm
   * @method openModalForm
   * @param {any} template type which contains template of create/edit module
   * @param {number} id? it is optional which contains id if record is in edit mode
   */
  openModal(template: TemplateRef<any>, id?: number) {

    this.new = !!!id

    if (this.new) {
      this.ViewEmployee = true

      this.rec = {
        agentCertificates: [],
        documents: [],
        isActive: true
      } as Employee

      this.agentCertificate = {} as AgentCertificate

      this._openModal(template)
    } else {

      this.employeeServices.getById(id).subscribe(r => {
        delete r.permissions

        this.rec = r as Employee

        this.agentCertificate = {} as AgentCertificate
        this.agentCertificate.documentType = {} as DocumentType
        if (this.rec.dob) {
          this.rec.dob = moment(this.rec.dob).format(this.constantValues.DATEFORMAT);
        }
        if (this.rec.startDate) {
          this.rec.startDate = moment(this.rec.startDate).format(this.constantValues.DATEFORMAT);
        }
        if (this.rec.finalDate) {
          this.rec.finalDate = moment(this.rec.finalDate).format(this.constantValues.DATEFORMAT);
        }
        if (this.agentCertificate.expirationDate) {
          this.agentCertificate.expirationDate = moment(this.agentCertificate.expirationDate).format(this.constantValues.DATEFORMAT);
        }
        this._openModal(template)
      })
    }
  }

  /**
   * This method is used to add agency certificate
   * @method addAgentCertificate
   */
  addAgentCertificate() {

    if (!this.agentCertificate.idDocumentType || !this.agentCertificate.numberId) {
      this.isRequiredCertificate = true;
      this.isRequiredCertificateId = true;
      return
    } else {
      this.isRequiredCertificate = false;
      this.isRequiredCertificateId = false;
    }

    const ac = {...this.agentCertificate}
    ac.documentType = {...this.documentTypes.find(dt => dt.id == ac.idDocumentType)}

    if (this.idxAgentCertificate != -1) {
      this.rec.agentCertificates[this.idxAgentCertificate] = ac
      this.idxAgentCertificate = -1
    } else {
      this.rec.agentCertificates.unshift(ac)
    }

    this.agentCertificate = {} as AgentCertificate
  }

  /**
   * This method is used to delete agency certificate
   * @method editAgentCertificate
   * @param {any} a agent certificate record that we want to update
   * @param {number} idx index which we need to update
   */
  editAgentCertificate(a: AgentCertificate, idx: number) {
    this.agentCertificate = {...a}
    this.idxAgentCertificate = idx
  }

  /**
   * This method is used to delete agency certificate
   * @method deleteAgentCertificate
   * @param {any} a agent certificate record that we want to delete
   */
  deleteAgentCertificate(a: AgentCertificate) {
    this.rec.agentCertificates.splice(this.rec.agentCertificates.indexOf(a), 1)
  }

  /**
   * This method is used to get specific document
   * @method getDocumentById
   * @param {number} id id of document
   */
  private getDocumentById(id: number) {
    this.employeeServices.getDocumentById(this.rec.id, id).subscribe(r => {
      var fileName = r.headers.get('Content-Disposition').split(';')[1].split('=')[1]
      var contentType = r.headers.get('Content-Type')
      downloadFile(r.body, contentType, fileName)
    }, e => {
    })
  }

  /**
   * This method is used to delete documents from database
   * @method deleteDocument
   * @param {any} d d which contains documents
   */
  deleteDocument(d: EmployeeDocument) {
    if (d.id) {
      this.rec.documentsToDelete.push(d.id);
    }
    this.rec.documents.splice(this.rec.documents.indexOf(d), 1)
  }


  /**
   * This method is used to save record
   * @method save
   */
  save() {
    this.loading = true
    const rec = cloneDeep(this.rec)
    for (let i = 0; i < rec.agentCertificates.length; i++) {
      if (rec.agentCertificates[i]['expirationDate']) {
        let agentCerti = moment(rec.agentCertificates[i]['expirationDate']).format(this.constantValues.DATEFORMAT);
        rec.agentCertificates[i]['expirationDate'] = agentCerti;
      }
    }
    if (!rec.id) {
      rec.documents = []
      this.employeeServices.create(rec).subscribe(r => {
        let chkPromise = this.uploadDocuments(r.id)
        chkPromise.then(value => {
          this.loading = false
          const emp = r as any
          emp.group = this.groups.find((g: any) => g.id == r.idGroup).name
          emp.status = (emp.isActive = rec.isActive) ? 'Active' : 'Inactive'
          this.table.rows.insert(emp)
          this.reload()
          this.toastr.success('Record created successfully')
          this.select2error = false;
          this.modalRef.hide()
          this.loading = false
        })

      }, e => {
        this.loading = false
      })
    } else {
      this.employeeServices.update(rec.id, rec).subscribe(r => {
        let chkPromise = this.uploadDocuments(rec.id)
        chkPromise.then(value => {
          this.loading = false
          rec.group = this.groups.find((g: any) => g.id == rec.idGroup).name
          rec.status = (rec.isActive = rec.isActive) ? 'Active' : 'Inactive'
          this.table.row(this.table.rows.idxByDataId(rec.id)).update(rec)
          this.reload()
          this.toastr.success('Record updated successfully')
          this.modalRef.hide()
          this.loading = false
        });
      }, e => {
        this.loading = false
      })
    }
  }

  /**
   * This method is used to delete record
   * @method delete
   */
  private delete(): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.employeeServices.delete(this.actionRow.data().id).subscribe(r => {
        this.actionRow.delete()
        this.actionRow = null
        this.reload()
        resolve(null)
      }, e => {
        reject()
      })
    })
  }

  /**
   * This method is used for filter/search records from datatable
   * @method search
   * @param {string} srch type any which contains string that can be filtered from datatable
   */
  search(srch: string) {
    this.table.search(srch).draw()
  }

  /**
   * This method is used to close modal popup
   * @method closePopup
   */
  closePopup() {
    this.activeGroup = [];
    this.activeState = [];
    this.modalRef.hide();
  }

  /**
   * This method is used to make div visible when field is required
   * @method setRequireMsg
   */
  setRequireMsg() {
    this.isRequiredCertificate = true;
  }

  /**
   * This method is used to reload datatable
   * @method reload
   */
  reload() {
    this.table.clearPipeline()
    this.table.ajax.reload()
  }

  /**
   * This method is used to upload documents
   * @method uploadDocuments
   * @param {number} id id is used as employee id
   */
  uploadDocuments(id: number): Promise<{}> {
    return new Promise((resolve, reject) => {
      if (this.documents && this.documents.length > 0) {
        let formData = new FormData();
        formData.append('idEmployee', id.toString())

        for (var i = 0; i < this.documents.length; i++) {
          formData.append('documents_' + i, this.documents[i])
        }
        this.employeeServices.saveEmployeeDocuments(formData).subscribe(r => {
          resolve(null)
        }, e => {
          reject()
        })
      } else {
        resolve(null)
      }
    })
  }

  /**
   * This method is used to push documents in one array
   * @method documentUpload
   * @param {any} evt evt is used to insert document in array
   */
  documentUpload(evt: any) {
    if (this.documents == null) {
      this.documents = []
    }
    if (this.rec.documents == null) {
      this.rec.documents = []
    }
    let files = evt.target.files;
    for (var i = 0; i < files.length; i++) {
      this.rec.documents.push(files[i])
      this.documents.push(files[i]);
    }
  }

  /**
   * This method is used to set filter for employee is active,in-active,All
   * @method changeStatus
   * @param {any} filter filter is used to get list of employee having status i.e. in filter and datatable is reload
   */
  changeStatus(filter: any) {
    if (this.filter['isActive'] == 'true') {
      this.filter['isActive'] = 'true'
    } else if (this.filter['isActive'] == 'false') {
      this.filter['isActive'] = 'false'
    } else {
      this.filter['isActive'] = 'All'
    }
    this.reload()
  }


  /**
   * This method is used to check permssions of Employee
   * @method checkPermissionValues
   * @param {any} evt evt which includes event of javascript
   * @param {number} permissionId permissionId is used to check whether the permission is exsits for employee or not
   */
  checkPermissionValues(evt: any, permissionId: number) {
    if (evt == true) {
      this.permission.push(permissionId)
    } else {
      let idx = this.permission.filter((x: any) => x == permissionId)[0];
      let remIndex = this.permission.indexOf(idx)
      this.permission.splice(remIndex, 1)
    }
  }


  /**
   * This method is used to save new permssion of Employee
   * @method savePermission
   */
  savePermission() {
    if (this.permission.length > 0 && this.empId) {
      let request: any = {
        idEmployee: this.empId,
        permissions: this.permission
      }
      this.employeeServices.setGrants(this.empId, request).subscribe(r => {
        this.actionRow = null
        this.toastr.success('Permission has been changed successfully')
        this.modalRef.hide()
      })
    }
  }
}