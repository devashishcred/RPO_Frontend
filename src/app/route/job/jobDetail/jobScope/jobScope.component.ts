import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash';
import { JobScope } from '../../../../types/job'
import { JobMilestoneServices } from './../jobMilestone/jobMilestone.service';
import { JobScopeServices } from './jobScope.service';
import { RfpSubmitServices } from "../../../addRfp/rfpSubmit/rfpSubmit.services";
import * as _ from 'underscore';
import { JobSharedService } from '../../JobSharedService';
import { JobDetailComponent } from '../jobDetail.component'
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { JobServices } from '../../job.services';
import { assign, identity, pickBy } from 'lodash';
import { Message } from '../../../../app.messages';
import * as moment from 'moment';
import { convertUTCDateToLocalDate } from '../../../../utils/utils';
import { constantValues, SharedService } from '../../../../app.constantValues';
import { JobTypes } from '../../../../types/jobTypes';
import { JobSubType } from '../../../../types/jobTypes';
import { WorkType } from '../../../../types/jobTypes';
import { JobTypesServices } from '../../../../services/jobTypes.services';
import { AppComponent } from '../../../../app.component';
import { UserRightServices } from '../../../../services/userRight.services';
import { TransmittalServices } from '../jobTransmittal/jobTransmittal.service';
declare const $: any
/**
* This component contains all function that are used in JobScopeComponent
* @class JobScopeComponent
*/
@Component({
  selector: 'job-scope',
  templateUrl: './jobScope.component.html',
  styleUrls: ['./jobScope.component.scss']
})
export class JobScopeComponent implements OnInit {
  @ViewChild("addScopeForm",{static: true})
  private addScopeForm: TemplateRef<any>
  @ViewChild("addBilling",{static: true})
  private addBilling: TemplateRef<any>

  /**
  * tpldeletemilestone add/edit form
  * @property tpldeletemilestone
  */
  @ViewChild('tpldeletemilestone',{static: true})
  private tpl: TemplateRef<any>
  @ViewChild('viewtask',{static: true})
  private viewtask: TemplateRef<any>


  modalRef: BsModalRef
  loading: boolean
  load: boolean

  @ViewChild("scopeHistory",{static: true})
  private scopeHistory: TemplateRef<any>

