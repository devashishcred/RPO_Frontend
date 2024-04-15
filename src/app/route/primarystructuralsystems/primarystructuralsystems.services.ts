import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { PrimaryStructuralSystems } from './primarystructuralsystems';
import { primaryStructuralSystems } from '../../types/classifications';

declare const $: any
/**
*  This component contains all function that are used in PrimaryStructuralSystemsServices
* @class PrimaryStructuralSystemsServices
*/
@Injectable()
export class PrimaryStructuralSystemsServices {

  constructor(private http: HttpClient) { }

  private PrimaryStructuralSystemsUrl = API_URL + 'api/PrimaryStructuralSystems'
  
  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): PrimaryStructuralSystems[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.PrimaryStructuralSystemsUrl
    }, cfg));
  }

 /**
 * This method is used to create a new record in database
 * @method create
 * @param {any} data type request Object
 */
  create(data: PrimaryStructuralSystems): Observable<PrimaryStructuralSystems> {
    const d = cloneDeep(data)
    return this.http.post<PrimaryStructuralSystems>(this.PrimaryStructuralSystemsUrl, d)
  }

 /**
 * This method is used to update existing record in database
 * @method update
 * @param  {any} data type request Object
 * @param {number} id id of Primary structural system for updating specific record
 */
  update(id: number, data: PrimaryStructuralSystems): Observable<any> {
    return this.http.put<any>(this.PrimaryStructuralSystemsUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Primary structural system for getting specific record
  */
  getById(id: number): Observable<PrimaryStructuralSystems> {
    return this.http.get<PrimaryStructuralSystems>(this.PrimaryStructuralSystemsUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Primary structural system to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.PrimaryStructuralSystemsUrl + '/' + id)
  }

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<primaryStructuralSystems[]> {
    return this.http.get<primaryStructuralSystems[]>(this.PrimaryStructuralSystemsUrl)
  }

  /**
  *  Get all dropdown data from Primary Structural Systems
  * @method getDropdown
  */
  getDropdown(): Observable<any> {
    return this.http.get<any>(this.PrimaryStructuralSystemsUrl+"/dropdown")
  }
}