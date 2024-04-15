import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../app.constants';
import { Group } from '../../types/group';

declare const $: any

@Injectable()
export class UserGroupServices {

  constructor(private http: HttpClient) { }

  private groupsUrl = API_URL + 'api/groups'
  private permissionUrl = API_URL + 'api/Permissions'

  /**
  *  Get all records from database in datatable format
  * @method get
  */
  get(): Group[] {
    return $.fn.dataTable.pipeline({
      url: this.groupsUrl
    })
  }
/**
* This method is used to create a new record in database
* @method create
* @param {any} data type request Object
*/
  create(data: Group): Observable<Group> {
    return this.http.post<Group>(this.groupsUrl, data)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of User Group for updating specific record
  */
  update(id: number, data: Group): Observable<any> {
    return this.http.put<any>(this.groupsUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of User Group for getting specific record
  */
  getById(id: number): Observable<Group> {
    return this.http.get<Group>(this.groupsUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of User Group to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.groupsUrl + '/' + id)
  }

  /**
  * This method is used to update status of user group
  * @method status
  * @param {number} id id of User Group for getting specific record
  * @param {boolean} value value as to check whether user group is active or in-active
  */
  status(id: number, value: boolean): Observable<void> {
    return this.http.put<void>(`${this.groupsUrl}/${id}/status`, value, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8'
      })
    })
  }

  /**
  *  Get all records from database 
  * @method getPermissions
  */
  getPermissions(){
    return this.http.get<Group>(this.permissionUrl)
  }

}