import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

import { BsModalService } from 'ngx-bootstrap/modal';
import { rfpAddress } from '../../../types/rfpAddress';
import { rfp } from '../../../types/rfp';
import { AddressTypeServices } from '../../../services/addressType.services';
import { AddressType } from '../../../types/address';
import { SiteInformationServices } from '../../addRfp/siteInformation/siteInformation.services';
import { CompanyDTO, Company } from '../../../types/company';
import { CompanyServices } from '../../company/company.services';
import { Employee } from '../../../types/employee';
import { Contact } from '../../../types/contact';
import { EmployeeServices } from '../../employee/employee.services';
import { Job } from '../../../types/job';
import { Message } from '../../../app.messages';
import { ContactTitleServices } from '../../../services/contactTitle.services';
import { ContactTitle } from '../../../types/contactTitle';
import { BoroughServices } from '../../../services/borough.services';
import { borough } from '../../../types/borough';
import { JobServices } from '../job.services';
import { equals, onlyThisProperty } from '../../../utils/utils';
import { PipeTransform, Pipe } from '@angular/core';
import { JobTypes } from '../../../types/jobTypes';
import { JobTypesServices } from '../../../services/jobTypes.services';
import { ContactTypeServices } from '../../../services/contactType.services';

import { ContactServices } from '../../contact/contact.services';
import * as _ from 'underscore';
import * as moment from 'moment';
import { convertUTCDateToLocalDate } from '../../../utils/utils';
import { constantValues, SharedService } from '../../../app.constantValues';
import { JobCommonComponent } from '../../../components/jobcomponent/job.component';
import { JobSharedService } from '../JobSharedService';
import { AppComponent } from '../../../app.component';
import { JobApplicationService } from '../../../services/JobApplicationService.services';

declare const $: any


@Component({
  providers: [JobCommonComponent],
  selector: '[form-job]',
  templateUrl: './formJob.component.html'
})
/**
 * This component contains all function that are used in FormJobComponent
 * @class FormJobComponent
 */
export class FormJobComponent implements OnInit {
  @Input() modalRef: BsModalRef // add adress modal 
  @Input() modalRefJob: BsModalRef // Job Modal
  @Input() rfpObj: rfp
  @Input() job: Job
  @Input() onSave: Function
  @Input() isAddressDisable: boolean
  @Input() isReAssign: boolean
  @Input() fromComp: boolean
  @Input() fromRFP: boolean
  @Input() alreadyGetLinkedJob: Function
  @Input() isFromListing: boolean
  @Input() jobReload: Function

  /**
   * addJobForm add/edit form
   * @property addJobForm
   */
  @ViewChild('addJobForm', {static: false}) form: any;

  /**
   * formJobAddNewAddress add/edit form
   * @property formJobAddNewAddress
   */
  @ViewChild('formJobAddNewAddress', {static: false}) formAddAddress: TemplateRef<any>

  /**
   * viewAddress add/edit form
   * @property viewAddress
   */
  @ViewChild('viewAddress', {static: false})
  private viewAddress: TemplateRef<any>

  rec: Job
  rfpAddressList: rfpAddress[] = []

  private rfpAddressRec: rfpAddress
  private addressTypes: AddressType[] = []
  loading: boolean = false
  companies: Company[] = []
  projectManager: Employee[] = []
  projectCoordinator: Employee[] = []
  private signOffCoordinator: Employee[] = []
  contacts: Contact[] = []
  contactsList: Contact[] = []
  private contactTitles: ContactTitle[] = []
  contactType: any[] = []
  boroughs: borough[] = []
  private applications: any[]
  private jobTypes: any[]
  jobApplicationTypes: any[]
  errorMessage: any
  private isEnableStatus: boolean
  private selectUndefinedOptionAddressValue: any;
  selectUndefinedOptionBoroughValue: any;
  private selectUndefinedOptionCompanyValue: any;
  private selectUndefinedOptionContactTypeValue: any;
  private selectUndefinedOptionContactValue: any;
  private selectUndefinedOptionPMValue: any;
  private selectUndefinedOptionPCValue: any;
  private selectUndefinedOptionSCValue: any;
  applicationsCtr: number = 0
  touchedType: boolean = false
  showDot: boolean = false
  showDob: boolean = false
  showViolation: boolean = true
  showDep: boolean = false
  dotProjectTeam: any = []
  dobProjectTeam: any = []
  violationProjectTeam: any = []
  depProjectTeam: any = []
  dobdropdownSettings: any = {};
  dotdropdownSettings: any = {};
  depdropdownSettings: any = {};
  violationdropdownSettings: any = {};
  modifiedBy: any
  private gotCompanyID: boolean = false;

