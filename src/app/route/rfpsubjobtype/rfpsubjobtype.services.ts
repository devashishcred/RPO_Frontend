import { Company } from '../../types/company';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../app.constants';

declare const $: any


/**
* Class contains all services related to RfpSubJobTypeServices
* @class RfpSubJobTypeServices
*/

@Injectable()
export class RfpSubJobTypeServices {

  constructor(private http: HttpClient) { }

  private rfpSubJobTypeUrl = API_URL + 'api/rfpSubJobTypes'

  /**
  *  Get all records from database in datatable format
  * @method getAllRfpSubJobTypes
  * @param {string} cfg it is a string type which is used for filter data from data table
  */
  getAllRfpSubJobTypes(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.rfpSubJobTypeUrl
    }, cfg))
  }


  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of {{name}} for getting specific record
  */
  getById(id: number): Observable<any> {
    return this.http.get<any>(this.rfpSubJobTypeUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of {{name}} to delete 
  */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.rfpSubJobTypeUrl + '/' + id)
  }

  /**
  *  Get all dropdown data from 
  * @method getDropDown
  */
  getDropDown(): Observable<any> {
    return this.http.get<any>(this.rfpSubJobTypeUrl + '/dropdown')
  }

}