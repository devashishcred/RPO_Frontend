import { Injectable } from "@angular/core";
import { API_URL } from "../../../app.constants";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
declare const $: any

@Injectable({
  providedIn: 'root'
})
export class CustomerPermissionService {

  private customerUrl = API_URL + 'api/customersadmin/'
  private employeeUrl = API_URL + 'api/employees'
  private notificationUrl = API_URL + 'api/NotificationSettings/'

  constructor(private http: HttpClient) { }

  /**
  *  Get all records from database in datatable format
  * @method get
  * @param {string} search it is a string type which is used for filter data from data table
  */
  get(search: any): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.customerUrl + 'customers'
    }, search))
  }


  delete(id) {
    return this.http.delete<any>(this.customerUrl + id).toPromise()
  }


  getPermissions(id: number): Observable<any> {
    return this.http.get<any>(this.employeeUrl + '/' + id)
  }

  getCustomerPermissions(id: number): Observable<any> {
    return this.http.get<any>(this.customerUrl + id)
  }

  /**
  * This method is used to make user inactive in database
  * @method statusInactive
  * @param {number} id id of Employee for getting specific record
  */
  statusInactive(id: number): Observable<void> {
    return this.http.put<void>(this.customerUrl + id + "/inactive", null)
  }

  /**
  * This method is used to make user active in database
  * @method statusActive
  * @param {number} id id of Employee for getting specific record
  * @param {string} password password of Employee for getting specific record
  */
  statusActive(id: number, password: string = 'xxxxxx'): Observable<void> {
    return this.http.put<void>(this.customerUrl + id + "/active", null)
  }

  getNotificationSettings(customerId) {
    return this.http.get(this.notificationUrl + 'GetCustomerNotificationSetting/' + customerId).toPromise()
  }

  updateNotificationSettings(id, data: any) {
    return this.http.put(this.notificationUrl + 'CustomerNotificationSetting/' + id, data).toPromise()
  }

  addNotificationSettings(data: any) {
    return this.http.post(this.notificationUrl + 'CustomerNotifcationSettings', data).toPromise()
  }

}