  constructor(
    private comp: JobCommonComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private addressTypeServices: AddressTypeServices,
    private SiteInformationServices: SiteInformationServices,
    private companyService: CompanyServices,
    private employeeService: EmployeeServices,
    private contactTitlesServices: ContactTitleServices,
    private ContactTypeServices: ContactTypeServices,
    private boroughServices: BoroughServices,
    private jobServices: JobServices,
    private message: Message,
    private jobTypesServices: JobTypesServices,
    private contactServices: ContactServices,
    private constantValues: constantValues,
    private sharedService: SharedService,
    private appComponent: AppComponent,
    private jobApplicationService: JobApplicationService,
    private jobSharedService: JobSharedService,
  ) {
    this.errorMessage = this.message.msg;
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    $('.date').mask('00/00/0000', {})
    this.contacts = [] as Contact[]
    this.contactsList = [] as Contact[]
    this.depdropdownSettings = {
      singleSelection: false,
      text: "DEP Project Team",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      disabled: this.isReAssign,
      badgeShowLimit: 1
    };
    this.dobdropdownSettings = {
      singleSelection: false,
      text: "DOB Project Team",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      disabled: this.isReAssign,
      badgeShowLimit: 1,
      tagToBody: false
    };
    this.dotdropdownSettings = {
      singleSelection: false,
      text: "DOT Project Team",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      disabled: this.isReAssign,
      badgeShowLimit: 1,
      tagToBody: false
    };
    this.violationdropdownSettings = {
      singleSelection: false,
      text: " Violation Project Team",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      disabled: this.isReAssign,
      badgeShowLimit: 1,
      tagToBody: false
    };
    this.rec = {} as Job
    console.log(this.rec)
    this.rec = cloneDeep(this.job)
    console.log(this.rec)
    if (this.rec && !this.rfpObj) {
      if (this.rec.idCompany) {
        this.setContacts();
        this.gotCompanyID = true;
      } else {
        this.setContacts();
        this.gotCompanyID = false;
      }


      if (this.rec.lastModifiedByEmployeeName) {
        this.modifiedBy = this.rec.lastModifiedByEmployeeName;
      }
      if (this.rec.lastModiefiedDate) {
        this.modifiedBy += " on " + moment(this.rec.lastModiefiedDate).format('MM/DD/YYYY hh:mm A');
      }
    }

    //set selected application type dropdown start
    if (this.rec.dobProjectTeam && this.rec.dobProjectTeam.length > 0) {
      this.dobProjectTeam = []
      this.rec.dobProjectTeam.forEach((element: any) => {
        this.dobProjectTeam.push(element)
      });
    }
    if (this.rec.depProjectTeam && this.rec.depProjectTeam.length > 0) {
      this.depProjectTeam = []
      this.rec.depProjectTeam.forEach((element: any) => {
        this.depProjectTeam.push(element)
      });
    }
    if (this.rec.violationProjectTeam && this.rec.violationProjectTeam.length > 0) {
      this.violationProjectTeam = []
      this.rec.violationProjectTeam.forEach((element: any) => {
        this.violationProjectTeam.push(element)
      });
    }
    if (this.rec.dotProjectTeam && this.rec.dotProjectTeam.length > 0) {
      this.dotProjectTeam = []
      this.rec.dotProjectTeam.forEach((element: any) => {
        this.dotProjectTeam.push(element)
      });
    }
    //set selected application type dropdown end

    if (!this.rec.startDate) {
      this.rec.startDate = moment().format(this.constantValues.DATEFORMAT)

    }
    //Job create from RFP then fill all data from RFP
    if (this.rfpObj) {
      this.setJobFromRFP(this.rfpObj)
    }

    if (this.rec) {
      if (this.rec.id) {
        this.isEnableStatus = true
        if (this.rec.startDate) {
          this.rec.startDate = moment(convertUTCDateToLocalDate(new Date(this.rec.startDate))).format(this.constantValues.DATEFORMAT);
        }
        if (this.rec.endDate) {
          this.rec.endDate = moment(convertUTCDateToLocalDate(new Date(this.rec.endDate))).format(this.constantValues.DATEFORMAT);
        }

      } else {
        this.rec.status = 1
        this.isEnableStatus = false
      }
      if (this.rec.jobApplicationTypes && this.rec.jobApplicationTypes.length > 0) {
        this.applicationsCtr = this.rec.jobApplicationTypes.length
      }

      this.removeJobType(3, true)
    }

    this.getBoroughs();
    this.getJobApplicationTypes();
    this.getCompanies()
    this.getAddress();
    this.getEmployee();
    this.getContactTypes();
    this.setContactsreferrel();


    this.applications = [{dob: 0}, {dot: 1}, {violation: 2}, {dep: 3}]


  }

