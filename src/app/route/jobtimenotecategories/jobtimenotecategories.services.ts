import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { JobTimenoteCategories } from './jobtimenotecategories';

declare const $: any
/**
* Class contains all services related to Job Timenote Categories Services
* @class JobTimenoteCategoriesServices
*/
@Injectable()
export class JobTimenoteCategoriesServices {

  constructor(private http: HttpClient) { }

  private JobTimenoteCategoriesUrl = API_URL + 'api/JobTimenoteCategories'

  /**
   * This method get all records for datatable
   * @method getRecords
   * @param {any} cfg Search Criteria 
   */
  getRecords(cfg: any = {}): JobTimenoteCategories[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.JobTimenoteCategoriesUrl
    }, cfg));
  }

  /**
   * This method will create record
   * @method create
   * @param {JobTimenoteCategories} data JobTimenoteCategories Object 
   */
  create(data: JobTimenoteCategories): Observable<JobTimenoteCategories> {
    const d = cloneDeep(data)
    return this.http.post<JobTimenoteCategories>(this.JobTimenoteCategoriesUrl, d)
  }

  /**
   * This method will update record
   * @method update
   * @param {number} id ID of record
   * @param {JobTimenoteCategories} data JobTimenoteCategories Object 
   */
  update(id: number, data: JobTimenoteCategories): Observable<any> {
    return this.http.put<any>(this.JobTimenoteCategoriesUrl + '/' + id, data)
  }

  /**
   * This method get record for given ID
   * @method getById
   * @param {number} id ID of Record 
   */
  getById(id: number): Observable<JobTimenoteCategories> {
    return this.http.get<JobTimenoteCategories>(this.JobTimenoteCategoriesUrl + '/' + id)
  }

  /**
   * This method delete record for given ID
   * @method delete
   * @param {number} id ID of Record 
   */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.JobTimenoteCategoriesUrl + '/' + id)
  }


}