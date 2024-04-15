import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute, NavigationEnd, NavigationStart } from '@angular/router';

import { API_URL } from '../../app.constants';
import { jobDTO, Job } from '../../types/job';
//import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { constantValues } from './../../app.constantValues';
import { LocalStorageService } from '../../services/local-storage.service';
import { UserRightServices } from '../../services/userRight.services';
import { window } from "ngx-bootstrap/utils";

declare var $: any;

/**
 * JobServices contains all services related to job
 * @class JobServices
 */
@Injectable()
export class JobServices {

  private sub: any
  private jobId: number
  private jobUrl = API_URL + 'api/Jobs';
  private dobNow = API_URL + 'api/dobnowInspection/'
  private jobScopeRFPUrl = API_URL + 'api/jobfeeschedules/DownloadProposal/';
  private sessionStorage: any
  isCustomerLoggedIn: boolean = false;
  private storage = sessionStorage;

  constructor(
    private http: HttpClient,
    private constantValues: constantValues,
    private router: Router,
    private route: ActivatedRoute,
    //@Inject(SESSION_STORAGE) private storage: WebStorageService,
    private localStorageService: LocalStorageService,
    private userRight: UserRightServices
  ) {
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')


    this.sub = this.route.params.subscribe(params => {
      this.jobId = +params['id'];
    });
  }

  private headers = new HttpHeaders().set('Content-Type', 'application/json');

  /**
   *  Get all records from database in datatable format
   * @method getRecords
   * @param {any} search it is a string type which is used for filter data from data table
   */
  getRecords(search: any): jobDTO[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.jobUrl
    }, search))
  }

  /**
   * This method is used to create a new record in database
   * @method create
   * @param {any} data type request Object
   */
  createJob(data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.post<Job>(this.jobUrl, d)
  }

  /**
   * This method is used to update existing record in database
   * @method update
   * @param  {any} data type request Object
   * @param {number} id id of {{name}} for updating specific record
   */
  updateJob(id: number, data: Job): Observable<any> {
    const d = cloneDeep(data)
    return this.http.put<any>(this.jobUrl + '/' + id, d)
  }

  /**
   *  Get single record from database
   * @method getByJobNumber
   * @param {number} id id of job for getting specific record
   */
  getByJobNumber(id: number): Observable<any> {
    const d = cloneDeep(id)
    return this.http.get<any>(this.jobUrl + '/' + d)
  }

  /**
   *  Get single record from database
   * @method getJobById
   * @param {number} id id of job for getting specific record
   */
  getJobById(id: number): Observable<any> {
    const d = cloneDeep(id)
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
    if (this.isCustomerLoggedIn) {
      return this.http.get<any>(this.jobUrl + '/' + d + '/CustomerJobdetails')
    } else {
      return this.http.get<any>(this.jobUrl + '/' + d + '/details')
    }
  }

  /**
   *  Get single record from database
   * @method getJobDetailById
   * @param {number} id id of job for getting specific record
   * @param {boolean} isFromJobDetail isFromJobDetail is used to check whether function is called from job detail
   * or from the job listing page
   */
  getJobDetailById(id: number, isFromJobDetail?: boolean): Observable<any> {
    const d = cloneDeep(id)
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
    if (this.isCustomerLoggedIn) {
      return this.http.get<any>(this.jobUrl + '/' + d + '/CustomerJobdetails')
    } else {
      return this.http.get<any>(this.jobUrl + '/' + d + '/details')
    }
  }

  /**
   *  Get single record from database
   * @method getJobDetailById
   * @param {number} id id of job for getting specific record
   * @param {boolean} isFromJobDetail isFromJobDetail is used to check whether function is called from job detail
   * or from the job listing page
   */
  getCustomerJobDetailById(id: number): Observable<any> {
    const d = cloneDeep(id)
    return this.http.get<any>(this.jobUrl + '/' + d + '/CustomerJobdetails')
  }

  /**
   * Get Data From DOB NOW Page for perticular JobNumber
   */
  getDOBNOWJobDetail(id: any): Observable<any> {
    // let headers = new Headers();
    // headers.append('Content-Type', 'application/json');
    return this.http.get<any>(this.dobNow + id)
  }


  /**
   * This method is used to delete records from database
   * @method delete
   * @param {number} id  of job to delete
   */
  deleteByJobNumber(id: number): Observable<any> {
    return this.http.delete<void>(this.jobUrl + '/' + id)
  }


  /**
   * This method is used to change the job status
   * @method changeJobStatus
   * @param {number} id id of job
   * @param {any} data data is an object of job
   * @param {boolean} isFromReason isFromReason is used to indicate whether function is called from reason module
   or from job listing
   */
  changeJobStatus(id: number, data: any, isFromReason?: boolean): Observable<any> {
    /**
     * 1 = inprogress status
     * 2 = on hold status
     * 3 = completed status
     */
    const d = cloneDeep(data)
    if (isFromReason) {
      return this.http.put<any>(this.jobUrl + '/' + id + '/Status', d)
    } else {
      return this.http.put<any>(this.jobUrl + '/' + id + '/Status', d)
    }
  }

  getCustomerProjectName(idJob) {
    return this.http.get(this.jobUrl + '/GetJobName/' + idJob)
  }

  setCustomerProjectName(idJob, projectName) {
    return this.http.post(this.jobUrl + `/PostCustomerJobName/${idJob}/${projectName || null}`, {})
  }

  /**
   * This method is used to generate label for specific Job
   * @method generateLabel
   * @param {number} id id of Job for getting specific record
   */
  generateLabel(id: number): Observable<any> {
    const d = cloneDeep(id)
    return this.http.get<any>(this.jobUrl + '/' + d + '/Label')
  }

  /**
   * This method is used to link Job with RFP
   * @method getLinkedRFP
   * @param {number} idJob idJob of job for getting specific record
   */
  getLinkedRFP(idJob: number): Observable<any> {
    return this.http.get<any>(this.jobUrl + '/' + idJob + '/linkedrfps');

  }

  getLinkedRFPinJobScope(idJob: number): Observable<any> {
    return this.http.get<any>(this.jobScopeRFPUrl + idJob);
  }

  hideUnHideContact(idJobContact: number, ishiddenFromCustomer: boolean) {
    return this.http.put(`${this.jobUrl}/contacts/PutJobContactHiddenValue/${idJobContact}/${ishiddenFromCustomer}`, {}).toPromise()
  }


}