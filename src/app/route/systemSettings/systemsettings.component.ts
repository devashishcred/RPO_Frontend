import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { cloneDeep, intersectionBy } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { assign, identity, pickBy } from 'lodash';
import { AppComponent } from '../../app.component';
import { Message } from '../../app.messages';
import { SelectModule } from 'angular2-select';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';
import { SystemSettingsServices } from './systemsettings.services'
import * as _ from 'underscore';

declare const $: any

/**
 *  This component contains all function that are used in SystemSettingsComponent
 * @class SystemSettingsComponent
 */
@Component({
  templateUrl: './systemsettings.component.html',
  styleUrls: ['./systemsettings.component.scss'],

})
export class SystemSettingsComponent implements OnInit, OnDestroy {

  /**
   *  SettingsType add/edit form
   * @property SettingsType
   */
  @ViewChild('settingsType', {static: true})
  private SettingsType: TemplateRef<any>

  modalRef: BsModalRef
  private specialColumn: any
  private errorMessage: any
  private table: any
  private filter: any = {}
  SettingId: any
  //Conact show hide
  private showMasterBtn: string = 'hide'
  loading: boolean = false;

  constructor(
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private zone: NgZone,
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private systemSettings: SystemSettingsServices
  ) {
    this.errorMessage = this.message.msg;

  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    document.title = 'Notification Settings';
    const vm = this;
    this.showMasterBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    if (this.showMasterBtn == 'show') {
      this.specialColumn = new $.fn.dataTable.SpecialColumn([{
        id: 'EDIT_SETTINGS',
        title: 'Edit Settings',
        customClass: this.showMasterBtn
      }
      ], false)
      this.reload = this.reload.bind(this)
    } else {
      this.specialColumn = new $.fn.dataTable.SpecialColumn([])
    }
    vm.table = $('#dt-settings').DataTable({
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
      ajax: this.systemSettings.getTheSystemSettings({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'Notification event',
          data: 'name',
          class: (this.showMasterBtn == 'show') ? 'clickable' : 'non-clickable'
        }, {
          title: 'Recipients',
          data: 'value',
          class: (this.showMasterBtn == 'show') ? 'clickable' : 'non-clickable'
        },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.more_vert').hide();
        $(row).find('.delete-icon').hide();
        if (this.showMasterBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.showMasterBtn == "hide") {
          $('.select-column').hide()
        } else {
          $('.select-column').show()
        }
      },
      initComplete: () => {
        this.specialColumn
          .ngZone(vm.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()
            if (actionId == "EDIT_SETTINGS") {
              vm.SettingId = data.id
              vm.openModalForm(vm.SettingsType, data.id)
            }

          })
      }
    })
    $('#dt-settings tbody').on('click', 'td.clickable', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      if (vm.showMasterBtn == 'show') {
        if ($(this).hasClass('clickable')) {
          vm.SettingId = data.id
          vm.openModalForm(vm.SettingsType, data.id);
        }
      } else {
        $(this).hasClass('non-clickable')
      }
    })
    $('#dt-settings tbody').on('click', 'span', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      if ($(this).hasClass('disabled')) {
        return
      }
      if ($(this).hasClass('edit-icon')) {
        vm.SettingId = data.id
        vm.openModalForm(vm.SettingsType, data.id)
      }
    })
  }

  /**
   * This method is used to open modal popup for openModalForm
   * @method openModalForm
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   */
  openModalForm(template: TemplateRef<any>, id?: number) {
    this.modalRef = this.modalService.show(template, {class: 'modal-md', backdrop: 'static', 'keyboard': false})
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
   * This method will be destroy all elements and other values from whole module
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    this.specialColumn.destroy()
    $('#dt-settings tbody').off('click')
  }


}