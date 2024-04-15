import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../app.constants';
import { ApplicationType } from './applicationtype';

declare const $: any
/**
* Class contains all services related to Application Type
* @class ApplicationTypeServices
*/
@Injectable()
export class ApplicationTypeServices {

  constructor(private http: HttpClient) { }

  private applicationTypesUrl = API_URL + 'api/JobApplicationTypes'
  private documentMasterUrl = API_URL + 'api/documentMasters'
  private postdocumentMasterUrl = API_URL + 'api/documentMaster'

  
  /**
  *  Get all records from database in datatable format
  * @method getAllJobApplicationTypes
  */
  getAllJobApplicationTypes(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.applicationTypesUrl
    }, cfg))
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: any): Observable<any> {
    return this.http.post<any>(this.applicationTypesUrl, data)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Application type for updating specific record
  */
  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(this.applicationTypesUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Application type for getting specific record
  */
  getById(id: number): Observable<any> {
    return this.http.get<any>(this.applicationTypesUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Application type to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.applicationTypesUrl + '/' + id)
  }
  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Application type to delete 
  */
 deleteDocumentMasterRecord(id: number): Observable<any> {
    return this.http.delete<any>(this.documentMasterUrl + '/' + id)
  }
  

  /**
  *  Get all dropdown data from 
  * @method getAllApplicationTypesDD()
  */
  getAllApplicationTypesDD(){
    return this.http.get<any>(this.applicationTypesUrl + '/dropdown/null')
  }

  /**
   * Get all Applucation rather than main 4 type
   * @method getAllChildAppType
   */
  getAllChildAppType(){
    return this.http.get<any>(this.applicationTypesUrl + '/Alldropdown')
  }
  /**
   * Get all Applucation rather than main 4 type
   * @method getAllChildAppType
   */
  getDocumentMasterList(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.documentMasterUrl
    }, cfg))
  }
  /**
   * Get all Applucation rather than main 4 type
   * @method getAllChildAppType
   */
  getDocumentMasterById(id: number){
    return this.http.get<any>(this.documentMasterUrl + '/' + id);
  }

    /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
 createDocumentMaster(data: any): Observable<any> {
  return this.http.post<any>(this.documentMasterUrl, data)
}

/**
* This method is used to update existing record in database
* @method update
* @param  {any} data type request Object
* @param {number} id id of Application type for updating specific record
*/
updateDocumentMaster(id: number, data: any): Observable<any> {
  return this.http.put<any>(this.documentMasterUrl + '/' + id, data)
}
  
  
}