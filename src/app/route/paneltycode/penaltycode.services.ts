import { Company } from '../../types/company';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../app.constants';
import { Contact } from '../../types/contact';

declare const $: any
/**
*  Class contains all services related to PenaltyCode
* @class PenaltyCodeServices
*/
@Injectable()
export class PenaltyCodeServices {

  constructor(private http: HttpClient) { }

  private penaltyCodeUrl = API_URL + 'api/ViolationPaneltyCode'

  /**
  *  Get all records from database 
  * @method getAllPenaltyCode
  */
  getAllPenaltyCode(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.penaltyCodeUrl
    }, cfg))
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.post<any>(this.penaltyCodeUrl, d)
  }


  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Penalty Code for updating specific record
  */
  update(id: number, data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.put<any>(this.penaltyCodeUrl + '/' + id, d)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Penalty Code for getting specific record
  */
  getById(id: number): Observable<any> {
    return this.http.get<any>(this.penaltyCodeUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Penalty Code to delete 
  */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.penaltyCodeUrl + '/' + id)
  }

}