import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';

import { OwnerType,OwnerTypeDTO } from './ownerType';

declare const $: any
/**
*  Class contains all services related to OwnerTypeServices
* @classname OwnerTypeServices
*/
@Injectable()
export class OwnerTypeServices {

  constructor(private http: HttpClient) { }

  private OwnerTypeUrl = API_URL + 'api/OwnerTypes'
  /**
  *  Get all records from database in datatable format
  * @method get
  */
  get(cfg: any = {}): OwnerTypeDTO[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.OwnerTypeUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: OwnerType): Observable<OwnerType> {
    const d = cloneDeep(data)
    return this.http.post<OwnerType>(this.OwnerTypeUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Address Type for updating specific record
  */
  update(id: number, data: OwnerType): Observable<any> {
    return this.http.put<any>(this.OwnerTypeUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Address Type for getting specific record
  */
  getById(id: number): Observable<OwnerType> {
    return this.http.get<OwnerType>(this.OwnerTypeUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Address Type to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.OwnerTypeUrl + '/' + id)
  }

   /**
  *  Get all dropdown data for address type
  * @method getDropdownData
  */
  getDropdownData(): Observable<any[]> {
    return this.http.get<any[]>(this.OwnerTypeUrl + "/dropdown")
  }
}