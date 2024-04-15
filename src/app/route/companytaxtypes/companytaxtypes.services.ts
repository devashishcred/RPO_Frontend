import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { CompanyTaxTypes } from './companytaxtypes';

declare const $: any

/**
* Class contains all services related to Company Tax Types Services
* @class CompanyTaxTypesServices
*/
@Injectable()
export class CompanyTaxTypesServices {

  constructor(private http: HttpClient) { }

  private CompanyTaxTypesUrl = API_URL + 'api/TaxIdTypes'

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  * @param {string} cfg it is a string type which is used for filter data from data table
  */
  getRecords(cfg: any = {}): CompanyTaxTypes[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.CompanyTaxTypesUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {CompanyTaxTypesany} data type request Object
  */
  create(data: CompanyTaxTypes): Observable<CompanyTaxTypes> {
    const d = cloneDeep(data)
    return this.http.post<CompanyTaxTypes>(this.CompanyTaxTypesUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {CompanyTaxTypes} data type request Object
  * @param {number} id id of company tax type for updating specific record
  */
  update(id: number, data: CompanyTaxTypes): Observable<any> {
    return this.http.put<any>(this.CompanyTaxTypesUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of {{name}} for getting specific record
  */
  getById(id: number): Observable<CompanyTaxTypes> {
    return this.http.get<CompanyTaxTypes>(this.CompanyTaxTypesUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of {{name}} to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.CompanyTaxTypesUrl + '/' + id)
  }
}