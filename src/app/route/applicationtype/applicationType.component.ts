import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';

import { AppComponent } from '../../app.component';
import { Group } from '../../types/group';
import { ApplicationTypeServices } from './applicationType.services';
import { Message } from "../../app.messages";
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';
import { ApplicationType } from './applicationtype';

declare const $: any
/**
* This component contains all function that are used in Application Type
* @class ApplicationTypeComponent
*/
@Component({
  templateUrl: './applicationType.component.html',
  styleUrls: ['./applicationType.component.scss']
})
export class ApplicationTypeComponent implements OnInit, OnDestroy {

  @ViewChild('formapplicationtype', { static: true })
  formapplicationtype: TemplateRef<any>

  private errorMsg: any
  modalRef: BsModalRef

  new: boolean = true
  search: string

  private rec: any
  private filter: any
  applicationTypeId: number
  loading: boolean = false
  showApplicationTypeAddBtn: string = 'hide'
  private showApplicationTypeDeleteBtn: string = 'hide'

  private table: any
  private specialColumn: any
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private applicationTypeServices: ApplicationTypeServices,
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
    document.title = 'Application Type'
    this.filter = {} as any
    this.showApplicationTypeAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    this.showApplicationTypeDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEMASTERDATA)
    this.specialColumn = new $.fn.dataTable.SpecialColumn([
      {
        id: 'EDIT',
        title: 'Edit',
        customClass: this.showApplicationTypeAddBtn
      },
      {
        id: 'DELETE',
        title: 'Delete',
        customClass: this.showApplicationTypeDeleteBtn
      },

    ], false)
    this.delete = this.delete.bind(this)
    this.reload = this.reload.bind(this)

    this.table = $('#dt-applicationType').DataTable({
      aaSorting: [[1, 'asc']],
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
      ajax: this.applicationTypeServices.getAllJobApplicationTypes({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      order: [0, 'asc'],
      columns: [
        {
          title: 'Project TYPE',
          data: 'parent',
          class: 'clickable'
        },
        {
          title: 'Application Type',
          data: 'description',
          width: '350',
          class: 'clickable'
        },
        
        {
          title: 'Description',
          data: 'content',
          class: 'clickable',
          orderable: false
        },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.more_vert').hide();
        if (this.showApplicationTypeAddBtn == 'hide') {
          // $(row).find('.edit-icon').hide();
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
        if (this.showApplicationTypeDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
          // $(row).find('.delete-icon').hide();
        }
      }),
      drawCallback: (setting: any) => {
        if (this.showApplicationTypeAddBtn == "hide" && this.showApplicationTypeDeleteBtn == "hide") {
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
              this.applicationTypeId = data.id
              vm.openModal(vm.formapplicationtype, data.id)
            }
            if (actionId == "DELETE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })

        $('#dt-applicationType tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('delete-icon')) {
            vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
          }
          if ($(this).hasClass('edit-icon')) {
            vm.applicationTypeId = data.id
            vm.openModal(vm.formapplicationtype, data.id)
          }
        })

        $('#dt-applicationType tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.applicationTypeId = data.id
            vm.openModal(vm.formapplicationtype, data.id)
          }
        });
      }
    })

    $('#dt-verbiages').on('draw.dt', () => {
      $('[data-toggle="tooltip"]').tooltip()
    })

    const vm = this

    $('#dt-verbiages tbody').on('click', 'i.fa-trash, td.clickable, input[type="checkbox"]', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()

      if ($(this).hasClass('clickable')) {
        //  vm.openModal(vm.formVerbiages, data.id)
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
  * This method is used to open modal popup for openModalForm
  * @method openModalForm
  * @param {any} template type which contains template of create/edit module
  * @param {number} id?? it is optional which contains id if record is in edit mode
  */
  openModal(template: TemplateRef<any>, id?: number) {
    this.new = !!!id

    if (this.new) {
      this.new = true
      this.modalRef = this.modalService.show(template, { class: 'modal-lg' })
    } else {
      this.applicationTypeServices.getById(id).subscribe(r => {
        this.rec = r as Group
        this.new = false
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' })
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
      this.applicationTypeServices.create(this.rec).subscribe(r => {
        this.loading = false;
        this.table.rows.insert(r)
        this.toastr.success('Record created successfully')
        this.reload()
        this.modalRef.hide()
      }, e => { this.loading = false })
    } else {
      this.applicationTypeServices.update(this.rec.id, this.rec).subscribe(r => {
        this.loading = false;
        this.table.row(this.table.rows.idxByDataId(this.rec.id)).update({ ... this.rec })
        this.toastr.success('Record updated successfully')
        this.reload()
        this.modalRef.hide()
      }, e => { this.loading = false })
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
      this.applicationTypeServices.delete(id).subscribe(r => {
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
  searchApplication(srch: string) {
    this.table.search(srch).draw()
  }

}