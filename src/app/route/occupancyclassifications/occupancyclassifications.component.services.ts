import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { OccupancyClassifications } from './occupancyclassifications';

declare const $: any
/**
* This component contains all function that are used in OccupancyClassificationsServices
* @class OccupancyClassificationsServices
*/
@Injectable()
export class OccupancyClassificationsServices {

  constructor(private http: HttpClient) { }

  private OccupancyClassificationsUrl = API_URL + 'api/occupancyClassifications'

  /**
  *  Get all records from database 
  * @method getRecords
  */
  getRecords(cfg: any = {}): OccupancyClassifications[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.OccupancyClassificationsUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: OccupancyClassifications): Observable<OccupancyClassifications> {
    const d = cloneDeep(data)
    return this.http.post<OccupancyClassifications>(this.OccupancyClassificationsUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Occupancy Classifications for updating specific record
  */
  update(id: number, data: OccupancyClassifications): Observable<any> {
    return this.http.put<any>(this.OccupancyClassificationsUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Occupancy Classifications for getting specific record
  */
  getById(id: number): Observable<OccupancyClassifications> {
    return this.http.get<OccupancyClassifications>(this.OccupancyClassificationsUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Occupancy Classifications to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.OccupancyClassificationsUrl + '/' + id)
  }


}