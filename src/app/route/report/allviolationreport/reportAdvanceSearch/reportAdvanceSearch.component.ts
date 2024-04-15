import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AllViolationAdvanceSearch } from '../../report';
import { ReportServices } from '../../report.services';
import { CompanyServices } from '../../../company/company.services';

import * as _ from 'underscore';

declare const $: any

@Component({
  selector: '[report-advance-search]',
  templateUrl: './reportAdvanceSearch.component.html'
})
/**
 * This component contains all function that are used in ReportAdvanceSearchComponent
 * @class ReportAdvanceSearchComponent
 */

export class ReportAdvanceSearchComponent {
  @Input() modalRefAdvanceSearch: BsModalRef
  @Input() idCompany: number
  @Input() reload: Function
  @Input() filledFilter: any
  @Input() isFromCOC: boolean
  @Input() isSearchFromAddress: boolean
  @Output() reloadAdvanceSearch = new EventEmitter<any>()
  @Output() clearSearchEvent = new EventEmitter<any>()


  filter: any
  companies: any
  dropdownViolationStatusSettings: any = {};
  dropdownCertificationStatusSettings: any = {};
  dropdownJobListSettings: any = {};
  dropdownHearingResultSettings: any = {};
  dropdownContactListSettings: any = {};
  loading: boolean = false
  violationStatusList: any = []
  jobList: any = []
  certificationStatusList: any = []
  hearingResultList: any = []
  contacts: any = []
  private isFullyResolvedList = [
    {id: 'Yes', itemName: "Yes"},
    {id: 'No', itemName: "No"},
  ]

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private companyServices: CompanyServices,
    private reportServices: ReportServices,
  ) {
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    document.title = 'All Violations Report'
    if (this.filledFilter) {
      this.filter = this.filledFilter
    }
    this.getDropdownData();
    this.dropdownViolationStatusSettings = {
      singleSelection: false,
      text: "Violation Status",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 1,
      classes: "myclass custom-class",
      tagToBody: false
    };
    this.dropdownCertificationStatusSettings = {
      singleSelection: false,
      text: "Certification Status",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 1,
      classes: "myclass custom-class",
      tagToBody: false
    };
    this.dropdownJobListSettings = {
      singleSelection: false,
      text: "Project#",
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
    this.dropdownHearingResultSettings = {
      singleSelection: false,
      text: "Hearing Result",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 1,
      classes: "myclass custom-class",
      tagToBody: false
    }

  }


  getDropdownData() {
    this.loading = true
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

    // For Violation Status
    this.reportServices.getViolationtatusDropdown().subscribe(r => {
      this.violationStatusList = r
      if (typeof this.filter.violationStatus != 'undefined' && this.filter.violationStatus != '') {
        this.filter.status = []
        const dataToSplit = this.filter.violationStatus.split('-').map(String)
        this.filter.status = this.violationStatusList.filter((f: any) => dataToSplit.includes(f.id));
      }
    }, e => {
      this.loading = false
    })

    // For Certification Status
    this.reportServices.getCertificationstatusDropdown().subscribe(r => {
      this.certificationStatusList = r
      if (typeof this.filter.certificationStatus != 'undefined' && this.filter.certificationStatus != '') {
        this.filter.cocStatus = []
        const dataToSplit = this.filter.certificationStatus.split('-').map(String)
        this.filter.cocStatus = this.certificationStatusList.filter((f: any) => dataToSplit.includes(f.id));
      }
      this.loading = false
    }, e => {
      this.loading = false
    })

    // For Hearing Result
    this.reportServices.getHearingResultDropdown().subscribe(r => {
      this.hearingResultList = r
      if (typeof this.filter.hearingResult != 'undefined' && this.filter.hearingResult != '') {
        this.filter.result = []
        const dataToSplit = this.filter.hearingResult.split('-').map(String)
        this.filter.result = this.hearingResultList.filter((f: any) => dataToSplit.includes(f.id));
      }
      this.loading = false
    }, e => {
      this.loading = false
    })
  }


  /**
   * This method is used to set contact details
   * @method setContacts
   */
  setContacts() {
    this.loading = true;
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

    // For Violation Status
    if (this.filter.status && this.filter.status.length > 0) {
      let tempViolationStatus: any = '';
      let ctr = 0;
      for (let i = 0; i < this.filter.status.length; i++) {
        if (tempViolationStatus) {
          tempViolationStatus += "-" + this.filter.status[i].id;
        } else {
          tempViolationStatus = this.filter.status[i].id;
        }
        ctr++;
      }
      if (ctr == this.filter.status.length) {
        this.filledFilter.violationStatus = tempViolationStatus;
        delete this.filledFilter.status;
      }
    } else {
      delete this.filledFilter.violationStatus;
      delete this.filledFilter.status;
    }

    // For Certification Status
    if (this.filter.cocStatus && this.filter.cocStatus.length > 0) {
      let tempCocStatus: any = '';
      let ctr = 0;
      for (let i = 0; i < this.filter.cocStatus.length; i++) {
        if (tempCocStatus) {
          tempCocStatus += "-" + this.filter.cocStatus[i].id;
        } else {
          tempCocStatus = this.filter.cocStatus[i].id;
        }
        ctr++;
      }
      if (ctr == this.filter.cocStatus.length) {
        this.filledFilter.certificationStatus = tempCocStatus;
        delete this.filledFilter.cocStatus;
      }
    } else {
      delete this.filledFilter.certificationStatus;
      delete this.filledFilter.cocStatus;
    }

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

    // For Hearing Result
    if (this.filter.result && this.filter.result.length > 0) {
      let tempHearingResult: any = '';
      let ctr = 0;
      for (let i = 0; i < this.filter.result.length; i++) {
        if (tempHearingResult) {
          tempHearingResult += "-" + this.filter.result[i].id;
        } else {
          tempHearingResult = this.filter.result[i].id;
        }
        ctr++;
      }
      if (ctr == this.filter.result.length) {
        this.filledFilter.hearingResult = tempHearingResult;
        delete this.filledFilter.result;
      }
    } else {
      delete this.filledFilter.hearingResult;
      delete this.filledFilter.result;
    }

    this.reloadAdvanceSearch.emit(this.filledFilter)
    this.modalRefAdvanceSearch.hide()
  }

  clearSearch() {
    this.filledFilter = []
    this.filledFilter.isFullyResolved = 'false'
    this.modalRefAdvanceSearch.hide()
    console.log('pop up', this.filledFilter)
    this.clearSearchEvent.emit(this.filledFilter)
    // this.reloadAdvanceSearch.emit()
  }

  /**
   *  Get selected item from dropdown, it will also increase count on selecting review
   * @method onItemSelect
   */
  onItemSelect(item: any) {
  }


  /**
   * select on all in multiselect dropdown
   * @method onSelectAll
   * @param {any} items selected all items
   */
  onSelectAll(items: any) {
  }

  /**
   *  Deselect item from dropdown, it will also decrease count on deselecting review
   * @method OnItemDeSelect
   */
  OnItemDeSelect(item: any, forModule: string) {
    if (forModule == 'job') {
      this.filter['jobId'] = this.filter['jobId'].filter((x: any) => x.id != item.id);
    }
    if (forModule == 'contact') {
      this.filter['contact'] = this.filter['contact'].filter((x: any) => x.id != item.id);
    }
    if (forModule == 'certificationStatus') {
      this.filter['cocStatus'] = this.filter['cocStatus'].filter((x: any) => x.id != item.id);
    }
    if (forModule == 'violationStatus') {
      this.filter['status'] = this.filter['status'].filter((x: any) => x.id != item.id);
    }
    if (forModule == 'hearingResult') {
      this.filter['result'] = this.filter['result'].filter((x: any) => x.id != item.id);
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
    if (forModule == 'certificationStatus') {
      items.forEach((status: number) => {
        this.filter['cocStatus'] = this.filter['cocStatus'].filter((x: any) => x.id != status);
      })
    }
    if (forModule == 'violationStatus') {
      items.forEach((status: number) => {
        this.filter['status'] = this.filter['status'].filter((x: any) => x.id != status);
      })
    }
    if (forModule == 'hearingResult') {
      items.forEach((result: number) => {
        this.filter['result'] = this.filter['result'].filter((x: any) => x.id != result);
      })
    }
  }

  save() {
    //TODO: ng12
  }
}