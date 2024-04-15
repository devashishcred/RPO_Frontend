import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../app.constants';
import { State } from '../types/state';

/**
* Class contains all services related to State
* @class StateServices
*/
@Injectable()
export class StateServices {

  constructor(private http: HttpClient) { }

  private stateUrl = API_URL + 'api/states'

  /**
  * This method is used to get all states
  * @method get
  */
  get(): Observable<State[]> {
    return this.http.get<State[]>(this.stateUrl)
  }

  /**
  * This is used to get all records of state in dropdown format
  * @method getDropdown
  */
  getDropdown(): Observable<any[]> {
    return this.http.get<any[]>(this.stateUrl + "/dropdown")
  }
}