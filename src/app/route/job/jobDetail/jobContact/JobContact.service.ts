import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../../../app.constants';

import { Job } from '../../../../types/job';
import { RelatedJob } from '../../../../types/relatedJob';
import { Company } from '../../../../types/company';
import { Contact } from '../../../../types/contact';
import { JobContact } from '../../../../types/jobContact'

declare var $: any;
/**
  * JobContactServices class contains all services related Job Contacts
  * @class JobContactServices  
  */
@Injectable()
export class JobContactServices {
    constructor(private http: HttpClient) { }

    private ContactTypeUrl = API_URL + 'api/JobContactTypes';
    private CompanyUrl = API_URL + 'api/companies/dropdown';
    private CompanyContactUrl = API_URL + 'api/companies/';
    private ContactUrl = API_URL + 'api/contacts/';
    private AddressesUrl = API_URL + 'api/CompanyContactAddresses/';
    private JobUrl = API_URL + 'api/jobs/';
    private companyUrl = API_URL + 'api/companies';
    private jobContactUrl = API_URL + 'api/jobcontactgroups';
    private projectAccessMailUrl = API_URL + 'api/CustomerAccount/GiveProjectAccessSendMail/'
    /**
     * This method get list of all job contacts for data table
     * @method get
     * @param {number} idJob ID of Job 
     */
    get(idJob: number, isCustomer: boolean = false): JobContact[] {
        if (isCustomer) {
            return $.fn.dataTable.pipeline({
                url: this.JobUrl + idJob + '/AllContactsForCustomer'
            })
        } else {
            return $.fn.dataTable.pipeline({
                url: this.JobUrl + idJob + '/allcontacts'
            })
        }
    }

    /**
     * This method get all jobs list of given job
     * @method getAllJobContactById
     * @param {number} idJob ID of Job 
     */
    getAllJobContactById(idJob: number, onlyActive?: boolean): Observable<any> {
        if (onlyActive) {
            return this.http.get<any>(this.JobUrl + idJob + '/contacts')
        } else {
            return this.http.get<any>(this.JobUrl + idJob + '/Allcontacts')
        }
    }

    /**
     * This method will delete job contact
     * @method delete
     * @param {number} idJob ID of Job 
     * @param {number} idJobContact ID of Job Contact 
     */
    delete(idJob: number, idJobContact: number): Observable<void> {
        return this.http.delete<void>(this.JobUrl + idJob + "/contacts/" + idJobContact)
    }

    //add Job contact related apis

    /**
     * This method get all job contacts type
     * @method getAllJobContactType
     */
    getAllJobContactType(): Observable<any[]> {
        return this.http.get<any[]>(this.ContactTypeUrl)
    }

    /**
     * This method get all company list
     * @method getAllCompany
     */
    getAllCompany(): Observable<any[]> {
        return this.http.get<any[]>(this.CompanyUrl)
    }

    /**
     * This method get contacts of given company
     * @method getAllContact
     * @param {number} idCompany ID of Company  
     */
    getAllContact(idCompany: number): Observable<Contact[]> {
        return this.http.get<Contact[]>(this.CompanyContactUrl + idCompany + '/contactsDropdown')
    }
    getAllActiveContact(idCompany: number): Observable<Contact[]> {
        return this.http.get<Contact[]>(this.CompanyContactUrl + idCompany + '/ActivecontactsDropdown')
    }

    /**
     * This method get all contacts address list
     * @method getAllContactAddress
     * @param {number} idContact ID of Contact 
     */
    getAllContactAddress(idContact: number): Observable<Contact[]> {
        return this.http.get<Contact[]>(this.ContactUrl + idContact)
    }
    /**
     * This method get all contacts address list
     * @method getAllAddress
     * @param {number} idContact ID of Contact and idCompany ID of Company 
     */
    getAllAddress(idCompany: number, idContact?: number): Observable<Contact[]> {
        return this.http.get<Contact[]>(this.AddressesUrl + idCompany + '/' + idContact)
    }

    /**
     * This method will add job contact
     * @method addJobContact
     * @param {any} data Job Contact data 
     * @param {number} idJob Id of Job 
     */
    addJobContact(data: any, idJob: number): Observable<JobContact> {
        const d = cloneDeep(data)
        return this.http.post<JobContact>(this.JobUrl + idJob + "/contacts", d)
    }

    sendProjectAccessMail(idContact, idJob) {
        return this.http.post(`${this.projectAccessMailUrl}${idContact}/${idJob}`, {})
    }


    //edit
    getById(idJob: number, idJobContact: number): Observable<JobContact> {
        return this.http.get<JobContact>(this.JobUrl + idJob + '/contacts/' + idJobContact)
    }
    getDocumentById(id: number, idDocument: number): Observable<any> {
        return this.http.get<any>((this.ContactUrl + '/' + id + 'document/' + idDocument), {
            observe: 'response',
            responseType: 'arraybuffer'
        } as any)
    }
    saveProfileImage(data: any): Observable<any> {
        return this.http.put<any>(this.ContactUrl + '/' + "images", data);
    }
    saveContactDocuments(data: any): Observable<any> {
        return this.http.put<any>(this.ContactUrl + "document", data);
    }
    update(idJob: number, idJobContact: number, data: JobContact): Observable<any> {
        const d = cloneDeep(data)
        return this.http.put<any>(this.JobUrl + idJob + '/contacts/' + idJobContact, d)
    }
    getCompanyDropdown() {
        return this.http.get<any>(this.companyUrl + '/dropdown')
    }

    getJobContactById(idJob: number, idJobContact: number): Observable<any> {
        return this.http.get<any>(this.JobUrl + idJob + '/contacts/' + idJobContact)
    }

    updateJobContact(data: any, idJob: number, idJobContact: number): Observable<JobContact> {
        const d = cloneDeep(data)
        return this.http.put<JobContact>(this.JobUrl + idJob + "/contacts/" + idJobContact, d)
    }

    jobcontactgroups(idJob: number) {
        return this.http.get<any>(this.jobContactUrl + '/dropdown/' + idJob)
    }
}