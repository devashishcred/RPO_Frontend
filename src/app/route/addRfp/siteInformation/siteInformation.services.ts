import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../../app.constants'
import { rfpAddress } from '../../../types/rfpAddress';
import { rfp } from '../../../types/rfp';

declare var $: any;

/**
 * SiteInformationServices class contains all services related to RFP step1
 *
 * @class SiteInformationServices
 *
 */
@Injectable()
export class SiteInformationServices {
  constructor(private http: HttpClient) {
  }

  private rfpAddressUrl = API_URL + 'api/RfpAddresses';
  private addressTypeUrl = API_URL + 'api/AddressTypes';
  private siteInformationUrl = API_URL + 'api/Rfps';
  private AddressesUrl = API_URL + 'api/CompanyContactAddresses/';

  /**
   * This method create Proposal address record in database
   *
   * @method createRfpAddress
   * @param {rfpAddress} data request Object
   */
  createRfpAddress(data: rfpAddress): Observable<rfpAddress> {
    const d = cloneDeep(data)
    return this.http.post<rfpAddress>(this.rfpAddressUrl, d)
  }

  /**
   * This method get all contacts address list
   * @method getAllAddressforForm
   * @param {number} idContact ID of Contact and idCompany ID of Company
   */
  getAllAddressforForm(idCompany: number, idContact?: number): Observable<any> {
    return this.http.get<any>(this.AddressesUrl + idCompany + '/' + idContact)
  }

  /**
   * This method get all RFP address record from database
   *
   * @method getRfpAddress
   */
  getRfpAddress(): Observable<any> {
    return this.http.get<any>(this.rfpAddressUrl);
  }

  /**
   * This method add site information (save step 1) in database
   *
   * @method addSiteInformation
   * @param {rfp} data request Object
   */
  addSiteInformation(data: rfp): Observable<rfp> {
    const d = cloneDeep(data)
    return this.http.post<rfp>(this.siteInformationUrl, d)
  }

  /**
   * This method update site information (update step 1) record in database
   *
   * @method updateSiteInformation
   * @param {rfp} data request Object
   * @param {number} idRfp request Object
   */
  updateSiteInformation(data: rfp, idRfp: number): Observable<rfp> {
    const d = cloneDeep(data)
    return this.http.put<rfp>(this.siteInformationUrl + "/" + idRfp, d)
  }

  /**
   * This method get site information data of given id from database
   *
   * @method getSiteInformation
   * @param {number} idRfp request Object
   */
  getSiteInformation(idRfp: number): Observable<rfp> {
    return this.http.get<rfp>(this.siteInformationUrl + "/" + idRfp)
  }

  /**
   * This method get address information from bis site
   *
   * @method getBisAddresInfo
   * @param {Object} data request Object
   */
  getBisAddresInfo(data: any): Observable<any> {
    return this.http.post<rfp>(API_URL + 'api/bis/getadressinfo', data)
  }

  /**
   * This method get all dropdown options of RFP addresses from database
   *
   * @method getRfpAddressDropdown
   */
  getRfpAddressDropdown(): Observable<any> {
    return this.http.get<any>(this.rfpAddressUrl + "/dropdown");
  }

  /**
   * This method get RFP address of give address id from database
   *
   * @method getRfpAddressById
   * @param {number} id request Object
   */
  getRfpAddressById(id: number): Observable<any> {
    return this.http.get<any>(this.rfpAddressUrl + "/" + id);
  }

  /**
   * This method save rfp attachment documents from step1
   * @method saveRfpDocuments
   * @param {data} data request Object
   */
  saveRfpDocuments(data: any): Observable<any> {
    return this.http.put<any>(API_URL + '/api/rfpDocuments/document', data);
  }

}