import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../app.constants';
import { Employee, EmployeeGrants } from '../../types/employee';

declare const $: any

/**
* Class contains all services related to EmployeeServices
* @class EmployeeServices
*/
@Injectable()
export class EmployeeServices {

  constructor(private http: HttpClient) { }

  private employeeUrl = API_URL + 'api/employees'
  private customerUrl = API_URL + 'api/customersadmin'

  /**
  *  Get all records from database in datatable format
  * @method get
  * @param {string} search it is a string type which is used for filter data from data table
  */
  get(search: any): Employee[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.employeeUrl
    }, search))
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: Employee): Observable<Employee> {
    
    const d = cloneDeep(data)
    d.isActive = !!d.isActive
    d.applicationPassword = d.applicationPassword || ''
    delete d.group
    d.agentCertificates.forEach(ac => {
      delete ac.documentType
    })
    return this.http.post<Employee>(this.employeeUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Employee for updating specific record
  */
  update(id: number, data: Employee): Observable<any> {
    const d = cloneDeep(data)
    d.isActive = !!d.isActive
    d.applicationPassword = d.applicationPassword || ''
    delete d.group
    d.agentCertificates.forEach(ac => {
      delete ac.documentType
    })

    if (!d.isActive)
      d.applicationPassword = 'xxxxxx'
    else
      delete d.applicationPassword

    return this.http.put<any>(this.employeeUrl + '/' + id, d)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Employee for getting specific record
  */
  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(this.employeeUrl + '/' + id)
  }
  
  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Employee for getting specific record
  */
  getCustomerById(id: number): Observable<Employee> {
    return this.http.get<Employee>(this.customerUrl + '/' + id)
  }

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Employee to delete 
  */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.employeeUrl + '/' + id)
  }

  /**
  *  Get single record along with specific document from database
  * @method getDocumentById
  * @param {number} id id of Employee for getting specific record
  * @param {number} idDocument idDocument of Employee for getting specific document record
  */
  getDocumentById(id: number, idDocument: number): Observable<any> {
    return this.http.get<any>((this.employeeUrl + '/' + id + '/document/' + idDocument), {
      observe: 'response',
      responseType: 'arraybuffer'
    } as any)
  }

  /**
  *  This method is used for changing password in database
  * @method changePassword
  * @param {number} id id of Employee for getting specific record
  * @param {string} password password is used to set new passsword
  */
  changePassword(id: number, password: string): Observable<void> {
    return this.http.put<void>(`${this.employeeUrl}/${id}/password/${password}`, null)
  }

  /**
  * This method is used to make user inactive in database
  * @method statusInactive
  * @param {number} id id of Employee for getting specific record
  */
  statusInactive(id: number): Observable<void> {
    return this.http.put<void>(this.employeeUrl + "/" + id + "/inactive", null)
  }

  /**
  * This method is used to make user active in database
  * @method statusActive
  * @param {number} id id of Employee for getting specific record
  * @param {string} password password of Employee for getting specific record
  */
  statusActive(id: number, password: string = 'xxxxxx'): Observable<void> {
    return this.http.put<void>(this.employeeUrl + "/" + id + "/active", null)
  }

  /**
 * This method is used to get grants of specific employee
 * @method grants
 * @param {number} id id of Employee for getting specific record
 */
  grants(id: number): Observable<EmployeeGrants> {
    return this.http.get<EmployeeGrants>(`${this.employeeUrl}/${id}/grants`)
  }

  /**
 * This method is used to update grants of specific employee
 * @method grants
 * @param {number} id id of Employee for getting specific record
 * @param {any} grants grants of Employee for updating specific record
 */
  setGrants(id: number, grants: EmployeeGrants): Observable<void> {
    return this.http.put<void>(`${this.employeeUrl}/${id}/grants`, grants)
  }

  setCustomerGrants(id: number, grants: EmployeeGrants): Observable<void> {
    return this.http.put<void>(`${this.customerUrl}/${id}/permissions`, grants)
  }

  /**
  *  Get all records from database 
  * @method getAllEmployee
  */
  getAllEmployee(): Observable<any> {
    return this.http.get<any>(this.employeeUrl)
  }

  /**
  * This method is used to save documents in database
  * @method saveEmployeeDocuments
  * @param {any} data here file is passed in body 
  */
  saveEmployeeDocuments(data: any): Observable<any> {
    return this.http.put<any>(this.employeeUrl + '/document', data)
  }

  /**
  *  Get all dropdown data from 
  * @method getEmpDropdown
  */
  getEmpDropdown() {
    return this.http.get<any>(this.employeeUrl + '/dropdown')
  }
  
}