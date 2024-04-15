import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash';
import { RfpListService } from './../../rfp/rfp.services';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { RfpSubmitServices } from "../../addRfp/rfpSubmit/rfpSubmit.services";
import { AppComponent } from '../../../app.component';
import { rfp } from '../../../types/rfp';
import { MailType } from '../../../types/mailType';
import { MailVia } from '../../../types/mailVia';
import { Contact } from '../../../types/contact';
import { Company } from '../../../types/company';
import { ContactServices } from '../../contact/contact.services';
import { CompanyServices } from '../../company/company.services';
import { Employee } from '../../../types/employee';
import { EmployeeServices } from '../../employee/employee.services';
import { Message } from '../../../app.messages';
import * as _ from 'underscore';
import { constantValues } from '../../../app.constantValues';
declare const $: any
/**
* This component contains all function that are used in SendEmailComponent
* @class SendEmailComponent
*/
@Component({
  selector: '[send-email]',
  templateUrl: './sendEmail.component.html'
})
export class SendEmailComponent implements OnInit {
  @Input() sendemail: any
  @Input() modalRef: BsModalRef
  @Input() idRfp: number
  @Input() openFromRfp: boolean
  @Input() idContact: number
  @Input() openFromContact: boolean
  @Input() idCompany: number
  @Input() openFromCompany: boolean
  @Input() from?: string

  private ckeditorContent: string;
  private sub: any;
  private rfpSubmit: rfp
  private contactTo: Contact[] = [];
  private contactCc: Contact[] = [];
  contacts: Contact[] = []
  private contact: Contact;
  private employee: Employee[] = []
  loading: boolean = false
  private rfpNumber: string
  dropdownSettings: any = {};
  private dropdownList: any = [];
  private recipientEmailList: any = [];
  tmpContactId: any = []
  id: number
  status: rfp
  mailFrom: string
  mailCc: Array<number> = []
  mailTo: number
  mailType: number
  mailVia: number
  mailAttention: number
  mailBody: string
  files: Array<string> = []
  private showNavigationTabs: boolean = true
  private showStep1: string = ''
  private showStep2: string = ''
  private showStep3: string = ''
  private showStep4: string = ''
  private showStep5: string = ''
  empList: any
  companies: Company[] = []
  errorMsg: any
  private selectedContactsCC: any = []
  proposalPDFFile: string = ""
  private proposalFileSize: string = ""
  documents: any
  private totalFileSize: number
  exceedFileSize: boolean = false
  private allMailTypes: MailType[] = []
  mailTypes: MailType[] = []
  mailViaData: MailVia[] = []
  private IsProposalPDFAttached = false
  private isPreselectCC = false
  subject: string
  private emailTemplate: any
  private fromRfp: boolean = true
  allContactsForCC: any
  private loggedInUser:any
  private frommodule:string
  configuration: any

  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(
    private contactService: ContactServices,
    private modalService: BsModalService,
    private rfpSubmitService: RfpSubmitServices,
    private route: ActivatedRoute,
    private rfpListService: RfpListService,
    private router: Router,
    private toastr: ToastrService,
    private employeeServices: EmployeeServices,
    private companyServices: CompanyServices,
    private message: Message,
    private constantValues: constantValues
  ) {
    this.tmpContactId = []
    this.errorMsg = this.message.msg
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    this.from!= null ? this.frommodule = this.from : this.frommodule = null;
    this.loggedInUser = localStorage.getItem('userLoggedInId')
    this.loggedInUser = parseInt(this.loggedInUser, 10)
    this.constantValues.CKEDITORCONFIGSETTING.autoparagraph = true
    this.configuration = this.constantValues.CKEDITORCONFIGSETTING;
    this.loading = true
    this.dropdownSettings = {
      singleSelection: false,
      text: "Contacts",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: false,
      classes: "myclass custom-class",
      badgeShowLimit: 1,
    };
    if (this.idRfp) {
      this.getRfpDetail()
    }
    if (this.idContact || this.idCompany) {
      this.loadAllMasterDD()
    }
  }

