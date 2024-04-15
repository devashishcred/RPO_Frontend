import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

import { DropdownWidgetItem } from '../../../components/DropdownWidget';
import { AddressTypeServices } from '../../../services/addressType.services';
import { CityServices } from '../../../services/city.services';
import { ContactLicenseTypeServices } from '../../../services/contactLicenseType.services';
import { ContactTitleServices } from '../../../services/contactTitle.services';
import { PrefixServices } from '../../../services/prefix.services';
import { StateServices } from '../../../services/state.services';
import { Company } from '../../../types/company';
import { Contact } from '../../../types/contact';
import { ContactServices } from '../../contact/contact.services';
import { CompanyServices } from '../company.services';
import { Address } from '../../../types/address';
import { UserRightServices } from '../../../services/userRight.services';
import { TaskServices } from '../../task/task.services';
import { constantValues } from '../../../app.constantValues';
import * as _ from 'underscore';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../../app.component';
const blankAvatar = "./assets/blank-avatar.jpg";
import { API_URL } from '../../../app.constants';
import { HttpClient } from '@angular/common/http';
import { Job } from '../../../types/job';
import { Message } from '../../../app.messages';
import { FilterPipe } from '../../../components/searchPipe'


declare const $: any
/**
  * This component contains all function that are used in this component
  * @class CompanyDetailComponent
  */
@Component({
  selector: '[company-detail]',
  templateUrl: './companyDetail.component.html',
  styleUrls: ['./companyDetail.component.scss']
})
export class CompanyDetailComponent implements OnInit {
  @Output() onClose = new EventEmitter<void>();

  /**
    * company form
    * @property formCompany
  */
  @ViewChild('formCompany', { static: true })
  private formCompany: TemplateRef<any>

  /**
   * contact form
   * @property formContact
   */
  @ViewChild('formContact', { static: true })
  private formContcat: TemplateRef<any>

  /**
   * Job Form
   * @property formJob
   */
  @ViewChild('formJob', { static: true })
  private formJob: TemplateRef<any>

  /**
   * Add task form
   * @property addtask
   */
  @ViewChild('addtask', { static: true })
  private addtask: TemplateRef<any>

  /**
   * Send email from company
   * @property sendemailCompany
   */
  @ViewChild('sendemailCompany', { static: true })
  private sendemailCompany: TemplateRef<any>

  /**
   * Send email from contact
   * @property sendemailContact
   */
  @ViewChild('sendemailContact', { static: true })
  private sendemailContact: TemplateRef<any>

  companyWidgetItems: DropdownWidgetItem[] = [
    { key: 7, text: 'Add Contact' },
    { key: 2, text: 'Edit Company' },
    { key: 5, text: 'Create Task' },
    { key: 4, text: 'Create Project' },
    { key: 6, text: 'Send Email' },
    { key: 1, text: 'View on BIS' },
    { key: 3, text: 'Create Proposal' },
    { key: 9, text: 'Delete Company' }
  ]
  contactWidgetItems: DropdownWidgetItem[] = [
    { key: 1, text: 'Edit Contact' },
    { key: 2, text: 'Send Email' },
    { key: 3, text: 'Create Proposal' },
    { key: 4, text: 'Create Project' },
    { key: 5, text: 'Delete Contact' }
  ]
  inActivecontactWidgetItems: DropdownWidgetItem[] = [
    { key: 1, text: 'Edit Contact' },
    { key: 5, text: 'Delete Contact' }
  ]

  private companyType: any = { 1: "Home Owners", 2: "Owner's REP", 3: "Engineer", 4: "Architect", 5: "Asbestos Investigator", 6: "DOB", 7: "DOT", 8: "DEP", 9: "FDNY", 10: "ECB", 11: "SCA", 12: "SBS", 13: "State Agencies", 14: "Property Managers", 15: "Developers", 16: "Consultants", 17: "Lobbyist", 18: "Special Inspection", 19: "1/2/3 Family", 20: "Safety Reg", 21: "Demolition", 22: "Construction", 23: "Concrete" }

