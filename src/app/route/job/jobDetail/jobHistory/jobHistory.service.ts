import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../../../app.constants';

import { Job } from '../../../../types/job';

declare var $: any;
/**
  * JobHistoryServices class contains all services related Job History
  * @class JobHistoryServices  
  */
@Injectable()
export class JobHistoryServices {
    constructor(private http: HttpClient) { }

    private jobHistoryUrl = API_URL + 'api/JobHistory/';
    /**
     * This method get job history data based on criteria
     * @method getJobHistoryById
     * @param {number} idJob ID of Job 
     * @param {any} params Search Criteria 
     */
    getJobHistoryById(idJob:number,params:any):Observable<any>{
        return this.http.get<any>(this.jobHistoryUrl + idJob, {
            params
          })
    }
}