import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../../../app.constants';

import { Job } from '../../../../types/job';
import { JobContact } from '../../../../types/jobContact'
import { TimeNote } from '../../../../types/timeNote';
declare var $: any;

/**
* TimeNotesServices contains all services related to Time Notes
* @class TimeNotesServices
*/
@Injectable()
export class TimeNotesServices {
    constructor(private http: HttpClient) { }

    private TimeNoteUrl = API_URL + 'api/JobTimeNotes';
    private TimeNoteCatUrl = API_URL + 'api/jobtimenotecategories/dropdown';

    /**
    * Get all records from database in datatable format
    * @method get
    * @param {any} cfg it is a string type which is used for filter data from data table
    */
    get(cfg: any = {}): any[] {
        return $.fn.dataTable.pipeline($.extend(true, {
            url: this.TimeNoteUrl
        }, cfg));
    }

    /**
    * This method is used to get all time note categories
    * @method getAlltimeNoteCat
    */
    getAlltimeNoteCat(): Observable<any[]> {
        return this.http.get<any[]>(this.TimeNoteCatUrl)
    }

    /**
    * This method is used to create a new record in database
    * @method addJobTimeNote
    * @param {any} data type request Object
    */
    addJobTimeNote(data: any): Observable<any> {
        const d = cloneDeep(data)
        return this.http.post<any>(this.TimeNoteUrl, d)
    }

    /**
    * This method is used to update a existing record in database
    * @method updateJobTimeNote
    * @param {any} data type request Object
    */
   
    updateJobTimeNote(data: any, tid: any): Observable<any> {
        const d = cloneDeep(data)
        return this.http.put<any>(`${this.TimeNoteUrl}/${tid}`, d)
    }

    /**
    * This method is used to get scope services that are related to job
    * @method getScopeServices
    * @param {number} idJob idJob of Job for getting specific record
    */
    getScopeServices(idJob: number, edit?: any): Observable<any[]> {
        let url = ''
        if (edit) {
            url = API_URL + 'api/jobfeeschedules/' + idJob + '/hourlydropdownEdit'
        } else {
            url = API_URL + 'api/jobfeeschedules/' + idJob + '/hourlydropdown'
        }

        return this.http.get<any[]>(url)
    }

    /**
    * Get all dropdown data from Master Fee Schedule
    * @method getMasterFeeSchedule
    */
    getMasterFeeSchedule(): Observable<any[]> {
        return this.http.get<any[]>(API_URL + 'api/rfpserviceitems/hourlydropdown')
    }
    getEditMasterFeeSchedule(itemId: number): Observable<any[]> {
        return this.http.get<any[]>(API_URL + 'api/rfpserviceitems/' + itemId + '/hourlydropdown')
    }

    /**
    *  Get single record from database
    * @method getById
    * @param {number} idTimeNote idTimeNote of time note for getting specific record
    */
    getById(idTimeNote: number): Observable<TimeNote> {
        return this.http.get<TimeNote>(this.TimeNoteUrl + '/' + idTimeNote);
    }
}