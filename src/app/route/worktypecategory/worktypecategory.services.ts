import { Company } from '../../types/company';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../app.constants';

declare const $: any
/**
* Class contains all services related to WorkTypeCategoryServices
* @class WorkTypeCategoryServices
*/
@Injectable()
export class WorkTypeCategoryServices {

  constructor(private http: HttpClient) { }

  private rfpCheckListGroupUrl = API_URL + 'api/RfpServiceGroups'

  /**
  *  Get all records from database in datatable format
  * @method getAllSubJobTypes
  * @param {string} cfg it is a string type which is used for filter data from data table
  */
  getCheckListGroup(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.rfpCheckListGroupUrl
    }, cfg))
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of {{name}} for getting specific record
  */
  getById(id: number): Observable<any> {
    return this.http.get<any>(this.rfpCheckListGroupUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of {{name}} to delete 
  */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.rfpCheckListGroupUrl + '/' + id)
  }

  /**
  *  Get all dropdown data from Sub Job Type
  * @method getDropDown
  */
  getDropDown(): Observable<any> {
    return this.http.get<any>(this.rfpCheckListGroupUrl + '/dropdown')
  }

}