
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';
import { API_URL } from '../app.constants';
import { JobApplication, JobApplicationStatus, applicationType, Permit,workTypes } from '../types/jobApplication';


declare var $: any;

/**
* Class contains all services related to Job Application 
* @class JobApplicationService
*/
@Injectable()
export class JobApplicationService {
  constructor(private http: HttpClient) {

  }
  private applicationService = API_URL + 'api/jobApplications'
  private applicationStatus = API_URL + 'api/jobApplicationStatus'
  private applicationStatusDD = API_URL + 'api/jobApplicationStatus/dropdown'
  private applicationType = API_URL + 'api/jobApplicationTypes'
  private applicationWorkPermit = API_URL + 'api/JobApplicationWorkPermits'
  private applicationWorkPermitComplete = API_URL + 'api/JobApplicationWorkPermitsCompleted'
  private jobs = API_URL + 'api/jobs'
  private JobViolations = API_URL + 'api/JobViolations/'
  private holidayList = API_URL + 'api/HolidayCalenders/dropdown'
  private depCostValue = API_URL + 'api/DEPCostSettings/dropdown'
  private documentlistUrl = API_URL + '/api/JobDocument';
  private workTypes = API_URL + '/api/jobworktypes';


  /**
  * Get all records from database of application type
  * @method get
  */
  get(search: any = {}): JobApplication[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.applicationService
    }, search))
  }

  /**
  * This method is used to get application status
  * @method getApplicationStatus
  */
  getApplicationStatus(): Observable<JobApplicationStatus[]> {
    return this.http.get<JobApplicationStatus[]>(this.applicationStatus)
  }

  /**
  * This method is used to get application status dropdown
  * @method getApplicationStatusDD
  */
  getApplicationStatusDD(): Observable<JobApplicationStatus[]> {
    return this.http.get<JobApplicationStatus[]>(this.applicationStatusDD)
  }

  /**
  * This method is used to get application type
  * @method getApplicationType
  */
  getApplicationType(): Observable<applicationType[]> {
    return this.http.get<applicationType[]>(this.applicationType)
  }

  /**
  * This method is used to get application type dropdown data
  * @method getApplicationTypeDD
  */
  getApplicationTypeDD(idParentAppType?: any): Observable<applicationType[]> {
    return this.http.get<applicationType[]>(this.applicationType + "/dropdown/" + idParentAppType)
  }

  getWorkTypesDD(idApplicationType?:any):Observable<workTypes[]>{
    return this.http.get<workTypes[]>(this.workTypes + "/dropdown/" + idApplicationType)
  }

  getDobData(id: number): Observable<any> {
    return this.http.get<any>("https://data.cityofnewyork.us/resource/w9ak-ipjd.json?job_filing_number="+ id)
  }

  /**
   * This method is used to add/edit new Application for specific job
   * @method getApplicationType
   * @param {boolean} isNew : true if application is new else it is edit
   * @param {any} data data is an object of an application
   */
  addEditApplication(data: any, isNew: boolean): Observable<any> {
    const d = cloneDeep(data)
    if (isNew) {
      return this.http.post<any>(this.applicationService, d)
    } else {
      return this.http.put<any>(this.applicationService + "/" + data.id, d)
    }
  }

  /**
  * This method is used to delete records from database
  * @method deleteApplication
  * @param {number} id  of application to delete 
  */
  deleteApplication(id: number): Observable<any> {
    return this.http.delete<any>(this.applicationService + "/" + id)
  }

  /**
  *  Get single record from database
  * @method getApplicationById
  * @param {number} id id of application for getting specific record
  */
  getApplicationById(id: number): Observable<any> {
    return this.http.get<any>(this.applicationService + "/" + id)
  }

  /**
   * PERMIT API
   */

  /**
  * This method is used for filter/search records from datatable
  * @method getPermitByApplicationId
  * @param {any} search type any which contains string that can be filtered from datatable
  */
  linkWithBIS(idApplicationNumber: number): Observable<any> {
    let bin = ''
    return this.http.get<any>(this.documentlistUrl + "/PermitListFromBIS/" + idApplicationNumber +'/'+bin)

  }
  pullpermit(data: any): Observable<any> {
    return this.http.post<any>(this.documentlistUrl + "/PermitListFromBIS/", data)
}
  /**
  * This method is used for filter/search records from datatable
  * @method getPermitByApplicationId
  * @param {any} search type any which contains string that can be filtered from datatable
  */
  getPermitByApplicationId(search: any = {}): Permit[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.applicationWorkPermit
    }, search))
  }

  /**
  * This method is used to get all dropdown data from  work permit master
  * @method getWorkPermitTypes
  * @param {any} idWorkPemit idWorkPemit is an id of work permit/application 
  */
  getWorkPermitTypes(idWorkPemit: any): Observable<any[]> {
    return this.http.get<any[]>(this.applicationType + "/" + idWorkPemit + "/workTypes")
  }

  /**
  * This method is used to delete records from database
  * @method deleteWorkPermit
  * @param {any} idWorkPemit idWorkPemit is an id of work permit/application 
  */
  deleteWorkPermit(idWorkPemit: number): Observable<any> {
    return this.http.delete<any>(this.applicationWorkPermit + "/" + idWorkPemit)
  }
