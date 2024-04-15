import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, OnDestroy, AfterViewInit, SimpleChanges } from '@angular/core';
import { BasicInfoHeaderComponent } from './basicInfoheader/basicInfoHeader.component';
import { BasicInfoComponent } from './basicInfo/basicInfo.component';

import { LocalStorageService } from '../../../services/local-storage.service';

import { Router, ActivatedRoute, NavigationEnd, NavigationStart } from '@angular/router';
import { JobServices } from '../job.services';
import { UserRightServices } from '../../../services/userRight.services';
import { constantValues } from '../../../app.constantValues';
import { SharedService } from '../../../app.constantValues';
import { AppComponent } from '../../../app.component';

import { JobSharedService } from '../JobSharedService';

@Component({
    selector: 'job-detail',
    templateUrl: './jobDetail.component.html',
})

/**
* This component contains all function that are used in Job Detail 
* @class JobDetailComponent
*/
export class JobDetailComponent implements OnInit {
    public jobDetail: any = []
    public jobRecord: any
    selectedJobType: any
    private btnShowHide: string
    currentRoute: string
    private sub: any
    private jobId: number
    public statusData: any = {}
    message: any

    private userAccessRight: any = {}
    private table: any

    private showViolation: string = 'hide'
    private showApplication: string = 'show'
    private showDot: string = 'hide'
    private requiredField: number
    loading: boolean = false
    dobApp: boolean = false
    depApp: boolean = false
    dotApp: boolean = false
    isViolation: boolean = false
    private serviceSubscription: any;
    private serviceSubscriptionAppType: any;
    isCustomerLoggedIn: boolean = false;
    public isCustomerHavePermissionOfViolation = false;
    public isCustomerHavePermissionOfContacts = true;
    public isCustomerHavePermissionOfChecklist = true;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private userRight: UserRightServices,
        private constantValues: constantValues,
        private jobServices: JobServices,
        private jobSharedService: JobSharedService,
        private appComponent: AppComponent,
        private sharedService: SharedService,
        private localStorageService: LocalStorageService
    ) {

        this.sub = this.route.params.subscribe(params => {
            this.jobId = +params['id'];
        });

        this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
        console.log('this.isCustomerLoggedIn', this.isCustomerLoggedIn)
        if ((this.isCustomerLoggedIn && userRight.checkAllowButton(constantValues.VIEWCONTACT) == 'hide')) {
            this.isCustomerHavePermissionOfContacts = false;
        }
        if (this.isCustomerLoggedIn && (userRight.checkAllowButton(constantValues.VIEWECBVIOLATION) == 'show' || userRight.checkAllowButton(constantValues.VIEWDOBVIOLATION)== 'show' || userRight.checkAllowButton(constantValues.VIEWDOBSAFETYVIOLATION)== 'show')) {
            this.isCustomerHavePermissionOfViolation = true;
        }
        if (this.isCustomerLoggedIn && userRight.checkAllowButton(constantValues.VIEWCHECKLIST) == 'hide') {
            this.isCustomerHavePermissionOfChecklist = false;
        }
        if (localStorage.getItem('isFromTask') != null) {
            if (sessionStorage.getItem('jobObject')) {
                sessionStorage.removeItem('jobObject');
            }
            this.appComponent.setCommonJobObject(this.jobId);
            localStorage.removeItem('isFromTask')
        }
        // From Violation Report Redirect to direct violation tab
        if (localStorage.getItem('isFromViolationReport') != null) {
            this.appComponent.setCommonJobObject(this.jobId, 12)
            localStorage.removeItem('isFromViolationReport')
        }

        // enable current tab
        this.router.events.subscribe((event: any) => {
            if (event instanceof NavigationEnd) {
                this.currentRoute = this.router.url.substr(this.router.url.lastIndexOf('/') + 1)
                if (this.currentRoute.includes('application')) {
                    this.dobApp = true;
                }
                if (this.currentRoute.includes('dep')) {
                    this.depApp = true;
                }
                if (this.currentRoute.includes('dot')) {
                    this.dotApp = true;
                }
                if (this.currentRoute.includes('violation')) {
                    this.isViolation = true;
                }
            }
        })

        //getting data from shared service of job object
        this.getJobOjectFromService();
    }



    /**
    * This method will be called once only when module is call for first time
    * @method ngOnInit
    */
    ngOnInit() {
        if (window.event) {

        }
        else {
            this.jobDetail = null;
            this.jobRecord = null;
        }
        if (this.jobDetail == null || this.jobRecord == null) {
            this.setJobObjectToServiceOnRefresh();
        }
        else if (this.jobDetail) {
            this.setJobDetails();
        }
        else if (this.sharedService.getJobEdit.subscribe((r: any) => {
            this.jobDetail = r;
            this.jobSharedService.setJobData(r);
            this.getJobOjectFromService();
        }))
            this.requiredField = 1;
    }

    /**
    * This method is used to set shared service when page gets refresh or jobdetail and jobrecord is getting null
    * @method setJobObjectToServiceOnRefresh
    * @param {number} jobId jobId is the job number
    */
    setJobObjectToServiceOnRefresh() {
        this.jobServices.getJobDetailById(this.jobId, true).subscribe(r => {
            this.jobDetail = r;
            this.jobRecord = r;
            this.jobSharedService.setJobData(r);
            this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, r)
            this.appComponent.saveInSessionStorage(this.constantValues.JOBID, r.id)
            if (!localStorage.getItem('selectedJobType')) {
                this.setApplicationJobType(r)
            }
            this.getStatus(r)
            this.loading = false
        }, e => {
            this.loading = false
        })
    }

    setJobDetails() {
        // if (this.isCustomerLoggedIn) {
        //     this.jobServices.getCustomerJobDetailById(this.jobId).subscribe(r => {
        //         this.jobDetail = r;
        //         this.jobRecord = r;
        //         this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, r)
        //         this.appComponent.saveInSessionStorage(this.constantValues.JOBID, r.id)
        //         this.getStatus(r)
        //         this.jobSharedService.setJobData(r);
        //         this.sharedService.getJob.emit('update')
        //         this.loading = false
        //     }, e => {
        //         this.loading = false
        //     })
        // } else {
        //     this.jobServices.getJobDetailById(this.jobId, true).subscribe(r => {
        //         this.jobDetail = r;
        //         this.jobRecord = r;
        //         this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, r)
        //         this.appComponent.saveInSessionStorage(this.constantValues.JOBID, r.id)
        //         this.getStatus(r)
        //         this.jobSharedService.setJobData(r);
        //         this.sharedService.getJob.emit('update')
        //         this.loading = false
        //     }, e => {
        //         this.loading = false
        //     })
        // }
    }

    /**
    * This method is used to set job application type
    * @method setApplicationJobType
    * @param {any} r r is an object of application type
    */
    setApplicationJobType(r: any) {
        let appType = r.jobApplicationType.split(',');
        if (appType && appType.length > 0) {
            let selectedJobType = this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE)
            if (selectedJobType) {
                this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, selectedJobType);
            } else {
                this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, appType[0]);
                let keepGoing = true;
                appType.forEach((idJobAppType: any) => {
                    if (keepGoing) {
                        this.jobSharedService.setJobAppType(idJobAppType);
                        keepGoing = false
                    }
                })
                if (!keepGoing) {
                    this.serviceSubscriptionAppType = this.jobSharedService.getJobAppType().subscribe(_sharingJobAppType => {
                        this.selectedJobType = _sharingJobAppType
                        console.log('this.selectedJobType', this.selectedJobType)
                    });
                }
            }
           
        } else if (appType.length == 1) {
            this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, appType[0]);
        }
    }

    /**
     * This method is used to get data from shared service 
     * @method getJobOjectFromService
     */
    getJobOjectFromService() {
        if (this.jobDetail == null || this.jobRecord == null) {
            if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
                this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
                this.jobRecord = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT);
                this.serviceSubscriptionAppType = this.jobSharedService.getJobAppType().subscribe(_sharingJobAppType => {
                    this.selectedJobType = _sharingJobAppType
                });
                if (this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE)) {
                    this.selectedJobType = this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE)
                    this.jobSharedService.setJobAppType(this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE));
                }
            } else {
                // if we are getting jobobject or jobrecord as null than we will be setting shared service
                this.setJobObjectToServiceOnRefresh();
            }
        } else {
            this.serviceSubscription = this.jobSharedService.getJobData().subscribe(_sharingJobObject => {
                console.log('subscribe run')
                this.jobDetail = _sharingJobObject;
                this.jobRecord = _sharingJobObject;
                this.serviceSubscriptionAppType = this.jobSharedService.getJobAppType().subscribe(_sharingJobAppType => {
                    this.selectedJobType = _sharingJobAppType
                });
                if (this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE)) {
                    this.selectedJobType = this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE)
                    this.jobSharedService.setJobAppType(this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE));
                }
            });
        }


    }

    /**
     * This method is used to get status of job and set labels accordingly
     * @method getStatus
     * @param {any} r r is used as an array of status and displayaccordingly
     */
    getStatus(r: any) {
        this.serviceSubscription = this.jobSharedService.getJobData().subscribe(_sharingJobObject => {
            r = _sharingJobObject;
        })
        this.statusData = {}

        if (r == null) {
            r = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
        }

        if (r) {
            if (r.status == 1) {
                this.statusData = {
                    jobStatus: 'In-Progress',
                    job_on_hold: 'show',
                    job_in_progress: 'hide',
                    job_re_open: 'hide',
                    job_completed: 'show',
                    statusColor: 'status1'
                }
            } else if (r.status == 2) {
                this.statusData = {
                    jobStatus: 'On Hold',
                    job_on_hold: 'hide',
                    job_in_progress: 'show',
                    job_re_open: 'hide',
                    job_completed: 'show',
                    statusColor: 'status2'
                }
            } else if (r.status == 3) {
                this.statusData = {
                    jobStatus: 'Completed',
                    job_on_hold: 'hide',
                    job_in_progress: 'show',
                    job_re_open: 'show',
                    job_completed: 'hide',
                    statusColor: 'status3'
                }
            }
        }
    }

    /**
    * This method is used when application type is changed
    * @method onSelectionChange
    * @param {any} jobType jobType which type of application is getting to be selected
    * @param {number} id id of tje job
    */
    onSelectionChange(jobType: any, id: number) {
        this.jobSharedService.setJobAppType(jobType.id);
        /**
         * when move from dot to dob or vica versa set application to null
         */
        this.jobSharedService.setSelectedApplication(null);

        if (jobType.id == 3) {
            this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, jobType.id)
            this.appComponent.saveInSessionStorage(this.constantValues.JOBID, this.jobId)

            this.showViolation = 'show'
            this.showApplication = 'hide'
            this.showDot = 'hide'
            this.router.navigate(['./job/' + this.jobId + '/violation'])
        } else if (jobType.id == 2) {
            this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, jobType.id)
            this.appComponent.saveInSessionStorage(this.constantValues.JOBID, this.jobId)
            this.showViolation = 'hide'
            this.showApplication = 'hide'
            this.showDot = 'show'
            this.router.navigate(['./job/' + this.jobId + '/dot', { idJobAppType: jobType.id }])
        } else {
            this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, jobType.id)
            this.appComponent.saveInSessionStorage(this.constantValues.JOBID, this.jobId)
            this.showViolation = 'hide'
            this.showApplication = 'show'
            this.showDot = 'hide'
            if (jobType.id == 1) {
                this.router.navigate(['./job/' + this.jobId + '/application', { idJobAppType: jobType.id }])
            } else {
                this.router.navigate(['./job/' + this.jobId + '/dep', { idJobAppType: jobType.id }])
            }
        }
        this.serviceSubscriptionAppType = this.jobSharedService.getJobAppType().subscribe(_sharingJobAppType => {
            this.selectedJobType = _sharingJobAppType
        });


    }

    onSelectTab(type) {
        if (type === 'dot') {
            this.router.navigate(['./job/' + this.jobId + '/dot', { idJobAppType: 2 }])
        } else if (type === 'dob') {
            this.router.navigate(['./job/' + this.jobId + '/application', { idJobAppType: 1 }])
        } else if (type === 'dep') {
            this.router.navigate(['./job/' + this.jobId + '/dep', { idJobAppType: 4 }])
        }
    }

}