  modalRefHistory: any
  // new variable
  private jobFeeScheduleData: any[]
  private jobMileStoneData: any[]
  jobScopeData: any[]
  private jobRFPArray: any[]
  errorMsg: any;
  jobTypes: JobTypes[] = []
  private subTypes: JobSubType[] = []
  private workTypes: WorkType[] = []
  addJobScope: JobScope
  jobTypeDescOptions: any
  jobSubTypes: any
  serviceGroups: any
  private serviceItems: any
  private tmpServiceGroup: any
  private sub: any
  private idJob: number
  private jobDetail: any
  showBtnStatus: string
  linkedRFPList: any[]
  proposalIdRfp: number
  scopeHistoryData: any
  showScopeAddBtn: string = 'hide'
  showScopeDeleteBtn: string = 'hide'
  showScopeNewAddBtn: string = 'hide'
  private showScopeNewDeleteBtn: string = 'hide'
  private showRFPViewBtn: string = 'hide'
  showMilestoneAddBtn: string = 'hide'
  sshowMilestoneAddBtn: string = 'hide'
  showCostColumn: string = 'hide'
  scopeCostType: number
  private parentNotFoundInCategories: boolean = true;
  private item: any
  mileStoneID: number
  private editmilestoneid: number
  private loadHistoryAgain: any
  idTask: any
  private idTrans: any

  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(
    private modalService: BsModalService,
    private toastr: ToastrService,
    private jobScopeService: JobScopeServices,
    private route: ActivatedRoute,
    private jobSharedService: JobSharedService,
    private jobDetailComponent: JobDetailComponent,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private jobServices: JobServices,
    private rfpSubmitService: RfpSubmitServices,
    private messages: Message,
    private constantValues: constantValues,
    private appComponent: AppComponent,
    private message: Message,
    private jobTypesServices: JobTypesServices,
    private jobScopeServices: JobScopeServices,
    private userRight: UserRightServices,
    private sharedService: SharedService,
    private jobMilestoneServices: JobMilestoneServices,
    private transmittalServices: TransmittalServices,
  ) {
    this.showMilestoneAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDJOBMILESTONE)
    this.sshowMilestoneAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDJOBMILESTONE)
    this.showScopeAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDJOBSCOPE)
    this.showScopeNewAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDJOBSCOPE)
    this.showScopeDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEJOBSCOPE)
    this.showScopeNewDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEJOBSCOPE)
    this.showRFPViewBtn = this.userRight.checkAllowButton(this.constantValues.VIEWRFP)
    this.showCostColumn = this.userRight.checkAllowButton(this.constantValues.COSTJOBSCOPE)
    if (this.showScopeAddBtn == 'hide') {
      this.showScopeAddBtn = 'ml-disable'
    } else {
      this.showScopeAddBtn = ''
    }
    if (this.showMilestoneAddBtn == 'hide') {
      this.showMilestoneAddBtn = 'ml-disable'
    } else {
      this.showMilestoneAddBtn = ''
    }
    this.errorMsg = this.messages.msg;
    this.sub = this.route.parent.params.subscribe(params => {
      this.idJob = +params['id'];
    });
    //set button visibility on job status change
    this.jobSharedService.getJobData().subscribe((data: any) => {
      this.jobDetail = data
      if (this.jobDetail == null) {
        this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
        this.setDataIfJobDetail()
      } else {
        this.setDataIfJobDetail()
      }
    })

    this.jobSharedService.isUserLoggedIn.subscribe(value => {
      this.loadHistoryAgain = value;
      if (this.loadHistoryAgain) {
        this.getJobScope();
      }
    });
  }

  /**
   * This method set job detail
   * @method setDataIfJobDetail
   */
  setDataIfJobDetail() {
    if (!this.jobDetail) {
      this.jobServices.getJobDetailById(this.idJob, true).subscribe(r => {
        this.jobDetail = r
        this.jobSharedService.setJobData(r);
        this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, r)

        if (this.jobDetail.status > 1) {
          $('.select-column').hide()
          this.showBtnStatus = 'hide'
        } else {
          $('.select-column').show()
          this.showBtnStatus = 'show'
        }
      })
    }
    if (this.jobDetail) {
      if (this.jobDetail.status > 1) {
        $('.select-column').hide()
        this.showBtnStatus = 'hide'
      } else {
        $('.select-column').show()
        this.showBtnStatus = 'show'
      }
    }

  }


  /**
   * This method distroy all object when user moves from this component
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  /**
    * This method will be called once only when module is call for first time
    * @method ngOnInit
    */
  ngOnInit() {
    document.title = 'Project -' + this.idJob;
    this.loadAllData();
  }

  loadAllData() {
    this.sharedService.getJobTimeNoteFromInfo.subscribe((data: any) => {
      if (data == 'timenote') {
        this.getJobScope();
      }
    }, (e: any) => { })
    this.sharedService.getJobStatus.subscribe((data: any) => {
      if (data == 'statuschanged') {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
          this.setDataIfJobDetail()
        }
      }
    }, (e: any) => { })
    this.getJobScope();
    // Add Scope
    this.addJobScope = {} as JobScope;
    this.getJobTypes();
    this.getLinkedRFPList();
  }

  callTask(template: TemplateRef<any>, id: any, from: string) {
    if (from == 'Task') {
      this.idTask = id;
      this.modalRef = this.modalService.show(template, { class: 'modal-view-task', backdrop: 'static', 'keyboard': false })
    } else {
      this.transmittalServices.printTransmittal(id).subscribe((r: any) => {
        this.loading = false;
        window.open(r.value, '_blank');
      });
    }

  }
  /**
   * This method get linked RFP List
   * @method getLinkedRFPList
   */
  getLinkedRFPList() {
    this.jobServices.getLinkedRFPinJobScope(this.idJob).subscribe(r => {

      let rfplist = r;
      for (let rfp of rfplist) {
        if (rfp.documentPath !== 'N/A') {
          rfp.itemName = `${rfp.idRFP}`
        } else {
          rfp.itemName = `${rfp.idRFP} N/A`;
        }
      }
      this.linkedRFPList = rfplist;
    });
  }

  reload(Flag: boolean) {
    if (Flag) {
      this.getJobScope();
    }
  }

  /**
   * This method download RFP Proposal
   * @method downloadRFPProposal
   */
  downloadRFPProposal(proposalIdRfp: any) {
    if (proposalIdRfp) {
      let rfpdocpath = this.linkedRFPList.filter(x => x.idRFP == proposalIdRfp)[0].documentPath;
      if (rfpdocpath !== 'N/A') {
        window.open(rfpdocpath, '_blank');
        this.proposalIdRfp = null;
      } else {
        this.proposalIdRfp = null;
        this.toastr.error('No Attachment Available for this RFP', '', { timeOut: 2000 });

      }
     
    }
  }

  /**
   * This method get already saved scope
   * @method getJobScope
   * @param {boolean} fromAdd Flag to identify for newly added scope 
   */
  getJobScope(formAdd?: boolean) {
    if (this.loadHistoryAgain) {
      this.loadHistoryAgain = false;
      this.jobSharedService.isUserLoggedIn.next(false);
    }


    this.load = true;
    this.jobScopeData = [];
    this.jobRFPArray = [];
    // get fee schedule of job
    this.jobScopeService.getJobFeeSchedule(this.idJob).subscribe(r => {
      this.jobFeeScheduleData = r.data;
      this.load = false;
      for (let feeschedule of this.jobFeeScheduleData) {
        if (feeschedule.costType == 7) {
          feeschedule['dispalyhrquantity'] = Math.floor(feeschedule.quantity / 60) == 0 ? '' : Math.floor(feeschedule.quantity / 60);
          feeschedule['dispalyminquantity'] = feeschedule.quantity % 60 == 0 ? '' : feeschedule.quantity % 60;
          if (feeschedule.quantityAchieved != 0) {
            feeschedule['dispalyhrquantityachieved'] = Math.floor(feeschedule.quantityAchieved / 60) == 0 ? '' : Math.floor(feeschedule.quantityAchieved / 60);
            feeschedule['dispalyminquantityachieved'] = feeschedule.quantityAchieved % 60 == 0 ? '' : feeschedule.quantityAchieved % 60;
          } else {
            feeschedule['dispalyhrquantityachieved'] = '';
            feeschedule['dispalyminquantityachieved'] = '';
          }
          if (feeschedule.quantityPending != 0) {
            feeschedule['dispalyhrquantitypending'] = Math.floor(feeschedule.quantityPending / 60) == 0 ? '' : Math.floor(feeschedule.quantityPending / 60);
            feeschedule['dispalyminquantitypending'] = feeschedule.quantityPending % 60 == 0 ? '' : feeschedule.quantityPending % 60;
          } else {
            feeschedule['dispalyminquantitypending'] = ''
            feeschedule['dispalyhrquantitypending'] = ''
          }
        }
      }

      if (this.jobFeeScheduleData && this.jobFeeScheduleData.length > 0) {
        // find unique record RFP# wise
        this.jobRFPArray = _.uniq(this.jobFeeScheduleData, function (x) {
          return x.idRfp;
        });
        if (this.jobRFPArray && this.jobRFPArray.length > 0) {
          for (let i = 0, len = this.jobRFPArray.length; i < len; i++) {
            let tempMilestoneData = this.jobFeeScheduleData.filter(x => x.idRfp == this.jobRFPArray[i].idRfp);
            // find uniq milestone record
            this.jobMileStoneData = _.uniq(tempMilestoneData, function (x) {
              return x.jobMilestoneId;
            });
            if (this.jobMileStoneData && this.jobMileStoneData.length > 0) {
              let mileStoneCtr = 0;
              for (let j = 0, len = this.jobMileStoneData.length; j < len; j++) {
                // push milestone row in final array
                let labelName = "";
                let idtasks = [];
                let idtransmittals = [];
                let isAdditionalService = false;
                let isIndividualService = false;
                if (this.jobMileStoneData[j].jobMilestoneName) {
                  labelName = this.jobMileStoneData[j].jobMilestoneName;
                  idtasks = this.jobMileStoneData[j].milestoneIdTask;
                  idtransmittals = this.jobMileStoneData[j].milestoneIdTransamittal
                } else {
                  if (this.jobMileStoneData[j].idRfp) {
                    labelName = "Individual Services";
                    isIndividualService = true;
                  } else {
                    labelName = "Additional Services";
                    isAdditionalService = true
                  }
                }
                this.jobScopeData.push({
                  rfpServiceItem: labelName,
                  idTask: idtasks,
                  idTransmittal: idtransmittals,
                  isMileStoneName: true,
                  isAdditionalService: isAdditionalService,
                  isIndividualService: isIndividualService,
                  rfpNumber: this.jobMileStoneData[j].rfpNumber,
                  poNumber: this.jobMileStoneData[j].jobMilestonePONumber,
                  quantity: this.jobMileStoneData[j].id != 0 ? "Total   " : '',
                  quantityAchieved: this.jobMileStoneData[j].id != 0 ? "Completed" : '',
                  quantityPending: this.jobMileStoneData[j].id != 0 ? "Pending" : '',
                  jobMilestoneId: this.jobMileStoneData[j].jobMilestoneId,
                  displayTextbox: this.jobMileStoneData[j].jobMilestoneId ? true : false,
                  displayStatusDD: this.jobMileStoneData[j].jobMilestoneId ? true : false,
                  displayStatusLabel: false,
                  invoiceNumber: this.jobMileStoneData[j].jobMilestoneInvoiceNumber,
                  invoicedDate: this.jobMileStoneData[j].jobMilestoneInvoicedDate,
                  status: this.jobMileStoneData[j].jobMilestoneStatus,
                  jobMilestoneValue: this.jobMileStoneData[j].jobMilestoneValue,
                  lastModified: this.jobMileStoneData[j].lastModified,
                  lastModifiedBy: this.jobMileStoneData[j].lastModifiedBy,
                  createdBy: this.jobMileStoneData[j].createdBy,
                  createdDate: this.jobMileStoneData[j].createdDate
                });
                let tempFeeScheduleData = [];
                let sidtasks = [];
                let sidtransmittals = [];
                tempFeeScheduleData = this.jobFeeScheduleData.filter(x => x.jobMilestoneId == this.jobMileStoneData[j].jobMilestoneId && x.idRfp == this.jobMileStoneData[j].idRfp);
                if (tempFeeScheduleData && tempFeeScheduleData.length > 0) {
                  // push service items row in final array
                  let AdditionalService = tempFeeScheduleData.filter((x: any) => x.isAdditionalService == true);
                  for (let k = 0, len = tempFeeScheduleData.length; k < len; k++) {
                    sidtasks = tempFeeScheduleData[k].serviceItemIdTask;
                    sidtransmittals = tempFeeScheduleData[k].serviceItemIdTransamittal;
                    tempFeeScheduleData[k].rfpNumber = "";
                    tempFeeScheduleData[k].displayTextbox = tempFeeScheduleData[k].jobMilestoneId == 0 ? true : false;
                    tempFeeScheduleData[k].displayLabel = tempFeeScheduleData[k].jobMilestoneId == 0 ? false : true;
                    tempFeeScheduleData[k].displayStatusDD = false;
                    tempFeeScheduleData[k].displayStatusLabel = tempFeeScheduleData[k].status ? true : false;
                    tempFeeScheduleData[k].isRemoved = tempFeeScheduleData[k].isRemoved ? true : false;
                    tempFeeScheduleData[k].lastModified = tempFeeScheduleData[k].lastModified;
                    tempFeeScheduleData[k].createdDate = tempFeeScheduleData[k].createdDate;
                    tempFeeScheduleData[k].createdBy = tempFeeScheduleData[k].createdBy;
                    tempFeeScheduleData[k].lastModifiedBy = tempFeeScheduleData[k].lastModifiedBy;
                    tempFeeScheduleData[k].idTask = sidtasks;
                    tempFeeScheduleData[k].idTransmittal = sidtransmittals;

                    if (tempFeeScheduleData[k].jobMilestoneName != null && tempFeeScheduleData[k].isAdditionalService) {
                      tempFeeScheduleData[k].isAdditionalService = false;
                    }

                    if (tempFeeScheduleData[k].jobMilestoneName != null && !tempFeeScheduleData[k].isAdditionalService) {
                      tempFeeScheduleData[k]['isMilestoneService'] = true
                    } else if (tempFeeScheduleData[k].jobMilestoneName == null && !tempFeeScheduleData[k].isAdditionalService) {
                      tempFeeScheduleData[k]['isIndividualService'] = true
                    }
                    this.jobScopeData.push(tempFeeScheduleData[k]);
                    // this.jobScopeData.sort(
                    //   (a, b) =>
                    //     new Date(b.lastModified).getTime() -
                    //     new Date(a.lastModified).getTime()
                    // );
                  }
                }

                mileStoneCtr++;
                if (mileStoneCtr == this.jobMileStoneData.length) {
                  this.loading = false;
                }
              }
            }
          }
        }
      }
    });
    this.loading = false;
  }


  /**
* This method will check any element in form changed or not
* @method isFieldValChange
* @params label of parent Group, serviceItem which id checked, boolean value of check box, Array of Services
*/
  isFieldValChange(label?: string, serviceItem?: any, check?: boolean, serviceArray?: any, index?: any) {

    let x = []
    if (this.serviceGroups.length > 0 && (serviceItem.partOf && check)) {

      this.serviceGroups.forEach((category: any) => {
        let items = category.serviceItems;
        x = items.filter((item: any) => item.id === serviceItem.partOf);
        if (x.length > 0) {
          this.parentNotFoundInCategories = false;
          x[0].checked = true;
          x[0].disabled = true;
        }
        if (x.length == 0 && this.parentNotFoundInCategories) {
          //  this.checkInIndividualServices(label, serviceItem, check, serviceArray, selectedItems)
        }

      })



    }
    else if (this.serviceGroups.length > 0 && (serviceItem.partOf && !check)) {
      this.serviceGroups.forEach((category: any) => {
        let x = category.tmpServiceItems.filter((item: any) => item.checked == true);
        if (x.length > 1) {

        } else if (x.length == 1) {
          this.parentNotFoundInCategories = false;
          x[0].checked = false;
          x[0].disabled = false;
        } else if (x.length == 0 && this.parentNotFoundInCategories) {

        }
      })

    }

  }
  /**
   * This method update PO Number
   * @method updatePONUmber
   * @param {string} poNumber PO Number Value 
   * @param {number} id ID of Scope 
   * @param {boolean} isMileStone Flag to identify is it milestone or scope
   */
  updatePONUmber(poNumber: string, id: number, isMileStone: boolean) {
    if (isMileStone) {
      this.jobScopeService.updateMileStonePONumber(poNumber, id).subscribe(r => {
        if (r && r.id) {
          let matchedData = this.jobScopeData.filter(x => x.jobMilestoneId == id);
          if (matchedData && matchedData.length > 0) {
            for (let m = 0, len = matchedData.length; m < len; m++) {
              matchedData[m].poNumber = r.poNumber;
            }
          }
          this.toastr.success(this.errorMsg.successMileStonePOUpdate);
        }
      });
    } else {
      this.jobScopeService.updateServiceItemPONumber(poNumber, id).subscribe(r => {
        if (r && r.id) {
          this.toastr.success(this.errorMsg.successItemPOUpdate);
        }
      })
    }
  }

  /**
   * This method update Invoice Number
   * @method updateInvoiceNumber
   * @param {string} invoiceNumber Invoice Number Value 
   * @param {number} id ID of Scope 
   * @param {boolean} isMileStone Flag to identify is it milestone or scope
   */
  updateInvoiceNumber(invoiceNumber: string, id: number, isMileStone: boolean) {
    if (isMileStone) {
      this.jobScopeService.updateMileStoneInvoiceNumber(invoiceNumber, id).subscribe(r => {
        if (r && r.id) {
          let matchedData = this.jobScopeData.filter(x => x.jobMilestoneId == id);
          if (matchedData && matchedData.length > 0) {
            for (let m = 0, len = matchedData.length; m < len; m++) {
              matchedData[m].invoiceNumber = r.invoiceNumber;
            }
          }
          this.toastr.success(this.errorMsg.successMileStoneInvoiceNumUpdate);
        }
      });
    } else {
      this.jobScopeService.updateServiceItemInvoiceNumber(invoiceNumber, id).subscribe(r => {
        if (r && r.id) {
          this.toastr.success(this.errorMsg.successItemInvoiceNumUpdate);
        }
      })
    }
  }

  /**
   * This method update Invoice Date
   * @method updateInvoiceDate
   * @param {string} invoiceDate Invoice Date Value 
   * @param {number} id ID of Scope 
   * @param {boolean} isMileStone Flag to identify is it milestone or scope
   */
  updateInvoiceDate(invoiceDate: string, id: number, isMileStone: boolean) {
    const dateMMDDYYYRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (invoiceDate.length > 0 && invoiceDate.length == 10 && dateMMDDYYYRegex.test(invoiceDate)) {
      if (isMileStone) {
        this.jobScopeService.updateMileStoneInvoiceDate(invoiceDate, id).subscribe(r => {
          if (r && r.id) {
            let matchedData = this.jobScopeData.filter(x => x.jobMilestoneId == id);
            if (matchedData && matchedData.length > 0) {
              for (let m = 0, len = matchedData.length; m < len; m++) {
                matchedData[m].invoicedDate = r.invoicedDate;
              }
            }
            this.toastr.success(this.errorMsg.successMileStoneInvoiceDateUpdate);
          }
        });
      } else {
        this.jobScopeService.updateServiceItemInvoiceDate(invoiceDate, id).subscribe(r => {
          if (r && r.id) {
            this.toastr.success(this.errorMsg.successItemInvoiceDateUpdate);
          }
        })
      }
    } else {
      if (invoiceDate.length == 0) {
        this.jobScopeService.updateMileStoneInvoiceDate(invoiceDate, id).subscribe(r => {
          if (r && r.id) {
            let matchedData = this.jobScopeData.filter(x => x.jobMilestoneId == id);
            if (matchedData && matchedData.length > 0) {
              for (let m = 0, len = matchedData.length; m < len; m++) {
                matchedData[m].invoicedDate = r.invoicedDate;
              }
            }
            this.toastr.success(this.errorMsg.successMileStoneInvoiceDateUpdate);
          }
        });
      }
    }
  }

  /**
 * This method update status
 * @method updateStatus
 * @param {string} status Status Value 
 * @param {number} id ID of Scope 
 * @param {boolean} isMileStone Flag to identify is it milestone or scope
 */
  updateStatus(status: string, id: number, isMileStone: boolean) {
    if (isMileStone) {
      this.loading = true;
      this.jobScopeService.updateMileStoneStatus(status, id).subscribe(r => {
        this.loading = false;
        if (r && r.id) {
          this.loadAllData();
          this.toastr.success(this.errorMsg.successMileStoneStatusUpdate);
        }
      }, err => {
        this.toastr.error('Something went wrong')
      });
    }
  }

  /**
   * This method open Task History Popup
   * @method openHistoryModal
   * @param {number} idJobFeeSchedule Id of Fee Schedule 
   * @param {any} template TemplateRef object 
   * @param {number} costType Cost Type Value 
   */
  openHistoryModal(idJobFeeSchedule: number, template: TemplateRef<any>, costType?: number) {
    this.scopeCostType = costType;
    if (costType == 7) {
      this.jobScopeService.getTimeNoteHistory(idJobFeeSchedule).subscribe(r => {
        if (r && r.length > 0) {
          this.scopeHistoryData = r;
          this.modalRefHistory = this.modalService.show(template, { class: 'modal-scope-history', backdrop: 'static', 'keyboard': false });
        } else {
          this.toastr.info(this.errorMsg.noTimeNoteForScope);
        }
      });
    } else {
      this.jobScopeService.getScopeHistory(idJobFeeSchedule).subscribe(r => {
        if (r && r.length > 0) {
          this.scopeHistoryData = r;
          this.modalRefHistory = this.modalService.show(template, { class: 'modal-scope-history', backdrop: 'static', 'keyboard': false });
        } else {
          this.toastr.info(this.errorMsg.noTaskForScope);
        }
      });
    }
  }

  /**
   * This method delete scope
   * @method deleteScope
   * @param {number} scopeId Id of Job Scope 
   */
  deleteScope(scopeId: number) {
    this.jobScopeService.deleteScope(scopeId).subscribe(r => {
      this.toastr.success(this.errorMsg.deleteScopeSuccess);
      this.getJobScope();
    });
  }

  // Add Scope Code Start
  /**
   * This method open add job scope popup
   * @method openAddScopeModalForm
   * @param {any} template TemplateRef object 
   * @param {number} id? RecordID
   */
  openAddScopeModalForm(template: TemplateRef<any>, id?: number) {
    this.addJobScope = {} as JobScope;
    this.serviceGroups = [];
    this.modalRef = this.modalService.show(template, { class: 'modal-add-scope', backdrop: 'static', 'keyboard': false })
  }

  openAddBillingPointForm(template: TemplateRef<any>, MilestoneId?: number) {
    this.mileStoneID = MilestoneId;

    this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static', 'keyboard': false })
  }

  /**
     * This method get Job types
     * @method getJobTypes
     */
  private getJobTypes() {
    this.loading = true
    if (!this.jobTypes.length) {
      this.jobTypesServices.getRfpJobTypeDD().subscribe(r => {
        this.jobTypes = r
        this.loading = false
      })
    }
  }


  /**
    * This method is used to delete existing milestone record in array/object
    * @method deleteMilestone
    * @param  {any} item item request Object
    * @param {number} milestoneId id of milestone
    * @param {number} index index of milestone which should be updated
    */
  deleteMilestone(template: TemplateRef<any>, item: any, milestoneId: number) {
    this.item = item;
    this.mileStoneID = milestoneId;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm', backdrop: 'static', 'keyboard': false })

  }

  /**
   * This method is used to make confirmation with user whether to delete milesone or not
   * @method ConfirmationDelete
   */
  ConfirmationDelete() {
    this.modalRef.hide()
    this.jobMilestoneServices.deleteMilestone(this.mileStoneID)
      .subscribe(r => {
        this.getJobScope();
        this.toastr.success(this.errorMsg.deletedMilestone)
      }, e => {
      })
  }


  /**
     * This method get job type description list
     * @method setJobTypeDesc
     */
  setJobTypeDesc() {
    this.jobTypeDescOptions = [];
    this.jobSubTypes = [];
    this.addJobScope.idJobTypeDesc = null;
    this.addJobScope.idjobSubType = null;
    if (this.addJobScope.idJobType) {
      this.jobTypesServices.getRfpSubDataFromJobType(this.addJobScope.idJobType).subscribe(r => {
        this.loading = false;
        this.jobTypeDescOptions = r.filter(x => x.level == 2);
        this.jobSubTypes = r.filter(x => x.level == 3);
        this.serviceGroups = r.filter(x => x.level == 4);
        this.serviceItems = r.filter(x => x.level == 5);
        if (this.serviceItems && this.serviceItems.length > 0) {
          this.serviceGroups.push({ itemName: 'Services', id: -1 });
        }
        this.getServiceItemsFromGroup(this.serviceGroups, this.serviceItems);
      });
    }
  }

  /**
     * This method get job sub type
     * @method setJobSubType
     */
  setJobSubType() {
    this.jobSubTypes = [];
    this.addJobScope.idjobSubType = null;
    if (this.addJobScope.idJobTypeDesc) {
      this.jobTypesServices.getRfpSubDataFromJobType(this.addJobScope.idJobTypeDesc).subscribe(r => {
        this.loading = false;
        this.jobSubTypes = r.filter(x => x.level == 3);
        this.serviceGroups = r.filter(x => x.level == 4);
        this.serviceItems = r.filter(x => x.level == 5);
        if (this.serviceItems && this.serviceItems.length > 0) {
          this.serviceGroups.push({ itemName: 'Services', id: -1 });
        }
        this.getServiceItemsFromGroup(this.serviceGroups, this.serviceItems);
      });
    } else {
      this.setJobTypeDesc();
    }
  }

  /**
     * This method get service listfrom job type
     * @method setSevicesData
     * @param {number} id Id of job Type 
     */
  setSevicesData(id: number) {
    if (id) {
      this.jobTypesServices.getRfpSubDataFromJobType(id).subscribe(r => {
        this.loading = false;
        this.serviceGroups = r.filter(x => x.level == 4);
        this.serviceItems = r.filter(x => x.level == 5);
        if (this.serviceItems && this.serviceItems.length > 0) {
          this.serviceGroups.push({ itemName: 'Services', id: -1 });
        }
        this.getServiceItemsFromGroup(this.serviceGroups, this.serviceItems);
      });
    } else {
      this.setJobSubType();
      this.serviceGroups = [];
    }
  }

  /**
     * This method get service items from group
     * @method getServiceItemsFromGroup
     * @param {any} serviceGroups  Service Groups
     */
  private getServiceItemsFromGroup(serviceGroups: any, serviceItems?: any) {
    if (serviceGroups && serviceGroups.length > 0) {
      serviceGroups.forEach((data: any) => {
        if (data.id == -1 && serviceItems && serviceItems.length > 0) {
          data.serviceItems = serviceItems;
          let i = 0;
          data.tmpServiceItems = [];
          data.serviceItems.forEach((tmpData: any) => {
            data.tmpServiceItems[i] = tmpData;
            data.tmpServiceItems[i].quantity = 1;
            data.tmpServiceItems[i].description = "";
            i++;
          });
        } else {
          this.jobTypesServices.getRfpSubDataFromJobType(data.id).subscribe(r => {
            data.serviceItems = r.filter(x => x.level == 5);
            let i = 0;
            data.tmpServiceItems = [];
            data.serviceItems.forEach((tmpData: any) => {
              data.tmpServiceItems[i] = tmpData;
              data.tmpServiceItems[i].quantity = 1;
              data.tmpServiceItems[i].description = "";
              i++;
            });
          });
        }
      });
    }
  }

  /**
     * This method check given data is number or not
     * @method isNumber
     * @param {any} evt Event Object 
     */
  isNumber(evt: any) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  /**
     * This method check given data is decimal or not
     * @method isDecimal
     * @param {any} evt Event Object 
     */
  isDecimal(evt: any) {
    //getting key code of pressed key
    var keycode = (evt.which) ? evt.which : evt.keyCode;
    //comparing pressed keycodes
    if (!(keycode == 8 || keycode == 46) && (keycode < 48 || keycode > 57)) {
      return false;
    }
    else {
      var parts = evt.srcElement.value.split('.');
      if (parts.length > 1 && keycode == 46)
        return false;
      return true;
    }
  }

  /**
     * This method add new job scope
     * @method saveJobScope
     */
  saveJobScope() {
    let checkedServiceItemsArr: any = [];
    let tmpServiceItemArr: any = [];
    let groupCtr = 0;
    if (this.serviceGroups && this.serviceGroups.length > 0) {
      this.serviceGroups.forEach((group: any) => {
        if (group.tmpServiceItems && group.tmpServiceItems.length > 0) {
          checkedServiceItemsArr = group.tmpServiceItems.filter((x: any) => x.checked == true);
          checkedServiceItemsArr.forEach((type: any) => {
            let tempData = {};
            tempData['idJob'] = this.idJob;
            tempData['idRfpWorkType'] = type.id ? type.id : 0;
            tempData['quantity'] = type.quantity;
            tempData['description'] = type.description;
            tempData['partOf'] = type.partOf;
            tempData['isAdditionalService'] = true;
            tmpServiceItemArr.push(tempData);
          })
        }
        groupCtr++;
        if (groupCtr == this.serviceGroups.length) {
          if (tmpServiceItemArr && tmpServiceItemArr.length > 0) {
            this.jobScopeServices.saveJobScope(tmpServiceItemArr, this.idJob).subscribe(r => {
              if (r) {
                this.loading = false;
                this.toastr.success(this.errorMsg.successScopeSave);
                this.modalRef.hide();
                this.getJobScope();
              }
            });
          } else {
            this.loading = false;
            this.toastr.error("Atleast one service item must be selected");
          }
        }
      })
    } else {
      this.loading = false;
      this.toastr.error("Atleast one service item must be selected");
    }
  }

}