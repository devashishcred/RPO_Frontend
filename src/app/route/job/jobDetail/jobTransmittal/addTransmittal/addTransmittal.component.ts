import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { cloneDeep } from 'lodash';
import { Router, ActivatedRoute, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppComponent } from '../../../../../app.component';
import { MailType } from '../../../../../types/mailType';
import { MailVia } from '../../../../../types/mailVia';
import { Contact } from '../../../../../types/contact';
import { Company } from '../../../../../types/company';
import { Job } from '../../../../../types/job';
import { ContactServices } from '../../../../contact/contact.services';
import { CompanyServices } from '../../../../company/company.services';
import { Employee } from '../../../../../types/employee';
import { EmployeeServices } from '../../../../employee/employee.services';
import { RfpSubmitServices } from '../../../../addRfp/rfpSubmit/rfpSubmit.services';
import { Message } from '../../../../../app.messages';
import * as _ from 'underscore';
import { constantValues } from '../../../../../app.constantValues';
import { TransmittalServices } from '../jobTransmittal.service';
import { JobDocumentServices } from '../../jobDocument/jobDocument.service';
import { SharedService } from '../../../../../app.constantValues';
import { TaskServices } from '../../../../task/task.services';
import { TreeviewItem, TreeviewConfig } from 'ngx-treeview';

declare const $: any

/**
 * This component contains all function that are used in Add TransMittal
 * @class AddTransMittalComponent
 */
@Component({
  selector: '[add-transmittal]',
  templateUrl: './addTransmittal.component.html',
})
export class AddTransMittalComponent implements OnInit, OnDestroy {
  @Input() sendemail: any
  @Input() modalRef: BsModalRef
  @Input() jobObj: Job
  @Input() idJob: number
  @Input() reload: Function
  @Input() idOldTrasmittal: number
  @Input() isResend: boolean
  @Input() isRevise: boolean
  @Input() idTask: number
  @Input() isHeader: boolean
  @Input() createNewTransmittal?: boolean
  @Input() fromReports?: boolean;
  @Input() reportDocument?: any = {};
  /**
   * selectJobDocument add/edit form
   * @property selectJobDocument
   */
  @ViewChild('selectJobDocument', {static: true})
  private selectJobDocument: TemplateRef<any>
  modalRefDoc: BsModalRef

  private ckeditorContent: string;
  private sub: any;
  private contactTo: Contact[] = [];
  private contactCc: Contact[] = [];
  contacts: Contact[] = []
  private contact: Contact;
  private employee: Employee[] = []
  loading: boolean = false
  private rfpNumber: string
  private dropdownSettings: any = {};
  private dropdownList: any = [];
  private recipientEmailList: any = [];
  private id: number
  mailFrom: string
  private mailCc: Array<any> = []
  mailTo: number
  mailType: number
  mailVia: number
  mailAttention: number = null;
  mailBody: string = ''
  private files: Array<string> = []
  private showNavigationTabs: boolean = true
  private showStep1: string = ''
  private showStep2: string = ''
  private showStep3: string = ''
  private showStep4: string = ''
  private showStep5: string = ''
  empList: any
  companies: Company[] = []
  errorMsg: any
  private proposalPDFFile: string = ""
  private proposalFileSize: string = ""
  documents: any
  private totalFileSize: number
  exceedFileSize: boolean = false
  private allMailTypes: MailType[] = []
  mailTypes: MailType[] = []
  mailViaData: MailVia[] = []
  subject: string
  private emailTemplate: any
  private openFormJob: boolean = true
  jobTransmittalAttachments: any
  disabled: boolean = false
  dropdownEnabled: boolean = true
  private idCompany: number
  jobDocumentList: any = []
  documentsToDelete: any = []
  private attachmentsToDelete: any = []
  private currentRoute: string
  private messageFromTaskData: string = ''
  treeViewConfig: any = {
    hasAllCheckBox: true,
    hasFilter: true,
    hasCollapseExpand: true,
    decoupleChildFromParent: false,
    maxHeight: 500,
  }

  draftToSend: boolean = false
  contactCCItems: TreeviewItem[];
  treeViewButtonClasses = [
    'btn-outline-primary',
    'btn-outline-secondary',
    'btn-outline-success',
    'btn-outline-danger',
    'btn-outline-warning',
    'btn-outline-info',
    'btn-outline-light',
    'btn-outline-dark'
  ];
  buttonClass = this.treeViewButtonClasses[3];

