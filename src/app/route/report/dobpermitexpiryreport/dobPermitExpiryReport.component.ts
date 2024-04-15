import { Component, ElementRef, NgZone, TemplateRef, ViewChild, OnInit, Input, Inject, ChangeDetectorRef } from '@angular/core';
import { assign, identity, pickBy } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { ReportServices } from '../report.services';
import { constantValues } from '../../../app.constantValues';
import { Router, ActivatedRoute } from '@angular/router';
import { UserRightServices } from '../../../services/userRight.services';
import { Message } from '../../../app.messages';
import * as _ from "underscore";
import * as moment from 'moment';
import { LocalStorageService } from '../../../services/local-storage.service';
declare const $: any

/**
* This component contains all function that are used in DobPermit Expiry Component
* @class AllViolationReportComponent
*/
@Component({
  templateUrl: './dobPermitExpiryReport.component.html',
  styleUrls: ['./dobPermitExpiryReport.component.scss']
})
export class DobPermitExpiryReportComponent implements OnInit {

  private table: any
  private jobObj: any
  idJob: any
  modalRef: BsModalRef
  modalRefAdvanceSearch: BsModalRef
  filter: any = {}
  private filterForDownload: any = {}
  private userAccessRight: any = {}
  private columns: any = []
  private columnDefs: any = []
  private fulltabledata: any = []
  loading: boolean = false
  private sortBy: string = '';
  private searchParam = '';
  private sortOrder = '';
  isCustomerLoggedIn: boolean = false;
  /**
     * reportAdvanceSearch Form
     * @property reportAdvanceSearch
     */
  @ViewChild('permitReportAdvanceSearch', { static: true })
  private permitReportAdvanceSearch: TemplateRef<any>

  /**
   * Add transmittal form
   * @property addtransmittal
   */
  @ViewChild('addtransmittal', { static: true })
  private addtransmittal: TemplateRef<any>
  reportDocument: { name: any; path: any; displayPath: any; };
  modalRefJobSelect: BsModalRef;

  @ViewChild('jobSelect', { static: true })
  private jobSelect: TemplateRef<any>
  disableExport: boolean;
	public showExportBtn: string = 'hide';
  srch: string;

  /**
    * This method define all services that requires in whole class
    * @method constructor
    */
  constructor(
    private router: Router,
    private reportServices: ReportServices,
    private modalService: BsModalService,
    private constantValues: constantValues,
    private route: ActivatedRoute,
    private appComponent: AppComponent,
    private cdRef: ChangeDetectorRef,
    private userRight: UserRightServices,
    private localStorageService: LocalStorageService
  ) {


  }

  ngAfterViewChecked() {
   
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
		this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
    if(this.isCustomerLoggedIn) {
      this.showExportBtn = this.userRight.checkAllowButton(this.constantValues.VIEWPERMITEXPIRYREPORTID)
    } else {
      this.showExportBtn = this.userRight.checkAllowButton(this.constantValues.EXPORTREPORT)
    }
    this.isCustomerLoggedIn = this.localStorageService.getCustomerLoggedIn();
    // $('#dt-dob-permit-report').DataTable().destroy()
    // $('#dt-dob-permit-report').empty()
    this.filter = []
    this.loadDataTable()
  }

