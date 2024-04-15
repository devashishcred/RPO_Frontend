import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, ElementRef, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AllViolationAdvanceSearch } from '../../report';
import { ReportServices } from '../../report.services';
import * as moment from 'moment';

import * as _ from 'underscore';
declare const $: any

@Component({
  selector: '[contractor-license-advance-search]',
  templateUrl: './reportAdvanceSearch.component.html'
})
/**
* This component contains all function that are used in ApplicationStatusAdvanceSearchComponent
* @class ApplicationStatusAdvanceSearchComponent
*/

export class ContractorInsuranceAdvanceSearchComponent {
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() filledFilter: any
  @Output() reloadAdvanceSearch = new EventEmitter<any>()


  filter: any
  private companies: any
  private dropdownJobListSettings: any = {};
  private dropdownContactListSettings: any = {};
  loading: boolean = false
  private filterClear: boolean = true;
  private jobList: any = []
  private contacts: any = []
  private applicationTypesList: any = []
  private dropdownAppTypeListSettings: any = {};
  private applicationStatusList: any = [];
  private dropdownAppStatusListSettings: any = {};
  private projectManagerList: any = [];
  private dropdownProjectManagerListSettings: any = {};

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private reportServices: ReportServices,
    private cdRef: ChangeDetectorRef
  ) {
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'Contact License Expiry Report'
    if (this.filledFilter) {
      this.filter = this.filledFilter
    }
    this.getDropdownData();

    this.dropdownJobListSettings = {
      singleSelection: false,
      text: "Job#",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class"
    };
    if (!this.filter.TrackingFromDate && !this.filledFilter && this.filterClear) {
      this.filter.TrackingFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.TrackingToDate&& !this.filledFilter && this.filterClear) {
      this.filter.TrackingToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    }
    if (!this.filter.DOBWCFromDate && !this.filledFilter && this.filterClear) {
      this.filter.DOBWCFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.DOBWCToDate&& !this.filledFilter && this.filterClear) {
      this.filter.DOBWCToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    }
    if (!this.filter.DOBGLFromDate&& !this.filledFilter&& this.filterClear) {
      this.filter.DOBGLFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.DOBGLToDate&& !this.filledFilter&& this.filterClear) {
      this.filter.DOBGLToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    }
    if (!this.filter.DOBDIFromDate && !this.filledFilter&& this.filterClear) {
      this.filter.DOBDIFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.DOBDIToDate && !this.filledFilter && this.filterClear) {
      this.filter.DOBDIToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    }
    if (!this.filter.DOTWCFromDate && !this.filledFilter&& this.filterClear) {
      this.filter.DOTWCFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.DOTWCToDate && !this.filledFilter && this.filterClear) {
      this.filter.DOTWCToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    }
    if (!this.filter.DOTGLFromDate&& !this.filledFilter && this.filterClear) {
      this.filter.DOTGLFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.DOTGLToDate&& !this.filledFilter && this.filterClear) {
      this.filter.DOTGLToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    }
    if (!this.filter.DOTSOBFromDate&& !this.filledFilter && this.filterClear) {
      this.filter.DOTSOBFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.DOTSOBToDate&& !this.filledFilter && this.filterClear) {
      this.filter.DOTSOBToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    }
  }


  getDropdownData() {
    this.loading = true
    // For Job Number
    this.reportServices.getJobListDropdown().subscribe(r => {
      this.jobList = r
      if (typeof this.filter.idJob != 'undefined' && this.filter.idJob != '') {
        this.filter.jobId = []
        const dataToSplit = this.filter.idJob.toString().split('-').map(Number)
        this.filter.jobId = this.jobList.filter((f: any) => dataToSplit.includes(f.id));
      }
      this.loading = false
    }, e => {
      this.loading = false
    })
  }

  /**
  * This method is used for filter/search records from datatable
  * @method searchJobs
  * @param {boolean} clearSearch?? type any which contains string that can be filtered from datatable
  */
  searchJobs(clearSearch?: boolean) {
    this.filter.TrackingFromDate = $('#TrackingFromDate').val()
    this.filter.TrackingToDate = $('#TrackingToDate').val()
    this.filter.DOBWCFromDate = $('#DOBWCFromDate').val()
    this.filter.DOBWCToDate = $('#DOBWCToDate').val()
    this.filter.DOBDIFromDate = $('#DOBDIFromDate').val()
    this.filter.DOBDIToDate = $('#DOBDIToDate').val()
    this.filter.DOBGLFromDate = $('#DOBGLFromDate').val()
    this.filter.DOBGLToDate = $('#DOBGLToDate').val()
    this.filter.DOTWCFromDate= $('#DOTWCFromDate').val()
    this.filter.DOTWCToDate = $('#DOTWCToDate').val()
    this.filter.DOTSOBFromDate = $('#DOTSOBFromDate').val()
    this.filter.DOTSOBToDate = $('#DOTSOBToDate').val()
    this.filter.DOTGLFromDate = $('#DOTGLFromDate').val()
    this.filter.DOTGLToDate = $('#DOTGLToDate').val()

    this.filledFilter = this.filter
    this.filterClear = false;
    this.filledFilter['filterClear'] =this.filterClear ;

    this.reloadAdvanceSearch.emit(this.filledFilter)
    this.modalRef.hide()
  }

  clearSearch() {
    this.filterClear = true;
    this.filledFilter = {}
    this.filledFilter['filterClear'] =this.filterClear ;
    
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
    this.modalRef.hide()
    this.reloadAdvanceSearch.emit(this.filledFilter)
  }


  /**
     *  Get selected item from dropdown, it will also increase count on selecting review
     * @method onItemSelect
     */
  onItemSelect(item: any) { }
  /**
   *  Deselect item from dropdown, it will also decrease count on deselecting review
   * @method OnItemDeSelect
   */

  /**
   * select on all in multiselect dropdown
   * @method onSelectAll
   * @param {any} items selected all items
   */
  onSelectAll(items: any) { }

  OnItemDeSelect(item: any, forModule: string) {
    if (forModule == 'job') {
      this.filter['jobId'] = this.filter['jobId'].filter((x: any) => x.id != item.id);
    }
  }

  /**
      * deselect on all in multiselect dropdown
      * @method onDeSelectAll
      * @param {any} items deselected all items
      */
  onDeSelectAll(items: any, forModule: string) {
    if (forModule == 'job') {
      items.forEach((jobId: number) => {
        this.filter['jobId'] = this.filter['jobId'].filter((x: any) => x.id != jobId);
      })
    }
  }

  save() {

  }
}