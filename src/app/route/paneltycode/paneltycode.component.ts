import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../app.component';
import { ContactTitle, ContactTitleDTO } from '../../types/contactTitle';
import { PenaltyCodeServices } from './penaltycode.services';
import { Router } from '@angular/router';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';

declare const $: any

/**
*  This component contains all function that are used in PaneltycodeComponent
* @class PaneltycodeComponent
*/

@Component({
  templateUrl: './paneltycode.component.html',
  styleUrls: ['./paneltycode.component.scss']
})
export class PaneltycodeComponent implements OnInit, OnDestroy {

  /**
  *  Panelty Code add/edit form
  * @property paneltycodeform
  */
  @ViewChild('paneltycodeform',{static: true})
  private paneltycodeform: TemplateRef<any>


  modalRef: BsModalRef
  isNew: boolean = true

  loading: boolean = false
  private table: any
  private filter: any
  private specialColumn: any
  penaltyCodeId: number
  search: string
  showPenaltyCodeAddBtn: string = 'show'
  private showPenaltyCodeeDeleteBtn: string = 'show'

  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private zone: NgZone,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private penaltyCodeServices: PenaltyCodeServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
  ) {
    this.showPenaltyCodeAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    this.showPenaltyCodeeDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEMASTERDATA)

    this.specialColumn = new $.fn.dataTable.SpecialColumn([{
      id: 'EDIT_PENALTY_CODE',
      title: 'Edit',
      customClass: this.showPenaltyCodeAddBtn
    }, {
      id: 'DELETE_PENALTY_CODE',
      title: 'Delete',
      customClass: this.showPenaltyCodeeDeleteBtn
    }], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'Penalty Code'
    const vm = this
    this.filter = {} as any
    vm.table = $('#dt-penaltycode').DataTable({
      aaSorting: [[0, 'asc']],

      ajax: this.penaltyCodeServices.getAllPenaltyCode({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'Penalty Code',
          data: 'paneltyCode',
          class: ''
        },
        {
          title: 'Code Section',
          data: 'codeSection',
          class: ''
        },
        {
          title: 'Description',
          data: 'description',
          class: ''
        },
        this.specialColumn
      ],
      drawCallback: (setting: any) => {
        if (vm.showPenaltyCodeAddBtn == "hide" && vm.showPenaltyCodeeDeleteBtn == 'hide') {
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
            if (actionId == "EDIT_PENALTY_CODE") {
              vm.isNew = false
              vm.penaltyCodeId = data.id
              vm.openModalForm(vm.paneltycodeform, data.id, false)
            }
            if (actionId == "DELETE_PENALTY_CODE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })
      }
    })
  }

  /**
  * This method will be destroy all elements and other values from whole module
  * @method ngOnDestroy
  */
  ngOnDestroy() {
    $('#dt-penaltycode tbody').off('click')
    $('#dt-penaltycode').off('draw.dt')
  }

  /**
  * This method is used for filter/search records from datatable
  * @method searchPenaltyCode
  * @param {string} srch type any which contains string that can be filtered from datatable
  */
  searchPenaltyCode(srch: string) {
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
      this.penaltyCodeId = 0
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
      this.penaltyCodeServices.delete(id).subscribe((r: any) => {
        row.delete()
        resolve(r)
      }, e => {
        reject()
      })
    })
  }
}