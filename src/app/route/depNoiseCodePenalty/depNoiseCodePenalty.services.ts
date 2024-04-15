import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { DepNoiseCodePenalty, DepNoiseCodePenaltyDTO } from './depNoiseCodePenalty';

declare const $: any
/**
*  Class contains all services related to DepNoiseCodePenaltyServices
* @class DepNoiseCodePenaltyServices
*/
@Injectable()
export class DepNoiseCodePenaltyServices {

  constructor(private http: HttpClient) { }

  private depPenaltyUrl = API_URL + 'api/DEPNoiseCodePenaltySchedules'

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<DepNoiseCodePenalty[]> {
    return this.http.get<DepNoiseCodePenalty[]>(this.depPenaltyUrl)
  }

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): DepNoiseCodePenaltyDTO[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.depPenaltyUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: DepNoiseCodePenalty): Observable<DepNoiseCodePenalty> {
    const d = cloneDeep(data)
    return this.http.post<DepNoiseCodePenalty>(this.depPenaltyUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Contact Title for updating specific record
  */
  update(id: number, data: DepNoiseCodePenalty): Observable<any> {
    return this.http.put<any>(this.depPenaltyUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Contact Title for getting specific record
  */
  getById(id: number): Observable<DepNoiseCodePenalty> {
    return this.http.get<DepNoiseCodePenalty>(this.depPenaltyUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Contact Title to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.depPenaltyUrl + '/' + id)
  }

}