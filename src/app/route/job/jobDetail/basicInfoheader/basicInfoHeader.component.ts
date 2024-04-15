import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, ViewChild, OnInit, Output, TemplateRef, OnDestroy, OnChanges } from '@angular/core';
import { cloneDeep } from 'lodash';
import { constantValues, SharedService } from '../../../../app.constantValues';
import { Router } from '@angular/router';
import { UserRightServices } from '../../../../services/userRight.services';
import { ActivatedRoute } from '@angular/router';
import { JobServices } from '../../job.services';
import { JobDetailComponent } from '../jobDetail.component';
import { Job } from '../../../../types/job';
import { RfpSubmitServices } from '../../../addRfp/rfpSubmit/rfpSubmit.services';
import { Message } from '../../../../app.messages';
import { AppComponent } from '../../../../app.component';

import { JobSharedService } from '../../JobSharedService';
import { SubscriptionLike as ISubscription } from "rxjs";
import { convertUTCDateToLocalDate } from '../../../../utils/utils';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'basic-info-header',
  templateUrl: './basicInfoHeader.component.html',
  styleUrls: ['./basicInfoHeader.component.scss'],
  providers: [DatePipe]
})
export class BasicInfoHeaderComponent implements  OnInit, OnDestroy {

  @Input() jobDetail: any
  @Input() jobRecord: any
  @Input() getStatus: Function
  
  @ViewChild('addtask',{static: true})
  private addtask: TemplateRef<any>
  yearSelected: any;
  @ViewChild('addtransmittal',{static: true})
  private addtransmittal: TemplateRef<any>

  @ViewChild('addreason',{static: true})
  private addreason: TemplateRef<any>

  private serviceSubscriptionAppType: any;
  private userAccessRight: any = {}
  private table: any
  modalRef: BsModalRef
  modalRefJob: BsModalRef
  //Job show hide
  showJobAddBtn: string = 'hide'
  private showJobViewBtn: string = 'hide'
  showJobDeleteBtn: string = 'hide'
  showGenerateLabelBtn: string = 'hide'
  //task
  showTaskAddBtn: string = 'hide'
  //RFP
  private showRfpViewBtn: string = 'hide'
  private viewClick: string = "hide"
  // scope
  private showJobScopeAddBtn: string = 'hide'
  private showJobScopeViewBtn: string = 'hide'
  private showJobScopeDeleteBtn: string = 'hide'

  //Milestone
  private showJobMilestoneAddBtn: string = 'hide'
  private showJobMilestoneViewBtn: string = 'hide'
  private showJobMilestoneDeleteBtn: string = 'hide'
  //Transmittal
  showJobTransmittalBtn: string = 'hide'
  statusToSet: string = ''
  private sub: any
  private jobId: number
  teamInitials = []
  private selectedProjectType: any
  private selectedJobType: any = []
  private btnShowHide: string
  public data: any;
  public btnView: string = 'show'
  isAddressDisabled: boolean = false
  isReAssigned: boolean = false
  private loadDataAgain: Boolean;
  private isSent: boolean = false
  loading: boolean = false
  subscription: ISubscription;
  statusData: any = {
    job_on_hold: 'hide',
    job_in_progress: 'hide',
    job_completed: 'hide',
    job_re_open: 'hide',
    jobStatus: 'In-Progress',
    statusColor: 'status1'
  }
  private today: any
  pm: string
  pc: string
  sc: string
  redIcon: boolean = false
  private insuranceWorkCompenstaionExpired: boolean = false
  private insuranceDisabilityExpired: boolean = false
  private insuranceGeneralLiabilityExpired: boolean = false
  private insuranceObstructionBondExpired: boolean = false
  private dotInsuranceWorkCompensationExpired: boolean = false
  private dotInsuranceGeneralLiabilityExpired: boolean = false
  private showBtnStatus: string = "show";

