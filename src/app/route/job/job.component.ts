import { HttpClient } from '@angular/common/http';
import { Component, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import * as _ from "underscore";
import { AppComponent } from '../../app.component';
import { API_URL } from '../../app.constants';
import { constantValues, SharedService } from '../../app.constantValues';
import { Message } from '../../app.messages';
import { BoroughServices } from '../../services/borough.services';
import { UserRightServices } from '../../services/userRight.services';
import { borough } from '../../types/borough';
import { Job } from '../../types/job';
import { RfpSubmitServices } from '../addRfp/rfpSubmit/rfpSubmit.services';
import { JobServices } from './job.services';
import { JobSharedService } from './JobSharedService';
import { LocalStorageService } from '../../services/local-storage.service';
import { RequestNewProjectComponent } from '../customer/request-new-project/request-new-project.component';
import { CustomerService } from '../customer/customer.service';
import { IRequestNewProject } from '../../types/customer';

declare const $: any
class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

/**
* This component contains all function that are used in JobComponent
* @class JobComponent
*/
@Component({
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent implements OnInit {

  /**
   * Form Job Add
   * @property formJob
   */
  @ViewChild('formJob', { static: true })
  private formJob: TemplateRef<any>

  /**
   * Add task form
   * @property addtask
   */
  @ViewChild('addtask', { static: true })
  private addtask: TemplateRef<any>

  /**
   * Add transmittal form
   * @property addtransmittal
   */
  @ViewChild('addtransmittal', { static: true })
  private addtransmittal: TemplateRef<any>

  /**
   * Add reason form
   * @property addreason
   */
  @ViewChild('addreason', { static: true })
  private addreason: TemplateRef<any>
  private jobUrl = API_URL + 'api/JobsListPost';
  private advanceSearchURL = API_URL + 'api/Jobs?';
  private boroughs: borough[] = []
  private selectUndefinedOptionValue: any
  private table: any
  private specialColumn: any
  isAddressDisable: boolean = false
  isReAssign: boolean = false
  modalRef: BsModalRef
  modalRefJob: BsModalRef
  modalRefAdvanceSearch: BsModalRef
  private new: boolean = true
  rec: Job
  private idBoroughSearch: number
  private houseSearch: string
  srch: string
  showsrch: boolean = false;
  private placeSearch: string
  filter: any = {}
  private userAccessRight: any = {}
  idJob: number
  jobDetail: Job
  //Job show hide
  showJobAddBtn: string = 'hide'
  private showJobCompleteBtn: string = 'hide'
  private showJobProgressBtn: string = 'hide'
  private showJobViewBtn: string = 'hide'
  private showJobDeleteBtn: string = 'hide'
  private showGenerateLabelBtn: string = 'hide'
  //task
  private showTaskAddBtn: string;
  //RFP
  private showRfpViewBtn: string = 'hide'
  private viewClick: string = "hide"
  private errorMsg: any
  //transmittal
  private showJobTransmittalBtn: string = 'hide'
  //is searching from address
  isSearchFromAddress: boolean = false
  private flager: boolean = false
  private isSent: boolean = false
  statusToSet: string = ''
  public data: any = []
  changeStatusFromReason: any
  private reopen: boolean = false
  loading: boolean = false
  from: string = 'JobModule';
  localSearch: boolean;
  localSearchText: string;
  dataToPostForExport: any = {};
  disableExport: boolean;
  isCustomerLoggedIn: boolean = false;
  customerDetails: any;

  requestNewProjectObject: IRequestNewProject = {
    ProposalnName: "",
    ProposalAddress: "",
    ProposalDescription: ""
  }
  isCustomerAllowForProposal: boolean = false;
  columns = []
  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(
    private boroughServices: BoroughServices,
    private http: HttpClient,
    private router: Router,
    private jobServices: JobServices,
    private zone: NgZone,
    private modalService: BsModalService,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private toastr: ToastrService,
    private rfpSubmitService: RfpSubmitServices,
    private message: Message,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private appComponent: AppComponent,
    private localStorageService: LocalStorageService,
    private customerService: CustomerService
  ) {
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
    this.isCustomerAllowForProposal = this.userRight.checkAllowButton(this.constantValues.SENDEMAILRPOID) == 'show' ? true : false;

    // this.isCustomerLoggedIn = this.localStorageService.getCustomerLoggedIn() ;
    this.errorMsg = message.msg
    if (this.isCustomerLoggedIn) {
      this.customerDetails = this.localStorageService.getCustomerDetails();
      this.jobUrl = API_URL + "api/CustomerJobsListPost/" + this.customerDetails.employeeId
      // this.jobUrl =  API_URL + "api/CustomerJobsListPost"
    } else {
      this.jobUrl = API_URL + "api/JobsListPost"
    }
    this.permission(this.constantValues)
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    let finalsplittedSearchText = ''
    this.appComponent.saveInSessionStorage(this.constantValues.JOBID, null)
    this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, null)
    this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, null)
    this.filter = []
    this.filter['onlyMyJobs'] = 'false'

    /* clearing local filter on routing to other route */
    this.router.events.subscribe(rEvent => {
      if (rEvent instanceof NavigationStart && !(rEvent.url.includes('jobs')))
        this.sharedService.localJobFilter = undefined;
    })

    if (this.sharedService.localJobFilter && (this.sharedService.localJobFilter.searchText || this.sharedService.localJobFilter.filter)) {
      if (this.sharedService.localJobFilter.searchText) {
        this.srch = this.sharedService.localJobFilter.searchText;
        this.loadDataTable();
      }
      if (this.sharedService.localJobFilter.filter) {
        this.filter = this.sharedService.localJobFilter.filter;
        this.loadDataTable(true);
      }
      this.sharedService.localJobFilter = undefined;
    } else {
      this.loadDataTable()
    }
    /** Global search routing 
     * it also search for address
    */
    this.route.params.subscribe(params => {
      /**
       * for searching address 
       * code starts for searching of jobs from address module
       */
      if (!_.isEmpty(params) && params['idRfpAddress']) {
        this.isSearchFromAddress = true
        this.filter['idRfpAddress'] = params['idRfpAddress']
        $('#dt-job').DataTable().destroy();
        $('#dt-job').empty();
        this.flager = true;

        this.loadDataTable(this.flager)
      } else {
        this.isSearchFromAddress = false
      }

      /**
       * code ends for searching of jobs from address module
       */
      let globalSearchType = +params['globalSearchType'];
      let globalSearchText = params['globalSearchText'];

      if (globalSearchText) {
        let splittedSearchText = globalSearchText;
        finalsplittedSearchText = splittedSearchText

      }

      if (globalSearchType && globalSearchText) {
        this.localSearch = false;
        this.filter['globalSearchType'] = globalSearchType
        if (finalsplittedSearchText && globalSearchType == 4) {
          this.filter['globalSearchText'] = finalsplittedSearchText;
        } else {
          this.filter['globalSearchText'] = globalSearchText;
        }

        $('#dt-job').DataTable().destroy();
        $('#dt-job').empty();
        this.flager = true;
        this.loadDataTable(this.flager)
      } else {
        this.localSearch = true;
      }

    });
    //If your date format is mm/dd//yyyy.
    jQuery.extend($.fn.dataTableExt.oSort, {
      "date-uk-pre": function (a: any) {
        if (a == null || a == "") {
          return 0;
        }
        var ukDatea = a.split('/');
        return (ukDatea[2] + ukDatea[0] + ukDatea[1]) * 1;
      },
      "date-uk-asc": function (a: any, b: any) {
        return ((a < b) ? -1 : ((a > b) ? 1 : 0));
      },
      "date-uk-desc": function (a: any, b: any) {
        return ((a < b) ? 1 : ((a > b) ? -1 : 0));
      }
    });
  }

  /**
   * This method is used to set permission for job
   * @method permission
   * @param {any} constantValues set of permission values 
   */
  permission(constantValues: any) {
    //JOB
    this.showJobAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOB)
    if (this.showJobAddBtn == 'show') {
      this.showJobAddBtn = 'add-job';
    } else if (this.showJobAddBtn == 'hide') {
      this.showJobAddBtn = 'hideadd-job';
    }
    this.showJobCompleteBtn = this.userRight.checkAllowButton(constantValues.ADDJOB)
    if (this.showJobCompleteBtn == 'show') {
      this.showJobCompleteBtn = 'complete-job';
    } else if (this.showJobCompleteBtn == 'hide') {
      this.showJobCompleteBtn = 'hidecomplete-job';
    }
    this.showJobProgressBtn = this.userRight.checkAllowButton(constantValues.ADDJOB)
    if (this.showJobProgressBtn == 'show') {
      this.showJobProgressBtn = 'progress-job';
    } else if (this.showJobProgressBtn == 'hide') {
      this.showJobProgressBtn = 'hideprogress-job';
    }
    this.showJobViewBtn = this.userRight.checkAllowButton(constantValues.VIEWJOB)
    this.showGenerateLabelBtn = this.userRight.checkAllowButton(constantValues.VIEWJOB)
    if (this.showGenerateLabelBtn == 'show') {
      this.showGenerateLabelBtn = 'generate-label';
    } else if (this.showGenerateLabelBtn == 'hide') {
      this.showGenerateLabelBtn = 'hidegenerate-label';
    }

    if (this.showJobViewBtn == "show") {
      this.viewClick = "clickable"
    }
    this.showJobDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETEJOB)
    //TASK
    this.showTaskAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOBTASKS)
    if (this.showTaskAddBtn == 'show') {
      this.showTaskAddBtn = 'create-task';
    } else if (this.showTaskAddBtn == 'hide') {
      this.showTaskAddBtn = 'hidecreate-task';
    }
    //RFP    
    this.showRfpViewBtn = 'hide'//this.userRight.checkAllowButton(constantValues.VIEWRFP)
    //Transmittal
    this.showJobTransmittalBtn = this.userRight.checkAllowButton(constantValues.ADDTRANSMITTALS)
    if (this.showJobTransmittalBtn == 'show') {
      this.showJobTransmittalBtn = 'send-email';
    } else if (this.showJobTransmittalBtn == 'hide') {
      this.showJobTransmittalBtn = 'hidesend-email';
    }

    this.specialColumn = new $.fn.dataTable.SpecialColumn([
      {
        id: 'JOB_HOLD_OR_INPROGRESS',
        title: 'Put Project on Hold',
        customClass: this.isCustomerLoggedIn ? 'hide' : this.showJobProgressBtn
      }, {
        id: 'JOB_COMPLETED_OR_INPROGRESS',
        title: 'Project Completed',
        customClass: this.isCustomerLoggedIn ? 'hide' : this.showJobCompleteBtn
      },
      {
        id: 'ADD_TASK',
        title: 'Create Task',
        customClass: this.isCustomerLoggedIn ? 'hide' : this.showTaskAddBtn
      }, {
        id: 'DOWNLOAD_PROPOSAL',
        title: 'Download Proposal',
        customClass: this.isCustomerLoggedIn ? 'hide' : this.showRfpViewBtn
      }, {
        id: 'SEND_EMAIL',
        title: 'Send Email',
        customClass: this.isCustomerLoggedIn ? 'hide' : this.showJobTransmittalBtn
      }, {
        id: 'GENERATE_LABEL',
        title: 'Generate Project Label',
        customClass: this.isCustomerLoggedIn ? 'hide' : this.showGenerateLabelBtn
      },
      {
        id: 'VIEW_ON_BIS',
        title: 'View On BIS',
        customClass: ''
      },
      {
        id: 'VIEW_ON_DOB_NOW',
        title: 'View On DOB Now',
        customClass: this.isCustomerLoggedIn ? 'show' : 'hide'
      },
      {
        id: 'DELETE_JOB',
        title: 'Delete Project',
        customClass: this.isCustomerLoggedIn ? 'hide' : this.showJobDeleteBtn
      }], false, this.isCustomerLoggedIn ? 30 : '')
    // this.specialColumn.defaultContent = `
    // <img src="./assets/images/edit_icon.svg" class="edit-icon" width="24px">
    // ` + this.specialColumn.defaultContent
    // this.specialColumn.sDefaultContent = this.specialColumn.defaultContent
    this.onSave = this.onSave.bind(this)
    this.reload = this.reload.bind(this)
    this.reloadAdvanceSearch = this.reloadAdvanceSearch.bind(this)
  }

  /**
   * This method load datatable
   * @method loadDataTable 
   */
  loadDataTable(filterFlag?: boolean) {
    this.setColumns()
    return new Promise<any>((resolve) => {
      filterFlag = filterFlag ? filterFlag : false;
      // this.getBoroughs()
      document.title = 'Projects'
      this.flager = filterFlag;
      var vm = this;
      vm.table = $('#dt-job').DataTable({
        retrieve: true,
        serverSide: !vm.flager,
        processing: true,
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
          sEmptyTable: "No projects to show",
          zeroRecords: "No projects to show",
          infoFiltered: ""
        },
        ajax: (dataTablesParameters: any, callback: any) => {
          if (!vm.flager) {
            console.log('dataTablesParameters', dataTablesParameters)
            delete dataTablesParameters['draw']
            dataTablesParameters['start'] = dataTablesParameters['start'] + dataTablesParameters.length
            let order = dataTablesParameters.order[0];
            if (dataTablesParameters['search'].value) {
              let searchValue = dataTablesParameters['search'].value;
              delete dataTablesParameters['search']
              dataTablesParameters['search'] = searchValue;
            }
            let columnIndex = order.column;
            let columnName = dataTablesParameters.columns[columnIndex].data;
            order['column'] = columnName;
            dataTablesParameters['orderedColumn'] = order;
            delete dataTablesParameters['order'];
            delete dataTablesParameters['columns'];
            if (dataTablesParameters['search'].value == '') {
              delete dataTablesParameters['search'];
              dataTablesParameters['search'] = ''
            }
            if (vm.sharedService.localJobFilter && vm.sharedService.localJobFilter.searchText) {
              dataTablesParameters['search'] = vm.srch
            }
            vm.dataToPostForExport = dataTablesParameters;
            vm.http.post<DataTablesResponse>(`${vm.jobUrl}`, dataTablesParameters, {}).subscribe(resp => {
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: resp.data
              });
            });
          } else {
            let queryString = ''
            let finalURL = ''

            for (let key in vm.filter) {
              if (!((vm.localSearch || (vm.sharedService.localJobFilter && vm.sharedService.localJobFilter.filter)) && (key == 'globalSearchType' || key == 'globalSearchText'))) {
                queryString = `${queryString}${key}=${vm.filter[key]}&`
                finalURL = `${vm.advanceSearchURL}${queryString}`
              }

            }
            vm.http.get<DataTablesResponse>(`${finalURL}`,).subscribe(resp => {
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: resp.data
              });
            });
            this.flager = false;
          }

        },
        columnDefs: [
          { type: 'date-uk', targets: 1 } //specify your date column number,starting from 0

        ],
        columns: this.columns,
        drawCallback: (setting: any) => {
          if (setting.aaSorting && setting.aaSorting[0]) {
            vm.dataToPostForExport['orderedColumn'] = { column: setting.aoColumns[setting.aaSorting[0][0]].mData, dir: setting.aaSorting[0][1] };
          }
          vm.disableExport = setting.aiDisplay.length == undefined || setting.aiDisplay.length == 0

          $('.jobRedirect').on('click', function (ev: any) {
            localStorage.setItem('isFromTask', 'true')
          })
        },
        rowCallback: ((row: any, data: any, index: any) => {
          $(row).find('.delete-icon').hide();
          if (this.isCustomerLoggedIn) {
            $(row).find('.edit-icon').hide();
            $(row).find('.view-icon').hide();
          }
          else {
            $(row).find('.view-icon').removeClass('hide');
          }

          if (data.statusDescription == 'Close' || data.statusDescription == 'Hold') {
            // $(row).find('.edit-icon').hide();
            // $(row).find('.view-icon').addClass("disabled");
            $(row).find('.edit-icon').addClass("disabled");
            $(row).find('.add-job').hide();
            $(row).find('.hideadd-job').hide();
            $(row).find('.create-task').hide();
            $(row).find('.hidecreate-task').hide();
            $(row).find('.send-email').hide();
            $(row).find('.hidesend-email').hide();
            $(row).find('.generate-label').hide();
            $(row).find('.hidegenerate-label').hide();
            if (data.statusDescription == 'Close') {
              $(row).find('.complete-job').show();
              $(row).find('.hidecomplete-job').show();
              $(row).find('.progress-job').hide();
              $(row).find('.hideprogress-job').hide();
            }
            if (data.statusDescription == 'Hold') {
              $(row).find('.complete-job').hide();
              $(row).find('.hidecomplete-job').hide();
              $(row).find('.progress-job').show();
              $(row).find('.hideprogress-job').show();
            }
          }
          if (data.statusDescription == 'Active' && !this.isCustomerLoggedIn) {
            $(row).find('.edit-icon').show();
            $(row).find('.edit-icon').removeClass("disabled");
          }



        }),
        initComplete: () => {
          $('.jobRedirect').on('click', function (ev: any) {
            localStorage.setItem('isFromTask', 'true')
          })
          this.specialColumn
            .ngZone(vm.zone)
            .dataTable(vm.table)
            .onActionPopup((data: any, action: any) => {
              if (action.id === 'JOB_HOLD_OR_INPROGRESS') {
                if (data.status != 3) {
                  if (data.status == 1) {
                    action.title = 'Project On Hold'
                  } else if (data.status == 2) {
                    action.title = 'Put Project In-Progress'
                  }
                } else {
                  action.title = 'Put Project On Hold'
                }
              }
              if (action.id === 'JOB_COMPLETED_OR_INPROGRESS') {
                if (data.status == 3) {
                  action.title = 'Re-Open Project'
                } else {
                  action.title = 'Project Completed'
                }
              }
            })
            .onActionClick((row: any, actionId: any) => {
              const data = row.data()
              if (actionId == 'EDIT_JOB') {
                this.loading = true;
                if (data.status == 3) {
                  this.toastr.info(this.constantValues.JOB_RE_OPEN, 'Info')
                } else if (data.status == 2) {
                  this.toastr.info(this.constantValues.JOB_IN_PROGRESS, 'Info')
                } else {
                  if (actionId == 'REASSIGN') {
                    this.isAddressDisable = false
                    this.isReAssign = true
                  } else {
                    this.isAddressDisable = true
                    this.isReAssign = false
                  }
                  vm.openAddJobModal(vm.formJob, data.id)
                }
              }

              if (actionId == 'JOB_HOLD_OR_INPROGRESS') {

                this.idJob = data.id
                if (data.status != 3) {
                  this.jobDetail = data;
                  this.isSent = false;

                  if (data.status == 1) {
                    this.changeStatusFromReason = 2
                    this.statusToSet = 'on-hold';
                    this.reopen = false
                  } else {
                    this.changeStatusFromReason = 1
                    this.statusToSet = 'In-progress';
                    this.reopen = false
                  }
                  this.openAddReasonForm(this.addreason, data.id)
                } else {
                  this.toastr.info(this.constantValues.JOB_RE_OPEN, 'Info')
                }
              }
              if (actionId == 'JOB_COMPLETED_OR_INPROGRESS') {
                this.changeStatusFromReason = data.status
                if (data.status != 2) {
                  if (data.status == 3) {

                    this.isSent = true;
                    this.idJob = data.id;
                    this.jobDetail = data;
                    this.statusToSet = 'Re-open';
                    this.changeStatusFromReason = 1
                    data.status = 1
                    this.reopen = true
                    this.openAddReasonForm(this.addreason, data.id)
                  } else {
                    this.changeStatusFromReason = 3
                    data.status = 3
                    this.reopen = false
                    this.changeCompletedStatus(data)
                  }
                } else {
                  this.toastr.info(this.constantValues.JOB_IN_PROGRESS, 'Info')
                }

              }
              if (actionId == 'GENERATE_LABEL') {
                this.jobServices.generateLabel(data.id).subscribe(r => {
                  window.open(r, '_blank');
                  this.toastr.success('Label generated successfully')
                }, e => {
                })
              }

              if (actionId == "VIEW_ON_BIS") {
                if (data.binNumber) {
                  // window.open("http://a810-bisweb.nyc.gov/bisweb/JobsQueryByLocationServlet?requestid=1&allbin=" + data.binNumber, '_blank');
                  window.open("https://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?bin=" + data.binNumber, '_blank');
                } else {
                  this.toastr.info(this.errorMsg.binNumberNotExist);
                }
              }

              if (actionId == "VIEW_ON_DOB_NOW") {
                window.open("https://a810-lmpaca.nyc.gov/CitizenAccessBuildings/", '_blank');
              }

              if (actionId == "ADD_TASK") {
                this.idJob = data.id
                vm.openModalForm(vm.addtask)
              }

              if (actionId == "DOWNLOAD_PROPOSAL") {
                vm.downloadPdf(data.idRfp)
              }

              if (actionId == "SEND_EMAIL") {
                this.loading = true;
                if (data.id) {
                  this.idJob = data.id
                  if (this.isCustomerLoggedIn) {
                    this.jobServices.getCustomerJobDetailById(this.idJob).subscribe(r => {
                      this.jobDetail = r
                      vm.openCreateTransmittalModal(vm.addtransmittal, "", data.id)
                    })
                  } else {
                    this.jobServices.getJobById(this.idJob).subscribe(r => {
                      this.jobDetail = r
                      vm.openCreateTransmittalModal(vm.addtransmittal, "", data.id)
                    })
                  }
                }
              }
            })
        }
      });

      $('#dt-job tbody').on('click', 'td.clickable', function (ev: any) {
        const row = vm.table.row($(this).parents('tr'))
        const data = row.data()
        if (vm.isCustomerLoggedIn) {
          if ((data.statusDescription === 'Hold' || data.statusDescription === 'Close')) {
            vm.toastr.warning("Please contact RPO administration")
          }
          else {
            if ($(this).hasClass('clickable')) {
              if (vm.showJobViewBtn == "show" && (data.statusDescription !== 'Hold' && data.statusDescription !== 'Close')) {
                vm.onOpenJobDetail(data);
              }
            }
          }
        } else {
          if ($(this).hasClass('clickable')) {
            vm.onOpenJobDetail(data);
          }
        }
      });
      $('#dt-job tbody').on('click', 'span', function (ev: any) {
        const row = vm.table.row($(this).parents('tr'))
        const data = row.data()
        if ($(this).hasClass('edit-icon')) {
          if ($(this).hasClass('disabled')) {
            return
          }
          vm.loading = true;
          if (data.status == 3) {
            vm.toastr.info(vm.constantValues.JOB_RE_OPEN, 'Info')
          } else if (data.status == 2) {
            vm.toastr.info(vm.constantValues.JOB_IN_PROGRESS, 'Info')
          } else {
            vm.isAddressDisable = true
            vm.isReAssign = false
            vm.openAddJobModal(vm.formJob, data.id)
          }
        }

        if ($(this).hasClass('view-icon')) {
          if (vm.isCustomerLoggedIn) {
            if (vm.showJobViewBtn == "show" && (data.statusDescription !== 'Hold' && data.statusDescription !== 'Close')) {
              vm.onOpenJobDetail(data);
            }
          } else {
            vm.onOpenJobDetail(data);
          }
        }
      })

      $('#dt-job tbody').on('mousedown', 'a.jobRedirect', function (ev: any) {
        const row = vm.table.row($(this).parents('tr'))
        const data = row.data()
        ev = ev || window.event;
        switch (ev.which) {
          case 1:
            if (vm.showJobViewBtn == "show" && (data.statusDescription !== 'Hold' && data.statusDescription !== 'Close')) {
              vm.onOpenJobDetail(data);
            }
            break;
          case 3:
            let jobtype = '';
            let jobtypeId = '';
            if (data.jobApplicationType) {
              let appType = data.jobApplicationType.split(',');
              if (appType && appType.length > 0) {
                let keepGoing = true;
                appType.forEach((idJobAppType: any) => {
                  if (keepGoing) {
                    if (idJobAppType == 3) {

                      keepGoing = false;
                      jobtype = 'violation';
                    } else if (idJobAppType == 2) {
                      keepGoing = false;
                      jobtype = 'dot';
                      jobtypeId = idJobAppType;
                    } else {
                      keepGoing = false;
                      jobtype = 'application';
                      jobtypeId = idJobAppType;
                    }
                  }
                })
              }
            }
            if (jobtypeId != '') {
              $(this).attr('href', './job/' + data.id + '/' + jobtype + ';' + 'idJobAppType=' + jobtypeId)
            } else {
              $(this).attr('href', './job/' + data.id + '/' + jobtype)
            }


            ; break;
        }
      });

      resolve(null);
    });
  }

  /**
   * This method is used to change status
   * @method EventForChangingTheStatus
   * @param {any} res Job Result 
   */
  EventForChangingTheStatus(res?: any) {
    if (!this.isSent) {
      this.changeHoldOrInProgessStatus(res)
    } else {
      this.changeCompletedStatus(res)
    }
  }

  /**
   * This method is used open add transmittal popup
   * @method openCreateTransmittalModal
   * @param {any} template TemplateRef 
   * @param {string} action Identify Action 
   * @param {number} id ID of Job 
   */
  private openCreateTransmittalModal(template: TemplateRef<any>, action?: string, id?: number) {
    this.loading = false;
    this.modalRef = this.modalService.show(template, { class: 'modal-add-transmittal', backdrop: 'static', 'keyboard': false })
  }

  /**
   * This method is used to download PDF
   * @method downloadPdf
   * @param {number} idRfp ID of RFP 
   */
  downloadPdf(idRfp: number) {
    if (idRfp) {
      this.rfpSubmitService.downloadPdf(idRfp).subscribe(r => {
        if (r && r[0]['key'] == 'pdfFilePath') {
          window.open(r[0]['value'], '_blank');
        }
      })
    } else {
      this.toastr.info(this.errorMsg.noRfpRelatedWithJob)
    }
  }

  /**
   * This method is used to open popup for add task
   * @method openModalForm
   * @param {any} template TemplateRef Object 
   * @param {number} id ID of Job 
   */
  openModalForm(template: TemplateRef<any>, id?: number) {
    this.modalRef = this.modalService.show(template, { class: 'modal-add-task' })
  }

  /**
   * This method is reload datatable after save record
   * @param {Job} jobObj Job Object
   * @param {any} evt Event Object 
   */
  onSave(jobObj: Job, evt: any) {
    this.table.clearPipeline()
    this.table.ajax.reload()
  }

  /**
   * This method reloads datatable after advance search
   * @method reloadAdvanceSearch
   * @param {any} filter Search Criteria 
   */
  reloadAdvanceSearch(filter: any) {
    this.localSearch = true;
    this.sharedService.localJobFilter = { filter: filter, searchText: '' }
    this.sharedService.clearGlobalSearch.emit('jobs');
    this.filter = []
    this.filter = filter
    if (Object.keys(filter).length > 1) {
      $('#dt-job').DataTable().destroy();
      $('#dt-job').empty();
      this.flager = true;
    } else {
      $('#dt-job').DataTable().destroy();
      $('#dt-job').empty();
      this.flager = false;
    }
    this.loadDataTable(this.flager);
  }


  /**
   * This method will call when job detail page open
   * @method onOpenJobDetail
   * @param {any} data JobData 
   */
  private onOpenJobDetail(data: any) {
    //this call is used to set data in shared service
    this.appComponent.setCommonJobObject(data.id);
  }

  /**
   * This method will open popup for add job
   * @method _openAddJobModal
   * @param {any} template TemplateRef Object 
   */
  private _openAddJobModal(template: TemplateRef<any>) {
    this.loading = false;
    this.modalRefJob = this.modalService.show(template, { class: 'modal-job', backdrop: 'static', 'keyboard': false })
  }

  /**
   * This method will open popup for add job
   * @method openAddJobModal
   * @param {any} template TemplateRef Object
   * @param {number} id? ID of Job
   * @param {boolean} isNew? Identify Job is create or edit
   */
  openAddJobModal(template: TemplateRef<any>, id?: number, isNew?: boolean) {
    if (isNew) {
      this.isAddressDisable = false
      this.isReAssign = false
    }
    this.new = !!!id
    if (this.new) {
      this.rec = {} as Job
      this._openAddJobModal(template)
    } else {
      if (this.isCustomerLoggedIn) {
        this.jobServices.getCustomerJobDetailById(id).subscribe(r => {
          this.rec = r as Job
          this._openAddJobModal(template)
        })
      } else {
        this.jobServices.getJobById(id).subscribe(r => {
          this.rec = r as Job
          this._openAddJobModal(template)
        })
      }
    }
  }

  /**
   * This method will open popup for advance search
   * @method _openModalAdvanceSearch
   * @param {any} template TemplateRef Object
   * @param {number} id ID of Job
   * @param {boolean} isNew Identify Job is create or edit
   */
  private _openModalAdvanceSearch(template: TemplateRef<any>) {
    this.modalRefAdvanceSearch = this.modalService.show(template, { class: 'modal-advance-search' })
  }

  /**
   * This method will open popup for advance search
   * @method openModalAdvanceSearch
   * @param {any} template TemplateRef Object
   * @param {number} id? ID of Job
   */
  openModalAdvanceSearch(template: TemplateRef<any>, id?: number) {
    this._openModalAdvanceSearch(template)
  }

  /**
   * This method will open popup for add reason
   * @method openAddReasonForm
   * @param {any} template TemplateRef Object
   * @param {number} id ID of Job
   */
  private openAddReasonForm(template: TemplateRef<any>, id?: number) {
    this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static', 'keyboard': false })
  }

  /**
   * This method search in job datatable
   * @method searchJob
   * @param {string} srch Search Criteria 
   */
  public searchJob(srch: string) {
    this.localSearch = true;
    this.localSearchText = srch;
    this.sharedService.localJobFilter = { filter: undefined, searchText: this.localSearchText }
    this.sharedService.clearGlobalSearch.emit('jobs');
    this.showsrch = true;
    this.table.search(srch).draw()
  }


  /**
   * This method reload datatable
   * @method reload
   */
  reload() {
    this.table.clearPipeline()
    this.flager = false;
    this.table.ajax.reload()
  }

  /**
   * This method is clear search
   * @method clearsearch
   */
  clearsearch() {
    this.showsrch = false;
    this.srch = '';
    this.table.clearPipeline()
    this.flager = false;

    this.table.search(this.srch).draw()
  }

  /**
   * This method get all borough list
   * @method getBoroughs
  */
  private getBoroughs() {
    if (!this.boroughs.length) {
      this.boroughServices.getDropdownData().subscribe(r => {
        this.boroughs = _.sortBy(r, "description")
      })
    }
  }

  /**
   * This method change job status
   * @method changeHoldOrInProgessStatus
   * @param {any} data Job Data 
   */
  private changeHoldOrInProgessStatus(data: any) {
    if (data.jobDetail.status == 1) {
      data.jobDetail.status = 2
    } else {
      data.jobDetail.status = 1
    }
    if (!data.isFromReason) {
      this.jobServices.changeJobStatus(data.id, data).subscribe(r => {
        this.isSent = false;
        this.statusToSet = '';
        this.toastr.success('Project Status updated successfully.')
        this.reload()
      })
    } else {
      this.isSent = false;
      this.statusToSet = '';
      this.toastr.success('Project Status updated successfully.')
      this.reload()
    }
  }

  /**
  * This method change job status
  * @method changeHoldOrInProgessStatus
  * @param {any} data Job Data 
  */
  private changeCompletedStatus(data: any) {
    if (!this.reopen) {
      let dataStatus = {
        jobStatus: data.status,
        statusReason: "",
      }
      this.jobServices.changeJobStatus(data.id, dataStatus).subscribe(r => {
        this.isSent = false;
        this.statusToSet = '';
        this.reload()
      })
    } else {
      data.jobDetail.status = 1
      this.isSent = false;
      this.statusToSet = '';
      this.toastr.success('Project Status updated successfully.')
      this.reload()
    }

  }

  /**
   * This method export Jobs Report
   * @method exportData
   * @param {string} str 
   */
  exportJobs(str: string) {
    let tempFilter = Object.assign({}, this.filter); // convert filter array to object 
    let data = { ...tempFilter, ...this.dataToPostForExport };
    data['search'] = this.srch;
    this.http.post(API_URL + (str == 'pdf' ? 'api/Jobs/exporttopdf' : 'api/Jobs/exporttoexcel'), data).subscribe((r: [any]) => {
      if (r) {
        r.forEach(e => {
          if (e.key == 'exportFilePath') {
            window.open(e.value, "_blank");
          }
        })
      }
    })
  }

  //Clear Local Serach and Filter
  clearLocalSearchAndFilter() {
    this.srch = '';
    this.filter = []
    this.filter['onlyMyJobs'] = 'false'
  }

  openRequestProposalModal() {
    // if(!this.isCustomerAllowForProposal) {
    //   this.toastr.warning("Please contact RPO administration")
    //   return 
    // }
    this.modalRef = this.modalService.show(RequestNewProjectComponent, {
      class: "modal-md",
    });
    this.modalRef.content.modalRef = this.modalRef;
    const unsubscribe = this.modalService.onHidden.subscribe((reason: string) => {
      if (this.modalRef.content) {
        this.requestNewProjectObject.ProposalnName =
          this.modalRef.content?.projectName;
        this.requestNewProjectObject.ProposalAddress = this.modalRef.content?.address;
        this.requestNewProjectObject.ProposalDescription =
          this.modalRef.content?.projectDesc;
        this.saveNewProjectDetail();
        unsubscribe.unsubscribe()
      }
    })
  }

  saveNewProjectDetail() {
    if (
      this.requestNewProjectObject.ProposalnName &&
      this.requestNewProjectObject.ProposalAddress &&
      this.requestNewProjectObject.ProposalDescription
    ) {
      this.loading = true;
      this.customerService
        .saveNewProjectDetail(this.requestNewProjectObject)
        .subscribe(
          (res) => {
            this.loading = false;
            console.log(res);
            if (res) {
              this.toastr.success("New proposal request sent successfully.");
            }
          },
          (error) => {
            this.loading = false;
            this.toastr.error(error.message);
          }
        )
    }
  }

  setColumns() {
    if (!this.isCustomerLoggedIn) {
      this.columns = [
        {
          title: 'Project #',
          data: 'jobNumber',
          class: `jobname ${this.viewClick}`,
          // class: 'jobname',
          render: function (data: any, type: any, dataToSet: any) {
            let jobtype = '';
            let jobtypeId = '';
            if (dataToSet.jobApplicationType) {
              let appType = dataToSet.jobApplicationType.split(',');
              if (appType && appType.length > 0) {
                let keepGoing = true;
                appType.forEach((idJobAppType: any) => {
                  if (keepGoing) {
                    // vm.jobSharedService.setJobAppType(idJobAppType);
                    // this.appComponent.saveInSessionStorage(this.constantValues.JOBID, dataToSet.id)
                    if (idJobAppType == 3) {
                      // this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, idJobAppType)
                      keepGoing = false;
                      // this.loading = false
                      jobtype = 'violation';
                    } else if (idJobAppType == 2) {
                      // this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, idJobAppType)
                      keepGoing = false;
                      // this.loading = false
                      jobtype = 'dot';
                      jobtypeId = idJobAppType;
                    } else {
                      // this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, idJobAppType)
                      keepGoing = false;
                      // this.loading = false
                      jobtype = 'application';
                      jobtypeId = idJobAppType;
                    }
                  }
                })
              }
            }
            if (jobtypeId != '') {
              // return "<a class='jobRedirect' href='./job/" + dataToSet.id + "/"+jobtype +";"+'idJobAppType='+ jobtypeId + " ' rel='noreferrer' target='_blank'><span class='status status" + dataToSet.status + "'> </span>" + dataToSet.jobNumber + " </a>";
              return dataToSet.jobNumber;
              // return "<span class='status status" + dataToSet.status + "'> </span>" + dataToSet.jobNumber;
              // return "<a class='jobRedirect' href='javascript:void(0)' rel='noreferrer'><span class='status status" + dataToSet.status + "'> </span>" + dataToSet.jobNumber + " </a>";
            } else {
              // return "<a class='jobRedirect' href='./job/" + dataToSet.id + "/"+jobtype + "'rel='noreferrer' target='_blank'> <span class='status status" + dataToSet.status + "'> </span>" + dataToSet.jobNumber + " </a>";
              return dataToSet.jobNumber;
              // return "<span class='status status" + dataToSet.status + "'> </span>" + dataToSet.status + '   ' + dataToSet.jobNumber;
              // return "<a class='jobRedirect' href='javascript:void(0)'rel='noreferrer'> <span class='status status" + dataToSet.status + "'> </span>" + dataToSet.jobNumber + " </a>";
            }


          },
          createdCell: function (td, cellData, rowData, row, col) {
            if (rowData.status.toString() == '3') {
              $(td).addClass('grey-status-border');
            } else if (rowData.status.toString() == '2') {
              $(td).addClass('red-status-border');
            } else if (rowData.status.toString() == '1') {
              $(td).addClass('green-status-border');
            }
          },
          width: 120,
        },
        {
          title: 'Project Name',
          data: 'qbJobName',
          class: this.viewClick,
          width: '150',
        },
        {
          // title: 'Project Highlight',
          title: 'Project Status Notes',
          // data: 'notes',
          data: 'jobStatusNotes',
          class: this.viewClick,
          width: '150',
        },
        {
          title: 'FLOOR',
          data: 'floorNumber',
          class: this.viewClick,
          width: 100
        }, {
          title: 'APT',
          data: 'apartment',
          class: this.viewClick,
          width: 50,
        },
        {
          title: 'SPECIAL PLACE NAME',
          data: 'specialPlace',
          class: this.viewClick,
        }, {
          title: 'ADDRESS',
          data: 'address',
          class: this.viewClick,
          render: function (data: any, type: any, dataToSet: any) {
            let address = ""
            if (dataToSet.houseNumber) {
              address = address + dataToSet.houseNumber
            }
            if (dataToSet.streetNumber) {
              address = address + " " + dataToSet.streetNumber
            }
            if (dataToSet.borough) {
              address = address + ", " + dataToSet.borough
            }
            return address;
          }
        },
        {
          title: 'COMPANY',
          data: 'company',
          class: this.viewClick,
        },
        {
          title: 'CONTACT',
          data: 'contact',
          class: this.viewClick,
        },
        this.specialColumn
      ]
    } else {
      this.columns = [
        {
          title: 'Project #',
          data: 'jobNumber',
          class: `jobname ${this.viewClick}`,
          // class: 'jobname',
          render: function (data: any, type: any, dataToSet: any) {
            let jobtype = '';
            let jobtypeId = '';
            if (dataToSet.jobApplicationType) {
              let appType = dataToSet.jobApplicationType.split(',');
              if (appType && appType.length > 0) {
                let keepGoing = true;
                appType.forEach((idJobAppType: any) => {
                  if (keepGoing) {
                    // vm.jobSharedService.setJobAppType(idJobAppType);
                    // this.appComponent.saveInSessionStorage(this.constantValues.JOBID, dataToSet.id)
                    if (idJobAppType == 3) {
                      // this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, idJobAppType)
                      keepGoing = false;
                      // this.loading = false
                      jobtype = 'violation';
                    } else if (idJobAppType == 2) {
                      // this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, idJobAppType)
                      keepGoing = false;
                      // this.loading = false
                      jobtype = 'dot';
                      jobtypeId = idJobAppType;
                    } else {
                      // this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, idJobAppType)
                      keepGoing = false;
                      // this.loading = false
                      jobtype = 'application';
                      jobtypeId = idJobAppType;
                    }
                  }
                })
              }
            }
            if (jobtypeId != '') {
              // return "<a class='jobRedirect' href='./job/" + dataToSet.id + "/"+jobtype +";"+'idJobAppType='+ jobtypeId + " ' rel='noreferrer' target='_blank'><span class='status status" + dataToSet.status + "'> </span>" + dataToSet.jobNumber + " </a>";
              return dataToSet.jobNumber;
              // return "<span class='status status" + dataToSet.status + "'> </span>" + dataToSet.jobNumber;
              // return "<a class='jobRedirect' href='javascript:void(0)' rel='noreferrer'><span class='status status" + dataToSet.status + "'> </span>" + dataToSet.jobNumber + " </a>";
            } else {
              // return "<a class='jobRedirect' href='./job/" + dataToSet.id + "/"+jobtype + "'rel='noreferrer' target='_blank'> <span class='status status" + dataToSet.status + "'> </span>" + dataToSet.jobNumber + " </a>";
              return dataToSet.jobNumber;
              // return "<span class='status status" + dataToSet.status + "'> </span>" + dataToSet.status + '   ' + dataToSet.jobNumber;
              // return "<a class='jobRedirect' href='javascript:void(0)'rel='noreferrer'> <span class='status status" + dataToSet.status + "'> </span>" + dataToSet.jobNumber + " </a>";
            }
          },
          createdCell: function (td, cellData, rowData, row, col) {
            if (rowData.status.toString() == '3') {
              $(td).addClass('grey-status-border');
            } else if (rowData.status.toString() == '2') {
              $(td).addClass('red-status-border');
            } else if (rowData.status.toString() == '1') {
              $(td).addClass('green-status-border');
            }
          },
          width: 120,
        },
        {
          title: 'Project Name',
          data: 'projectName',
          class: this.viewClick,
          width: '150',
          render: function (data: any, type: any, dataToSet: any) {
            if (data == "null") {
              return ""
            } else {
              return data
            }
          },
          // visible: !this.isCustomerLoggedIn ? false : true,
        },
        {
          title: 'RPO Project Manager',
          data: 'projectManager',
          class: this.viewClick,
          width: '120',
        },
        {
          title: 'FLOOR',
          data: 'floorNumber',
          class: this.viewClick,
          width: 50
        },
        {
          title: 'SPECIAL PLACE NAME',
          data: 'specialPlace',
          class: this.viewClick,
        }, {
          title: 'ADDRESS',
          data: 'address',
          class: this.viewClick,
          render: function (data: any, type: any, dataToSet: any) {
            let address = ""
            if (dataToSet.houseNumber) {
              address = address + dataToSet.houseNumber
            }
            if (dataToSet.streetNumber) {
              address = address + " " + dataToSet.streetNumber
            }
            if (dataToSet.borough) {
              address = address + ", " + dataToSet.borough
            }
            return address;
          }
        },
        {
          title: 'Project Status',
          data: 'statusDescription',
          class: this.viewClick,
          width: '100',
          visible: !this.isCustomerLoggedIn ? false : true,
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.statusDescription === "Active") {
              return "In-Progress"
            } else {
              return dataToSet.statusDescription
            }
          }
        },
        this.specialColumn
      ]
    }
  }
}