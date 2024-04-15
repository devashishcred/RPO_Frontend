import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef,ViewChild, ElementRef } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { JobDetailComponent } from '../jobDetail.component';
import { JobHistoryServices } from './jobHistory.service';
import { JobSharedService } from '../../JobSharedService';
import { EmployeeServices } from '../../../employee/employee.services';
import * as _ from 'underscore';
import { Employee } from '../../../../types/employee';

declare const $: any
/**
* This component contains all function that are used in JobHistoryComponent
* @class JobHistoryComponent
*/
@Component({
  selector: '[job-history]',
  templateUrl:'./jobHistory.component.html',
  styleUrls: ['./jobHistory.component.scss']
})
export class JobHistoryComponent implements OnInit {
  /**
   * Filter History View
   * @property filterhistory
   */
  @ViewChild('filterhistory',{static: true})
  private filterhistory: TemplateRef<any>
  
  private dropdownSettings: any = {};
  modalRef: BsModalRef
  private sub: any
  idJob: number
  loading: boolean = false;
  jobHistoryData: any = []
  selectedEmp:any
  selectedType: any
  selectedStartDate: any
  selectedEndDate: any
  private loadHistoryAgain: Boolean

  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(    
    private modalService: BsModalService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private jobDetailComponent:JobDetailComponent,
    private JobHistoryService: JobHistoryServices,
    private employeeServices: EmployeeServices,
    private JobSharedService: JobSharedService,
  ) {
    this.idJob = this.jobDetailComponent.jobDetail.id;
    this.reloadFilter = this.reloadFilter.bind(this)
    this.JobSharedService.isUserLoggedIn.subscribe( value => {
      this.loadHistoryAgain = value;
      if (this.loadHistoryAgain) {
        let params: URLSearchParams = new URLSearchParams();
        params.set('jobHistoryAdvanceSearch.idJob', this.idJob+'')
        this.getJOBHISTORY(this.idJob,params);
      }
  });
  }

  /**
    * This method will be called once only when module is call for first time
    * @method ngOnInit
  */
  ngOnInit() {
    this.loading = true;
    this.dropdownSettings = {
      singleSelection: false,
      text: "Company Types",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class"
    };

    this.sub = this.route.parent.params.subscribe(params => {
      this.idJob = +params['id']; // (+) converts string 'id' to a number
      document.title = 'Project -' + this.idJob;
    });

    
    let params: URLSearchParams = new URLSearchParams();
    params.set('jobHistoryAdvanceSearch.idJob', this.idJob+'')
    this.getJOBHISTORY(this.idJob,params)
  }

  /**
   * This method cancel filter
   * @method cancelFilter
   */
  private getJOBHISTORY(jid: any, params: any) {
    this.JobHistoryService.getJobHistoryById(jid,params).subscribe(r => {
      if (r.length > 0) {
        this.jobHistoryData = r
        this.loading = false;
        this.loadHistoryAgain = false;
      }
    });
  }
  /**
   * This method cancel filter
   * @method cancelFilter
   */
  private cancelFilter() {
    $(".dropdown").removeClass("open");
  }

  /**
   * This method reload page based on criteria
   * @method reloadFilter
   * @param {number} idJob ID of Job
   * @param {any} selectedType Type
   * @param {any} selectedEmp Employee 
   * @param {any} selectedStartDate Startdate
   * @param {any} selectedEndDate EndDate
   */
  reloadFilter(idJob: number, selectedType: any, selectedEmp: any, selectedStartDate: any, selectedEndDate: any){
    this.selectedEmp = selectedEmp
    this.selectedType = selectedType
    this.selectedStartDate = selectedStartDate
    this.selectedEndDate = selectedEndDate

    this.loading = true;
    this.jobHistoryData = []
    let params: URLSearchParams = new URLSearchParams();
    params.set('jobHistoryAdvanceSearch.idJob', idJob+'');
    if(selectedEmp != ''){
      params.set('jobHistoryAdvanceSearch.idEmployee', selectedEmp);
    }
    if(selectedStartDate != ''){
      params.set('jobHistoryAdvanceSearch.fromDate', selectedStartDate);
    }
    if(selectedEndDate != ''){
      params.set('jobHistoryAdvanceSearch.toDate', selectedEndDate);
    }
    if(selectedType != undefined){
      for (let k = 0; k < selectedType.length; k++) {
        if(selectedType[k].id == 1){
          params.set('jobHistoryAdvanceSearch.isJob', "true");
        } else if(selectedType[k].id == 2){
          params.set('jobHistoryAdvanceSearch.isApplications', "true");
        } else if(selectedType[k].id == 3){
          params.set('jobHistoryAdvanceSearch.isWorkPermits', "true");
        } else if(selectedType[k].id == 4){
          params.set('jobHistoryAdvanceSearch.isContacts', "true");
        } else if(selectedType[k].id == 5){
          params.set('jobHistoryAdvanceSearch.isDocuments', "true");
        } else if(selectedType[k].id == 6){
          params.set('jobHistoryAdvanceSearch.isTransmittals_Memo', "true");
        } else if(selectedType[k].id == 7){
          params.set('jobHistoryAdvanceSearch.isScope', "true");
        } else {
          params.set('jobHistoryAdvanceSearch.isMilestone', "true");
        }
      }
    }    
    this.JobHistoryService.getJobHistoryById(idJob,params).subscribe(r => {
      this.loading = false;
      if (r.length > 0) {
        this.jobHistoryData = r        
      }
    });
  }

  /**
   * This method open filter history popup
   * @method _openModalFilterHistory
   * @param {any} template TemplateRef Object 
   */
  private _openModalFilterHistory(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-add-related-job',backdrop: 'static','keyboard':false })
  }

  /**
   * This method open filter history popup
   * @method openModalFilterHistory
   * @param {any} template TemplateRef Object
   * @param {number} id? ID of record of job history
   */
  openModalFilterHistory(template: TemplateRef<any>, id?: number) {
      this._openModalFilterHistory(template)
  }
}