import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../app.component';
import { FdnyPenalty, FdnyPenaltyDTO } from './fdnyPenalty';
import { FdnyPenaltyServices } from './fdnyPenalty.services';
import { Router } from '@angular/router';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';

declare const $: any
/**
*  This component contains all function that are used in FdnyPenaltyComponent
* @class FdnyPenaltyComponent
*/
@Component({
  templateUrl: './fdnyPenalty.component.html',
  styleUrls: ['./fdnyPenalty.component.scss']
})
export class FdnyPenaltyComponent implements OnInit, OnDestroy {

  /**
  *  FdnyPenaltyComponent add/edit form
  * @property FdnyPenaltyComponent
  */
  @ViewChild('fdnypenaltyform', { static: true })
  private fdnypenaltyform: TemplateRef<any>


  modalRef: BsModalRef
  isNew: boolean = true
  loading: boolean = false
  private table: any
  private filter: any
  private specialColumn: any
  id: number
  search: string
  showFdnyPenaltyAddBtn: string = 'hide'
  private showFdnyPenaltyDeleteBtn: string = 'hide'

  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private zone: NgZone,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private fdnyPenaltyServices: FdnyPenaltyServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
  ) {
    this.showFdnyPenaltyAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    this.showFdnyPenaltyDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEMASTERDATA)

    this.specialColumn = new $.fn.dataTable.SpecialColumn([{
      id: 'EDIT_TITLE',
      title: 'Edit',
      customClass: this.showFdnyPenaltyAddBtn
    }, {
      id: 'DELETE_TITLE',
      title: 'Delete',
      customClass: this.showFdnyPenaltyDeleteBtn
    }], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'FDNY Penalty Schedule'
    const vm = this
    this.filter = {} as any
    vm.table = $('#dt-fdnypenalty').DataTable({
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
      aaSorting: [[0, 'asc']],

      ajax: this.fdnyPenaltyServices.getRecords({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'Category RCNY',
          data: 'category_RCNY',
          class: 'clickable',
        },
        {
          title: 'Description of Violation',
          data: 'descriptionOfViolation',
          class: 'clickable',
          width: 150
        },
        {
          title: 'OATH Violation Code',
          data: 'oathViolationCode',
          class: 'clickable',
        },
        {
          title: 'First Violation Penalty ($)',
          data: 'formattedFirstViolationPenalty',
          class: 'text-right clickable',
          width: 100
        },
        {
          title: 'First Violation Mitigated Penalty ($)',
          data: 'formattedFirstViolationMitigatedPenalty',
          class: 'text-right clickable',
        },
        {
          title: 'First Violation Maximum Penalty ($)',
          data: 'formattedFirstViolationMaximumPenalty',
          class: 'text-right clickable',
        },
        {
          title: 'Second / Subsequent Violation Penalty ($)',
          data: 'formattedSecondSubsequentViolationPenalty',
          class: 'text-right clickable',
        },
        {
          title: 'Second / Subsequent Violation Mitigated Penalty ($)',
          data: 'formattedSecondSubsequentViolationMitigatedPenalty',
          class: 'text-right clickable',
        },
        {
          title: 'Second / Subsequent Violation Maximum Penalty ($)',
          data: 'formattedSecondSubsequentViolationMaximumPenalty',
          class: 'text-right clickable',
        },

        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.more_vert').hide();
        if (this.showFdnyPenaltyAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
        if (this.showFdnyPenaltyDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.showFdnyPenaltyAddBtn == "hide" && vm.showFdnyPenaltyDeleteBtn == 'hide') {
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
            if (actionId == "EDIT_TITLE") {
              vm.isNew = false
              vm.id = data.id
              vm.openModalForm(vm.fdnypenaltyform, data.id, false)
            }
            if (actionId == "DELETE_TITLE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })
        $('#dt-fdnypenalty tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if($(this).hasClass('disabled')) {
            return
          }
          if ($(this).hasClass('delete-icon')) {
            vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
          }
          if ($(this).hasClass('edit-icon')) {
            vm.isNew = false
            vm.id = data.id
            vm.openModalForm(vm.fdnypenaltyform, data.id, false)
          }
        })
        $('#dt-fdnypenalty tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.isNew = false
            vm.id = data.id
            vm.openModalForm(vm.fdnypenaltyform, data.id, false)
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
    $('#dt-fdnypenalty tbody').off('click')
    $('#dt-fdnypenalty').off('draw.dt')
  }

  /**
  * This method is used for filter/search records from datatable
  * @method searchFDNYPenalty
  * @param {string} srch type any which contains string that can be filtered from datatable
  */
  searchFDNYPenalty(srch: string) {
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
      this.id = 0
    }
    this.modalRef = this.modalService.show(template, { class: 'modal-fdny-penalty', backdrop: 'static', 'keyboard': false })
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
      this.fdnyPenaltyServices.delete(id).subscribe(r => {
        row.delete()
        resolve(r)
      }, e => {
        reject()
      })
    })
  }
}