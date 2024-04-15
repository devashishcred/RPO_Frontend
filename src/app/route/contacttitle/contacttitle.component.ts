import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../app.component';
import { ContactTitle, ContactTitleDTO } from '../../types/contactTitle';
import { ContactTitleServices } from '../../services/contactTitle.services';
import { Router } from '@angular/router';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';

declare const $: any
/**
*  This component contains all function that are used in ContactTitleComponent
* @class ContactTitleComponent
*/
@Component({
  templateUrl: './contacttitle.component.html',
  styleUrls: ['./contacttitle.component.scss']
})
export class ContactTitleComponent implements OnInit, OnDestroy {

  /**
  *  contacttitleform add/edit form
  * @property contacttitleform
  */
  @ViewChild('contacttitleform',{static: true})
  private contacttitleform: TemplateRef<any>


  modalRef: BsModalRef
  isNew: boolean = true
  private contacttitle: any = []
  loading: boolean = false
  private table: any
  private filter: any
  private specialColumn: any
  contacttitleId: number
  search: string
  showContactTitleAddBtn: string = 'hide'
  private showContactTitleDeleteBtn: string = 'hide'

  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private zone: NgZone,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private contactTitleServices: ContactTitleServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
  ) {
    this.showContactTitleAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    this.showContactTitleDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEMASTERDATA)

    this.specialColumn = new $.fn.dataTable.SpecialColumn([{
      id: 'EDIT_CONTACT_TITLE',
      title: 'Edit',
      customClass: this.showContactTitleAddBtn
    }, {
      id: 'DELETE_CONTACT_TITLE',
      title: 'Delete',
      customClass: this.showContactTitleDeleteBtn
    }], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'Contact Title'
    const vm = this
    this.filter = {} as any
    vm.table = $('#dt-contact-title').DataTable({
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

      ajax: this.contactTitleServices.getRecords({
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
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.more_vert').hide();
        if (this.showContactTitleAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
        if (this.showContactTitleDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.showContactTitleAddBtn == "hide" && vm.showContactTitleDeleteBtn == 'hide') {
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
            if (actionId == "EDIT_CONTACT_TITLE") {
              vm.isNew = false
              vm.contacttitleId = data.id
              vm.openModalForm(vm.contacttitleform, data.id, false)
            }
            if (actionId == "DELETE_CONTACT_TITLE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })
          $('#dt-contact-title tbody').on('click', 'span', function (ev: any) {
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
              vm.contacttitleId = data.id
              vm.openModalForm(vm.contacttitleform, data.id, false)
            }
          })
          $('#dt-contact-title tbody').on('click', 'td.clickable', function (ev: any) {
            const row = vm.table.row($(this).parents('tr'))
            const data = row.data()
            if ($(this).hasClass('clickable')) {
              vm.isNew = false
              vm.contacttitleId = data.id
              vm.openModalForm(vm.contacttitleform, data.id, false)
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
    $('#dt-contact-title tbody').off('click')
    $('#dt-contact-title').off('draw.dt')
  }

  /**
  * This method is used for filter/search records from datatable
  * @method searchContactTitle
  * @param {string} srch type any which contains string that can be filtered from datatable
  */
  searchContactTitle(srch: string) {
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
      this.contacttitleId = 0
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
      this.contactTitleServices.delete(id).subscribe(r => {
        row.delete()
        resolve(r)
      }, e => {
        reject()
      })
    })
  }
}