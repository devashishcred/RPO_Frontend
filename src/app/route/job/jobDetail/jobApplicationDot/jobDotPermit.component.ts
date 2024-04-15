import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SubscriptionLike as ISubscription } from "rxjs";
import { Component, ElementRef, NgZone, TemplateRef, Input, ViewChild, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, assign } from 'lodash';
import { AppComponent } from '../../../../app.component';
import { ActivatedRoute } from '@angular/router';
import { JobApplicationService } from '../../../../services/JobApplicationService.services';
import { JobSharedService } from '../../JobSharedService';
import { JobServices } from '../../job.services';
import { constantValues } from '../../../../app.constantValues';
import { UserRightServices } from '../../../../services/userRight.services';
import { SharedService, GetAppNoOnSelectRow } from '../../../../app.constantValues';
import { LocalStorageService } from '../../../../services/local-storage.service';

declare const $: any

/**
 * This component contains all function that are used in JobDotPermitComponent
 * @class JobDotPermitComponent
 */
@Component({
  selector: 'job-dot-work-permit',
  templateUrl: './jobDotPermit.component.html',
})
export class JobDotPermitComponent implements OnInit {

  @Input() jobDetail: any

  /**
   * DOT Add Permit Form
   * @property formAddDotPermit
   */
  @ViewChild('formAddDotPermit', {static: true})
  private formAddDotPermit: TemplateRef<any>

  /**
   * Upload DOT Permit Form
   * @property formUploadDotPermit
   */
  @ViewChild('formUploadDotPermit', {static: true})
  private formUploadDotPermit: TemplateRef<any>

  modalRef: BsModalRef
  private specialColumn: any
  idJobApp: number
  appType: any
  private idJobAppPermit: number
  idApp: number
  idApplicationNumber: any
  private table: any
  private filter: any = {}
  searchpermit: any
  idJob: number
  isNew: boolean = false
  showBtnStatus: string = "show"
  private sub: any
  private id: number
  isAppData: Boolean = false
  private subscription: ISubscription;
  private applicationModuleSubscription: ISubscription;
  private selectedJobType: number;
  //Job Add Application
  showJobApplicationAddBtn: string = 'hide'
  private showJobApplicationDeleteBtn: string = 'hide'
  private appRowChanges: boolean = false;
  private completePermit: boolean = false;
  jobAppObject: any;
  isCustomerLoggedIn: boolean = false;
  loading: boolean;


