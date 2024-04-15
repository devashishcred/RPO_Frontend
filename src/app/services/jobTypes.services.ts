import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../app.constants';
import { JobTypes } from '../types/jobTypes';
import { JobApplicationService } from '../services/JobApplicationService.services';
import { JobApplication, JobApplicationStatus, applicationType, Permit } from '../types/jobApplication';

/**
* Class contains all services related to JobTypes 
* @class JobTypesServices
*/
@Injectable()
export class JobTypesServices {

  constructor(private http: HttpClient) { }

  private url = API_URL + 'api/rfpjobtypes';
  private applicationType = API_URL + 'api/jobApplicationTypes';

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<JobTypes[]> {
    return this.http.get<JobTypes[]>(this.url)
  }

  /**
  * This method is used to get application types
  * @method getApplicationType
  */
  getApplicationType(): Observable<applicationType[]> {
    return this.http.get<applicationType[]>(this.applicationType)
  }

  /**
  *  Get all dropdown data from RFP job Type 
  * @method getRfpJobTypeDD
  */
  getRfpJobTypeDD(): Observable<any[]> {
    return this.http.get<any[]>(this.url + "/dropdown")
  }

  /**
  *  Get specific record from database of RFP sub job type
  * @method getRfpSubDataFromJobType
  * @param {number} idParent idParent of RFP sub job type
  */
  getRfpSubDataFromJobType(idParent: number): Observable<any[]> {
    return this.http.get<any[]>(this.url + "/" + idParent + "/jobtypes")
  }


}