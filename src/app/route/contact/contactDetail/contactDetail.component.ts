
import { ContactServices } from '../contact.services';
import { CityServices } from '../../../services/city.services';
import { StateServices } from '../../../services/state.services';
import { AddressTypeServices } from '../../../services/addressType.services';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CompanyServices } from '../../company/company.services';
import { Contact } from '../../../types/contact';
import { Company } from '../../../types/company';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash';
import { DropdownWidgetItem } from '../../../components/DropdownWidget';
import { Router } from '@angular/router';
import { UserRightServices } from '../../../services/userRight.services';
import { constantValues } from '../../../app.constantValues';
import { TaskServices } from '../../task/task.services';
import * as _ from 'underscore';
import { ActivatedRoute } from '@angular/router';
import { Job } from '../../../types/job';
const blankAvatar = "./assets/blank-avatar.jpg";
import { API_URL } from '../../../app.constants';
import { AppComponent } from '../../../app.component';
import { LocalStorageService } from '../../../services/local-storage.service';
declare const $: any
/**
* This component contains all function that are used in Contact Detail 
* @class ContactDetailComponent
*/
@Component({
  selector: '[contact-detail]',
  templateUrl: './contactDetail.component.html',
  styleUrls: ['./contactDetail.component.scss']
})
export class ContactDetailComponent implements OnInit {

  /**
  * This property is used when any trigger based action occurs
  * @property onClose
  */
  @Output() onClose = new EventEmitter<void>();

  /**
  * formContact add/edit form
  * @property formContact
  */
  @ViewChild('formContact', { static: true })
  private formContact: TemplateRef<any>

  /**
  * formJob add/edit form
  * @property formJob
  */
  @ViewChild('formJob', { static: true })
  private formJob: TemplateRef<any>

  /**
  * addtask add/edit form
  * @property addtask
  */
  @ViewChild('addtask', { static: true })
  private addtask: TemplateRef<any>

  /**
  * sendemail add/edit form
  * @property sendemail
  */
  @ViewChild('sendemail', { static: true })

  private sendemail: TemplateRef<any>
  modalRef: BsModalRef
  private new: boolean = true
  public rec: Contact;
  jobOfContact: Job
  public company: Company = {} as Company;
  public companyType: any = { 1: "Home Owners", 2: "Owner's REP", 3: "Engineer", 4: "Architect", 5: "Asbestos Investigator", 6: "DOB", 7: "DOT", 8: "DEP", 9: "FDNY", 10: "ECB", 11: "SCA", 12: "SBS", 13: "State Agencies", 14: "Property Managers", 15: "Developers", 16: "Consultants", 17: "Lobbyist", 18: "Special Inspection", 19: "1/2/3 Family", 20: "Safety Reg", 21: "Demolition", 22: "Construction", 23: "Concrete" }
  companyTypeLayout: any = {
    specialInspection: 18
  }
  //Conact show hide
  showCompanyAddBtn: string = 'hide'

  //Conact show hide
  private showContactAddBtn: string = 'hide'
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
  private showTaskViewBtn: string = 'hide'
  private showTaskDeleteBtn: string = 'hide'
  public ShowCompany: boolean = false
  public ShowJobs: boolean = false
  public ShowRFP: boolean = false
  gcSelected: boolean = false;
  private caSelected: boolean = false;
  siSelected: boolean = false;
  idCompanyFromContact: number
  private userAccessRight: any = {};
  contactWidgetItems: DropdownWidgetItem[] = [


    // { key: 3, text: 'Contact Detail' },

    //{ key: 8, text: 'Edit Company' },
    // { key: 9, text: 'Delete Company' }
  ]

  inActivecontactWidgetItems: DropdownWidgetItem[] = [
    { key: 1, text: 'Edit Contact' },
    { key: 6, text: 'Delete Contact' }
  ]
  private sub: any
  private id: number
  idContact: number;
  isCustomerLoggedIn: boolean = false;
  loading: boolean = false;

