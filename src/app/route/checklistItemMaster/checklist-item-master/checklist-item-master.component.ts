import { Component, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { UserRightServices } from '../../../services/userRight.services';
import { constantValues } from '../../../app.constantValues'
import * as _ from 'underscore';
import { assign, identity, pickBy } from 'lodash';
import { CheckListGroupServices } from '../../checklistMaterGroup/checklistMasterGruop';
import { CheckListItemMaterServices } from '../checklistItemMaster.service';
declare const $: any


@Component({
  selector: 'checklist-item-master',
  templateUrl: './checklist-item-master.component.html',
  styleUrls: ['./checklist-item-master.component.scss']
})
export class ChecklistItemMasterComponent implements OnInit {


  @ViewChild('formAddChecklistItem', { static: true })
  private formAddChecklistItem: TemplateRef<any>

  modalRef: BsModalRef
  private specialColumn: any
  private table: any
  private filter: any = {}
  search: string
  isNew: boolean = false
  groupId: number
  showCheckListItemAddBtn: string = 'hide'
  private showCheckListItemDeleteBtn: string = 'hide'
  private showServiceGroupViewBtn: string = 'hide'
  loading : boolean;


  constructor(
    private router: Router,
    private zone: NgZone,
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private checkListItemMaterServices: CheckListItemMaterServices
  ) {

    this.showCheckListItemAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    this.showCheckListItemDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEMASTERDATA)

    this.specialColumn = new $.fn.dataTable.SpecialColumn([
     
      {
        id: 'INACTIVE',
        title: 'Mark Inactive',
        customClass: 'inactive-btn'
      },
      {
        id: 'ACTIVE',
        title: 'Mark Active',
        customClass: 'active-btn'
      },
    ], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'Checklist Item Master'
    const vm = this
    vm.table = $('#dt-checklist-item-master-table').DataTable({
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
      "aaSorting": [[0, "asc"]],
      ajax: this.checkListItemMaterServices.getCheckListItem({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'Checklist Item Name',
          data: 'name',
          class: 'clickable'
        },
        {
          title: 'Item Group',
          data: 'checkListGroupName',
          class: 'clickable'
        },
        {
          title: 'Application Type',
          data: 'jobApplicationTypes',
          width:'',
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.jobApplicationTypes.length > 0) {
              const ids = dataToSet.jobApplicationTypes.map(r=>' '+ r.description)
              return ids;
            } else {
              return '--';
            }
          }
        },
        {
          title: 'Work Permit Type',
          data: 'jobWorkTypewithapplication',
          width:''
        },
        {
          title: 'Property/Building Characteristics',
          data: 'checklistAddressPropertyMapings',
          width: '',
          class: 'clickable',
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.checklistAddressPropertyMapings.length > 0) {
              const ids = dataToSet.checklistAddressPropertyMapings.map(r => ' ' + r)
              return ids;
            } else {
              return '--';
            }
          }
        },
        {
          title: 'Status',
          data: 'isActive',
          class: 'clickable',
          width: '',
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.isActive) {
              return 'Active';
            } else {
              return 'Inactive';
            }
          }
        },
        this.specialColumn
      ],
      drawCallback: (setting: any) => {
        if (vm.showCheckListItemAddBtn == "hide" && vm.showCheckListItemDeleteBtn == 'hide') {
          $('.select-column').hide()
        } else {
          $('.select-column').show()
        }
      },
      rowCallback: ((row: any, data: any, index: any) => {
        if (this.showCheckListItemAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
        if (this.showCheckListItemDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
        if (data.isActive) {
          $(row).find('.inactive-btn').show();
          $(row).find('.active-btn').hide();
        } else {
          $(row).find('.inactive-btn').hide();
          $(row).find('.active-btn').show();
        }
        if (this.showCheckListItemAddBtn == 'hide') {
          $(row).find('.inactive-btn').hide();
          $(row).find('.active-btn').hide();
        }
      }),
      initComplete: () => {
        this.specialColumn
          .ngZone(vm.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()
            if (actionId == "EDIT") {
              vm.groupId = data.id
              vm.openModalForm(vm.formAddChecklistItem, vm.groupId, false)
            }
            if (actionId == "DELETE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
            if (actionId == "INACTIVE" || actionId == "ACTIVE") {
              data.isActive = (actionId == "ACTIVE") ? true : false
              this.changeGroupStatus(data, data.id)
            }
          })
        $('#dt-checklist-item-master-table tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if($(this).hasClass('disabled')) {
            return
          }
          if ($(this).hasClass('delete-icon')) {
            vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
          }
          if ($(this).hasClass('edit-icon')) {
            vm.groupId = data.id
            vm.openModalForm(vm.formAddChecklistItem, vm.groupId, false)
          }
        })
        $('#dt-checklist-item-master-table tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.groupId = data.id
            vm.openModalForm(vm.formAddChecklistItem, vm.groupId, false)
          }
        });
      }
    })
  }

  /**
* This method is used for toggle status of items from datatable
* @method changeGroupStatus
* @param {string} status,{id} id 
*/
  private changeGroupStatus(data: any, id: number,) {
    console.log(data)
    this.checkListItemMaterServices.checklistItemInactive(id, data).subscribe(r => {
      this.toastr.success('Status Changed Successfully');
      this.reload();
    }, (e: any) => {

      this.toastr.error('An Error occured');
      this.reload();
    });

  };

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
  * @param {boolean} isNew it is optional which contains true if it is new record and false when it is old record
  */
  openModalForm(template: TemplateRef<any>, id?: number, isNew?: boolean) {
    this.isNew = false
    if (isNew) {
      this.isNew = true
      this.groupId = null
    }
    this.modalRef = this.modalService.show(template, { class: 'modal-company', backdrop: 'static', 'keyboard': false })
  }

  /**
  * This method is used to delete record
  * @method delete
  * @param {number} id type which contains id to delete record 
  * @param {any} row type which contains entire selected row
  */
  private delete(id: number, row: any) {
    return new Promise((resolve, reject) => {
      this.checkListItemMaterServices.delete(id).subscribe(r => {
        console.log(r);
        row.delete()
        this.table.clearPipeline()
        this.table.ajax.reload()
        resolve(null)
      }, e => {
        reject()
      })
    })
  }

  /**
  * This method is used for filter/search records from datatable
  * @method searchChecklistGroup
  * @param {string} srch type any which contains string that can be filtered from datatable
  */
  searchChecklistGroup(srch: string) {
    this.table.search(srch).draw()
  }


}
