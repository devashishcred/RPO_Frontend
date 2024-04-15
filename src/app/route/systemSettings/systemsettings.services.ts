import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../app.constants';
import { SystemField } from '../../types/systemsettings';

declare const $: any
/**
*  Class contains all services related to SystemSettingsServices
* @class SystemSettingsServices
*/
@Injectable()
export class SystemSettingsServices {

  constructor(private http: HttpClient) { }
  private systemUrl = API_URL + 'api/SystemSettings';
  private SingleSystemSetting = API_URL + 'api/SystemSettings';

  /**
  *  Get all records from database in datatable format
  * @method getTheSystemSettings
  */
  getTheSystemSettings(search: any): SystemField[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.systemUrl
    }, search))
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of System Settings for getting specific record
  */
  getById(id: number): Observable<any> {
    return this.http.get<any>(this.SingleSystemSetting + '/' + id)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of System Settings for updating specific record
  */
  updateSettings(id: number, data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.put<any>(this.SingleSystemSetting + '/' + id, d)
  }
}