  modalRef: BsModalRef
  isContact: boolean = false
  private new: boolean = true
  idCompany: number
  public rec: Company;
  public contactModal: Contact;
  public contacts: Contact[] = [{} as Contact];
  private companyTypeLayout: any = {
    specialInspection: 18
  }
  private address: Address
  private table: any

  private userAccessRight: any = {}
  //Company show hide
  private showCompanyAddBtn: string = 'hide'
  private showCompanyViewBtn: string = 'hide'
  private showCompanyDeleteBtn: string = 'hide'
  //Conact show hide
  showContactAddBtn: string = 'hide'
  private showContactViewBtn: string = 'hide'
  private showContactDeleteBtn: string = 'hide'
  //Rfp show hide
  showRfpAddBtn: string = 'hide'
  private showRfpViewBtn: string = 'hide'
  private showRfpDeleteBtn: string = 'hide'
  //Job show hide
  showJobAddBtn: string = 'hide'
  private showJobViewBtn: string = 'hide'
  private showJobDeleteBtn: string = 'hide'
  //Task show hide
  private showTaskAddBtn: string = 'hide'
  queryString: string = ''
  private showTaskViewBtn: string = 'hide'
  private showTaskDeleteBtn: string = 'hide'
  //Master show hide
  private showMasterAddBtn: string = 'hide'
  private showMasterViewBtn: string = 'hide'
  private showMasterDeleteBtn: string = 'hide'

  public ShowContact: boolean = true
  public ShowRFP: boolean = true
  public ShowJobs: boolean = true

  private addContact: string = 'hide'
  private addRfp: string = 'hide'
  private addJob: string = 'hide'
  private sub: any
  private id: number
  loading: boolean = false
  gcSelected: boolean = false;
  siSelected: boolean = false;
  private caSelected: boolean = false;
  concreteLabSelected: boolean = false;
  websiteUrl: boolean = false;
  jobOfComp: Job
  private companyRelatedJobs: Job[] = []
  private isJob: boolean
  private newContact: boolean = true
  idContact: number
  private errorMsg: any

  /**
    * This method define all services that requires in whole class
    * @method constructor
    */
  constructor(
    private router: Router,
    private companyServices: CompanyServices,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private prefixServices: PrefixServices,
    private contactTitlesServices: ContactTitleServices,
    private contactLicenseTypeServices: ContactLicenseTypeServices,
    private addressTypeServices: AddressTypeServices,
    private stateServices: StateServices,
    private cityServices: CityServices,
    private contactServices: ContactServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private route: ActivatedRoute,
    private appComponent: AppComponent,
    private http: HttpClient,
    private message: Message,
    private taskServices: TaskServices,
  ) {
    this.errorMsg = this.message.msg;
    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    this.onSave = this.onSave.bind(this)
  }

