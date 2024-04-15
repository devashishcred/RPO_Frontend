import { Component, ElementRef, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { assign, identity, pickBy } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';
import { constantValues } from '../../app.constantValues';
import { SubJobTypeCategoryDTO } from './subjobtypecategory';
import { SubJobTypeCategoryServices } from './subjobtypecategory.services';
import { JobTypeServices } from '../jobtype/jobType.services'
import { UserRightServices } from '../../services/userRight.services';

import * as _ from 'underscore';

declare const $: any

/**
 * This component contains all function that are used in SubJobTypeCategoryComponent
 * @class SubJobTypeCategoryComponent
 */
@Component({
  templateUrl: './subjobtypecategory.component.html',
  styleUrls: ['./subjobtypecategory.component.scss']
})
export class SubJobTypeCategoryComponent implements OnInit {

  /**
   *  formSubJobTypeCategory add/edit form
   * @property formSubJobTypeCategory
   */
  @ViewChild('formSubJobTypeCategory', {static: true})
  private formSubJobTypeCategory: TemplateRef<any>

  modalRef: BsModalRef
  private specialColumn: any
  private table: any
  filter: any = {}
  search: string
  isNew: boolean = false
  subJobTypeCategoryId: any

  showSubJobTypeCategoryAddBtn: string = 'hide'
  showSubJobTypeCategoryViewBtn: string = 'hide'
  showSubJobTypeCategoryDeleteBtn: string = 'hide'
  loading: any;

  constructor(
    private router: Router,
    private zone: NgZone,
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private subJobTypeCategoryServices: SubJobTypeCategoryServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private jobTypeServices: JobTypeServices
  ) {
    this.showSubJobTypeCategoryAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDFEESCHEDULEMASTER)
    this.showSubJobTypeCategoryDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEFEESCHEDULEMASTER)
    this.showSubJobTypeCategoryViewBtn = this.userRight.checkAllowButton(this.constantValues.VIEWFEESCHEDULEMASTER)
    this.specialColumn = new $.fn.dataTable.SpecialColumn([], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    document.title = 'Project Type Description  '
    const vm = this
    vm.table = $('#dt-sub-job-type-category').DataTable({
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
      "aaSorting": [[1, "asc"]],
      ajax: this.subJobTypeCategoryServices.getAllSubJobTypesCategory({
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
          data: 'name',
          class: 'clickable'
        },
        {
          title: 'Current Status Of Filing',
          data: 'isCurrentStatusOfFiling',
          class: 'clickable',
          render: function (data: any, type: any, dataToSet: any) {
            return data ? 'Yes' : 'No';
          }
        },

        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.more_vert').hide();
        if (this.showSubJobTypeCategoryAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
        if (this.showSubJobTypeCategoryDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.showSubJobTypeCategoryAddBtn == "hide" && vm.showSubJobTypeCategoryDeleteBtn == 'hide') {
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
              vm.subJobTypeCategoryId = data.id
              vm.openModalForm(vm.formSubJobTypeCategory, data.id, false)
            }
            if (actionId == "DELETE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })

        $('#dt-sub-job-type-category tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()

          if ($(this).hasClass('disabled')) {
            return
          }
          if ($(this).hasClass('delete-icon')) {
            vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
          }
          if ($(this).hasClass('edit-icon')) {
            vm.subJobTypeCategoryId = data.id
            vm.openModalForm(vm.formSubJobTypeCategory, data.id, false)
          }
        })


        $('#dt-sub-job-type-category tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.subJobTypeCategoryId = data.id
            vm.openModalForm(vm.formSubJobTypeCategory, data.id, false)
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
      this.subJobTypeCategoryId = ''
    }
    this.modalRef = this.modalService.show(template, {class: 'modal-md', backdrop: 'static', 'keyboard': false})
  }

  /**
   * This method is used to delete records from database
   * @method delete
   * @param {number} id  of {{name}} to delete
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
   * @method searchSubJobTypeCategory
   * @param {string} srch type any which contains string that can be filtered from datatable
   */
  searchSubJobTypeCategory(srch: string) {
    this.table.search(srch).draw()
  }
}

