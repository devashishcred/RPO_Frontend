import { Company } from '../../types/company';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

import { API_URL } from '../../app.constants';
import { Contact, IInviteContactRequest } from '../../types/contact';

declare const $: any

/**
* Class contains all services related to ContactServices
* @class ContactServices
*/
@Injectable()
export class ContactServices {
  private contactUrl = API_URL + 'api/contacts'
  private contactsAddRFPUrl = API_URL + 'api/Activecontacts/Dropdown'
  private contactsRFPUrl = API_URL + 'api/contactsTransmittal/Dropdown'
  private contactsStatusUrl = API_URL + 'api/contact/IsActive'
  private employeeUrl = API_URL + 'api/employees/dropdown'
  private customerInvitationUrl = API_URL + 'api/CustomerAccount/'
  private _isContactDeleted: BehaviorSubject<any>;

  constructor(private http: HttpClient) {
    this._isContactDeleted = <BehaviorSubject<any>>new BehaviorSubject(null);
  }


  /**
  *  Get all records from database in datatable format
  * @method get
  * @param {string} cfg it is a string type which is used for filter data from data table
  */
  get(cfg: any = {}): Contact[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.contactUrl
    }, cfg))
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: Contact): Observable<Contact> {
    const d = cloneDeep(data)
    return this.http.post<Contact>(this.contactUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of {{name}} for updating specific record
  */
  update(id: number, data: Contact): Observable<any> {
    const d = cloneDeep(data)
    return this.http.put<any>(this.contactUrl + '/' + id, d)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of {{name}} for getting specific record
  */
  getById(id: number): Observable<Contact> {
    return this.http.get<Contact>(this.contactUrl + '/' + id)
  }

  /**
  *  Get single document record from database
  * @method getDocumentById
  * @param {number} id id of {{name}} for getting specific record
  */
  getDocumentById(id: number, idDocument: number): Observable<any> {
    return this.http.get<any>((this.contactUrl + '/' + id + '/document/' + idDocument), {
      observe: 'response',
      responseType: 'arraybuffer'
    } as any)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Task Type for updating specific record
  */
  toggleStatus(data: any): Observable<any> {
    return this.http.put<any>(this.contactsStatusUrl, data)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of {{name}} to delete 
  */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.contactUrl + '/' + id)
  }

  /**
  *  Get all dropdown data from contact
  * @method getCotactData
  */
  getCotactData(): Observable<any> {
    return this.http.get<any>(this.contactUrl + '?draw=0&start=0');
  }

  /**
  *  Get all dropdown data from contact
  * @method getContactData
  */
  getContactData(): Observable<any> {
    return this.http.get<any>(this.contactUrl + '?dataTableParameters.individual=true');
  }

  /**
  * This method is used to get companies list
  * @method getCompany
  * @param {number} id type request Object
  */
  getCompany(id: number): Observable<Company> {
    return this.http.get<Company>(this.contactUrl + '/' + id + '/' + 'company')
  }

  /**
  *  Get all dropdown data from Contacts
  * @method getAllContacts
  */
  getAllContacts(): Observable<any> {
    return this.http.get<any>(this.contactUrl);
  }

  /**
  * This method is used to save image in database
  * @method saveProfileImage
  * @param {any} data type request Object
  */
  saveProfileImage(data: any): Observable<any> {
    return this.http.put<any>(this.contactUrl + '/' + "images", data);
  }

  /**
  * This method is used to save record
  * @method saveContactDocuments
  * @param {data} type request Object
  */
  saveContactDocuments(data: any): Observable<any> {
    return this.http.put<any>(this.contactUrl + '/' + "document", data);
  }

  /**
  *  Get all dropdown data from contact
  * @method getContactDropdown
  */
  getContactDropdown() {
    return this.http.get<any>(this.contactUrl + '/dropdown')
  }
  getrfpContactDropdown() {
    return this.http.get<any>(this.contactsAddRFPUrl)
  }
  getRFPContactDropdown() {
    return this.http.get<any>(this.contactsRFPUrl)
  }
  getEmployeeDropdown() {
    return this.http.get<any>(this.employeeUrl)
  }

  /**
  * This method is used to send email to user
  * @method sendmail
  * @param  {any} data type request Object
  * @param {number} idContact id of contact to whom email is to be send
  */
  sendmail(data: any, idContact: number): Observable<any> {
    const d = cloneDeep(data)
    return this.http.post<any>(this.contactUrl + "/" + idContact + "/email", d)
  }

  /**
  * This method is used to save attachment
  * @method saveExtraAttachment
  * @param {data} type request Object
  */
  saveExtraAttachment(data: any): Observable<any> {
    return this.http.post<any>(this.contactUrl + "/Attachment", data)
  }

  getIsContactDeleted() {
    return this._isContactDeleted.asObservable();
  }

  setIsContactDeleted(status: any) {
    console.log('status', status)
    this._isContactDeleted.next(status);
  }

  /**
 * This method is used to save send invite contact
 * @method sendInviteContact
 * @param {IInviteContactRequest} data request Object
 */
  sendInviteContact(idContact: number, idjob: number) {
    return this.http.post(this.customerInvitationUrl + "SendEmail_Invitaion/" + idContact + "/" + idjob, {})
  }

}