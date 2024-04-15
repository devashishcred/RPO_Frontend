import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../app.constants';
import { occupancyClasifications } from '../types/classifications';

/**
* Class contains all services related to Occupancy Clasifications 
* @class OccuClasificationsServices
*/
@Injectable()
export class OccuClasificationsServices {

  constructor(private http: HttpClient) { }

  private Url = API_URL + 'api/OccupancyClassifications'

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<occupancyClasifications[]> {
    return this.http.get<occupancyClasifications[]>(this.Url)
  }

  /**
  * Get all dropdown data from occupancy master in dropdown format
  * @method getDropdown
  */
  getDropdown(): Observable<any> {
    return this.http.get<any>(this.Url + "/dropdown")
  }
}