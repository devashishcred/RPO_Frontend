import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../app.constants';
import { Prefix } from '../types/prefix';
import { cloneDeep } from 'lodash';

declare const $: any
/**
*  PrefixServices class contains all services related to prefix
* @class PrefixServices
*/
@Injectable()
export class PrefixServices {

  constructor(private http: HttpClient) { }

  private prefixUrl = API_URL + 'api/prefixes'

  /**
  * This method is used to get all records of prefix from database
  * @method get
  * @param "no parameters required"
  */
  get(): Observable<Prefix[]> {
    return this.http.get<Prefix[]>(this.prefixUrl)
  }

  /**
  * This method is used to get all records of prefix from database
  * @method getAllPrefix
  * @param "no parameters required"
  */
  getAllPrefix(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.prefixUrl
    }, cfg))
  }

  /**
  * This method is used to get all records of prefix from database for dropdown it will contains
  * only 2 items in response
  * @method getPrefixDropdown
  * @param "no parameters required"
  */
  getPrefixDropdown(): Observable<any> {
    return this.http.get<any>(this.prefixUrl + "/dropdown")
  }

  /**
  * This method is used to create a new prefix in database
  * @method create
  * @param {data} data request Object of prefix
  */
  create(data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.post<any>(this.prefixUrl, d)
  }

  /**
  * This method is used to update existing prefix in database
  * @method update
  * @param {data} data request Object of prefix
  * @param {number} id as integer prefix id
  */
  update(id: number, data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.put<any>(this.prefixUrl + '/' + id, d)
  }

  /**
 * This method is used to get specific prefix record from database
 * @method getById
 * @param {data} data request Object of prefix
 * @param {number} id as integer prefix id
 */
  getById(id: number): Observable<any> {
    return this.http.get<any>(this.prefixUrl + '/' + id)
  }

  /**
 * This method is used to delete prefix record from database
 * @method delete
 * @param {number} id as integer prefix id
 */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.prefixUrl + '/' + id)
  }

}