import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../app.constants';
import { Document } from '../../../types/document';

declare const $: any
/**
* This component contains all services related to Document
* @class DocumentServices
*/
@Injectable()
export class DocumentServices {

  constructor(private http: HttpClient) { }

  private referenceDocumentUrl = API_URL + 'api/ReferenceDocuments'

  /**
   * This method gets document list for datatable
   * @method get
   */
  get(): Document[] {
    return $.fn.dataTable.pipeline({
      url: this.referenceDocumentUrl
    })
  }

  /**
   * This method create record in database
   * @method create
   * @param {any} data Document Object 
   */
  create(data: any): Observable<Document> {
    return this.http.post<Document>(this.referenceDocumentUrl, data)
  }

  /**
   * This method update record in database
   * @method update
   * @param {number} id ID of Document
   * @param {any} data Document Object 
   */
  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(this.referenceDocumentUrl, data)
  }

  /**
   * This method get record of document from database
   * @method getById
   * @param {number} id ID of Document 
   */
  getById(id: number): Observable<any> {
    return this.http.get<any>(this.referenceDocumentUrl + '/' + id)
  }

  /**
   * This method delete record from database
   * @method delete
   * @param {number} id ID of Document
   */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.referenceDocumentUrl + '/' + id)
  }

  /**
   * This method set status of document
   * @method status
   * @param {number} id ID of Document
   * @param {boolean} value Status Value 
   */
  status(id: number, value: boolean): Observable<void> {
    return this.http.put<void>(`${this.referenceDocumentUrl}/${id}/status`, value, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8'
      })
    })
  }
}