  getDobColumns() {
    return [{
      title: 'Project#',
      data: 'jobNumber',
      render: function (data: any, type: any, dataToSet: any) {
        if (dataToSet.idJob) {
          return dataToSet.jobNumber;
        } else {
          return dataToSet.jobNumber
        }
      },
      class: 'jobRedirect maxWidth-120'
    },
    {
      title: 'Project Name',
      data: 'projectName',
      visible: this.isCustomerLoggedIn,
      // render: function (data: any, type: any, dataToSet: any) {
      //   return 'test';
      // }
    },
    {
      title: 'Project Address | Apt | Floor',
      data: 'jobAddress',
      render: function (data: any, type: any, dataToSet: any) {
        let fullAdd = "";
        if (dataToSet.jobAddress) {
          fullAdd = dataToSet.jobAddress;
        }
        if (dataToSet.apartment) {
          fullAdd += " | " + dataToSet.apartment;
        }
        if (dataToSet.floorNumber) {
          fullAdd += " | " + dataToSet.floorNumber;
        }
        return fullAdd;
      },
      class: 'jobRedirect'
    },
    {
      title: 'Special Place',
      data: 'specialPlace',
      class: 'jobRedirect',
      visible: !this.isCustomerLoggedIn
    },
    {
      title: 'App Type',
      data: 'jobApplicationTypeName',
      class: 'jobRedirect',
      visible: !this.isCustomerLoggedIn
    },
    {
      title: 'Application#',
      data: 'jobApplicationNumber',
      class: 'jobRedirect',
    },
    {
      title: 'Work Type | Permit Type',
      data: 'jobWorkTypeDescription',
      render: function (data: any, type: any, dataToSet: any) {
        let permit = "";
        if (dataToSet.jobWorkTypeDescription) {
          permit = dataToSet.jobWorkTypeDescription;
        }
        if (dataToSet.permitType) {
          permit = dataToSet.permitType;
        }
        return permit;
      },
      class: 'jobRedirect',
    },
    {
      title: 'Permittee',
      data: 'permittee',
      class: 'jobRedirect',
      visible: !this.isCustomerLoggedIn
    },
    {
      title: 'Resp',
      data: 'responsibility',
      class: 'jobRedirect',
      visible: !this.isCustomerLoggedIn
    },
    {
      title: 'Issued',
      data: 'issued',
      class: 'jobRedirect'
    },
    {
      title: 'Expiration Date',
      data: 'expires',
      class: this.isCustomerLoggedIn ? 'text-left jobRedirect maxWidth-100' : 'jobRedirect'
    },
    {
      title: 'PGL',
      data: 'isPGL',
      class: 'jobRedirect',
      visible: !this.isCustomerLoggedIn,
      render: function (data: any, type: any, dataToSet: any) {
        if (data) {
          return "Yes"
        } else {
          return "No"
        }
      }
    },
    {
      title: 'L2',
      data: 'l2',
      class: 'jobRedirect',
      visible: !this.isCustomerLoggedIn,
      render: function (data: any, type: any, dataToSet: any) {
        if (data) {
          return "Yes"
        } else {
          return "No"
        }
      }
    }
    ];
  }

  getTcoColumns() {
    return [{
      title: 'Job#',
      data: 'jobNumber',
      render: function (data: any, type: any, dataToSet: any) {
        if (dataToSet.idJob) {
          return "<a class='taskfor jobRedirect' href='./job/" + dataToSet.idJob + "' rel='noreferrer' target='_blank'>" + dataToSet.jobNumber + " </a>";
        } else {
          return dataToSet.jobNumber
        }
      },
      class: 'min-auto'
    },
    {
      title: 'Job Address | Apt | Floor',
      data: 'jobAddress',
      render: function (data: any, type: any, dataToSet: any) {
        let fullAdd = "";
        if (dataToSet.jobAddress) {
          fullAdd = dataToSet.jobAddress;
        }
        if (dataToSet.apartment) {
          fullAdd += " | " + dataToSet.apartment;
        }
        if (dataToSet.floorNumber) {
          fullAdd += " | " + dataToSet.floorNumber;
        }
        return fullAdd;
      },
      class: 'min-auto'
    },
    {
      title: 'Special Place',
      data: 'specialPlace',
      class: 'min-auto'
    },
    {
      title: 'App Type',
      data: 'jobApplicationTypeName',
      class: 'min-auto',
    },
    {
      title: 'Application#',
      data: 'jobApplicationNumber',
      class: 'min-auto'
    },
    {
      title: 'Construction s/o',
      data: 'constructionSignedOff',
      class: 'min-auto'
    },
    {
      title: 'Temp Elevator',
      data: 'tempElevator',
      class: 'min-auto'
    },
    {
      title: 'Final Elevator',
      data: 'finalElevator',
      class: 'min-auto'
    },
    {
      title: 'Plumbing s/o',
      data: 'plumbingSignedOff',
      class: 'min-auto'
    },
    {
      title: 'TCO Expiration',
      data: 'expires',
      class: 'min-auto'
    },
    ]
  }

