import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { borough } from '../../../types/borough';
import { BoroughServices } from '../../../services/borough.services';
import { Employee } from '../../../types/employee';
import { EmployeeServices } from '../../employee/employee.services';
import { JobServices } from '../job.services';
import { Contact } from '../../../types/contact';
import { Company } from '../../../types/company';
import { ContactServices } from '../../contact/contact.services';
import { CompanyServices } from '../../company/company.services';
import { ApplicationTypeServices } from '../../applicationtype/applicationType.services';
import { Router } from '@angular/router';

import * as _ from 'underscore';

declare const $: any

@Component({
  selector: '[form-advance-search]',
  templateUrl: './formAdvanceSearch.component.html'
})
/**
 * This component contains all function that are used in FormAdvanceSearchComponent
 * @class FormAdvanceSearchComponent
 */

export class FormAdvanceSearchComponent {
  @Input() modalRefAdvanceSearch: BsModalRef
  @Input() reloadAdvanceSearch: Function
  @Input() idCompany: number
  @Input() reload: Function
  @Input() filledFilter: any
  @Input() isSearchFromAddress: boolean


  boroughs: borough[] = []
  private selectUndefinedOptionValue: any
  private employee: Employee[] = []
  loading: boolean = false
  filter: any
  contacts: Contact[] = []
  companies: Company[] = []
  private contactList: any
  employeeList: any
  agencyDDSettings: any
  agencies: any
  public projectStatusList: any = []
  public littleEList: any = []
  public holidayEmbargoList: any = []
  public isLandmarkList: any = []
  top: any;

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private boroughServices: BoroughServices,
    private employeeServices: EmployeeServices,
    private jobServices: JobServices,
    private contactServices: ContactServices,
    private companyServices: CompanyServices,
    private applicationTypeServices: ApplicationTypeServices
  ) {
    this.projectStatusList = [
      {id: this.selectUndefinedOptionValue, description: 'All'},
      {id: 1, description: 'In Progress'},
      {id: 2, description: 'On Hold'},
      {id: 3, description: 'Completed'}
    ]
    this.littleEList = [
      {id: this.selectUndefinedOptionValue, description: 'All'},
      {id: true, description: 'Yes'},
      {id: false, description: 'No'}
    ]
    this.holidayEmbargoList = [
      {id: this.selectUndefinedOptionValue, description: 'All'},
      {id: true, description: 'Yes'},
      {id: false, description: 'No'}
    ]
    this.isLandmarkList = [
      {id: this.selectUndefinedOptionValue, description: 'All'},
      {id: true, description: 'Yes'},
      {id: false, description: 'No'}
    ]
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    document.title = 'Projects'
    if (this.filledFilter) {
      this.filter = this.filledFilter
    }
    this.getBoroughs();
    this.getAllEmployee();
    this.getCompanies();
    this.setReferredContacts();
    this.getAgencyDropDown().then((r: any) => {
      if (typeof this.filter['idJobTypes'] != 'undefined' && this.filter['idJobTypes'] != '') {
        const dataToSplit = this.filter['idJobTypes'].split('-').map(Number)
        this.filter['agencies'] = this.agencies.filter((f: any) => dataToSplit.includes(f.id));
      }
    });

    this.agencyDDSettings = {
      singleSelection: false,
      text: "Select",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: false,
      classes: "myclass custom-class",
      badgeShowLimit: 1
    }
  }

  /**
   * This method will get agency options for multi select dropdown
   * @method getAgencyDropDown
   */
  getAgencyDropDown() {
    return new Promise((resolve, reject) => {
      this.applicationTypeServices.getAllApplicationTypesDD().subscribe(r => {
        if (r && r.length > 0) {
          this.agencies = r;
          resolve(null)
        }
      }, e => {
        reject();
      });
    });
  }

  /**
   *  Get all dropdown data from
   * @method getBoroughs
   */
  private getBoroughs() {
    if (!this.boroughs.length) {
      this.boroughServices.getDropdownData().subscribe(r => {
        this.boroughs = _.sortBy(r, "description")
      })
    }
  }

  /**
   *  Get all dropdown data from
   * @method getAllEmployee
   */
  private getAllEmployee() {
    if (!this.employee.length) {
      this.employeeServices.getAllEmployee().subscribe(employeeData => {
        let tmpEmployee = _.sortBy(employeeData.data, function (i: any) {
          return i.firstName.toLowerCase();
        });
        this.employeeList = []
        tmpEmployee.forEach((data: any) => {
          this.employeeList.push({id: data.id, description: data.firstName + " " + data.lastName} as any);
        })
      })
    }
  }

  /**
   * This method is used to set contact details
   * @method setReferredContacts
   */
  private setReferredContacts(comp?: string, editTime?: number) {
    this.loading = true;
    let companyId: number;
    companyId = -1;
    var idrefcomp = this.filter['idReferredByCompany'];
    if (idrefcomp != undefined && idrefcomp != null) {
      companyId = idrefcomp;
    }
    if (!this.contacts.length) {
      this.contactServices.getrfpContactDropdown().subscribe(r => {
        if (r && r.length > 0) {
          this.contacts = _.sortBy(r, function (i) {
            return i['itemName'].toLowerCase();
          });
          if (this.filter['idReferredByCompany']) {
            this.contacts = this.contacts.filter(x => x.idCompany == this.filter['idReferredByCompany']);
          }
          this.loading = false;
        } else {
          this.contacts = [];
        }
      })
    }
  }

  /**
   * This method is used to set contact details for referred by
   * @method setContacts
   */
  setContactsreferred(comp?: string, editTime?: number) {
    this.contacts = this.contacts.filter(x => x.idCompany == this.filter['idReferredByCompany']);
  }


  /**
   *  Get all dropdown data from
   * @method getContacts
   */
  private getContacts() {
    if (!this.contacts.length) {
      this.contactServices.getCotactData().subscribe(r => {
        let tmpContact = _.sortBy(r.data, function (i: any) {
          return i.firstName.toLowerCase();
        });
        this.contactList = []
        tmpContact.forEach((data: any) => {
          this.contactList.push({id: data.id, description: data.firstName + " " + data.lastName} as any);
        })
      })
    }
  }


  /**
   *  Get all dropdown data from
   * @method getCompanies
   */
  private getCompanies() {
    if (!this.companies.length) {
      this.companyServices.getCompanyData().subscribe(r => {
        this.companies = _.sortBy(r.data, function (i: any) {
          return i.name.toLowerCase();
        });
      })
    }

  }

  /**
   * This method is used for filter/search records from datatable
   * @method searchJobs
   * @param {boolean} clearSearch?? type any which contains string that can be filtered from datatable
   */
  searchJobs(clearSearch?: boolean) {

    if (clearSearch) {
      this.filter = []
      this.filter['onlyMyJobs'] = 'false'
    } else {
      this.filter['onlyMyJobs'] = 'false'
    }

    if (this.filter['agencies'] && this.filter['agencies'].length > 0) {
      let tempIdJobTypes: any = '';
      let ctr = 0;
      for (let i = 0; i < this.filter['agencies'].length; i++) {
        if (tempIdJobTypes) {
          tempIdJobTypes += "-" + this.filter['agencies'][i].id;
        } else {
          tempIdJobTypes += this.filter['agencies'][i].id;
        }
        ctr++;
      }
      if (ctr == this.filter['agencies'].length) {
        this.filter['idJobTypes'] = tempIdJobTypes;
      }
    }
    delete this.filter['agencies']
    if (this.isSearchFromAddress && clearSearch) {
      this.isSearchFromAddress = false
      this.router.navigate(['/jobs'])
    }
    this.reloadAdvanceSearch(this.filter)
    this.modalRefAdvanceSearch.hide()
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
  OnItemDeSelect(item: any) {
    this.filter['agencies'] = this.filter['agencies'].filter((x: any) => x.id != item.id);
  }

  save() {
    //TODO ng12 upgrade
  }
}