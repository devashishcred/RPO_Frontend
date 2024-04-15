import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, ElementRef, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AllViolationAdvanceSearch } from '../../report';
import { ReportServices } from '../../report.services';
import { CompanyServices } from '../../../company/company.services';
import { ApplicationTypeServices } from '../../../applicationtype/applicationType.services';
import { JobApplicationService } from '../../../../services/JobApplicationService.services';
import * as moment from 'moment';

import * as _ from 'underscore';

declare const $: any

@Component({
  selector: '[application-status-advance-search]',
  templateUrl: './reportAdvanceSearch.component.html'
})
/**
 * This component contains all function that are used in ApplicationStatusAdvanceSearchComponent
 * @class ApplicationStatusAdvanceSearchComponent
 */

export class ApplicationStatusAdvanceSearchComponent {
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
  applicationTypesList: any = []
  dropdownAppTypeListSettings: any = {};
  applicationStatusList: any = [];
  dropdownAppStatusListSettings: any = {};
  projectManagerList: any = [];
  dropdownProjectManagerListSettings: any = {};

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private companyServices: CompanyServices,
    private reportServices: ReportServices,
    private cdRef: ChangeDetectorRef,
    private applicationTypeServices: ApplicationTypeServices,
    private jobApplicationService: JobApplicationService
  ) {
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    document.title = 'Application Status Report'
    if (this.filledFilter) {
      this.filter = this.filledFilter
      if (!this.filter.JobStatus) {
        this.filter.JobStatus = "null";
      }
    }
    this.getDropdownData();

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
    this.dropdownAppTypeListSettings = {
      singleSelection: false,
      text: "Application Type",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 1,
      classes: "myclass custom-class",
      tagToBody: false
    };
    this.dropdownAppStatusListSettings = {
      singleSelection: false,
      text: "Application Status",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 1,
      classes: "myclass custom-class",
      tagToBody: false
    }
    this.dropdownProjectManagerListSettings = {
      singleSelection: false,
      text: "Project Manager",
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

    // For Application Type
    this.applicationTypeServices.getAllChildAppType().subscribe(r => {
      this.applicationTypesList = r
      if (typeof this.filter.idApplicationType != 'undefined' && this.filter.idApplicationType != '') {
        this.filter.appType = []
        const dataToSplit = this.filter.idApplicationType.toString().split('-').map(Number)
        this.filter.appType = this.applicationTypesList.filter((f: any) => dataToSplit.includes(f.id));
      }
    }, e => {
      this.loading = false
    })

    // For Application Status
    this.jobApplicationService.getApplicationStatusDD().subscribe(r => {
      this.applicationStatusList = r
      if (typeof this.filter.idApplicationStatus != 'undefined' && this.filter.idApplicationStatus != '') {
        this.filter.appStatus = []
        const dataToSplit = this.filter.idApplicationStatus.toString().split('-').map(Number)
        this.filter.appStatus = this.applicationStatusList.filter((f: any) => dataToSplit.includes(f.id));
      }
    }, e => {
      this.loading = false
    })

    // For Employees
    this.reportServices.getEmployeeListDropdown().subscribe(r => {
      this.projectManagerList = r
      if (typeof this.filter.idProjectManager != 'undefined' && this.filter.idProjectManager != '') {
        this.filter.projectManager = []
        const dataToSplit = this.filter.idProjectManager.toString().split('-').map(Number)
        this.filter.projectManager = this.projectManagerList.filter((f: any) => dataToSplit.includes(f.id));
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

    // For Application Type
    if (this.filter.appType && this.filter.appType.length > 0) {
      let tempAppType: any = '';
      let ctr = 0;
      for (let i = 0; i < this.filter.appType.length; i++) {
        if (tempAppType) {
          tempAppType += "-" + this.filter.appType[i].id;
        } else {
          tempAppType = this.filter.appType[i].id;
        }
        ctr++;
      }
      if (ctr == this.filter.appType.length) {
        this.filledFilter.idApplicationType = tempAppType;
        delete this.filledFilter.appType;
      }
    } else {
      delete this.filledFilter.idApplicationType;
      delete this.filledFilter.appType;
    }

    // For Application Status
    if (this.filter.appStatus && this.filter.appStatus.length > 0) {
      let tempAppStatus: any = '';
      let ctr = 0;
      for (let i = 0; i < this.filter.appStatus.length; i++) {
        if (tempAppStatus) {
          tempAppStatus += "-" + this.filter.appStatus[i].id;
        } else {
          tempAppStatus = this.filter.appStatus[i].id;
        }
        ctr++;
      }
      if (ctr == this.filter.appStatus.length) {
        this.filledFilter.idApplicationStatus = tempAppStatus;
        delete this.filledFilter.appStatus;
      }
    } else {
      delete this.filledFilter.idApplicationStatus;
      delete this.filledFilter.appStatus;
    }

    // For project manager
    if (this.filter.projectManager && this.filter.projectManager.length > 0) {
      let tempProjectManagerIds: any = '';
      let ctr = 0;
      for (let i = 0; i < this.filter.projectManager.length; i++) {
        if (tempProjectManagerIds) {
          tempProjectManagerIds += "-" + this.filter.projectManager[i].id;
        } else {
          tempProjectManagerIds = this.filter.projectManager[i].id;
        }
        ctr++;
      }
      if (ctr == this.filter.projectManager.length) {
        this.filledFilter.idProjectManager = tempProjectManagerIds;
        delete this.filledFilter.projectManager;
      }
    } else {
      delete this.filledFilter.idProjectManager;
      delete this.filledFilter.projectManager;
    }


    this.reloadAdvanceSearch.emit(this.filledFilter)
    this.modalRefAdvanceSearch.hide()
  }

  clearSearch() {
    this.filledFilter = []
    this.filledFilter.JobStatus = "null";
    this.modalRefAdvanceSearch.hide()
    this.reloadAdvanceSearch.emit(this.filledFilter)
  }

  setJobsPerStatus() {
    if (this.filter.JobStatus && this.jobList && this.jobList.length > 0) {
      let filteredJobList = this.jobList.filter((x: any) => x.status == this.filter.JobStatus);
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
    if (forModule == 'apptype') {
      this.filter['appType'] = this.filter['appType'].filter((x: any) => x.id != item.id);
    }
    if (forModule == 'appstatus') {
      this.filter['appStatus'] = this.filter['appStatus'].filter((x: any) => x.id != item.id);
    }
    if (forModule == 'pm') {
      this.filter['projectManager'] = this.filter['projectManager'].filter((x: any) => x.id != item.id);
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
    if (forModule == 'apptype') {
      items.forEach((appTypeId: number) => {
        this.filter['appType'] = this.filter['appType'].filter((x: any) => x.id != appTypeId);
      })
    }
    if (forModule == 'appstatus') {
      items.forEach((appStatusId: number) => {
        this.filter['appStatus'] = this.filter['appStatus'].filter((x: any) => x.id != appStatusId);
      })
    }
    if (forModule == 'pm') {
      items.forEach((pm: number) => {
        this.filter['projectManager'] = this.filter['projectManager'].filter((x: any) => x.id != pm);
      })
    }
  }

  save() {
    //TODO: ng12
  }
}