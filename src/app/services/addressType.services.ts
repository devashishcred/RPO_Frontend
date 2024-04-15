import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../app.constants';
import { AddressType } from '../types/address';

/**
* Class contains all services related to AddressTypeServices
* @class AddressTypeServices
*/
@Injectable()
export class AddressTypeServices {

  constructor(private http: HttpClient) { }

  private AddressTypeUrl = API_URL + 'api/addressTypes'

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<AddressType[]> {
    return this.http.get<AddressType[]>(this.AddressTypeUrl)
  }

  /**
  *  Get all dropdown data for address type
  * @method getDropdownData
  */
  getDropdownData(): Observable<any[]> {
    return this.http.get<any[]>(this.AddressTypeUrl + "/dropdown")
  }
}