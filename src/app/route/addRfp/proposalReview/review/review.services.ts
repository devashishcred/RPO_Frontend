import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../../../app.constants'


declare var $: any;
/**
* Class contains all services related to ReviewServices
* @class ReviewServices
*/
@Injectable()
export class ReviewServices {

  constructor(private http: HttpClient) { }

  private reviewUrl = API_URL + '/api/rfpReviewerTeams';

  /**
  * This method is used to update reviewers of RFP record in database
  * @method updateReviewTeam
  * @param  {any} data type request Object
  * @param {number} idRfp id of Reviewers for updating specific RFP record
  */
  updateReviewTeam(idRfp: number, data: any): Observable<any> {
    return this.http.put<any>(this.reviewUrl + '?idRfp=' + idRfp, data)
  }

 /**
  * This method is used to get list of reviewers for RFP record in database
  * @method getReviewTeam
  * @param {number} idRfp id of specific RFP record for getting reviewers
  */
  getReviewTeam(idRfp: number): Observable<any> {
    return this.http.get<any>(this.reviewUrl + '?idRfp=' + idRfp)
  }
}