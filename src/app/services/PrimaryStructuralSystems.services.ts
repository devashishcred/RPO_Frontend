import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../app.constants';
import { primaryStructuralSystems } from '../types/classifications';

/**
* Class contains all services related to Primary Structural Systems
* @class PrimaryStructuralSystemsServices
*/
@Injectable()
export class PrimaryStructuralSystemsServices {

  constructor(private http: HttpClient) { }

  private Url = API_URL + 'api/PrimaryStructuralSystems'

  /**
  * Get all records from database 
  * @method get
  */
  get(): Observable<primaryStructuralSystems[]> {
    return this.http.get<primaryStructuralSystems[]>(this.Url)
  }

  /**
  * This is used to get primary structural system in drop down records
  * @method getDropdown
  */
  getDropdown(): Observable<any[]> {
    return this.http.get<any>(this.Url + "/dropdown")
  }
}