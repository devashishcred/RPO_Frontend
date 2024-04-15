import { Company } from '../../types/company';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../app.constants';

declare const $: any
/**
* Class contains all services related to JobTypeServices
* @class JobTypeServices
*/
@Injectable()
export class JobTypeServices {

  constructor(private http: HttpClient) { }

  private rfpJobTypesUrl = API_URL + 'api/rfpJobTypes';
  private rfpSubJobTypesUrl = API_URL + 'api/rfpsubjobtypes';
  private rfpsubjobtypecategories = API_URL + 'api/rfpsubjobtypecategories';

  /**
  *  Get all records from database in datatable format
  * @method getAllJobTypes
  */
  getAllJobTypes(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.rfpJobTypesUrl
    }, cfg))
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.post<any>(this.rfpJobTypesUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of job type for updating specific record
  */
  update(id: number, data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.put<any>(this.rfpJobTypesUrl + '/' + id, d)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of job type for getting specific record
  */
  getById(id: number): Observable<any> {
    return this.http.get<any>(this.rfpJobTypesUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of job type to delete 
  */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.rfpJobTypesUrl + '/' + id)
  }

  /**
  *  Get all dropdown data from JobTypes
  * @method getDropDown
  */
  getDropDown(): Observable<any> {
    return this.http.get<any>(this.rfpJobTypesUrl + '/dropdown')
  }

  /**
  *  Get all dropdown data from SubJobType
  * @method getRfpSubJobType
  */
  getRfpSubJobType(id: number): Observable<any> { // sub job type category
    return this.http.get<any>(this.rfpJobTypesUrl + '/' + id + '/rfpsubjobtypecategories/dropdown')
  }

  /**
  *  Get all dropdown data from SubJob
  * @method getRfpSubJob
  */
  getRfpSubJob(id: number): Observable<any> { // sub job type
    return this.http.get<any>(this.rfpsubjobtypecategories + '/' + id + '/rfpsubjobtypes/dropdown')
  }

  /**
  *  Get all dropdown data from WorkTypeCategory
  * @method getRfpWorkTypeCategory
  */
  getRfpWorkTypeCategory(id: number): Observable<any> { // work type category
    return this.http.get<any>(this.rfpSubJobTypesUrl + '/' + id + '/rfpservicegroups/dropdown')
  }
}