  getDotColumns() {
    return [
      {
        title: 'Job#',
        data: 'jobNumber',
        render: function (data: any, type: any, dataToSet: any) {
          if (dataToSet.idJob) {
            return "<a class='taskfor jobRedirect' href='./job/" + dataToSet.idJob + "' rel='noreferrer' target='_blank'>" + dataToSet.jobNumber + " </a>";
          } else {
            return dataToSet.jobNumber
          }
        },
        class: 'min-auto'
      },
      {
        title: 'Job Address | Apt | Floor',
        data: 'jobAddress',
        render: function (data: any, type: any, dataToSet: any) {
          let fullAdd = "";
          if (dataToSet.jobAddress) {
            fullAdd = dataToSet.jobAddress;
          }
          if (dataToSet.apartment) {
            fullAdd += " | " + dataToSet.apartment;
          }
          if (dataToSet.floorNumber) {
            fullAdd += " | " + dataToSet.floorNumber;
          }
          return fullAdd;
        },
        class: 'min-auto'
      },
      {
        title: 'Special Place',
        data: 'specialPlace',
        class: 'min-auto'
      },
      {
        title: "Street On | From | To",
        data: 'JobApplicationStreetWorkingOn',
        class: 'min-auto',
        render: function (data: any, type: any, dataToSet: any) {
          let combineSteet = '';
          if (dataToSet.jobApplicationStreetWorkingOn) {
            combineSteet += dataToSet.jobApplicationStreetWorkingOn;
          } else {
            combineSteet += "-";
          }
          if (dataToSet.jobApplicationStreetFrom) {
            combineSteet += " | " + dataToSet.jobApplicationStreetFrom;
          } else {
            combineSteet += " | -";
          }
          if (dataToSet.jobApplicationStreetTo) {
            combineSteet += ' | ' + dataToSet.jobApplicationStreetTo;
          } else {
            combineSteet += " | -";
          }
          return combineSteet.replace(/^ \| | \|$/g, '');
        }
      },
      {
        title: 'Permit#',
        data: 'permitNumber',
        class: 'min-auto'
      },
      {
        title: 'Work Type | Permit Type',
        data: 'jobWorkTypeDescription',
        render: function (data: any, type: any, dataToSet: any) {
          let permit = "";
          if (dataToSet.jobWorkTypeDescription) {
            permit = dataToSet.jobWorkTypeDescription;
          }
          if (dataToSet.permitType) {
            permit = dataToSet.permitType;
          }
          if (dataToSet.equipmentType) {
            permit += " - " + dataToSet.equipmentType
          }
          return permit;
        },
        class: 'min-auto',
      },
      {
        title: 'Issued',
        data: 'issued',
        class: 'min-auto'
      },
      {
        title: 'Filed on',
        data: 'filed',
        class: 'min-auto'
      },
      {
        title: 'Expiry',
        data: 'expires',
        class: 'min-auto'
      },
      {
        title: 'Renewal Fee',
        data: 'renewalFee',
        class: 'min-auto',
      },
      {
        title: 'Company',
        data: 'company',
        class: 'min-auto',
      },
    ]

  }

