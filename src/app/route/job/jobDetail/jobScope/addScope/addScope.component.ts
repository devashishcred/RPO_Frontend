import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../../../app.component';
import { Message } from "../../../../../app.messages";
import { JobTypes } from '../../../../../types/jobTypes';
import { JobSubType } from '../../../../../types/jobTypes';
import { WorkType } from '../../../../../types/jobTypes';
import { JobTypesServices } from '../../../../../services/jobTypes.services';
import { JobScope } from '../../../../../types/job';
import { JobScopeServices } from '../jobScope.service';
import { cloneDeep } from 'lodash';
import { JobMilestones, Milestone } from '../../../../../types/job'
import { JobMilestoneServices } from './../../jobMilestone/jobMilestone.service';
import { JobServices } from '../../../job.services';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'underscore';
import { JobSharedService } from '../../../JobSharedService';
import { ProposalReviewServices } from '../../../../addRfp/proposalReview/proposalReview.services';
import { NgForm } from '@angular/forms';
import { UserRightServices } from '../../../../../services/userRight.services';
import { constantValues, SharedService } from '../../../../../app.constantValues';
import { importExpr } from '@angular/compiler/src/output/output_ast';
declare const $: any

/**
* This component contains all function that are used in AddScopeComponent
* @class AddScopeComponent
*/
@Component({
  selector: '[add-billing]',
  templateUrl: './addScope.component.html',
})
export class AddScopeComponent implements OnInit {
  @Input() modalRef: BsModalRef
  @Input() idJob?: number
  @Input() mileStoneeID?: any
  @Output() reload?= new EventEmitter<boolean>();

  /**
* tpldeletemilestone add/edit form
* @property tpldeletemilestone
*/
  @ViewChild('tpldeletemilestone',{static: true})
  private tpl: TemplateRef<any>

  private ckeditorContent: string;
  private jobMilestone: any
  private isMilestone: boolean = true
  private milestoneLength: number
  private editMilestoneBtn: boolean = false
  private readonly: boolean = false
  private isDelete: string
  private sub: any
  private id: number
  private milestoneStatus: any = []
  private selectUndefinedOptionValue: any = ""
  private tempJobMilestone: any
  private selectedJobType: any = []
  private jobDetail: any = []
  private showBtnStatus: string = "show"
  loading: boolean
  private costrightDisabled: boolean = false;
  services: any
  private originalMilestone: any = []
  tmpMilestone: any
  private edittmpMilestone: any
  dropdownSettings: any = {};
  private dropdownDisableSettings: any = {};
  errorMsg: any
  private item: any
  private mileStoneID: number
  private IndexToDelete: number
  private showMilestoneAddBtn: string = 'hide'
  private showMilestoneDeleteBtn: string = 'hide'
  private showMilestoneViewBtn: string = 'hide'
  private showMilestoneCostFeild: string = 'show'

  /**
  * This method define all services that requires in whole class
  * @method constructor
  */
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private jobMilestoneServices: JobMilestoneServices,
    private ProposalReviewServices: ProposalReviewServices,
    private message: Message,
    private route: ActivatedRoute,
    private jobServices: JobServices,
    private jobSharedService: JobSharedService,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private sharedService: SharedService
  ) {
    this.errorMsg = this.message.msg
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
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'Projects';
    if (this.mileStoneeID == '') {
      this.getNewServices(0);
    } else {
      this.editMilestone(this.mileStoneeID);
    }
    this.getMilestoneStatus();
    this.jobMilestone = {} as Milestone
    this.tempJobMilestone = []
    this.jobMilestone.milestone = []
    this.tmpMilestone = {} as Milestone
    this.edittmpMilestone = {} as Milestone
    // this.tmpMilestone.status = ""


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
    };
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
    if (charCode !=46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
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
  private editMilestone(milestoneId: number) {
    this.loading = true
    this.edittmpMilestone = []
    this.dropdownDisableSettings.disabled = false
    this.services = [];



    this.jobMilestoneServices.getMilestoneDetail(this.idJob, milestoneId).
      subscribe(r => {
        this.tmpMilestone.jobMilestoneServices = []
        if (r.jobMilestoneServices.length > 0) {
          r.jobMilestoneServices.forEach((k: any) => {

            this.tmpMilestone.jobMilestoneServices.push({
              id: k.idJobFeeSchedule,
              idMilestone: k.idMilestone,
              idJobFeeSchedule: k.idJobFeeSchedule,
              itemName: k.itemName,
              idtemp: k.id,
              isNew: false
            })
          });
        }
        this.tmpMilestone.name = r.name
        this.tmpMilestone.value = r.value
        this.tmpMilestone.status = r.status
        // assign unmapped and current milestone service list
        this.jobMilestoneServices.getFeeServices(this.idJob, milestoneId).subscribe(res => {
          this.services = [];
          res.forEach((element: any) => {
            this.services.push({
              id: element.idJobFeeSchedule,
              idMilestone: element.idMilestone,
              idJobFeeSchedule: element.idJobFeeSchedule,
              itemName: element.itemName,
              isNew: true
            })
          });


        }, e => {
          this.loading = false
        })
        this.loading = false
      }, e => {
        this.loading = false
      })
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
  * This method is used to make cancel changes from existing milestone record in array/object
  * @method cancelMilestone
  * @param  {any} item item request Object
  * @param {number} milestoneId id of milestone
  * @param {number} index index of milestone which should be updated
  */
  private cancelMilestone(item: any, milestoneId: number, index: number) {
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
      this.tmpMilestone.status = 'Pending'

      this.jobMilestoneServices.saveMilestone(this.tmpMilestone, this.idJob).subscribe(r => {
        this.toastr.success(this.errorMsg.addedMilestone)
        this.modalRef.hide();
        this.reload.emit(true);
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
    item['id'] = milestoneId
    item['idJob'] = this.idJob;
    if (item.status != 'Completed') {
      item.status = 'Pending';
    }
    

    this.jobMilestoneServices.updateeMilestone(item, milestoneId).subscribe((r: any) => {
      this.toastr.success(this.errorMsg.updatedMilestone)
      this.modalRef.hide();
      this.reload.emit(true);
      this.tmpMilestone.jobMilestoneServices = []


      this.loading = false
    }, (e: any) => {
      this.loading = false
    })
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
}