/**
  * This method is used to delete records from database
  * @method completeWorkPermit
  * @param {any} idWorkPemit idWorkPemit is an id of work permit/application 
  */
 completeWorkPermit(idWorkPemit: number): Observable<any> {
  return this.http.put<any>(this.applicationWorkPermitComplete + "/" + idWorkPemit,{})
}

  /**
  * This method is used to create/edit work permit record in database
  * @method addEditWorkPermit
  * @param {any} data type request Object
  * @param {boolean} isNew isNew is used to indicate whether work permit is new or old
  */
  addEditWorkPermit(data: any, isNew: boolean): Observable<any> {
    const d = cloneDeep(data)
    if (isNew) {
      return this.http.post<any>(this.applicationWorkPermit, d)
    } else {
      return this.http.put<any>(this.applicationWorkPermit + "/" + data.id, d)
    }
  }

  /**
  *  Get single record from database
  * @method getWorkPermitById
  * @param {number} id id of work permit for getting specific record
  */
  getWorkPermitById(id: number): Observable<any> {
    return this.http.get<any>(this.applicationWorkPermit + "/" + id)
  }

  /**
  *  Get all dropdown data from applications
  * @method getApplications
  * @param {number} idJob idJob as an id of job
  */
  getApplications(idJob: number): Observable<any> {
    return this.http.get<any>(this.applicationService + "?dataTableParameters.idJob=" + idJob)
  }

  /**
  *  Get all dropdown data from applications in dropdown format
  * @method getApplicationsDD
  * @param {number} idJob idJob as an id of job
  * @param {number} idJobType idJobType as an id of job type like DOB,DOT,DEP,VIOLATION
  */
  getApplicationsDD(idJob: number, idJobType: number): Observable<any> {
    return this.http.get<any>(this.applicationService + "/dropdown?idJob=" + idJob + '&idJobType=' + idJobType)
  }

  /**
  * This is used to get all work permits for specific application
  * @method getWorkPermits
  * @param {number} idApplication idApplication as an id of application number
  */
  getWorkPermits(idApplication: number): Observable<any> {
    return this.http.get<any>(this.applicationWorkPermit + "?dataTableParameters.idJobApplication=" + idApplication)
  }

  /**
    * This is used to get all job contacts for specific job
    * @method getJobContacts
    * @param {number} idJob idJob as an id of job
    */
  getJobContacts(idJob: number): Observable<any> {
    return this.http.get<any>(this.jobs + "/" + idJob + "/contacts")
  }

  /**
  * This method is used to get responsible contacts from company
  * @method getResponsibleDropDown
  */
  getResponsibleDropDown(): Observable<any> {
    return this.http.get<any>(this.applicationWorkPermit + "/responsibleDropdown")
  }

  /**
  * This is used get permits of job application
  * @method getAppWorkPermitDD
  * @param {number} id idJob as an id of job application
  */
  getAppWorkPermitDD(id: number): Observable<any> {
    return this.http.get<any>(this.applicationWorkPermit + "/dropdown?idJobApplication=" + id)
  }

  /**
  * This is used to upload work permit of DOT to database
  * @method readPDFWorkPermitFileForDOT
  * @param {any} data data as an object of files that to be uploaded
  */
  readPDFWorkPermitFileForDOT(data: any): Observable<any> {
    return this.http.put<any>(this.applicationWorkPermit + "/document", data)
  }

  /**
  * This method is used to save multiple work permits record
  * @method saveMultipleWorkPermits
  * @param {any} permits request Object of work permits
  */
  saveMultipleWorkPermits(permits: any): Observable<any> {
    return this.http.post<any>(this.applicationWorkPermit + "/multiple", permits)
  }

  /**
  * This method is used to upload permits and its documents
  * @method createJobDocumentOnUploadPermit
  * @param {any} data type request Object of an work permit of job document
  */
  createJobDocumentOnUploadPermit(data: any): Observable<any> {
    return this.http.put<any>(this.applicationWorkPermit + "/createjobdocument", data)
  }

  /**
  * This method is used to get list of violation
  * @method getListOfViolationDropdown
  */
  getListOfViolationDropdown(idJob: number) {
    return this.http.get<any>(this.JobViolations + "dropdown?idJob=" + idJob)
  }

  /**
  * This method is used to get list of holidays
  * @method getHolidayList
  */
  getHolidayList() {
    return this.http.get<any>(this.holidayList)
  }


  /**
  * This method is used to get DEP cost values
  * @method getDepCostValues
  */
  getDepCostValues() {
    return this.http.get<any>(this.depCostValue)
  }
}