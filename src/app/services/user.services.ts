import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../app.constants';
import { User } from '../types/user';

/**
* Class contains all services related to User
* @class UserServices
*/
@Injectable()
export class UserServices {

  constructor(private http: HttpClient) { }

  private userUrl = API_URL + 'api/users/'

  /**
  * This method is used to get user details
  * @method userinfo
  */
  userinfo(): Observable<User> {
    return this.http.get<User>(this.userUrl + 'userinfo')
  }
}