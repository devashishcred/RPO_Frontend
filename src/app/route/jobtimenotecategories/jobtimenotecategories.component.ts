import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../app.component';
import { JobTimenoteCategoriesServices } from './jobtimenotecategories.services';
import { Router } from '@angular/router';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';

declare const $: any
/**
*  This component contains all function that are used in JobTimenoteCategoriesComponent
* @class JobTimenoteCategoriesComponent
*/
@Component({
  templateUrl: './jobtimenotecategories.component.html',
  styleUrls: ['./jobtimenotecategories.component.scss']
})
export class JobTimenoteCategoriesComponent implements OnInit, OnDestroy {

  /**
   * Form job timenote category
   * @property jobtimenotecategoriesform
   */
  @ViewChild('jobtimenotecategoriesform',{static: true})
  private JobTimenoteCategoriesform: TemplateRef<any>

  modalRef: BsModalRef
  isNew: boolean = true
  loading: boolean = false
  private table: any
  private filter: any
  private specialColumn: any
  JobTimenoteCategoriesId: number
  search: string
  showTimeNoteCategoryAddBtn: string = 'hide'
  private showTimeNoteCategoryDeleteBtn: string = 'hide'

  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private zone: NgZone,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private JobTimenoteCategoriesServices: JobTimenoteCategoriesServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
  ) {

    this.showTimeNoteCategoryAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    this.showTimeNoteCategoryDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEMASTERDATA)

    this.specialColumn = new $.fn.dataTable.SpecialColumn([{
      id: 'EDIT',
      title: 'Edit',
      customClass: this.showTimeNoteCategoryAddBtn
    }, {
      id: 'DELETE',
      title: 'Delete',
      customClass: this.showTimeNoteCategoryDeleteBtn
    }], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }

  /**
    * This method will call when form loads first time
    * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'Project Time Note Category'
    const vm = this
    this.filter = {} as any
    vm.table = $('#dt-JobContact-types').DataTable({
      "aaSorting": [],
      ajax: this.JobTimenoteCategoriesServices.getRecords({
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
      initComplete: () => {
        this.specialColumn
          .ngZone(this.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()
            if (actionId == "EDIT") {
              vm.isNew = false
              vm.JobTimenoteCategoriesId = data.id
              vm.openModalForm(vm.JobTimenoteCategoriesform, data.id, false)
            }
            if (actionId == "DELETE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })
      }
    })
  }

  /**
   * This method will call when user left component
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    $('#dt-JobContact-types tbody').off('click')
    $('#dt-JobContact-types').off('draw.dt')
  }

  /**
   * This method search job timenote categories
   * @method searchJobTimenoteCategories
   * @param {string} srch Search String 
   */
  searchJobTimenoteCategories(srch: string) {
    this.table.search(srch).draw()
  }

  /**
   * This method open add/edit form
   * @method openModalForm
   * @param {any} template TemplateRef Object 
   * @param {number} id Id of Record 
   * @param {boolean} isNew Flag to identify new record or edit 
   */
  openModalForm(template: TemplateRef<any>, id?: number, isNew?: boolean) {
    if (isNew) {
      this.isNew = true
      this.JobTimenoteCategoriesId = 0
    }
    this.modalRef = this.modalService.show(template, { class: 'modal-address-type', backdrop: 'static', 'keyboard': false })
  }

  /**
   * This method reload data table
   * @method reload
   */
  reload() {
    this.table.clearPipeline()
    this.table.ajax.reload()
  }

  /**
   * This method delete record from database
   * @method delete
   * @param {number} id ID of record 
   * @param {any} row Selected Row to delete 
   */
  delete(id: number, row: any) {
    return new Promise((resolve, reject) => {
      this.JobTimenoteCategoriesServices.delete(id).subscribe(r => {
        row.delete()
        resolve(r)
      }, e => {
        reject()
      })
    })
  }
}