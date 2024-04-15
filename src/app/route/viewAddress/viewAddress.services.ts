import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../app.constants'
import { rfpAddress } from '../../types/rfpAddress';

declare var $: any;
/**
* This component contains include all services related to ViewAddressServices
* @class ViewAddressServices
*/
@Injectable()
export class ViewAddressServices {
  constructor(private http: HttpClient) { }

  private rfpAddressUrl = API_URL + 'api/RfpAddresses/';

  /**
   * This method will get address based on ID
   * @method getByIdRfpAddress
   * @param {any} addressId ID of Address
   */
  getByIdRfpAddress(addressId:any): Observable<rfpAddress> {
    return this.http.get<rfpAddress>(this.rfpAddressUrl + addressId)
  }
}