  /**
   * This method get all mail type list
   * @method getmailTypes
   */
  private getmailTypes() {
    let module = ""
    if (this.openFromRfp) {
      module = "RFP"
    }
    if (this.openFromContact) {
      module = "Contacts"
    }
    if (this.openFromCompany) {
      module = "Company"
    }
    this.rfpSubmitService.getMailTypesDD(module).subscribe(r => {
      this.mailTypes = _.sortBy(r, function (i: any) { return i.itemName.toLowerCase(); });
    })
  }

  /**
   * This method get all mail via list
   * @method getmailViaData
   */
  private getmailViaData() {
    this.rfpSubmitService.getMailViaDD().subscribe(r => {
      this.mailViaData = _.sortBy(r, function (i: any) { return i.itemName.toLowerCase(); });
    })
  }

  /**
  * This method get all contacts list
  * @method getContacts
  */
  getContacts() {
    let preselectCC = {
      'id': '', 
      'itemName': ''
    }
    this.loading = true;
    if (this.mailTo) {
      this.idCompany = this.mailTo
    } else {
      this.idCompany = -1
    }
    if (this.frommodule && this.frommodule == 'RFP'){
       // get all contacts for cc dropdown
    this.contactService.getrfpContactDropdown().subscribe(contactData => {
      this.loading = false;
      this.allContactsForCC = contactData;
      console.log(this.allContactsForCC);
      //get contacts for attention dropdown from company
      this.companyServices.getContactOfComDD(this.idCompany).subscribe(r => {
        this.contacts = _.sortBy(r, function (i: any) { return i.itemName.toLowerCase(); });
        if (this.openFromRfp) {
          if (this.rfpSubmit.idContact) {
            if (this.contacts.filter((x: any) => x.id == this.rfpSubmit.idContact).length > 0) {
              this.mailAttention = this.contacts.filter((x: any) => x.id == this.rfpSubmit.idContact)[0].id
              console.log(this.allContactsForCC);
            }
          }
          if (this.rfpSubmit.scopeReview && this.rfpSubmit.scopeReview.contactsCc) {
            let contactCCList = this.rfpSubmit.scopeReview.contactsCc.split(",");
            this.tmpContactId = [];
            console.log(this.allContactsForCC);
            contactCCList.forEach((data: any) => {
              if (this.allContactsForCC && this.allContactsForCC.length > 0) {
                if (this.allContactsForCC.filter((x: any) => x.id == data)) {
                  let tmpContactInfo = this.allContactsForCC.filter((x: any) => x.id == data)[0];
                  this.tmpContactId.push({ "id": tmpContactInfo.id, "itemName": tmpContactInfo.itemName })
                  console.log(this.allContactsForCC);
                }
              }
            })
          }
        }
  
        if (this.openFromContact) {
          this.mailAttention = this.idContact
          if(this.idCompany){
            this.mailTo = this.idCompany
          }
        }
        this.loading = false
      });
    });
    } else{
      // get all contacts for cc dropdown
    this.contactService.getEmployeeDropdown().subscribe(contactData => {
      this.loading = false;
      this.allContactsForCC = contactData;
      // For selecting the logged in user as default cc
      if(!preselectCC.id && !this.isPreselectCC){
        preselectCC = this.allContactsForCC.filter((x: any) => x.id == this.loggedInUser)[0]
      this.tmpContactId.push({ "id": preselectCC.id, "itemName": preselectCC.itemName })
      console.log(this.allContactsForCC)
      this.isPreselectCC = true;
      } 
      
      //get contacts for attention dropdown from company
      this.companyServices.getActiveContactOfComDD(this.idCompany).subscribe(r => {
        this.contacts = _.sortBy(r, function (i: any) { return i.itemName.toLowerCase(); });
        if (this.openFromRfp) {
          if (this.rfpSubmit.idContact) {
            if (this.contacts.filter((x: any) => x.id == this.rfpSubmit.idContact).length > 0) {
              this.mailAttention = this.contacts.filter((x: any) => x.id == this.rfpSubmit.idContact)[0].id
            }
          }
          if (this.rfpSubmit.scopeReview && this.rfpSubmit.scopeReview.contactsCc) {
            let contactCCList = this.rfpSubmit.scopeReview.contactsCc.split(",");
            this.tmpContactId = [];
            contactCCList.forEach((data: any) => {
              if (this.allContactsForCC && this.allContactsForCC.length > 0) {
                if (this.allContactsForCC.filter((x: any) => x.id == data)) {
                  let tmpContactInfo = this.allContactsForCC.filter((x: any) => x.id == data)[0];
                  this.tmpContactId.push({ "id": tmpContactInfo.id, "itemName": tmpContactInfo.itemName })
                  console.log(this.allContactsForCC)
                }
              }
            })
          }
        }
  
        if (this.openFromContact) {
          this.mailAttention = this.idContact
          if(this.idCompany){
            this.mailTo = this.idCompany
          }
        }
        this.loading = false
      });
    });
    }
    
  }

