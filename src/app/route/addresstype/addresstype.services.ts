import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { AddressType, AddressTypeDTO } from '../../types/addresstype';

declare const $: any
/**
*  Class contains all services related to AddresstypeServices
* @classname AddresstypeServices
*/
@Injectable()
export class AddresstypeServices {

  constructor(private http: HttpClient) { }

  private addressTypeUrl = API_URL + 'api/addresstypes'
  /**
  *  Get all records from database in datatable format
  * @method get
  */
  get(cfg: any = {}): AddressTypeDTO[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.addressTypeUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: AddressType): Observable<AddressType> {
    const d = cloneDeep(data)
    return this.http.post<AddressType>(this.addressTypeUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Address Type for updating specific record
  */
  update(id: number, data: AddressType): Observable<any> {
    return this.http.put<any>(this.addressTypeUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Address Type for getting specific record
  */
  getById(id: number): Observable<AddressType> {
    return this.http.get<AddressType>(this.addressTypeUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Address Type to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.addressTypeUrl + '/' + id)
  }
}