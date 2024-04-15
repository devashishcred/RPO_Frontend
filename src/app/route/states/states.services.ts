import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { States } from './states';

declare const $: any

/**
* Class contains all services related to StatesServices
* @class StatesServices
*/
@Injectable()
export class StatesServices {

  constructor(private http: HttpClient) { }

  private StatesUrl = API_URL + 'api/States'

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  * @param {string} cfg it is a string type which is used for filter data from data table
  */
  getRecords(cfg: any = {}): States[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.StatesUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {States} data type request Object
  */
  create(data: States): Observable<States> {
    const d = cloneDeep(data)
    return this.http.post<States>(this.StatesUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {States} id id of state for updating specific record
  */
  update(id: number, data: States): Observable<any> {
    return this.http.put<any>(this.StatesUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of States for getting specific record
  */
  getById(id: number): Observable<States> {
    return this.http.get<States>(this.StatesUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of States to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.StatesUrl + '/' + id)
  }


}