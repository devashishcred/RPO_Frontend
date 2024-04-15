import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../app.component';
import { DobPenalty, DobPenaltyDTO } from './dobPenalty';
import { DobPenaltyServices } from './dobPenalty.services';
import { Router } from '@angular/router';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';

declare const $: any
/**
*  This component contains all function that are used in DobPenaltyComponent
* @class DobPenaltyComponent
*/
@Component({
  templateUrl: './dobPenalty.component.html',
  styleUrls: ['./dobPenalty.component.scss']
})
export class DobPenaltyComponent implements OnInit, OnDestroy {

  /**
  *  DobPenaltyComponent add/edit form
  * @property DobPenaltyComponent
  */
  @ViewChild('dobpenaltyform', { static: true })
  private dobpenaltyform: TemplateRef<any>


  modalRef: BsModalRef
  isNew: boolean = true
  loading: boolean = false
  private table: any
  private filter: any
  private specialColumn: any
  id: number
  search: string
  showDobPenaltyAddBtn: string = 'hide'
  private showDobPenaltyDeleteBtn: string = 'hide'

  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private zone: NgZone,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private dobPenaltyServices: DobPenaltyServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
  ) {
    this.showDobPenaltyAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    this.showDobPenaltyDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEMASTERDATA)

    this.specialColumn = new $.fn.dataTable.SpecialColumn([{
      id: 'EDIT_TITLE',
      title: 'Edit',
      customClass: this.showDobPenaltyAddBtn
    }, {
      id: 'DELETE_TITLE',
      title: 'Delete',
      customClass: this.showDobPenaltyDeleteBtn
    }], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'DOB Penalty Schedule'
    const vm = this
    this.filter = {} as any
    vm.table = $('#dt-dobpenalty').DataTable({
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

      ajax: this.dobPenaltyServices.getRecords({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'Section of Law',
          data: 'sectionOfLaw',
          class: 'clickable',
        },
        {
          title: 'Classification',
          data: 'classification',
          class: 'min-auto clickable'
        },
        {
          title: 'Infraction Code',
          data: 'infractionCode',
          class: 'min-auto clickable'
        },
        {
          title: 'Violation Description',
          data: 'violationDescription',
          class: 'clickable',
        },
        {
          title: 'Cure',
          data: 'cure',
          class: 'min-auto clickable',
          render: function (data: any, type: any, dataToSet: any) {
            if (data) {
              return "Yes";
            } else {
              return "No";
            }
          }
        },
        {
          title: 'Stipulation',
          data: 'stipulation',
          class: 'min-auto clickable',
          render: function (data: any, type: any, dataToSet: any) {
            if (data) {
              return "Yes";
            } else {
              return "No";
            }
          }
        },
        {
          title: 'Standard Penalty ($)',
          data: 'formattedStandardPenalty',
          class: 'clickable text-right',
        },
        {
          title: 'Mitigated Penalty',
          data: 'mitigatedPenalty',
          class: 'min-auto clickable',
          render: function (data: any, type: any, dataToSet: any) {
            if (data) {
              return "Yes";
            } else {
              return "No";
            }
          }
        },
        {
          title: 'Default Penalty ($)',
          data: 'formattedDefaultPenalty',
          class: 'clickable text-right',
        },
        {
          title: 'Aggravated I Penalty ($)',
          data: 'formattedAggravatedPenalty_I',
          class: 'clickable text-right',
        },
        {
          title: 'Aggravated I Default Penalty ($)',
          data: 'formattedAggravatedDefaultPenalty_I',
          class: 'clickable text-right',
        },
        {
          title: 'Aggravated II Penalty ($)',
          data: 'formattedAggravatedPenalty_II',
          class: 'clickable text-right',
        },
        {
          title: 'Aggravated II Default – Max Penalty ($)',
          data: 'formattedAggravatedDefaultMaxPenalty_II',
          class: 'clickable text-right',
        },

        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.more_vert').hide();
        if (this.showDobPenaltyAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
        if (this.showDobPenaltyDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.showDobPenaltyAddBtn == "hide" && vm.showDobPenaltyDeleteBtn == 'hide') {
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
              vm.openModalForm(vm.dobpenaltyform, data.id, false)
            }
            if (actionId == "DELETE_TITLE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })
        $('#dt-dobpenalty tbody').on('click', 'span', function (ev: any) {
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
            vm.openModalForm(vm.dobpenaltyform, data.id, false)
          }
        })
        $('#dt-dobpenalty tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.isNew = false
            vm.id = data.id
            vm.openModalForm(vm.dobpenaltyform, data.id, false)
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
    $('#dt-dobpenalty tbody').off('click')
    $('#dt-dobpenalty').off('draw.dt')
  }

  /**
  * This method is used for filter/search records from datatable
  * @method searchDOBPenalty
  * @param {string} srch type any which contains string that can be filtered from datatable
  */
  searchDOBPenalty(srch: string) {
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
    this.modalRef = this.modalService.show(template, { class: 'modal-dob-penalty', backdrop: 'static', 'keyboard': false })
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
      this.dobPenaltyServices.delete(id).subscribe(r => {
        row.delete()
        resolve(r)
      }, e => {
        reject()
      })
    })
  }
}