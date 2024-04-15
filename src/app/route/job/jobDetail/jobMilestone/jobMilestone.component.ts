import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash';
import { AppComponent } from '../../../../app.component';
import { JobMilestones, Milestone } from '../../../../types/job'
import { JobMilestoneServices } from './jobMilestone.service';
import { JobServices } from '../../job.services';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'underscore';
import { JobSharedService } from '../../JobSharedService';
import { ProposalReviewServices } from '../../../addRfp/proposalReview/proposalReview.services';
import { Message } from '../../../../app.messages';
import { NgForm } from '@angular/forms';
import { UserRightServices } from '../../../../services/userRight.services';
import { constantValues, SharedService } from '../../../../app.constantValues';


declare const $: any

/**
* This component contains all function that are used in Job Milestone
* @class JobMilestoneComponent
*/
@Component({
  selector: 'job-milestone',
  templateUrl: './jobMilestone.component.html',
  styleUrls: ['./jobMilestone.component.scss']
})

export class JobMilestoneComponent implements OnInit {
  /**
  * tpldeletemilestone add/edit form
  * @property tpldeletemilestone
  */
  @ViewChild('tpldeletemilestone', { static: true })
  private tpl: TemplateRef<any>

  private ckeditorContent: string;
  modalRef: BsModalRef
  jobMilestone: any
  private isMilestone: boolean = true
  private milestoneLength: number
  private idJob: number
  private editMilestoneBtn: boolean = false
  private readonly: boolean = false
  private isDelete: string
  private sub: any
  private id: number
  milestoneStatus: any = []
  private selectUndefinedOptionValue: any = ""
  private tempJobMilestone: any
  private selectedJobType: any = []
  private jobDetail: any = []
  showBtnStatus: string = "show"
  loading: boolean
  costrightDisabled: boolean = false;
  services: any
  private originalMilestone: any = []
  tmpMilestone: any
  private edittmpMilestone: any
  dropdownSettings: any = {};
  dropdownDisableSettings: any = {};
  errorMsg: any
  private item: any
  private mileStoneID: number
  private IndexToDelete: number
  showMilestoneAddBtn: string = 'hide'
  showMilestoneDeleteBtn: string = 'hide'
  showMilestoneViewBtn: string = 'hide'
  private showMilestoneCostFeild: string = 'show'

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    public jobMilestoneServices: JobMilestoneServices,
    private ProposalReviewServices: ProposalReviewServices,
    private message: Message,
    private route: ActivatedRoute,
    private jobServices: JobServices,
    private jobSharedService: JobSharedService,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private sharedService: SharedService

  ) {

    this.showMilestoneAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDJOBMILESTONE)
    this.showMilestoneViewBtn = this.userRight.checkAllowButton(this.constantValues.VIEWJOBMILESTONE)
    this.showMilestoneDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEJOBMILESTONE)
    this.showMilestoneCostFeild = this.userRight.checkAllowButton(this.constantValues.COSTJOBSCOPE)
    if (this.showMilestoneCostFeild == 'hide') {
      this.costrightDisabled = true
    }

    this.sub = this.route.parent.params.subscribe(params => {
      this.idJob = +params['id'];
      this.errorMsg = message.msg

    });
    //set button visibility on job status change
    this.jobSharedService.getJobData().subscribe((data: any) => {
      this.jobDetail = data
      if (this.jobDetail == null) {
        this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
        this.setBtnBasedonStatus(this.jobDetail)
      } else {
        this.setBtnBasedonStatus(this.jobDetail)
      }
    })
  }

  /**
    * This method set buttons on job status
    * @method setBtnBasedonStatus
    * @param {any} jobDetail  Job Object
    */
  setBtnBasedonStatus(jobDetail: any) {
    if (jobDetail.status > 1) {
      this.showBtnStatus = 'hide'
      $('.select-column').hide()
    } else {
      this.showBtnStatus = 'show'
      $('.select-column').show()
    }
  }

  /**
  * This method will be destroy all elements and other values from whole module
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
    this.sharedService.getJobStatus.subscribe((data: any) => {
      if (data == 'statuschanged') {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
          this.setBtnBasedonStatus(this.jobDetail)
        }
      }
    }, (e: any) => { })
    this.getNewServices(0);
    this.getMilestoneStatus();
    this.jobMilestone = {} as Milestone
    this.tempJobMilestone = []
    this.jobMilestone.milestone = []
    this.tmpMilestone = {} as Milestone
    this.edittmpMilestone = {} as Milestone
    this.tmpMilestone.status = ""


    this.dropdownSettings = {
      singleSelection: false,
      text: "Services",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: true,
      classes: "myclass custom-class",
      disabled: false,
      badgeShowLimit: 1,
    };


    this.dropdownDisableSettings = {
      singleSelection: false,
      text: "Services",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: false,
      enableCheckAll: false,
      classes: "myclass custom-class custom-class1",
      disabled: 'true',
      badgeShowLimit: 1,
    };

    this.getMilestoneRecords();

  }

  /**
  * This method is used to get milestone status
  * @method getMilestoneStatus
  */
  getMilestoneStatus() {
    this.milestoneStatus = [{
      id: 'Pending', itemName: "Pending"
    }, {
      id: 'Completed', itemName: "Completed"
    }]
  }

  /**
  * This method is used to check whether enetered number is numeric or not
  * @method isNumber
  * @param {any} evt evt is used as object of input element
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
  * This method is used to get all milestone records from database 
  * @method getMilestoneRecords
  */
  private getMilestoneRecords() {
    this.jobMilestoneServices.getMilestone(this.idJob).subscribe(r => {
      if (r.length > 0) {
        this.jobMilestone = []
        let milestoneServiceList = []
        let tmpjobMilestone = r
        this.originalMilestone = r
        tmpjobMilestone.forEach((element: any, index: number) => {

          let selectedMilestone: any = []
          element.jobMilestoneServices.forEach((k: any) => {
            selectedMilestone.push({
              id: k.idJobFeeSchedule,
              idMilestone: k.idMilestone,
              itemName: k.itemName
            })
          });
          this.jobMilestone.push({
            id: element.id,
            name: element.name,
            idJob: element.idJob,
            value: element.value,
            formattedValue: element.formattedValue,
            status: element.status,
            isInvoiced: element.isInvoiced,
            invoicedDate: element.invoicedDate,
            invoiceNumber: element.invoiceNumber,
            poNumber: element.poNumber,
            jobMilestoneServices: element.jobMilestoneServices,
            lastModified: element.lastModified,
            lastModifiedBy: element.lastModifiedBy,
            isVisible: false,
            showEditDeleteBtn: false,
            selectedMilesStone: selectedMilestone,
            milestoneServiceList: selectedMilestone
          })
        });
        this.loading = false

      }
    }, e => {
      this.loading = false
    });
  }


  /**
   * This method is used when dropdown should not close
   * @method dropdownPropagation
   */
  private dropdownPropagation(event: any) {
    event.stopPropagation();
  }

  /**
   * This method is used to check user can enter only numeric value
   * @method onlyNumberKey
   */
  onlyNumberKey(event: any) {
    return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
  }

  /**
    * This method check given data is decimal or not
    * @method isDecimal
    * @param {any} evt event object
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

  isFieldValChange() {

  }

  /**
   *  Get selected item from dropdown
   * @method onItemSelect
   */
  onItemSelect() {

  }
  /**
  *  Deselect item from dropdown
  * @method OnItemDeSelect
  */
  OnItemDeSelect() {

  }
  /**
  *  all items are selected from dropdown
  * @method onSelectAll
  */
  onSelectAll() {

  }

  /**
   *  all items are deselected from dropdown
   * @method onDeSelectAll
   */
  onDeSelectAll() {

  }


  /**
  * This method is used to get new services
  * @method getNewServices
  * @param {number} idMilestone id of milestone
  */
  getNewServices(idMilestone: number) {
    this.loading = true
    this.services = []
    this.jobMilestoneServices.getFeeServices(this.idJob, idMilestone).subscribe(r => {
      let itemServices = _.sortBy(r, function (i: any) { return i.itemName.toLowerCase(); });
      this.services = itemServices
      this.loading = false
    })
  }



  /**
  * This method is used to update existing milestone record in array/object
  * @method editMilestone
  * @param  {any} item item request Object
  * @param {number} milestoneId id of milestone
  * @param {number} index index of milestone which should be updated
  */
  editMilestone(item: any, milestoneId: number, index: number) {
    this.loading = true

    for (let i = 0; i < this.jobMilestone.length; i++) {
      this.jobMilestone[i].showEditDeleteBtn = true
    }

    this.edittmpMilestone = []
    this.dropdownDisableSettings.disabled = false
    let selectedMilestone: any = []
    let serviceList: any = []



    this.jobMilestoneServices.getMilestoneDetail(this.jobMilestone[index].idJob, milestoneId).
      subscribe(r => {

        // re-assing  array of milestone
        this.jobMilestone[index] = r
        this.jobMilestone[index].isVisible = true;

        if (r.jobMilestoneServices.length > 0) {
          r.jobMilestoneServices.forEach((k: any) => {
            selectedMilestone.push({
              id: k.idJobFeeSchedule,
              idMilestone: k.idMilestone,
              idJobFeeSchedule: k.idJobFeeSchedule,
              itemName: k.itemName,
              idtemp: k.id,
              isNew: false
            })
          });
        }
        this.jobMilestone[index].selectedMilesStone = []
        this.jobMilestone[index].selectedMilesStone = selectedMilestone
        this.jobMilestone[index].showEditDeleteBtn = false;

        // assign unmapped and current milestone service list
        this.jobMilestoneServices.getFeeServices(this.idJob, milestoneId).subscribe(res => {
          res.forEach((element: any) => {
            serviceList.push({
              id: element.idJobFeeSchedule,
              idMilestone: element.idMilestone,
              idJobFeeSchedule: element.idJobFeeSchedule,
              itemName: element.itemName,
              isNew: true
            })
          });


          this.jobMilestone[index].milestoneServiceList = []
          this.jobMilestone[index].milestoneServiceList = serviceList

        }, e => {
          this.loading = false
        })

        // push in temp array
        this.tempJobMilestone.push({
          milestoneId: milestoneId,
          item: this.jobMilestone[index]
        })

        this.loading = false
      }, e => {
        this.loading = false
      })
  }


  /**
  * This method is used to make cancel changes from existing milestone record in array/object
  * @method cancelMilestone
  * @param  {any} item item request Object
  * @param {number} milestoneId id of milestone
  * @param {number} index index of milestone which should be updated
  */
  cancelMilestone(item: any, milestoneId: number, index: number) {
    let selectedMilestone: any = []

    for (let i = 0; i < this.jobMilestone.length; i++) {
      this.jobMilestone[i].showEditDeleteBtn = false
    }

    if (this.jobMilestone[index].id == 0) {
      this.jobMilestone = _.without(this.jobMilestone, this.jobMilestone[milestoneId])
    } else {
      //get data from original arrray
      let tmpOriginal = this.originalMilestone.filter((type: any) => type.id == milestoneId)

      if (tmpOriginal && tmpOriginal.length > 0) {
        tmpOriginal.forEach((element: any) => {
          element.jobMilestoneServices.forEach((k: any) => {
            selectedMilestone.push({
              id: k.idJobFeeSchedule,
              idMilestone: k.idMilestone,
              itemName: k.itemName
            })
          });
        });

      } else {
        item.selectedMilesStone = []
      }

      //find record from jobmilestone
      let indexmiles = _.findIndex(this.jobMilestone, { id: milestoneId });
      this.jobMilestone[indexmiles] = tmpOriginal[0]
      this.jobMilestone[indexmiles].selectedMilesStone = selectedMilestone
      this.jobMilestone[indexmiles].isVisible = false
      this.jobMilestone[indexmiles].showEditDeleteBtn = false

      //remove record from temp array
      let removeIndex = _.findIndex(this.tempJobMilestone, { milestoneId: milestoneId });
      this.tempJobMilestone.splice(removeIndex, 1);
    }
  }


  /**
   * This method is used to make confirmation with user whether to delete milesone or not
   * @method ConfirmationDelete
   */
  ConfirmationDelete() {
    this.modalRef.hide()
    this.jobMilestoneServices.deleteMilestone(this.mileStoneID)
      .subscribe(r => {
        let indexmiles = _.findIndex(this.originalMilestone, { id: this.mileStoneID });
        this.originalMilestone.splice(indexmiles, 1);
        let removeIndex = _.findIndex(this.tempJobMilestone, { milestoneId: this.mileStoneID });
        this.tempJobMilestone.splice(removeIndex, 1);
        let jobIndex = _.findIndex(this.jobMilestone, { id: this.mileStoneID });
        this.jobMilestone.splice(jobIndex, 1);
        this.item = null
        this.mileStoneID = null
        this.IndexToDelete = null
        this.tmpMilestone.jobMilestoneServices = []
        this.getNewServices(0)
        this.toastr.success(this.errorMsg.deletedMilestone)
      }, e => {
      })
  }


  /**
    * This method is used to delete existing milestone record in array/object
    * @method deleteMilestone
    * @param  {any} item item request Object
    * @param {number} milestoneId id of milestone
    * @param {number} index index of milestone which should be updated
    */
  deleteMilestone(item: any, milestoneId: number, index: number) {
    this.item = item;
    this.mileStoneID = milestoneId;
    this.IndexToDelete = index;
    this.modalRef = this.modalService.show(this.tpl, { class: 'modal-sm', backdrop: 'static', 'keyboard': false })

  }

  /**
    * This method is used to add new milestone record in array/object
    * @method addMileStone
    * @param  {NgForm} myForm myForm contains milestone object
    */
  addMileStone(myForm: NgForm): void {
    if ((typeof this.tmpMilestone.name != 'undefined' && this.tmpMilestone.name != '') && (typeof this.tmpMilestone.value != 'undefined' && this.tmpMilestone.value != '')) {
      this.loading = true
      this.tmpMilestone.idJob = this.idJob
      this.jobMilestoneServices.saveMilestone(this.tmpMilestone, this.idJob).subscribe(r => {
        this.toastr.success(this.errorMsg.addedMilestone)
        this.getMilestoneRecords();
        myForm.resetForm();
        this.tmpMilestone.jobMilestoneServices = []
        this.getNewServices(0)
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.toastr.error(this.errorMsg.requireJobMilestone)
    }
  }

  /**
    * This method is used to update existing milestone record in database
    * @method deleteMilestone
    * @param  {any} item item request Object
    * @param {number} milestoneId id of milestone
    */
  updateMilestone(item: any, milestoneId: number) {
    this.loading = true
    let checkFlag = 0;
    item.idJob = this.idJob
    item.jobMilestoneServices = []
    if (item.selectedMilesStone.length > 0) {
      checkFlag = 0;
      for (let i = 0; i < item.selectedMilesStone.length; i++) {
        if (item.selectedMilesStone[i].isNew) {
          item.selectedMilesStone[i].id = 0
        } else {
          item.selectedMilesStone[i].id = item.selectedMilesStone[i].idtemp
        }
        item.selectedMilesStone[i].idMilestone = milestoneId
      }
      item.jobMilestoneServices = item.selectedMilesStone
    } else {
      checkFlag = 1;
      item.selectedMilesStone = []
      item.jobMilestoneServices = item.selectedMilesStone
    }
    item.isVisible = false

    if (checkFlag == 1) {
      item.selectedMilesStone = [];
      item.milestoneServiceList = [];
    }
    this.jobMilestoneServices.updateMilestone(item, milestoneId).subscribe(r => {
      this.toastr.success(this.errorMsg.updatedMilestone)
      this.getMilestoneRecords();
      this.tmpMilestone.jobMilestoneServices = []
      this.getNewServices(0)
      checkFlag = 0
      this.loading = false
    }, e => {
      this.loading = false
    })
  }
};