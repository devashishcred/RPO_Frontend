import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';
import { API_URL } from '../../../app.constants';
import { SystemField } from '../../../types/systemsettings';
declare const $: any

/**
* Class contains all services related to Job Reason Services
* @class JobReasonServices
*/

@Injectable()
export class JobReasonServices {
  constructor(private http: HttpClient) { }
  private reasonUrl = API_URL + 'api/JobHistory';

  /**
  * This method is used to create a new reason record for specific job
  * @method CreateReason
  * @param {any} data type request Object
  */
  CreateReason(data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.post<any>(this.reasonUrl, d)
  }
}