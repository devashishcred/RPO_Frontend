import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { FdnyPenalty, FdnyPenaltyDTO } from './fdnyPenalty';

declare const $: any
/**
*  Class contains all services related to FdnyPenaltyServices
* @class FdnyPenaltyServices
*/
@Injectable()
export class FdnyPenaltyServices {

  constructor(private http: HttpClient) { }

  private fdnyPenaltyUrl = API_URL + 'api/FDNYPenaltySchedules'

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<FdnyPenalty[]> {
    return this.http.get<FdnyPenalty[]>(this.fdnyPenaltyUrl)
  }

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): FdnyPenaltyDTO[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.fdnyPenaltyUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: FdnyPenalty): Observable<FdnyPenalty> {
    const d = cloneDeep(data)
    return this.http.post<FdnyPenalty>(this.fdnyPenaltyUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Contact Title for updating specific record
  */
  update(id: number, data: FdnyPenalty): Observable<any> {
    return this.http.put<any>(this.fdnyPenaltyUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Contact Title for getting specific record
  */
  getById(id: number): Observable<FdnyPenalty> {
    return this.http.get<FdnyPenalty>(this.fdnyPenaltyUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Contact Title to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.fdnyPenaltyUrl + '/' + id)
  }

}