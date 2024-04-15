import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { RelatedJob } from '../../../../../types/relatedJob';
import { RelatedJobServices } from '../relatedJob.service';
import * as _ from 'underscore';
import { Job } from '../../../../../types/job';
import { JobServices } from '../../../job.services';
import { rfp } from '../../../../../types/rfp';
import { ContactServices } from '../../../../contact/contact.services';
import { CompanyServices } from '../../../../company/company.services';
declare const $: any

@Component({
  selector: '[add-related-job]',
  templateUrl: './addRelatedJob.component.html'
})

export class AddRelatedJobComponent {

  @Input() modalRef: BsModalRef
  @Input() onSave: Function
  @Input() idJob: number
  @Input() addRelatedJob: RelatedJob
  @Input() reload: Function
  @Input() fromRfp?: boolean
  @Input() fromReports?: boolean
  @Input() receiveJobId: Function
  @Input() rfp: rfp
  @Input() setComAddress: Function
  @Input() getContactsFromCompany: Function
  @Input() setContactDetail: Function
  @Input() companies: any
  @Input() contacts: any

  loading: boolean = false
  dropdownList: any = [];
  private dropdownSettings: any = {};
  private preRelatedJobs: Job[] = []
  private jobs: Job[] = []
  private JobswithDetails: Job[] = []
  private finaljobs: Job[] = []
  addRelJob: number
  private jobNumber: string
  jobAddress: string
  jobSpecialPlace: string
  jobClient: string
  jobCompany: string
  private params: URLSearchParams = new URLSearchParams();
  constructor(
    private toastr: ToastrService,
    private RelatedJobService: RelatedJobServices,
    private jobServices: JobServices,
    private contactService: ContactServices,
    private companyService: CompanyServices,
  ) { }

  ngOnInit() {
    this.loading = true
    this.dropdownSettings = {
      singleSelection: false,
      text: "Contacts",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: false,
      classes: "myclass custom-class"
    };

    if (this.fromRfp) { // when click on existing job radio
      this.params.set('onlyMyJobs', 'false');
      this.RelatedJobService.getAllJobsForDetails(this.params).subscribe(r => {
        this.loading = false
        this.JobswithDetails = _.sortBy(r['data'], function (i: any) { return i.id; })
      })
      this.RelatedJobService.getAllJobs().subscribe(r => {
        this.loading = false
        this.jobs = _.sortBy(r, function (i: any) { return i.id; })
        for (let i = 0; i < this.jobs.length; i++) {
          this.dropdownList.push({ "id": this.jobs[i].id, "itemName": this.jobs[i].itemName })
        }
      })
    } else { // for job detail releated jobs tabs
      this.getJobs();
    }

  }

  /**
    * get all job list
    */
  private getJobs() {
    let chkPromise = this.getPreviouslyAddedJob()
    chkPromise.then(value => {
      this.params.set('onlyMyJobs', 'false');
      this.RelatedJobService.getAllJobsForDetails(this.params).subscribe(r => {
        this.loading = false
        this.JobswithDetails = _.sortBy(r['data'], function (i: any) { return i.id; })
      })
      this.RelatedJobService.getAllJobs().subscribe(r => {
        this.loading = false
        this.jobs = _.sortBy(r, function (i: any) { return i.id; });
        
        this.finaljobs = this.jobs.filter(x => x.id != this.idJob)
        for (var i = 0; i < this.preRelatedJobs.length; i++) {
          this.finaljobs = this.finaljobs.filter(x => x.id != this.preRelatedJobs[i].id)
          
        }
        for (let i = 0; i < this.finaljobs.length; i++) {
          this.dropdownList.push({ "id": this.finaljobs[i].id, "itemName": this.finaljobs[i].itemName });
        }
      })
    })
  }

  private getPreviouslyAddedJob(): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.RelatedJobService.getAllJobById(this.idJob).subscribe(r => {
        this.preRelatedJobs = r.data
        resolve(null)
      }, e => {
        reject()
      })
    })
  }

  applyContactFilter() {

  }
  onItemSelect(item: any) {
    this.applyContactFilter()
  }
  OnItemDeSelect(item: any) {
    this.applyContactFilter()
  }
  onSelectAll(items: any) {
    this.applyContactFilter()
  }
  onDeSelectAll(items: any) {
    this.applyContactFilter()
  }

  /**
   * Set Job details as per selection
   */
  setJobDetail() {
    let selectedJob: any = {}
    selectedJob = this.JobswithDetails.filter(x => x.id == this.addRelJob)[0]
    if (selectedJob) {
      this.jobNumber = selectedJob.jobNumber
      this.jobAddress = selectedJob.houseNumber + " " + selectedJob.streetNumber + " " + selectedJob.borough + " " + selectedJob.zipCode
      this.jobSpecialPlace = selectedJob.specialPlace
      this.jobClient = selectedJob.contact
      this.jobCompany = selectedJob.company
    }

  }

  save() {
    if (this.fromRfp) {
      this.loading = true
      this.jobServices.getJobDetailById(this.addRelJob, true).subscribe(r => {
        this.receiveJobId(r)
      })
    }else if (this.fromReports) {
      this.loading = true
      this.jobServices.getJobDetailById(this.addRelJob, true).subscribe(r => {
        this.receiveJobId(r)
      })
    } else {

      this.RelatedJobService.addRelatedJob(this.addRelJob, this.idJob).subscribe(
        r => {
          this.toastr.success('Job added successfully')
          this.reload()
        }
      )
    }
    this.modalRef.hide()
  }
}