  /**
   * This method is used to set job Form data
   * @method setJobFromRFP
   * @param {rfp} rfpObj rfpObj is used as a RFP object
   */
  private setJobFromRFP(rfpObj: rfp) {
    this.rec.idRfp = rfpObj.id
    this.rec.idRfpAddress = rfpObj.idRfpAddress
    this.rec.idBorough = rfpObj.idBorough
    this.rec.houseNumber = rfpObj.houseNumber
    this.rec.streetNumber = rfpObj.streetNumber
    this.rec.floorNumber = rfpObj.floorNumber
    this.rec.apartment = rfpObj.apartment
    this.rec.specialPlace = rfpObj.specialPlace
    this.rec.block = rfpObj.block
    this.rec.lot = rfpObj.lot
    this.rec.hasLandMarkStatus = rfpObj.hasLandMarkStatus
    this.rec.hasEnvironmentalRestriction = rfpObj.hasEnvironmentalRestriction
    this.rec.hasOpenWork = rfpObj.hasOpenWork
    this.rec.idCompany = rfpObj.idCompany
    this.rec.idContact = rfpObj.idContact
    this.rec.projectDescription = rfpObj.projectDescription
    this.rec.idReferredByCompany = rfpObj.idReferredByCompany
    this.rec.idReferredByContact = rfpObj.idReferredByContact
    if (this.rec.idCompany) {
      this.setContacts();
      this.gotCompanyID = true;
    } else {
      this.setContacts();
      this.gotCompanyID = false;
    }
  }

  /**
   * This method is used to open modal popup for _openModalFormAddApplication
   * @method _openModalFormAddApplication
   * @param {any} template type which contains template of create/edit module
   */
  private _openModalFormAddApplication(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-new-address'})
  }

  /**
   * This method is used to open modal popup for openModalJobAddNewAddress
   * @method openModalJobAddNewAddress
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   */
  private openModalJobAddNewAddress(template: TemplateRef<any>, id?: number) {
    this._openModalFormAddApplication(template)
  }

  /**
   * This method is used to open modal popup for _openModalAddAdress
   * @method _openModalAddAdress
   * @param {any} template type which contains template of create/edit module
   */
  private _openModalAddAdress(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-new-address'})
  }

  /**
   * This method is used to open modal popup for openModalAddAdress
   * @method openModalAddAdress
   * @param {any} template type which contains template of create/edit module
   * @param {number} id?? it is optional which contains id if record is in edit mode
   */
  openModalAddAdress(template: TemplateRef<any>, id?: number) {
    this._openModalAddAdress(template)
  }

