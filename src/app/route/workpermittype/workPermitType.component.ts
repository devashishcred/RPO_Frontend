import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';

import { AppComponent } from '../../app.component';
import { Group } from '../../types/group';
import { WorkPermitTypeServices } from './workPermitType.services';
import { Message } from "../../app.messages";
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';
import { WorkPermitType } from './workPermitType';

declare const $: any

/**
 * This component contains all function that are used in Work Permit Type
 * @class WorkPermitTypeComponent
 */
@Component({
  templateUrl: './workPermitType.component.html',
  styleUrls: ['./workPermitType.component.scss']
})
export class WorkPermitTypeComponent implements OnInit, OnDestroy {

  @ViewChild('formworkpermittype', {static: true})
  formworkpermittype: TemplateRef<any>

  private errorMsg: any
  modalRef: BsModalRef

  new: boolean = true

  rec: any
  filter: any
  workPermitTypeId: number
  loading: boolean = false
  showWorkPermitTypeAddBtn: string = 'hide'
  showWorkPermitTypeDeleteBtn: string = 'hide'
  search: string

  private table: any
  private specialColumn: any

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private workPermitTypeServices: WorkPermitTypeServices,
    private message: Message,
    private zone: NgZone,
    private userRight: UserRightServices,
    private constantValues: constantValues,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    document.title = 'Work Permit Type'
    this.filter = {} as any
    const vm = this
    this.showWorkPermitTypeAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    this.showWorkPermitTypeDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEMASTERDATA)
    this.specialColumn = new $.fn.dataTable.SpecialColumn([
      {
        id: 'EDIT',
        title: 'Edit',
        customClass: this.showWorkPermitTypeAddBtn
      },
      {
        id: 'DELETE',
        title: 'Delete',
        customClass: this.showWorkPermitTypeDeleteBtn
      },

    ], false)
    this.delete = this.delete.bind(this)
    this.reload = this.reload.bind(this)

    this.table = $('#dt-workPermitType').DataTable({
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
      ajax: this.workPermitTypeServices.getAllJobWorkPermitTypes({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),

      columns: [
        {
          title: 'Project TYPE',
          data: 'jobType',
          class: 'clickable',
        },
        {
          title: 'APPLICATION TYPE',
          data: 'jobApplicationType',
          class: 'clickable',
          width: '200'
        },
        {
          title: 'Work Permit Type',
          data: 'description',
          class: 'clickable',
          width: '150'
        },
        {
          title: 'CODE',
          data: 'code',
          class: 'clickable',
          width: '100'
        },
        {
          title: 'COST',
          data: 'cost',
          class: 'clickable text-right',
          width: '100'
        },
        {
          title: 'Description',
          class: 'clickable',
          data: 'content',
          orderable: false
        },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.more_vert').hide();
        if (this.showWorkPermitTypeAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
        if (this.showWorkPermitTypeDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.showWorkPermitTypeAddBtn == "hide" && vm.showWorkPermitTypeDeleteBtn == 'hide') {
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
              this.workPermitTypeId = data.id
              vm.openModal(vm.formworkpermittype, data.id)
            }
            if (actionId == "DELETE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })

        $('#dt-workPermitType tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('disabled')) {
            return
          }
          if ($(this).hasClass('delete-icon')) {
            vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
          }
          if ($(this).hasClass('edit-icon')) {
            vm.workPermitTypeId = data.id
            vm.openModal(vm.formworkpermittype, data.id)
          }
        })

        $('#dt-workPermitType tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.workPermitTypeId = data.id
            vm.openModal(vm.formworkpermittype, data.id)
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
   */
  openModal(template: TemplateRef<any>, id?: number) {
    this.new = !!!id

    if (this.new) {
      this.new = true
      this.modalRef = this.modalService.show(template, {class: 'modal-lg'})
    } else {
      this.new = false
      this.modalRef = this.modalService.show(template, {class: 'modal-lg'})
    }

    setTimeout(() => {
      $("[autofocus]").focus()
    })
  }

  /**
   * This method is used to save record
   * @method save
   */
   save() {
    this.loading = true;
    if (!this.rec.id) {
      this.workPermitTypeServices.create(this.rec).subscribe(r => {
        this.loading = false;
        this.table.rows.insert(r)
        this.toastr.success('Record created successfully')
        this.reload()
        this.modalRef.hide()
      }, e => {
        this.loading = false
      })
    } else {
      this.workPermitTypeServices.update(this.rec.id, this.rec).subscribe(r => {
        this.loading = false;
        this.table.row(this.table.rows.idxByDataId(this.rec.id)).update({...this.rec})
        this.toastr.success('Record updated successfully')
        this.reload()
        this.modalRef.hide()
      }, e => {
        this.loading = false
      })
    }
  }

  /**
   * This method is used to delete record
   * @method delete
   * @param {number} id type which contains id to delete record
   * @param {any} row type which contains entire selected row
   */
  delete(id: number, row: any) {
    return new Promise((resolve, reject) => {
      this.workPermitTypeServices.delete(id).subscribe(r => {
        row.delete()
        resolve(r)
      }, e => {
        reject()
      })
    })
  }

  /**
   * This method is used for filter/search records from datatable
   * @method searchApplication
   * @param {string} srch type any which contains string that can be filtered from datatable
   */
  searchWorkPermit(srch: string) {
    this.table.search(srch).draw()
  }
}