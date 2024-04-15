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
* This component contains all function that are used in JobApplicationPermitComponent
* @class JobApplicationPermitComponent
*/
@Component({
  selector: 'job-work-permit',
  templateUrl: './jobApplicationPermit.component.html',
  styleUrls: ['./jobApplicationDob.component.scss']
})
export class JobApplicationPermitComponent implements OnInit {
  @Input() jobDetail: any
  @Input() isDep: any

  /**
   * Form Add Permit
   * @property formAddPermit
   */
  @ViewChild('formAddPermit', { static: true })
  private formAddPermit: TemplateRef<any>

  @ViewChild('pullpermit', { static: true })
  private pullpermit: TemplateRef<any>

  /**
   * Form Upload Permit
   * @property formUploadPermit
   */
  @ViewChild('formUploadPermit', { static: true })
  private formUploadPermit: TemplateRef<any>

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
  loading: boolean = false
  private subscription: ISubscription;
  private applicationModuleSubscription: ISubscription;
  private selectedJobType: number;
  PullpermitData: any;
  permitID: any;
  selectedDocumentCode: string;
  private jobApplicationTypeName: string;
  //Job Add Application
  showJobApplicationAddBtn: string = 'hide'
  private showJobApplicationDeleteBtn: string = 'hide'
  private appRowChanges: boolean = false;
  isCustomerLoggedIn: boolean = false;

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
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
    this.sub = this.route.parent.params.subscribe(params => {
      this.idJob = +params['id'];
    });

  }

  /**
    * This method will be called once only when module is call for first time
    * @method ngOnInit
  */
  ngOnInit() {
    //check permission
    this.showJobApplicationAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDAPPLICATIONSWORKPERMITS)
    this.showJobApplicationDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEAPPLICATIONSWORKPERMITS)
    this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
    if (this.jobDetail) {
      this.setBtnBasedonStatus(this.jobDetail)
    }

    this.sharedService.getJobStatus.subscribe((data: any) => {
      if (data == 'statuschanged') {
        this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
        this.setBtnBasedonStatus(this.jobDetail)
      }
    }, (e: any) => { })
    var vm = this;
    this.getApplication(vm);
    this.applicationModuleSubscription = this.getAppNoOnSelectRow.getAppNumber.subscribe((appNumber: any) => {
      this.appRowChanges = true;
      this.getApplication(vm);
    });
    this.sharedService.getApplicationCount.subscribe((data: any) => {
      if (data == 0) {
        this.isAppData = false;
      } else {
        this.isAppData = true;
      }
    })
  }

  /**
   * This method destroy all object when user moves from component
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
      if (this.jobDetail == null || this.jobDetail == 'undefined') {
        this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
        this.setBtnBasedonStatus(this.jobDetail)
      }
    })
    this.jobSharedService.getSelectedApplication().subscribe((data: any) => {
      if (data) {
        this.isAppData = true
        this.appType = data
        this.filter = [];
        this.filter.idJobApplication = data.id;
        this.idJob = this.idJob
        this.jobApplicationTypeName = data.jobApplicationTypeName;
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
        id: 'BIS',
        title: 'View on BIS',
        customClass: ""
      },
      {
        id: 'LINK_BIS',
        title: 'Pull Permits',
        customClass: (vm.jobDetail.status > 1) ? 'hide' : ""
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
      dom: "<'row'<'col-sm-12'tr>>" +"<'row'<'col-sm-12 col-md-4'l><'col-sm-12 col-md-4'i><'col-sm-12 col-md-4'p>>",
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
				infoFiltered: "",
      },
      "processing": false,
      ajax: this.jobApplicationServices.getPermitByApplicationId({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'WORK / PERMIT TYPE',
          data: 'jobWorkTypeDescription',
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.withdrawn && dataToSet.signedOff) {
              return `<div class="work-permit-status red"></div>` + data;
            }
            else {
              return data
            }
          },
          createdCell: function (td, cellData, rowData, row, col) {
            console.log('rowData', rowData)
            if (rowData.withdrawn && rowData.signedOff && !vm.isCustomerLoggedIn) {
              $(td).addClass('orange-status-border');
            } else if (rowData.withdrawn && !vm.isCustomerLoggedIn) {
              $(td).addClass('red-status-border');
            } else if (rowData.signedOff && !vm.isCustomerLoggedIn) {
              $(td).addClass('orange-status-border');
            }
          },
          class: 'custom-status-bar clickable',
        },
        {
          title: 'Work Type(S)',
          data: 'code',
          class: 'clickable',
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
          class: 'clickable',
          visible : !this.isCustomerLoggedIn
          // width: '40'
        },
        {
          title: 'PERMITTEE / CONTRACTOR',
          data: 'permittee',
          class: 'clickable',
        },
        {
          title: 'ISSUED ON',
          data: 'issued',
          class: 'clickable',
        },
        {
          title: 'EXPIRES',
          data: 'expires',
          class: 'clickable',
        },
        {
          title: 'Permit#',
          data: 'permitNumber',
          class: 'clickable',
          visible: (this.jobApplicationTypeName == 'FDNY') ? true : false
        },
        // {
        //   title: 'EST COST',
        //   data: 'estimatedCost',
        //   class: ' min-auto',
        //   //visible: (this.selectedJobType == 1) ? true : false,
        //   width: '100'
        // }, 
        // {
        //   title: 'Note',
        //   data: 'workDescription',
        //   class: 'clickable',
        // },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        if(this.isCustomerLoggedIn){
          $(row).find('.edit-icon').hide();
          $(row).find('.delete-icon').hide();
          $(row).find('.more_vert').hide();
        }
        else{
          $(row).find('.edit-icon').addClass("isButton");
          $(row).find('.delete-icon').addClass("isButton");
        }
        if (index == 0) {
          this.appType = data
        }
        if (vm.jobDetail.status > 1) {
          $(row).find('.isButton').addClass("disabled");
        } else {
          $(row).find('.isButton').removeClass("disabled");
        }
        if (this.showJobApplicationAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
        }
        if (this.showJobApplicationDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.jobDetail.status == 2) {
          $('.select-column').hide()
        } else {
          $('.select-column').show()
        }
      },
      initComplete: () => {
        if (this.isCustomerLoggedIn) {
          const table = $('#dt-aplication-permit').DataTable();
          this.setPermissionForEmptyActionColumn(table);
        }
        this.specialColumn
          .ngZone(vm.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()
            if (actionId == 'DELETE') {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
            if (actionId == 'EDIT_DETAIL') {
              this.idJobApp = data.id
              this.appType = data
              vm.openModalFormAddPermit(vm.formAddPermit, data.id)
            }
            if (actionId == "BIS") {
              if (data.detailURL != '') {
                let nycUrl = data.detailURL
                window.open(nycUrl, '_blank');
              }
              if (data.detailURL == '') {
                let nycUrl = "http://a810-bisweb.nyc.gov/bisweb/PermitQueryByNumberServlet?passjobnumber=" + data.jobApplicationNumber
                window.open(nycUrl, '_blank');
              }
            }
            if (actionId == "LINK_BIS") {
              vm.linkBISRequest(data.jobApplicationNumber, data.idJobApplication, data.id, data.code);
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
      if ($(this).hasClass('delete-icon isButton')) {
        vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
      }
      if ($(this).hasClass('edit-icon isButton')) {
        this.idJobApp = data.id
        this.appType = data
        vm.openModalFormAddPermit(vm.formAddPermit, data.id)
      }
    })
    $('#dt-aplication-permit tbody').on('click', 'td.clickable', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      if ($(this).hasClass('clickable') && data.status > 1) {
        this.idJobApp = data.id
        this.appType = data
        if(!vm.isCustomerLoggedIn && data.status > 1) {
          vm.openModalFormAddPermit(vm.formAddPermit, data.id)
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
    return new Promise((resolve, reject) => {
      this.jobApplicationServices.deleteWorkPermit(id).subscribe(r => {
        this.reload()
        resolve(null)
      }, e => {
        reject()
      })
    })
  }

  /**
   * This method will search permit
   * @method searchPermit
   */
  updatePermits(permit: any) {
    this.reload();

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
    this.modalRef = this.modalService.show(template, { class: 'modal-add-permit', backdrop: 'static', 'keyboard': false })
  }

  /**
   * This method will open Add permit model
   * @method openModalFormAddPermit
   * @param {any} template TemplateRef Object
   * @param {number} id?? Id of permit
   */
  openModalFormAddPermit(template: TemplateRef<any>, id?: number) {
    if (!id) {
      this.idJobAppPermit = 0
      this.isNew = false
    } else {
      this.idJobApp = id
      console.log(this.appType)
      this.isNew = true
    }
    this._openModalFormAddPermit(template)
  }

  /**
   * This method will open popup for upload permit
   * @method openModalUploadPermit
   * @param {any} template TemplateRef Object
   */
  private openModalUploadPermit(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-upload-permit', backdrop: 'static', 'keyboard': false })
  }
  linkBISRequest(idApplication: number, idJobApplication: any, Idpermit: any, code: string) {
    if (idApplication) {
      this.loading = true
      let apidata = {
        idJob: this.idJob,
        JobApplicationNumber: idApplication,
        binNumber: this.jobDetail.binNumber,
        documentDescription: 'Work/Permit type :' + code
      }
      this.jobApplicationServices.pullpermit(apidata).subscribe(r => {
        this.PullpermitData = r
        this.loading = false;
        if (r.length > 0 && !r[0].isError) {
          this._openModalPullPermit(this.pullpermit, 'PULL_PERMIT', idJobApplication, Idpermit)
        } else if (r.length > 0 && r[0].isError) {
          this.toastr.info('Unable to access BIS. Please try in some time.')
        } else if (r.length == 0) {
          this._openModalPullPermit(this.pullpermit, 'PULL_PERMIT', idJobApplication, Idpermit)
        }

        this.loading = false
      }, e => { this.loading = false })
    } else {
      this.loading = false;
      this.toastr.info('Error');
    }
  }

  private _openModalPullPermit(template: TemplateRef<any>, action?: string, jobappid?: any, permitid?: any) {
    this.idJobApp = jobappid;
    this.permitID = permitid;
    this.modalRef = this.modalService.show(template, { class: 'modal-pull-permit', backdrop: 'static', 'keyboard': false })
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
          }
          else {
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