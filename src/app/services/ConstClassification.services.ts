import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../app.constants';
import { constructionClassifications } from '../types/classifications';

/**
*  Class contains all services related to ConstClasificationsServices
* @class ConstClasificationsServices
*/
@Injectable()
export class ConstClasificationsServices {

  constructor(private http: HttpClient) { }

  private Url = API_URL + 'api/ConstructionClassifications'

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<constructionClassifications[]> {
    return this.http.get<constructionClassifications[]>(this.Url)
  }

 /**
  *  Get all dropdown data
  * @method getDropdownData
  */
  getDropdown(): Observable<any> {
    return this.http.get<any>(this.Url + "/dropdown")
  }
}