import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../app.constants';

/**
*  Class contains all services related to ContactTypeServices
* @class ContactTypeServices
*/
@Injectable()
export class ContactTypeServices {

  constructor(private http: HttpClient) { }

  private contactTypeUrl = API_URL + 'api/JobContactTypes'

  /**
  *  Get all dropdown data
  * @method getDropdownData
  */
  get(): Observable<any[]> {
    return this.http.get<any[]>(this.contactTypeUrl)
  }

  /**
  *  Get all dropdown data
  * @method getDropdownData
  */
  getContactTypeDD(): Observable<any[]> {
    return this.http.get<any[]>(this.contactTypeUrl + "/dropdown")
  }
}