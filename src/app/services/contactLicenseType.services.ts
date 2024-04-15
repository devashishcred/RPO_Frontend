import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../app.constants';
import { ContactLicenseType } from '../types/contactLicense';

/**
*  Class contains all services related to ConstClasificationsServices
* @class ConstClasificationsServices
*/
@Injectable()
export class ContactLicenseTypeServices {

  constructor(private http: HttpClient) { }

  private contactLicenseTypeUrl = API_URL + 'api/contactLicenseType'

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<ContactLicenseType[]> {
    return this.http.get<ContactLicenseType[]>(this.contactLicenseTypeUrl)
  }

  /**
  *  Get all dropdown data
  * @method getDropdownData
  */
  getLicenceTypeDD(): Observable<any> {
    return this.http.get<any>(this.contactLicenseTypeUrl + "/dropdown")
  }
}