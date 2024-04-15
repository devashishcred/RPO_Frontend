import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, Pipe, PipeTransform } from '@angular/core';
import { cloneDeep } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RfpSubmitServices } from "./rfpSubmit.services";
import { AppComponent } from '../../../app.component';
import { ActivatedRoute } from '@angular/router';
import { rfp } from '../../../types/rfp';
import { RfpListService } from './../../rfp/rfp.services';
import { Router } from '@angular/router';
import { MailType } from '../../../types/mailType';
import { MailVia } from '../../../types/mailVia';
import { Contact } from '../../../types/contact';
import { Company } from '../../../types/company';
import { ContactServices } from '../../contact/contact.services';
import { CompanyServices } from '../../company/company.services';
import { Employee } from '../../../types/employee';
import { Job } from '../../../types/job';
import { EmployeeServices } from '../../employee/employee.services';
import { Message } from '../../../app.messages';
import * as _ from 'underscore';
import { constantValues } from '../../../app.constantValues';
import { UserRightServices } from '../../../services/userRight.services';
import * as moment from 'moment';

import { AddRfpProgressionNoteServices } from '../../rfpprogressionnote/addrfpprogressionnote.services';
import { AddRfpProgressionNote } from '../../rfpprogressionnote/addrfpprogressionnotes';

declare const $: any


/**
 * This component contains all function that are used in rfpSubmitComponent
 * @class rfpSubmitComponent
 */
@Component({
  templateUrl: './rfpSubmit.component.html',
  styleUrls: ['./rfpSubmit.component.scss'],
})


export class rfpSubmitComponent {
  @ViewChild('sendemail', {static: true})
  private sendemail: TemplateRef<any>

  @ViewChild('feeschedule', {static: true})
  private feeschedule: TemplateRef<any>

  @ViewChild('rfpprogressionnote', {static: true})
  private rfpprogressionnote: TemplateRef<any>

  modalRef: BsModalRef
  // @ViewChild('modalFeeSchedule')

  @ViewChild('formJob', {static: true})
  private formJob: TemplateRef<any>
  modalRefJob: BsModalRef
  modalRefFee: BsModalRef

  private ckeditorContent: string;
  private sub: any;
  rfpSubmit: rfp
  private contactTo: Contact[] = [];
  private contactCc: Contact[] = [];
  private contacts: Contact[] = []
  private contact: Contact;
  private employee: Employee[] = []
  loading: boolean = false
  rfpNumber: string
  private dropdownSettings: any = {};
  private dropdownList: any = [];
  private recipientEmailList: any = [];
  private tmpContactId: any = []
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
  showStep1: string = ''
  showStep2: string = ''
  showStep3: string = ''
  showStep4: string = ''
  private showStep5: string = ''
  private empList: any
  private companies: Company[] = []
  errorMsg: any
  private selectedContactsCC: any = []
  private proposalPDFFile: string = ""
  private proposalFileSize: string = ""
  private documents: any
  private totalFileSize: number
  private exceedFileSize: boolean = false
  jobObj: Job
  rfpStatusList: any = []
  rfpDetail: any = {}
  createdBy: string
  modifiedBy: string
  addRfpProgressionNote: any
  exsitingNotes: any = []
  isNewGenrealNote: boolean = false
  linkTobeJobs: any = []
  isTobeLinkJobId: string = "disabled";
  linkJobId: string
  poNumber: string
  from: string
  alreadyRFPLinkedWithJob: boolean = false;
  alreadyLinkedJobId: number;
  createdJobId: number;
  static newVM: any;
  //Job show hide
  showJobAddBtn: string = 'hide'

  private showRfpAddBtn: string = 'hide'
  private showRfpViewBtn: string = 'hide'
  private showRfpDeleteBtn: string = 'hide'
  showDisable: boolean = false;

