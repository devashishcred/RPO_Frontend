import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { CompanyTypes } from './companytypes';

declare const $: any
/**
*  Class contains all services related to CompanyTypesServices
* @class CompanyTypesServices
*/
@Injectable()
export class CompanyTypesServices {

  constructor(private http: HttpClient) { }

  private CompanyTypesUrl = API_URL + 'api/CompanyTypes'

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): CompanyTypes[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.CompanyTypesUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: CompanyTypes): Observable<CompanyTypes> {
    const d = cloneDeep(data)
    return this.http.post<CompanyTypes>(this.CompanyTypesUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Company Types for updating specific record
  */
  update(id: number, data: CompanyTypes): Observable<any> {
    return this.http.put<any>(this.CompanyTypesUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Company Types for getting specific record
  */
  getById(id: number): Observable<CompanyTypes> {
    return this.http.get<CompanyTypes>(this.CompanyTypesUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Company Types to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.CompanyTypesUrl + '/' + id)
  }


}