import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';
import { rfp, rfpDTO } from '../../types/rfp';
import { API_URL } from '../../app.constants'
declare var $: any;

/**
* This component contains include all services related to RFP Listing
* @class RfpListService
*/
@Injectable()
export class RfpListService {

  constructor(private http: HttpClient) { }

  private RfpUrl = API_URL + 'api/Rfps';

  /**
   * This method will get all records for RFP datatable
   * @method getRecords
   */
  getRecords(): rfpDTO[] {
    return $.fn.dataTable.pipeline({
      url: this.RfpUrl
    });
  }

  /**
   * This method will get all records for RFP datatable as per search criteria
   * @method getRecordsWithSearch
   * @param {any} search Search Criteria 
   */
  getRecordsWithSearch(search: any): rfpDTO[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.RfpUrl
    }, search))
  }

  /**
   * This method get all records of RFP
   * @method list
   */
  list(): Observable<rfp[]> {
    return this.http.get<rfp[]>(this.RfpUrl)
  }

  /**
   * This method will get record based on given ID
   * @method getById
   * @param {number} id ID of RFP 
   */
  getById(id: number): Observable<rfp> {
    return this.http.get<rfp>(this.RfpUrl + '/' + id)
  }

  /**
   * This method will get status of RFP
   * @method getStatus
   * @param {number} id ID of RFP
   */
  getStatus(id: number): Observable<number> {
    return this.http.get<number>(this.RfpUrl + '/' + id + '/status')
  }

  /**
   * This method will get email history of RFP
   * @method getEmailHistory
   * @param {number} id ID of RFP 
   */
  getEmailHistory(id: number): Observable<any> {
    return this.http.get<any>(API_URL + 'api/RfpEmailHistory/' + id)
  }

  /**
   * This method will get already linked Job
   * @method alreadyGetLinkedJob
   * @param {number} idRfp ID of RFP 
   */
  alreadyGetLinkedJob(idRfp: number) {
    return this.http.get<any>(this.RfpUrl + '/' + idRfp + '/rfplinkedjobs');
  }

  /**
   * This method will call when clone rfp is clicked for clone RFP
   * @method cloneRfp
   * @param {number} idRfp ID of RFP 
   */
  cloneRfp(idRfp: number) {
    return this.http.post<any>(this.RfpUrl + '/' + idRfp + '/clone', idRfp);
  }
}