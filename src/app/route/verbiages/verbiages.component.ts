import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

import { AppComponent } from '../../app.component';
import { Group } from '../../types/group';
import { VerbiagesServices } from './verbiages.services';
import { Message } from "../../app.messages";
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';
import { Verbiage } from './verbiage';

declare const $: any

/**
 * This component contains all function that are used in VerbiagesComponent
 * @class VerbiagesComponent
 */
@Component({
  templateUrl: './verbiages.component.html',
  styleUrls: ['./verbiages.component.scss']
})
export class VerbiagesComponent implements OnInit, OnDestroy {
  @ViewChild('formVerbiages', {static: true})
  formVerbiages: TemplateRef<any>

  errorMsg: any
  modalRef: BsModalRef

  new: boolean = true

  rec: any
  editContent: string;
  editVerbiageType: number;
  loading: boolean = false
  verbiageTypeList: any = []
  showVerbiageAddBtn: string = 'hide'
  private table: any
  private specialColumn: any

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private verbiagesServices: VerbiagesServices,
    private message: Message,
    private zone: NgZone,
    private userRight: UserRightServices,
    public constantValues: constantValues,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    document.title = 'Verbiage'
    this.showVerbiageAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)

    this.specialColumn = new $.fn.dataTable.SpecialColumn([{
      id: 'EDIT',
      title: 'Edit',
      customClass: this.showVerbiageAddBtn
    },

    ], false)
    this.delete = this.delete.bind(this)
    this.reload = this.reload.bind(this)
    this.verbiageTypeList.push({id: 1, itemName: 'Introduction'})
    this.verbiageTypeList.push({id: 5, itemName: 'Additional Scope/Exclusion'})
    this.verbiageTypeList.push({id: 6, itemName: 'Conclusion'})
    this.verbiageTypeList.push({id: 7, itemName: 'Sign'})
    this.verbiageTypeList.push({id: 10, itemName: 'Header'})

    this.table = $('#dt-verbiages').DataTable({
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
      columnDefs: [
        {type: 'date', targets: 3}, //specify your date column number,starting from 0
      ],
      // "aaSorting": [[3, 'desc']],
      ajax: this.verbiagesServices.get(),
      columns: [
        {
          title: 'VERBIAGE NAME',
          data: 'name',
          class: 'clickable'
        }, {
          title: 'CONTENT',
          data: 'content',
          class: 'clickable',
          width: 300,
          orderable: false
        }, {
          title: 'Last Modified By',
          data: 'lastModifiedBy',
          class: 'clickable',
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.lastModifiedBy) {
              return dataToSet.lastModifiedByEmployee
            } else {
              return dataToSet.createdByEmployee
            }
          }
        }, {
          title: 'Last Modified Date',
          data: 'lastModifiedDate', // lastModifiedByEmployee  this variable we are using before which i replaced with lastModifiedDate
          class: 'clickable',
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.lastModifiedDate) {
              return dataToSet.lastModifiedDate
            } else {
              return dataToSet.createdDate
            }
          }
        },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.more_vert').hide();
        $(row).find('.delete-icon').hide();
        if (this.showVerbiageAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
      }),
      drawCallback: (setting: any) => {
        if (this.showVerbiageAddBtn == "hide") {
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
              vm.openModal(vm.formVerbiages, data.id)
            }
            if (actionId == "DELETE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })
        $('#dt-verbiages tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('disabled')) {
            return
          }
          if ($(this).hasClass('edit-icon')) {
            vm.openModal(vm.formVerbiages, data.id)
          }
        })
      }
    })

    $('#dt-verbiages').on('draw.dt', () => {
      $('[data-toggle="tooltip"]').tooltip()
    })

    const vm = this

    $('#dt-verbiages tbody').on('click', 'i.fa-trash, td.clickable, input[type="checkbox"]', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()

      if ($(this).is('input[type="checkbox"]')) {
        ev.preventDefault()
        ev.stopPropagation()

        const status = $(this)
        const checked: boolean = status.prop('checked')
        vm.verbiagesServices.status(data.id, checked).subscribe(r => {
          status.prop('checked', checked)
        })

        return false
      }

      if ($(this).hasClass('clickable')) {
        vm.openModal(vm.formVerbiages, data.id)
      } else
        vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
    })
  }


  /**
   * This method will be destroy all elements and other values from whole module
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    $('#dt-verbiages tbody').off('click')
    $('#dt-verbiages').off('draw.dt')
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
   * This method is used to reload datatable
   * @method reload
   */
  getContent() {
    if (this.rec.verbiageType == 1) {
      if (this.editContent && this.editVerbiageType == this.rec.verbiageType && !this.new) {
        this.rec.content += '<p>Dear ##Name## ,</p>\n\n' + this.editContent
      } else {
        this.rec.content += '<p>Dear ##Name## ,</p>\n';
      }

    } else if (this.editVerbiageType != this.rec.verbiageType && this.editContent != '') {
      this.rec.content = '';
    }

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
      this.rec = {
        isActive: true
      } as Group

      this.modalRef = this.modalService.show(template, {class: 'modal-lg'})
    } else {
      this.verbiagesServices.getById(id).subscribe(r => {
        this.rec = r as Group
        this.editContent = this.rec.content;
        this.editVerbiageType = this.rec.verbiageType;
        this.modalRef = this.modalService.show(template, {class: 'modal-lg'})
      })
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
      this.verbiagesServices.create(this.rec).subscribe(r => {
        this.loading = false;
        this.table.rows.insert(r)
        this.toastr.success('Record created successfully')
        this.reload()
        this.modalRef.hide()
      }, e => {
        this.loading = false
      })
    } else {
      this.verbiagesServices.update(this.rec.id, this.rec).subscribe(r => {
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
      this.verbiagesServices.delete(id).subscribe(r => {
        row.delete()
        resolve(r)
      }, e => {
        reject()
      })
    })
  }
}