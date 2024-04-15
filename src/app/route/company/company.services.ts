import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../app.constants';
import { Company, CompanyDTO, CompanyItem, CompanyType } from '../../types/company';
import { Contact } from '../../types/contact';
import { Job } from '../../types/job';

declare var $: any;
/**
  * CompanyServices class contains all services related to company
  * @class CompanyServices
  */
@Injectable()
export class CompanyServices {
  constructor(private http: HttpClient) { }

  private companyUrl = API_URL + 'api/companies';
  private companyTypeUrl = API_URL + 'api/CompanyTypes';
  private bisApiUrl = API_URL + 'api/bisNumber';
  private bisPageUrl = API_URL + 'api/bis/';

  /**
  * This method get all company records for datatable
  * @method get
  * @param {any} cfg Search criteria
  */
  get(cfg: any): CompanyDTO[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.companyUrl
    }, cfg));
  }

  /**
   * This method redirect to company list 
   * @method list
   */
  list(): Observable<CompanyItem[]> {
    return this.http.get<CompanyItem[]>(this.companyUrl + '/list')
  }

  /**
   * This method will create company record
   * @method create
   * @param {Company} data company object 
   */
  create(data: Company): Observable<Company> {
    const d = cloneDeep(data)
    return this.http.post<Company>(this.companyUrl, d)
  }

  /**
   * This method will update company record
   * @method update
   * @param {number} id ID of Company
   * @param {Company} data company object 
   */
  update(id: number, data: Company): Observable<any> {
    const d = cloneDeep(data)
    return this.http.put<any>(this.companyUrl + '/' + id, d)
  }
/**
  * This method is used to save record
  * @method saveCompanyDocuments
  * @param {data} type request Object
  */
 saveCompanyDocuments(data: any): Observable<any> {
  return this.http.put<any>(this.companyUrl + '/' + "document", data);
}
  

  /**
   * This method will get company record from given ID
   * @method getById
   * @param {number} id ID of Company 
   */
  getById(id: number): Observable<Company> {
    return this.http.get<Company>(this.companyUrl + '/' + id)
  }

  /**
   * This method will delete company record
   * @method delete
   * @param {number} id ID of company 
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.companyUrl + '/' + id)
  }

  /**
   * This method get BIS coompany information
   * @method getBusinessFromBis
   * @param {string} name Business Name 
   * @param {string} type Licence Type 
   * @param {any} licenceNumber Licence Number 
   */
  getBusinessFromBis(name: string, type: string,licenceNumber:any): Observable<any> {
    let params = {"businessName": name,"licenseType": type,"licenseNumber":licenceNumber}
    return this.http.post<any>(this.bisApiUrl, params)
  }

  /**
   * This method set bis page
   * @method getBisPage
   * @param {string} lId ID of Company 
   * @param {string} type Company Type 
   */
  getBisPage(lId: string, type: string): Observable<any> {
    return this.http.get<any>(this.bisPageUrl + type + '/' + lId)
  }

  /**
   * This method get Company data
   * @method getCompanyData
   */
  
  getCompanyData(): Observable<any> {
    return this.http.get<any>(this.companyUrl + '?draw=0&start=0');
  }
  
  getCompanyDropDown(): Observable<any> {
    return this.http.get<any>(API_URL + 'api/companies/dropdown');
  }
  /**
   * This method get contacts of company
   * @method getContacts
   * @param {number} id ID of Company 
   */
  getContacts(id: number): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.companyUrl + '/' + id + '/' + 'contacts')
  }

  /**
   * This method get jobs of company
   * @method getJobs
   * @param {number} id ID of Company
   */
  getJobs(id: number): Observable<Job[]> {
    return this.http.get<Job[]>(this.companyUrl + '/' + id + '/' + 'jobs')
  }

  /**
   * This method get all company types
   * @method getCompanyTypes
   */
  getCompanyTypes(): Observable<CompanyType[]> {
    return this.http.get<CompanyType[]>(this.companyTypeUrl)
  }

  /**
   * This method get all company types for dropdown
   * @method getCompanyTypesDD
   */
  getCompanyTypesDD(): Observable<any> {
    return this.http.get<any>(API_URL + "api/companytypes/dropdown")
  }

    /**
   * This method get all company License types for dropdown
   * @method getCompanyLicenseTypesDD
   */
     getCompanyLicenseTypesDD(): Observable<any> {
      return this.http.get<any>(API_URL + "api/companyLicenseType/dropdown")
    }

       /**
   * This method get all getResponsibilityDD for dropdown
   * @method getResponsibilityDD
   */
        getResponsibilityDD(): Observable<any> {
          return this.http.get<any>(API_URL + "api/Companies/Responsibilitydropdown")
        }

  /**
   * This method get all company data for dropdown
   * @method getCompanyDropdown
   */
  getCompanyDropdown() {
    return this.http.get<any>(this.companyUrl + '/dropdown')
  }

  /**
   * This method get all contacts data of company for dropdown
   * @method getContactOfComDD
   * @param {number} companyId Company ID
   */
  getContactOfComDD(companyId: number) {
    return this.http.get<any>(this.companyUrl + "/" + companyId + '/contactsDropdown')
  }
  getActiveContactOfComDD(companyId: number) {
    return this.http.get<any>(this.companyUrl + "/" + companyId + '/ActivecontactsDropdown')
  }

  /**
   * This method send email from company
   * @method sendmail
   * @param {any} data Data for Send Email 
   * @param {number} idCompany ID of Company 
   */
  sendmail(data: any, idCompany: number): Observable<any> {
    const d = cloneDeep(data)
    return this.http.post<any>(this.companyUrl + "/" + idCompany + "/email", d)
  }

  /**
   * This method save extra attchment in email
   * @method saveExtraAttachment
   * @param {any} data Data for Attachment 
   */
  saveExtraAttachment(data: any): Observable<any> {
    return this.http.post<any>(this.companyUrl + "/Attachment", data)
  }
}