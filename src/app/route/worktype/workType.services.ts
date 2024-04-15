import { Company } from '../../types/company';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../app.constants';
import { Contact } from '../../types/contact';

declare const $: any
/**
* Class contains all services related to WorkTypeServices
* @class WorkTypeServices
*/
@Injectable()
export class WorkTypeServices {

  constructor(private http: HttpClient) { }

  private workTypesUrl = API_URL + 'api/rfpServiceItems'
  private workTypeStatusUrl = API_URL + 'api/rfpServiceItem/IsActive'
  private partOfUrl = API_URL + 'api/rfppartof/'

  /**
  *  Get all records from database in datatable format
  * @method getAllWorkTypes
  * @param {string} cfg it is a string type which is used for filter data from data table
  */
  getAllWorkTypes(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.workTypesUrl
    }, cfg))
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.post<any>(this.workTypesUrl, d)
  }

 /**
 * This method is used to update existing record in database
 * @method update
 * @param  {any} data type request Object
 * @param {number} id id of Task Type for updating specific record
 */
toggleStatus(data: any): Observable<any> {
  return this.http.put<any>(this.workTypeStatusUrl , data)
}

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of {{name}} for updating specific record
  */
  update(id: number, data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.put<any>(this.workTypesUrl + '/' + id, d)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of {{name}} for getting specific record
  */
  getById(id: number): Observable<any> {
    return this.http.get<any>(this.workTypesUrl + '/' + id)
  }
  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of {{name}} for getting specific record
  */
  getPartOfDD(IdJobType: number ,IdJobDescription: number, IdJobSubType: number): Observable<any> {
    return this.http.get<any>(`${this.partOfUrl}${IdJobType}/${IdJobDescription}/${IdJobSubType}/dropdown`);
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of {{name}} to delete 
  */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.workTypesUrl + '/' + id)
  }

}