  /**
    * This method get all Employee
    * @method getAllEmployee
  */
  private getAllEmployee() {
    let loggedUserId = JSON.parse(localStorage.getItem('userLoggedInId'))
    this.employeeServices.getEmpDropdown().subscribe(employeeData => {
      this.mailFrom = loggedUserId
      this.empList = _.sortBy(employeeData, function (i: any) { return i.employeeName.toLowerCase(); });
      this.employee = employeeData.data
    })
  }

  /**
   * This method get all comapny list
   * @method getCompanies
   */
  private getCompanies() {
    this.companyServices.getCompanyDropDown().subscribe(r => {
      this.companies = _.sortBy(r, function (i: any) { return i.name.toLowerCase(); });
      if (this.openFromRfp && this.rfpSubmit.idCompany) {
        this.mailTo = this.companies.filter(x => x.id == this.rfpSubmit.idCompany)[0].id
      }
      if (this.openFromCompany || this.openFromContact) {
        this.mailTo = this.idCompany
      }
      this.getContacts();
    })
  }


  /* dropdown should not close */
  private closeDropdown(event: any) {
    event.stopPropagation();
  }

  /**
   * This method open popup for send email
   * @method openModal
   * @param {TemplateRef} template 
   */
  private openModal(template: TemplateRef<any>) {
    this.rfpSubmitService.downloadPdf(this.idRfp).subscribe(r => {
      this.proposalPDFFile = r.pdfFilePath
      this.proposalFileSize = r.pdfFilesize
    }); // If Pdf is not generate on server then it generate on server

    this.modalRef = this.modalService.show(template, { class: 'modal-send-email' })
  }

  /**
   * This method open popup for fee schedule
   * @method openModalFeeSchedule
   * @param {TemplateRef} template 
   */
  private openModalFeeSchedule(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-fee-schedule' })
  }

  /**
   * This method get RFP detail from IDRfp
   * @method getRfpDetail
   */
  private getRfpDetail() {
    this.rfpListService.getById(this.idRfp).subscribe(r => {
      this.rfpNumber = r.rfpNumber
      this.rfpSubmit = r
      if (this.rfpSubmit.completedStep >= 4) {
        this.rfpSubmitService.downloadPdf(this.idRfp).subscribe(r => {
          if (r && r[0]['key'] == 'pdfFilePath') {
            this.proposalPDFFile = r[0]['value']
          }
          if(r && r[1]['key'] == 'pdfFilesize'){
            this.proposalFileSize = r[1]['pdfFilesize']
          }
        });
        this.IsProposalPDFAttached = true
      } else {
        this.IsProposalPDFAttached = false
      }

      if (this.rfpSubmit.status == null) {
        this.rfpSubmit.status = 0
      }
      this.loadAllMasterDD()
      this.getHeaderStatus(r)
    })
  }

  /**
   * This method calls all master data
   * @method loadAllMasterDD
   */
  loadAllMasterDD() {
    this.getmailTypes();
    this.getmailViaData();
    this.getAllEmployee();
    this.getCompanies();
  }

