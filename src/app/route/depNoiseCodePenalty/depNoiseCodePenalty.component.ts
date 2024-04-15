import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../app.component';
import { DepNoiseCodePenalty, DepNoiseCodePenaltyDTO } from './depNoiseCodePenalty';
import { DepNoiseCodePenaltyServices } from './depNoiseCodePenalty.services';
import { Router } from '@angular/router';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';

declare const $: any
/**
*  This component contains all function that are used in DepNoiseCodePenaltyComponent
* @class DepNoiseCodePenaltyComponent
*/
@Component({
  templateUrl: './depNoiseCodePenalty.component.html',
  styleUrls: ['./depNoiseCodePenalty.component.scss']
})
export class DepNoiseCodePenaltyComponent implements OnInit, OnDestroy {

  /**
  *  DepPenaltyComponent add/edit form
  * @property DepPenaltyComponent
  */
  @ViewChild('deppenaltyform',{static: true})
  private deppenaltyform: TemplateRef<any>


  modalRef: BsModalRef
  isNew: boolean = true
  loading: boolean = false
  private table: any
  private filter: any
  private specialColumn: any
  id: number
  search: string
  showDepPenaltyAddBtn: string = 'hide'
  private showDepPenaltyDeleteBtn: string = 'hide'

  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private zone: NgZone,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private depNoiseCodePenaltyServices: DepNoiseCodePenaltyServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
  ) {
    this.showDepPenaltyAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    this.showDepPenaltyDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEMASTERDATA)

    this.specialColumn = new $.fn.dataTable.SpecialColumn([{
      id: 'EDIT_TITLE',
      title: 'Edit',
      customClass: this.showDepPenaltyAddBtn
    }, {
      id: 'DELETE_TITLE',
      title: 'Delete',
      customClass: this.showDepPenaltyDeleteBtn
    }], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'DEP Noise Code Penalty Schedule'
    const vm = this
    this.filter = {} as any
    vm.table = $('#dt-deppenalty').DataTable({
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

      ajax: this.depNoiseCodePenaltyServices.getRecords({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'Section of Law',
          data: 'sectionOfLaw',
          class: 'min-auto clickable'
        },
        {
          title: 'Violation Description',
          data: 'violationDescription',
          class: 'min-auto clickable'
        },
        {
          title: 'Compliance',
          data: 'compliance',
          class: 'min-auto clickable'
        },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.more_vert').hide();
        if (this.showDepPenaltyAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
        if (this.showDepPenaltyDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.showDepPenaltyAddBtn == "hide" && vm.showDepPenaltyDeleteBtn == 'hide') {
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
              vm.openModalForm(vm.deppenaltyform, data.id, false)
            }
            if (actionId == "DELETE_TITLE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })
          $('#dt-deppenalty tbody').on('click', 'span', function (ev: any) {
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
              vm.openModalForm(vm.deppenaltyform, data.id, false)
            }
          })
          $('#dt-deppenalty tbody').on('click', 'td.clickable', function (ev: any) {
            const row = vm.table.row($(this).parents('tr'))
            const data = row.data()
            if ($(this).hasClass('clickable')) {
              vm.isNew = false
              vm.id = data.id
              vm.openModalForm(vm.deppenaltyform, data.id, false)
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
    $('#dt-deppenalty tbody').off('click')
    $('#dt-deppenalty').off('draw.dt')
  }

  /**
  * This method is used for filter/search records from datatable
  * @method searchDEPPenalty
  * @param {string} srch type any which contains string that can be filtered from datatable
  */
  searchDEPPenalty(srch: string) {
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
    this.modalRef = this.modalService.show(template, { class: 'modal-dep-penalty', backdrop: 'static', 'keyboard': false })
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
      this.depNoiseCodePenaltyServices.delete(id).subscribe(r => {
        row.delete()
        resolve(r)
      }, e => {
        reject()
      })
    })
   }
}