import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { HolidayCalendar } from './holidayCalendar';

declare const $: any
/**
* Class contains all services related to Holiday calendar
* @class HolidayCalendarServices
*/
@Injectable()
export class HolidayCalendarServices {

  constructor(private http: HttpClient) { }

  private HolidayCalendarUrl = API_URL + 'api/holidaycalenders'

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  * @param {string} cfg it is a string type which is used for filter data from data table
  */
  getRecords(cfg: any = {}): HolidayCalendar[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.HolidayCalendarUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {HolidayCalendar} data type request Object
  */
  create(data: HolidayCalendar): Observable<HolidayCalendar> {
    const d = cloneDeep(data)
    return this.http.post<HolidayCalendar>(this.HolidayCalendarUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {HolidayCalendar} data type request Object
  * @param {number} id id of {{name}} for updating specific record
  */
  update(id: number, data: HolidayCalendar): Observable<any> {
    return this.http.put<any>(this.HolidayCalendarUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of {{name}} for getting specific record
  */
  getById(id: number): Observable<HolidayCalendar> {
    return this.http.get<HolidayCalendar>(this.HolidayCalendarUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of holiday that we want to delete
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.HolidayCalendarUrl + '/' + id)
  }


}