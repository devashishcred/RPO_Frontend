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
* This component contains all function that are used in ContactLicenseExpiryReportComponent
* @class ContactLicenseExpiryReportComponent
*/
@Component({
  templateUrl: './contactLicenseExpiry.component.html',
  styleUrls: ['./contactLicenseExpiry.component.scss']
})
export class ContactLicenseExpiryReportComponent implements OnInit {


  private table: any
  modalRef: BsModalRef
  filter: any = {}
  private userAccessRight: any = {}


  /**
    * reportAdvanceSearch Form
    * @property reportAdvanceSearch
    */
  @ViewChild('licenseReportAdvanceSearch',{static: true})
  private licenseReportAdvanceSearch: TemplateRef<any>
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
    this.filter = []
    if (!this.filter.expiresFromDate) {
      this.filter.expiresFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.expiresToDate) {
      this.filter.expiresToDate = moment(new Date()).add(45, 'days').format("MM/DD/YYYY");
    }
    this.loadDataTable()
  }

  /**
   * This method load datatable
   * @method loadDataTable 
   */
  loadDataTable() {
    document.title = 'Contact License Expiry Report'
    var vm = this;
    vm.table = $('#dt-contactLicence-report').DataTable({
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
      "aaSorting": [[3, "asc"]],
      ajax: this.reportServices.contactLicenseReport({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columnDefs: [
        { type: 'date-uk', targets: [3] }, //specify your date column number,starting from 0        
      ],
      columns: [
        {
          title: 'Contact',
          data: 'contact',
          class: '',
          render: function (data: any, type: any, dataToSet: any) {
            return "<a  href='javascript:void(0)' rel='noreferrer'>" + dataToSet.contact + " </a>";
          },
        },
        {
          title: 'Company',
          data: 'company',
          class: '',
          render: function (data: any, type: any, dataToSet: any) {
            return "<a  href='./companydetail/" + dataToSet.idCompany + "' rel='noreferrer' target='_blank'>" + dataToSet.company + " </a>";
          },
        },
        {
          title: 'Contact License Type',
          data: 'contactLicenseType',
          class: '',
        },
        {
          title: 'Expiration License Date',
          data: 'expirationLicenseDate',
          class: '',
        },
        {
          title: 'Project#',
          data: 'jobNumber',
          class: '',
        },
      ],
      drawCallback: (setting: any) => {

      },
      rowCallback: ((row: any, data: any, index: any) => {

      }),
      initComplete: () => {

      }
    });
    $('#dt-contactLicence-report tbody').on('click', 'td.clickable', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      if ($(this).hasClass('clickable')) {

      }
    });

    $('#dt-contactLicence-report tbody').on('mousedown', 'a.cont-name', function (ev: any) {
      
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
        ev = ev || window.event;
        switch (ev.which) {
         case 1: vm.onOpenContactDetail(data);
         ; break;
         case 2: '';
          break;
         case 3: 
          $(this).attr('href', './contactdetail/'+ data.id)
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
  * This method is used to navigate onOpenContactDetail
  * @method onOpenContactDetail
  * @param {any} obj contains contact object
  */
 private onOpenContactDetail(obj: any) {
  this.router.navigate(['/contactdetail', obj.id])
}
 /**
   * This method resets the datatable sorting columns
   * @method clearSort
   */
 clearSort() {
    this.filter = {}
    if (!this.filter.expiresFromDate) {
      this.filter.expiresFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.expiresToDate) {
      this.filter.expiresToDate = moment(new Date()).add(45, 'days').format("MM/DD/YYYY");
    }
    this.table.clearPipeline()
    this.table.ajax.reload();
    this.table.order([[3, "asc"]]);
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
    this.table.order([[3, "asc"]]);
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
    this.modalRef = this.modalService.show(template, { class: 'modal-advance-search',backdrop: 'static', 'keyboard': false })
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