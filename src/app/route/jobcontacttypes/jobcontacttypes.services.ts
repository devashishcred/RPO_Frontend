import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { JobContactTypes } from './jobcontacttypes';

declare const $: any

/**
*  Class contains all services related to JobContactTypesServices
* @class JobContactTypesServices
*/
@Injectable()
export class JobContactTypesServices {

  constructor(private http: HttpClient) { }

  private JobContactTypesUrl = API_URL + 'api/JobContactTypes'

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): JobContactTypes[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.JobContactTypesUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: JobContactTypes): Observable<JobContactTypes> {
    const d = cloneDeep(data)
    return this.http.post<JobContactTypes>(this.JobContactTypesUrl, d)
  }

 /**
 * This method is used to update existing record in database
 * @method update
 * @param  {any} data type request Object
 * @param {number} id id of Job Contact Types for updating specific record
 */
  update(id: number, data: JobContactTypes): Observable<any> {
    return this.http.put<any>(this.JobContactTypesUrl + '/' + id, data)
  }

 /**
 *  Get single record from database
 * @method getById
 * @param {number} id id of Job Contact Types for getting specific record
 */
  getById(id: number): Observable<JobContactTypes> {
    return this.http.get<JobContactTypes>(this.JobContactTypesUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Job Contact Types to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.JobContactTypesUrl + '/' + id)
  }


}