  constructor(
    private router: Router,
    private companyServices: CompanyServices,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private addressTypeServices: AddressTypeServices,
    private stateServices: StateServices,
    private cityServices: CityServices,
    private contactServices: ContactServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private route: ActivatedRoute,
    private taskServices: TaskServices,
    private appComponent: AppComponent,
    private localStorageService: LocalStorageService
  ) {
    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id'];
    });

    this.isCustomerLoggedIn = this.localStorageService.getCustomerLoggedIn();

    this.onSave = this.onSave.bind(this)
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    this.contactWidgetItems = [{ key: 1, text: 'Edit Contact' },
    { key: 2, text: 'Create Task' },
    { key: 3, text: 'Send Email' },
    { key: 4, text: 'Create Proposal' },
    { key: 5, text: 'Create Project' },
    { key: 6, text: 'Delete Contact' }]
    this.rec = {} as Contact
    this.contactServices.getById(this.id).subscribe(r => {
      document.title = 'Contact -' + r.firstName + ' ' + (r.middleName != null ? r.middleName : '') + ' ' + (r.lastName != null ? r.lastName : '');
      this.rec = r
      this.permission(this.constantValues)
      if (this.rec.idCompany != null) {
        this.ShowCompany = true
      } else {
        this.ShowRFP = true;
      }
      if (r.imageThumbUrl && r.imageThumbUrl != "")
        this.rec.imageAux = r.imageThumbUrl
      else
        this.rec.imageAux = blankAvatar


      this.contactServices.getCompany(this.rec.id).subscribe(r => {
        this.company = r || this.company
        this.company.trackingExpiry = this.company.trackingExpiry ? this.taskServices.dateFromUTC(this.company.trackingExpiry, true) : '';
        this.company.insuranceWorkCompensation = this.company.insuranceWorkCompensation ? this.taskServices.dateFromUTC(this.company.insuranceWorkCompensation, true) : '';
        this.company.insuranceDisability = this.company.insuranceDisability ? this.taskServices.dateFromUTC(this.company.insuranceDisability, true) : '';
        this.company.insuranceGeneralLiability = this.company.insuranceGeneralLiability ? this.taskServices.dateFromUTC(this.company.insuranceGeneralLiability, true) : '';
        this.company.dotInsuranceWorkCompensation = this.company.dotInsuranceWorkCompensation ? this.taskServices.dateFromUTC(this.company.dotInsuranceWorkCompensation, true) : '';
        this.company.dotInsuranceGeneralLiability = this.company.dotInsuranceGeneralLiability ? this.taskServices.dateFromUTC(this.company.dotInsuranceGeneralLiability, true) : '';
        this.company.insuranceObstructionBond = this.company.insuranceObstructionBond ? this.taskServices.dateFromUTC(this.company.insuranceObstructionBond, true) : '';

        if (this.company.companyTypes && this.company.companyTypes.length > 0) {
          this.company.companyTypes.forEach((type: any) => {
            if (type.id == 13) {
              this.gcSelected = true;
            }
            if (type.id == 12) {
              this.caSelected = true;
            }
            if (type.id == 11) {
              this.siSelected = true;
            }
          });
        }
      })
    })

  }


  /**
   * This method is used to check permission of component
   * @method permission
   * @param {any} constantValues type request Object
   */
  permission(constantValues: any) {
    this.showContactAddBtn = this.userRight.checkAllowButton(constantValues.ADDCONTACT)
    if (this.showContactAddBtn == "hide") {
      this.contactWidgetItems = _.without(this.contactWidgetItems, _.findWhere(this.contactWidgetItems, {
        key: 1
      }));
      this.inActivecontactWidgetItems = _.without(this.inActivecontactWidgetItems, _.findWhere(this.inActivecontactWidgetItems, {
        key: 1
      }));

    }
    this.showContactDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETECONTACT)
    if (this.showContactDeleteBtn == "hide") {
      this.contactWidgetItems = _.without(this.contactWidgetItems, _.findWhere(this.contactWidgetItems, {
        key: 6
      }));
      this.inActivecontactWidgetItems = _.without(this.inActivecontactWidgetItems, _.findWhere(this.inActivecontactWidgetItems, {
        key: 2
      }));
    }

    this.showCompanyAddBtn = this.userRight.checkAllowButton(constantValues.ADDCOMPANY)


    this.showRfpAddBtn = this.userRight.checkAllowButton(constantValues.ADDRFP)
    if (this.showRfpAddBtn == "hide") {
      this.contactWidgetItems = _.without(this.contactWidgetItems, _.findWhere(this.contactWidgetItems, {
        key: 4
      }));
    }


    this.showJobAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOB)
    if (this.showJobAddBtn == "hide") {
      this.contactWidgetItems = _.without(this.contactWidgetItems, _.findWhere(this.contactWidgetItems, {
        key: 5
      }));
    }

    this.showTaskAddBtn = 'show'
    if (this.showTaskAddBtn == "hide") {
      this.contactWidgetItems = _.without(this.contactWidgetItems, _.findWhere(this.contactWidgetItems, {
        key: 2
      }));
    }

    if (!this.isCustomerLoggedIn) {
      console.log('this.rec', this.rec)
      if (!this.rec.cuiInvitationStatus) {
        this.contactWidgetItems.push({ key: 7, text: 'Invite Contact' })
      } else if (this.rec.cuiInvitationStatus == 1) {
        this.contactWidgetItems.push({ key: 8, text: 'Re-Invite' })
      }
    }
  }


  /**
  * This method is used for triggering an event to close popup and refresh component
  * @method getBack
  */
  getBack() {
    this.onClose.emit();
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
        $('a.comp-name').attr('href', './companydetail/' + contact.id);

        ; break;
    }
  }

  /**
* This method is used to navigate onOpenContactDetail
* @method onOpenContactDetail
* @param {any} obj contains contact object
*/
  private onOpenContactDetail(obj: any) {
    this.router.navigate(['/companydetail', obj.id])
  }
  /**
  * This method is used to save record
  * @method onSave
  * @param {any} object object is an contact object
  * @param {any} evt evt is used as an input element
  */
  onSave(object: any, evt: any) {
    if (object.imageThumbUrl) {
      object.imageAux = object.imageThumbUrl
    } else {
      object.imageAux = blankAvatar
    }
    if (object.firstName) {
      this.rec = object
      if (this.rec.addresses && this.rec.addresses.length > 0) {
        this.rec.addresses[0].state = this.rec.addresses[0].state['acronym']
      }
    } else {
      this.company = object
      if (this.company.addresses && this.company.addresses.length > 0) {
        this.company.addresses[0].state = this.company.addresses[0].state['acronym']
      }
    }
    //refresh company information
    this.contactServices.getCompany(this.rec.id).subscribe(r => {
      this.company = r || this.company
      if (this.company.idCompanyTypes) {


        if (this.company.idCompanyTypes.includes(13)) {
          this.gcSelected = true;
        } else {
          this.gcSelected = false;
        }
        if (this.company.idCompanyTypes.includes(12)) {
          this.caSelected = true;
        } else {
          this.caSelected = false;
        }
        if (this.company.idCompanyTypes.includes(11)) {
          this.siSelected = true;
        } else {
          this.siSelected = false;
        }
      }

    })
  }

  /**
  * This method is used to join string
  * @method join
  * @param {string} arr arr is an array which contains various fields
  * @param {string} s s is used as seprator from which we need to start append
  */
  join(arr: string[], s: string = ', '): string {
    return arr.filter((i: any) => { return !!i }).join(s)
  }

  /**
  * This method is used to open modal popup for open Modal Form
  * @method _openModal
  * @param {any} template type which contains template of create/edit module
  */
  private _openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-contact', backdrop: 'static', 'keyboard': false })
  }

  /**
  * This method is used to open modal popup for openModal
  * @method openModal
  * @param {any} template type which contains template of create/edit module
  * @param {number} id?? it is optional which contains id if record is in edit mode
  */
  openModal(template: TemplateRef<any>, id?: number) {
    this.new = !!!id
    if (!this.new) {
      this.companyServices.getById(id).subscribe(r => {
        this.company = r as Company
        this._openModal(template)
      })
    } else {
      this._openModal(template)
    }
  }


  /**
  * This method is used as action of contact widget
  * @method onContactWidgetItemClick
  * @param {number} key key is the id of which the action is to be performed
  */
  onContactWidgetItemClick(key: number, formcontact) {
    if (key == 1) {
      this.openModalContact(formcontact, this.rec.id)
    } else if (key == 3) {
      this.idContact = this.rec.id
      if (this.rec.idCompany) {
        this.idCompanyFromContact = this.rec.idCompany
      }
      this.openModalSendEmail(this.sendemail)
    } else if (key == 4) {
      this.router.navigate(['/SiteInformation', { idCompany: this.rec.idCompany, idContact: this.rec.id }])
    } else if (key == 5) {
      this.openJobModal(this.formJob, this.rec.idCompany, this.rec.id)
    } else if (key == 6) {
      this.appComponent.showDeleteConfirmation(this.deleteContact, [this.rec.id])
    } else if (key == 2) {
      this.idContact = this.rec.id
      this.openModalFormAddTask(this.addtask)
    }
    else if (key == 7) {
      this.inviteContact(this.rec);
    } else if (key == 8) {
      this.inviteContact(this.rec, true);
    } else {
      this.toastr.warning(`${this.contactWidgetItems.find((i) => i.key == key).text} not implemented yet`)
    }
  }

  // inviteContact(){
  //   this.toastr.success("Invitation sent successfully");
  //   if(!this.isCustomerLoggedIn){
  //   this.contactWidgetItems = this.contactWidgetItems.filter((ele) => {
  //     return ele.key ===  7 ? ele.class = 'hide' : 'show' 
  //   })
  //     this.contactWidgetItems.push(
  //     { key: 8, text: 'Resend Email'}
  //     )
  //   }
  // }

  /**
  * This method is used to open modal popup for sending an email
  * @method openModalSendEmail
  * @param {any} template type which contains template of create/edit module
  * @param {number} id it is optional which contains id if record is in edit mode
  */
  private openModalSendEmail(template: TemplateRef<any>, id?: number) {
    this.modalRef = this.modalService.show(template, { class: 'modal-send-email', backdrop: 'static', 'keyboard': false })
  }

  /**
  * This method is used to delete records from database
  * @method deleteContact
  * @param {number} id  id of contact
  */

  private deleteContact(id: number): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.contactServices.delete(id).subscribe(r => {
        this.router.navigate(["./contacts"]);
        resolve(null)
      }, e => {
        console.log(e)
        reject()
      })
    })
  }

  /**
  * This method is used to open modal popup for job
  * @method openJobModal
  * @param {any} template type which contains template of create/edit module
  * @param {number} id?? it is optional which contains id if record is in edit mode
  * @param {number} contactId?? contact id for prefilling contact
  */
  openJobModal(template: TemplateRef<any>, id?: number, contactId?: number) {
    this.jobOfContact = {
      idCompany: this.rec.idCompany,
      idContact: contactId
    } as Job
    this._openJobModal(template)
  }

  /**
  * This method is used to open modal popup for opening job modal
  * @method _openJobModal
  * @param {any} template type which contains template of create/edit module
  */
  private _openJobModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-job', backdrop: 'static', 'keyboard': false })
  }

  /**
  * This method is used to open modal popup for contact
  * @method _openModalContact
  * @param {any} template type which contains template of create/edit module
  */
  private _openModalContact(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-contact', backdrop: 'static', 'keyboard': false })
  }

  /**
  * This method is used to open modal popup for contact form
  * @method openModalContact
  * @param {any} template type which contains template of create/edit module
  * @param {number} id it is optional which contains id if record is in edit mode
  */
  private openModalContact(template: TemplateRef<any>, id?: number) {
    this.new = !!!id

    if (!this.new) {

      this.contactServices.getById(id).subscribe(r => {
        this.rec = r as Contact
        if (r.imageThumbUrl && r.imageThumbUrl != "")
          this.rec.imageAux = r.imageThumbUrl
        else
          this.rec.imageAux = blankAvatar

        this._openModalContact(template)
      })
    } else {
      this.rec = void 0
      this._openModalContact(template)
    }
  }

  /**
  * This method is used for setting the height of grid
  * @method detailsGridHeight
  */
  detailsGridHeight() {
    let winHeight = document.documentElement.clientHeight - 180;
    return winHeight;
  }

  /**
  * This method is used for switching tabs in contact details
  * @method tabChange
  * @param {any} val val is used to make which tab active and other inactive
  */
  tabChange(val: any) {
    if (val == 'rfp') {
      this.ShowCompany = false
      this.ShowJobs = false
      this.ShowRFP = true
    }
    if (val == 'company') {
      this.ShowCompany = true
      this.ShowJobs = false
      this.ShowRFP = false
    }
    if (val == 'jobs') {
      this.ShowCompany = false
      this.ShowJobs = true
      this.ShowRFP = false
    }
  }

  /**
  * This method is used to open modal popup for opening modal task
  * @method openModalFormAddTask
  * @param {any} template type which contains template of create/edit module
  * @param {number} id it is optional which contains id if record is in edit mode
  */
  openModalFormAddTask(template: TemplateRef<any>, id?: number) {
    if (!id) {
    }
    this.modalRef = this.modalService.show(template, { class: 'modal-add-task', backdrop: 'static', 'keyboard': false })
  }

  /**
  * This method is used to redirect user to RFP
  * @method GoToRfp
  */
  GoToRfp() {
    this.router.navigate(['/SiteInformation', { idCompany: this.rec.idCompany, idContact: this.rec.id }])
  }

  public resendInvitation(data: any) {
    this.inviteContact(data, true)
  }

  public inviteContact(data: any, isResend?: boolean) {
    console.log(data)
    if (!data?.email || !data?.firstName) {
      this.toastr.error("Contact must have First Name and Email for send invitation.")
      // this.toastr.error("This customer doesn't have an email address for sending invitations.")
      return
    }
    // if (!data?.email) {
    //   this.toastr.error("This customer doesn't have an email address for sending invitations.")
    //   return
    // }
    if (!data?.isActive) {
      this.toastr.error("This customer is inactive; invitations cannot be sent.")
      return
    }
    this.loading = true;
    this.contactServices.sendInviteContact(data.id, 0).subscribe((res) => {
      console.log('res inviteContact', res)
      if (res) {
        this.toastr.success(isResend ? "Invitation resent successfully" : "Invitation sent successfully");
        this.loading = false;
        this.ngOnInit()
      }
    },
      (error) => {
        this.loading = false;
        console.log(error)
        this.toastr.error(error.message);
      })
  }
}