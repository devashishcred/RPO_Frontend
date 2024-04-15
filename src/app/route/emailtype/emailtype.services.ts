import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { EmailType } from './emailtype';

declare const $: any
/**
*  Class contains all services related to EmailtypeServices
* @class EmailtypeServices
*/
@Injectable()
export class EmailtypeServices {

  constructor(private http: HttpClient) { }

  private emailTypeUrl = API_URL + 'api/emailTypes'

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): EmailType[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.emailTypeUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: EmailType): Observable<EmailType> {
    const d = cloneDeep(data)
    return this.http.post<EmailType>(this.emailTypeUrl, d)
  }

 /**
 * This method is used to update existing record in database
 * @method update
 * @param  {any} data type request Object
 * @param {number} id id of Email Type for updating specific record
 */
  update(id: number, data: EmailType): Observable<any> {
    return this.http.put<any>(this.emailTypeUrl + '/' + id, data)
  }

 /**
 *  Get single record from database
 * @method getById
 * @param {number} id id of Email Type for getting specific record
 */
  getById(id: number): Observable<EmailType> {
    return this.http.get<EmailType>(this.emailTypeUrl + '/' + id)
  }

 /**
 * This method is used to delete records from database
 * @method delete
 * @param {number} id  of Email Type to delete 
 */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.emailTypeUrl + '/' + id)
  }


}