import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../../../app.constants';

import { JobScope, Job } from '../../../../types/job';

declare var $: any;
/**
  * JobScopeServices class contains all services related to job scope
  * @class JobScopeServices
  */
@Injectable()
export class JobScopeServices {
    constructor(private http: HttpClient) { }

    private jobScopeUrl = API_URL + 'api/jobs/';

    /**
     * This method save scope in database
     * @method saveScope
     * @param {any} data Scope Data 
     * @param {number} idJob Id of Job 
     */
    saveScope(data: any, idJob: number): Observable<JobScope> {
        const d = cloneDeep(data)
        return this.http.post<JobScope>(this.jobScopeUrl + idJob + "/" + "scopes", d)
    }

    /**
     * This method edit scope in database
     * @method editScope
     * @param {any} data Scope Data 
     * @param {number} idJob Id of Job 
     * @param {number} idScope Id of JobScope
     */
    editScope(data: any, idJob: number, idScope: number): Observable<JobScope> {
        const d = cloneDeep(data)
        return this.http.put<JobScope>(this.jobScopeUrl + idJob + "/" + "scopes/" + idScope, d)
    }

    /**
     * This method get all scope list of job
     * @method getScope
     * @param {number} idJob ID of Job 
     */
    getScope(idJob: number): Observable<any> {
        return this.http.get<any>(this.jobScopeUrl + idJob + "/" + "scopes")
    }

    /**
     * This method save general notes
     * @method saveGeneralNotes
     * @param {string} note Note Content 
     * @param {number} idJob Id of Job 
     */
    saveGeneralNotes(note: string, idJob: number): Observable<any> {
        let generalNotes = {
            'generalNotes': note
        }
        return this.http.put<JobScope>(this.jobScopeUrl + idJob + "/" + "ScopeGeneralNotes/", generalNotes)
    }

    /**
     * This method save job from id
     * @method getJobById
     * @param {number} idJob Id of Job 
     */
    getJobById(idJob: number): Observable<any> {
        return this.http.get<any>(this.jobScopeUrl + idJob)
    }

    /**
     * This method get job scope service items
     * @method getJobFeeSchedule
     * @param {number} idJob Id of Job 
     */
    getJobFeeSchedule(idJob: number): Observable<any> {
        return this.http.get<any>(API_URL + 'api/JobFeeSchedules?dataTableParameters.idJob=' + idJob);
    }

    /**
     * This method get job milestones
     * @method getJobMilestone
     * @param {number} idJob Id of Job 
     */
    getJobMilestone(idJob: number): Observable<any> {
        return this.http.get<any>(API_URL + 'api/JobsMilestones/' + idJob);
    }

    /**
    * This method update milestone po number from job scope grid
    * @method updateMileStonePONumber
    * @param {string} poNumber request parameter
    * @param {number} idMileStone request parameter
   */
    updateMileStonePONumber(poNumber: string, idMileStone: number): Observable<any> {
        let data = {idJobMilestone:idMileStone,poNumber:poNumber};
        return this.http.put<any>(API_URL + 'api/JobMilestones/ponumber', data);
    }

    /**
    * This method update milestone invoice number from job scope grid
    * @method updateMileStoneInvoiceNumber
    * @param {string} invoiceNumber request parameter
    * @param {number} idMileStone request parameter
   */
    updateMileStoneInvoiceNumber(invoiceNumber: string, idMileStone: number): Observable<any> {
        let data = {idJobMilestone:idMileStone,invoiceNumber:invoiceNumber};
        return this.http.put<any>(API_URL + 'api/JobMilestones/invoicenumber', data);
    }

    /**
    * This method update milestone invoice date from job scope grid
    * @method updateMileStoneInvoiceDate
    * @param {string} invoiceDate request parameter
    * @param {number} idMileStone request parameter
   */
    updateMileStoneInvoiceDate(invoiceDate: string, idMileStone: number): Observable<any> {
        let data = {invoicedDate:invoiceDate,idJobMilestone:idMileStone};
        return this.http.put<any>(API_URL + 'api/JobMilestones/invoicedDate', data);
    }

    /**
    * This method update milestone status from job scope grid
    * @method updateMileStoneStatus
    * @param {string} status request parameter
    * @param {number} idMileStone request parameter
   */
    updateMileStoneStatus(status: string, idMileStone: number): Observable<any> {
        let data = {idJobMilestone:idMileStone,milestoneStatus:status};
        return this.http.put<any>(API_URL + 'api/JobMilestones/status', data);
    }

    /**
    * This method update service item po number from job scope grid
    * @method updateServiceItemPONumber
    * @param {string} poNumber request parameter
    * @param {number} id request parameter
   */
    updateServiceItemPONumber(poNumber: string, id: number): Observable<any> {
        let data = {idJobFeeSchedule:id,poNumber:poNumber};
        return this.http.put<any>(API_URL + 'api/jobfeeschedules/ponumber', data);
    }

    /**
    * This method update service item invoice number from job scope grid
    * @method updateServiceItemInvoiceNumber
    * @param {string} invoiceNumber request parameter
    * @param {number} id request parameter
   */
    updateServiceItemInvoiceNumber(invoiceNumber: string, id: number): Observable<any> {
        let data = {idJobFeeSchedule:id,invoiceNumber:invoiceNumber};
        return this.http.put<any>(API_URL + 'api/jobfeeschedules/invoicenumber', data);
    }

    /**
    * This method update service item invoice date from job scope grid
    * @method updateServiceItemInvoiceNumber
    * @param {string} invoiceDate request parameter
    * @param {number} id request parameter
   */
    updateServiceItemInvoiceDate(invoiceDate: string, id: number): Observable<any> {
        let data = {invoicedDate:invoiceDate,idJobFeeSchedule:id};
        return this.http.put<any>(API_URL + 'api/jobfeeschedules/invoicedDate',data );
    }

    /**
    * This method save new scope in database
    * @method saveJobScope
    * @param {array} data request parameter
    * @param {number} idJob request parameter
   */
    saveJobScope(data:any,idJob:number): Observable<any> {
        return this.http.post<any>(API_URL + 'api/jobfeeschedules/' + idJob, data);
    }

    /**
    * This method get Scope History
    * @method getScopeHistory
    * @param{idJobFeeSchedule} data request Object
    */
    getScopeHistory(idJobFeeSchedule:number): Observable<any> {
        return this.http.get<any>(API_URL + 'api/TaskHistory?idJobFeeSchedule=' + idJobFeeSchedule);
    }

    /**
    * This method delete job scope record
    * @method deleteScope
    * @param{rfpAddress} data request Object
    */
    deleteScope(scopeId:number):Observable<any>{
        return this.http.put<any>(API_URL + 'api/JobFeeSchedules/remove/' + scopeId,{});
    }

    /**
    * This method get Timenote History
    * @method getTimeNoteHistory
    * @param{idJobFeeSchedule} data request Object
    */
    getTimeNoteHistory(idJobFeeSchedule:number): Observable<any> {
        return this.http.get<any>(API_URL + 'api/JobTimeNoteHistory?idJobFeeSchedule=' + idJobFeeSchedule);
    }
}