import { Component, Injectable, Input, Output, EventEmitter } from '@angular/core';
import { Subject ,  Observable ,  BehaviorSubject } from 'rxjs';

import { Job } from '../../types/job';


/**
* Job Shared Service contains all services that are used as share in other components
* @class JobSharedService
*/

@Injectable()
export class JobSharedService {
    sharingJobObject: Observable<Job>
    sharingJobAppType: Observable<any>
    sharingApplicationRecord: Observable<any>

    public isUserLoggedIn: BehaviorSubject<Boolean>;
    public reloadJobContact: BehaviorSubject<Boolean>;
    public _sharingJobObject: BehaviorSubject<Job>;
    private _sharingJobAppType: BehaviorSubject<any>;
    private _sharingApplicationRecord: BehaviorSubject<any>;

    private dataStore: {
        sharingJobObject: Job,
        sharingJobAppType: any,
        sharingApplicationRecord: any
    };

    constructor() {
        this.dataStore = { sharingJobObject: null, sharingJobAppType: null, sharingApplicationRecord: null };
        this._sharingJobObject = <BehaviorSubject<any>>new BehaviorSubject(null);
        this._sharingJobAppType = <BehaviorSubject<any>>new BehaviorSubject(null);
        this._sharingApplicationRecord = <BehaviorSubject<any>>new BehaviorSubject(null);
        this.isUserLoggedIn = <BehaviorSubject<boolean>>new BehaviorSubject<boolean>(false);
        this.reloadJobContact = <BehaviorSubject<any>>new BehaviorSubject<any>(false);
    }


    @Output() change: EventEmitter<boolean> = new EventEmitter();

    toggleClient() {
      this.change.emit(true);
    }
  
    /**
    * This method is used to set data of job object
    * @method setJobData
    * @param {any} jobData job object
    */
    getJobHistory() {
          
    }
    /**
    * This method is used to set data of job object
    * @method setJobData
    * @param {any} jobData job object
    */
    setJobData(jobData: any) {
        console.log('setJobData',jobData)
        this._sharingJobObject.next(jobData);
    }

    /**
     * This method is used to get data of job object
     * @method getJobData
     */
    getJobData() {
        return this._sharingJobObject.asObservable();
    }

    /**
      * This method is used to set selected application type
      * @method setJobAppType
      * @param {any} jobData job object
      */
    setJobAppType(appType: any) {
        this._sharingJobAppType = <BehaviorSubject<any>>new BehaviorSubject(null);
        this._sharingJobAppType.next(appType);
    }

    /**
     * This method is used to get selected application type
     * @method getJobAppType
     */
    getJobAppType() {
        return this._sharingJobAppType.asObservable();
    }


    /**
     * This method is used to set selected application type
     * @method setSelectedApplication
     * @param {any} rec selected application row data
     */
    setSelectedApplication(rec: any) {
        this._sharingApplicationRecord = <BehaviorSubject<any>>new BehaviorSubject(null);
        this._sharingApplicationRecord.next(rec);
    }

    /**
     * This method is used to get selected row of specific application
     * @method getSelectedApplication
     */
    getSelectedApplication() {
        return this._sharingApplicationRecord.asObservable();
    }
}