  /**
  * For the DEP Columns
  */
  getDepColumns() {
    return [{
      title: 'Job#',
      data: 'jobNumber',
      render: function (data: any, type: any, dataToSet: any) {
        if (dataToSet.idJob) {
          return "<a class='taskfor jobRedirect' href='javascript:void(0)' rel='noreferrer' >" + dataToSet.jobNumber + " </a>";
        } else {
          return dataToSet.jobNumber
        }
      },
      class: 'min-auto'
    },
    {
      title: 'Job Address | Apt | Floor',
      data: 'jobAddress',
      render: function (data: any, type: any, dataToSet: any) {
        let fullAdd = "";
        if (dataToSet.jobAddress) {
          fullAdd = dataToSet.jobAddress;
        }
        if (dataToSet.apartment) {
          fullAdd += " | " + dataToSet.apartment;
        }
        if (dataToSet.floorNumber) {
          fullAdd += " | " + dataToSet.floorNumber;
        }
        return fullAdd;
      },
      class: 'min-auto'
    },
    {
      title: 'Special Place',
      data: 'specialPlace',
      class: 'min-auto'
    },
    {
      title: 'App Type',
      data: 'jobApplicationTypeName',
      class: 'min-auto',
    },
    {
      title: 'On | From | To',
      data: 'jobApplicationNumber',
      class: 'min-auto',
      render: function (data: any, type: any, dataToSet: any) {
        let s = ' | '
        let arr = [dataToSet.jobApplicationStreetWorkingOn, dataToSet.jobApplicationStreetFrom, dataToSet.jobApplicationStreetTo]
        return arr.filter((i: any) => { return !!i }).join(s)
      },
    },
    {
      title: 'Work Type | Permit Type',
      data: 'jobWorkTypeDescription',
      render: function (data: any, type: any, dataToSet: any) {
        let permit = "";
        if (dataToSet.jobWorkTypeDescription) {
          permit = dataToSet.jobWorkTypeDescription;
        }
        if (dataToSet.permitType) {
          permit = dataToSet.permitType;
        }
        return permit;
      },
      class: 'min-auto',
    },
    {
      title: 'Permit#',
      data: 'permitNumber',
      class: 'min-auto',
    },
    {
      title: 'Resp',
      data: 'personalResponsible',
      class: 'min-auto',
    },
    {
      title: 'Issued',
      data: 'issued',
      class: 'min-auto'
    },
    {
      title: 'Expiry',
      data: 'expires',
      class: 'min-auto'
    },
    {
      title: 'PGL',
      data: 'isPGL',
      class: 'min-auto',
      render: function (data: any, type: any, dataToSet: any) {
        if (data) {
          return "Yes"
        } else {
          return "No"
        }
      }
    },
    {
      title: 'L2',
      data: 'l2',
      class: 'min-auto',
      render: function (data: any, type: any, dataToSet: any) {
        if (data) {
          return "Yes"
        } else {
          return "No"
        }
      }
    }
    ];

  }

  getAhvColumns() {

  }


