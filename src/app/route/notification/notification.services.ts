import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { LocalStorageService } from '../../services/local-storage.service';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';

declare const $: any

@Injectable()
export class NotificationServices {
  isCustomerLoggedIn: boolean = false;

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService,
    private userRight: UserRightServices,
    private constantValues: constantValues
  ) {
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
  }

  private notificationUrl = API_URL + 'api/userNotifications'
  private notificationCustomerUrl = API_URL + 'api/customerNotifications'

  getBadgeList(loggedInUserId: number): Observable<any[]> {
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
    if(this.isCustomerLoggedIn) {
      return this.http.get<any[]>(API_URL + 'api/customers/' + loggedInUserId + "/customernotifications/badgelist")
    } else {
      return this.http.get<any[]>(API_URL + 'api/employees/' + loggedInUserId + "/usernotifications/badgelist")
    }
  }

  delete(id: number): Observable<any> {
    if(this.isCustomerLoggedIn) {
      return this.http.delete<any>(this.notificationCustomerUrl + '/' + id)
    } else {
      return this.http.delete<any>(this.notificationUrl + '/' + id)
    }
  }

  getAllNotificationByUser(search: any = {}, loggedInUserId?: any): any[] {
    if(this.isCustomerLoggedIn) {
      return $.fn.dataTable.pipeline($.extend(true, {
        url: this.notificationCustomerUrl
      }, search));
    } else {
      return $.fn.dataTable.pipeline($.extend(true, {
        url: this.notificationUrl
      }, search));
    }
  }

  getNotificationCount(loggedInUserId: number) {
    if(this.isCustomerLoggedIn) {
      return this.http.get<any[]>(API_URL + 'api/customers/' + loggedInUserId + "/customernotifications/count")
    } else {
      return this.http.get<any[]>(API_URL + 'api/employees/' + loggedInUserId + "/usernotifications/count")
    }
  }

  notificationIsRead(data: any) {
    const d = cloneDeep(data)
    if(this.isCustomerLoggedIn) {
      return this.http.put<any>(this.notificationCustomerUrl + "/read/" + d.id, d)
    } else {
      return this.http.put<any>(this.notificationUrl + "/read/" + d.id, d)
    }
  }


}