  /**
   * This method set processing dots as per status
   * @method getHeaderStatus
   * @param {any} r RFP Response 
   */
  getHeaderStatus(r: any) {
    if (r.completedStep >= 5) {
      this.showStep1 = this.showStep2 = this.showStep3 = this.showStep4 = this.showStep5 = 'success'
    } else if (r.completedStep >= 4) {
      this.showStep1 = this.showStep2 = this.showStep3 = this.showStep4 = 'success'
    } else if (r.completedStep >= 3) {
      this.showStep1 = this.showStep2 = this.showStep3 = 'success'
    } else if (r.completedStep >= 2) {
      this.showStep1 = this.showStep2 = 'success'
    } else if (r.completedStep >= 1) {
      this.showStep1 = 'success'
    }
  }

  /**
   * This method download RFP proposal PDF
   * @method downloadPdf
   */
  private downloadPdf() {
    this.rfpSubmitService.downloadPdf(this.idRfp).subscribe(r => {
      this.proposalPDFFile = r.pdfFilePath
      window.open(r.pdfFilePath, '_blank');
    })
  }

  /**
   * This method Send E-mail while click on Send from Popup
   * @method sendEmail
   */
  sendEMail() {
    $('#sndEmail').prop("disabled", true);
    let module = ""
    this.loading = true
    for (let i = 0; i < this.tmpContactId.length; i++) {
      this.mailCc.push(parseInt(this.tmpContactId[i].id));
    }
    let RfpMailData = {
      "idContactsCc": this.mailCc,
      "idFromEmployee": this.mailFrom,
      "idContactsTo": this.mailTo == -1 ? null : this.mailTo,
      "idContactAttention": this.mailAttention,
      "idTransmissionType": this.mailVia,
      "idEmailType": this.mailType,
      "body": this.mailBody,
      "subject": this.subject
    }
    // If any extra attachment is attached
    if (this.documents && this.documents.length > 0) {
      RfpMailData['isAdditionalAtttachment'] = true
    } else {
      RfpMailData['isAdditionalAtttachment'] = false
    }

    if (this.openFromRfp) {
      module = "RFP"
    }
    if (this.openFromContact) {
      module = "Contacts"
    }
    if (this.openFromCompany) {
      module = "Company"
    }
     this.sendEmailApi(RfpMailData, module)
  }

  /**
   * This method Call Email API as per module 
   * @method sendEmailApi
   * @param {any} RfpMailData Data for Email
   * @param {string} module Module Name
   */
  sendEmailApi(RfpMailData: any, module: string) {
    if (module == "RFP") {
      RfpMailData['IsProposalPDFAttached'] = this.IsProposalPDFAttached
      this.rfpSubmitService.sendmailRFP(RfpMailData, this.idRfp).subscribe(r => {
        this.uploadDocumentsinDB(this.idRfp, module, r['idRFPEmailHistory'])
        if (!RfpMailData['isAdditionalAtttachment']) {
          this.toastr.success(this.errorMsg.successEmail, 'Success')
          this.modalRef.hide()
          this.loading = false
        }
      }, e =>{
        this.loading = false
      })
    }
    if (module == "Contacts") {
      this.contactService.sendmail(RfpMailData, this.idContact).subscribe(r => {
        this.uploadDocumentsinDB(this.idContact, module, r['idContactEmailHistory'])
        if (!RfpMailData['isAdditionalAtttachment']) {
          this.toastr.success(this.errorMsg.successEmail, 'Success')
          this.modalRef.hide()
          this.loading = false
        }
      }, e =>{
        this.loading = false
      })
    }
    if (module == "Company") {
      this.companyServices.sendmail(RfpMailData, this.idCompany).subscribe(r => {
        this.uploadDocumentsinDB(this.idCompany, module, r['idCompanyEmailHistory'])
        if (!RfpMailData['isAdditionalAtttachment']) {
          this.toastr.success(this.errorMsg.successEmail, 'Success')
          this.modalRef.hide()
          this.loading = false
        }
      }, e =>{
        this.loading = false
      })
    }
  }

