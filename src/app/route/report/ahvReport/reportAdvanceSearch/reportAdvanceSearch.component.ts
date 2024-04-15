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
  selector: '[ahvreport-status-advance-search]',
  templateUrl: './reportAdvanceSearch.component.html'
})
/**
* This component contains all function that are used in AfterHourVarianceAdvanceSearchComponent
* @class AfterHourVarianceAdvanceSearchComponent
*/

export class AfterHourVarianceAdvanceSearchComponent {
  @Input() modalRefAdvanceSearch: BsModalRef
  @Input() reload: Function
  @Input() filledFilter: any
  @Output() reloadAdvanceSearch = new EventEmitter<any>()


   filter: any
   companies: any
   dropdownJobListSettings: any = {};
   dropdownJobCompanySettings: any = {};
   dropdownApplicantCompanySettings: any = {};
   dropdownTypeSettings: any = {};
   loading: boolean = false
   jobList: any = []
  private contacts: any = []
  private applicationTypesList: any = []
  private applicationStatusList: any = [];
  private projectManagerList: any = [];
   applicantCompanies: any = []
   typeList: any = []

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
    document.title = 'AHV Report'
    this.typeList = [
      { id: 'initial', itemName: 'Initial' },
      { id: 'renewal', itemName: 'Renewal' },
    ]
    if (this.filledFilter) {
      this.filter = this.filledFilter
      if (!this.filter.type) {
        this.filter.type = "null";
      }
      if (!this.filter.expiresFromDate) {
        this.filter.expiresFromDate = moment(new Date()).subtract(30, 'days').format("MM/DD/YYYY");
      }
      if (!this.filter.expiresToDate) {
        this.filter.expiresToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
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
    this.dropdownTypeSettings = {
      singleSelection: false,
      text: "Type",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 1,
      classes: "myclass custom-class",
      tagToBody: false
    };
    this.dropdownJobCompanySettings = {
      singleSelection: false,
      text: "Job Company",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 1,
      classes: "myclass custom-class",
      tagToBody: false
    };
    this.dropdownApplicantCompanySettings = {
      singleSelection: false,
      text: "Applicant Company",
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
    if (typeof this.filter.type != 'undefined' && this.filter.type != '') {
      this.filter.ahvtype = []
      const dataToSplit = this.filter.type.toString().split('-').map(String)
      this.filter.ahvtype = this.typeList.filter((f: any) => dataToSplit.includes(f.id));
    }
    // For Company
    this.companyServices.getCompanyDropdown().subscribe(r => {
      this.companies = r
      this.applicantCompanies = r
      if (typeof this.filter.idJobCompany != 'undefined' && this.filter.idJobCompany != '') {
        this.filter.jobCompanyId = []
        const dataToSplit = this.filter.idJobCompany.toString().split('-').map(Number)
        this.filter.jobCompanyId = this.companies.filter((f: any) => dataToSplit.includes(f.id));
      }
      if (typeof this.filter.idApplicantCompany != 'undefined' && this.filter.idApplicantCompany != '') {
        this.filter.applicantCompanyId = []
        const dataToSplit = this.filter.idApplicantCompany.toString().split('-').map(Number)
        this.filter.applicantCompanyId = this.applicantCompanies.filter((f: any) => dataToSplit.includes(f.id));
      }
      this.loading = false
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
  * This method is used for filter/search records from datatable
  * @method searchJobs
  * @param {boolean} clearSearch? type any which contains string that can be filtered from datatable
  */
  searchJobs(clearSearch?: boolean) {
    this.filledFilter = this.filter

    // For Type
    if (this.filter.ahvtype && this.filter.ahvtype.length > 0) {
      let tempType: any = '';
      let ctr = 0;
      for (let i = 0; i < this.filter.ahvtype.length; i++) {
        if (tempType) {
          tempType += "-" + this.filter.ahvtype[i].id;
        } else {
          tempType = this.filter.ahvtype[i].id;
        }
        ctr++;
      }
      if (ctr == this.filter.ahvtype.length) {
        this.filledFilter.type = tempType;
        delete this.filledFilter.ahvtype;
      }
    } else {
      delete this.filledFilter.ahvtype;
      delete this.filledFilter.type;
    }
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
    if (this.filter.applicantCompanyId && this.filter.applicantCompanyId.length > 0) {
      let tempApplicantCompany: any = '';
      let ctr = 0;
      for (let i = 0; i < this.filter.applicantCompanyId.length; i++) {
        if (tempApplicantCompany) {
          tempApplicantCompany += "-" + this.filter.applicantCompanyId[i].id;
        } else {
          tempApplicantCompany = this.filter.applicantCompanyId[i].id;
        }
        ctr++;
      }
      if (ctr == this.filter.applicantCompanyId.length) {
        this.filledFilter.idApplicantCompany = tempApplicantCompany;
        delete this.filledFilter.applicantCompanyId;
      }
    } else {
      delete this.filledFilter.idApplicantCompany;
      delete this.filledFilter.applicantCompanyId;
    }

    if (this.filter.jobCompanyId && this.filter.jobCompanyId.length > 0) {
      let tempJobComapany: any = '';
      let ctr = 0;
      for (let i = 0; i < this.filter.jobCompanyId.length; i++) {
        if (tempJobComapany) {
          tempJobComapany += "-" + this.filter.jobCompanyId[i].id;
        } else {
          tempJobComapany = this.filter.jobCompanyId[i].id;
        }
        ctr++;
      }
      if (ctr == this.filter.jobCompanyId.length) {
        this.filledFilter.idJobCompany = tempJobComapany;
        delete this.filledFilter.jobCompanyId;
      }
    } else {
      delete this.filledFilter.jobCompanyId;
      delete this.filledFilter.idJobCompany;
    }


    this.reloadAdvanceSearch.emit(this.filledFilter)
    this.modalRefAdvanceSearch.hide()
  }

  clearSearch() {
    this.filledFilter = []
    this.filledFilter.expiresFromDate = moment(new Date()).subtract(30, 'days').format("MM/DD/YYYY");
    this.filledFilter.expiresToDate = moment(new Date()).add(30, 'days').format("MM/DD/YYYY");
    this.modalRefAdvanceSearch.hide()
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
    if (forModule == 'jobId') {
      this.filter['jobId'] = this.filter['jobId'].filter((x: any) => x.id != item.id);
    }
    if (forModule == 'ahvtype') {
      this.filter['ahvtype'] = this.filter['ahvtype'].filter((x: any) => x.id != item.id);
    }
    if (forModule == 'jobCompanyId') {
      this.filter['jobCompanyId'] = this.filter['jobCompanyId'].filter((x: any) => x.id != item.id);
    }
    if (forModule == 'applicantCompanyId') {
      this.filter['applicantCompanyId'] = this.filter['applicantCompanyId'].filter((x: any) => x.id != item.id);
    }
  }

  /**
      * deselect on all in multiselect dropdown
      * @method onDeSelectAll
      * @param {any} items deselected all items
      */
  onDeSelectAll(items: any, forModule: string) {
    if (forModule == 'jobId') {
      items.forEach((jobId: number) => {
        this.filter['jobId'] = this.filter['jobId'].filter((x: any) => x.id != jobId);
      })
    }
    if (forModule == 'ahvtype') {
      items.forEach((ahvtype: number) => {
        this.filter['ahvtype'] = this.filter['ahvtype'].filter((x: any) => x.id != ahvtype);
      })
    }
    if (forModule == 'jobCompanyId') {
      items.forEach((contactId: number) => {
        this.filter['jobCompanyId'] = this.filter['jobCompanyId'].filter((x: any) => x.id != contactId);
      })
    }
    if (forModule == 'applicantCompanyId') {
      items.forEach((appTypeId: number) => {
        this.filter['applicantCompanyId'] = this.filter['applicantCompanyId'].filter((x: any) => x.id != appTypeId);
      })
    }
  }

  save() {
    //TODO: ng12
  }
}