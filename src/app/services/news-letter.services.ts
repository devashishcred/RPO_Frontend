import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';

import { API_URL } from '../app.constants';

declare const $: any

/**
*  Class contains all services related to NewsLetterServices
* @class NewsLetterServices
*/

@Injectable()
export class NewsLetterServices {

  constructor(private http: HttpClient) { }

  private url = API_URL + 'api/News/'
  private getUrl = API_URL + 'api/'
  private postUrl = API_URL + 'api/NewsLetter'
  private deleteUrl = API_URL + 'api/NewsLetter/'

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<any> {
    return this.http.get<any>(this.url + 'GetNewsLetter')
  }

  /**
  *  Get all dropdown data from news
  * @method getAll
  */
  getAll(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.getUrl + 'NewsLetter'
    }, cfg))
  }

  getUpdatedNews() {
    return this.http.get(this.url + 'GetNewsLetter').toPromise()
  }


  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.post<any>(this.postUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of sufffix for updating specific record
  */
  update(id: number, data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.put<any>(this.url + '/' + id, d)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of sufffix for getting specific record
  */
  getById(id: number): Observable<any> {
    return this.http.get<any>(this.url + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of sufffix to delete 
  */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.deleteUrl + id)
  }

}