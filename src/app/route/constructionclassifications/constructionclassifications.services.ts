import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { ConstructionClassifications } from './constructionclassifications';

declare const $: any
/**
*  Class contains all services related to ConstructionClassificationsServices
* @class ConstructionClassificationsServices
*/
@Injectable()
export class ConstructionClassificationsServices {

  constructor(private http: HttpClient) { }

  private ConstructionClassificationsUrl = API_URL + 'api/ConstructionClassifications'

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): ConstructionClassifications[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.ConstructionClassificationsUrl
    }, cfg));
  }

 /**
 * This method is used to create a new record in database
 * @method create
 * @param {any} data type request Object
 */
  create(data: ConstructionClassifications): Observable<ConstructionClassifications> {
    const d = cloneDeep(data)
    return this.http.post<ConstructionClassifications>(this.ConstructionClassificationsUrl, d)
  }

 /**
 * This method is used to update existing record in database
 * @method update
 * @param  {any} data type request Object
 * @param {number} id id of Construction classification for updating specific record
 */
  update(id: number, data: ConstructionClassifications): Observable<any> {
    return this.http.put<any>(this.ConstructionClassificationsUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Construction classification for getting specific record
  */
  getById(id: number): Observable<ConstructionClassifications> {
    return this.http.get<ConstructionClassifications>(this.ConstructionClassificationsUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Construction classification to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.ConstructionClassificationsUrl + '/' + id)
  }


}