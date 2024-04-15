import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../app.constants';
import { ContactTitle, ContactTitleDTO } from '../types/contactTitle';

declare const $: any
/**
*  Class contains all services related to ContactTitleServices
* @class ContactTitleServices
*/
@Injectable()
export class ContactTitleServices {

  constructor(private http: HttpClient) { }

  private contactTitleUrl = API_URL + 'api/contactTitles'

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<ContactTitle[]> {
    return this.http.get<ContactTitle[]>(this.contactTitleUrl)
  }

  /**
  *  Get all dropdown data from ContactTitle
  * @method getContactTitleDD
  */
  getContactTitleDD(): Observable<any[]> {
    return this.http.get<any[]>(this.contactTitleUrl + "/dropdown")
  }

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): ContactTitleDTO[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.contactTitleUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: ContactTitle): Observable<ContactTitle> {
    const d = cloneDeep(data)
    return this.http.post<ContactTitle>(this.contactTitleUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Contact Title for updating specific record
  */
  update(id: number, data: ContactTitle): Observable<any> {
    return this.http.put<any>(this.contactTitleUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Contact Title for getting specific record
  */
  getById(id: number): Observable<ContactTitle> {
    return this.http.get<ContactTitle>(this.contactTitleUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Contact Title to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.contactTitleUrl + '/' + id)
  }

}