  /**
   * This methos Upload Extra Document
   * @method uploadDocumentsinDB
   * @param {number} id RFpID
   * @param {string} module Module Name
   * @param {number} idEmailHistory ID of Email History 
   */
  uploadDocumentsinDB(id: number, module: string, idEmailHistory: number) {
    if (this.documents && this.documents.length > 0 && !this.exceedFileSize) {
      let formData = new FormData();
      for (var i = 0; i < this.documents.length; i++) {
        formData.append('documents_' + i, this.documents[i])
      }
      if (module == "RFP") {
        formData.append('idRfp', id.toString())
        formData.append('idRFPEmailHistory', idEmailHistory.toString())
        formData.append('IsProposalPDFAttached', this.IsProposalPDFAttached.toString())
        this.rfpSubmitService.saveExtraRfpAttachment(formData).subscribe(r => {
          this.toastr.success(this.errorMsg.successEmail, 'Success')
          this.modalRef.hide()
          this.loading = false
        }, e => {
          this.loading = false;
         })
      }
      if (module == "Contacts") {
        formData.append('idContact', id.toString())
        formData.append('idContactEmailHistory', idEmailHistory.toString())
        this.contactService.saveExtraAttachment(formData).subscribe(r => {
          this.toastr.success(this.errorMsg.successEmail, 'Success')
          this.modalRef.hide()
          this.loading = false
        }, e => { })
      }
      if (module == "Company") {
        formData.append('idCompany', id.toString())
        formData.append('idCompanyEmailHistory', idEmailHistory.toString())
        this.companyServices.saveExtraAttachment(formData).subscribe(r => {
          this.toastr.success(this.errorMsg.successEmail, 'Success')
          this.modalRef.hide()
          this.loading = false
        }, e => { 
          this.loading = false;
        })
      }
    }
  }

  /**
   * This method calls when document is attached
   * @method documentUpload
   * @param {any} evt Event Object 
   */
  documentUpload(evt: any) {
    if (this.documents == null) {
      this.documents = []
    }
    let files = evt.target.files;
    // let totalFileSize = 0
    this.totalFileSize = parseFloat(this.proposalFileSize)
    for (var i = 0; i < files.length; i++) {
      this.totalFileSize = parseFloat(this.totalFileSize.toString()) + parseFloat(files[i].size)
      this.documents.push(files[i]);
    }
    if (this.totalFileSize > this.constantValues.maxEmailAttachmentSize) {
      this.exceedFileSize = true
    }
  }

  /**
   * This method delete document
   * @method deleteDocument
   * @param {any} d Document Object 
   */
  deleteDocument(d: any) {
    this.totalFileSize = parseFloat(this.totalFileSize.toString()) - parseFloat(d.size)
    if (this.totalFileSize < this.constantValues.maxEmailAttachmentSize) {
      this.exceedFileSize = false
    }
    this.documents.splice(this.documents.indexOf(d), 1)
  }

  /**
   * This method get email body when email template is change 
   * @method setEmailBody
   */
  setEmailBody() {
    if (this.mailType) {
      this.rfpSubmitService.getByEmailType(this.mailType).subscribe(r => {
        this.subject = this.replaceEmailBodyVariable(r.subject)
        this.emailTemplate = r.emailBody
        this.mailBody = this.replaceEmailBodyVariable(this.emailTemplate)

      })
    }
  }

