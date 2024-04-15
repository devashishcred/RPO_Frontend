import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { DwellingClassification } from './dwellingclassification';

declare const $: any
/**
* Class contains all services related to DwellingClassificationServices
* @class DwellingClassificationServices
*/
@Injectable()
export class DwellingClassificationServices {

  constructor(private http: HttpClient) { }

  private DwellingClassificationUrl = API_URL + 'api/multipledwellingclassifications'

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): DwellingClassification[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.DwellingClassificationUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: DwellingClassification): Observable<DwellingClassification> {
    const d = cloneDeep(data)
    return this.http.post<DwellingClassification>(this.DwellingClassificationUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Multiple Dwelling Classifications for updating specific record
  */
  update(id: number, data: DwellingClassification): Observable<any> {
    return this.http.put<any>(this.DwellingClassificationUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Multiple Dwelling Classifications for getting specific record
  */
  getById(id: number): Observable<DwellingClassification> {
    return this.http.get<DwellingClassification>(this.DwellingClassificationUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Multiple Dwelling Classifications to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.DwellingClassificationUrl + '/' + id)
  }


}