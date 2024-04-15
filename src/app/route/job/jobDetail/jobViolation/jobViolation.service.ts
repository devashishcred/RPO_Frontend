import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../../../app.constants';

import { Job } from '../../../../types/job';
import { LocalStorageService } from '../../../../services/local-storage.service';

declare var $: any;

/**
* JobViolationServices contains all services related to Job Violation
* @class JobViolationServices 
*/
@Injectable()
export class JobViolationServices {
    private jobViolationUrl = API_URL + 'api/jobviolations';

    private jobDobViolationUrl = API_URL + 'api/JobDOBViolations';
    
    private jobDobSafetyViolationUrl = API_URL + 'api/JobSafetyViolations';

    private penaltyCodeUel = API_URL + 'api/ViolationPaneltyCodes';

    private violationProgressionNoteUrl = API_URL + 'api/JobViolationNotes';

    private dobPartOfJobs = API_URL + 'api/Projects/';

    private clientNotesUrl = API_URL + 'api/checklist/PostClientNote';
    isCustomerLoggedIn: boolean = false;

    constructor(private http: HttpClient,
        private localStorageService: LocalStorageService
    ) {
        this.isCustomerLoggedIn = this.localStorageService.getCustomerLoggedIn();
    }




    /**
    *  Get all records from database in datatable format
    * @method getRecords
    * @param {any} cfg it is a string type which is used for filter data from data table
    */
    getRecords(url, cfg: any = {}): any[] {
        return $.fn.dataTable.pipeline($.extend(true, {
            url: API_URL + url
        }, cfg));
    }

    /**
    * Get single record from database
    * @method getById
    * @param {number} id id of voilation for getting specific record
    */
    getById(id: number): Observable<any> {
        return this.http.get<any>(this.jobViolationUrl + "/" + id)
    }

    /**
    * Get single record from database
    * @method getById
    * @param {number} id id of voilation for getting specific record
    */
    getEcbBySummonsNumber(id: number): Observable<any> {
        return this.http.get<any>(API_URL + "api/JobViolations/GetJobViolationBySummons/" + id)
    }

    /**
    * This method is used to delete records from database
    * @method delete
    * @param {number} id  of voilation to delete 
    */
    delete(id: number): Observable<any> {
        return this.http.delete<any>(this.jobViolationUrl + "/" + id)
    }

    /**
    * This method is used to delete records from database
    * @method delete
    * @param {number} id  of voilation to delete 
    */
    deleteDob(id: number): Observable<any> {
        return this.http.delete<any>(this.jobDobViolationUrl + "/" + id)
    }

    /**
    * This method is used to delete records from database
    * @method delete
    * @param {number} id  of voilation to delete 
    */
    deleteDobSafety(id: number): Observable<any> {
        return this.http.delete<any>(this.jobDobSafetyViolationUrl + "/" + id)
    }

    /**
    * Get single record from database
    * @method getOATH
    * @param {string} id id is summons number to get details from OATH
    */
    getOATH(id: string): Observable<any> {
        return this.http.get<any>(this.jobViolationUrl + "/OATH?summonsNoticeNumber=" + id)
    }

    /**
    * Get single record from database
    * @method getOATH
    * @param {string} id id is summons number to get details from OATH
    */
    getDobVioationById(id: any): Observable<any> {
        return this.http.get<any>(this.jobDobViolationUrl + '/' + id)
    }

    /**
    * Get single record from database
    * @method getDobSafetyVioationById
    * @param {string} id id is summons number to get details from OATH
    */
    getDobSafetyVioationById(id: any): Observable<any> {
        return this.http.get<any>(this.jobDobSafetyViolationUrl + '/' + id)
    }

    /**
    * This method is used to update existing record in database
    * @method updateViolation
    * @param  {any} data type request Object
    * @param {number} id id of {{name}} for updating specific record
    */
    updateViolation(id: number, data: any): Observable<any> {
        return this.http.put<any>(this.jobViolationUrl + '/' + id, data)
    }

    /**
    * This method is used to create a new record in database
    * @method createViolation
    * @param {any} data type request Object
    */
    createViolation(data: any): Observable<any> {
        return this.http.post<any>(this.jobViolationUrl, data)
    }

    /**
    * This method is used to create a new record in database
    * @method createDobViolation
    * @param {any} data type request Object
    */
    createDobViolation(data: any): Observable<any> {
        return this.http.post<any>(this.jobDobViolationUrl, data)
    }

    /**
    * This method is used to create a new record in database
    * @method createDobSafetyViolation
    * @param {any} data type request Object
    */
    createDobSafetyViolation(data: any): Observable<any> {
        return this.http.post<any>(this.jobDobSafetyViolationUrl, data)
    }

    /**
   * This method is used to update existing record in database
   * @method updateViolation
   * @param  {any} data type request Object
   * @param {number} id id of {{name}} for updating specific record
   */
    updateDobViolation(id: number, data: any): Observable<any> {
        return this.http.put<any>(this.jobDobViolationUrl + '/' + id, data)
    }

