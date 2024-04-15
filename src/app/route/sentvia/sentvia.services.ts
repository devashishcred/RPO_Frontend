import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { Sentvia } from './sentvia';

declare const $: any
/**
*  Class contains all services related to SentviaServices
* @class SentviaServices
*/
@Injectable()
export class SentviaServices {

  constructor(private http: HttpClient) { }

  private sentViaUrl = API_URL + 'api/transmissionTypes'

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): Sentvia[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.sentViaUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: Sentvia): Observable<Sentvia> {
    const d = cloneDeep(data)
    return this.http.post<Sentvia>(this.sentViaUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Sentvia for updating specific record
  */
  update(id: number, data: Sentvia): Observable<any> {
    return this.http.put<any>(this.sentViaUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Sentvia for getting specific record
  */
  getById(id: number): Observable<Sentvia> {
    return this.http.get<Sentvia>(this.sentViaUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Sentvia to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.sentViaUrl + '/' + id)
  }


}