import { Component, ElementRef, NgZone, TemplateRef, ViewChild, OnInit, Input, Inject } from '@angular/core';
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
import { JobServices } from '../../job/job.services';
import { LocalStorageService } from '../../../services/local-storage.service';
import { API_URL } from '../../../app.constants';


declare const $: any

/**
 * This component contains all function that are used in JobComponent
 * @class AllViolationReportComponent
 */
@Component({
  templateUrl: './allViolationReport.component.html',
  styleUrls: ['./allViolationReport.component.scss']
})
export class AllViolationReportComponent implements OnInit {


  private table: any
  private modalRef: BsModalRef
  modalRefAdvanceSearch: BsModalRef
  modalRefJobSelect: BsModalRef
  filter: any = {}
  private filterForDownload: any = {}
  private userAccessRight: any = {}
  showExportBtn: string = 'hide';
	showJobViolation: string = 'hide';
	showDOBJobViolation: string = 'hide';
	showDOBSafetyJobViolation: string = 'hide';

  /**
   * reportAdvanceSearch Form
   * @property reportAdvanceSearch
   */
  @ViewChild('reportAdvanceSearch', {static: true})
  private reportAdvanceSearch: TemplateRef<any>

  /**
   * Add transmittal form
   * @property addtransmittal
   */
  @ViewChild('addtransmittal', {static: true})
  private addtransmittal: TemplateRef<any>

  @ViewChild('jobSelect', {static: true})
  private jobSelect: TemplateRef<any>


  private sortBy: string = '';
  private searchParam = '';
  private sortOrder = '';
  jobList: any[] = [];
  selectedJobId: any;
  jobDetail: any;
  reportDocument: any;
  loading: boolean = false;
  disableExport: boolean;
	public violationType: string = '';
	// public violationType: string = 'DOB Violation';
  public violationOptions: any[] = [
		// { id: 'AOTH Violation', label: 'ECB/OATH Violations' },
		// { id: 'DOB Violation', label: 'DOB Violations' },
		// { id: 'DOB Safety Violation', label: 'DOB Safety Violations' }
  ];
  aothColumns = [];
  dobColumns = [];
	dobSafetyColumns = [];

  isCustomerLoggedIn: boolean = false;
  dateTarget = [];
  srch: string;


  /**
   * This method define all services that requires in whole class
   * @method constructor
   */
  constructor(
    private router: Router,
    private reportServices: ReportServices,
    private modalService: BsModalService,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private route: ActivatedRoute,
    private appComponent: AppComponent,
    private jobServices: JobServices,
    private localStorageService: LocalStorageService
  ) {
		this.showJobViolation = this.userRight.checkAllowButton(this.constantValues.VIEWECBVIOLATION)
		this.showDOBJobViolation = this.userRight.checkAllowButton(this.constantValues.VIEWDOBVIOLATION)
		this.showDOBSafetyJobViolation = this.userRight.checkAllowButton(this.constantValues.VIEWDOBSAFETYVIOLATION)
		
		if (this.showDOBJobViolation != 'hide') {
			// this.violationOptions.splice(1, 1)
			this.violationOptions.push({ id: 'DOB Violation', label: 'DOB Violations' })
			this.violationType = 'DOB Violation'
		}
		
		if (this.showJobViolation != 'hide') {
			// this.violationOptions.splice(0, 1)
			this.violationOptions.push({ id: 'AOTH Violation', label: 'ECB/OATH Violations' })
			if(!this.violationType) {
				this.violationType = 'AOTH Violation'
			}
		}

		if (this.showDOBSafetyJobViolation != 'hide') {
			// this.violationOptions.splice(2, 1)
			this.violationOptions.push({ id: 'DOB Safety Violation', label: 'DOB Safety Violations' })
			if(!this.violationType) {
				this.violationType = 'DOB Safety Violation'
			}
		}
		console.log('violationType',this.violationType)
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.showExportBtn = this.userRight.checkAllowButton(this.constantValues.EXPORTREPORT);
    // this.isCustomerLoggedIn = this.localStorageService.getCustomerLoggedIn();
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
    this.filter = []
    this.loadDataTable(false)
  }

