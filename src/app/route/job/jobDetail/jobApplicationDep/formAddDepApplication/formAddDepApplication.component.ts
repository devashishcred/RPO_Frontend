import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { JobApplication, Application, DepApplication } from '../../../../../types/jobApplication';
import { Message } from "../../../../../app.messages";
import { isIE } from '../../../../../utils/utils';
import { JobApplicationService } from '../../../../../services/JobApplicationService.services';
import { GetAppNoOnSelectRow } from '../../../../../app.constantValues';
import { constantValues,SharedService } from '../../../../../app.constantValues';
var moment = require('moment-business-days');


require('moment-weekday-calc');
declare const $: any

/**
* This component contains all function that are used in FormAddDepApplication
* @class FormAddDepApplication
*/
@Component({
    selector: '[form-add-dep-application]',
    templateUrl: './formAddDepApplication.component.html'
})

export class FormAddDepApplication {
    @Input() modalRef: BsModalRef
    @Input() onSave: Function
    @Input() idJob: number
    @Input() selectedJobType: number
    @Input() reload: Function
    @Input() idJobApp: number
    private HolidayList: any = []
    private project: any = []
    applicationType: any = []
    applicationStatus: any = []
    private selectUndefinedOptionValue: any
    errorMsg: any
    private app: any
    application: DepApplication
    private endDateIsChangeEvent: boolean = false
    private new: boolean = true
    loading: boolean = false
    private appNUmberRequired: boolean = false
    private hydrantCost: any
    private waterCost: any
    selectedAppTypeName: string;
    isAppDisabled: boolean = false;
    private oldVal: any
    /**
    * This method define all services that requires in whole class
    * @method constructor
    */
    constructor(
        private toastr: ToastrService,
        private message: Message,
        private jobApplicationService: JobApplicationService,
        private getAppNoOnSelectRow: GetAppNoOnSelectRow,
        private constantValues: constantValues,
    ) {
        this.errorMsg = this.message.msg
    }

    /**
    * This method will be called once only when module is call for first time
    * @method ngOnInit
    */
    ngOnInit() {
        this.application = {} as DepApplication
        this.application.isIncludeSunday = false
        this.application.isIncludeSaturday = false
        this.application.isIncludeHoliday = false
        this.loading = true
        this.applicationType = []
        this.jobApplicationService.getApplicationTypeDD(4).subscribe(r => {
            this.applicationType = r;
            this.getAppStatus();
        }, e => {
            this.loading = false
        })
        this.jobApplicationService.getHolidayList().subscribe(list => {
            if (list.length > 0) {
                this.HolidayList = list.map((unq: any) => {
                    return moment(unq.holidayDate).format("MM/DD/YYYY")
                })
                this.loading = false
            }
        }, e => {
            this.loading = false
        })
        this.jobApplicationService.getDepCostValues().subscribe(Cost => {
            this.hydrantCost = Cost.filter((val: any) => {
                return val.itemName == 'Hydrant Permit'
            })[0]
            this.waterCost = Cost.filter((val: any) => {
                return val.itemName == 'Hydrant Water Use'
            })[0]
            this.loading = false
        }, e => {
            this.loading = false
        })


    }

    /**
     * This method get selected application type name in lower case
     * @method getSelectedAppTypeName
     */
    getSelectedAppTypeName() {
        let selectedAppType = this.applicationType.filter((x: any) => x.id == this.application.idJobApplicationType);
        if (selectedAppType) {
            this.selectedAppTypeName = selectedAppType[0].itemName.toLowerCase();
        }
    }

    /**
     * This method check calcualted days are valid or not
     * @method ChecktheValidDays
     */
    ChecktheValidDays(changetype?: string) {

        $('#TotalHide').hide()
        const regex = /^((0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](12|13|14|15|16|17|18|19|20)[0-9]{2})*$/;
        if (typeof this.application.startDate != 'undefined' && this.application.startDate != null && this.application.startDate != '' && typeof this.application.totalDays != 'undefined' && this.application.totalDays != null && this.application.totalDays != '' && regex.test(this.application.startDate)) {
            this.getCalculationDep(changetype);
        } else {
            this.application.endDate = null
            this.application.waterCost = null
            this.application.hydrantCost = null
            this.application.totalCost = null
        }
    }