  onSelect(evt) {
    if (evt == 'Proposal') {
      this.ShowContact = false
      this.ShowJobs = false
      this.ShowRFP = true
    }
    if (evt == 'Contacts') {
      this.ShowContact = true
      this.ShowJobs = false
      this.ShowRFP = false
    }
    if (evt == 'Projects') {
      this.ShowContact = false
      this.ShowJobs = true
      this.ShowRFP = false
    }
  }
  /**
    * This method will call when form loads first time
    * @method ngOnInit
    */
  ngOnInit() {
    this.rec = {} as Company
    this.permission(this.constantValues)
    this.companyServices.getById(this.id).subscribe(r => {
      this.rec = r
      this.rec.trackingExpiry = this.rec.trackingExpiry ? this.taskServices.dateFromUTC(this.rec.trackingExpiry, true) : '';
      this.rec.insuranceWorkCompensation = this.rec.insuranceWorkCompensation ? this.taskServices.dateFromUTC(this.rec.insuranceWorkCompensation, true) : '';
      this.rec.insuranceDisability = this.rec.insuranceDisability ? this.taskServices.dateFromUTC(this.rec.insuranceDisability, true) : '';
      this.rec.insuranceGeneralLiability = this.rec.insuranceGeneralLiability ? this.taskServices.dateFromUTC(this.rec.insuranceGeneralLiability, true) : '';
      this.rec.dotInsuranceWorkCompensation = this.rec.dotInsuranceWorkCompensation ? this.taskServices.dateFromUTC(this.rec.dotInsuranceWorkCompensation, true) : '';
      this.rec.dotInsuranceGeneralLiability = this.rec.dotInsuranceGeneralLiability ? this.taskServices.dateFromUTC(this.rec.dotInsuranceGeneralLiability, true) : '';
      this.rec.insuranceObstructionBond = this.rec.insuranceObstructionBond ? this.taskServices.dateFromUTC(this.rec.insuranceObstructionBond, true) : '';
      this.replaceUrl(this.rec.url);
      document.title = r.name;
      if (this.rec.companyTypes && this.rec.companyTypes.length > 0) {
        var comptypes = '';
        this.rec.companyTypes.forEach((type: any) => {
          comptypes += type.id + ',';
        });
        this.rec.companyTypes.forEach((type: any) => {
          if (type.id == 13) {
            this.gcSelected = true;
          }
          if (type.id == 12) {
            this.caSelected = true;
          }
          if (type.id == 11) {
            this.siSelected = true;
          }
          if (type.id == 27) {
            this.concreteLabSelected = true;
          }
          if (comptypes.indexOf('13') == 1 || comptypes.indexOf('11') == 1 || comptypes.indexOf('27') == 1 || comptypes.indexOf('21') == 1 || comptypes.indexOf('23') == 1 || comptypes.indexOf('24') == 1 || comptypes.indexOf('26') == 1 || comptypes.indexOf('22') == 1) {
          } else {
            if (comptypes.includes('13') || comptypes.includes('11') || comptypes.includes('27') || comptypes.includes('21') || comptypes.includes('23') || comptypes.includes('24') || comptypes.includes('26') || comptypes.includes('22')) {

            }
            else {
              this.companyWidgetItems = _.without(this.companyWidgetItems, _.findWhere(this.companyWidgetItems, {
                key: 1
              }));
            }

          }
        });
      }
      this.companyServices.getContacts(this.rec.id).subscribe(r => {
        this.loading = false
        if (r.length >= 1) {
          this.isContact = true
          this.contacts = (r.length && r) || ([{}] as Contact[])
          this.contacts.forEach((data: Contact) => {
            if (data.addresses[0] && data.addresses.length > 0) {
              data.addresses[0].state = data.addresses[0].state['acronym']
            }
            if (data.imageThumbUrl && data.imageThumbUrl != "")
              data.imageAux = data.imageThumbUrl
            else
              data.imageAux = blankAvatar

          });
        }
      })
    })
    this.tabChange('contact')
  }
  /**
      * Method for replace Url
      *
      * @method replaceUrl
      * @param {String} Model Height
      * @return {String} Height
      */
  replaceUrl(url: string) {
    if (url != null) {
      if (url && /\b(http|https)/.test(url)) {
        this.websiteUrl = false;
        return url;
      } else {
        this.websiteUrl = true;
      }

    }
  }

  Hola(ev: any, contact: any) {
    // /contactdetail/{{contact.id}}
    ev = ev || window.event;
    switch (ev.which) {
      case 1: this.onOpenContactDetail(contact);
        ; break;
      case 2: '';
        break;
      case 3:
        $('a.cont-name').attr('href', './contactdetail/' + contact.id);

        ; break;
    }
  }

  /**
* This method is used to navigate onOpenContactDetail
* @method onOpenContactDetail
* @param {any} obj contains contact object
*/
  private onOpenContactDetail(obj: any) {
    this.router.navigate(['/contactdetail', obj.id])
  }

