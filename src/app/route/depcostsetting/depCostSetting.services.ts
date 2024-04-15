import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { DepCostSetting } from './depCostSetting';

declare const $: any

/**
* Class contains all services related to  DEP cost setting
* @class DepCostSettingServices
*/

@Injectable()
export class DepCostSettingServices {

  constructor(private http: HttpClient) { }

  private DepCostSetttingUrl = API_URL + 'api/depCostSettings'

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  * @param {string} cfg it is a string type which is used for filter data from data table
  */
  getRecords(cfg: any = {}): DepCostSetting[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.DepCostSetttingUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {DepCostSetting} data type request Object
  */
  create(data: DepCostSetting): Observable<DepCostSetting> {
    const d = cloneDeep(data)
    return this.http.post<DepCostSetting>(this.DepCostSetttingUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {DepCostSetting} data type request Object
  * @param {number} id id of {{name}} for updating specific record
  */
  update(id: number, data: DepCostSetting): Observable<any> {
    return this.http.put<any>(this.DepCostSetttingUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of {{name}} for getting specific record
  */
  getById(id: number): Observable<DepCostSetting> {
    return this.http.get<DepCostSetting>(this.DepCostSetttingUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of {{name}} to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.DepCostSetttingUrl + '/' + id)
  }


}