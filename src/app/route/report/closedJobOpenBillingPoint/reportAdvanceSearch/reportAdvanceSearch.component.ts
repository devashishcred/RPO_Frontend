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
import { CompanyServices } from '../../../company/company.services';
import * as moment from 'moment';

import * as _ from 'underscore';

declare const $: any

@Component({
  selector: '[closedjob-report-advance-search]',
  templateUrl: './reportAdvanceSearch.component.html'
})
/**
 * This component contains all function that are used in ReportAdvanceSearchComponent
 * @class ReportAdvanceSearchComponent
 */

export class ClosedJobReportAdvanceSearchComponent {
  @Input() modalRefAdvanceSearch: BsModalRef
  @Input() reload: Function
  @Input() filledFilter: any
  @Output() reloadAdvanceSearch = new EventEmitter<any>()


  filter: any
  companies: any
  dropdownJobListSettings: any = {};
  dropdownContactListSettings: any = {};
  loading: boolean = false
  jobList: any = []
  contacts: any = []

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private companyServices: CompanyServices,
    private reportServices: ReportServices,
    private cdRef: ChangeDetectorRef
  ) {
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    document.title = 'Closed Jobs with Open Billing Points Report'
    if (this.filledFilter) {
      this.filter = this.filledFilter
      if (!this.filter.status) {
        this.filter.status = "3";
      }
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
    this.dropdownContactListSettings = {
      singleSelection: false,
      text: "Contact",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 1,
      classes: "myclass custom-class",
      tagToBody: false
    };
  }


  getDropdownData() {
    this.loading = true

    // For Company
    this.companyServices.getCompanyDropdown().subscribe(r => {
      this.companies = r
      this.setContacts()
    }, e => {
      this.loading = false
    })

    // For Job Number
    this.reportServices.getJobListDropdown().subscribe(r => {
      this.jobList = r
      if (typeof this.filter.idJob != 'undefined' && this.filter.idJob != '') {
        this.filter.jobId = []
        const dataToSplit = this.filter.idJob.toString().split('-').map(Number)
        this.filter.jobId = this.jobList.filter((f: any) => dataToSplit.includes(f.id));
      }
    }, e => {
      this.loading = false
    })
  }


  /**
   * This method is used to set contact details
   * @method setContacts
   */
  setContacts() {
    this.loading = true
    let companyId = -1
    if (this.filter.idCompany) {
      companyId = this.filter.idCompany
    }
    this.companyServices.getContactOfComDD(companyId).subscribe(r => {
      if (r && r.length > 0) {
        this.contacts = _.sortBy(r, function (i) {
          return i['itemName'].toLowerCase();
        });
        this.filter.contact = []
        if (typeof this.filter.idContact != 'undefined' && this.filter.idContact != '') {
          const dataToSplit = this.filter.idContact.toString().split('-').map(Number)
          this.filter.contact = this.contacts.filter((f: any) => dataToSplit.includes(f.id));
        }
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

    // For Contacts
    if (this.filter.contact && this.filter.contact.length > 0) {
      let tempContactIds: any = '';
      let ctr = 0;
      for (let i = 0; i < this.filter.contact.length; i++) {
        if (tempContactIds) {
          tempContactIds += "-" + this.filter.contact[i].id;
        } else {
          tempContactIds = this.filter.contact[i].id;
        }
        ctr++;
      }
      if (ctr == this.filter.contact.length) {
        this.filledFilter.idContact = tempContactIds;
        delete this.filledFilter.contact;
      }
    } else {
      delete this.filledFilter.idContact;
      delete this.filledFilter.contact;
    }
    this.reloadAdvanceSearch.emit(this.filledFilter)
    this.modalRefAdvanceSearch.hide()
  }

  clearSearch() {
    this.filledFilter = []
    this.filledFilter.status = "3";
    this.modalRefAdvanceSearch.hide()
    this.reloadAdvanceSearch.emit(this.filledFilter)
  }

  setJobsPerStatus() {
    if (this.filter.status && this.jobList && this.jobList.length > 0) {
      let filteredJobList = this.jobList.filter((x: any) => x.status == this.filter.status);
      this.jobList = filteredJobList;
    }
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
    if (forModule == 'contact') {
      this.filter['contact'] = this.filter['contact'].filter((x: any) => x.id != item.id);
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
    if (forModule == 'contact') {
      items.forEach((contactId: number) => {
        this.filter['contact'] = this.filter['contact'].filter((x: any) => x.id != contactId);
      })
    }
  }

  save() {
    //TODO ng12
  }
}