  /**
   * This method is used to open modal popup for view address modal
   * @method viewAddressModal
   * @param {any} template type which contains template of create/edit module
   * @param {number} id?? it is optional which contains id if record is in edit mode
   */
  viewAddressModal(template: TemplateRef<any>, id?: number) {
    this.modalRef = this.modalService.show(template, {class: 'modal-new-address'})
  }


  /**
   * This method is used to set address data
   * @method setAddressData
   */
  setAddressData(change?: boolean) {
    let addressDetail = this.rfpAddressList.filter(x => x.id == this.rec.idRfpAddress)[0];
    if (addressDetail) {
      this.rec.idRfpAddress = addressDetail.id
      this.rec.houseNumber = addressDetail.houseNumber;
      this.rec.streetNumber = addressDetail.street;
      if (change) {
        this.rec.block = addressDetail.block ? addressDetail.block : '';
        this.rec.lot = addressDetail.lot ? addressDetail.lot : '';
      } else {
        this.rec.block = this.rec.block ? this.rec.block : addressDetail.block;
        this.rec.lot = this.rec.lot ? this.rec.lot : addressDetail.lot;
      }

      this.rec.hasLandMarkStatus = addressDetail.isLandmark;
      this.rec.hasEnvironmentalRestriction = addressDetail.isLittleE;
      this.rec.idBorough = addressDetail.idBorough;
    } else {
      this.rec.idRfpAddress = null;
      this.rec.houseNumber = '';
      this.rec.streetNumber = '';
      this.rec.floorNumber = '';
      this.rec.apartment = '';
      this.rec.specialPlace = '';
      if (change) {
        this.rec.block = '';
        this.rec.lot = '';
      } else {
        this.rec.block = this.rec.block ? this.rec.block : '';
        this.rec.lot = this.rec.lot ? this.rec.lot : '';
      }

      this.rec.hasLandMarkStatus = false;
      this.rec.hasEnvironmentalRestriction = false;
      this.rec.idBorough = null;
    }
  }

  /**
   * This method is used to set address type
   * @method setAddressType
   */
  setAddressType() {
    this.rfpAddressRec.addressType = this.addressTypes.filter(x => x.id == this.rfpAddressRec.idAddressType)[0];
  }

  /**
   *  Get all dropdown data from getCompanies
   * @method getCompanies
   */
  private getCompanies() {
    if (!this.companies.length) {
      this.companyService.getCompanyDropdown().subscribe(r => {
        this.companies = _.sortBy(r, "itemName")
      })
    }
  }

  /**
   * Set Address and other job information while add new address from job form
   * @method setAddressInDropDownList
   * @param {any} addressAndJobInfo Object of Address and JobObject
   */
  setAddressInDropDownList(addressAndJobInfo: any) {
    this.rfpAddressList = []
    this.SiteInformationServices.getRfpAddressDropdown().subscribe(r => {
      this.rfpAddressList = r;
      this.rec.idRfpAddress = addressAndJobInfo.jobObject.idRfpAddress
      this.rec.houseNumber = addressAndJobInfo.jobOject.houseNumber
      this.rec.streetNumber = addressAndJobInfo.jobOject.streetNumber
      this.rec.specialPlace = '';
      this.rec.block = addressAndJobInfo.jobOject.block
      this.rec.lot = addressAndJobInfo.jobOject.lot
      this.rec.hasLandMarkStatus = addressAndJobInfo.jobOject.hasLandMarkStatus
      this.rec.hasEnvironmentalRestriction = addressAndJobInfo.jobOject.hasEnvironmentalRestriction
      this.rec.idBorough = addressAndJobInfo.jobOject.idBorough
    })
  }

