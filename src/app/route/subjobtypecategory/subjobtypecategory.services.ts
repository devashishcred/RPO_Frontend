import { Company } from '../../types/company';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../app.constants';

declare const $: any
/**
* This component contains all function that are used in SubJobTypeCategoryServices
* @class SubJobTypeCategoryServices
*/
@Injectable()
export class SubJobTypeCategoryServices {

  constructor(private http: HttpClient) { }

  private rfpSubJobTypeCategoriesUrl = API_URL + 'api/rfpSubJobTypeCategories'

  /**
  *  Get all records from database in datatable format
  * @method getAllSubJobTypesCategory
  */
  getAllSubJobTypesCategory(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.rfpSubJobTypeCategoriesUrl
    }, cfg))
  }


  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.post<any>(this.rfpSubJobTypeCategoriesUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of {{name}} for updating specific record
  */
  update(id: number, data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.put<any>(this.rfpSubJobTypeCategoriesUrl + '/' + id, d)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of {{name}} for getting specific record
  */
  getById(id: number): Observable<any> {
    return this.http.get<any>(this.rfpSubJobTypeCategoriesUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of {{name}} to delete 
  */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.rfpSubJobTypeCategoriesUrl + '/' + id)
  }

  /**
  *  Get all dropdown data from SubJobTypeCategories
  * @method getDropDown
  */
  getDropDown(): Observable<any> {
    return this.http.get<any>(this.rfpSubJobTypeCategoriesUrl + '/dropdown')
  }

}