import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../app.constants';
import { Group } from '../types/group';

/**
*  Class contains all services related to GroupServices
* @class GroupServices
*/
@Injectable()
export class GroupServices {

  constructor(private http: HttpClient) { }

  private groupUrl = API_URL + 'api/groups'

  /**
   * This method give list of groups
   * @method list
   */
  list(): Observable<Group[]> {
    return this.http.get<Group[]>(this.groupUrl + '/list')
  }
}