import {
  Component,
  ElementRef,
  NgZone,
  TemplateRef,
  ViewChild,
  OnInit,
  Input,
  Inject,
  ChangeDetectorRef
} from '@angular/core';
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

declare const $: any

/**
 * This component contains all function that are used in DobPermit Expiry Component
 * @class AllViolationReportComponent
 */
@Component({
  templateUrl: './closedJobOpenBillingPointReport.component.html',
  styleUrls: ['./closedJobOpenBillingPointReport.component.scss']
})
export class ClosedJobOpenBillingPointReportComponent implements OnInit {

  private table: any
  private modalRef: BsModalRef
  modalRefAdvanceSearch: BsModalRef
  filter: any = {}
  private userAccessRight: any = {}
  private filterForDownload: any = {}
  showExportBtn: string = 'hide'
  srch: string;
  /**
   * reportAdvanceSearch Form
   * @property reportAdvanceSearch
   */
  @ViewChild('closedJobReportAdvanceSearch', {static: true})
  private closedJobReportAdvanceSearch: TemplateRef<any>


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
    private userRight: UserRightServices
  ) {

  }


  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.showExportBtn = this.userRight.checkAllowButton(this.constantValues.EXPORTREPORT)
    this.filter = []
    this.loadDataTable()
  }

  /**
   * This method load datatable
   * @method loadDataTable
   */
  loadDataTable() {
    document.title = 'Closed Jobs with Open Billing Points Report'

    if (!this.filter.status) {
      this.filter.status = "3";
    }

    var vm = this;
    vm.table = $('#dt-closedjob-report').DataTable({
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
      "order": [[0, "desc"]],
      ajax: this.reportServices.closedJobReport({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columnDefs: [
        {type: 'date-uk', targets: [3, 4]}, //specify your date column number,starting from 0
      ],
      columns: [
        {
          title: 'Project#',
          data: 'jobNumber',
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.idJob) {
              return dataToSet.jobNumber;
            } else {
              return dataToSet.jobNumber
            }
          },
          class: 'min-auto jobRedirect'
        },
        {
          title: 'Project Address | Apt | Floor',
          data: 'address',
          render: function (data: any, type: any, dataToSet: any) {
            let fullAdd = "";
            if (dataToSet.address) {
              fullAdd = dataToSet.address;
            }
            if (dataToSet.apartment) {
              fullAdd += " | " + dataToSet.apartment;
            } else {
              fullAdd += " | - ";
            }
            if (dataToSet.floorNumber) {
              fullAdd += " | " + dataToSet.floorNumber;
            } else {
              fullAdd += " | - ";
            }
            return fullAdd;
          },
          class: 'min-auto jobRedirect'
        },
        {
          title: 'Special Place',
          data: 'specialPlaceName',
          class: 'jobRedirect'
        },
        {
          title: 'Start',
          data: 'startDate',
          class: 'min-auto jobRedirect'
        },
        {
          title: 'End',
          data: 'endDate',
          class: 'min-auto jobRedirect'
        },
        {
          title: 'Company',
          data: 'company',
          class: 'min-auto jobRedirect',
        },
        {
          title: 'Contact',
          data: 'contact',
          class: 'min-auto jobRedirect',
        },
      ],

      drawCallback: function (settings: any) {
      },
      rowCallback: ((row: any, data: any, index: any) => {

      }),
      initComplete: () => {
        $('.jobRedirect').on('click', function (ev: any) {
          localStorage.setItem('isFromTask', 'true')
        })
      }
    });
    $('#dt-closedjob-report tbody').on('click', 'td.clickable', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      if ($(this).hasClass('clickable')) {

      }
    });

    $('#dt-closedjob-report tbody').on('mousedown', 'td.jobRedirect', function (ev: any) {

      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      ev = ev || window.event;
      switch (ev.which) {
        case 1:
          vm.onOpenJobDetail(data);
          ;
          break;
        case 2:
          '';
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
            }
            ;
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
    if (!this.filter.status) {
      this.filter.status = "3";
    }
    this.table.clearPipeline()
    this.table.ajax.reload();
    this.table.order([[0, "desc"]]);
  }


  /**
   * This method reloads datatable after advance search
   * @method reloadAdvanceSearch
   * @param {any} filter Search Criteria
   */
  reloadAdvanceSearch(filter: any) {
    this.filter = []
    this.filter = filter
    this.table.clearPipeline()
    this.table.ajax.reload()
    this.table.order([[0, "desc"]]);
    this.cdRef.detectChanges();
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
    this.modalRefAdvanceSearch = this.modalService.show(template, {class: 'dob-modal-advance-search'})
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
    this.reportServices.downloadClosedJobReport(this.filterForDownload, type).subscribe(r => {
      window.open(r[0].value, "_blank");
    })
  }
}