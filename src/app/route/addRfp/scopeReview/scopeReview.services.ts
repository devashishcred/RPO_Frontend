import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../../app.constants'
import { ScopeReview } from '../../../types/scopereview';
import { ActivatedRoute } from '@angular/router';
import { Verbiages } from '../../../types/verbiages';

declare var $: any;
/**
* Class contains all services related to ScopeReviewServices
* @class ScopeReviewServices
*/
@Injectable()
export class ScopeReviewServices {
  private sub: any;
  idRfp: number
  constructor(private http: HttpClient) {

  }
  private VerbiagesUrl = API_URL + 'api/Verbiages';
  

  private ScopeReviewUrl = API_URL + 'api/Rfps';

  /**
  * This method is used to create a new record in database
  * @method addScopeReview
  * @param {any} data type request Object
  * @param {number} idRfp idRfp of rfp id number for getting scope reivew details
  */
  addScopeReview(data: ScopeReview, idRfp: number): Observable<ScopeReview> {
    const d = cloneDeep(data)
    return this.http.put<ScopeReview>(this.ScopeReviewUrl + "/" + idRfp + "/ScopeReview", d)
  }

  /**
  *  Get single record from database
  * @method getScopeReview
  * @param {number} idRfp id of scope to get details of scope review
  */
  getScopeReview(idRfp: number): Observable<ScopeReview> {
    return this.http.get<ScopeReview>(this.ScopeReviewUrl + "/" + idRfp + "/ScopeReview")
  }

  /**
  *  Get all dropdown data from verbiage
  * @method getAllVerbiages
  */
  getAllVerbiages() {
    return this.http.get<any>(this.VerbiagesUrl)
  }

  /**
  *  Get all dropdown data from verbiage in dropdown format
  * @method getVerbiagesDropDown
  */
  getVerbiagesDropDown() {
    return this.http.get<any>(this.VerbiagesUrl + '/dropdown')
  }

  /**
  *  Get single record from verbiage database
  * @method getVerbiageById
  * @param {number} id id of {{name}} for getting specific record
  */
  getVerbiageById(id: number): Observable<any> {
    return this.http.get<any>(this.VerbiagesUrl + '/' + id)
  }
  /**
  *  Get single record from verbiage database
  * @method getVerbiageById
  * @param {number} id id of {{name}} for getting specific record
  */
 getVerbiageByyId(idrfp: number , idV: number): Observable<any> {
  return this.http.get<any>(this.ScopeReviewUrl + '/' + idrfp+ '/' + idV+ '/Verbiages')
}
}