import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../app.constants';
import { borough } from '../types/borough';

/**
*  Class contains all services related to BoroughServices
* @class BoroughServices
*/
@Injectable()
export class BoroughServices {

  constructor(private http: HttpClient) { }

  private Url = API_URL + 'api/Boroughs'

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<borough[]> {
    return this.http.get<borough[]>(this.Url)
  }

  /**
  *  Get all dropdown data for borough
  * @method getDropdownData
  */
  getDropdownData(): Observable<any[]> {
    return this.http.get<any[]>(this.Url + "/dropdown")
  }
}