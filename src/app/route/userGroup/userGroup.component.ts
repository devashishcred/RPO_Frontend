import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, ElementRef, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Message } from '../../app.messages';

import { AppComponent } from '../../app.component';
import { Group } from '../../types/group';
import { UserGroupServices } from './userGroup.services';
import { UserGroup, Permissions, ModuleName, Groups } from './userGroup';
import * as _ from 'underscore';
import { constantValues } from '../../app.constantValues';
import { UserRightServices } from '../../services/userRight.services';

declare const $: any

/**
 * This component contains all function that are used in UserGroupComponent
 * @class UserGroupComponent
 */
@Component({
  templateUrl: './userGroup.component.html',
  styleUrls: ['./userGroup.component.scss']
})
export class UserGroupComponent implements OnInit, OnDestroy {

  /**
   *  formUserGroup add/edit form
   * @property formUserGroup
   */
  @ViewChild('formUserGroup', {static: true})
  formUserGroup: TemplateRef<any>

  /**
   *  permissionUsergroup add/edit form
   * @property permissionUsergroup
   */
  @ViewChild('permissionUsergroup', {static: true}) private permissionUsergroup: TemplateRef<any>

  modalRef: BsModalRef

  private new: boolean = true

  private rec: UserGroup
  userGroupId: number

  private empPermission: any = []
  private jobPermission: any = []
  private otherPermission: any = []
  private userGroupName: string
  private description: string
  private permission: any = []
  loading: boolean = false
  private table: any
  private specialColumn: any
  errorMsg: any
  showUserGroupAddBtn: string = 'hide';
  showUserGroupDeleteBtn: string = 'hide';

  constructor(
    private zone: NgZone,
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private constantValues: constantValues,
    private userRight: UserRightServices,
    private userGroupServices: UserGroupServices
  ) {
    this.errorMsg = this.message.msg
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    document.title = 'User Group'
    const vm = this
    this.showUserGroupAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDEMPLOYEEUSERGROUP)
    this.showUserGroupDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEEMPLOYEEUSERGROUP)

    this.specialColumn = new $.fn.dataTable.SpecialColumn([], false)
    this.delete = this.delete.bind(this)

    this.table = $('#dt-userGroup').DataTable({
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
      ajax: this.userGroupServices.get(),

      columns: [
        {
          title: 'USER GROUP NAME',
          data: 'name',
          class: 'clickable'
        }, {
          title: 'DESCRIPTION',
          data: 'description',
          class: 'clickable',
          orderable: false
        },
        this.specialColumn

      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.more_vert').hide();
        if (this.showUserGroupAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
        if (this.showUserGroupDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.showUserGroupAddBtn == "hide" && vm.showUserGroupDeleteBtn == 'hide') {
          $('.select-column').hide()
        } else {
          $('.select-column').show()
        }
      },
      initComplete: () => {
        this.specialColumn
          .ngZone(this.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()
            if (actionId == "EDIT") {
              vm.openModal(vm.permissionUsergroup, data.id)
            }
            if (actionId == "DELETE") {
              vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
            }
          })
        $('#dt-userGroup tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('disabled')) {
            return
          }
          if ($(this).hasClass('delete-icon')) {
            vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
          }
          if ($(this).hasClass('edit-icon')) {
            vm.openModal(vm.permissionUsergroup, data.id)
            //write conditions here
          }
        })
        $('#dt-userGroup tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            //if (this.showJobViewBtn == "show") {
            vm.openModal(vm.permissionUsergroup, data.id)
            //}
          }
        });
      }
    })

    $('#dt-userGroup').on('draw.dt', () => {
      $('[data-toggle="tooltip"]').tooltip()
    })

    if (this.showUserGroupAddBtn == 'hide' && this.showUserGroupDeleteBtn == 'hide') {
      vm.table.column(2).visible(false);
    }
  }


  /**
   * This method will be destroy all elements and other values from whole module
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    $('#dt-userGroup tbody').off('click')
    $('#dt-userGroup').off('draw.dt')
  }

  /**
   * This method is used to open modal popup for openModalForm
   * @method openModalForm
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   * @param {any} modeType it is optional which indicates whether record is new or old
   */
  openModal(template: TemplateRef<any>, id?: number, modeType?: any) {
    this.new = !!!id

    if (modeType == 'add') {
      this.userGroupId = 0
      this.description = ""
      this.userGroupName = ""
      this.permission = []

      this.modalRef = this.modalService.show(template, {class: 'modal-user-group'})
    } else {
      this.loading = true

      this.userGroupServices.getById(id).subscribe((r: any) => {
        this.userGroupId = r.id
        this.description = r.description
        this.userGroupName = r.name
        this.permission = []
        this.permission = r.permissions
        r.allPermissions.forEach((element: any) => {
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
        this.loading = false
        this.modalRef = this.modalService.show(template, {class: 'modal-user-group'})
      })
    }

    setTimeout(() => {
      $("[autofocus]").focus()
    })
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
   * This method is used to save record
   * @method save
   */
  save() {

    let request: any = {
      id: 0,
      name: this.userGroupName,
      description: this.description,
      permissions: this.permission
    }
    if (this.permission.length > 0) {
      if (this.userGroupId > 0) {
        request.id = this.userGroupId
        this.userGroupServices.update(this.userGroupId, request).subscribe(r => {
          this.reload()
          this.toastr.success('Record created successfully')
          this.modalRef.hide()
        })

      } else {
        this.userGroupServices.create(request).subscribe(r => {
          this.table.rows.insert(r)
          this.toastr.success('Record created successfully')
          this.modalRef.hide()
        })
      }
    } else {
      this.toastr.error('At least one permission should be selected for the user group.')
    }
  }

  /**
   * This method is used to delete record
   * @method delete
   * @param {number} id type which contains id to delete record
   * @param {any} row type which contains entire selected row
   */
  delete(id: number, row: any) {
    return new Promise((resolve, reject) => {
      this.userGroupServices.delete(id).subscribe(r => {
        row.delete()
        resolve(r)
      }, e => {
        reject()
      })
    })
  }

}