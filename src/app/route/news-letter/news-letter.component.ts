import { Component, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppComponent } from '../../app.component';
import { ToastrService } from 'ngx-toastr';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';
import { NewsLetterServices } from '../../services/news-letter.services';
import { assign, identity, pickBy } from 'lodash';

declare const $: any


@Component({
  selector: 'news-letter',
  templateUrl: './news-letter.component.html',
  styleUrls: ['./news-letter.component.scss']
})
export class NewsLetterComponent implements OnInit {

  /**
   *  add/edit form
   * @property newsForm
   */
  @ViewChild('newsForm', {static: true})
  private newsForm: TemplateRef<any>

  modalRef: BsModalRef
  isNew: boolean = true
  loading: boolean = false
  private table: any
  private filter: any
  private specialColumn: any
  id: number
  public search: string
  public showAddBtn: string = 'show'
  public showDeleteBtn: string = 'show'

  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private zone: NgZone,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private newsLetterService: NewsLetterServices
  ) {
    this.showAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    this.showDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEMASTERDATA)

    this.specialColumn = new $.fn.dataTable.SpecialColumn([{
      id: 'EDIT_NEWS',
      title: 'Edit',
      customClass: this.showAddBtn
    }, {
      id: 'DELETE_NEWS',
      title: 'Delete',
      customClass: this.showDeleteBtn
    }], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    document.title = 'News Letter'
    const vm = this
    this.filter = {} as any
    vm.table = $('#dt-news').DataTable({
      aaSorting: [[0, 'asc']],
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

      ajax: this.newsLetterService.getAll({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'Title',
          data: 'title',
          class: 'clickable'
        },
        {
          title: 'Description',
          data: 'description',
          class: 'clickable'
        },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.more_vert').hide();
        $(row).find('.edit-icon').hide();
        if (this.showAddBtn == 'hide') {
          // $(row).find('.edit-icon').hide();
          $(row).find('td').removeClass('clickable');
        }
        if (this.showDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
          // $(row).find('.delete-icon').hide();
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.showAddBtn == "hide" && vm.showDeleteBtn == 'hide') {
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
            if (actionId == "EDIT_NEWS") {
              vm.isNew = false
              vm.id = data.id
              vm.openModalForm(vm.newsForm, data.id, false)
            }
            if (actionId == "DELETE_NEWS") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })
        $('#dt-news tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('disabled')) {
            return
          }
          if ($(this).hasClass('delete-icon')) {
            vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
          }
          if ($(this).hasClass('edit-icon')) {
            vm.isNew = false
            vm.id = data.id
            vm.openModalForm(vm.newsForm, data.id, false)
          }
        })
        $('#dt-news tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.isNew = false
            vm.id = data.id
            vm.openModalForm(vm.newsForm, data.id, false)
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
    $('#dt-news tbody').off('click')
    $('#dt-news').off('draw.dt')
  }

  /**
   * This method is used for filter/search records from datatable
   * @method
   * @param {string} srch type any which contains string that can be filtered from datatable
   */
  public searchNews(srch: string) {
    this.table.search(srch).draw()
  }


  /**
   * This method is used to open modal popup for openModalForm
   * @method openModalForm
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   * @param {boolean} isNew it is optional which contains true if it is new record and false when it is old record
   */
  public openModalForm(template: TemplateRef<any>, id?: any, isNew?: boolean) {
    if (isNew) {
      this.isNew = true
      this.id = 0
    }
    this.modalRef = this.modalService.show(template, {class: 'modal-task-type', backdrop: 'static', 'keyboard': false})
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
      this.newsLetterService.delete(id).subscribe((r: any) => {
        row.delete()
        resolve(r)
      }, e => {
        reject()
      })
    })
  }
}