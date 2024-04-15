import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../app.component';
import { TaskTypeServices } from './taskType.services';
import { Router } from '@angular/router';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';

declare const $: any

/**
 *  This component contains all function that are used in TaskTypeComponent
 * @class TaskTypeComponent
 */
@Component({
  templateUrl: './taskType.component.html',
  styleUrls: ['./taskType.component.scss']
})
export class TaskTypeComponent implements OnInit, OnDestroy {

  /**
   *  addTaskTypeForm add/edit form
   * @property addTaskTypeForm
   */
  @ViewChild('addTaskTypeForm', {static: true})
  private addTaskTypeForm: TemplateRef<any>

  modalRef: BsModalRef
  isNew: boolean = true
  loading: boolean = false
  private table: any
  private filter: any
  specialColumn: any
  taskTypeId: number
  search: string
  showTaskTypeAddBtn: string = 'hide'
  private showStatusToggleActiveBtn: string;
  private showStatusToggleBtn: string;
   showTaskTypeDeleteBtn: string = 'hide'

  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private zone: NgZone,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private taskTypeServices: TaskTypeServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
  ) {

    this.showTaskTypeAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    this.showTaskTypeDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEMASTERDATA)


    this.specialColumn = new $.fn.dataTable.SpecialColumn([
      {
        id: 'INACTIVE',
        title: 'Mark Inactive',
        customClass: 'inactive-btn'
      },
      {
        id: 'ACTIVE',
        title: 'Mark Active',
        customClass: 'active-btn'
      },
    ], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    document.title = 'Task Types'
    const vm = this
    this.filter = {} as any
    vm.table = $('#dt-task-types').DataTable({
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
      ajax: this.taskTypeServices.getRecords({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'Task Type',
          data: 'name',
          class: 'min-auto clickable'
        },
        {
          title: 'Status',
          data: 'isActive',
          class: 'min-auto clickable',
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.isActive) {
              return 'Active';
            } else {
              return 'Inactive';
            }
          }
        },
        this.specialColumn
      ],
      drawCallback: (setting: any) => {
        if (vm.showTaskTypeAddBtn == "hide" && vm.showTaskTypeDeleteBtn == 'hide') {
          $('.select-column').hide()
        } else {
          $('.select-column').show()
        }
      },
      rowCallback: ((row: any, data: any, index: any) => {
        if (this.showTaskTypeAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
        if (this.showTaskTypeDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
        if (data.isActive) {
          $(row).find('.inactive-btn').show();
          $(row).find('.active-btn').hide();
        } else {
          $(row).find('.inactive-btn').hide();
          $(row).find('.active-btn').show();
        }
        if (this.showTaskTypeAddBtn == 'hide') {
          $(row).find('.inactive-btn').hide();
          $(row).find('.active-btn').hide();
        }
      }),
      initComplete: () => {
        this.specialColumn
          .ngZone(this.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()
            if (actionId == "EDIT") {
              vm.isNew = false
              vm.taskTypeId = data.id
              vm.openModalForm(vm.addTaskTypeForm, data.id, false)
            }
            if (actionId == "DELETE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
            if (actionId == "INACTIVE" || actionId == "ACTIVE") {
              this.toggleTaskTypeStatus(data.id, actionId, data.name);
            }
          })
        $('#dt-task-types tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('disabled')) {
            return
          }
          if ($(this).hasClass('delete-icon')) {
            vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
          }
          if ($(this).hasClass('edit-icon')) {
            vm.isNew = false
            vm.taskTypeId = data.id
            vm.openModalForm(vm.addTaskTypeForm, data.id, false)
          }
        })
        $('#dt-task-types tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.isNew = false
            vm.taskTypeId = data.id
            vm.openModalForm(vm.addTaskTypeForm, data.id, false)
          }
        });
      }
    })
  }

  /**
   * This method will be destroy all elements and other values from whole module
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    $('#dt-task-types tbody').off('click')
    $('#dt-task-types').off('draw.dt')
  }

  /**
   * This method is used for toggle status of items from datatable
   * @method toggleTaskTypeStatus
   * @param {string} status,{id} id
   */
  private toggleTaskTypeStatus(tid: number, status: string, name: string) {
    this.loading = true;
    let apidata = {}
    apidata['id'] = tid;
    apidata['name'] = name;
    apidata['isActive'] = status == 'INACTIVE' ? false : true;
    this.taskTypeServices.toggleStatus(apidata).subscribe(r => {
      this.loading = false;
      this.toastr.success('Status Changed Successfully');
      this.reload();
    }, (e: any) => {
      this.toastr.error('An Error occured');
      this.reload();
    });

  };

  /**
   * This method is used for filter/search records from datatable
   * @method searchTaskType
   * @param {string} srch type any which contains string that can be filtered from datatable
   */
  searchTaskType(srch: string) {
    this.table.search(srch).draw()
  }

  /**
   * This method is used to open modal popup for openModalForm
   * @method openModalForm
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   * @param {boolean} isNew it is optional which contains true if it is new record and false when it is old record
   */
  openModalForm(template: TemplateRef<any>, id?: number, isNew?: boolean) {
    if (isNew) {
      this.isNew = true
      this.taskTypeId = 0
    }
    this.modalRef = this.modalService.show(template, {class: 'modal-task-type', backdrop: 'static', 'keyboard': false})
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
   * This method is used to delete record
   * @method delete
   * @param {number} id type which contains id to delete record
   * @param {any} row type which contains entire selected row
   */
  delete(id: number, row: any) {
    return new Promise((resolve, reject) => {
      this.taskTypeServices.delete(id).subscribe(r => {
        row.delete()
        resolve(r)
      }, e => {
        reject()
      })
    })
  }
}