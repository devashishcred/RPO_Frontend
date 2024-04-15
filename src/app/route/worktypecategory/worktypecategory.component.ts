import { Component, ElementRef, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { assign, identity, pickBy } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';
import { constantValues } from '../../app.constantValues';
import { WorkTypeCategory } from './worktypecategory';
import { WorkTypeCategoryServices } from './worktypecategory.services';
import { JobTypeServices } from '../jobtype/jobType.services';
import { UserRightServices } from '../../services/userRight.services';

declare const $: any

/**
 * This component contains all function that are used in WorkTypeCategoryComponent
 * @class WorkTypeCategoryComponent
 */
@Component({
  templateUrl: './worktypecategory.component.html',
  styleUrls: ['./worktypecategory.component.scss']
})
export class WorkTypeCategoryComponent implements OnInit {

  @ViewChild('formWorkTypeCategory', {static: true})
  private formWorkTypeCategory: TemplateRef<any>

  modalRef: BsModalRef
  private specialColumn: any
  private table: any
  private filter: any = {}
  search: string
  isNew: boolean = false
  private idRfpJobType: number
  private idSubJobTypeCategory: number
  idRfpSubJobType: number
  showServiceGroupAddBtn: string = 'hide'
  showServiceGroupDeleteBtn: string = 'hide'
  private showServiceGroupViewBtn: string = 'hide'
  loading: boolean = false

  constructor(
    private router: Router,
    private zone: NgZone,
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private workTypeCategoryServices: WorkTypeCategoryServices,
    private jobTypeServices: JobTypeServices,
    private userRight: UserRightServices,
    private constantValues: constantValues
  ) {

    this.showServiceGroupAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDFEESCHEDULEMASTER)
    this.showServiceGroupDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEFEESCHEDULEMASTER)
    this.showServiceGroupViewBtn = this.userRight.checkAllowButton(this.constantValues.VIEWFEESCHEDULEMASTER)

    this.specialColumn = new $.fn.dataTable.SpecialColumn([
      {
        id: 'EDIT',
        title: 'Edit',
        customClass: this.showServiceGroupAddBtn
      },
      {
        id: 'DELETE',
        title: 'Delete',
        customClass: this.showServiceGroupDeleteBtn
      }
    ], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    document.title = 'Service Groups'
    const vm = this
    vm.table = $('#dt-work').DataTable({
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
      "aaSorting": [[3, "asc"]],
      ajax: this.workTypeCategoryServices.getCheckListGroup({
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
          width: 260,
          class: 'clickable'
        },
        {
          title: 'Project Sub Type',
          data: 'rfpSubJobType',
          class: 'clickable'
        },
        {
          title: 'Service Group',
          data: 'name',
          class: 'clickable'
        },
        {
          title: 'order',
          data: 'displayOrder',
          class: 'clickable'
        },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.more_vert').hide();
        if (this.showServiceGroupAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
        if (this.showServiceGroupDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.showServiceGroupAddBtn == "hide" && vm.showServiceGroupDeleteBtn == 'hide') {
          $('.select-column').hide()
        } else {
          $('.select-column').show()
        }
      },
      initComplete: () => {
        this.specialColumn
          .ngZone(vm.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()
            if (actionId == "EDIT") {
              vm.idRfpSubJobType = data.id
              vm.openModalForm(vm.formWorkTypeCategory, data.id, false)
            }
            if (actionId == "DELETE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })
        $('#dt-work tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('disabled')) {
            return
          }
          if ($(this).hasClass('delete-icon')) {
            vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
          }
          if ($(this).hasClass('edit-icon')) {
            vm.idRfpSubJobType = data.id
            vm.openModalForm(vm.formWorkTypeCategory, data.id, false)
          }
        })
        $('#dt-work tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.idRfpSubJobType = data.id
            vm.openModalForm(vm.formWorkTypeCategory, data.id, false)
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
      this.idRfpSubJobType = null
    }
    this.modalRef = this.modalService.show(template, {class: 'modal-md', backdrop: 'static', 'keyboard': false})
  }

  /**
   * This method is used to delete record
   * @method delete
   * @param {number} id type which contains id to delete record
   * @param {any} row type which contains entire selected row
   */
  private delete(id: number, row: any): Promise<{}> {
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
   * This method is used for filter/search records from datatable
   * @method searchWorkType
   * @param {string} srch type any which contains string that can be filtered from datatable
   */
  searchWorkType(srch: string) {
    this.table.search(srch).draw()
  }
}

