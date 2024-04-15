import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { DobPenalty, DobPenaltyDTO } from './dobPenalty';

declare const $: any
/**
*  Class contains all services related to DobPenaltyServices
* @class DobPenaltyServices
*/
@Injectable()
export class DobPenaltyServices {

  constructor(private http: HttpClient) { }

  private dobPenaltyUrl = API_URL + 'api/DOBPenaltySchedules'

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<DobPenalty[]> {
    return this.http.get<DobPenalty[]>(this.dobPenaltyUrl)
  }

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): DobPenaltyDTO[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.dobPenaltyUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: DobPenalty): Observable<DobPenalty> {
    const d = cloneDeep(data)
    return this.http.post<DobPenalty>(this.dobPenaltyUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Contact Title for updating specific record
  */
  update(id: number, data: DobPenalty): Observable<any> {
    return this.http.put<any>(this.dobPenaltyUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Contact Title for getting specific record
  */
  getById(id: number): Observable<DobPenalty> {
    return this.http.get<DobPenalty>(this.dobPenaltyUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Contact Title to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.dobPenaltyUrl + '/' + id)
  }

}