  private savedJobTransmittalCCs: any = []
  selectedValue: any;

  constructor(
    private contactService: ContactServices,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private employeeServices: EmployeeServices,
    private companyServices: CompanyServices,
    private message: Message,
    public constantValues: constantValues,
    private rfpSubmitService: RfpSubmitServices,
    private transmittalService: TransmittalServices,
    private jobDocumentServices: JobDocumentServices,
    private sharedService: SharedService,
    private elementRef: ElementRef,
    private taskServices: TaskServices
  ) {
    this.errorMsg = this.message.msg
    // enable current tab
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = this.router.url.substr(this.router.url.lastIndexOf('/') + 1)
      }
    })
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.loading = true
    document.title = 'Project'
    // this.dropdownSettings = {
    //   singleSelection: false,
    //   text: "Contacts",
    //   selectAllText: 'Select All',
    //   unSelectAllText: 'UnSelect All',
    //   enableSearchFilter: true,
    //   enableCheckAll: true,
    //   classes: "myclass custom-class",
    //   groupBy:'idGroup',
    // };

    if (!this.createNewTransmittal) {
      this.createNewTransmittal = false;
      this.getTaskDetail();
    }

    if (this.isResend) {
      this.dropdownEnabled = false;
      this.disabled = true
    }


    this.loadAllMasterDD()
  }

  ngOnDestroy() {
    this.idTask = null;
    this.idOldTrasmittal = null;
    this.mailBody = null;
  }

  loadTransmittal() {

    if (this.idOldTrasmittal && this.idOldTrasmittal > 0) {
      this.transmittalService.getById(this.idOldTrasmittal).subscribe(r => {
        this.mailFrom = r.idFromEmployee
        this.mailTo = r.idToCompany
        this.getContacts();
        this.mailAttention = r.idContactAttention
        this.mailVia = r.idTransmissionType
        this.mailType = r.idEmailType
        this.mailBody += r.emailMessage
        this.subject = r.emailSubject
        this.mailCc = []
        this.loading = false;
        if (r.isDraft) {
          this.draftToSend = true
        }
        if (r.jobTransmittalCCs && r.jobTransmittalCCs.length > 0) {
          this.savedJobTransmittalCCs = r.jobTransmittalCCs;
        }
        this.jobTransmittalAttachments = r.jobTransmittalAttachments
        this.jobDocumentList = r.jobTransmittalJobDocuments
      })
    }
  }

  onReady() {
    this.loadTransmittal();
  }

  getTaskDetail() {
    if (this.idTask) {
      this.taskServices.getTaskById(this.idTask).subscribe(r => {
        let taskDetail = r;
        if (taskDetail) {
          if (taskDetail.jobApplication) {
            this.messageFromTaskData += taskDetail.jobApplication + '<br>';
          }
          if (taskDetail.taskJobDocuments.length > 0) {
            this.jobDocumentList = taskDetail.taskJobDocuments;
          }
          if (taskDetail.workPermitType) {
            this.messageFromTaskData += 'Work Permit Type: ' + taskDetail.workPermitType + '<br>';
          }
          if (!this.mailBody) {
            this.mailBody = this.messageFromTaskData;
          }
        }
      });
    }
  }

  /**
   * Get all dropdown data from Email Type master
   * @method getmailTypes
   */
  private getmailTypes() {
    let module = "Job"
    this.rfpSubmitService.getMailTypesDD(module).subscribe(r => {
      this.mailTypes = _.sortBy(r, function (i: any) {
        return i.itemName.toLowerCase();
      });
    })
  }

  /**
   * Get all dropdown data from send via master
   * @method getmailViaData
   */
  private getmailViaData() {
    this.rfpSubmitService.getMailViaDD().subscribe(r => {
      this.mailViaData = _.sortBy(r, function (i: any) {
        return i.itemName.toLowerCase();
      });
    })
  }

  /**
   *  Get all dropdown data from contacts
   * @method getContacts
   */
  getContacts(editTime?: boolean) {
    editTime = editTime ? editTime : false;
    if (this.mailTo) {
      this.idCompany = this.mailTo
    } else {
      this.idCompany = -1
    }
    this.transmittalService.getJobContactsContactsListDDContact(this.idJob, this.idCompany, editTime).subscribe(r => {
      this.contacts = _.sortBy(r, function (i: any) {
        return i.itemName.toLowerCase();
      });
      if (this.openFormJob) {
        if (this.jobObj.idContact && !this.mailAttention) {
          this.mailAttention = this.jobObj.idContact
        }
      }
      this.loading = false
    })
    this.transmittalService.getJobContactsEmployeesListDD(this.idJob, this.idCompany, editTime).subscribe(r => {
      if (r && r.length > 0) {
        let arr: any = []
        for (let i = 0; i < r.length; i++) {
          // saved items set selected in cc dropdown 
          if (this.savedJobTransmittalCCs && this.savedJobTransmittalCCs.length > 0) {
            if (r[i].children && r[i].children.length > 0) {
              for (let j = 0; j < r[i].children.length; j++) {
                let matchedChildren = this.savedJobTransmittalCCs.filter((x: any) => x == r[i].children[j].value);
                if (matchedChildren && matchedChildren.length > 0) {
                  r[i].children[j].checked = true;
                }
              }
            } else {
              let matchedItem = this.savedJobTransmittalCCs.filter((x: any) => x == r[i].value);
              if (matchedItem && matchedItem.length > 0) {
                r[i].checked = true;
              }
            }
          }
          const item = new TreeviewItem(r[i]);
          arr.push(item);
        }
        console.log(arr)
        this.contactCCItems = arr;
        console.log(this.contactCCItems)
      }
      if (this.openFormJob) {
        if (this.jobObj.idContact && !this.mailAttention) {
          this.mailAttention = this.jobObj.idContact
        }
      }
    })
  }

  onSelectedChange(event: any) {
    if (event.length == 0) {
      this.selectedValue = "Select options"
    } else {
      this.selectedValue = event.length + "  options selected"
    }

    this.mailCc = event;
  }

  onFilterChange(event: any) {
  }

  /**
   *  Get all dropdown data from Employee
   * @method getAllEmployee
   */
  private getAllEmployee() {
    let loggedUserId = JSON.parse(localStorage.getItem('userLoggedInId'))
    this.employeeServices.getEmpDropdown().subscribe(employeeData => {
      this.mailFrom = loggedUserId
      this.empList = _.sortBy(employeeData, function (i: any) {
        return i.employeeName.toLowerCase();
      });
      this.employee = employeeData.data
    })
  }

  /**
   *  Get all dropdown data from Companies
   * @method getCompanies
   */
  private getCompanies() {
    this.transmittalService.getJobContactsCompanyListDD(this.idJob).subscribe(r => {
      this.companies = _.sortBy(r, function (i: any) {
        return i.itemName.toLowerCase();
      });
      this.getContacts(true);
    })
  }


  /**
   * This method is used to restrict user from closing popup
   * @method closeDropdown
   * @param {any} event event is an object of input element
   */
  private closeDropdown(event: any) {
    event.stopPropagation();
  }

  /**
   * This method is used to open modal popup for sending an email
   * @method openModal
   * @param {any} template type which contains template of create/edit module
   */
  private openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-send-email'})
  }

  /**
   * This method is used to open modal popup for Fee schedule
   * @method openModalFeeSchedule
   * @param {any} template type which contains template of create/edit module
   */
  private openModalFeeSchedule(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-fee-schedule'})
  }

  /**
   * This methodi is used to load all master data that are used in these function
   * @method loadAllMasterDD
   */
  loadAllMasterDD() {
    this.getmailTypes();
    this.getmailViaData();
    this.getCompanies();
    this.getContacts(true);
    this.getAllEmployee();
  }

  /**
   * This method is used to open modal popup for job document
   * @method openDocumentModal
   * @param {any} template type which contains template of create/edit module
   */
  openDocumentModal(template: TemplateRef<any>) {
    this.modalRefDoc = this.modalService.show(template, {
      class: 'modal-doc-search',
      backdrop: 'static',
      'keyboard': false
    })
  }


  /**
   * This method is used for making selection of documents from list
   * @method getSelectedDocument
   * @param {any} document document is an object of documents
   */
  getSelectedDocument(document: any) {
    if (document) {
      this.jobDocumentList = document;
    }
  }

  /**
   * This method is used for making selection of documents from list
   * @method getSelectedDocumentToDelete
   */
  getSelectedDocumentToDelete(documentsToDelete: any) {
    if (documentsToDelete) {
      this.documentsToDelete = documentsToDelete;
    }
  }


  /**
   * This method is used to delete job document from transmittal
   * @method deleteJobDoc
   * @param {number} id  of Jobdocument that we need to delete from transmittal
   */
  deleteJobDoc(id: number, idJobDocument?: number) {
    if (id) {
      this.jobDocumentList = this.jobDocumentList.filter((x: any) => x.id != id);
      this.documentsToDelete.push(id);
    } else {
      this.jobDocumentList = this.jobDocumentList.filter((x: any) => x.idJobDocument != idJobDocument);
    }
  }

  /**
   * This method Send E-mail while click on Send from Popup
   * @method sendEmail
   */
  sendEMail(isDraft?: boolean) {
    if (this.mailBody.length <= 8000) {

      let module = ""
      this.loading = true
      let jobTransmittalJobDocuments: any = [];
      if (this.jobDocumentList && this.jobDocumentList.length > 0) {
        for (let i = 0; i < this.jobDocumentList.length; i++) {
          let tempObj = {};
          tempObj['idJobDocument'] = this.jobDocumentList[i].idJobDocument;
          tempObj['copies'] = this.jobDocumentList[i].copies;
          tempObj['id'] = this.jobDocumentList[i].id;
          tempObj['code'] = this.jobDocumentList[i].documentCode;
          jobTransmittalJobDocuments.push(tempObj);
        }
      }
      let JobMailData = {
        "transmittalCCs": this.mailCc,
        "idFromEmployee": this.mailFrom,
        "idContactsTo": this.mailTo,
        "idContactAttention": this.mailAttention,
        "idTransmissionType": this.mailVia,
        "idEmailType": this.mailType,
        "body": this.mailBody,
        "subject": this.subject
      }
      // for save draft
      if (isDraft) {
        JobMailData['isDraft'] = isDraft;
      }
      //pass job document
      if (jobTransmittalJobDocuments && jobTransmittalJobDocuments.length > 0) {
        JobMailData['jobTransmittalJobDocuments'] = jobTransmittalJobDocuments;
      }
      //if existing job document deleted
      if (this.documentsToDelete && this.documentsToDelete.length > 0) {
        JobMailData['documentsToDelete'] = this.documentsToDelete;
      }
      if (this.attachmentsToDelete && this.attachmentsToDelete.length > 0) {
        JobMailData['attachmentsToDelete'] = this.attachmentsToDelete;
      }
      // If any extra attachment is attached
      if (this.documents && this.documents.length > 0) {
        JobMailData['isAdditionalAtttachment'] = true
      } else {
        JobMailData['isAdditionalAtttachment'] = false
      }

      if (this.idOldTrasmittal && this.idOldTrasmittal > 0) {
        JobMailData['idOldTrasmittal'] = this.idOldTrasmittal
      }

      if (this.isResend) {
        JobMailData['isResend'] = this.isResend
      }

      if (this.isRevise) {
        JobMailData['isRevise'] = this.isRevise
      }

      if (this.jobTransmittalAttachments && this.jobTransmittalAttachments.length > 0) {
        JobMailData['jobTransmittalAttachments'] = this.jobTransmittalAttachments
      }

      if (this.idTask) {
        JobMailData['idTask'] = this.idTask;
      }

      if (this.openFormJob) {
        module = "Job"
      }

      if (this.fromReports) {
        JobMailData['ReportDocumentName'] = this.reportDocument.name;
        JobMailData['ReportDocumentPath'] = this.reportDocument.path;
      }
      this.sendEmailApi(JobMailData, module, isDraft)


    } else {
      this.toastr.error(`Message consists of ${this.mailBody.length} characters. It cannot be more than 8000.`)
    }
  }

  /**
   * This method preview E-mail while click on Preview from Popup
   * @method previewTransmittal
   */
  previewTransmittal() {
    this.loading = true
    let jobTransmittalJobDocuments: any = [];
    if (this.jobDocumentList && this.jobDocumentList.length > 0) {
      for (let i = 0; i < this.jobDocumentList.length; i++) {
        let tempObj = {};
        tempObj['idJobDocument'] = this.jobDocumentList[i].idJobDocument;
        tempObj['copies'] = this.jobDocumentList[i].copies;
        tempObj['code'] = this.jobDocumentList[i].documentCode;
        tempObj['name'] = this.jobDocumentList[i].documentName;
        jobTransmittalJobDocuments.push(tempObj);
      }
    }
    let JobMailData = {
      "transmittalCCs": this.mailCc,
      "idFromEmployee": this.mailFrom,
      "idContactsTo": this.mailTo,
      "idContactAttention": this.mailAttention,
      "idTransmissionType": this.mailVia,
      "idEmailType": this.mailType,
      "body": this.mailBody,
      "subject": this.subject
    }

    //pass job document
    if (jobTransmittalJobDocuments && jobTransmittalJobDocuments.length > 0) {
      JobMailData['jobTransmittalJobDocuments'] = jobTransmittalJobDocuments;
    }
    //if existing job document deleted
    if (this.documentsToDelete && this.documentsToDelete.length > 0) {
      JobMailData['documentsToDelete'] = this.documentsToDelete;
    }
    if (this.attachmentsToDelete && this.attachmentsToDelete.length > 0) {
      JobMailData['attachmentsToDelete'] = this.attachmentsToDelete;
    }
    JobMailData['jobTransmittalAttachments'] = [];
    if (this.documents && this.documents.length > 0) {
      for (var i = 0; i < this.documents.length; i++) {
        JobMailData['jobTransmittalAttachments'].push({name: this.documents[i].name})
      }
    }
    if (this.jobTransmittalAttachments && this.jobTransmittalAttachments.length > 0) {
      for (let i = 0; i < this.jobTransmittalAttachments.length; i++) {
        JobMailData['jobTransmittalAttachments'].push({name: this.jobTransmittalAttachments[i].name})
      }
    }
    if (this.idOldTrasmittal && this.idOldTrasmittal > 0) {
      JobMailData['idOldTrasmittal'] = this.idOldTrasmittal
    }
    if (this.isResend) {
      JobMailData['isResend'] = this.isResend
    }
    if (this.isRevise) {
      JobMailData['isRevise'] = this.isRevise
    }
    if (this.idTask) {
      JobMailData['idTask'] = this.idTask;
    }
    this.transmittalService.previewTransmittal(this.idJob, JobMailData).subscribe(r => {
      this.loading = false;
      window.open(r.value, "_blank");
    });
  }

  /**
   * This method Send E-mail and documents sending api
   * @method sendEmailApi
   */
  sendEmailApi(JobMailData: any, module: string, isDraft?: boolean) {
    if (module == "Job") {
      this.transmittalService.sendmail(JobMailData, this.idJob, this.idOldTrasmittal, JobMailData['isDraft'], this.draftToSend).subscribe(r => {
        this.uploadDocumentsinDB(this.idJob, module, r['idJobTransmittal'], JobMailData['isDraft'])
        if (!JobMailData['isAdditionalAtttachment']) {
          if (isDraft) {
            this.toastr.success(this.errorMsg.successDraft)
          } else {
            this.toastr.success(this.errorMsg.successEmail)
          }

          this.modalRef.hide()
          this.loading = false
          if (!this.idTask && !this.isHeader) {
            if (!this.isHeader) {
              this.reload()
            }
            if (this.isHeader) {
              this.sharedService.getJobTransmittalFromHeader.emit('trasmittalFromHeader');
            }
          }

        }
      }, e => {
        this.loading = false
      })
    }
  }

  /**
   * This method upload documents and save in database
   * @method uploadDocumentsinDB
   * @param {number} id id used as a id of job
   * @param {number} idJobTransmittal idJobTransmittal used as a id of transmittal
   * @param {string} module module is used for which module is passing like company,contact,RFP,job
   */
  uploadDocumentsinDB(id: number, module: string, idJobTransmittal: number, isDraft: boolean) {
    if (this.documents && this.documents.length > 0 && !this.exceedFileSize) {
      let formData = new FormData();
      for (var i = 0; i < this.documents.length; i++) {
        formData.append('documents_' + i, this.documents[i])
      }
      if (module == "Job") {
        formData.append('idJob', id.toString())
        formData.append('idJobTransmittal', idJobTransmittal.toString())
        formData.append('isDraft', isDraft ? "true" : "false")
        this.transmittalService.saveExtraAttachment(formData).subscribe(r => {
          this.toastr.success(this.errorMsg.successEmail)
          this.modalRef.hide()
          this.loading = false
          this.reload()
        }, e => {
          this.loading = false
        })
      }
    }
  }

  /**
   * This method is used to document upload
   * @method documentUpload
   * @param evt
   */
  documentUpload(evt: any) {
    if (this.documents == null) {
      this.documents = []
    }
    let files = evt.target.files;
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
   * This method is used to delete documents from object
   * @method deleteDocument
   * @param {any} d  d is used an element which is used to remove from documents
   */
  deleteDocument(d: any) {
    this.totalFileSize = parseFloat(this.totalFileSize.toString()) - parseFloat(d.size)
    if (this.totalFileSize < this.constantValues.maxEmailAttachmentSize) {
      this.exceedFileSize = false
    }
    this.documents.splice(this.documents.indexOf(d), 1)
  }

  /**
   * This method is used to delete documents those which are already attached
   * @method deleteAlreadyAttchedFile
   * @param {any} document  document is used an element which is used to remove from documents
   */
  deleteAlreadyAttchedFile(document: any) {

    if (!this.createNewTransmittal) {
      this.attachmentsToDelete.push(document.id);
    }

    this.jobTransmittalAttachments = _.without(this.jobTransmittalAttachments, _.findWhere(this.jobTransmittalAttachments, {id: document.id}));
  }

  /**
   * This method is used to prepare an email body
   * @method setEmailBody
   */
  setEmailBody() {
    if (this.mailType) {
      this.rfpSubmitService.getByEmailType(this.mailType).subscribe(r => {
        this.subject = this.replaceEmailBodyVariable(r.subject)
        this.emailTemplate = r.emailBody
        if (this.messageFromTaskData) {
          this.mailBody = this.messageFromTaskData + this.replaceEmailBodyVariable(this.emailTemplate);
        } else {
          this.mailBody = this.replaceEmailBodyVariable(this.emailTemplate)
        }
      })
    } else {
      this.subject = '';
      this.mailBody = '';
    }
  }

  /**
   * This method is used to change the email template on basis of selection sent via and email type
   * @method changeEmailBody
   *
   */
  changeEmailBody() {
    if (this.messageFromTaskData) {
      this.mailBody = this.messageFromTaskData + this.replaceEmailBodyVariable(this.emailTemplate);
    } else {
      this.mailBody = this.replaceEmailBodyVariable(this.emailTemplate)
    }
  }

  /**
   * This method is used to replace email template variable with actual data
   * @method changeEmailBody
   * @param {any} content content is an original template which need to replaced with some specific key words for preparing email template
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
        if (firstName != null || firstName != undefined) {
          actualContent = actualContent.replace("##firstname##", firstName)
        } else {
          actualContent = actualContent.replace("##firstname##", '')
        }
      }
      if (content.indexOf("##lastname##") != "-1") {
        if (this.mailAttention) {
          lastName = this.contacts.filter(x => x.id == this.mailAttention)[0].lastName
        }
        if (lastName != null || lastName != undefined) {
          actualContent = actualContent.replace("##lastname##", lastName)
        } else {
          actualContent = actualContent.replace("##lastname##", '')
        }

      }
      if (content.indexOf("##company##") != "-1") {
        if (this.mailTo) {
          companyName = this.companies.filter(x => x.id == this.mailTo)[0].itemName;

        }
        if (companyName != null || companyName != undefined) {
          actualContent = actualContent.replace("##company##", companyName)
        } else {
          actualContent = actualContent.replace("##company##", '')
        }
      }
      if (this.jobObj.id != undefined || this.jobObj.idRfp != null) {
        if (content.indexOf("##rfp##") != "-1" && this.jobObj.idRfp) {
          actualContent = actualContent.replace("##rfp##", this.jobObj.idRfp.toString())
        }
      } else {
        actualContent = actualContent.replace("##rfp##", '')
      }
      if (this.jobObj.id != undefined || this.jobObj.id != null) {
        if (content.indexOf("##job##") != "-1") {
          actualContent = actualContent.replace("##job##", this.jobObj.id.toString())
        }
      } else {
        actualContent = actualContent.replace("##job##", '')
      }
      if (content.indexOf("##address##") != "-1") {
        let address = "";
        if (this.jobObj.rfpAddress) {
          address = this.jobObj.rfpAddress.houseNumber + " " +
            this.jobObj.rfpAddress.street + ", " + this.jobObj.rfpAddress.borough.description;
          if (this.jobObj.rfpAddress.zipCode) {
            address += ", " + this.jobObj.rfpAddress.zipCode;
          }
          if (this.jobObj.specialPlace) {
            address += ", " + this.jobObj.specialPlace;
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