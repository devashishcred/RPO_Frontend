import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { Address, AddressDTO } from '../../types/address';

declare const $: any

/**
* This class is used as a AddressMasterServices
* @class AddressMasterServices
* @constructor 
*/
@Injectable()
export class AddressMasterServices {

  constructor(private http: HttpClient) { }

  private addressUrl = API_URL + 'api/rfpAddresses'

  /**
  *  Get all records from database in datatable format
  * @method get
  * @param {string} cfg it is a string type which is used for filter data from data table
  */
  get(cfg: any = {}): AddressDTO[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.addressUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: Address): Observable<Address> {
    const d = cloneDeep(data)
    return this.http.post<Address>(this.addressUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of {{name}} for updating specific record
  */
  update(id: number, data: Address): Observable<any> {
    return this.http.put<any>(this.addressUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of {{name}} for getting specific record
  */
  getById(id: number): Observable<Address> {
    return this.http.get<Address>(this.addressUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of {{name}} to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.addressUrl + '/' + id)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of {{name}} for updating specific record
  */
  updateRfpAddress(data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.put<any>(this.addressUrl + "/" + data.id, d)
  }
}