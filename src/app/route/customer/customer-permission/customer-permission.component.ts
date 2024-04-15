import { Component, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CustomerPermissionService } from './customer-permission.service';
import { assign, identity, pickBy } from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserRightServices } from '../../../services/userRight.services';
import { constantValues } from '../../../app.constantValues';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../app.constants';

declare const $: any

@Component({
  selector: 'customer-permission',
  templateUrl: './customer-permission.component.html',
  styleUrls: ['./customer-permission.component.scss']
})
export class CustomerPermissionComponent implements OnInit {

  loading: boolean = false;
  filterList: any
  filter: any = {}
  private table: any
  private showEmpEditBtn: string = "hide";
  private specialColumn: any
  private actionRow: any
  empId: number
  private permission: any = []
  modalRef: BsModalRef
  flager: any;
  srch: any;
  private contactListPost = API_URL + 'api/customersadmin/customers';

  /**
   *  permissionUsergroup add/edit form
   * @property permissionUsergroup
   */
  @ViewChild('permissionUsergroup', {static: true}) private permissionUsergroup: TemplateRef<any>

  /**
   *  notificationSettings add/edit form
   * @property notificationSettings
   */
  @ViewChild('notificationSettings', {static: true}) private notificationSettings: TemplateRef<any>

  constructor(
    private customerServices: CustomerPermissionService,
    private toastrServices: ToastrService,
    private modalService: BsModalService,
    private zone: NgZone,
    private toastr: ToastrService,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private router: Router,
    private http: HttpClient
  ) {

    this.showEmpEditBtn = this.userRight.checkAllowButton(constantValues.ADDEMPLOYEE)

    this.specialColumn = new $.fn.dataTable.SpecialColumn([
      //   {
      //   id: 'EDIT_EMPLOYEE',
      //   title: 'Edit Employee',
      //   customClass: this.showEmpEditBtn
      // }, 
      // {
      //   id: 'CHANGE_PASSWORD',
      //   title: 'Change Password',
      //   customClass: this.showEmpEditBtn
      // }, 
      {
        id: 'MAKE_USER_ACTIVE_OR_INACTIVE',
        title: 'Revoke',
        customClass: this.showEmpEditBtn
      },
      {
        id: 'NOTIFICATION_SETTINGS',
        title: 'Notification Settings',
        customClass: this.showEmpEditBtn
      },
    ])
  }

  ngOnInit(): void {
    document.title = 'Portal Contacts'
    this.filterList = []

    if (this.filter['isActive'] != 'true' && this.filter['isActive'] != 'false') {
      this.filter['isActive'] = 'true'
    }

    this.filterList.push({"id": 'All', "itemName": "All"})
    this.filterList.push({"id": 'true', "itemName": "Active"})
    this.filterList.push({"id": 'false', "itemName": "Inactive"})
    this.datatableInitialize().then(res => {
      console.log(res)
    })
  }

