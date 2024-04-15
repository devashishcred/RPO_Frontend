import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, ElementRef, NgZone, TemplateRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { cloneDeep, identity, pickBy, assign } from 'lodash';
import { SubscriptionLike as ISubscription } from "rxjs";
import { AppComponent } from '../../../../app.component';
import { JobApplication } from '../../../../types/jobApplication';
import { JobPermit } from '../../../../types/jobPermit';
import { Document } from '../../../../types/document';
import { Job } from '../../../../types/job';
import { BasicInfoComponent } from '../basicInfo/basicInfo.component';

import { AddTaskComponent } from '../../../addtask/addtask.component';
import { ActivatedRoute } from '@angular/router';
import { JobServices } from '../../job.services';
import { JobApplicationService } from '../../../../services/JobApplicationService.services';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { JobDetailComponent } from '../jobDetail.component';
import { ChangeDetectorRef } from '@angular/core';
import { constantValues } from '../../../../app.constantValues';
import { SharedService, GetAppNoOnSelectRow } from '../../../../app.constantValues';
import { JobSharedService } from '../../JobSharedService';
import { UserRightServices } from '../../../../services/userRight.services';

declare const $: any

/**
 * This component contains all function that are used in JobApplicationDobComponent
 * @class JobApplicationDobComponent
 */
@Component({
  selector: '[job-application-dob]',
  templateUrl: './jobApplicationDob.component.html',
  styleUrls: ['./jobApplicationDob.component.scss']
})

export class JobApplicationDobComponent implements OnInit, OnDestroy {
  /**
   * Form Document
   * @property formDocument
   */
  @ViewChild('formDocument', {static: true})
  private formDocument: TemplateRef<any>
  @ViewChild('viewdob', {static: true})
  private viewdob: TemplateRef<any>
  /**
   * Form Add Application
   * @property formAddApplication
   */
  @ViewChild('formAddApplication', {static: true})
  private formAddApplication: TemplateRef<any>

  /**
   * Form Add Task
   * @property addtask
   */
  @ViewChild('addtask', {static: true})
  private formAddTask: TemplateRef<any>

  private rec: Document
  recformAddApplication: JobApplication
  private recformAddPermit: JobPermit
  modalRef: BsModalRef
  private sub: any
  idJob: number
  jobDetail: any = []
  selectedJobType: number
  private data: any
  private btnShowHide: string = 'show'
  private filter: any = {}
  private filterAppPermit: any = {}
  private table: any
  private tablePermit: any
  private specialColumn: any
  private jobTypeSelected: any = []
  idJobApp: number
  private isJobDetail: boolean = false
  private userAccessRight: any = {}
  //Job Add Application
  public showJobApplicationAddBtn: string = 'hide'
  public showJobApplicationDeleteBtn: string = 'hide'
  private subscription: ISubscription;
  private isShowWOrkPermit: boolean = false;
  jobNum: any;

  /**
   * This method define all services that requires in whole class
   * @method constructor
   */
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private jobServices: JobServices,
    private jobApplicationServices: JobApplicationService,
    private zone: NgZone,
    private router: Router,
    private jobDetailComponent: JobDetailComponent,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private sharedService: SharedService,
    private jobSharedService: JobSharedService,
    private getAppNoOnSelectRow: GetAppNoOnSelectRow,
  ) {
    // get selected Job Type from job detail component as per selection of radio button
    this.jobSharedService.getJobAppType().subscribe(_sharingJobAppType => {
      this.selectedJobType = _sharingJobAppType
      if (this.selectedJobType) {
        this.filter.idJobApplicationType = this.selectedJobType
      }
    });

    this.sub = this.route.parent.params.subscribe(params => {
      this.idJob = +params['id']; // (+) converts string 'id' to a number
    });

    // when job status change then emited jobDetail will call and reset data tables 
    this.jobSharedService.getJobData().subscribe((data: Job) => {
      this.jobDetail = data

      if (this.jobDetail == null) {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
        } else {
          this.setDataIfJobDetail()
        }
      }
    })
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.filter.idJob = this.idJob
    document.title = 'Project -' + this.idJob
    var vm = this;
    if (this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE)) {
      this.selectedJobType = this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE);
      this.filter.idJobApplicationType = this.selectedJobType;
      if (this.jobDetail == null || this.jobDetail == 'undefined') {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
        } else {
          this.setDataIfJobDetail()
        }
      } else {
        this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
        this.setDataIfJobDetail()


      }
    } else {
      this.setDataIfJobDetail()
    }

    this.sharedService.getJobStatus.subscribe((data: any) => {
      if (data == 'statuschanged') {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
          this.setDataIfJobDetail()
          this.reload()
        }
      }
    }, (e: any) => {
    })

    //check permission
    this.showJobApplicationAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDAPPLICATIONSWORKPERMITS)
    this.showJobApplicationDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEAPPLICATIONSWORKPERMITS)

  }


  /**
   * This method destroy object from component
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    
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
        this.isJobDetail = true
        if (this.jobDetail.status > 1) {
          $('.select-column').hide()
          this.btnShowHide = 'hide'
        } else {
          $('.select-column').show()
          this.btnShowHide = 'show'
        }
      })
    }
    if (this.jobDetail) {
      this.isJobDetail = true

      if (this.jobDetail.status > 1) {
        $('.select-column').hide()
        this.btnShowHide = 'hide'
      } else {
        $('.select-column').show()
        this.btnShowHide = 'show'
      }
    }

  }

  /**
   * This method will search in datatable
   * @method search
   * @param {string} srch Search Criteria
   */
  private search(srch: string) {
    this.table.search(srch).draw()
  }

  /**
   * This method will reload datatable
   * @method reload
   */
  reload() {
  }

}