  /**
   *  Get all dropdown data from getAddress
   * @method getAddress
   */
  private getAddress() {
    this.SiteInformationServices.getRfpAddressDropdown().subscribe(r => {
      this.rfpAddressList = r;


      // while getting address if we are getting address than we are setting the data
      if (this.rec.idRfpAddress) {
        this.setAddressData()
      }
      this.rfpAddressList.forEach((data: any) => {
        if (data.idBorough) {
          data.borough = this.boroughs.filter(x => x.id == data.idBorough)[0].description
        }
        let descAddress = data.houseNumber + " " + (data.street ? data.street + "," : "") + " " + (data.borough ? data.borough : "") + " " + (data.zipCode ? "," + data.zipCode : "")
        data.itemName = descAddress
      })
    })
  }

  /**
   * This method converts string date into date object
   * @method getTheDateObject
   * @param {any} date String Date
   */
  getTheDateObject(date: any) {
    if (this.rec.startDate != null && this.rec.endDate != null) {
      if (date != null || date != '') {
        return new Date(date)
      }
    }


  }

  /**
   * This method is used to set contact details
   * @method setContacts
   */
  setContacts(comp?: string, editTime?: number) {
    if (comp) {
      if (!this.rec.idCompany) {
        this.rec.idContact = null;
        this.rec.idJobContactType = null;
      }
    }
    let companyId: number;
    if (this.rec.idCompany) {
      companyId = this.rec.idCompany
    } else if (!this.gotCompanyID && (this.contacts.length == 0) || this.rec.idCompany == null) {
      companyId = -1
    }
    if (this.rec.id && this.rec.idContact && !editTime) {
      this.companyService.getContactOfComDD(companyId).subscribe(r => {
        if (r && r.length > 0) {
          this.contacts = _.sortBy(r, function (i) {
            return i['itemName'].toLowerCase();
          });
        } else {
          this.contacts = [];
        }
        if (!this.job.idContact && !this.rfpObj) { // while edit job already selected contact otherwise reset contacts list
          // this.rec.idContact = null;
        }
      })
    } else {
      this.companyService.getActiveContactOfComDD(companyId).subscribe(r => {
        if (r && r.length > 0) {
          this.contacts = _.sortBy(r, function (i) {
            return i['itemName'].toLowerCase();
          });
        } else {
          this.contacts = [];
        }
        if (!this.job.idContact && !this.rfpObj) { // while edit job already selected contact otherwise reset contacts list
          // this.rec.idContact = null;
        }
      })
    }

  }

  /**
   * This method is used to set contact details
   * @method setContactsreferrel
   */
  setContactsreferrel(comp?: string, editTime?: number) {
    if (comp) {
      if (!this.rec.idReferredByCompany) {
        this.rec.idReferredByContact = null;
      }
    }
    let companyId: number;
    if (this.rec.idReferredByCompany) {
      companyId = this.rec.idReferredByCompany
    } else if (!this.gotCompanyID && (this.contactsList.length == 0) || this.rec.idReferredByCompany == null) {
      companyId = -1
    }
    if (this.rec.id && this.rec.idReferredByContact && !editTime) {
      this.contactServices.getrfpContactDropdown().subscribe(r => {
        if (r && r.length > 0) {
          this.contactsList = _.sortBy(r, function (i) {
            return i['itemName'].toLowerCase();
          });
          if (this.rec.idReferredByCompany) {
            this.contactsList = this.contactsList.filter(x => x.idCompany == this.rec.idReferredByCompany);
          }
        } else {
          this.contactsList = [];
        }
        if (!this.job.idReferredByContact && !this.rfpObj) { // while edit job already selected contact otherwise reset contacts list
          // this.rec.idContact = null;
        }
      })
    } else {
      this.contactServices.getrfpContactDropdown().subscribe(r => {
        if (r && r.length > 0) {
          this.contactsList = _.sortBy(r, function (i) {
            return i['itemName'].toLowerCase();
          });
          if (this.rec.idReferredByCompany) {
            this.contactsList = this.contactsList.filter(x => x.idCompany == this.rec.idReferredByCompany);
          }
        } else {
          this.contactsList = [];
        }
        if (!this.job.idReferredByContact && !this.rfpObj) { // while edit job already selected contact otherwise reset contacts list
          // this.rec.idContact = null;
        }
      })
    }


  }


