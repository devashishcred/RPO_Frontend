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


declare const $: any

/**
 * This component contains all function that are used in JobComponent
 * @class AllViolationReportComponent
 */
@Component({
  templateUrl: './rfpReport.component.html',
  styleUrls: ['./rfpReport.component.scss']
})
export class RfpReportComponent implements OnInit {


  private table: any
  private modalRef: BsModalRef
  private modalRefAdvanceSearch: BsModalRef
  private filter: any = {}
  private userAccessRight: any = {}
  private filterForDownload: any = {}
  showExportBtn: string = 'hide'

  /**
   * reportAdvanceSearch Form
   * @property reportAdvanceSearch
   */
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
    document.title = 'RFPs (Open or not sent to Client) Report'
    var vm = this;
    vm.table = $('#dt-rfp-report').DataTable({
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
      "order": [[6, "desc"]],
      ajax: this.reportServices.rfpReport({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columnDefs: [
        {type: 'date-uk', targets: [6]}, //specify your date column number,starting from 0
      ],
      columns: [
        {
          title: 'Proposal#',
          data: 'rfpNumber',
          class: 'rfp-red',
          render: function (data: any, type: any, dataToSet: any) {
            return dataToSet.rfpNumber;
          }
        },
        {
          title: 'Address',
          data: 'address',
          class: 'rfp-red',
        },
        {
          title: 'Special Place Name',
          data: 'specialPlaceName',
          class: 'rfp-red',
        },
        {
          title: 'Company',
          data: 'company',
          class: 'rfp-red'
        },
        {
          title: 'Cost',
          data: 'cost',
          class: 'rfp-red text-right'
        },
        {
          title: 'Created By',
          data: 'createdByEmployee',
          class: 'rfp-red',
        },
        {
          title: 'Last Modified On',
          data: 'lastModifiedDate',
          class: 'rfp-red',
          width: 100,
        },
        {
          title: 'Status',
          data: function (data: any) {
            return '<label class="label label' + data.idRfpStatus + ' status-label" data-placement="center" title="Status">' + data.rfpStatus + '</label>'
          },
          class: 'rfp-red',
        },
      ],
      drawCallback: (setting: any) => {

      },
      rowCallback: ((row: any, data: any, index: any) => {

      }),
      initComplete: () => {

      }
    });
    $('#dt-gcInsurance-report tbody').on('click', 'td.clickable', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      if ($(this).hasClass('clickable')) {

      }
    });

    $('#dt-rfp-report tbody').on('mousedown', 'td.rfp-red', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      ev = ev || window.event;
      switch (ev.which) {
        case 1:
          vm.onViewRFP(data);
          ;
          break;
        case 2:
          '';
          break;
        case 3:
          if (data.lastUpdatedStep == 1) {
            $(this).attr('href', './editSiteInformation/' + data.id)
          } else if (data.lastUpdatedStep == 2) {
            $(this).attr('href', './projectDetails/' + data.id)
          } else if (data.lastUpdatedStep == 3) {
            $(this).attr('href', './scopeReview/' + data.id)
          } else if (data.lastUpdatedStep == 4) {
            $(this).attr('href', './proposalReview/' + data.id)
          } else if (data.lastUpdatedStep == 5) {
            $(this).attr('href', './rfpSubmit/' + data.id)
          } else {
            $(this).attr('href', './editSiteInformation/' + data.id)
          }

          ;
          break;
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
   * This method decide step redirection based on last saved step
   * @method onViewRFP
   * @param {any} obj RFP Object
   */
  private onViewRFP(obj: any) {
    if (obj.lastUpdatedStep == 1) {
      this.router.navigate(['./editSiteInformation/', obj.id])
    } else if (obj.lastUpdatedStep == 2) {
      this.router.navigate(['/projectDetails', obj.id])
    } else if (obj.lastUpdatedStep == 3) {
      this.router.navigate(['/scopeReview', obj.id])
    } else if (obj.lastUpdatedStep == 4) {
      this.router.navigate(['/proposalReview', obj.id])
    } else if (obj.lastUpdatedStep == 5) {
      this.router.navigate(['/rfpSubmit', obj.id])
    } else {
      this.router.navigate(['./editSiteInformation/', obj.id])
    }
  }

  clearSort() {
    this.filter = {}
    this.table.clearPipeline()
    this.table.ajax.reload();
    this.table.order([[0, "desc"]]);
  }

  /**
   * This method reloads datatable after advance search
   * @method reloadAdvanceSearch
   * @param {any} filter Search Criteria
   */
  private reloadAdvanceSearch(filter: any) {
    this.filter = []
    this.filter = filter
    this.table.clearPipeline()
    this.table.ajax.reload()
    this.table.order([[0, "desc"]]);
  }


  /**
   * This method search in job datatable
   * @method searchJob
   * @param {string} srch Search Criteria
   */
  searchRFP(srch: string) {
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
   * @param {number} id ID of Job
   */
  private openModalAdvanceSearch(template: TemplateRef<any>, id?: number) {
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
    this.reportServices.downloadRfpReport(this.filterForDownload, type).subscribe(r => {
      window.open(r[0].value, "_blank");
    })
  }
}