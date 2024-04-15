import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../app.component';
import { DohmhPenalty, DohmhPenaltyDTO } from './dohmhPenalty';
import { DohmhPenaltyServices } from './dohmhPenalty.services';
import { Router } from '@angular/router';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';

declare const $: any
/**
*  This component contains all function that are used in DohmhPenaltyComponent
* @class DohmhPenaltyComponent
*/
@Component({
  templateUrl: './dohmhPenalty.component.html',
  styleUrls: ['./dohmhPenalty.component.scss']
})
export class DohmhPenaltyComponent implements OnInit, OnDestroy {

  /**
  *  DohmhPenaltyComponent add/edit form
  * @property DohmhPenaltyComponent
  */
  @ViewChild('dohmhpenaltyform', { static: true })
  private dohmhpenaltyform: TemplateRef<any>


  modalRef: BsModalRef
  isNew: boolean = true
  loading: boolean = false
  private table: any
  private filter: any
  private specialColumn: any
  id: number
  search: string
  showDohmhPenaltyAddBtn: string = 'hide'
  private showDohmhPenaltyDeleteBtn: string = 'hide'

  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private zone: NgZone,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private dohmhPenaltyServices: DohmhPenaltyServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
  ) {
    this.showDohmhPenaltyAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    this.showDohmhPenaltyDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEMASTERDATA)

    this.specialColumn = new $.fn.dataTable.SpecialColumn([{
      id: 'EDIT_TITLE',
      title: 'Edit',
      customClass: this.showDohmhPenaltyAddBtn
    }, {
      id: 'DELETE_TITLE',
      title: 'Delete',
      customClass: this.showDohmhPenaltyDeleteBtn
    }], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'DOHMH Cooling Tower Penalty Schedule'
    const vm = this
    this.filter = {} as any
    vm.table = $('#dt-dohmhpenalty').DataTable({
      aaSorting: [[0, 'asc']],
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
      ajax: this.dohmhPenaltyServices.getRecords({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'Section of Law',
          data: 'sectionOfLaw',
          class: 'clickable',
          width: 164,
        },
        {
          title: 'Description',
          data: 'description',
          class: 'min-auto'
        },
        {
          title: 'Penalty: First Violation ($)',
          data: 'formattedPenaltyFirstViolation',
          class: 'clickable text-right',
          width: 272,
        },
        {
          title: 'Repeat Violation ($)',
          data: 'formattedPenaltyRepeatViolation',
          class: 'clickable text-right',
          width: 210,
        },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.more_vert').hide();
        if (this.showDohmhPenaltyAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
        if (this.showDohmhPenaltyDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.showDohmhPenaltyAddBtn == "hide" && vm.showDohmhPenaltyDeleteBtn == 'hide') {
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
              vm.openModalForm(vm.dohmhpenaltyform, data.id, false)
            }
            if (actionId == "DELETE_TITLE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })
        $('#dt-dohmhpenalty tbody').on('click', 'span', function (ev: any) {
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
            vm.id = data.id
            vm.openModalForm(vm.dohmhpenaltyform, data.id, false)
          }
        })
        $('#dt-dohmhpenalty tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.isNew = false
            vm.id = data.id
            vm.openModalForm(vm.dohmhpenaltyform, data.id, false)
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
    $('#dt-dohmhpenalty tbody').off('click')
    $('#dt-dohmhpenalty').off('draw.dt')
  }

  /**
  * This method is used for filter/search records from datatable
  * @method searchDOTPenalty
  * @param {string} srch type any which contains string that can be filtered from datatable
  */
  searchDOHMHPenalty(srch: string) {
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
    this.modalRef = this.modalService.show(template, { class: 'modal-dohmh-penalty', backdrop: 'static', 'keyboard': false })
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
      this.dohmhPenaltyServices.delete(id).subscribe(r => {
        row.delete()
        resolve(r)
      }, e => {
        reject()
      })
    })
  }
}