  /**
   * This method is used to set contact details for referred by
   * @method setContactsreferred
   */
  setContactsreferred(comp?: string, editTime?: number) {
    this.contactsList = this.contactsList.filter(x => x.idCompany == this.rec.idReferredByCompany);
  }


  /**
   *  Get all dropdown data from Employees
   * @method getEmployee
   */
  private getEmployee() {
    this.employeeService.getEmpDropdown().subscribe(r => {
      this.projectManager = _.sortBy(r, "itemName");
      this.projectCoordinator = _.sortBy(r, "itemName");
      this.signOffCoordinator = _.sortBy(r, "itemName");
    })
  }


  /**
   * Get all dropdown data from Contact Titles
   * @method getContactTitles
   */
  private getContactTitles() {
    if (!this.contactTitles.length) {
      this.contactTitlesServices.get().subscribe(r => {
        this.contactTitles = r
      });
    }
  }

  /**
   *  Get all dropdown data from Contact Types
   * @method getContactTypes
   */
  private getContactTypes() {
    if (!this.contactType.length) {
      this.ContactTypeServices.getContactTypeDD().subscribe(r => {
        this.contactType = _.sortBy(r, "itemName")
      });
    }
  }

  /**
   * Get all dropdown data from Boroughs
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
   * This method is used to remove job type
   * @method removeJobType
   * @param {number} jobId jobid is Id of job @param {number} jobId jobid is Id of job
   * @param {any} event event is an object of job type
   */
  removeJobType(jobId: number, event: any) {
    console.log("run removeJobType")
    this.touchedType = true
    if (event?.target?.checked == false) {
      if (jobId == 1) {
        this.showDob = false
      }
      if (jobId == 2) {
        this.showDot = false
      }
      if (jobId == 3) {
        this.showViolation = false
      }
      if (jobId == 4) {
        this.showDep = false
      }
      this.applicationsCtr--
      delete this.rec.jobApplicationTypes[jobId]
    } else {
      if (jobId == 1) {
        this.showDob = true
      }
      if (jobId == 2) {
        this.showDot = true
      }
      if (jobId == 3) {
        this.showViolation = true
      }
      if (jobId == 4) {
        this.showDep = true
      }
      this.applicationsCtr++
      console.log(this.rec.jobApplicationTypes)
    }
  }

  /**
   * This method is used to get all job application types
   * @method getJobApplicationTypes
   */
  private getJobApplicationTypes() {
    this.loading = true
    this.jobApplicationService.getApplicationTypeDD(null).subscribe(r => {
      this.jobApplicationTypes = r.filter(x => x.idParent == null);
      console.log('this.jobApplicationTypes', this.jobApplicationTypes)
      // While edit set application checkbox selected
      if (this.rec.jobApplicationTypes) {
        let tmpAppTypes = this.rec.jobApplicationTypes
        this.rec.jobApplicationTypes = []
        for (let detail of tmpAppTypes) {
          if (detail) {
            if (detail.id == 1) {
              this.showDob = true
            }
            if (detail.id == 2) {
              this.showDot = true
            }
            if (detail.id == 3) {
              this.showViolation = true
            }
            if (detail.id == 4) {
              this.showDep = true
            }
            this.rec.jobApplicationTypes[detail.id] = detail
            console.log('this.rec.jobApplicationTypes', this.rec.jobApplicationTypes)
          }
        }
        const vm = this
        setTimeout(function () {
          $('.application-type input:checked').attr("disabled", 'disabled');
          vm.loading = false
        }, 1000)

      } else {
        this.rec.jobApplicationTypes = []
        this.jobApplicationTypes.forEach(el => {
          if (el.id == 3) {
            this.rec.jobApplicationTypes[el.id] = true
          }
          console.log(this.rec.jobApplicationTypes)
        })
        this.applicationsCtr++
        this.loading = false
      }
    })
  }