  /**
   * This method load datatable
   * @method loadDataTable 
   */
  loadDataTable() {
    document.title = 'Permit Expiry Report'

    if (!this.filter.permitCode) {
      this.filter.permitCode = "DOB";
    }
    if (!this.filter.status) {
      this.filter.status = "1";
    }
    if (!this.filter.expiresFromDate) {
      this.filter.expiresFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.expiresToDate) {
      this.filter.expiresToDate = moment(new Date()).add(14, 'days').format("MM/DD/YYYY");
    }
    this.filter.idJobType = "null"

    if (this.filter.permitCode == 'DOB') {
      this.columnDefs = [
        {
          type: 'date-uk', targets: [8, 9]
        }
      ]
      this.columns = this.getDobColumns()
    } else if (this.filter.permitCode == 'TCO') {
      this.columnDefs = []
      this.columns = this.getTcoColumns()
    } else if (this.filter.permitCode == 'AHV') {
      this.columnDefs = [
        { type: 'date-uk', targets: [8, 9] }, //specify your date column number,starting from 0        
      ],
        this.columns = this.getDobColumns()
    } if (this.filter.permitCode == 'DOT') {
      this.columnDefs = [
        { type: 'date-uk', targets: [6, 7, 8] }, //specify your date column number,starting from 0        
      ],
        this.columns = this.getDotColumns()
    } if (this.filter.permitCode == 'DEP') {
      this.columnDefs = [
        { type: 'date-uk', targets: [9] }, //specify your date column number,starting from 0        
      ],
        this.columns = this.getDepColumns()
    }

    var vm = this;
    vm.table = $('#dt-dob-permit-report').DataTable({
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
      "aaSorting": [[0, 'asc'], [9, 'asc']],
      //  "order": [[0, "desc"]],
      // "beDestroy":true,
      // ajax: this.reportServices.dobPermitExpiryReport({
      //   onData: (data: any) => {
      //     assign(data, pickBy(this.filter, identity))
      //   }
      // }),
      ajax: this.isCustomerLoggedIn ? this.reportServices.dobCustomerPermitExpiryReport({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }) : this.reportServices.dobPermitExpiryReport({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columnDefs: vm.columnDefs,
      columns: vm.columns,
      drawCallback: function (settings: any) {
        vm.sortBy = settings.aoColumns[settings.aaSorting[0][0]].mData || ''
        vm.sortOrder = settings.aaSorting[0][1];
        vm.searchParam = settings.oPreviousSearch.sSearch || ''
        vm.disableExport = settings.aiDisplay.length == undefined || settings.aiDisplay.length == 0
        var api = this.api();
        var rows = api.rows({ page: 'current' }).data()
        rows.each((data: any) => {
        })
      },
      rowCallback: ((row: any, data: any, index: any) => {
      }),
      initComplete: () => {
        vm.loading = true;
        $('.jobRedirect').on('click', function (ev: any) {
          localStorage.setItem('isFromTask', 'true')
        })
      }
    });
    $('#dt-dob-permit-report tbody').on('click', 'td.clickable', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      if ($(this).hasClass('clickable')) {

      }
    });
    $('#dt-dob-permit-report tbody').on('mousedown', 'td.jobRedirect', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      ev = ev || window.event;
      switch (ev.which) {
        case 1: vm.onOpenJobDetail(data);
          ; break;
        case 2: '';
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
            if (jobtypeId != '') {
              let url = './job/' + data.idJob + '/' + jobtype + ';' + 'idJobAppType=' + jobtypeId;
              $(this).attr('href', url)
            } else {
              let url = './job/' + data.idJob + '/' + jobtype;
              $(this).attr('href', url)
            };
          }
          break;
      }
    });
    // To reset the sorted columns to default
    $.fn.dataTableExt.oApi.fnSortNeutral = function (oSettings: any) {
      /* Remove any current sorting */
      oSettings.aaSorting = [];
      /* Redraw */
      oSettings.oApi._fnReDraw(oSettings);
    };
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
   * This method will call when job detail page open
   * @method onOpenJobDetail
   * @param {any} data JobData 
   */
  private onOpenJobDetail(data: any) {
    //this call is used to set data in shared service
    this.appComponent.setCommonJobObject(data.idJob);
  }

  /**
    * This method resets the datatable sorting columns
    * @method clearSort
    */
  clearSort() {
    this.filter = {}
    if (!this.filter.permitCode) {
      this.filter.permitCode = "DOB";
    }
    if (!this.filter.status) {
      this.filter.status = "1";
    }
    if (!this.filter.expiresFromDate) {
      this.filter.expiresFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.expiresToDate) {
      this.filter.expiresToDate = moment(new Date()).add(14, 'days').format("MM/DD/YYYY");
    }
    this.filter.idJobType = "null"

    if (this.filter.permitCode == 'DOB') {
      this.columns = this.getDobColumns()
    } else if (this.filter.permitCode == 'TCO') {
      this.columns = this.getTcoColumns()
    } else if (this.filter.permitCode == 'AHV') {
      this.columns = this.getDobColumns()
    } if (this.filter.permitCode == 'DOT') {
      this.columns = this.getDotColumns()
    } if (this.filter.permitCode == 'DEP') {
      this.columns = this.getDobColumns()
    }
    this.table.clearPipeline()
    this.table.ajax.reload();
    this.table.order([[0, 'asc'], [9, 'asc']]);
  }

