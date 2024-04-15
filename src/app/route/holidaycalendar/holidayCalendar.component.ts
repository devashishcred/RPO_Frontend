import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../app.component';
import { HolidayCalendarServices } from './holidayCalendar.services';
import { Router } from '@angular/router';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';

import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';

declare const $: any


/**
* This component contains all function that are used in Holiday Calendar Component
* @class HolidayCalendarComponent
*/
@Component({
  templateUrl: './holidayCalendar.component.html',
  styleUrls: ['./holidayCalendar.component.scss']
})
export class HolidayCalendarComponent implements OnInit, OnDestroy {

  /**
  * holidaycalendarform add/edit form
  * @property Form
  */
  @ViewChild('holidaycalendarform',{static: true})
  private holidaycalendarform: TemplateRef<any>

  modalRef: BsModalRef
  isNew: boolean = true
  loading: boolean = false
  private table: any
  private filter: any
  private specialColumn: any
  holidayId: number
  search: string
  showHolidayCalendarAddBtn: string = 'hide'
  private showHolidayCalendarDeleteBtn: string = 'hide'
  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private zone: NgZone,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private holidayCalendarServices: HolidayCalendarServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
  ) {
    this.showHolidayCalendarAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    this.showHolidayCalendarDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEMASTERDATA)


    this.specialColumn = new $.fn.dataTable.SpecialColumn([{
      id: 'EDIT',
      title: 'Edit',
      customClass: this.showHolidayCalendarAddBtn
    }, {
      id: 'DELETE',
      title: 'Delete',
      customClass: this.showHolidayCalendarDeleteBtn
    }], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'Holiday Calendar'
    const vm = this
    this.filter = {} as any
    vm.table = $('#dt-company-types').DataTable({
      paging: true,
      dom: "<'row'<'col-sm-12'tr>>" +"<'row'<'col-sm-12 col-md-2'l><'col-sm-12 col-md-3'i><'col-sm-12 col-md-7'p>>",
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
      columnDefs: [
				{ type: 'date', targets: [1] }, //specify your date column number,starting from 0        
			],
      ajax: this.holidayCalendarServices.getRecords({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'Name',
          data: 'name',
          class: 'clickable'
        },
        {
          title: 'Holiday Date',
          data: 'holidayDate',
          class: 'clickable'
        },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.more_vert').hide();
        if (this.showHolidayCalendarAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
        if (this.showHolidayCalendarDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.showHolidayCalendarAddBtn == "hide" &&  vm.showHolidayCalendarDeleteBtn == 'hide') {
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
              vm.isNew = false
              vm.holidayId = data.id
              vm.openModalForm(vm.holidaycalendarform, data.id, false)
            }
            if (actionId == "DELETE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })
          $('#dt-company-types tbody').on('click', 'span', function (ev: any) {
            const row = vm.table.row($(this).parents('tr'))
            const data = row.data()
            if ($(this).hasClass('delete-icon')) {
              vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
            }
            if ($(this).hasClass('edit-icon')) {
              vm.isNew = false
              vm.holidayId = data.id
              vm.openModalForm(vm.holidaycalendarform, data.id, false)
            }
          })
          $('#dt-company-types tbody').on('click', 'td.clickable', function (ev: any) {
            const row = vm.table.row($(this).parents('tr'))
            const data = row.data()
            if ($(this).hasClass('clickable')) {
              vm.isNew = false
              vm.holidayId = data.id
              vm.openModalForm(vm.holidaycalendarform, data.id, false)
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
    $('#dt-company-types tbody').off('click')
    $('#dt-company-types').off('draw.dt')
  }

  /**
  * This method is used for filter/search records from datatable
  * @method searchHoldiays
  * @param {string} srch type any which contains string that can be filtered from datatable
  */
  searchHoldiays(srch: string) {
    this.table.search(srch).draw()
  }

  /**
  * This method is used to open modal popup for holiday form
  * @method openModalForm
  * @param {any} template type which contains template of create/edit module
  * @param {number} id it is optional which contains id if record is in edit mode
  * @param {boolean} isNew it is optional which contains true if it is new record and false when it is old record
  */
  openModalForm(template: TemplateRef<any>, id?: number, isNew?: boolean) {
    if (isNew) {
      this.isNew = true
      this.holidayId = 0
    }
    this.modalRef = this.modalService.show(template, { class: 'modal-address-type', backdrop: 'static', 'keyboard': false })
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
      this.holidayCalendarServices.delete(id).subscribe(r => {
        row.delete()
        resolve(r)
      }, e => {
        reject()
      })
    })
  }
}