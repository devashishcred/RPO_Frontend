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
import { BoroughServices } from '../../../../services/borough.services';
import * as moment from 'moment';

import * as _ from 'underscore';

declare const $: any

@Component({
  selector: '[permit-report-advance-search]',
  templateUrl: './reportAdvanceSearch.component.html'
})
/**
 * This component contains all function that are used in ReportAdvanceSearchComponent
 * @class ReportAdvanceSearchComponent
 */

export class PermitReportAdvanceSearchComponent {
  @Input() modalRefAdvanceSearch: BsModalRef
  @Input() idCompany: number
  @Input() reload: Function
  @Input() filledFilter: any
  @Input() isFromCOC: boolean
  @Input() isSearchFromAddress: boolean
  @Output() reloadAdvanceSearch = new EventEmitter<any>()


  filter: any
  companies: any
  dropdownJobListSettings: any = {};
  dropdownContactListSettings: any = {};
  dropdownProjectManagerListSettings: any = {};
  dropdownBoroughListSettings: any = {badgeShowLimit: 1,};
  dropdownResponsibilityListSettings: any = {badgeShowLimit: 1,};
  loading: boolean = false
  jobList: any = []
  projectManagerList: any = []
  boroughList: any = []
  respList: any = []
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
    private cdRef: ChangeDetectorRef,
    private boroughServices: BoroughServices,
  ) {
  }

  ngAfterViewChecked() {
    if (this.filledFilter) {
      this.filter = this.filledFilter
    }
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    document.title = 'Permit Expiry Report'
    if (this.filledFilter) {
      this.filter = this.filledFilter
      if (!this.filter.permitCode) {
        this.filter.permitCode = "DOB";
      }
      if (!this.filter.status) {
        this.filter.status = "1";
      }
      if (!this.filter.expiresFromDate) {
        this.filter.expiresFromDate = moment(new Date()).format("MM/DD/YYYY");
      }
      if (!this.filter.expiresToDate) {
        this.filter.expiresToDate = moment(new Date()).add(14, 'days').format("MM/DD/YYYY");
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

    if (this.filter.permitCode == "DOB") {
      //For responsibility
      this.respList = [
        {
          "id": 1,
          "description": "RPO",
          "itemName": "RPO"
        },
        {
          "id": 2,
          "description": "Other",
          "itemName": "Other"
        }
      ];
      this.filter.responsibility = [
        {
          "id": 1,
          "description": "RPO",
          "itemName": "RPO"
        },
        {
          "id": 2,
          "description": "Other",
          "itemName": "Other"
        }
      ];
    }

    if (typeof this.filter.idResponsibility != 'undefined' && this.filter.idResponsibility != '') {
      this.filter.responsibility = []
      const dataToSplit = this.filter.idResponsibility.toString().split('-').map(Number)
      this.filter.responsibility = this.respList.filter((f: any) => dataToSplit.includes(f.id));
    }

    // For borough
    this.boroughServices.getDropdownData().subscribe(r => {
      this.boroughList = r
      if (typeof this.filter.idBorough != 'undefined' && this.filter.idBorough != '') {
        this.filter.borough = []
        const dataToSplit = this.filter.idBorough.toString().split('-').map(Number)
        this.filter.borough = this.boroughList.filter((f: any) => dataToSplit.includes(f.id));
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

    // For Borough
    if (this.filter.borough && this.filter.borough.length > 0) {
      let tempBorough: any = '';
      let ctr = 0;
      for (let i = 0; i < this.filter.borough.length; i++) {
        if (tempBorough) {
          tempBorough += "-" + this.filter.borough[i].id;
        } else {
          tempBorough = this.filter.borough[i].id;
        }
        ctr++;
      }
      if (ctr == this.filter.borough.length) {
        this.filledFilter.idBorough = tempBorough;
        delete this.filledFilter.borough;
      }
    } else {
      delete this.filledFilter.idBorough;
      delete this.filledFilter.borough;
    }


    // For Responsibility
    if (this.filter.responsibility && this.filter.responsibility.length > 0) {
      let tempResponsibility: any = '';
      let ctr = 0;
      for (let i = 0; i < this.filter.responsibility.length; i++) {
        if (tempResponsibility) {
          tempResponsibility += "-" + this.filter.responsibility[i].id;
        } else {
          tempResponsibility = this.filter.responsibility[i].id;
        }
        ctr++;
      }
      if (ctr == this.filter.responsibility.length) {
        this.filledFilter.idResponsibility = tempResponsibility;
        delete this.filledFilter.responsibility;
      }
    } else {
      delete this.filledFilter.idResponsibility;
      delete this.filledFilter.responsibility;
    }


    this.filledFilter.idJobType = "null"
    if (!this.filledFilter.permitCode) {
      this.filledFilter.permitCode = "DOB";
    }
    this.reloadAdvanceSearch.emit(this.filledFilter)
    this.modalRefAdvanceSearch.hide()
  }

  clearSearch() {
    this.filledFilter = []
    this.filledFilter.permitCode = "DOB";
    this.filledFilter.status = "1";
    this.filledFilter.expiresFromDate = moment(new Date()).format("MM/DD/YYYY");
    this.filledFilter.expiresToDate = moment(new Date()).add(14, 'days').format("MM/DD/YYYY");
    this.modalRefAdvanceSearch.hide()
    this.reloadAdvanceSearch.emit(this.filledFilter)
  }

  setJobsPerStatus() {
    if (this.filter.status && this.jobList && this.jobList.length > 0) {
      let filteredJobList = this.jobList.filter((x: any) => x.status == this.filter.status);
      this.jobList = filteredJobList;
    }
  }

  setResponsibility() {
    if (this.filter.permitCode !== "DOB") {
      this.filter.idResponsibility = "";
      this.filter.responsibility = [];
    }
    if (this.filter.permitCode == "DOB") {
      this.filter.responsibility = [
        {
          "id": 1,
          "description": "RPO",
          "itemName": "RPO"
        },
        {
          "id": 2,
          "description": "Other",
          "itemName": "Other"
        }
      ];
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
    if (forModule == 'pm') {
      this.filter['projectManager'] = this.filter['projectManager'].filter((x: any) => x.id != item.id);
    }
    if (forModule == 'borough') {
      this.filter['borough'] = this.filter['borough'].filter((x: any) => x.id != item.id);
    }
    if (forModule == 'responsibility') {
      this.filter['responsibility'] = this.filter['responsibility'].filter((x: any) => x.id != item.id);
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
    if (forModule == 'borough') {
      items.forEach((borough: number) => {
        this.filter['borough'] = this.filter['borough'].filter((x: any) => x.id != borough);
      })
    }
    if (forModule == 'responsibility') {
      items.forEach((borough: number) => {
        this.filter['responsibility'] = this.filter['responsibility'].filter((x: any) => x.id != borough);
      })
    }
    if (forModule == 'pm') {
      items.forEach((pm: number) => {
        this.filter['projectManager'] = this.filter['projectManager'].filter((x: any) => x.id != pm);
      })
    }
  }

  save() {
    //TODO ng12
  }

}