  /**
   * This method calls when click on attention email body variable will replace
  //  * @method changeTheConatcts
  //  */
  changeTheConatcts() {
      this.loading = true;
      this.companyServices.getActiveContactOfComDD(this.idCompany).subscribe(r => {

        this.contacts = _.sortBy(r, function (i: any) { return i.itemName.toLowerCase(); });
        this.loading = false;
        if (this.openFromRfp) {
          if (this.rfpSubmit.idContact) {
            if (this.contacts.filter((x: any) => x.id == this.rfpSubmit.idContact).length > 0) {
              this.mailAttention = this.contacts.filter((x: any) => x.id == this.rfpSubmit.idContact)[0].id
            }
          }
          if (this.rfpSubmit.scopeReview && this.rfpSubmit.scopeReview.contactsCc) {
            let contactCCList = this.rfpSubmit.scopeReview.contactsCc.split(",");
            this.tmpContactId = [];
            contactCCList.forEach((data: any) => {
              if (this.allContactsForCC && this.allContactsForCC.length > 0) {
                if (this.allContactsForCC.filter((x: any) => x.id == data)) {
                  let tmpContactInfo = this.allContactsForCC.filter((x: any) => x.id == data)[0];
                  this.tmpContactId.push({ "id": tmpContactInfo.id, "itemName": tmpContactInfo.itemName })
                }
              }
            })
          }
        }
  
        if (this.openFromContact) {
          this.mailAttention = this.idContact
          if(this.idCompany){
            this.mailTo = this.idCompany
          }
        }
        this.loading = false
      });
  }
  /**
   * This method calls when click on attention email body variable will replace
   * @method changeEmailBody
   */
  changeEmailBody() {
    this.mailBody = this.replaceEmailBodyVariable(this.emailTemplate)
  }

  /**
   * This method replace email template variable with actual data
   * @method replaceEmailBodyVariable
   * @param {any} content Email Message Content
   */
  replaceEmailBodyVariable(content: any) {
    let actualContent = ""
    let firstName = ""
    let lastName = ""
    let companyName = ""
    if (content) {
      actualContent = content
      if (content.indexOf("##firstname##") != "-1") {
        if (this.mailAttention) {
          firstName = this.contacts.filter(x => x.id == this.mailAttention)[0].firstName
        }
        if (firstName!= null || firstName!= undefined  ){
          actualContent = actualContent.replace("##firstname##", firstName)
        }else {
          actualContent = actualContent.replace("##firstname##", '')
        }
      }
      if (content.indexOf("##lastname##") != "-1") {
        if (this.mailAttention) {
          lastName = this.contacts.filter(x => x.id == this.mailAttention)[0].lastName
        }
        if (lastName!= null || lastName!= undefined  ){
          actualContent = actualContent.replace("##lastname##", lastName)
        }else {
          actualContent = actualContent.replace("##lastname##", '')
        }
      }
      if (content.indexOf("##company##") != "-1") {
        if (this.mailTo) {
          companyName = this.companies.filter(x => x.id == this.mailTo)[0].name
        }
        if (companyName!= null ||companyName!= undefined ){
          actualContent = actualContent.replace("##company##", companyName)
        } else {
          actualContent = actualContent.replace("##company##", '')
        }
        
      }
      if (content.indexOf("##rfp##") != "-1") {
        if (this.idRfp != undefined || this.idRfp != null) {
          if (content.indexOf("##rfp##") != "-1" && this.idRfp) {
            actualContent = actualContent.replace("##rfp##", this.idRfp.toString())
          }
        } else {
          actualContent = actualContent.replace("##rfp##", '')
        }
       
      }
      if (content.indexOf("##job##") != "-1") {
        actualContent = actualContent.replace("##job##", "")
      }
      if(content.indexOf("##address##") != "-1"){
        let address = "";
        if(this.openFromRfp && this.rfpSubmit.rfpAddress){ 
          address = this.rfpSubmit.rfpAddress.houseNumber + " "  +
          this.rfpSubmit.rfpAddress.street + ", " + this.rfpSubmit.rfpAddress.borough.description;
          if(this.rfpSubmit.rfpAddress.zipCode){
            address += ", " + this.rfpSubmit.rfpAddress.zipCode;
          }
          if (this.rfpSubmit.specialPlace) {
            address += ", " + this.rfpSubmit.specialPlace;
          }
          actualContent = actualContent.replace("##address##", address);
        }
      }
      return actualContent
    } else {
      return ''
    }
  }
}