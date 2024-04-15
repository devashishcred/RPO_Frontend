import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  Customer,
  IChangePassword,
  ICustomer,
  IRequestNewProject,
  IResetPassword,
  ISignUp,
} from "../../types/customer";
import { Observable } from "rxjs";
import { cloneDeep } from "lodash";
import { API_URL } from "../../app.constants";

@Injectable({
  providedIn: "root",
})
export class CustomerService {
  private customerAPIUrl = API_URL + "api/customers/";
  private customerAccountAPIUrl = API_URL + "api/CustomerAccount/";
  private contactUrl = API_URL + 'api/contacts'
  private projectAccessMailUrl = API_URL + 'api/CustomerAccount/GiveProjectAccessSendMail/'

  constructor(private httpClient: HttpClient) { }

  /**
  * This method is used to get user details
  * @method customerInfo
  */
  customerInfo(): Observable<Customer> {
    return this.httpClient.get<Customer>(this.customerAPIUrl + 'CustomerInfo')
  }

  /**
  * This method is used to get user details
  * @method customerInfo
  */
  getMyAccountDetails(id: number): Observable<any> {
    return this.httpClient.get<any>(API_URL + 'api/' + 'CustomerAccount/' + id)
  }
  /**
   * This method will save customer record
   * @method save
   * @param {ICustomer} data customer object
   */
  saveProfileDetail(data: ICustomer): Observable<ICustomer> {
    const customerData = cloneDeep(data);
    return this.httpClient.put<ICustomer>(API_URL + 'api/' + 'CustomerAccount/' + data.id, customerData);
  }

  /**
   * This method will save change password record
   * @method save
   * @param {IChangePassword} data change password object
   */
  saveChangePasswordDetail(data: IChangePassword): Observable<IChangePassword> {
    const changePasswordData = cloneDeep(data);
    return this.httpClient.put<IChangePassword>(
      `${this.customerAccountAPIUrl}PutchangePassword`,
      changePasswordData
    );
  }

  /**
   * This method will save support message record
   * @method save
   * @param {string} message support message detail
   */
  saveCustomerSupportDetail(data: any): Observable<any> {
    const supportData = cloneDeep(data);
    return this.httpClient.post<any>(`${this.customerAccountAPIUrl}SendEmail_customerservice`, supportData);
  }

  /**
   * This method will save support message record
   * @method save
   * @param {string} email support message detail
   */
  saveForgotPasswordDetail(email: any): Observable<any> {
    const pwdData = cloneDeep(email);
    return this.httpClient.post<any>(this.customerAccountAPIUrl + 'SendForgotPasswordMail', pwdData);
  }

  /**
   * This method will save reset password record
   * @method save
   * @param {IResetPassword} data reset password detail
   */
  saveResetPasswordDetail(data: IResetPassword): Observable<IResetPassword> {
    const resetPwdData = cloneDeep(data);
    return this.httpClient.put<IResetPassword>(
      this.customerAccountAPIUrl + "PutResetPassword",
      resetPwdData
    );
  }

  /**
   * This method will save sign up record
   * @method save
   * @param {ISignUp} data sign up detail
   */
  saveSignUpDetail(data: ISignUp): Observable<ISignUp> {
    const signUpData = cloneDeep(data);
    return this.httpClient.post<ISignUp>(`${this.customerAccountAPIUrl}Signup`, signUpData);
  }

  sendWelcomeEmail(data: any) {
    const tempData = cloneDeep(data);
    return this.httpClient.post<any>(`${this.customerAccountAPIUrl}SendWelcomeMail`, tempData).toPromise();
  }

  /**
   * This method will save request new project record
   * @method save
   * @param {IRequestNewProject} data request new project object
   */
  saveNewProjectDetail(data: IRequestNewProject): Observable<IRequestNewProject> {
    const newProjectData = cloneDeep(data);
    return this.httpClient.post<IRequestNewProject>(
      this.customerAccountAPIUrl + 'SendEmail_ProposalRequest',
      newProjectData
    );
  }

  /**
   * This method will get customer email id by contact id
   * @method get
   * @param {} data request new project object
   */
  getCustomerEmailByContactId(idContact): Observable<any> {
    return this.httpClient.get<any>(`${this.customerAccountAPIUrl}GetCustomerEmail/${idContact}`)
  }

  /**
  * This method is used to save image in database
  * @method saveProfileImage
  * @param {any} data type request Object
  */
  saveProfileImage(data: any): Observable<any> {
    return this.httpClient.put<any>(this.contactUrl + "/images", data);
  }
  
  saveCustomerImage(data: any): Observable<any> {
    return this.httpClient.put<any>(this.customerAccountAPIUrl + "Images", data);
  }

  setNotification(notificationConsent) {
    return this.httpClient.put<any>(this.customerAccountAPIUrl + 'PutCustomerConsent/' + notificationConsent, {}).toPromise();
  }

  getNotification() {
    return this.httpClient.get<any>(this.customerAccountAPIUrl + 'GetCustomerConsent').toPromise();
  }

  sendProjectAccessMail(idContact, idJob) {
    return this.httpClient.post(`${this.projectAccessMailUrl}${idContact}/${idJob}`, {}).toPromise()
  }

}