  /**
   * This method load datatable
   * @method loadDataTable
   */
  loadDataTable(callApi: boolean = false) {
    document.title = 'All Violations Report'
    this.initializeData()
    var vm = this;
    if (!this.filter.isFullyResolved) {
      this.filter.isFullyResolved = 'false'
    }
    this.filter.Type_ECB_DOB = null
		this.filter.Type_ECB_DOB = this.violationType === 'AOTH Violation' ? "ECB" : this.violationType === 'DOB Violation' ? 'DOB' : 'Safety'
    vm.table = $('#dt-all-violation-report').DataTable({
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
        infoFiltered: "",
      },
      "oLanguage": {
        "sEmptyTable": !callApi ? "To generate the violation report, kindly utilize the advanced search feature." : "No data available in table"
      },
      // "aaSorting": [[9, 'asc']],
      ajax: this.isCustomerLoggedIn ? this.reportServices.allCustomerViolationReport({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }) : callApi ? this.reportServices.allViolationReport({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }) : '',
      // ajax: callApi ? this.reportServices.allViolationReport({
      // 	onData: (data: any) => {
      // 		assign(data, pickBy(this.filter, identity))
      // 	}
      // }) : '',

      // columnDefs: [
      // 	{ type: 'date-uk', targets: vm.setDateTarget() }, //specify your date column number,starting from 0
      // ],
			// columns: this.violationType === 'AOTH Violation' ? this.aothColumns : this.dobColumns,
			columns: this.violationType === 'AOTH Violation' ? this.aothColumns : this.violationType === 'DOB Violation' ? this.dobColumns : this.dobSafetyColumns,
      drawCallback: (setting: any) => {
        vm.sortBy = setting.aoColumns[setting.aaSorting[0][0]].mData || ''
        vm.sortOrder = setting.aaSorting[0][1];
        vm.searchParam = setting.oPreviousSearch.sSearch || ''
        vm.disableExport = setting.aiDisplay.length == undefined || setting.aiDisplay.length == 0
      },
      rowCallback: ((row: any, data: any, index: any) => {

      }),
      initComplete: () => {
        $('.jobRedirect').on('click', function (ev: any) {
          localStorage.setItem('isFromTask', 'true')
        })
      }
    });
    $('#dt-all-violation-report tbody').on('click', 'td.clickable', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      if ($(this).hasClass('clickable')) {
        console.log('ev.target', ev)
        event.preventDefault();
        if (ev.target && ev.target.href && ev.target.tagName == 'A') {
          console.log('run inside')
          ev.preventDefault();
          const redirectionURL = ev.target.href
          const modifiedUrl = redirectionURL.replace(/.*\/job/, '/job');
          console.log('modifiedUrl', modifiedUrl);
          vm.router.navigateByUrl(modifiedUrl)
          return
        } else {
          console.log("else")
          ev.preventDefault();
          return
        }
      }
    });
    $('#dt-all-violation-report tbody').on('mousedown', 'a.violationRedirect', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      ev = ev || window.event;
      switch (ev.which) {
        case 1:
          localStorage.setItem('isFromViolationReport', 'true')
          vm.onOpenJobDetail(data);
          ;
          break;
        case 2:
          '';
          break;
        case 3:
          localStorage.setItem('isFromViolationReport', 'true')
          $(this).attr('href', './job/' + data.idJob + '/' + 'violation')
          ;
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
    this.router.navigate(['./job/' + data.idJob + '/violation'])
  }

  /**
   * This method reloads datatable after advance search
   * @method reloadAdvanceSearch
   * @param {any} filter Search Criteria
   */
  reloadAdvanceSearch(filter: any) {
    console.log('reloadAdvanceSearch', filter)
    this.filter = []
    this.filter = filter
    this.table.destroy();
    $('#dt-all-violation-report').empty();
    this.table.clear()
    this.table.clearPipeline()
    // this.table.ajax.reload()
    this.table.order([[9, 'asc']]);
    this.loadDataTable(true)
  }

  clearSearchEvent(filter: any) {
    console.log('reloadAdvanceSearch', filter)
    this.filter = []
    this.filter = filter
    this.table.destroy();
    $('#dt-all-violation-report').empty();
    this.table.clear()
    this.table.clearPipeline()
    // this.table.ajax.reload()
    this.table.order([[9, 'asc']]);
    this.loadDataTable(false)
  }

  /**
   * This method resets the datatable sorting columns
   * @method clearSort
   */
  clearSort() {
    this.filter = {}
    if (!this.filter?.isFullyResolved) {
      this.filter.isFullyResolved = 'false'
    }
    this.filter.Type_ECB_DOB = null
		this.violationType = 'DOB Violation'
		// this.violationType = 'AOTH Violation'
		this.filter.Type_ECB_DOB = this.violationType === 'AOTH Violation' ? "ECB" : this.violationType === 'DOB Violation' ? 'DOB' : 'Safety'
		let aaSorting = this.isCustomerLoggedIn ? [[6, 'asc']] : [[9, 'asc']]
    this.table.clearPipeline()
    this.table.ajax.reload();
    this.table.order(aaSorting);
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
    this.modalRefAdvanceSearch = this.modalService.show(template, {class: 'modal-advance-search'})
  }

  /**
   * This method will open popup for advance search
   * @method openModalAdvanceSearch
   * @param {any} template TemplateRef Object
   * @param {number} id?? ID of Job
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
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  /**
   * This method export report
   * @method exportClick
   * @param {string} type
   */
  exportClick(type: string) {
    this.filterForDownload = Object.assign({}, this.filter); // convert filter array to object
    this.filterForDownload["orderedColumn"] = {"column": this.sortBy, "dir": this.sortOrder};
    this.loading = true;
		console.log('filterForDownload', this.filterForDownload)
		console.log('type', type)
    this.reportServices.downloadViolationReport(this.filterForDownload, type).subscribe(r => {
      this.loading = false;
      this.reportDocument = {name: r.reportName, path: r.filepath, displayPath: r.newPath};
      if (!(type == 'xlsEmail' || type == 'pdfEmail'))
        window.open(r[0].value, "_blank");
      else {
        this.selectedJobId = undefined;
        this.modalRefJobSelect = this.modalService.show(this.jobSelect, {
          class: 'modal-md',
          backdrop: 'static',
          'keyboard': false
        })
      }
    })
  }

  /**
   * This method is used open add transmittal popup
   * @method openCreateTransmittalModal
   * @param {any} template TemplateRef
   * @param {string} action Identify Action
   * @param {number} id ID of Job
   */
  openCreateTransmittalModal(jobId?: number) {
    this.modalRefJobSelect.hide();
    this.loading = true;
    if (this.isCustomerLoggedIn) {
      this.jobServices.getCustomerJobDetailById(jobId).subscribe(res => {
        this.loading = false;
        this.jobDetail = res
        this.modalRef = this.modalService.show(this.addtransmittal, {
          class: 'modal-add-transmittal',
          backdrop: 'static',
          'keyboard': true
        })
      }, error => {
        this.loading = false;
      })
    } else {
      this.jobServices.getJobById(jobId).subscribe(res => {
        this.loading = false;
        this.jobDetail = res
        this.modalRef = this.modalService.show(this.addtransmittal, {
          class: 'modal-add-transmittal',
          backdrop: 'static',
          'keyboard': true
        })
      }, error => {
        this.loading = false;
      })
    }
  }

  onSelectViolationType() {
    this.table.destroy();
    $('#dt-all-violation-report').empty();
    this.loadDataTable()
  }

  initializeData() {
    var vm = this;
    // this.aothColumns = [
    // 	{
    // 		title: 'Project#',
    // 		data: 'jobNumbers',
    // 		class: '',
    // 		render: function (data: any, type: any, dataToSet: any) {
    // 			// return `<div innerHTML="${data}"></div>`
    // 			if (dataToSet.idJob) {
    // 				return "<a class='taskfor violationRedirect' href='javascript:void(0)' rel='noreferrer'>" + dataToSet.jobNumbers + "</a>";
    // 				// return "<a class='taskfor violationRedirect' href='./job/" + dataToSet.idJob + "' rel='noreferrer' target='_blank'>" + dataToSet.jobNumber + "</a>"
    // 			} else {
    // 				return ""
    // 			}
    // 		}
    // 	},
    // 	{
    // 		title: 'Project Name',
    // 		data: "jobNames",
    // 		visible: this.isCustomerLoggedIn,
    // 	},
    // 	{
    // 		title: 'Project Address',
    // 		data: 'address',
    // 	},
    // 	{
    // 		title: 'Violation#',
    // 		data: 'summonsNumber',
    // 		class: '',
    // 		render: function (data: any, type: any, dataToSet: any) {
    // 			// if (dataToSet?.idJob) {
    // 			return "<a class='taskfor violationRedirect' href='javascript:void(0)' rel='noreferrer' target='_blank'>" + data + "</a>";
    // 			// return "<a class='taskfor violationRedirect' href='./job/" + dataToSet.idJob + "' rel='noreferrer' target='_blank'>" + dataToSet.summonsNumber + "</a>";
    // 			// } else {
    // 			// return ""
    // 			// }
    // 		}
    // 	},
    // 	{
    // 		title: 'Violation Description',
    // 		data: 'description',
    // 		class: '',
    // 		visible: this.isCustomerLoggedIn,
    // 	},
    // 	{
    // 		title: 'Issue Date',
    // 		data: 'dateIssued',
    // 		class: ''
    // 	},
    // 	{
    // 		title: 'Inspection Location',
    // 		data: 'inspectionLocation',
    // 		// width: 222,
    // 		class: '',
    // 		visible: !this.isCustomerLoggedIn
    // 	},
    // 	{
    // 		title: 'Issuing Agency',
    // 		data: 'issuingAgency',
    // 		class: 'text-left',
    // 		// width: 170,
    // 		render: function (data: any, type: any, dataToSet: any) {
    // 			if (data) {
    // 				return vm.toTitleCase(data)
    // 			} else {
    // 				return ''
    // 			}
    // 		}
    // 	},
    // 	{
    // 		title: 'Infraction Code',
    // 		data: 'infractionCode',
    // 		class: '',
    // 		visible: !this.isCustomerLoggedIn
    // 	},
    // 	{
    // 		title: 'Code Section',
    // 		data: 'codeSection',
    // 		class: '',
    // 		visible: !this.isCustomerLoggedIn
    // 	},
    // 	{
    // 		title: 'Cure Date',
    // 		data: 'cureDate',
    // 		class: '',
    // 		visible: !this.isCustomerLoggedIn
    // 	},
    // 	{
    // 		title: 'Hearing Date',
    // 		data: 'hearingDate',
    // 		class: '',
    // 		visible: !this.isCustomerLoggedIn
    // 	},
    // 	{
    // 		title: 'Hearing Result',
    // 		data: 'hearingResult',
    // 		visible: !this.isCustomerLoggedIn,
    // 		class: '',
    // 		render: function (data: any, type: any, dataToSet: any) {
    // 			if (data) {
    // 				return vm.toTitleCase(data)
    // 			} else {
    // 				return ''
    // 			}
    // 		}
    // 	},
    // 	{
    // 		title: 'Balance Due',
    // 		data: 'balanceDue',
    // 		visible: !this.isCustomerLoggedIn,
    // 		class: ''
    // 	},
    // 	{
    // 		title: 'Status',
    // 		data: 'statusOfSummonsNotice',
    // 		visible: !this.isCustomerLoggedIn,
    // 		class: '',
    // 		render: function (data: any, type: any, dataToSet: any) {
    // 			if (data) {
    // 				return vm.toTitleCase(data)
    // 			} else {
    // 				return ''
    // 			}
    // 		}
    // 	},
    // 	{
    // 		title: 'Certification Status',
    // 		data: 'certificationStatus',
    // 		visible: !this.isCustomerLoggedIn,
    // 		class: ''
    // 	}
    // ];
    if (this.violationType === 'AOTH Violation') {
      this.aothColumns = [
        {
          title: 'Project#',
          data: 'jobNumbers',
          class: 'clickable',
          width: 100,
          render: function (data: any, type: any, dataToSet: any) {
            // return `<div innerHTML="${data}"></div>`
            // if (dataToSet.idJob) {
            return "<a class='taskfor violationRedirect' href='javascript:void(0)' rel='noreferrer'>" + dataToSet.jobNumbers + "</a>";
            // 	// return "<a class='taskfor violationRedirect' href='./job/" + dataToSet.idJob + "' rel='noreferrer' target='_blank'>" + dataToSet.jobNumber + "</a>"
            // } else {
            // 	return ""
            // }
          }
        },
        {
          title: 'Project Name',
          data: "jobNames",
          visible: this.isCustomerLoggedIn,
          render: function (data: any, type: any, dataToSet: any) {
            if (data == "null") {
              return ""
            } else {
              return data
            }
          }
        },
        {
          title: 'Project Address',
          data: 'address',
          class: 'minWidth-150'
        },
        {
          title: 'Violation#',
          data: 'summonsNumber',
          class: '',
          width: 100
        },
        {
          title: 'Issue Date',
          data: 'dateIssued',
          class: '',
          width: 114
        },
        {
          title: 'Issuing Agency',
          data: 'issuingAgency',
          class: 'text-left',
          width: 160,
          render: function (data: any, type: any, dataToSet: any) {
            if (data) {
              return vm.toTitleCase(data)
            } else {
              return ''
            }
          }
        },
        {
          title: 'Violation Description',
          data: 'violationDescription',
          class: this.isCustomerLoggedIn ? 'text-left maxWidth-100' : 'text-left',
          visible: this.isCustomerLoggedIn,
        },
        {
          title: 'Inspection Location',
          data: 'inspectionLocation',
          // width: 222,
          class: '',
          visible: !this.isCustomerLoggedIn
        },

        {
          title: 'Infraction Code',
          data: 'infractionCode',
          class: '',
          visible: !this.isCustomerLoggedIn
        },
        {
          title: 'Code Section',
          data: 'codeSection',
          class: '',
          visible: !this.isCustomerLoggedIn
        },
        {
          title: 'Cure Date',
          data: 'cureDate',
          class: '',
          visible: !this.isCustomerLoggedIn
        },
        {
          title: 'Hearing Date',
          data: 'hearingDate',
          class: '',
          width: 90,
          visible: !this.isCustomerLoggedIn
        },
        {
          title: 'Hearing Result',
          data: 'hearingResult',
          visible: !this.isCustomerLoggedIn,
          class: '',
          render: function (data: any, type: any, dataToSet: any) {
            if (data) {
              return vm.toTitleCase(data)
            } else {
              return ''
            }
          }
        },
        {
          title: 'Balance Due',
          data: 'balanceDue',
          visible: !this.isCustomerLoggedIn,
          class: ''
        },
        {
          title: 'Status',
          data: 'statusOfSummonsNotice',
          visible: !this.isCustomerLoggedIn,
          class: '',
          render: function (data: any, type: any, dataToSet: any) {
            if (data) {
              return vm.toTitleCase(data)
            } else {
              return ''
            }
          }
        },
        {
          title: 'Certification Status',
          data: 'certificationStatus',
          visible: !this.isCustomerLoggedIn,
          class: ''
        }
      ];
		} else if (this.violationType == 'DOB Violation') {
      this.dobColumns = [
        {
          title: 'Project #',
          data: 'jobNumbers',
          class: 'clickable maxWidth-85',
        },
        {
          title: 'Project Name',
          data: "jobNames",
          width: 146,
          render: function (data: any, type: any, dataToSet: any) {
            if (data == "null") {
              return ""
            } else {
              return data
            }
          },
          visible: this.isCustomerLoggedIn,
        },
        {
          title: 'Project Address',
          data: 'address',
        },
        {
          title: 'Issued Date',
          data: 'dateIssued',
          class: 'maxWidth-85'
        },
        {
          title: 'DOB Violation #',
          data: 'summonsNumber',
				},
        {
          title: 'ECB violation #',
          data: 'relatedECB',
        },
        {
          title: 'Violation Description',
          data: 'violationDescription',
        },
        {
          title: 'Violation Category',
          data: 'violationCategory',
          class: 'text-left maxWidth-400',
        },
      ];
      // this.dobColumns = [
      // 	{
      // 		title: 'Project#',
      // 		data: 'jobNumbers',
      // 		class: 'clickable maxWidth-85',
      // 	},
      // 	{
      // 		title: 'Project Address',
      // 		data: 'address',
      // 	},
      // 	{
      // 		title: 'Issue Date',
      // 		data: 'dateIssued',
      // 		class: 'maxWidth-85'
      // 	},
      // 	{
      // 		title: 'Violation#',
      // 		data: 'summonsNumber',
      // 		class: '',
      // 	},
      // 	{
      // 		title: 'Inspection Location',
      // 		data: 'inspectionLocation',
      // 		class: '',
      // 	},
      // 	{
      // 		title: 'Issuing Agency',
      // 		data: 'issuingAgency',
      // 		class: 'text-left',
      // 		render: function (data: any, type: any, dataToSet: any) {
      // 			if (data) {
      // 				return vm.toTitleCase(data)
      // 			} else {
      // 				return ''
      // 			}
      // 		}
      // 	},
      // 	{
      // 		title: 'Infraction Code',
      // 		data: 'infractionCode',
      // 		class: '',
      // 	},
      // 	{
      // 		title: 'Code Section',
      // 		data: 'codeSection',
      // 		class: '',
      // 	},
      // 	{
      // 		title: 'Cure Date',
      // 		data: 'cureDate',
      // 		class: '',
      // 	},
      // 	{
      // 		title: 'Hearing Date',
      // 		data: 'hearingDate',
      // 		class: '',
      // 	},
      // 	{
      // 		title: 'Hearing Result',
      // 		data: 'hearingResult',
      // 		class: '',
      // 		render: function (data: any, type: any, dataToSet: any) {
      // 			if (data) {
      // 				return vm.toTitleCase(data)
      // 			} else {
      // 				return ''
      // 			}
      // 		}
      // 	},
      // 	{
      // 		title: 'Balance Due',
      // 		data: 'balanceDue',
      // 		class: ''
      // 	},
      // 	{
      // 		title: 'Status',
      // 		data: 'statusOfSummonsNotice',
      // 		class: '',
      // 		render: function (data: any, type: any, dataToSet: any) {
      // 			if (data) {
      // 				return vm.toTitleCase(data)
      // 			} else {
      // 				return ''
      // 			}
      // 		}
      // 	},
      // 	{
      // 		title: 'Certification Status',
      // 		data: 'certificationStatus',
      // 		class: ''
      // 	}
      // ];
		} else if (this.violationType == 'DOB Safety Violation') {
			this.dobSafetyColumns = [
				{
					title: 'Project #',
					data: 'jobNumbers',
					class: 'clickable maxWidth-85',
					// visible: this.isCustomerLoggedIn,
				},
				{
					title: 'Project Name',
					data: "jobNames",
					width: 146,
					render: function (data: any, type: any, dataToSet: any) {
						if (data == "null") {
							return ""
						} else {
							return data
						}
					},
					visible: this.isCustomerLoggedIn,
				},
				{
					title: 'Project Address',
					data: 'address',
				},
				{
					title: 'Issued Date',
					data: 'dateIssued',
					class: 'maxWidth-85'
				},
				{
					title: 'DOB Safety Violation #',
					data: 'summonsNumber',
				},
				{
					title: 'Violation Type',
					data: 'violationType',
				},
				{
					title: 'Violation Description',
					data: 'violationDescription',
				},
				{
					title: 'Device Type',
					data: 'deviceType',
				},
				{
					title: 'Device Number',
					data: 'deviceNumber',
				},
				{
					title: 'Violation Status',
					data: 'violationStatus',
					class: 'text-left',
				},
			];
    }
  }

  setDateTarget() {
    let target = []
    if (this.violationType === 'AOTH Violation') {
      if (this.isCustomerLoggedIn) {
        target = [4]
      } else {
        target = [4, 10, 11]
      }
    } else {
      if (this.isCustomerLoggedIn) {
        target = [3]
      } else {
        target = [3, 12, 13]
      }
    }
    return target
  }

}