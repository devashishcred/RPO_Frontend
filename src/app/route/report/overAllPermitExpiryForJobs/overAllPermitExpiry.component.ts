import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, ElementRef, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ReportServices } from '../report.services';
import * as moment from 'moment';
import * as _ from 'underscore';
declare const $: any

@Component({
  selector: '[overall-permit-expiry-jobs-report]',
  templateUrl: './overAllPermitExpiry.component.html'
})
/**
* This component contains all function that are used in OverAllPermitExpiryForJobsComponent
* @class OverAllPermitExpiryForJobsComponent
*/

export class OverAllPermitExpiryForJobsComponent {
  filter: any = {}
  private filledFilter: any
  dropdownJobListSettings: any = {
    badgeShowLimit: 1,
  }
  loading: boolean = false
  jobList: any = []
  reportDocument: { name: any; path: any; displayPath: any; };
  selectedJobId: any;
  modalRefJobSelect: BsModalRef;

  @ViewChild('jobSelect',{static: true})
  jobSelect: TemplateRef<any>

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private reportServices: ReportServices,
    private cdRef: ChangeDetectorRef,
    private modalService: BsModalService,
  ) {
    // override the route reuse strategy
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        // trick the Router into believing it's last link wasn't previously loaded
        this.router.navigated = false;
        // if you need to scroll back to top, here is the right place
        window.scrollTo(0, 0);
      }
    });
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'Consolidated Status Report'
    this.loading = true
    setTimeout(() => {
      this.dropdownJobListSettings = {
        singleSelection: false,
        text: "Project#",
        enableCheckAll: true,
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        enableSearchFilter: true,
        classes: "myclass custom-class"
      };
      this.getDropdownData()
    }, 0)
  }

  getDropdownData() {
    this.loading = true
    // For Job Number
    if (this.jobList.length == 0) {
      this.reportServices.getJobListDropdown().subscribe(r => {
        this.jobList = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    }

  }

  /**
  * This method is used for filter/search records from datatable
  * @method searchJobs
  * @param {boolean} clearSearch type any which contains string that can be filtered from datatable
  */
  exportReport(type: string) {
    this.loading = true
    this.filledFilter = this.filter

    // For Job Number
    if (this.filter.id && this.filter.id.length > 0) {
      let tempJobNumber: any = '';
      let ctr = 0;
      for (let i = 0; i < this.filter.id.length; i++) {
        if (tempJobNumber) {
          tempJobNumber += "-" + this.filter.id[i].id;
        } else {
          tempJobNumber = this.filter.id[i].id;
        }
        ctr++;
      }
      if (ctr == this.filter.id.length) {
        this.filledFilter.idJob = tempJobNumber;
        // delete this.filledFilter.id;
      }
    } else {
      delete this.filledFilter.idJob;
      delete this.filledFilter.id;
    }
    this.reportServices.downloadOverAllPermitExpiryReport(this.filledFilter, type).subscribe(r => {
      this.filledFilter = [];
      this.filter = {};
      this.loading = false
      this.loading = false;
      this.reportDocument = { name: r.reportName, path: r.filepath, displayPath: r.newPath };
      if (!(type == 'xlsEmail' || type == 'pdfEmail'))
        window.open(r[0].value, "_blank");
      else {
        this.selectedJobId = undefined;
        this.modalRefJobSelect = this.modalService.show(this.jobSelect, { class: 'modal-md', backdrop: 'static', 'keyboard': false })
      }

    }, e => {
      this.loading = false
    });

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

}