    /**
   * This method is used to update existing record in database
   * @method updateDobSafetyViolation
   * @param  {any} data type request Object
   * @param {number} id id of {{name}} for updating specific record
   */
    updateDobSafetyViolation(id: number, data: any): Observable<any> {
        return this.http.put<any>(this.jobDobSafetyViolationUrl + '/' + id, data)
    }

    /**
    * This method is used to save documents in database
    * @method saveDocuments
    * @param {data} type request Object of file
    */
    saveDocuments(data: any): Observable<any> {
        return this.http.put<any>(API_URL + 'api/JobViolationDocuments/document', data);
    }

    /**
    * Get all dropdown data from penalty code master
    * @method getPenaltyCode
    */
    getPenaltyCode(): Observable<any> {
        return this.http.get<any>(this.penaltyCodeUel + "/dropdown")
    }

    /**
    * This method is used to change status of violation
    * @method setStatus
    * @param {number} id id of violation for getting specific record
    * @param {string} status status of violation to be updated
    */
    setStatus(id: number, status: string): Observable<any> {
        let req: any = {
            id: id,
            statusOfSummonsNotice: status
        }
        return this.http.put<any>(this.jobViolationUrl + '/status', req);
    }

    /**
    * This method is used to change Hearing date of violation
    * @method setHearingDate
    * @param {number} id id of violation for getting specific record
    * @param {any} data data contains hearing date of violation to be updated
    */
    setHearingDate(id: number, data: any): Observable<any> {
        let req: any = {
            id: id,
            hearingDate: data
        }
        return this.http.put<any>(this.jobViolationUrl + '/hearingDate', req);
    }

    /**
    * This method is used to change Resolve date of violation
    * @method setResolveDate
    * @param {number} id id of violation for getting specific record
    * @param {any} data data contains resolve date of violation to be updated
    */
    setResolveDate(id: number, data: any): Observable<any> {
        let req: any = {
            id: id,
            resolveDate: data
        }
        return this.http.put<any>(this.jobViolationUrl + '/resolveDate', req);
    }

    /**
    * This method is used to change Resolve date of violation
    * @method setFullyResolved
    * @param {number} id id of violation for getting specific record
    * @param {any} data data contains resolve date of violation to be updated
    */
    setFullyResolved(id: number, data: any): Observable<any> {
        let req: any = {
            id: id,
            isFullyResolved: data,
        }
        return this.http.put<any>(this.jobViolationUrl + '/fullyResolved', req);
    }

    /**
    * This method is used to get progression note for specific task
    * @method getViolationProgressionNotes
    * @param {number} idViolation violation id which is used to get progression note for specific task
    */
    getViolationProgressionNotes(idViolation: number): Observable<any> {
        return this.http.get<any>(this.violationProgressionNoteUrl + "?dataTableParameters.idJobViolation=" + idViolation)
    }


    /**
     * This method is used to create a new progression note record in database
     * @method createViolationProgressionNote
     * @param {any} data type request Object
     */
    createViolationProgressionNote(data: any): Observable<any> {
        const d = cloneDeep(data)
        return this.http.post<any>(this.violationProgressionNoteUrl, d)
    }

    /**
    * This method is used to get progression note for specific task
    * @method getDobPartOfProjects
    * @param {number} idViolation violation id which is used to get progression note for specific task
    */
    getDobPartOfProjects(idViolation: number): Observable<any> {
        if (this.isCustomerLoggedIn) {
            return this.http.get<any>(this.dobPartOfJobs + idViolation + '/PartofProjectsForCustomer')
        } else {
            return this.http.get<any>(this.dobPartOfJobs + idViolation + '/PartofProjects')
        }
    }

    runCronJob(type: string, binNumber: any) {
        let apiUrl = API_URL
        if (type == 'ECB') {
            apiUrl = apiUrl + 'api/ViolationJobs/GetECBCronJob/' + binNumber
        } else if (type == 'DOB') {
            apiUrl = apiUrl + 'api/ViolationJobs/GetDOBCronJob/' + binNumber
        } else if (type == 'DOB Safety') {
            apiUrl = apiUrl + 'api/ViolationJobs/GetDOBSafetyCronJob/' + binNumber
        }
        // apiUrl = type == 'ECB' ? apiUrl + 'api/ViolationJobs/GetECBCronJob/' + binNumber : apiUrl + 'api/ViolationJobs/GetDOBCronJob/' + binNumber;
        return this.http.get(apiUrl).toPromise()
    }

    addClientNotes(data: any, isPl: boolean): Observable<any> {
        const d = cloneDeep(data)
        let url = this.clientNotesUrl
        if (isPl) {
            url = API_URL + 'api/checklist/PostPLInspectionClientNote';
        }
        return this.http.post<any>(url, d)
    }
    getClientNotes(itemId, isPl: boolean): Observable<any> {
        let url: string = API_URL + `api/Checklist/${itemId}/ChecklistClientNoteHistory`
        if (isPl) {
            url = API_URL + `api/Checklist/GetPLClientNoteHistory/${itemId}`
        }
        return this.http.get<any>(url)
    }



}