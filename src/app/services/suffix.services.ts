import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';

import { API_URL } from '../app.constants';
import { Suffix } from '../types/prefix';

declare const $: any

/**
*  Class contains all services related to SuffixServices
* @class SuffixServices
*/

@Injectable()
export class SuffixServices {

  constructor(private http: HttpClient) { }

  private sufffixUrl = API_URL + 'api/Suffixes'

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<Suffix[]> {
    return this.http.get<Suffix[]>(this.sufffixUrl)
  }

  /**
  *  Get all dropdown data from suffix
  * @method getAllSuffix
  */
  getAllSuffix(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.sufffixUrl
    }, cfg))
  }

  /**
  *  Get all dropdown data from suffix
  * @method getSuffixDropdown
  */
  getSuffixDropdown(): Observable<any> {
    return this.http.get<any>(this.sufffixUrl + "/dropdown")
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.post<any>(this.sufffixUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of sufffix for updating specific record
  */
  update(id: number, data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.put<any>(this.sufffixUrl + '/' + id, d)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of sufffix for getting specific record
  */
  getById(id: number): Observable<any> {
    return this.http.get<any>(this.sufffixUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of sufffix to delete 
  */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.sufffixUrl + '/' + id)
  }

}