  private companyType: string
  private showAddTimeNote: string = "hide";
  private errorMsg: any
  changeStatusFromReason: any
  frommodeule: string
  selectedJobType123: any;
  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private sharedService: SharedService,
    private jobServices: JobServices,
    private jobDetailComponent: JobDetailComponent,
    private rfpSubmitService: RfpSubmitServices,
    private message: Message,
    private appComponent: AppComponent,
    private jobSharedService: JobSharedService,
    private router: Router,
    private datePipe: DatePipe,
  ) {
    this.errorMsg = message.msg
    //JOB
    this.showJobAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOB)
    this.showJobViewBtn = this.userRight.checkAllowButton(constantValues.VIEWJOB)
    this.showGenerateLabelBtn = this.userRight.checkAllowButton(constantValues.VIEWJOB)
    if (this.showJobViewBtn == "show") {
      this.viewClick = "clickable"
    }
    this.showJobDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETEJOB)
    //TASK

    this.showTaskAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOBTASKS)
    //RFP    
    this.showRfpViewBtn = this.userRight.checkAllowButton(constantValues.VIEWRFP)

    //scope
    this.showJobScopeAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOBSCOPE)
    this.showJobScopeViewBtn = this.userRight.checkAllowButton(constantValues.VIEWJOB)
    this.showJobScopeDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETEJOBSCOPE)


    //Milestone
    this.showJobMilestoneAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOBMILESTONE)
    this.showJobMilestoneViewBtn = this.userRight.checkAllowButton(constantValues.VIEWJOBMILESTONE)
    this.showJobMilestoneDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETEJOBMILESTONE)

    //Transmittal
    this.showJobTransmittalBtn = this.userRight.checkAllowButton(constantValues.ADDTRANSMITTALS)


    this.sub = this.route.parent.params.subscribe(params => {
      this.jobId = +params['id'];
    });

    this.jobSharedService.reloadJobContact.subscribe(value => {
      this.loadDataAgain = value
      if (this.loadDataAgain) {
        this.loadmee(value);
      }
    });

    this.sharedService.getJob.subscribe((res:any) =>{
      this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT);
      console.log(this.jobDetail.jobApplicationTypes)
      console.log(this.selectedJobType)
      if(this.jobDetail){
        this.setStatus(this.jobDetail.status);
        this.setInitials();
      }
    })
  }
  

  setInitials(){
    if (this.jobRecord != null) {
      this.teamInitials = [];
      if (this.jobRecord.dobProjectTeam && this.jobRecord.dobProjectTeam.length > 0) {
        this.jobRecord.dobProjectTeam.forEach((element: any) => {
          const found = this.teamInitials.some(el => el.id === element.id);
          if (!found && element.id) {
            this.teamInitials.push({
              id: element.id,
              itemName: element.itemName.match(/\b(\w)/g).join('').substring(0,2),
              fullName:element.itemName
            })
          }
        });
        console.log(this.teamInitials)
      }
      if (this.jobRecord.dotProjectTeam && this.jobRecord.dotProjectTeam.length > 0) {
        this.jobRecord.dotProjectTeam.forEach((element: any) => {
          const found = this.teamInitials.some(el => el.id === element.id);
          if (!found && element.id) {
            this.teamInitials.push({
              id: element.id,
              itemName: element.itemName.match(/\b(\w)/g).join('').substring(0,2),
              fullName:element.itemName
            })
          }
        });
        console.log(this.teamInitials)

      }
      if (this.jobRecord.violationProjectTeam && this.jobRecord.violationProjectTeam.length > 0) {
        this.jobRecord.violationProjectTeam.forEach((element: any) => {
          const found = this.teamInitials.some(el => el.id === element.id);
          if (!found && element.id) {
            this.teamInitials.push({
              id: element.id,
              itemName: element.itemName.match(/\b(\w)/g).join('').substring(0,2),
              fullName:element.itemName
            })
          }
        });
        console.log(this.teamInitials)

      }
      if (this.jobRecord.depProjectTeam && this.jobRecord.depProjectTeam.length > 0) {
        this.jobRecord.depProjectTeam.forEach((element: any) => {
          const found = this.teamInitials.some(el => el.id === element.id);
          if (!found && element.id) {
            this.teamInitials.push({
              id: element.id,
              itemName: element.itemName.match(/\b(\w)/g).join('').substring(0,2),
              fullName:element.itemName
            })
          }
        });
        console.log(this.teamInitials)

      }
      if (this.jobRecord.projectManager && this.jobRecord.projectManager.id != null) {
        const found = this.teamInitials.some(el => el.id === this.jobRecord.projectManager.id);
        if (!found) {
          this.teamInitials.push({
            id: this.jobRecord.projectManager.id,
            itemName: (this.jobRecord.projectManager.firstName + " " + this.jobRecord.projectManager.lastName).match(/\b(\w)/g).join('').substring(0,2),
            fullName:this.jobRecord.projectManager.firstName + " " + this.jobRecord.projectManager.lastName
          })
        }
      }
      console.log(this.teamInitials)
    }
  }

  setStatus(status:any){
    switch (status) {
      case 1:
        this.statusData = {
          job_completed: 'show',
          job_re_open: 'hide',
          job_on_hold: 'show',
          job_in_progress: 'hide',
          jobStatus: 'In-Progress',
          statusColor: 'status1',
        }
        break;
        case 2:
          this.statusData = {
            job_on_hold: 'hide',
            job_in_progress: 'show',
            jobStatus: 'On Hold',
            statusColor: 'status2'
          }
          break;
          case 3:
            this.statusData = {
              job_completed: 'hide',
              job_re_open: 'show',
              job_on_hold: 'hide',
              job_in_progress: 'show',
              jobStatus: 'Completed',
              statusColor: 'status3'
            }
            break;
      default:
        break;
    }
  }

  ngOnInit() {
    if(this.route.params != null && this.route.params != undefined)
    {
      this.route.params.subscribe(para => {
        this.jobDetail.id = para.id;
      });
    }
    this.subscription = this.jobSharedService.change.subscribe((isOpen: Boolean) => {
      this.loadmee(isOpen);
    });
    this.today = this.datePipe.transform(new Date(), 'MM/dd/yyyy');
    this.frommodeule = 'JobModule';
    if (this.jobRecord == null || this.jobDetail == null) {
      this.jobRecord = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
      this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
      console.log(this.jobDetail)

    }
    if (this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE)) {
      this.selectedJobType = this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE)
      console.log(this.selectedJobType)
      this.selectedJobType123 = parseInt(this.selectedJobType);
      console.log(this.jobDetail)
      if (this.redIcon) {
        this.redIcon = false;
      }
      this.setInitials();
      this.setJobRecord(this.jobDetail)
      this.getStatus(this.jobDetail)
      if (!localStorage.getItem('selectedJobType')) {
        this.setApplicationJobType(this.jobDetail)
    }
    }
  }

  setJobRecord(data: any) {
    this.jobRecord = data
    this.jobRecord.company = null ? this.jobRecord.company = '' : this.jobRecord.company = this.jobRecord.company
    document.title = 'Project - ' + this.jobRecord.jobNumber;
    if (this.jobRecord.startDate) {
      this.jobRecord.startDate = moment(convertUTCDateToLocalDate(new Date(this.jobRecord.startDate))).format(this.constantValues.DATEFORMAT);
    }
    if (this.jobRecord.idProjectManager && this.jobRecord.projectManager) {
      if ((typeof this.jobRecord.projectManager.firstName != "undefined") ||
        (this.jobRecord.projectManager.lastName && typeof this.jobRecord.projectManager.lastName != "undefined")) {
        if (this.jobRecord.projectManager.firstName) {
          this.pm = this.jobRecord.projectManager.firstName
        }
        if (this.jobRecord.projectManager.lastName) {
          this.pm += " " + this.jobRecord.projectManager.lastName
        }
      }
    }


    if (this.jobRecord.idProjectCoordinator &&
      this.jobRecord.projectCoordinator.firstName[0] && this.jobRecord.projectCoordinator.lastName[0]) {
      this.pc = this.jobRecord.projectCoordinator.firstName[0].toUpperCase() + this.jobRecord.projectCoordinator.lastName[0].toUpperCase()
    }
    if (this.jobRecord.idSignoffCoordinator && this.jobRecord.signoffCoordinator.firstName[0] && this.jobRecord.signoffCoordinator.lastName[0]) {

      this.sc = this.jobRecord.signoffCoordinator.firstName[0].toUpperCase() + this.jobRecord.signoffCoordinator.lastName[0].toUpperCase()
    }
    if (this.jobRecord.company != null) {
      let typeofcompany = this.jobRecord.company.companyTypes.filter((type: any) => type.itemName == 'General Contractor');


      if (this.jobRecord.company && this.jobRecord.company.companyTypes.length > 0) {

        // GET DATES OF GC
        this.jobRecord.company.dotInsuranceGeneralLiability != null ? this.jobRecord.company.dotInsuranceGeneralLiability = moment(this.jobRecord.company.dotInsuranceGeneralLiability).format(this.constantValues.DATEFORMAT) : '';

        this.jobRecord.company.dotInsuranceWorkCompensation != null ? this.jobRecord.company.dotInsuranceWorkCompensation = moment(this.jobRecord.company.dotInsuranceWorkCompensation).format(this.constantValues.DATEFORMAT) : '';

        this.jobRecord.company.insuranceObstructionBond != null ? this.jobRecord.company.insuranceObstructionBond = moment(this.jobRecord.company.insuranceObstructionBond).format(this.constantValues.DATEFORMAT) : '';

        this.jobRecord.company.insuranceGeneralLiability != null ? this.jobRecord.company.insuranceGeneralLiability = moment(this.jobRecord.company.insuranceGeneralLiability).format(this.constantValues.DATEFORMAT) : '';

        this.jobRecord.company.insuranceWorkCompensation != null ? this.jobRecord.company.insuranceWorkCompensation = moment(this.jobRecord.company.insuranceWorkCompensation).format(this.constantValues.DATEFORMAT) : ''

        this.jobRecord.company.insuranceDisability != null ? this.jobRecord.company.insuranceDisability = moment(this.jobRecord.company.insuranceDisability).format(this.constantValues.DATEFORMAT) : '';



        // Dropdown dates expires logic
        if (this.jobRecord.company.insuranceWorkCompensation && new Date(this.jobRecord.company.insuranceWorkCompensation) < new Date(this.today)) {
          this.insuranceWorkCompenstaionExpired = true;
        }
        if (this.jobRecord.company.insuranceDisability && new Date(this.jobRecord.company.insuranceDisability) < new Date(this.today)) {
          this.insuranceDisabilityExpired = true;
        }
        if (this.jobRecord.company.insuranceGeneralLiability && new Date(this.jobRecord.company.insuranceGeneralLiability) < new Date(this.today)) {
          this.insuranceGeneralLiabilityExpired = true;
        }
        if (this.jobRecord.company.insuranceObstructionBond && new Date(this.jobRecord.company.insuranceObstructionBond) < new Date(this.today)) {
          this.insuranceObstructionBondExpired = true;
        }
        if (this.jobRecord.company.dotInsuranceWorkCompensation && new Date(this.jobRecord.company.dotInsuranceWorkCompensation) < new Date(this.today)) {
          this.dotInsuranceWorkCompensationExpired = true;
        }
        if (this.jobRecord.company.dotInsuranceGeneralLiability && new Date(this.jobRecord.company.dotInsuranceGeneralLiability) < new Date(this.today)) {
          this.dotInsuranceGeneralLiabilityExpired = true;
        }
        for (let ct of this.jobRecord.company.companyTypes) {
          if (ct.id == 11) {
            this.companyType = "SI"
            if (this.jobRecord.company.specialInspectionAgencyExpiry && new Date(this.jobRecord.company.specialInspectionAgencyExpiry) < new Date(this.today)) {
              this.redIcon = true
            }
          }
          if (ct.id == 13) {
            this.companyType = "GC"
            this.jobRecord.company.trackingExpiry != null ? this.jobRecord.company.trackingExpiry = moment(this.jobRecord.company.trackingExpiry).format(this.constantValues.DATEFORMAT) : '';
            if (this.jobRecord.company.trackingExpiry && new Date(this.jobRecord.company.trackingExpiry) < new Date(this.today)) {
              
              this.redIcon = true
            }
          }
          if (ct.id == 27) {
            this.companyType = "CTL"
            if (this.jobRecord.company.ctExpirationDate && new Date(this.jobRecord.company.ctExpirationDate) < new Date(this.today)) {
              this.redIcon = true
            }
          }
        }
      }   
    }
      if (this.jobRecord != null) {
        this.teamInitials = [];
        if (this.jobRecord.dobProjectTeam && this.jobRecord.dobProjectTeam.length > 0) {
          this.jobRecord.dobProjectTeam.forEach((element: any) => {
            const found = this.teamInitials.some(el => el.id === element.id);
            if (!found && element.id) {
              this.teamInitials.push({
                id: element.id,
                itemName: element.itemName.match(/\b(\w)/g).join('').substring(0,2),
                fullName:element.itemName
              })
            }
          });
          console.log(this.teamInitials)
        }
        if (this.jobRecord.dotProjectTeam && this.jobRecord.dotProjectTeam.length > 0) {
          this.jobRecord.dotProjectTeam.forEach((element: any) => {
            const found = this.teamInitials.some(el => el.id === element.id);
            if (!found && element.id) {
              this.teamInitials.push({
                id: element.id,
                itemName: element.itemName.match(/\b(\w)/g).join('').substring(0,2),
                fullName:element.itemName
              })
            }
          });
        }
        if (this.jobRecord.violationProjectTeam && this.jobRecord.violationProjectTeam.length > 0) {
          this.jobRecord.violationProjectTeam.forEach((element: any) => {
            const found = this.teamInitials.some(el => el.id === element.id);
            if (!found && element.id) {
              this.teamInitials.push({
                id: element.id,
                itemName: element.itemName.match(/\b(\w)/g).join('').substring(0,2),
                fullName:element.itemName
              })
            }
          });
          console.log(this.teamInitials)

        }
        if (this.jobRecord.depProjectTeam && this.jobRecord.depProjectTeam.length > 0) {
          this.jobRecord.depProjectTeam.forEach((element: any) => {
            const found = this.teamInitials.some(el => el.id === element.id);
            if (!found && element.id) {
              this.teamInitials.push({
                id: element.id,
                itemName: element.itemName.match(/\b(\w)/g).join('').substring(0,2),
                fullName:element.itemName
              })
            }
          });
          console.log(this.teamInitials)

        }
        if (this.jobRecord.projectManager && this.jobRecord.projectManager.id != null) {
          const found = this.teamInitials.some(el => el.id === this.jobRecord.projectManager.id);
          if (!found) {
            this.teamInitials.push({
              id: this.jobRecord.projectManager.id,
              itemName: (this.jobRecord.projectManager.firstName + " " + this.jobRecord.projectManager.lastName).match(/\b(\w)/g).join('').substring(0,2),
              fullName:this.jobRecord.projectManager.firstName + " " + this.jobRecord.projectManager.lastName
            })
          }
        }
        
      }
if (this.jobRecord.status > 1) {
      //this.showAddTimeNote = 'hide'
    } else {
      //this.showAddTimeNote = 'show'
    }
    this.loading = false

  }


  loadmee(value: Boolean) {
    if (value) {
      let jobId: any
      this.jobSharedService.reloadJobContact.next(false);
      this.jobServices.getJobDetailById(this.jobDetail.id).subscribe(r => {
        this.loadDataAgain = false;
        this.sharedService.getJobEdit.emit(r);
        sessionStorage.removeItem(this.constantValues.JOBOBECT);
        this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, r)
        this.jobDetail = r;
      })
    }

  }

  downloadPdf() {
    if (this.jobDetail.idRfp) {
      this.rfpSubmitService.downloadPdf(this.jobDetail.idRfp).subscribe(r => {
        if (r && r[0]['key'] == 'pdfFilePath') {
          window.open(r[0]['value'], '_blank');
        }
      })
    } else {
      this.toastr.info(this.errorMsg.noRfpRelatedWithJob)
    }

  }
  EventForChangingTheStatus(res?: any) {

    let isFromReason: boolean = false
    if (res.isFromReason) {
      isFromReason = true
      this.jobDetail = res.jobDetail
    }
    if (!this.isSent) {
      if (isFromReason) {
        this.changeInProgressToHold(this.jobDetail.status, isFromReason)
      } else {
        this.changeInProgressToHold(this.jobDetail.status)
      }
    } else {
      if (isFromReason) {
        this.changeInCompletedToReopen(this.jobDetail.status, isFromReason)
      } else {
        this.changeInCompletedToReopen(this.jobDetail.status)
      }
    }
  }
  changeTheStatusOnReason(status: number, type: string, eventToSent: string) {
    this.changeStatusFromReason = status
    if (typeof type != 'undefined' && type == 'swap') {
      if (status != 3) {
        this.isSent = false
        this.statusToSet = eventToSent;
        this.openAddReasonForm(this.addreason, this.jobDetail.id)
      } else {
        this.toastr.info(this.constantValues.JOB_RE_OPEN, 'Info')
      }
    } else {
      if (type != '') {
        if (status != 2) {
          this.isSent = true;
          this.statusToSet = eventToSent;
          this.openAddReasonForm(this.addreason, this.jobDetail.id)
        } else {
          this.toastr.info(this.constantValues.JOB_RE_OPEN, 'Info')
        }
      } else {
        this.changeInCompletedToReopen(this.jobDetail.status)
      }
    }
  }

  changeInProgressToHold(status: number, isFromReason?: boolean) {
    if (status != 3) {
      if (this.jobDetail && this.jobDetail.status == 1) {
        this.statusData = {
          job_on_hold: 'hide',
          job_in_progress: 'show',
          jobStatus: 'On Hold',
          statusColor: 'status2'
        }
        if (!isFromReason) {
          this.jobDetail.status = 2
        }
      } else {
        this.statusData = {
          job_on_hold: 'show',
          job_in_progress: 'hide',
          jobStatus: 'In-Progress',
          statusColor: 'status1'
        }
        if (!isFromReason) {
          this.jobDetail.status = 1
        }
      }

      if (!isFromReason) {
        this.changeStatus(this.jobDetail)
      } else {
        this.changeStatusIsFromReason(this.jobDetail)
      }
    } else {
      this.toastr.info(this.constantValues.JOB_RE_OPEN, 'Info')
    }

  }

  changeInCompletedToReopen(status: number, isFromReason?: boolean) {
    if (status != 2) {
      if (status == 3) {
        this.statusData = {
          job_completed: 'show',
          job_re_open: 'hide',
          job_on_hold: 'show',
          job_in_progress: 'hide',
          jobStatus: 'In-Progress',
          statusColor: 'status1',
        }
        if (!isFromReason) {
          this.jobDetail.status = 1
        }

      } else {
        this.statusData = {
          job_completed: 'hide',
          job_re_open: 'show',
          job_on_hold: 'hide',
          job_in_progress: 'show',
          jobStatus: 'Completed',
          statusColor: 'status3'
        }
        if (!isFromReason) {
          this.jobDetail.status = 3
        }
      }
      if (!isFromReason) {
        this.changeStatus(this.jobDetail)
      } else {
        this.changeStatusIsFromReason(this.jobDetail)
      }
    } else {
      this.toastr.info(this.constantValues.JOB_IN_PROGRESS, 'Info')
    }
  }

  changeStatusIsFromReason(data: any, fromload?: boolean) {
    this.isSent = false;
    this.statusToSet = '';
    this.jobSharedService.setJobData(data)
    this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, data)
    this.sharedService.getJobStatus.emit('statuschanged')
    if (!fromload) {
      this.toastr.success('Job Status updated successfully.')
    }

    this.jobSharedService.isUserLoggedIn.next(true);
    this.showHideButtonOnStatus()
    this.loading = false
  }

  changeStatus(data: Job) {
    this.loading = true
    let apibody = {
      jobStatus: data.status,
      statusReason: ""
    }
    this.jobServices.changeJobStatus(data.id, apibody).subscribe(r => {
      this.isSent = false;
      this.statusToSet = '';
      this.jobSharedService.setJobData(data)
      this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, data)
      this.sharedService.getJobStatus.emit('statuschanged')
      this.toastr.success('Job Status updated successfully.')
      this.showHideButtonOnStatus()
      this.loading = false
    })
  }

  showHideButtonOnStatus() {
    this.getStatus()
  }

  generateLabel(id: number) {
    this.jobServices.generateLabel(id).subscribe(r => {
      window.open(r, '_blank');
      this.toastr.success('Label generated successfully')
    }, e => {
    })
  }


  openModalFormCreateTask(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-add-task' })
  }

  openAddJobModal(template: TemplateRef<any>, actionId?: string) {
    if (this.jobDetail && this.jobDetail.status == 3) {
      this.toastr.info(this.constantValues.JOB_RE_OPEN, 'Info')
    } else if (this.jobDetail && this.jobDetail.status == 2) {
      this.toastr.info(this.constantValues.JOB_IN_PROGRESS, 'Info')
    } else {
      if (actionId == 'REASSIGN') {
        this.isAddressDisabled = false
        this.isReAssigned = true
      } else {
        this.isAddressDisabled = true
        this.isReAssigned = false
      }
      this.modalRefJob = this.modalService.show(template, { class: 'modal-job', backdrop: 'static', 'keyboard': false })
    }

  }

  onSave(ctt: Job, evt: any) {
    if (ctt.id) {
      this.jobServices.getJobDetailById(ctt.id, true).subscribe(r => {
        if (r) {
          this.jobDetail = r
          this.jobRecord = r
          this.sharedService.getJobEdit.emit(r);
          this.jobSharedService.setJobData(r);
          this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, r)

          if (r.jobApplicationTypes && r.jobApplicationTypes.length > 0) {
            this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, r.jobApplicationTypes[0])
            this.selectedJobType = r.jobApplicationTypes[0]
          }
          if (r.status > 1) {
            this.btnShowHide = 'hide'
          } else {
            this.btnShowHide = 'show'
          }
        }
      }, e => {
        this.loading = false;
      })
    }
  }

  openCreateTransmittalModal(template: TemplateRef<any>, action?: string, id?: number) {
    this.modalRef = this.modalService.show(template, { class: 'modal-add-transmittal', backdrop: 'static', 'keyboard': false })
  }
  private openAddReasonForm(template: TemplateRef<any>, id?: number) {
    this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static', 'keyboard': false })

  }

  viewOnBis(binNumber: string) {
    if (binNumber) {
      window.open("http://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?bin=" + binNumber, '_blank');
    } else {
      this.toastr.info(this.errorMsg.binNumberNotExist);
    }
  }

  viewOnDob() {
    window.open("https://a810-dobnow.nyc.gov/Publish/Index.html#!/", '_blank');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


     /**
    * This method is used when application type is changed
    * @method onSelectionChange
    * @param {any} jobType jobType which type of application is getting to be selected
    * @param {number} id id of tje job
    */
      onSelectionChange(jobType: any, id: number) {
        console.log(jobType)
        this.jobId = this.jobDetail.id;
        this.jobSharedService.setJobAppType(jobType.id);
        this.jobDetail.type = jobType.id;
        /**
         * when move from dot to dob or vica versa set application to null
         */
        this.jobSharedService.setSelectedApplication(null);

        if (jobType.id == 3) {
            this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, jobType.id)
            this.appComponent.saveInSessionStorage(this.constantValues.JOBID, this.jobId)
            this.router.navigate(['./job/' + this.jobId + '/violation'])
        } else if (jobType.id == 2) {
            this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, jobType.id)
            this.appComponent.saveInSessionStorage(this.constantValues.JOBID, this.jobId)
            this.router.navigate(['./job/' + this.jobId + '/dot', { idJobAppType: jobType.id }])
        } else {
            this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, jobType.id)
            this.appComponent.saveInSessionStorage(this.constantValues.JOBID, this.jobId)
            if (jobType.id == 1) {
                this.router.navigate(['./job/' + this.jobId + '/application', { idJobAppType: jobType.id }])
            } else {
                this.router.navigate(['./job/' + this.jobId + '/dep', { idJobAppType: jobType.id }])
            }
        }
        this.serviceSubscriptionAppType = this.jobSharedService.getJobAppType().subscribe(_sharingJobAppType => {
            this.selectedJobType = _sharingJobAppType
        });


    }



       /**
    * This method is used to set job application type
    * @method setApplicationJobType
    * @param {any} r r is an object of application type
    */
        setApplicationJobType(r: any) {
          let appType = r.jobApplicationType.split(',');
          if (appType && appType.length > 0) {
              this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, appType[0]);
              let keepGoing = true;
              appType.forEach((idJobAppType: any) => {
                  if (keepGoing) {
                      this.jobSharedService.setJobAppType(idJobAppType);
                      keepGoing = false
                  }
              })
              if (!keepGoing) {
                  this.serviceSubscriptionAppType = this.jobSharedService.getJobAppType().subscribe(_sharingJobAppType => {
                      this.selectedJobType = _sharingJobAppType
                      console.log( this.selectedJobType );
                  });
              }
          } else if (appType.length == 1) {
              this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, appType[0]);
          }
      }
}
