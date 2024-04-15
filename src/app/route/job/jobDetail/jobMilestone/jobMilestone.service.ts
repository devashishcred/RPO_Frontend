import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../../../app.constants';

import { JobMilestones, Job } from '../../../../types/job';

declare var $: any;

/**
* Class contains all services related to Job Milestone 
* @class JobMilestoneServices
*/
@Injectable()
export class JobMilestoneServices {
    constructor(private http: HttpClient) { }

    private jobMilestoneUrl = API_URL + 'api/JobMilestones/';
    private jobScopeMilestoneUrl = API_URL + 'api/ScopeMilestones/';
    private jobfeeschedules = API_URL + 'api/jobfeeschedules/';

    /**
    * This method is used to save new milestone record
    * @method saveMilestone
    * @param {data} type request Object
    * @param {number} idJob id of job
    */
    saveMilestone(data: any, idJob: number): Observable<JobMilestones> {
        const d = cloneDeep(data)
        return this.http.post<JobMilestones>(this.jobMilestoneUrl + idJob, d)
    }

    /**
    * This method is used to update existing record in database
    * @method editMilestone
    * @param  {any} data type request Object
    * @param {number} idJob id of job
    * @param {number} idMilestone id of milestone
    */
    editMilestone(data: any, idJob: number, idMilestone: number): Observable<JobMilestones> {
        const d = cloneDeep(data)
        return this.http.put<JobMilestones>(this.jobMilestoneUrl + idJob + "/" + "milestones/" + idMilestone, d)
    }

    /**
    * This method is used to delete records from database
    * @method deleteMilestone
    * @param {number} idMilestone id of milestone
    */
    deleteMilestone(idMilestone: number): Observable<JobMilestones> {
        return this.http.delete<JobMilestones>(this.jobMilestoneUrl + idMilestone)
    }

    /**
    * Get all record of milestone from database 
    * @method getMilestone
    * @param {number} idJob id of job for getting all record
    */
    getMilestone(idJob: number): Observable<any> {
        return this.http.get<any>(this.jobMilestoneUrl + idJob)
    }

    /**
    *  Get single record from database
    * @method getJobById
    * @param {number} idJob id of job for getting specific record
    */
    getJobById(idJob: number): Observable<any> {
        return this.http.get<any>(this.jobMilestoneUrl + idJob)
    }

    /**
     * This method is used to get fee services list
     * @method getFeeServices
     * @param {number} idJob id of job
     * @param {number} idMilestone id of milestone
     */
    getFeeServices(idJob: number, idMilestone: number): Observable<any> {
        return this.http.get<any>(this.jobfeeschedules + idJob + '/unlinkedservices/' + idMilestone)
    }

    /**
     * This method is used to get specific milestone details
     * @method getMilestoneDetail
     * @param {number} idJob id of job
     * @param {number} idMilestone id of milestone
     */
    getMilestoneDetail(idJob: number, idMilestone: number): Observable<any> {
        return this.http.get<any>(this.jobMilestoneUrl + idJob + '/' + idMilestone)
    }

    /**
    * This method is used to update existing milestone record in database
    * @method updateMilestone
    * @param  {any} data type request Object
    * @param {number} idMilestone id of milestone
    */
    updateeMilestone(data: any, idMilestone: number): Observable<JobMilestones> {
        const d = cloneDeep(data)
        return this.http.put<JobMilestones>(this.jobScopeMilestoneUrl + idMilestone, d)
    }
    updateMilestone(data: any, idMilestone: number): Observable<JobMilestones> {
        const d = cloneDeep(data)
        return this.http.put<JobMilestones>(this.jobMilestoneUrl + idMilestone, d)
    }
}