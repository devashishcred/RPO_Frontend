import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../app.constants';
import { WorkPermitType } from './workPermitType';

declare const $: any
/**
* Class contains all services related to Work Permit Type
* @class WorkPermitTypeServices
*/
@Injectable()
export class WorkPermitTypeServices {

  constructor(private http: HttpClient) { }

  private workPermitTypesUrl = API_URL + 'api/JobWorkTypes'
  private applicationTypesUrl = API_URL + 'api/JobApplicationTypes'


  /**
  *  Get all records from database in datatable format
  * @method getAllJobWorkPermitTypes
  */
  getAllJobWorkPermitTypes(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.workPermitTypesUrl
    }, cfg))
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: any): Observable<any> {
    return this.http.post<any>(this.workPermitTypesUrl, data)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Work Permit type for updating specific record
  */
  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(this.workPermitTypesUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Work Permit type for getting specific record
  */
  getById(id: number): Observable<any> {
    return this.http.get<any>(this.workPermitTypesUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Work Permit type to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.workPermitTypesUrl + '/' + id)
  }


  /**
  *  Get all dropdown data from 
  * @method getAllWorkPermitTypesDD
  */
  getAllWorkPermitTypesDD(id: number) {
    return this.http.get<any>(this.applicationTypesUrl + '/dropdown/'+id)
  }


  /**
 *  Get all dropdown data from 
 * @method getAllApplicationTypesDD()
 */
  getAllApplicationTypesDD() {
    return this.http.get<any>(this.applicationTypesUrl + '/dropdown/null')
  }

}