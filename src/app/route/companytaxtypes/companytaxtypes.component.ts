import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../app.component';
import { CompanyTaxTypesServices } from './companytaxtypes.services';
import { Router } from '@angular/router';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';

declare const $: any

/**
* This component contains all function that are used in Company Tax Types Component
* @class CompanyTaxTypesComponent
*/
@Component({
  templateUrl: './companytaxtypes.component.html',
  styleUrls: ['./companytaxtypes.component.scss']
})
export class CompanyTaxTypesComponent implements OnInit, OnDestroy {


  @ViewChild('companytaxtypesform',{static: true})
  private CompanyTaxTypesform: TemplateRef<any>

  modalRef: BsModalRef
  isNew: boolean = true
  loading: boolean = false
  private table: any
  private filter: any
  private specialColumn: any
  CompanyTaxTypesId: number
  search: string
  showTaxAddBtn: string = 'hide'
  private showTaxDeleteBtn: string = 'hide'
  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private zone: NgZone,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private CompanyTaxTypesServices: CompanyTaxTypesServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,

  ) {

    this.showTaxAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    this.showTaxDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEMASTERDATA)


    this.specialColumn = new $.fn.dataTable.SpecialColumn([{
      id: 'EDIT',
      title: 'Edit',
      customClass: this.showTaxAddBtn
    }, {
      id: 'DELETE',
      title: 'Delete',
      customClass: this.showTaxDeleteBtn
    }], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }

  ngOnInit() {
    document.title = 'Company Tax Types'
    const vm = this
    this.filter = {} as any
    vm.table = $('#dt-JobContact-types').DataTable({
      "aaSorting": [],
      ajax: this.CompanyTaxTypesServices.getRecords({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'name',
          data: 'name',
          class: ''
        },
        this.specialColumn
      ],
      drawCallback: (setting: any) => {
        if (vm.showTaxAddBtn == "hide" && vm.showTaxDeleteBtn == 'hide') {
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
              vm.isNew = false
              vm.CompanyTaxTypesId = data.id
              vm.openModalForm(vm.CompanyTaxTypesform, data.id, false)
            }
            if (actionId == "DELETE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })
      }
    })
  }

  ngOnDestroy() {
    $('#dt-JobContact-types tbody').off('click')
    $('#dt-JobContact-types').off('draw.dt')
  }

  searchCompanyTaxTypes(srch: string) {
    this.table.search(srch).draw()
  }
  openModalForm(template: TemplateRef<any>, id?: number, isNew?: boolean) {
    if (isNew) {
      this.isNew = true
      this.CompanyTaxTypesId = 0
    }
    this.modalRef = this.modalService.show(template, { class: 'modal-address-type', backdrop: 'static', 'keyboard': false })
  }


  reload() {
    this.table.clearPipeline()
    this.table.ajax.reload()
  }

  delete(id: number, row: any) {
    return new Promise((resolve, reject) => {
      this.CompanyTaxTypesServices.delete(id).subscribe(r => {
        row.delete()
        resolve(r)
      }, e => {
        reject()
      })
    })
  }
}