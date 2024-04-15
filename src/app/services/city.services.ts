import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../app.constants';
import { City } from '../types/city';

/**
*  Class contains all services related to CityServices
* @class CityServices
*/
@Injectable()
export class CityServices {

  constructor(private http: HttpClient) { }

  private cityUrl = API_URL + 'api/cities'
  
  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<City[]> {
    return this.http.get<City[]>(this.cityUrl)
  }
}