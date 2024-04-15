import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../../app.constants'
import { proposalReview } from '../../../types/proposalReview';
import { ActivatedRoute } from '@angular/router';
import { Verbiages } from '../../../types/verbiages';

declare var $: any;
/**
* Class contains all services related to ProposalReviewServices
* @class ProposalReviewServices
*/
@Injectable()
export class ProposalReviewServices {

  constructor(private http: HttpClient) { }

  private ProposalReviewUrl = API_URL + 'api/Rfps';
  private feeSchedule = API_URL + 'api/rfpfeeschedules';

  /**
  * This method is used to create a new record in database
  * @method addProposalReview
  * @param {any} data type request Object
  * @param {number} idRfp idRfp is RFP id
  * @param {boolean} isSaveAndExit isSaveAndExit if it is true and than navigate to RFP listing, otherwise it will moov on to next step.
  */
  addProposalReview(data: any, idRfp: number, isSaveAndExit: boolean, isApproveSend: boolean): Observable<any> {
    let headers = new HttpHeaders().set('isSaveAndExit', (isSaveAndExit) ? 'true' : 'false').set('isApproveSend', (isApproveSend) ? 'true' : 'false')
    return this.http.put<any>(this.ProposalReviewUrl + "/" + idRfp + "/ProposalReview", data, { headers: headers })
  }

  /**
  * This method is used to get proposal of specific RFP
  * @method getProposalReview
  * @param {number} idRfp id of proposal review
  */
  getProposalReview(idRfp: number): Observable<any> {
    return this.http.get<any>(this.ProposalReviewUrl + "/" + idRfp + "/ProposalReview")
  }

  /**
  * This method is used to get Fee schedule of specific RFP in dropdown format
  * @method getRfpFeeScheduleService
  * @param {number} id id of {{name}} for getting specific record
  */
  getRfpFeeScheduleService(idRfp: number): Observable<any> {
    return this.http.get<any>(this.feeSchedule + "/" + idRfp + "/dropdown")
  }
}