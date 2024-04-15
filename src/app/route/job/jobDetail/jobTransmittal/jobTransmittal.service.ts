import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../../../app.constants';

import { Job } from '../../../../types/job';

declare var $: any;

/**
* This component contains all function that are used in Transmittal
* @class TransmittalServices
*/
@Injectable()
export class TransmittalServices {
    constructor(private http: HttpClient) { }

    private transmittalUrl = API_URL + 'api/JobTransmittals';

    /**
    *  Get all records from database in datatable format
    * @method get
    * @param {any} cfg it is a string type which is used for filter data from data table
    */
    get(cfg: any = {}): any[] {
        return $.fn.dataTable.pipeline($.extend(true, {
            url: this.transmittalUrl
        }, cfg));
    }

    /**
    * This method is used to send Email
    * @method sendmail
    * @param  {any} data type request Object
    * @param {number} idJob idJob is id of job 
    */
    sendmail(data: any, idJob: number,idTransmittal?:number,isDraft?:boolean,draftToSend?:boolean): Observable<any> {
        const d = cloneDeep(data)
        if((idTransmittal && isDraft) || draftToSend){
            return this.http.put<any>(this.transmittalUrl + "/" + idJob + "/email/" + idTransmittal, d)
        }else{
            return this.http.post<any>(this.transmittalUrl + "/" + idJob + "/email", d)
        }
        
    }

    /**
    * This method is used to save record
    * @method saveExtraAttachment
    * @param {data} data data contains a file object which is used for saving record in database
    */
    saveExtraAttachment(data: any): Observable<any> {
        return this.http.post<any>(this.transmittalUrl + "/Attachment", data)
    }

    /**
    *  Get single record from database
    * @method getById
    * @param {number} id id of transmittal for getting specific record
    */
    getById(id: number): Observable<any> {
        return this.http.get<any>(this.transmittalUrl + "/" + id)
    }

    /**
    * This method is used to delete records from database
    * @method delete
    * @param {number} id  of transmittal to delete 
    */
    delete(id: number): Observable<any> {
        return this.http.delete<any>(this.transmittalUrl + "/" + id)
    }

    /**
    * This method is used to create label for transmittal
    * @method createLabel
    * @param {number} id id of transmittal
    */
    createLabel(id: number): string {
        return this.transmittalUrl + '/' + id + '/LabelPDF'
    }

    /**
    * This method is used to print label of transmittal
    * @method printTransmittal
    * @param {number} id id of transmittal
    */
    printTransmittal(id: number): Observable<any> {
        return this.http.get<any>(this.transmittalUrl + "/" + id + '/print')
    }

    /**
    * This method is used to get job contact based on company selection
    * @method getJobContactsCompanyListDD
    * @param {number} idJob idJob of job id
    */
    getJobContactsCompanyListDD(idJob: number): Observable<any> {
        return this.http.get<any>(API_URL + "api/JobContacts/" + idJob + '/companydropdown')
    }

    /**
    * This method is used to get job contact based on company selection
    * @method getJobContactsContactsListDDContact
    * @param {number} idJob idJob of job id
    * @param {number} idCompany idCompany of company id
    */
    // old API
    getJobContactsContactsListDDContact(idJob: number, idCompany: number, onlyActive?: boolean): Observable<any> {

        if(onlyActive){
            return this.http.get<any>(API_URL + "api/JobContacts/" + idJob + '/company/' + idCompany + '/contactdropdown')
        }else{
            return this.http.get<any>(API_URL + "api/AllJobContacts/" + idJob + '/company/' + idCompany + '/contactdropdown')
        }
        
    }

    /**
    * This method is used to get job contact based on company selection
    * @method getJobContactsEmployeesListDD
    * @param {number} idJob idJob of job id
    * @param {number} idCompany idCompany of company id
    */
    getJobContactsEmployeesListDD(idJob: number, idCompany: number, onlyActive?: boolean): Observable<any> {
        if(onlyActive){
        return this.http.get<any>(API_URL + "api/JobContacts/" + idJob + '/company/' + idCompany + '/ContactEmployeedropdown')
        }else{
         return this.http.get<any>(API_URL + "api/AllJobContacts/" + idJob + '/company/' + idCompany + '/ContactEmployeedropdown')
        }
    }

    previewTransmittal(idJob:number,data:any):Observable<any>{
        return this.http.post<any>(this.transmittalUrl + "/" +idJob + "/preview", data)
    }
}