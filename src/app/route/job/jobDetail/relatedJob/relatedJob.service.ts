import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../../../app.constants';

import { Job } from '../../../../types/job';
import { RelatedJob } from '../../../../types/relatedJob';

declare var $: any;

/**
* RelatedJobServices contains all services related to  Job related
* @class RelatedJobServices
*/
@Injectable()
export class RelatedJobServices {
    constructor(private http: HttpClient) { }

    private relatedJobUrl = API_URL + 'api/jobs/';
    private jobListUrl = API_URL + 'api/Jobs/dropdown';

    /**
    * This addRelatedJob is used to create a new record in database
    * @method addRelatedJob
    * @param {number} idChildJob idChildJob is an id of other job
    * @param {number} idJob idJob is an job id
    */
    addRelatedJob(idChildJob: number, idJob: number): Observable<RelatedJob> {
        return this.http.put<RelatedJob>(this.relatedJobUrl + idJob + "/Jobs/" + idChildJob, idChildJob)
    }

    /**
     * This deleteRelatedJob is used to delete a new record in database
     * @method deleteRelatedJob
     * @param {number} idChildJob idChildJob is an id of other job
     * @param {number} idJob idJob is an job id
     */
    deleteRelatedJob(idJob: number, idChildJob: number): Observable<any> {
        return this.http.delete<any>(this.relatedJobUrl + idJob + "/Jobs/" + idChildJob)
    }

    /**
    *  Get single record from database
    * @method get
    * @param {number} idJob id of job for getting specific record
    */
    get(idJob: number): RelatedJob[] {
        return $.fn.dataTable.pipeline({
            url: this.relatedJobUrl + idJob + '/Jobs'
        })
    }

    /**
     *  Get single record from database
     * @method getAllJobById
     * @param {number} idJob id for getting all job record
     */
    getAllJobById(idJob: number): Observable<any> {
        return this.http.get<any>(this.relatedJobUrl + idJob + '/Jobs')
    }

    /**
    *  Get single record from database
    * @method getJobById
    * @param {number} id id of job for getting specific record
    */
    getJobById(idJob: number): Observable<any> {
        return this.http.get<any>(this.relatedJobUrl + idJob)
    }

    /**
    *  Get all records from database 
    * @method getAllJobs
    * @param {any} params params is used as a parameter for filtering job records
    */
    getAllJobsForDetails(params: any): Observable<Job[]> {
        return this.http.get<Job[]>(API_URL + 'api/jobs', {
            params
        })
    }
    getAllJobs() {
        return this.http.get<any>(this.jobListUrl)
      }
}