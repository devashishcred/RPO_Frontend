import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../../../app.constants';


declare const $: any
/**
* Class contains all services related to FeeScheduleServices
* @class FeeScheduleServices
*/
@Injectable()
export class FeeScheduleServices {

  constructor(private http: HttpClient) { }

  private feeScheduleUrl = API_URL + 'api/rfpFeeSchedules'

  /**
  *  Get all records of fees schedule from database in datatable format
  * @method 
  * @param {string} cfg it is a string type which is used for filter data from data table
  */
  getRecords(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.feeScheduleUrl
    }, cfg));
  }

}