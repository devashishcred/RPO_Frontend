import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../app.constants';

declare const $: any
/**
* Class contains all services related to Home Page
* @class HomeServices
*/
@Injectable()
export class HomeServices {

  constructor(private http: HttpClient) { }

  private homeUrl = API_URL + 'api/'

  getUpcomingAppointments(): Observable<any> {
    return this.http.get<any>(this.homeUrl + 'DashboardAppointments')
  }

  getUpcomingHearingDates(): Observable<any> {
    return this.http.get<any>(this.homeUrl + 'DashboardHearingDates')
  }

  getTaskAssignedTo(): Observable<any> {
    return this.http.get<any>(this.homeUrl + 'DashboardTasksAssignedToYou')
  }

  getTaskAssignedBy(): Observable<any> {
    return this.http.get<any>(this.homeUrl + 'DashboardTasksAssignedByYou')
  }

  getOverDueTasks(): Observable<any> {
    return this.http.get<any>(this.homeUrl + 'DashboardOverdueTasks')
  }
}