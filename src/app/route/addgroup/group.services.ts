import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { Group } from './Group';

declare const $: any
/**
*  Class contains all services related to GroupServices
* @classname ManageGroupServices
*/
@Injectable()
export class ManageGroupServices {

  constructor(private http: HttpClient) { }

  private groupUrl = API_URL + 'api/JobContactGroups'
  /**
  *  Get all records from database in datatable format
  * @method get
  */
  get(cfg: any = {}): Group[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.groupUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: Group): Observable<Group> {
    const d = cloneDeep(data)
    return this.http.post<Group>(this.groupUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Address Type for updating specific record
  */
  update(id: number, data: Group): Observable<any> {
    return this.http.put<any>(this.groupUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Address Type for getting specific record
  */
  getById(id: number): Observable<Group> {
    return this.http.get<Group>(this.groupUrl + '?dataTableParameters.idJob=' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Address Type to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.groupUrl + '/' + id)
  }
}