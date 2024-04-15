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
import * as moment from 'moment';

declare const $: any

/**
* This component contains all function that are used in JobComponent
* @class AllViolationReportComponent
*/
@Component({
  templateUrl: './gcInsurance.component.html',
  styleUrls: ['./gcInsurance.component.scss']
})
export class GCInsuranceReportComponent implements OnInit {


  private table: any
  modalRef: BsModalRef
  filter: any = {}
  private userAccessRight: any = {}


  /**
    * contractorlicenseadvancesearch Form
    * @property contractorlicenseadvancesearch
    */
  @ViewChild('contractorlicenseadvancesearch',{static: true})
  private contractorlicenseadvancesearch: TemplateRef<any>
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
    this.loadDataTable()
  }

  /**
   * This method load datatable
   * @method loadDataTable 
   */
  loadDataTable() {
    if (!this.filter.TrackingFromDate) {
      this.filter.TrackingFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.TrackingToDate) {
      this.filter.TrackingToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    }
    if (!this.filter.DOBWCFromDate) {
      this.filter.DOBWCFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.DOBWCToDate) {
      this.filter.DOBWCToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    }
    if (!this.filter.DOBGLFromDate) {
      this.filter.DOBGLFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.DOBGLToDate) {
      this.filter.DOBGLToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    }
    if (!this.filter.DOBDIFromDate) {
      this.filter.DOBDIFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.DOBDIToDate) {
      this.filter.DOBDIToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    }
    if (!this.filter.DOTWCFromDate) {
      this.filter.DOTWCFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.DOTWCToDate) {
      this.filter.DOTWCToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    }
    if (!this.filter.DOTGLFromDate) {
      this.filter.DOTGLFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.DOTGLToDate) {
      this.filter.DOTGLToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    }
    if (!this.filter.DOTSOBFromDate) {
      this.filter.DOTSOBFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.DOTSOBToDate) {
      this.filter.DOTSOBToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    }
    document.title = 'Contractor Insurances Expiry Report'
    var vm = this;
    vm.table = $('#dt-gcInsurance-report').DataTable({
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
      "aaSorting": [],
      "order": [[4, "desc"]],
      // "beDestroy":true,
      ajax: this.reportServices.gcInsuranceReport({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columnDefs: [
        { type: 'date-uk', targets: [4,6, 7, 8,9,10,11] }, //specify your date column number,starting from 0        
      ],
      columns: [
        {
          title: 'Company',
          data: 'company',
          class: 'comp-red',
          render: function (data: any, type: any, dataToSet: any) {
            return dataToSet.company;
          }
        },
        {
          title: 'Address',
          data: 'address',
          class: 'comp-red'
        }, 
        {
          title: 'Responsibility',
          data: 'responsibilityName',
          class: 'min-auto comp-red'
        },
        {
          title: 'Phone Number',
          data: 'phoneNumber',
          class: 'min-auto comp-red',
        },
        {
          title: 'Tracking#',
          data: 'trackingNumber',
          class: 'min-auto comp-red'
        },
        {
          title: 'Tracking# expiry',
          data: 'trackingExpiry',
          class: 'min-auto comp-red'
        },
        {
          title: 'IBM#',
          data: 'ibmNumber',
          class: 'min-auto comp-red'
        },
        {
          title: 'DOB_WC',
          data: 'insuranceWorkCompensation',
          class: 'min-auto comp-red',
        },
        {
          title: 'DOB_GL',
          data: 'insuranceGeneralLiability',
          class: 'min-auto comp-red'
        },
        {
          title: 'DOB_DI',
          data: 'insuranceDisability',
          class: 'comp-red',
        },
        {
          title: 'DOT_WC',
          data: 'dotInsuranceWorkCompensation',
          class: 'min-auto comp-red',
        },
        {
          title: 'DOT_GL',
          data: 'dotInsuranceGeneralLiability',
          class: 'min-auto comp-red'
        },
        {
          title: 'DOT_SOB',
          data: 'dotInsuranceObstructionBond',
          class: 'min-auto comp-red'
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

    $('#dt-gcInsurance-report tbody').on('mousedown', 'td.comp-red', function (ev: any) {
      
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
        ev = ev || window.event;
        switch (ev.which) {
         case 1: vm.onOpenCompanyDetail(data);
         ; break;
         case 2: '';
          break;
         case 3: 
          $(this).attr('href', './companydetail/'+ data.id)
        
         ; break; 
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
   * This method open company detail page
   * @method onOpenCompanyDetail
   * @param {any} obj Company Object 
   */
  private onOpenCompanyDetail(obj: any) {
    this.router.navigate(['/companydetail', obj.id])
  }
 /**
   * This method resets the datatable sorting columns
   * @method clearSort
   */
 clearSort() {
    this.filter = {}
    this.filter.TrackingFromDate = moment(new Date()).format("MM/DD/YYYY");
    this.filter.TrackingToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    this.filter.DOBWCFromDate = moment(new Date()).format("MM/DD/YYYY");
    this.filter.DOBWCToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    this.filter.DOBGLFromDate = moment(new Date()).format("MM/DD/YYYY");
    this.filter.DOBGLToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    this.filter.DOBDIFromDate = moment(new Date()).format("MM/DD/YYYY");
    this.filter.DOBDIToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    this.filter.DOTWCFromDate = moment(new Date()).format("MM/DD/YYYY");
    this.filter.DOTWCToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    this.filter.DOTGLFromDate = moment(new Date()).format("MM/DD/YYYY");
    this.filter.DOTGLToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    this.filter.DOTSOBFromDate = moment(new Date()).format("MM/DD/YYYY");
    this.filter.DOTSOBToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    this.table.clearPipeline()
    this.table.ajax.reload();
    this.table.order([[4, "desc"]]);
  }


  /**
   * This method reloads datatable after advance search
   * @method reloadAdvanceSearch
   * @param {any} filter Search Criteria 
   */
  reloadAdvanceSearch(filter: any, filterClear: boolean) {

    this.filter = filter
    if (this.filter.filterClear) {
      this.filter.TrackingFromDate = moment(new Date()).format("MM/DD/YYYY");
      this.filter.TrackingToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
      this.filter.DOBWCFromDate = moment(new Date()).format("MM/DD/YYYY");
      this.filter.DOBWCToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
      this.filter.DOBGLFromDate = moment(new Date()).format("MM/DD/YYYY");
      this.filter.DOBGLToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
      this.filter.DOBDIFromDate = moment(new Date()).format("MM/DD/YYYY");
      this.filter.DOBDIToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
      this.filter.DOTWCFromDate = moment(new Date()).format("MM/DD/YYYY");
      this.filter.DOTWCToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
      this.filter.DOTGLFromDate = moment(new Date()).format("MM/DD/YYYY");
      this.filter.DOTGLToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
      this.filter.DOTSOBFromDate = moment(new Date()).format("MM/DD/YYYY");
      this.filter.DOTSOBToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    }
    this.table.clearPipeline()
    this.table.ajax.reload()
    this.table.order([[4, "desc"]]);
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
    this.modalRef = this.modalService.show(template, { class: 'modal-advance-search' })
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
}