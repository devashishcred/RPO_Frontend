import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ReportServices } from '../report.services';
import { JobServices } from '../../job/job.services';
import { AppComponent } from '../../../app.component';
import { ActivatedRoute } from '@angular/router';
import { constantValues } from '../../../app.constantValues';
import { UserRightServices } from '../../../services/userRight.services';
import { LocalStorageService } from '../../../services/local-storage.service';

/**
* This component contains all function that are used in JobComponent
* @class AllViolationReportComponent
*/
@Component({
  templateUrl: './jobList.component.html',
  styleUrls: ['./jobList.component.scss'],
  selector: 'app-job-list'
})
export class JobListComponent implements OnInit {

  @Input() reportDocument: any;
  @Input() modalRef: BsModalRef;
  selectedJobId: any;
  jobList: any = [];
  loading: boolean;
  jobDetail: any;
  modalRefCreateTransmittal: BsModalRef;
  isCustomerLoggedIn: boolean = false;

  /**
	 * Add transmittal form
	 * @property addtransmittal
	*/
  @ViewChild('addtransmittal',{static: true})
  private addtransmittal: TemplateRef<any>

  /**
    * This method define all services that requires in whole class
    * @method constructor
    */
  constructor(
    private reportServices: ReportServices,
    private modalService: BsModalService,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private route: ActivatedRoute,
    private appComponent: AppComponent,
    private jobServices: JobServices,
    private localStorageService: LocalStorageService
  ) { }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    this.isCustomerLoggedIn = this.localStorageService.getCustomerLoggedIn();
    this.reportServices.getJobListDropdown().subscribe(r => {
      this.jobList = r;
    })
  }

  /**
 * This method is used open add transmittal popup
 * @method openCreateTransmittalModal
 * @param {any} template TemplateRef 
 * @param {string} action Identify Action 
 * @param {number} id ID of Job 
 */
  openCreateTransmittalModal(jobId?: number) {
    this.modalRef.hide();
    this.loading = true;
    if(this.isCustomerLoggedIn) {
      this.jobServices.getCustomerJobDetailById(jobId).subscribe(res => {
        this.loading = false;
        this.jobDetail = res
        this.modalRefCreateTransmittal = this.modalService.show(this.addtransmittal, { class: 'modal-add-transmittal', backdrop: 'static', 'keyboard': true })
      }, error => {
        this.loading = false;
      })
    } else {
      this.jobServices.getJobById(jobId).subscribe(res => {
        this.loading = false;
        this.jobDetail = res
        this.modalRefCreateTransmittal = this.modalService.show(this.addtransmittal, { class: 'modal-add-transmittal', backdrop: 'static', 'keyboard': true })
      }, error => {
        this.loading = false;
      })
    }

  }

  modelClose() {
    this.modalRef.hide();
  }


}