  datatableInitialize(): Promise<any> {
    // this.filterList = []
    // this.filter['isActive'] = 'true'

    // this.filterList.push({ "id": 'All', "itemName": "All" })
    // this.filterList.push({ "id": 'true', "itemName": "Active" })
    // this.filterList.push({ "id": 'false', "itemName": "Inactive" })
    try {
      return new Promise<any>((resolve) => {
        const vm = this
        vm.table = $('#dt-customer').DataTable({
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
          retrieve: true,
          processing: true,
          serverSide: !vm.flager,
          ajax: (dataTablesParameters: any, callback: any) => {
            console.log('vm.flager', vm.flager)
            if (!vm.flager) {
              console.log('run')
              delete dataTablesParameters['draw']
              dataTablesParameters['start'] = dataTablesParameters['start'] + dataTablesParameters.length
              let order = dataTablesParameters.order[0];
              if (dataTablesParameters['search'].value) {
                let searchValue = dataTablesParameters['search'].value;
                delete dataTablesParameters['search']
                dataTablesParameters['search'] = searchValue;
              }
              // let columnIndex = order.column;
              // let columnName = dataTablesParameters.columns[columnIndex].data;
              // order['column'] = columnName;
              dataTablesParameters['orderedColumn'] = {"column": "firstName", "dir": "asc"};
              delete dataTablesParameters['order'];
              delete dataTablesParameters['columns'];
              if (dataTablesParameters['search'].value == '') {
                delete dataTablesParameters['search'];
                dataTablesParameters['search'] = ''
              }
              let dataToPost = {...dataTablesParameters};
              // dataToPost['CompanyTypes'] = vm.tmpCmpType.map((e: any) => e.id).toString() || ""\
              dataToPost['IdContactLicenseType'] = this.filter.idContactLicenseType;
              dataToPost['IdCompany'] = this.filter.idCompany == -1 ? '' : this.filter.idCompany;
              dataToPost['search'] = this.srch || '';
              dataToPost['IsActive'] = this.filter.isActive;
              dataToPost['GlobalSearchType'] = null;

              dataToPost['Individual'] = this.filter.idCompany == -1 ? '-1' : '';
              // CompanyTypes
              console.log('finalURL', vm.contactListPost)

              vm.http.post<DataTablesResponse>(`${vm.contactListPost}`, dataToPost, {}).subscribe(resp => {
                this.loading = false
                resolve(null);
                callback({
                  recordsTotal: resp.recordsTotal,
                  recordsFiltered: resp.recordsFiltered,
                  data: resp.data
                });
              });
            } else {
              let queryString = ''
              let finalURL = ''
              for (let key in vm.filter) {
                queryString = `${queryString}${key}=${vm.filter[key]}&`
                finalURL = `${vm.contactListPost}${queryString}`
              }
              vm.http
                .get<DataTablesResponse>(
                  `${finalURL}`,
                ).subscribe(resp => {
                callback({
                  recordsTotal: resp.recordsTotal,
                  recordsFiltered: resp.recordsFiltered,
                  data: resp.data
                });
              });
              this.flager = false;


              //  vm.jobServices.getRecords({
              //   onData: (data: any) => {
              //     assign(data, pickBy(this.filter, identity))
              //   },

              // });
            }
          },
          // ajax: this.customerServices.get({
          //   onData: (data: any) => {
          //     assign(data, pickBy(this.filter, identity))
          //   }
          // }),
          columns: [
            {
              title: 'FIRST NAME',
              data: 'firstName',
              class: 'clickable emailRedirect',

            }, {
              title: 'LAST NAME',
              data: 'lastName',
              class: 'clickable emailRedirect',
            }, {
              title: 'COMPANY',
              data: 'name',
              class: 'clickable emailRedirect',
            },
            {
              title: 'ADDRESS',
              data: 'address',
              class: 'selectable clickable emailRedirect',
              // render: function (data: any, type: any, dataToSet: any) {
              //   let tmpaddr: any[] = [];
              //   for (let key in data[0]) {
              //     console.log('key',key)
              //     if (data[0][key] === null) {
              //       data[0][key] = '';
              //     }
              //     if ((key == 'address1' || key == 'address2' || key == 'city' || key == 'state' || key == 'zipCode') && data[0][key] != "") {
              //       tmpaddr.push(data[0][key]);
              //     }
              //   }

              //   if (tmpaddr.length > 0) {
              //     return tmpaddr.join(', ');
              //   } else {
              //     return '';
              //   }

              // }
            },
            // {
            //   title: 'WORK PHONE',
            //   data: 'workPhone',
            //   class: 'selectable clickable emailRedirect',
            //   orderable: false,
            //   render: function (data: any, type: any, dataToSet: any) {
            //     let phn: any[] = [];

            //     for (let key in dataToSet) {
            //       if (dataToSet[key] === null) {
            //         dataToSet[key] = '';
            //       }
            //       if ((key == 'workPhone' || key == 'workPhoneExt') && dataToSet[key] != "") {
            //         phn.push(dataToSet[key]);
            //       }
            //     }

            //     if (phn.length > 0) {
            //       return phn.join(' + ');
            //     } else {
            //       return '';
            //     }

            //   }
            // },
            {
              title: 'WORK PHONE',
              data: 'workPhone',
              class: 'selectable clickable emailRedirect',
              orderable: false,
              width: 100,
            },
            {
              title: 'EMAIL ADDRESS',
              data: 'email',
              class: 'selectable clickable',
              width: 200,
              render: function (data: any, type: any) {
                if (type === 'display')
                  return `<a href="mailto:${data}" target="_blank" class="link-blue">${data}</a>`
                return data
              }
            },
            // {
            //   title: 'STATUS',
            //   data: 'status',
            //   class: 'selectable clickable',
            // },
            {
              title: 'REGISTERED',
              data: 'cuI_Invitatuionstatus',
              class: 'selectable clickable emailRedirect',
              render: function (data: any, type: any, dataToSet: any) {
                if (!data) {
                  return 'Not Invited'
                } else if (data == 1) {
                  return 'Invitation Sent'
                } else if (data == 2) {
                  return 'Registered'
                }
              }
            },
            {
              title: 'NOTIFICATION CONSENT',
              data: 'customerConsent',
              class: 'selectable clickable emailRedirect',
              render: function (data: any, type: any, dataToSet: any) {
                if (!data) {
                  return 'No'
                } else {
                  return 'Yes'
                }
              }
            },
            {
              title: 'PROJECTS',
              data: 'idJobs',
              class: 'selectable clickable',
              render: function (data, type, row) {
                // Assuming data is a string like "[1, 1444, 777]"
                const projects = row.idJobs ? row.idJobs.replace(/,$/, '').split(',') : [];
                console.log('projects', projects)
                const links = projects.map(project => `<a class="project-link" data-project="${project}">${project}</a>`);
                return links.join(', ');
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
            $(row).find('.edit-permission').removeClass('hide');
            $(row).find('.edit-icon').addClass("hide");
            if (this.showEmpEditBtn == 'hide') {
              $(row).find('td').removeClass('clickable');
              // $(row).find('.edit-permission').addClass("disabled");
            }
          }),
          initComplete: () => {
            this.specialColumn
              .ngZone(this.zone)
              .dataTable(vm.table)
              .onActionPopup((data: any, action: any) => {
                if (action.id === 'MAKE_USER_ACTIVE_OR_INACTIVE' && !data.isActive)
                  action.title = 'Make User Active'
              })
              .onActionClick((row: any, actionId: any) => {
                this.actionRow = row
                const data = row.data()

                if (actionId == 'MAKE_USER_ACTIVE_OR_INACTIVE') {
                  this.toggleStatus()
                }

                if (actionId == 'NOTIFICATION_SETTINGS') {
                  vm.empId = data.customerId
                  console.log('vm.empId', vm.empId)
                  vm.openNotificationSettings()
                }
              })

            $('#dt-customer tbody').on('click', 'td.clickable', function (ev: any) {
              const row = vm.table.row($(this).parents('tr'))
              const data = row.data()
              if ($(this).hasClass('clickable')) {
                // vm.loading = true
              }
              if ($(this).hasClass('emailRedirect')) {
                let emailAddress = data.emailAddress;
                let url = `${window.location.origin}/contacts?email=${emailAddress}`
                window.open(url, '_blank')
              }
            })

            $('#dt-customer tbody').on('click', '.project-link', function (e) {
              const projectId = $(this).data('project');
              console.log('projectId', projectId)
              // Call your function here using projectId
              vm.router.navigateByUrl(`/job/${projectId}/jobcontact`)
            });

            $('#dt-customer tbody').on('click', 'span', function (ev: any) {
              const row = vm.table.row($(this).parents('tr'))
              const data = row.data()
              if ($(this).hasClass('disabled')) {
                return
              }
              if ($(this).hasClass('edit-permission')) {
                vm.actionRow = row
                // vm.loading = true;
                vm.editPermissions(vm.permissionUsergroup)
              }
              if ($(this).hasClass('delete-icon')) {
                vm.loading = true;
                vm.deleteCustomer(data)
              }
            })
          }
        })
      })
    } catch (err) {
      console.log(err)
    }

  }

  private async deleteCustomer(customerData) {
    console.log(customerData)
    this.loading = true;
    try {
      await this.customerServices.delete(customerData.idContact)
      this.loading = false;
      this.toastrServices.success("Customer deleted successfully.");
      this.reload()
    } catch (err) {
      this.loading = false;
      console.log(err)
    }
  }

  /**
   * This method is used to reload datatable
   * @method reload
   */
  reload() {
    this.table.clearPipeline()
    this.table.ajax.reload()
  }


  private editPermissions(template: any, apply: boolean = false) {
    if (!apply) {
      this.customerServices.getCustomerPermissions(this.actionRow.data().customerId).subscribe((r: any) => {
        this.empId = r.id
        if (r.allPermissions.length > 0) {
          this.permission = []
          this.permission = r.permissions
          r.allPermissions.forEach((element: any, index: number) => {
            if (element.moduleName == 'Employee') {
              // this.empPermission = element.groups
            }
            if (element.moduleName == 'Project') {
              // this.jobPermission = element.groups
            }
            if (element.moduleName == 'Other') {
              // this.otherPermission = element.groups
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
      // this.employeeServices.setGrants(this.actionRow.data().id, this.actionFormData).subscribe(r => {
      //   this.actionRow = null
      //   this.toastr.success('Permission has been changed successfully')
      //   this.modalRef.hide()
      // })
    }
  }

  private toggleStatus(apply: boolean = false) {
    this.loading = true
    const data = {...this.actionRow.data()}
    if (data.isActive) {
      this.customerServices.statusInactive(data.customerId).subscribe(r => {
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
      this.customerServices.statusActive(data.id, data.computerPassword).subscribe(r => {
        data.isActive = true
        data.status = 'Active'
        this.reload()
        this.actionRow.update(data)
        this.actionRow = null
        data.status = (data.isActive = data.isActive) ? 'Active' : 'Inactive'
        this.table.row(this.table.rows.idxByDataId(data.id)).update(data)
        this.toastr.success('Status has been changed successfully')
        this.loading = false
        // this.modalRef.hide()
      }, e => {
        this.loading = false
      })
      // }
    }
    //this.reload()
  }

  /**
   * This method is used for filter/search records from datatable
   * @method search
   * @param {string} srch type any which contains string that can be filtered from datatable
   */
  search(event: any) {
    this.table.search(event.target.value).draw()
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

  openNotificationSettings() {
    this.modalRef = this.modalService.show(this.notificationSettings, {
      class: 'modal-user-group',
      backdrop: 'static',
      'keyboard': false
    })
  }

}

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}