  /**
   * This method reloads datatable after advance search
   * @method reloadAdvanceSearch
   * @param {any} filter Search Criteria 
   */
  reloadAdvanceSearch(filter: any) {
    this.filter = []
    this.filter = filter
    $('#dt-dob-permit-report').DataTable().destroy()
    $('#dt-dob-permit-report').empty()
    this.table.order([[0, 'asc'], [9, 'asc']]);
    this.loadDataTable()
    this.cdRef.detectChanges()
  }


  /**
   * This method search in job datatable
   * @method searchJob
   * @param {string} srch Search Criteria 
   */
  searchJob(srch: string) {
    this.table.search(srch).draw()
  }

  /**
   * This method reload datatable
   * @method reload
   */
  reload() {
    this.table.clearPipeline()
    this.table.ajax.reload()
  }

  /**
   * This method is clear search
   * @method clearsearch
   */
  private clearsearch() {
    this.filter = {};
    this.table.clearPipeline()
    this.table.ajax.reload()
  }

  /**
   * This method will open popup for advance search
   * @method _openModalAdvanceSearch
   * @param {any} template TemplateRef Object
   * @param {number} id ID of Job
   * @param {boolean} isNew Identify Job is create or edit
   */
  private _openModalAdvanceSearch(template: TemplateRef<any>) {
    this.modalRefAdvanceSearch = this.modalService.show(template, { class: 'dob-modal-advance-search' })
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
   * This method will convert given string into title case
   * @method toTitleCase
   * @param {string} str request string 
   */
  private toTitleCase(str: string) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
  }

  /**
   * This method export report
   * @method exportClick
   * @param {string} type 
   */
  exportClick(type: string) {
    this.filterForDownload = Object.assign({}, this.filter); // convert filter array to object 
    this.filterForDownload["orderedColumn"] = { "column": this.sortBy, "dir": this.sortOrder };
    this.loading = true;
    this.reportServices.downloadPermitExpiryReport(this.filterForDownload, type).subscribe(r => {
      this.loading = false;
      this.reportDocument = { name: r.reportName, path: r.filepath, displayPath: r.newPath };
      if (!(type == 'xlsEmail' || type == 'pdfEmail'))
        window.open(r[0].value, "_blank");
      else {
        this.modalRefJobSelect = this.modalService.show(this.jobSelect, { class: 'modal-md', backdrop: 'static', 'keyboard': false })
      }

    })
  }

  /**
 * This method will open Job popup to select existing job 
 * @method selectJobModal
 * @param {TemplateRef} template request object
 */
  private selectJobModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-add-related-job', backdrop: 'static', 'keyboard': false })
  }

  /**
     * This method get all information on selection of existing job
     * @method receiveJobId
     * @param {job} jobObj response object 
     */
  receiveJobId(jobObj: any) {
    this.jobObj = jobObj;
    this.idJob = jobObj.id;
    if (jobObj) {
      this.openCreateTransmittalModal(this.addtransmittal, "", jobObj.id);
    }

  }
  /**
 * This method is used open add transmittal popup
 * @method openCreateTransmittalModal
 * @param {any} template TemplateRef 
 * @param {string} action Identify Action 
 * @param {number} id ID of Job 
 */
  openCreateTransmittalModal(template: TemplateRef<any>, action?: string, id?: number) {
    this.loading = false;
    this.modalRef = this.modalService.show(template, { class: 'modal-add-transmittal', backdrop: 'static', 'keyboard': false })
  }
}