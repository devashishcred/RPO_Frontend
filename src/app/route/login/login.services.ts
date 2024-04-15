import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../app.constants';
import { Login, Token } from '../../types/login';

declare var $: any;

@Injectable()
export class LoginServices {

  constructor(private http: HttpClient) { }

  private employeesUrl = API_URL + 'api/employees'
  private permissionUrl = API_URL + 'api/permissions'
  private tokenUrl = API_URL + 'token';
  private headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
  login(login: Login,isCustomer:boolean): Observable<Token> {
    const data = { ...login };
    data.client_id = 'web';
    data.grant_type = 'password';
    data.scope = isCustomer ? "customer" : ""
    return this.http.post<Token>(this.tokenUrl, $.param(data), { headers: this.headers });
  }

  getAllPermisionsList() {
    return this.http.get<any>(this.permissionUrl);
  }


  getUserPermisionsList(userId: number) {
    return this.http.get<any>(this.employeesUrl+'/'+userId+'/grants');
  }
}