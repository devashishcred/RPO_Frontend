import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../app.constants';
import { multipleDwellingClassifications } from '../types/classifications';

/**
* Class contains all services related to Multiple Dwelling Classifications 
* @class multipleDwellingClassificationsServices
*/

@Injectable()
export class multipleDwellingClassificationsServices {

  constructor(private http: HttpClient) { }

  private Url = API_URL + 'api/MultipleDwellingClassifications'

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<multipleDwellingClassifications[]> {
    return this.http.get<multipleDwellingClassifications[]>(this.Url)
  }

  /**
  *  Get all dropdown data from Multiple Dwelling Classifications master in dropdown format
  * @method getDropdown
  */
  getDropdown(): Observable<any> {
    return this.http.get<any>(this.Url + "/dropdown")
  }
}