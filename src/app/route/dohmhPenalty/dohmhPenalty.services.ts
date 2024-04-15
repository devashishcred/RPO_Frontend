import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { DohmhPenalty, DohmhPenaltyDTO } from './dohmhPenalty';

declare const $: any
/**
*  Class contains all services related to DohmhPenaltyServices
* @class DohmhPenaltyServices
*/
@Injectable()
export class DohmhPenaltyServices {

  constructor(private http: HttpClient) { }

  private dohmhPenaltyUrl = API_URL + 'api/DOHMHCoolingTowerPenaltySchedules'

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<DohmhPenalty[]> {
    return this.http.get<DohmhPenalty[]>(this.dohmhPenaltyUrl)
  }

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): DohmhPenaltyDTO[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.dohmhPenaltyUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: DohmhPenalty): Observable<DohmhPenalty> {
    const d = cloneDeep(data)
    return this.http.post<DohmhPenalty>(this.dohmhPenaltyUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Contact Title for updating specific record
  */
  update(id: number, data: DohmhPenalty): Observable<any> {
    return this.http.put<any>(this.dohmhPenaltyUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Contact Title for getting specific record
  */
  getById(id: number): Observable<DohmhPenalty> {
    return this.http.get<DohmhPenalty>(this.dohmhPenaltyUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Contact Title to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.dohmhPenaltyUrl + '/' + id)
  }

}