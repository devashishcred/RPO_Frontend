import {
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
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
  selector: '[contact-license-advance-search]',
  templateUrl: './reportAdvanceSearch.component.html'
})
/**
 * This component contains all function that are used in ApplicationStatusAdvanceSearchComponent
 * @class ApplicationStatusAdvanceSearchComponent
 */

export class ContactLicenseAdvanceSearchComponent {
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() filledFilter: any
  @Output() reloadAdvanceSearch = new EventEmitter<any>()


  filter: any
  private companies: any
  dropdownJobListSettings: any = {};
  private dropdownContactListSettings: any = {};
  loading: boolean = false
  jobList: any = []
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
      badgeShowLimit: 1,
      classes: "myclass custom-class",
      tagToBody: false
    };

    if (!this.filter.expiresFromDate) {
      this.filter.expiresFromDate = moment(new Date()).format("MM/DD/YYYY");
    }
    if (!this.filter.expiresToDate) {
      this.filter.expiresToDate = moment(new Date()).add(45, 'days').format("MM/DD/YYYY");
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
   * @param {boolean} clearSearch? type any which contains string that can be filtered from datatable
   */
  searchJobs(clearSearch?: boolean) {
    this.filledFilter = this.filter

    // For Job Number
    if (this.filter.jobId && this.filter.jobId.length > 0) {
      let tempJobNumber: any = '';
      let ctr = 0;
      for (let i = 0; i < this.filter.jobId.length; i++) {
        if (tempJobNumber) {
          tempJobNumber += "-" + this.filter.jobId[i].id;
        } else {
          tempJobNumber = this.filter.jobId[i].id;
        }
        ctr++;
      }
      if (ctr == this.filter.jobId.length) {
        this.filledFilter.idJob = tempJobNumber;
        delete this.filledFilter.jobId;
      }
    } else {
      delete this.filledFilter.idJob;
      delete this.filledFilter.jobId;
    }

    this.reloadAdvanceSearch.emit(this.filledFilter)
    this.modalRef.hide()
  }

  clearSearch() {
    this.filledFilter = []
    this.filledFilter.expiresFromDate = moment(new Date()).format("MM/DD/YYYY");
    this.filledFilter.expiresToDate = moment(new Date()).add(45, 'days').format("MM/DD/YYYY");
    this.modalRef.hide()
    this.reloadAdvanceSearch.emit(this.filledFilter)
  }


  /**
   *  Get selected item from dropdown, it will also increase count on selecting review
   * @method onItemSelect
   */
  onItemSelect(item: any) {
  }

  /**
   *  Deselect item from dropdown, it will also decrease count on deselecting review
   * @method OnItemDeSelect
   */

  /**
   * select on all in multiselect dropdown
   * @method onSelectAll
   * @param {any} items selected all items
   */
  onSelectAll(items: any) {
  }

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
    //TODO ng12
  }
}