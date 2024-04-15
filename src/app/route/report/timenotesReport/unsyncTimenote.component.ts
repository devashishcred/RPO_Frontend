import { Component, ElementRef, NgZone, TemplateRef, ViewChild, OnInit, Input, Inject } from '@angular/core';
import { assign, identity, pickBy } from 'lodash';
import { AppComponent } from '../../../app.component';
import { ReportServices } from '../report.services';
import { constantValues } from '../../../app.constantValues';
import { Router, ActivatedRoute } from '@angular/router';
import { UserRightServices } from '../../../services/userRight.services';
import { Message } from '../../../app.messages';
import * as _ from "underscore";


declare const $: any

/**
 * This component contains all function that are used in Reports
 * @class unsyncTimenoteReportComponent
 */
@Component({
  templateUrl: './unsyncTimenote.component.html',
  styleUrls: ['./unsyncTimenote.component.scss']
})
export class unsyncTimenoteReportComponent implements OnInit {


  private table: any
  loading: boolean = false;
  private fulltabledata: any = [];
  private filter: any = {}
  private userAccessRight: any = {}
  srch: string;

  /**
   * This method define all services that requires in whole class
   * @method constructor
   */
  constructor(
    private router: Router,
    private reportServices: ReportServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private route: ActivatedRoute,
    private appComponent: AppComponent,
  ) {


  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {

    this.loadDataTable()
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
   * This method load datatable
   * @method loadDataTable
   */
  loadDataTable() {

    document.title = 'Unsync Timenotes Report'
    var vm = this;
    vm.table = $('#dt-unsynctinemote-report').DataTable({
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
      "order": [[4, "desc"]],
      // "beDestroy":true,
      ajax: this.reportServices.unsynctimenotes({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columnDefs: [
        {type: 'date-uk', targets: 1}, //specify your date column number,starting from 0
        {type: 'date-uk', targets: 7} //specify your date column number,starting from 0

      ],
      columns: [
        {
          data: 'lastModifiedDate',
          visible: false
        },
        {
          title: 'Project#',
          data: 'idJob',
          class: 'jobRedirect',
          render: function (data: any, type: any, dataToSet: any) {
            return dataToSet.idJob;
          }
        },
        {
          title: 'PERFORMED DATE',
          data: 'timeNoteDate',
          class: 'jobRedirect',
          render: function (data: any, type: any, dataToSet: any) {
            let date = new Date(data);
            let month = date.getMonth() + 1;
            let datee = date.getDate()
            let displaydate = datee >= 10 ? datee : '0' + datee
            let className = "";
            if (dataToSet.isQuickbookSynced) {
              className = "green";
            } else {
              if (dataToSet.quickbookSyncError) {
                className = "red";
              } else {
                className = "yellow";
              }
            }
            return "<span class='" + className + " status'><i tooptip='test dsf' placement='right'></i></span>" + (month >= 10 ? month : "0" + month) + "/" + displaydate + "/" + date.getFullYear();
          }
        },
        {
          title: 'TIME',
          data: 'timeMinutes',
          class: 'min-auto jobRedirect',
          render: function (data: any, type: any, dataToSet: any) {
            let time = '';
            if (dataToSet.timeHours) {
              time += dataToSet.timeHours + 'h';
            } else {
              time += '00';
            }
            if (dataToSet.timeMinutes) {
              time += ':' + dataToSet.timeMinutes + 'm';
            } else {
              time += ':00';
            }
            return time;
          }
        },
        {
          title: 'NOTES',
          data: 'progressNotes',
          class: 'jobRedirect'
        },
        {
          title: 'SERVICE ITEM',
          data: 'serviceItem',
          class: 'jobRedirect'
        },
        {
          title: 'CATEGORY',
          data: 'jobBillingType',
          class: 'min-auto jobRedirect',
          render: function (data: any, type: any, dataToSet: any) {
            if (data == 1) {
              return "Scope Billing";
            }
            if (data == 2) {
              return "Other Billable Service";
            }
            if (data == 3) {
              return "Non Billable";
            }
          }
        },
        {
          title: 'CREATED BY',
          data: 'createdByEmployeeName',
          class: 'jobRedirect',
        },
        {
          title: 'CREATED DATE',
          data: 'createdDate',
          class: 'jobRedirect',
        },
        {
          title: 'Quick Book Error',
          data: 'quickbookSyncError',
          class: 'min-auto jobRedirect',
        },

      ],
      drawCallback: (setting: any) => {

      },
      rowCallback: ((row: any, data: any, index: any) => {

      }),
      initComplete: () => {
        $('.jobRedirect').on('click', function (ev: any) {
          localStorage.setItem('isFromTask', 'true')
        })

      }
    });
    $('#dt-unsynctinemote-report').on('click', 'td.clickable', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      if ($(this).hasClass('clickable')) {

      }
    });

    $('#dt-unsynctinemote-report tbody').on('mousedown', 'td.jobRedirect', function (ev: any) {
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
    this.table.clearPipeline()
    this.table.ajax.reload();
    this.table.order([[4, "desc"]]);
  }

  /**
   * This method search in job datatable
   * @method searchNotes
   * @param {string} srch Search Criteria
   */
  searchNotes(srch: string) {
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
   * This method will convert given string into title case
   * @method toTitleCase
   * @param {string} str request string
   */
  private toTitleCase(str: string) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
}