  setVM(vm: any) {
    rfpSubmitComponent.newVM = vm;
  }

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
    private addRfpProgressionNoteServices: AddRfpProgressionNoteServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private appComponent: AppComponent,
  ) {
    this.tmpContactId = []
    this.errorMsg = this.message.msg
    this.permission(this.constantValues)
  }

  private mailTypes: MailType[] = []
  private mailViaData: MailVia[] = []

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.from = 'RFP';
    document.title = 'RFP'
    this.showRfpAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDRFP)
    this.showRfpViewBtn = this.userRight.checkAllowButton(this.constantValues.VIEWRFP)
    this.showRfpDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETERFP)

    this.loading = true
    this.rfpSubmit = {} as rfp
    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
      this.getRfpDetail()
      // In a real app: dispatch action to load the details here.
    });
    this.addRfpProgressionNote = {} as AddRfpProgressionNote
    this.loading = true
    this.getAddRfpProgressionNote()
    this.isNewGenrealNote = true
    this.jobObj = {} as Job
    this.alreadyGetLinkedJob();
    this.getTobeLinkJobsList();
    const vm = this
    this.setVM(vm);

    if (this.showRfpAddBtn == 'hide') {
      this.showDisable = true
      //     setTimeout(function(){
      //         this.showAddressAddBtn='hide'
      //         $(".wizard-body").addClass("disabled");
      //         $(".btn-area .btn-block, select, .ex-job .btn, .ex-job .form-control, .ex-job .ng-control").attr("disabled","disabled");
      //     },500);
    }

  }

  /**
   * This method is used to make link between RFP and JOB
   * @method getTobeLinkJobsList
   */
  private getTobeLinkJobsList() {
    this.loading = true;
    this.rfpSubmitService.getTobeLinkJobslist().subscribe(r => {
      this.linkTobeJobs = r;
      this.loading = false;
    });
  }


  /**
   * This method is used to make link between RFP and JOB
   * @method diLinkJob
   */
  diLinkJob(poId) {
    //     this.appComponent.showDeleteConfirmation(this.delete, ['D_LINK'])
    //    console.log("po",this.linkJobId);
    this.loading = true;
    let requestObj = {
      IdRfp: this.id.toString(),
      IdJob: this.alreadyLinkedJobId,
      PONumber: '',
      JobNumber: this.alreadyLinkedJobId
    };
    this.rfpSubmitService.DilinkRfpWithJob(requestObj).subscribe((r: any) => {
      if (r) {
        this.toastr.success("D-Link succuss");
        this.alreadyRFPLinkedWithJob = false;
      }
      this.loading = false;
    }, e => {
    })

  }


  private delete() {
    return new Promise((resolve, reject) => {
      console.log('hiii')
      this.loading = true;
      let requestObj = {
        IdRfp: this.id.toString(),
        IdJob: this.alreadyLinkedJobId,
        PONumber: '',
        JobNumber: this.alreadyLinkedJobId
      };
      this.rfpSubmitService.DilinkRfpWithJob(requestObj).subscribe(r => {
        console.log(r);
        resolve(null)
        this.loading = false;
      }, e => {
        reject()
      })
    })
  }

  /**
   * This method is used to make link button enabled if user selects job from dropdown
   * @method enableLinkBtn
   */
  enableLinkBtn() {
    if (this.linkJobId) {
      this.isTobeLinkJobId = "";
    } else {
      this.isTobeLinkJobId = "disabled";
    }
  }

  /**
   * This method is used to link existing job with current RFP details
   * @method linkRFPWithJob
   */
  linkRFPWithJob() {
    let requestObj = {idRfp: this.id, idJob: this.linkJobId, poNumber: this.poNumber};
    this.rfpSubmitService.linkRfpWithJob(requestObj).subscribe(r => {
      if (r && r.idJob) {
        this.toastr.success(this.errorMsg.successLinkRFPWithJob);
        this.alreadyRFPLinkedWithJob = true;
        this.createdJobId = r.idJob;
        this.alreadyLinkedJobId = r.jobNumber;
      }
    })
  }

  /**
   * This method set job object in session and shared service
   * @method setCommonJobData
   * @param {number} idJob ID of Job
   */
  setCommonJobData(idJob: number) {
    this.appComponent.setCommonJobObject(idJob);
  }

  /**
   * This method is used to check whether job is already link ot not, if it is linked than job number is displayed
   * otherwise it will show link job button
   * @method alreadyGetLinkedJob
   * @param {boolean} fromJob?? fromJob is used to indicate new job or want to link existing job
   */
  alreadyGetLinkedJob(fromJob?: boolean) {
    if (fromJob) {
      rfpSubmitComponent.newVM.rfpListService.alreadyGetLinkedJob(rfpSubmitComponent.newVM.id).subscribe((r: any) => {
        if (r && r.jobNumber) {
          rfpSubmitComponent.newVM.alreadyRFPLinkedWithJob = true;
          rfpSubmitComponent.newVM.createdJobId = r.id;
          rfpSubmitComponent.newVM.alreadyLinkedJobId = r.jobNumber;
        }
      })
    } else {
      this.rfpListService.alreadyGetLinkedJob(this.id).subscribe(r => {
        if (r && r.jobNumber) {
          this.alreadyRFPLinkedWithJob = true;
          this.createdJobId = r.id;
          this.alreadyLinkedJobId = r.jobNumber;
        }
      })
    }

  }

  /**
   * This method is used to open modal popup for downlaod pdf
   * @method openModalForm
   * @param {any} template type which contains template of create/edit module
   */
  openModal(template: TemplateRef<any>) {
    //this.loading = true
    this.rfpSubmitService.downloadPdf(this.id).subscribe(r => {
      this.proposalPDFFile = r.pdfFilePath
      this.proposalFileSize = r.pdfFilesize
    }); // If Pdf is not generate on server then it generate on server

    this.modalRef = this.modalService.show(template, {class: 'modal-send-email', backdrop: 'static', 'keyboard': false})
  }

  /**
   * This method is used to open modal popup for openModalFeeSchedule, which display list of service and its cost
   * @method openModalFeeSchedule
   * @param {any} template type which contains template of fee schedule in view mode
   */
  private openModalFeeSchedule(template: TemplateRef<any>) {
    this.modalRefFee = this.modalService.show(template, {
      class: 'modal-fee-schedule',
      backdrop: 'static',
      'keyboard': false
    })
  }


  /**
   * This method is used to open modal popup for openJobModal, for creating a new job
   * @method openJobModal
   * @param {any} template type which contains template of create/edit module
   */
  openJobModal(template: TemplateRef<any>) {
    this.modalRefJob = this.modalService.show(template, {class: 'modal-job', backdrop: 'static', 'keyboard': false})
  }

  /**
   * This method is used to get details of specific RFP
   * @method getRfpDetail
   */
  private getRfpDetail() {
    this.rfpListService.getById(this.id).subscribe(r => {
      this.loading = false
      this.rfpNumber = r.rfpNumber
      document.title = 'RFP# ' + this.rfpNumber;
      this.rfpSubmit = r
      this.getStatus()
      if (this.rfpSubmit.idRfpStatus == null) {
        this.rfpSubmit.idRfpStatus = 1
        this.changeRfpStatus()
      }
      this.getHeaderStatus(r);
      this.getRFPCreatorDetail(r);
    })
  }

  /**
   * This method is used to display rfp create and update details
   * @method getRfpDetail
   * @param {any} rfpDetail rfpDetail is an object of rfp
   */
  private getRFPCreatorDetail(rfpDetail: any) {
    // get Whole RFP detail
    this.rfpDetail = rfpDetail;
    // for created by
    if (this.rfpDetail.createdByEmployee) {
      this.createdBy = this.rfpDetail.createdByEmployee;
    }
    if (this.rfpDetail.createdDate) {
      if (this.createdBy) {
        this.createdBy += " on " + moment(this.rfpDetail.createdDate).format('MM/DD/YYYY hh:mm A');
      } else {
        this.createdBy = moment(this.rfpDetail.createdDate).format('MM/DD/YYYY hh:mm A');
      }
    }

    // for modified by
    if (this.rfpDetail.lastModifiedByEmployee) {
      this.modifiedBy = this.rfpDetail.lastModifiedByEmployee;
    }
    if (this.rfpDetail.lastModifiedDate) {
      if (this.createdBy) {
        this.modifiedBy += " on " + moment(this.rfpDetail.lastModifiedDate).format('MM/DD/YYYY hh:mm A');
      } else {
        this.modifiedBy = moment(this.rfpDetail.lastModifiedDate).format('MM/DD/YYYY hh:mm A');
      }
    }
  }

  /**
   * This method is used to display status of rfp
   * @method getHeaderStatus
   * @param {any} r rfpDetail is an object of rfp
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
   * This method is used to downaload RFP proposal in PDF format
   * @method downloadPdf
   */
  downloadPdf() {
    //window.open("http://rpoback.azurewebsites.net/PDF/RFP-Pdf_1.pdf", '_system');
    this.rfpSubmitService.downloadPdf(this.id).subscribe(r => {
      if (r && r[0]['key'] == 'pdfFilePath') {
        this.proposalPDFFile = r[0]['value']
        window.open(this.proposalPDFFile, '_blank');
      }
      // window.open("http://rpoback.azurewebsites.net/PDF/RFP-Pdf_1.pdf", '_blank');

    })
  }

  /**
   * This method is used to help user for existing current step and move to RFP listing screen
   * @method exit
   */
  exit() {
    this.rfpSubmit.lastUpdatedStep = 5
    this.changeRfpStatus()
    this.router.navigate(['/rfp'])
  }

  /**
   * This method is used to change RFP status
   * @method changeRfpStatus
   */
  changeRfpStatus() {
    if (this.rfpSubmit.idRfpStatus != 'null') {
      this.rfpSubmitService.changeRfpStatus(this.rfpSubmit, this.id, this.rfpSubmit.idRfpStatus).subscribe(res => {
      })
    }

  }

  /**
   *  Get all dropdown data of RFP status from database
   * @method getStatus
   */
  private getStatus() {
    this.rfpSubmitService.getStatus().subscribe(r => {
      this.rfpStatusList = r
    })
  }

  /**
   * This method is used to navigate user to view email history
   * @method openMailHistory
   */
  openMailHistory() {
    this.router.navigate(['/rfp', this.id, 'emailhistory'])
  }

  /**
   * This method is used to add new progression note
   * @method addGeneralNote
   */
  addGeneralNote() {
    this.openModalSendEmail(this.rfpprogressionnote)
  }


  /**
   * This method is used to open modal popup for openModalSendEmail (send email)
   * @method openModalSendEmail
   * @param {any} template type which contains template of send email
   * @param {number} id it is optional which contains id if record is in edit mode
   */
  private openModalSendEmail(template: TemplateRef<any>, id?: number) {
    this.modalRef = this.modalService.show(template, {class: 'modal-add-task'})
  }

  /**
   * This method is used to get all progression notes are there in specific RFP
   * @method getAddRfpProgressionNote
   */
  getAddRfpProgressionNote() {
    if (this.id) {
      this.addRfpProgressionNote.idRfp = this.id
      this.addRfpProgressionNoteServices.getRfpNotes(this.id).subscribe(r => {
        this.exsitingNotes = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.loading = false
    }

  }


  /**
   * This method is used to save progression note for specific RFP record
   * @method saveProgressionNote
   */
  saveProgressionNote() {
    this.loading = true
    if (this.addRfpProgressionNote.notes != '' && this.addRfpProgressionNote.notes != null) {
      this.addRfpProgressionNoteServices.create(this.addRfpProgressionNote).subscribe(r => {
        this.toastr.success('RFP general note added successfully')
        this.getAddRfpProgressionNote()
        this.addRfpProgressionNote.notes = null
        this.isNewGenrealNote = false
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.isNewGenrealNote = true
    }
  }


  /**
   * This method is used check permission whether to display job button or not
   * @method permission
   * @param {any} constantValues constantValues is constant file which contains all constants variables
   */
  permission(constantValues: any) {
    //checking permission of company
    this.showJobAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOB)
  }
}