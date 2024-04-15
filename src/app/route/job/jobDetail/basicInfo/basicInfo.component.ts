import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { JobServices } from '../../job.services'
import { Job, teamMember } from '../../../../types/job'
import { Contact } from '../../../../types/contact'
import { Company } from '../../../../types/company'
import { rfpAddress } from '../../../../types/rfpAddress'
import { borough } from '../../../../types/borough'
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { convertUTCDateToLocalDate } from '../../../../utils/utils';
import { constantValues, SharedService } from '../../../../app.constantValues';
import { JobSharedService } from '../../JobSharedService';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { AppComponent } from '../../../../app.component';
import { UserRightServices } from '../../../../services/userRight.services';
declare const $: any
@Component({
  selector: 'basic-info',
  templateUrl: './basicInfo.component.html',
  styleUrls: ['./basicInfo.component.scss'],
  providers: [DatePipe]
})
export class BasicInfoComponent implements OnInit {

  @Input() jobRecord: any
  @Input() getStatus: Function

  @ViewChild('addtimenotes',{static: true})
  private filterhistory: TemplateRef<any>

  private today: any
  modalRef: BsModalRef
  private sub: any
  idJob: number
  pm: string
  private pc: string
  private sc: string
  loading: boolean = false
  redIcon: boolean = false
  insuranceWorkCompenstaionExpired: boolean = false
  insuranceDisabilityExpired: boolean = false
  insuranceGeneralLiabilityExpired: boolean = false
  insuranceObstructionBondExpired: boolean = false
  dotInsuranceWorkCompensationExpired: boolean = false
  dotInsuranceGeneralLiabilityExpired: boolean = false
  showBtnStatus: string = "show";

  companyType: string
  showAddTimeNote: string = "hide";
  private iSubscription: ISubscription;

  teamInitials: any[] = []
  constructor(
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private jobServices: JobServices,
    private constantValues: constantValues,
    private jobSharedService: JobSharedService,
    private sharedService: SharedService,
    private appComponent: AppComponent,
    private userRight: UserRightServices
  ) {

  }

  ngOnInit() {
    
    this.showBtnStatus = this.userRight.checkAllowButton(this.constantValues.ADDJOB);
    this.today = this.datePipe.transform(new Date(), 'MM/dd/yyyy');
    this.iSubscription = this.sharedService.getJobEdit.subscribe((data: any) => {
      if (this.redIcon) {
        this.redIcon = false;
      }
      this.jobRecord = data;
      this.setJobRecord(this.jobRecord);
    })
    this.setJobRecord(this.jobRecord);
    this.sub = this.route.params.subscribe(params => {
      this.idJob = +params['id']; // (+) converts string 'id' to a number
    });
    this.sharedService.getJobStatus.subscribe((data: any) => {
      if (data == 'statuschanged') {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobRecord = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
          this.setJobRecord(this.jobRecord)
        }
      }
    }, (e: any) => { })
    this.loading = true

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
      this.showAddTimeNote = 'hide'
    } else {
      this.showAddTimeNote = 'show'
    }
    this.loading = false

  }




  private closePopup() {
    this.modalRef.hide()
  }

  /* dropdown should not close */
  dropdownPropagation(event: any) {
    event.stopPropagation();
  }

  // hide dropdown on close
  closeDropdown() {
    $(".dropdown").removeClass("open");
    $(".inner-dropdown").attr("aria-expanded", false);
  }

  private _openModalAddTimeNotes(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-add-time-notes', backdrop: 'static', 'keyboard': false })
  }

  openModalAddTimeNotes(template: TemplateRef<any>, id?: number) {
    this._openModalAddTimeNotes(template)
  }

  ngOnDestroy() {
    this.iSubscription.unsubscribe();
  }
}