  /**
   * This method set permission for this module
   * @method permission
   * @param {any} constantValues Rights value which is defined in constant file
   */
  permission(constantValues: any) {
    this.showCompanyAddBtn = this.userRight.checkAllowButton(constantValues.ADDCOMPANY)
    if (this.showCompanyAddBtn == 'hide') {
      this.companyWidgetItems = _.without(this.companyWidgetItems, _.findWhere(this.companyWidgetItems, {
        key: 2
      }));
    }
    this.showCompanyDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETECOMPANY)
    if (this.showCompanyDeleteBtn == 'hide') {
      this.companyWidgetItems = _.without(this.companyWidgetItems, _.findWhere(this.companyWidgetItems, {
        key: 9
      }));
    }

    this.showContactAddBtn = this.userRight.checkAllowButton(constantValues.ADDCONTACT)
    this.showContactDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETECONTACT)
    if (this.showContactAddBtn == 'hide') {
      this.companyWidgetItems = _.without(this.companyWidgetItems, _.findWhere(this.companyWidgetItems, {
        key: 7
      }));
      this.contactWidgetItems = _.without(this.contactWidgetItems, _.findWhere(this.contactWidgetItems, {
        key: 1
      }));
    }
    if (this.showContactDeleteBtn == 'hide') {
      this.contactWidgetItems = _.without(this.contactWidgetItems, _.findWhere(this.contactWidgetItems, {
        key: 5
      }));
    }
    this.showRfpAddBtn = this.userRight.checkAllowButton(constantValues.ADDRFP)
    if (this.showRfpAddBtn == 'hide') {
      this.companyWidgetItems = _.without(this.companyWidgetItems, _.findWhere(this.companyWidgetItems, {
        key: 3
      }));
      this.contactWidgetItems = _.without(this.contactWidgetItems, _.findWhere(this.contactWidgetItems, {
        key: 3
      }));
    }

    this.showJobAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOB)
    if (this.showJobAddBtn == 'hide') {
      this.companyWidgetItems = _.without(this.companyWidgetItems, _.findWhere(this.companyWidgetItems, {
        key: 4
      }));
      this.contactWidgetItems = _.without(this.contactWidgetItems, _.findWhere(this.contactWidgetItems, {
        key: 4
      }));
    }

    this.showTaskAddBtn = 'show'
    if (this.showTaskAddBtn == 'hide') {
      this.companyWidgetItems = _.without(this.companyWidgetItems, _.findWhere(this.companyWidgetItems, {
        key: 5
      }));
    }
  }

  /**
   * @method getBack
   */
  getBack() {
    this.onClose.emit();
  }

  /**
   * This method will open send email popup
   * @method openModalSendEmail
   * @param {TemplateRef} template TemplateRef Object 
   * @param {number} id ID 
   */
  private openModalSendEmail(template: TemplateRef<any>, id?: number) {
    this.modalRef = this.modalService.show(template, { class: 'modal-send-email', backdrop: 'static', 'keyboard': false })
  }

  /**
   * This method will get all job of company
   * @method getJobsOfCompany
   */
  private getJobsOfCompany() {
    this.companyServices.getJobs(this.rec.id).subscribe(r => {
      this.loading = false
      if (r.length >= 1) {
        this.isJob = true
        this.companyRelatedJobs = (r.length && r) || ([{}] as Job[])
      }
    })
  }

  /**
   * This method will manage all click on comapany information box
   * @method onCompanyWidgetItemClick
   * @param {number} key flag for different events
   */
  onCompanyWidgetItemClick(key: number) {
    if (key == 1) {
      this.goToBis(this.rec)
    } else if (key == 2) {
      this.loading = true;
      this.openModalCompany(this.formCompany, this.rec.id)
    } else if (key == 6) {
      this.idCompany = this.rec.id
      this.openModalSendEmail(this.sendemailCompany)
    } else if (key == 7) {
      this.openModal(this.formContcat)
    } else if (key == 9) {
      this.appComponent.showDeleteConfirmation(this.deleteCompany, [this.rec.id])
    } else if (key == 3) {
      this.router.navigate(["/SiteInformation", { idCompany: this.rec.id }])
    } else if (key == 4) {
      this.openJobModal(this.formJob, this.rec.id)
    } else if (key == 5) {
      this.idCompany = this.rec.id
      this.openModalFormAddTask(this.addtask)
    } else {
      this.toastr.warning(`${this.companyWidgetItems.find((i) => i.key == key).text} not implemented yet`)
    }
  }

  /**
   * This method fetch information from  BIS
   * @method goToBis
   * @param {any} bisTracking CompanyID
   */
  private goToBis(bisTracking: any) {
    this.loading = true
    if (bisTracking.id) {
      this.companyServices.getById(bisTracking.id).subscribe(r => {
        this.loading = false
        var trackingNumber = 0;
        var companyTypes = r.companyTypes;
        var gcCompanyType = companyTypes.filter((type: any) => type.id == 13);
        var SiaCompanyType = companyTypes.filter((type: any) => type.id == 11);
        var ctCompanyType = companyTypes.filter((type: any) => type.id == 27);
        let licenceType = '';
        if (gcCompanyType.length > 0) {
          licenceType = 'G';
          trackingNumber = r.trackingNumber;
        } else if (SiaCompanyType.length > 0) {
          licenceType = 'I';
          trackingNumber = r.specialInspectionAgencyNumber;
        } else if (ctCompanyType.length > 0) {
          licenceType = 'C';
          trackingNumber = r.ctLicenseNumber;
        }
        if (trackingNumber) {
          window.open('http://a810-bisweb.nyc.gov/bisweb/LicenseQueryServlet?licensetype=' + licenceType + '&licno=' + trackingNumber + '&requestid=1');
        } else {
          this.toastr.info(this.errorMsg.noResultForBis);
        }

      });
    }
  }

  /**
   * This method will open popup for add task
   * @method openModalFormAddTask
   * @param {TemplateRef} template TemplateRef Object 
   * @param {number} id ID 
   */
  openModalFormAddTask(template: TemplateRef<any>, id?: number) {
    if (!id) {
      // this.idJobApp = 0
    }
    this.modalRef = this.modalService.show(template, { class: 'modal-add-task', backdrop: 'static', 'keyboard': false })
  }

  /**
   * This method will delete company
   * @method deleteCompany
   * @param {number} id ID of Company 
   */
  private deleteCompany(id: number): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.companyServices.delete(id).subscribe(r => {
        this.router.navigate(["./company"]);
        resolve(null)
      }, e => {
        console.log(e)
        reject()
      });
    })
  }

  /**
   * This method will manage all click on comapany information box
   * @method onCompanyWidgetItemClick
   * @param {number} key flag for different events
   */
  onContactWidgetItemClick(key: number, contact: Contact) {
    if (key == 1) {
      this.openModal(this.formContcat, contact.id)
    } else if (key == 2) {
      this.idCompany = this.rec.id
      this.idContact = contact.id
      this.openModalSendEmail(this.sendemailContact)
    } else if (key == 3) {
      this.router.navigate(["/SiteInformation", { idCompany: this.rec.id, idContact: contact.id }])
    } else if (key == 4) {
      this.openJobModal(this.formJob, this.rec.id, contact.id)
    } else if (key == 5) {
      // this.deleteContact(contact.id)
      this.contactServices.setIsContactDeleted(null)
      setTimeout(() => {
        this.appComponent.showDeleteConfirmation(this.deleteContact, [contact.id])
        this.contactServices.getIsContactDeleted().subscribe(res => {
          console.log('getIsContactDeleted', res)
          if (res != null) {
            let deletedIndex = this.contacts.indexOf(this.contacts.filter(x => x.id == res)[0])
            this.contacts.splice(deletedIndex, 1)
            this.contactServices.setIsContactDeleted(null)
          }
        })
      }, 1500);
    } else {
      this.toastr.warning(`${this.contactWidgetItems.find((i) => i.key == key).text} (${contact.firstName}) not implemented yet`)
    }
  }

  /**
   * This method will delete contact 
   * @method deleteContact
   * @param {number} id ID of contact 
   */
  private deleteContact(id: number): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.contactServices.delete(id).subscribe(r => {
        this.contactServices.setIsContactDeleted(id)
        resolve(null)
      }, e => {
        console.log(e)
        reject()
      })
    })
  }

  /**
   * This method will open popup for contact
   * @method _openModal
   * @param {TemplateRef} template TemplateRef Object 
   */
  private _openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-contact', backdrop: 'static', 'keyboard': false })
  }

  /**
   * This method will open popup for add contact
   * @method openModal
   * @param {TemplateRef} template TemplateRef Object 
   * @param {number} id? ID
   */
  openModal(template: TemplateRef<any>, id?: number) {
    this.newContact = !!!id
    this.ShowContact = true
    this.ShowJobs = false
    this.ShowRFP = false
    if (!this.newContact) {
      this.contactServices.getById(id).subscribe(r => {
        this.contactModal = r as Contact
        if (r.imageThumbUrl && r.imageThumbUrl != "")
          this.contactModal.imageAux = r.imageThumbUrl
        else
          this.contactModal.imageAux = blankAvatar

        this._openModal(template)
      })
    } else {
      this.contactModal = {
        imageAux: blankAvatar,
        idCompany: this.rec.id,
        contactLicenses: [],
        addresses: [],
        documents: [],
        isActive: true
      } as Contact
      this._openModal(template)
    }
  }

  /**
   * This method will open popup for job
   * @method openJobModal
   * @param {TemplateRef} template TemplateRef Object 
   * @param {number} id? ID
   * @param {number} contactId?? ID of Contact
   */
  openJobModal(template: TemplateRef<any>, id?: number, contactId?: number) {
    this.jobOfComp = {
      idCompany: this.rec.id,
      idContact: contactId
    } as Job
    this._openJobModal(template)
  }

  /**
   * This method will open popup for add contact
   * @method _openJobModal
   * @param {TemplateRef} template TemplateRef Object 
   */
  private _openJobModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-job', backdrop: 'static', 'keyboard': false })
  }

  /**
   * This methos will call when save contact, company or job
   * @method onSave
   * @param {any} ctt record object 
   * @param {any} evt event object
   */
  onSave(ctt: any, evt: any) {
    console.log(ctt);
    this.companyServices.getById(ctt.id).subscribe(r => {
      console.log(r);
      let company = r
      if (company.idCompanyTypes.includes(13)) {
        this.gcSelected = true;
      } else {
        this.gcSelected = false;
      }
      if (company.idCompanyTypes.includes(12)) {
        this.caSelected = true;
      } else {
        this.caSelected = false;
      }
      if (company.idCompanyTypes.includes(11)) {
        this.siSelected = true;
      } else {
        this.siSelected = false;
      }
      if (company.idCompanyTypes.includes(27)) {
        this.concreteLabSelected = true;
      } else {
        this.concreteLabSelected = false;
      }


    })
    if (ctt.idCompany == this.idCompany) {

      this.replaceUrl(ctt.url);
      if (ctt.imageThumbUrl) {
        ctt.imageAux = ctt.imageThumbUrl
      } else {
        ctt.imageAux = blankAvatar
      }
      if (ctt.jobNumber) {
        this.companyRelatedJobs.push(ctt)
      } else if (ctt.idCompany) {
        ctt.cellNumber = ctt.mobilePhone;
        if (ctt.addresses[0]) {
          ctt.phone = ctt.addresses[0].phone;
        }
        if (ctt.contactLicenses[0]) {
          ctt.license = ctt.contactLicenses[0].contactLicenseType.name;
          ctt.licenseNumber = ctt.contactLicenses[0].number;
        }

        let index = this.contacts.indexOf(this.contacts.filter(x => x.id == ctt.id)[0])
        this.isContact = true
        if (!this.contacts[0].firstName) { // for no contacts in company
          this.contacts[0] = ctt
        } else if (index != -1) { // while edit contact
          this.contacts[index] = ctt
        } else {
          this.contacts.push(ctt) // add new contact if any one contact exist
        }
      } else {
        this.rec = ctt
        if (this.rec.addresses && this.rec.addresses.length > 0) {

          this.rec.addresses.forEach((address: any) => {
            address.state = address.state['acronym']
          })

        }
      }
    } else {
      this.companyServices.getContacts(this.rec.id).subscribe(r => {
        this.loading = false
        if (r.length >= 1) {
          this.isContact = true
          this.contacts = (r.length && r) || ([{}] as Contact[])
          this.contacts.forEach((data: Contact) => {
            if (data.addresses[0] && data.addresses.length > 0) {
              data.addresses[0].state = data.addresses[0].state['acronym']
            }
            if (data.imageThumbUrl && data.imageThumbUrl != "")
              data.imageAux = data.imageThumbUrl
            else
              data.imageAux = blankAvatar

          });
        }
        else {
          this.isContact = false;
          this.queryString = '';
          this.contacts = [];
        }
      });
    }
  }

  /**
   * This method will join array into string
   * @method join
   * @param {array} arr array of string 
   * @param {string} s join character 
   */
  join(arr: string[], s: string = ', '): string {
    return arr.filter((i: any) => { return !!i }).join(s)
  }

  /**
   * This method will open popup for company
   * @method _openModalCompany
   * @param {TemplateRef} template TemplateRef Object 
   */
  private _openModalCompany(template: TemplateRef<any>) {
    setTimeout(() => {    //<<<---    using ()=> syntax
      this.loading = false;
    }, 1000);
    this.modalRef = this.modalService.show(template, { class: 'modal-company', backdrop: 'static', 'keyboard': false })
  }

  /**
   * This method will open popup for company
   * @method openModalCompany
   * @param {TemplateRef} template TemplateRef Object 
   * @param {number} id ID of company
   */
  private openModalCompany(template: TemplateRef<any>, id?: number) {

    this.new = !!!id
    if (this.new) {
      this.rec = {
        addresses: []
      } as Company

      this.address = {} as Address

      this._openModalCompany(template)
    } else {
      this.companyServices.getById(id).subscribe(r => {
        this.rec = r as Company
        if (this.rec.specialInspectionAgencyExpiry) {
          this.rec.specialInspectionAgencyExpiry = this.taskServices.dateFromUTC(this.rec.specialInspectionAgencyExpiry, true);
        }
        this.address = {} as Address

        this._openModalCompany(template)
      })
    }
  }

  /**
   * This method will call when any tab change
   * @method tabChange
   * @param {any} val Tab Value 
   */
  tabChange(val: any) {
    if (val == 'rfp') {
      this.ShowContact = false
      this.ShowJobs = false
      this.ShowRFP = true
    }
    if (val == 'contact') {
      this.ShowContact = true
      this.ShowJobs = false
      this.ShowRFP = false
    }
    if (val == 'jobs') {
      //this.getJobsOfCompany()
      this.ShowContact = false
      this.ShowJobs = true
      this.ShowRFP = false
    }
  }

  /**
   * This method will call when RFP tab is clicked
   * @method tabChangeRFP
   */
  tabChangeRFP() {
    this.router.navigate(["/SiteInformation", { idCompany: this.rec.id }])
  }

  /**
   * This method will call when Job tab is clicked
   * @method tabChangeJobs
   */
  tabChangeJobs() {
    this.router.navigate(['/jobs'])
  }

  /**
   * This method set contact box height
   * @method detailsGridHeight
   */
  detailsGridHeight() {
    let winHeight = document.documentElement.clientHeight - 180;
    return winHeight;
  }

  /**
   * This method reloads datatable
   * @method reload
   */
  reload() {
    this.table.clearPipeline()
    this.table.ajax.reload()
  }

}