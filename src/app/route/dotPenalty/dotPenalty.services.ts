import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { DotPenalty, DotPenaltyDTO } from './dotPenalty';

declare const $: any
/**
*  Class contains all services related to DotPenaltyServices
* @class DotPenaltyServices
*/
@Injectable()
export class DotPenaltyServices {

  constructor(private http: HttpClient) { }

  private dotPenaltyUrl = API_URL + 'api/DOTPenaltySchedules'

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<DotPenalty[]> {
    return this.http.get<DotPenalty[]>(this.dotPenaltyUrl)
  }

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): DotPenaltyDTO[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.dotPenaltyUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: DotPenalty): Observable<DotPenalty> {
    const d = cloneDeep(data)
    return this.http.post<DotPenalty>(this.dotPenaltyUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Contact Title for updating specific record
  */
  update(id: number, data: DotPenalty): Observable<any> {
    return this.http.put<any>(this.dotPenaltyUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Contact Title for getting specific record
  */
  getById(id: number): Observable<DotPenalty> {
    return this.http.get<DotPenalty>(this.dotPenaltyUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Contact Title to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.dotPenaltyUrl + '/' + id)
  }

}