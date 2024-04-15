import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../app.component';
import { AddressType } from '../../types/addresstype';
import { AddresstypeServices } from './addresstype.services';
import { Router } from '@angular/router';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';

declare const $: any
/**
* This component contains all function that are used in AddresstypeComponent
* @class AddresstypeComponent
*/
@Component({
  templateUrl: './addresstype.component.html',
  styleUrls: ['./addresstype.component.scss']
})
export class AddresstypeComponent implements OnInit, OnDestroy {

  /**
  *  addressform add/edit form
  * @property addressform
  */
  @ViewChild('addressform',{static: true})
  private addressform: TemplateRef<any>


  modalRef: BsModalRef
  isNew: boolean = true
  private addressType: any = []
  loading: boolean = false
  private table: any
  private filter: any
  private specialColumn: any
  addressTypeId: number
  search: string
  showAddressTypeAddBtn: string = 'hide'
  private showAddressTypeDeleteBtn: string = 'hide'


  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private zone: NgZone,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private addresstypeServices: AddresstypeServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
  ) {

    this.showAddressTypeAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    this.showAddressTypeDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEMASTERDATA)

    this.specialColumn = new $.fn.dataTable.SpecialColumn([{
      id: 'EDIT_ADDRESS',
      title: 'Edit',
      customClass: this.showAddressTypeAddBtn
    }, {
      id: 'DELETE_ADDRESS',
      title: 'Delete',
      customClass: this.showAddressTypeDeleteBtn
    }], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'Address Type'
    const vm = this
    this.filter = {} as any
    vm.table = $('#dt-address-type').DataTable({
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
      ajax: this.addresstypeServices.get({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'Name',
          data: 'name',
          class: 'clickable'
        }, {
          title: 'Priority Order',
          data: 'displayOrder',
          class: 'clickable'
        },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.more_vert').hide();
        if (this.showAddressTypeAddBtn == 'hide') {
          // $(row).find('.edit-icon').hide();
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
        if (this.showAddressTypeDeleteBtn == 'hide') {
          // $(row).find('.delete-icon').hide();
          $(row).find('.delete-icon').addClass("disabled");
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.showAddressTypeAddBtn == "hide" && vm.showAddressTypeDeleteBtn == 'hide') {
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

            if (actionId == "EDIT_ADDRESS") {
              vm.isNew = false
              vm.addressTypeId = data.id
              vm.openModalForm(vm.addressform)
            }
            if (actionId == "DELETE_ADDRESS") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })
          $('#dt-address-type tbody').on('click', 'span', function (ev: any) {
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
              vm.addressTypeId = data.id
              vm.openModalForm(vm.addressform)
            }
          })
          $('#dt-address-type tbody').on('click', 'td.clickable', function (ev: any) {
            const row = vm.table.row($(this).parents('tr'))
            const data = row.data()
            if ($(this).hasClass('clickable')) {
              vm.isNew = false
              vm.addressTypeId = data.id
              vm.openModalForm(vm.addressform)
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
    $('#dt-address-type tbody').off('click')
    $('#dt-address-type').off('draw.dt')
  }

  /**
  * This method is used for filter/search records from datatable
  * @method searchAddress
  * @param {string} srch type any which contains string that can be filtered from datatable
  */
  searchAddress(srch: string) {
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
      this.addressTypeId = 0
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
      this.addresstypeServices.delete(id).subscribe(r => {
        row.delete()
        this.reload()
        resolve(null)
      }, e => {
        reject()
      })
    })
  }
}