  /**
   * This method define all services that requires in whole class
   * @method constructor
   */
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private zone: NgZone,
    private jobApplicationServices: JobApplicationService,
    private jobSharedService: JobSharedService,
    private jobServices: JobServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private sharedService: SharedService,
    private getAppNoOnSelectRow: GetAppNoOnSelectRow,
    private localStorageService: LocalStorageService
  ) {
    this.sub = this.route.parent.params.subscribe(params => {
      this.idJob = +params['id'];
    });

  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
    var vm = this;
    this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
    this.setBtnBasedonStatus(this.jobDetail)
    this.sharedService.getJobStatus.subscribe((data: any) => {
      if (data == 'statuschanged') {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
          this.setBtnBasedonStatus(this.jobDetail)
        }
      }
    }, (e: any) => {
    })
    this.getApplication(vm);
    this.applicationModuleSubscription = this.getAppNoOnSelectRow.getAppNumber.subscribe((appNumber: any) => {
      this.appRowChanges = true;
      this.getApplication(vm);
    });

    //check permission
    this.showJobApplicationAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDAPPLICATIONSWORKPERMITS)
    this.showJobApplicationDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEAPPLICATIONSWORKPERMITS)
    this.sharedService.getDotApplicationCount.subscribe((data: any) => {
      if (data == 0) {
        this.isAppData = false;
      } else {
        this.isAppData = true;
      }
    })
  }

  /**
   * This method calls when user moves from another component
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    this.applicationModuleSubscription.unsubscribe();
  }

  /**
   * This method will set button based on status
   * @method setBtnBasedonStatus
   * @param {any} jobDetail Job Object
   */
  setBtnBasedonStatus(jobDetail: any) {
    if (jobDetail.status > 1) {
      $('.select-column').hide()
      this.showBtnStatus = 'hide'
    } else {
      $('.select-column').show()
      this.showBtnStatus = 'show'
    }
  }

  /**
   * This method will get Application
   * @method getApplication
   * @param {any} vm Table Object
   */
  private getApplication(vm: any) {
    if (this.appRowChanges) {
      $("#dt-aplication-permit").DataTable().destroy();
      $("#dt-aplication-permit").empty();
      this.appRowChanges = false;
    }
    this.jobSharedService.getJobData().subscribe((data: any) => {
      this.jobDetail = data
      if (this.jobDetail == null) {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
          this.setBtnBasedonStatus(this.jobDetail)
        }
      } else {
        this.setBtnBasedonStatus(this.jobDetail)
      }
    })
    this.jobSharedService.getSelectedApplication().subscribe((data: any) => {
      if (data) {
        this.jobAppObject = data;
        this.isAppData = true
        this.appType = data
        this.filter = [];
        this.filter.idJobApplication = data.id;
        this.filter.idJob = this.idJob
        if (data.applicationNumber != "") {
          this.idApplicationNumber = data.applicationNumber
        }
        this.idApp = data.id
        this.loadDataTable(vm);
      } else {
        this.loadDataTable(vm);
      }
    });
  }

  /**
   * This method will load data table
   * @method loadDataTable
   * @param {any} vm Table Object
   */
  private loadDataTable(vm: any) {
    this.specialColumn = new $.fn.dataTable.SpecialColumn([
      {
        id: 'Pdf',
        title: 'View PDF',
        customClass: "viewClass"
      },
      {
        id: 'COMPLETE',
        title: 'Permit Completed',
        customClass: this.showJobApplicationDeleteBtn
      },
    ], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
    this.filter.idJob = this.idJob
    if (typeof this.filter.idJobApplication == "undefined" || this.filter.idJobApplication == null) {
      this.filter.idJobApplication = -1
    }

    vm.table = $('#dt-aplication-permit').DataTable({
      paging: true,
      dom: "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-12 col-md-4'l><'col-sm-12 col-md-4'i><'col-sm-12 col-md-4'p>>",
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
      "processing": false,
      ajax: this.jobApplicationServices.getPermitByApplicationId({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'WORK / PERMIT TYPE',
          data: 'permitType',
          render: function (data: any, type: any, dataToSet: any) {
            let permitWithEquipmentType = data;
            if (dataToSet?.equipmentType) {
              permitWithEquipmentType += ' | ' + dataToSet.equipmentType;
              return permitWithEquipmentType
            }
            // if (dataToSet.signedOff) {
            //   return "<span class='status signedOff'> </span>" + permitWithEquipmentType;
            // } 
            return permitWithEquipmentType
            // else {
            // }
          },
          createdCell: function (td, cellData, rowData, row, col) {
            if (rowData.signedOff && !vm.isCustomerLoggedIn) {
              $(td).addClass('orange-status-border');
            }
          },
          class: 'min-auto clickable',
        },
        {
          title: 'CODE',
          data: 'code',
          class: 'clickable',
          width: '50'
        },
        {
          title: 'Permit#',
          data: 'permitNumber',
          class: 'min-auto clickable',
          width: '100'
        },
        {
          title: 'RESP',
          data: 'idResponsibility',
          render: function (data: any, type: any, dataToSet: any) {
            if (data == 1) {
              return 'R'
            } else if (data == 2) {
              return 'O'
            } else {
              return ''
            }
          },
          visible: (this.selectedJobType == 1) ? true : false,
          class: 'min-auto clickable',
        }, {
          title: 'FILED | ISSUED | EXPIRES',
          data: 'filed',
          class: 'min-auto clickable' + this.isCustomerLoggedIn ? ' maxWidth-400 text-left' : 'text-left',
          // width: '120',
          render: function (data: any, type: any, dataToSet: any) {
            let combineDates = '';
            if (dataToSet.filed) {
              combineDates += dataToSet.filed;
            } else {
              combineDates += "-";
            }
            if (dataToSet.issued) {
              combineDates += "  |  " + dataToSet.issued;
            } else {
              combineDates += "  |  -";
            }
            if (dataToSet.expires) {
              combineDates += '  |  ' + dataToSet.expires;
            } else {
              combineDates += "  | - ";
            }
            return combineDates.replace(/^ \| | \|$/g, '');
          }
        },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        if (index == 0) {
          this.appType = data
        }
        if (data.documentPath == '') {
          $(row).find('.viewClass').hide();
        }
        if (this.showJobApplicationDeleteBtn == 'hide') {
          // $(row).find('.delete-icon').hide();
          $(row).find('.delete-icon').addClass("disabled");
        }
        if (this.showJobApplicationAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
          // $(row).find('.edit-icon').hide();
        }
        if (vm.isCustomerLoggedIn) {
          $(row).find('.delete-icon').hide()
          $(row).find('.edit-icon').hide()
          $(row).find('.more_vert').hide();
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.showBtnStatus == "hide") {
          $('.select-column').hide()
        } else {
          $('.select-column').show()
        }
      },
      initComplete: () => {
        if (vm.isCustomerLoggedIn) {
          const table = $('#dt-aplication-permit').DataTable();
          vm.setPermissionForEmptyActionColumn(table);
        }

        this.specialColumn
          .ngZone(vm.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()
            if (actionId == 'DELETE') {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
            if (actionId == 'COMPLETE') {
              this.completePermit = true;
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row, 'PERMIT_COMPLETE'])
            }
            if (actionId == 'EDIT_DETAIL') {
              this.idJobApp = data.id
              this.appType = data
              vm.openModalFormAddPermit(vm.formAddDotPermit, data.id)
            }
            if (actionId == "BIS") {
              if (data.jobApplicationNumber) {
                let nycUrl = "http://a810-bisweb.nyc.gov/bisweb/PermitQueryByNumberServlet?passjobnumber=" + data.jobApplicationNumber
                window.open(nycUrl, '_blank');
              }
            }
            if (actionId == "Pdf") {
              window.open(data.documentPath, "_blank")
            }
          })
      }
    });
    $('#dt-aplication-permit tbody').on('click', 'span', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      if ($(this).hasClass('disabled')) {
        return
      }
      if ($(this).hasClass('delete-icon')) {
        vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
      }
      if ($(this).hasClass('edit-icon')) {
        this.idJobApp = data.id
        this.appType = data
        vm.openModalFormAddPermit(vm.formAddDotPermit, data.id)
      }
    })
    $('#dt-aplication-permit tbody').on('click', 'td.clickable', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      if ($(this).hasClass('clickable')) {
        this.idJobApp = data.id
        this.appType = data
        if (!vm.isCustomerLoggedIn) {
          vm.openModalFormAddPermit(vm.formAddDotPermit, data.id)
        }
      }
    });
  }

  /**
   * This method will reload datatable
   * @method reload
   */
  reload() {
    this.table.clearPipeline()
    this.table.ajax.reload()
  }

  /**
   * This method will delete work permit
   * @method delete
   * @param {number} id ID of work pemit
   * @param {any} row WorkPermit Row
   */
  private delete(id: number, row: any): Promise<{}> {
    if (!this.completePermit) {
      return new Promise((resolve, reject) => {
        this.jobApplicationServices.deleteWorkPermit(id).subscribe(r => {
          this.reload()
          resolve(null)
        }, e => {
          reject()
        })


      })
    }
    if (this.completePermit) {
      return new Promise((resolve, reject) => {
        this.jobApplicationServices.completeWorkPermit(id).subscribe(r => {
          this.reload()
          resolve(null)
        }, e => {
          reject()
        })
      })
    }
  }

  /**
   * This method will search permit
   * @method searchPermit
   * @param {string} searchpermit Search Criteria
   */
  searchPermit(searchpermit: string) {
    this.table.search(searchpermit).draw()
  }

  /**
   * This method will open Add permit model
   * @method _openModalFormAddPermit
   * @param {any} template TemplateRef Object
   */
  private _openModalFormAddPermit(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-add-permit', backdrop: 'static', 'keyboard': false})
  }

  /**
   * This method will open Add permit model
   * @method openModalFormAddPermit
   * @param {any} template TemplateRef Object
   * @param {number} id? Id of permit
   */
  openModalFormAddPermit(template: TemplateRef<any>, id?: number) {
    if (!id) {
      this.idJobAppPermit = 0
      this.isNew = false
    } else {
      this.isNew = true
      this.idJobApp = id
    }
    this._openModalFormAddPermit(template)
  }

  /**
   * This method will open popup for upload permit
   * @method openModalUploadPermit
   * @param {any} template TemplateRef Object
   */
  openModalUploadPermit(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-upload-permit',
      backdrop: 'static',
      'keyboard': false
    })
  }

  setPermissionForEmptyActionColumn(dataTable) {
    const columns = dataTable.columns().header().toArray();
    columns.forEach((column, columnIndex) => {
      const cells = dataTable.column(columnIndex).nodes();
      let hasVisibleContent = false;

      cells.each(function () {
        const cellContent = $(this).find('div'); // Assuming the content is within a div
        let hasVisibleSpan = false;

        cellContent.find('span').each(function () {
          if ($(this).css('display') === 'none') {
            hasVisibleSpan = true;
            return hasVisibleSpan; // Exit the loop if visible span is found
          } else {
            hasVisibleSpan = false;
            return hasVisibleSpan
          }
        });

        if (hasVisibleSpan) {
          hasVisibleContent = true;
          return hasVisibleContent; // Exit the loop if visible content is found
        }
      });

      if (hasVisibleContent) {
        dataTable.column(columnIndex).visible(false);
      }
    });
  }

}