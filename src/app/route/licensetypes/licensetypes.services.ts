import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { LicenseTypes } from './licensetypes';

declare const $: any
/**
*  Class contains all services related to LicenseTypesServices
* @class LicenseTypesServices
*/
@Injectable()
export class LicenseTypesServices {

  constructor(private http: HttpClient) { }

  private LicenseTypesUrl = API_URL + 'api/ContactLicenseTypes'

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): LicenseTypes[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.LicenseTypesUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */

  create(data: LicenseTypes): Observable<LicenseTypes> {
    const d = cloneDeep(data)
    return this.http.post<LicenseTypes>(this.LicenseTypesUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of License Types for updating specific record
  */
  update(id: number, data: LicenseTypes): Observable<any> {
    return this.http.put<any>(this.LicenseTypesUrl + '/' + id, data)
  }

 /**
 *  Get single record from database
 * @method getById
 * @param {number} id id of License Types for getting specific record
 */
  getById(id: number): Observable<LicenseTypes> {
    return this.http.get<LicenseTypes>(this.LicenseTypesUrl + '/' + id)
  }

 /**
 * This method is used to delete records from database
 * @method delete
 * @param {number} id  of License Types to delete 
 */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.LicenseTypesUrl + '/' + id)
  }


}