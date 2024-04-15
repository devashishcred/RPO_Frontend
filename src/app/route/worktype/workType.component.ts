import { Component, ElementRef, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { assign, identity, pickBy } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';
import { constantValues } from '../../app.constantValues';
import { WorkTypeDTO } from './workType';
import { WorkTypeServices } from './workType.services';
import { JobTypeServices } from '../jobtype/jobType.services';
import { UserRightServices } from '../../services/userRight.services';

import * as _ from 'underscore';

declare const $: any

/**
 * This component contains all function that are used in WorkTypeComponent
 * @class WorkTypeComponent
 */
@Component({
  templateUrl: './workType.component.html',
  styleUrls: ['./workType.component.scss']
})
export class WorkTypeComponent implements OnInit {

  /**
   *  workTypeform add/edit form
   * @property workTypeform
   */
  @ViewChild('workTypeform', {static: true})
  private workTypeform: TemplateRef<any>

  modalRef: BsModalRef
  specialColumn: any
  private table: any
  filter: any = {}
  search: string
  isNew: boolean = false
  idRfpWorkType: number
  showServiceAddBtn: string = 'hide'
  showServiceDeleteBtn: string = 'hide'
  showServiceViewBtn: string = 'hide'
  loading: boolean;


  constructor(
    private router: Router,
    private zone: NgZone,
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private workTypeServices: WorkTypeServices,
    private jobTypeServices: JobTypeServices,
    private userRight: UserRightServices,
    private constantValues: constantValues
  ) {

    this.showServiceAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDFEESCHEDULEMASTER)
    this.showServiceDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEFEESCHEDULEMASTER)
    this.showServiceViewBtn = this.userRight.checkAllowButton(this.constantValues.VIEWFEESCHEDULEMASTER)


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
    document.title = 'Service Items'
    const vm = this
    vm.table = $('#dt-work-type').DataTable({
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
      "aaSorting": [[4, "asc"]],
      ajax: this.workTypeServices.getAllWorkTypes({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'Project Type',
          data: 'rfpJobType',
          class: 'clickable'
        },
        {
          title: 'Project Type Description',
          data: 'rfpSubJobTypeCategory',
          class: 'clickable'
        },
        {
          title: 'Project Sub Type',
          data: 'rfpSubJobType',
          class: 'clickable'
        },
        {
          title: 'Service Group',
          data: 'rfpServiceGroup',
          class: 'clickable'
        },
        {
          title: 'Service Item',
          data: 'name',
          class: 'clickable'
        },
        {
          title: 'Cost Type',
          data: 'costType',
          class: 'clickable',
          render: function (data: any, type: any, dataToSet: any) {
            if (data == 1) {
              return 'Fixed Cost'
            } else if (data == 2) {
              return 'Per Unit Price'
            } else if (data == 3) {
              return 'Additional Cost Per Unit'
            } else if (data == 4) {
              return 'Cost For Unit Range'
            } else if (data == 5) {
              return 'Minimum Cost'
            } else if (data == 6) {
              return 'Cumulative Cost'
            } else if (data == 7) {
              return 'Hourly Cost'
            } else {
              return '';
            }
          }
        },

        {
          title: 'Cost ($)',
          data: 'formattedCost',
          class: 'clickable text-right'
        },

        {
          title: 'Additional Unit Price ($)',
          data: 'additionalUnitPrice',
          class: 'clickable text-right',
          width: 140
        },
        {
          title: 'Status',
          data: 'isActive',
          class: '',
          width: '50px',
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
        if (vm.showServiceAddBtn == "hide" && vm.showServiceDeleteBtn == 'hide') {
          $('.select-column').hide()
        } else {
          $('.select-column').show()
        }
      },
      rowCallback: ((row: any, data: any, index: any) => {
        if (this.showServiceAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
        if (this.showServiceDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
        if (data.isActive) {
          $(row).find('.inactive-btn').show();
          $(row).find('.active-btn').hide();
        } else {
          $(row).find('.inactive-btn').hide();
          $(row).find('.active-btn').show();
        }
        if (this.showServiceAddBtn == 'hide') {
          $(row).find('.inactive-btn').hide();
          $(row).find('.active-btn').hide();
        }
      }),
      initComplete: () => {
        this.specialColumn
          .ngZone(vm.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()
            if (actionId == "EDIT") {
              vm.idRfpWorkType = data.id
              this.openModalForm(vm.workTypeform, data.id, false);
            }
            if (actionId == "DELETE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
            if (actionId == "INACTIVE" || actionId == "ACTIVE") {
              this.toggleTaskTypeStatus(data.id, actionId, data.name);
            }
          })
        $('#dt-work-type tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('disabled')) {
            return
          }
          if ($(this).hasClass('delete-icon')) {
            vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
          }
          if ($(this).hasClass('edit-icon')) {
            vm.idRfpWorkType = data.id
            vm.openModalForm(vm.workTypeform, data.id, false);
          }
        })
        $('#dt-work-type tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.idRfpWorkType = data.id
            vm.openModalForm(vm.workTypeform, data.id, false);
          }
        });
      }
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
   * This method is used to open modal popup for openModalForm
   * @method openModalForm
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   * @param {boolean} isNew it is optional which contains true if it is new record and false when it is old record
   */
  openModalForm(template: TemplateRef<any>, id?: number, isNew?: boolean) {
    this.isNew = false
    if (isNew) {
      this.isNew = true
      this.idRfpWorkType = null
    }
    this.modalRef = this.modalService.show(template, {class: 'modal-view-task', backdrop: 'static', 'keyboard': false})
  }

  /**
   * This method is used to delete record
   * @method delete
   * @param {number} id type which contains id to delete record
   * @param {any} row type which contains entire selected row
   */
  delete(id: number, row: any): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.jobTypeServices.delete(id).subscribe(r => {
        row.delete()
        this.reload()
        resolve(null)
      }, e => {
        reject()
      })
    })
  }

  /**
   * This method is used for toggle status of items from datatable
   * @method toggleTaskTypeStatus
   * @param {string} status,{id} id
   */
  toggleTaskTypeStatus(tid: number, status: string, name: string) {
    let apidata = {}
    apidata['id'] = tid;
    apidata['name'] = name;
    apidata['isActive'] = status == 'INACTIVE' ? false : true;
    this.workTypeServices.toggleStatus(apidata).subscribe(r => {
      this.toastr.success('Status Changed Successfully');
      this.reload();
    }, (e: any) => {
      this.reload();
    });

  };

  /**
   * This method is used for filter/search records from datatable
   * @method searchWorkType
   * @param {string} srch type any which contains string that can be filtered from datatable
   */
  searchWorkType(srch: string) {
    this.table.search(srch).draw()
  }
}

