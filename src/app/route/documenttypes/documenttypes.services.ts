import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { DocumentTypes } from './documenttypes';

declare const $: any
/**
*  Class contains all services related to DocumentTypesServices
* @class DocumentTypesServices
*/
@Injectable()
export class DocumentTypesServices {

  constructor(private http: HttpClient) { }

  private DocumentTypesUrl = API_URL + 'api/DocumentTypes'

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): DocumentTypes[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.DocumentTypesUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: DocumentTypes): Observable<DocumentTypes> {
    const d = cloneDeep(data)
    return this.http.post<DocumentTypes>(this.DocumentTypesUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Document Types for updating specific record
  */
  update(id: number, data: DocumentTypes): Observable<any> {
    return this.http.put<any>(this.DocumentTypesUrl + '/' + id, data)
  }

 /**
 *  Get single record from database
 * @method getById
 * @param {number} id id of Document Types for getting specific record
 */
  getById(id: number): Observable<DocumentTypes> {
    return this.http.get<DocumentTypes>(this.DocumentTypesUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Document Types to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.DocumentTypesUrl + '/' + id)
  }


}