import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { AddRfpProgressionNote } from './addrfpprogressionnotes';

declare const $: any
/**
* This component contains include all services related to Progression Note
* @class AddRfpProgressionNoteServices
*/
@Injectable()
export class AddRfpProgressionNoteServices {

  constructor(private http: HttpClient) { }

  private rfpProgressNotesUrl = API_URL + 'api/rfpProgressNotes';
  private rfpUrl = API_URL + 'api/rfps';

  /**
   * This method get progression notes list for datatable
   * @method getRecords
   * @param {any} cfg Search Criteria 
   */
  getRecords(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.rfpProgressNotesUrl
    }, cfg));
  }

  /**
   * This method create progression note
   * @method create
   * @param {any} data Progression Note Object 
   */
  create(data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.post<any>(this.rfpProgressNotesUrl, d)
  }

  /**
   * This method update progression note
   * @method update
   * @param {number} id ID of progression note
   * @param {any} data Progression Note Object 
   */
  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(this.rfpProgressNotesUrl + '/' + id, data)
  }

  /**
   * This method get progression note record for given id
   * @method getById
   * @param {number} id ID of progression note
   */
  getById(id: number): Observable<any> {
    return this.http.get<any>(this.rfpProgressNotesUrl + '/' + id)
  }

  /**
   * This method delete progression note
   * @method delete
   * @param {number} id ID of progression note
   */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.rfpProgressNotesUrl + '/' + id)
  }

  /**
   * This method get rfp progression note
   * @method getRfpNotes
   * @param {number} id ID of progression note 
   */
  getRfpNotes(id: number): Observable<any> {
    return this.http.get<any>(this.rfpUrl + '/' + id + '/rfpprogressnotes')

  }

}