import { Company } from '../../types/company';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../app.constants';

declare const $: any
/**
* Class contains all services related to CheckListGroupServices
* @class CheckListGroupServices
*/
@Injectable()
export class CheckListGroupServices {

  constructor(private http: HttpClient) { }

  private rfpCheckListGroupUrl = API_URL + 'api/CheckListGroup'

  /**
  *  Get all records from database in datatable format
  * @method getCheckListGroup
  * @param {string} cfg it is a string type which is used for filter data from data table
  */
  getCheckListGroup(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.rfpCheckListGroupUrl
    }, cfg))
  }


    /**
  *  Get all dropdown data from JobTypes
  * @method getDropDown
  */
     getGroupTypeDropdown(): Observable<any> {
      return this.http.get<any>(API_URL + 'api/GroupTypeDropdown')
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
     * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.post<any>(this.rfpCheckListGroupUrl, d)
  }


   /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of job type for updating specific record
  */
    update(id: number, data: any): Observable<any> {
      const d = cloneDeep(data)
      return this.http.put<any>(this.rfpCheckListGroupUrl + '/' + id, d)
    }

    delete(id: number): Observable<void> {
      return this.http.delete<void>( API_URL + "api/Checklist/DeleteCheckListGroup/" + id)
    }
}