    /**
    * This method check given data is number or not
    * @method isNumber
    * @param {any} evt event object
    */
    isNumber(evt: any) {
        evt = (evt) ? evt : window.event;
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    /**
     * This method calculate Dep end date based on start date and number of days
     * @method getCalculationDep
     */
    getCalculationDep(changetype?: string) {
        let weekDays = [1, 2, 3, 4, 5]
        let excludeHolidays: any = []
        excludeHolidays = this.HolidayList
        if (this.application.isIncludeSaturday && !this.application.isIncludeSunday) {
            weekDays = [1, 2, 3, 4, 5, 6]
        } else if (!this.application.isIncludeSaturday && this.application.isIncludeSunday) {
            weekDays = [0, 1, 2, 3, 4, 5]
        } else if (this.application.isIncludeSaturday && this.application.isIncludeSunday) {
            weekDays = [0, 1, 2, 3, 4, 5, 6]
        } else {
            weekDays = [1, 2, 3, 4, 5]
        }
        const days = this.application.totalDays
        if (changetype == 'TotalDays' || changetype == 'StartDate' || changetype == 'Checkboxes') {

            if (!this.application.isIncludeHoliday) {
                let newstartdate = moment(this.application.startDate).add(-1, 'days').format("MM/DD/YYYY");
                let cal = moment(newstartdate).addWeekdaysFromSet({
                    'workdays': days,
                    'weekdays': weekDays,
                    'exclusions': excludeHolidays
                });
                this.application.endDate = moment(cal).format("MM/DD/YYYY")
                $('#endDates').val = moment(cal).format("MM/DD/YYYY")
            }
            if (this.application.isIncludeHoliday) {
                let newstartdate = moment(this.application.startDate).add(-1, 'days').format("MM/DD/YYYY");
                let cal = moment(newstartdate).addWeekdaysFromSet({
                    'workdays': days,
                    'weekdays': weekDays,
                    'exclusions': [],
                    'inclusions': excludeHolidays
                });
                this.application.endDate = moment(cal).format("MM/DD/YYYY")
                $('#endDates').val = moment(cal).format("MM/DD/YYYY")
            }

        }
        var startdate = moment(this.application.startDate);
        var enddate = moment(this.application.endDate);
        var finaldays = enddate.diff(startdate, 'days') + 1;
        let costFixed = Math.ceil(parseInt(finaldays) / this.hydrantCost.numberOfDays);
        this.application.hydrantCost = (costFixed * this.hydrantCost.price)
        this.application.waterCost = (this.application.totalDays * this.waterCost.price)
        this.application.totalCost = this.application.hydrantCost + this.application.waterCost
        $('#TotalHide').show()
    }

    checkEndDateValidDays(e?: any) {
        let weekDays = [1, 2, 3, 4, 5]
        let excludeHolidays: any = []
        let endDate: any
        endDate = this.application.endDate
        if (!this.application.isIncludeHoliday) {
            excludeHolidays = this.HolidayList
        }
        if (this.application.isIncludeSaturday && !this.application.isIncludeSunday) {
            weekDays = [1, 2, 3, 4, 5, 6]
        } else if (!this.application.isIncludeSaturday && this.application.isIncludeSunday) {
            weekDays = [1, 2, 3, 4, 5, 7]
        } else if (this.application.isIncludeSaturday && this.application.isIncludeSunday) {
            weekDays = [1, 2, 3, 4, 5, 6, 7]
        } else {
            weekDays = [1, 2, 3, 4, 5]
        }

        let remainDays: any

        if (!this.application.isIncludeHoliday) {
            remainDays = moment().isoWeekdayCalc({
                rangeStart: this.application.startDate,
                rangeEnd: this.application.endDate,
                weekdays: weekDays,
                exclusions: excludeHolidays
            })
        } else {
            remainDays = moment().isoWeekdayCalc({
                rangeStart: this.application.startDate,
                rangeEnd: this.application.endDate,
                weekdays: weekDays,
                inclusions: excludeHolidays
            })
        }
        if (!this.application.isIncludeSaturday && !this.application.isIncludeSunday && !this.application.isIncludeHoliday) {
            this.application.totalDays = remainDays
        } else {
            this.application.totalDays = remainDays
        }
        this.getCalculationDep('Enddate');
    }


    /**
     * This method get application status
     * @method getAppStatus
     */
    getAppStatus() {
        if (this.idJobApp && this.idJobApp > 0) {
            this.jobApplicationService.getApplicationById(this.idJobApp).subscribe(r => {
                this.application = r
                if (this.application.applicationFor) {
                    this.isAppDisabled = true;
                } else {
                    this.isAppDisabled = false;
                }
                this.getSelectedAppTypeName();
                if (this.application.applicationNumber != null) {
                    this.appNUmberRequired = true
                }
                if (this.application.floorWorking == null) {
                    this.application.floorWorking = ""
                }
                this.application.startDate != null ? this.application.startDate = moment(this.application.startDate).format(this.constantValues.DATEFORMAT) : '';
                this.application.endDate != null ? this.application.endDate = moment(this.application.endDate).format(this.constantValues.DATEFORMAT) : '';
                this.loading = false
            }, e => {
                this.loading = false
            })
        } else {
            this.loading = false
        }
        this.application.idJob = this.idJob
        this.jobApplicationService.getApplicationStatus().subscribe(r => {
            let status: any = []
            if (this.selectedJobType) {
                status = r.filter((x: any) => x.idJobApplicationType == this.selectedJobType)
            }
            this.applicationStatus = status
        }, e => {
            this.loading = false
        })
    }

    /**
     * This method save Dep Job Application
     * @method saveDepJobApplication
     */
    saveDepJobApplication() {
        this.loading = true
        let newApplication = false
        if (this.application.id && this.application.id > 0) {
            newApplication = false
        } else {
            newApplication = true
        }
        delete this.application.lastModifiedDate
        this.jobApplicationService.addEditApplication(this.application, newApplication).subscribe(r => {
            if (newApplication) {
                this.toastr.success('Application added successfully')
            } else {
                this.toastr.success('Application updated successfully')
            }
            this.modalRef.hide()
            this.reload()
        }, e => {
            this.loading = false
        })
    }
}