  /**
   * This method is used to save record
   * @method saveJob
   */
  saveJob() {
    this.loading = true
    if (this.rec.startDate) {
      this.rec.startDate = $('#startDates').val();
    }
    if (this.rec.endDate) {
      this.rec.endDate = $('#endDates').val();
    }
    let requestData = cloneDeep(this.rec)
    let typesArr = []
    for (let type in requestData.jobApplicationTypes) {
      if (typeof requestData.jobApplicationTypes[type] != "undefined") {
        typesArr.push(parseInt(type))
      }
    }

    if (this.dobProjectTeam) {
      requestData.dobProjectTeam = []
      this.dobProjectTeam.forEach((element: any) => {
        requestData.dobProjectTeam.push(element.id)
      });
    }

    if (this.dotProjectTeam) {
      requestData.dotProjectTeam = []
      this.dotProjectTeam.forEach((element: any) => {
        requestData.dotProjectTeam.push(element.id)
      });
    }

    if (this.violationProjectTeam) {
      requestData.violationProjectTeam = []
      this.violationProjectTeam.forEach((element: any) => {
        requestData.violationProjectTeam.push(element.id)
      });
    }
    if (this.depProjectTeam) {
      requestData.depProjectTeam = []
      this.depProjectTeam.forEach((element: any) => {
        requestData.depProjectTeam.push(element.id)
      });
    }
    requestData.jobApplicationTypes = typesArr
    console.log(requestData)
    if (!requestData.id) {
      this.jobServices.createJob(requestData).subscribe(r => {
        const jobObj = r as any
        if (this.onSave)
          this.onSave(jobObj, "1")
        this.toastr.success(this.errorMessage.createJobSuccess);
        this.modalRefJob.hide()
        if (this.fromComp) {
          this.comp.reload()
        }
        if (this.fromRFP) {
          this.alreadyGetLinkedJob(true);
        }
      }, e => {
        this.loading = false
      });
    } else {
      this.jobServices.updateJob(requestData.id, requestData).subscribe(r => {
        const jobObj = r as any
        if (this.onSave) {
          this.loading = true;
          this.onSave(jobObj, "2");

          if (!this.isFromListing) {
            if (typeof requestData != "undefined") {
              this.sharedService.getJobEdit.emit(requestData);
            }

            this.appComponent.setCommonJobObject(requestData.id)
          }


        }
        this.toastr.success(this.errorMessage.updateJobSuccess);
        this.modalRefJob.hide()
      }, e => {
        this.loading = false
      });
    }
  }

  /**
   * This method is used to call focus out of input element occurs
   * @method focusOutFunction
   * @param {any} e e is an object
   */
  focusOutFunction(e: any) {
    if (this.rec.jobApplicationTypes.length == 0) {
      this.applicationsCtr = 0
      this.touchedType = true
    }
  }

  /**
   * This method is used to call event when alerting user to check warning message
   * @method fireEvent
   * @param {any} e e is an object
   */
  fireEvent(event: any) {
    if (this.form.dirty) {
      if (confirm('WARNING: You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes.')) {
        this.modalRefJob.hide()
      }
    }

  }


  /**
   * Get selected item from multiselect dropdown
   * @method onItemSelect
   * @param {any} item selected item
   */
  onItemSelect(item: any) {

  }


  /**
   * Deselect item from multiselect dropdown
   * @method OnItemDeSelect
   * @param {any} item deselected item
   */
  OnItemDeSelect(item: any) {

  }

  /**
   * select on all in multiselect dropdown
   * @method onSelectAll
   * @param {any} items selected all items
   */
  onSelectAll(items: any) {

  }

  /**
   * deselect on all in multiselect dropdown
   * @method onDeSelectAll
   * @param {any} items deselected all items
   */
  onDeSelectAll(items: any) {

  }
}