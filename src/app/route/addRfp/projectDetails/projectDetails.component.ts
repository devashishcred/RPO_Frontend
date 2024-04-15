import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, IterableDiffers } from '@angular/core';
import { cloneDeep } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription ,  Observable } from 'rxjs';
import { Router } from '@angular/router';

import { AppComponent } from '../../../app.component';
import { JobTypesServices } from '../../../services/jobTypes.services';
import { ProjectDetails } from '../../../types/projectDetails';
import { JobTypes } from '../../../types/jobTypes';
import { JobSubType } from '../../../types/jobTypes';
import { WorkType } from '../../../types/jobTypes';
import { ProjectDetailsServices } from './projectDetails.services';
import { ActivatedRoute } from '@angular/router';
import { Message } from "../../../app.messages";
import { ElementRef, Renderer2 } from '@angular/core';
import * as _ from 'underscore';
import { WorkTypeNotes } from '../../../types/projectDetails';
import { ComponentCanDeactivate } from '../../../components/appSaveLeave/guard';
import { HostListener } from '@angular/core';
import { RfpListService } from '../../rfp/rfp.services';
import { UserRightServices } from '../../../services/userRight.services';
import { constantValues } from '../../../app.constantValues';
import * as moment from 'moment';

declare const $: any
/**
  * projectDetailsComponent class contains all function that are used in RFP step 2 project detail 
  * @class projectDetailsComponent
  */
@Component({
    templateUrl: './projectDetails.component.html',
    styleUrls: ['./projectDetails.component.scss']
})
export class projectDetailsComponent implements ComponentCanDeactivate {
    /**
    * It will open popup to add RFP progression
    * @property rfpprogressionnote
    */
    @ViewChild('rfpprogressionnote',{static: true})
    private rfpprogressionnote: TemplateRef<any>

    @ViewChild('projectDetailForm',{static: true}) form: any;
    modalRef: BsModalRef
    jobTypes: JobTypes[] = []
    private subTypes: JobSubType[] = []
    private workTypes: WorkType[] = []
    project: any
    private projectDetails: ProjectDetails[]
    detailArr: any;
    private resultArr: any;
    private tmpWorkTypes: any[];
    private tmpSubType: number;
    private sub: any;
    private subTypeDesc: string
    private tmpIdJobType: number
    selectJobType: boolean
    errorMsg: any
    private WorkTypeNotes: WorkTypeNotes
    loading: boolean = false
    private hideme: any
    private idRfp: number;
    private Options: any = []
    private item: any;
    rfpNumber: string
    private savedProjectDetailId: number
    private idJobType: number
    private showNavigationTabs: boolean = true
    private parentNotFoundInCategories: boolean = true;
    private noPRDetails: boolean = false;
    showStep1: string = ''
    private showStep2: string = ''
    showStep3: string = ''
    showStep4: string = ''
    showStep5: string = ''
    private isExist: boolean = false
    private differ: IterableDiffers
    private formNotChanged = true
    private subTypeCategories: any
    private jobSubTypes: any
    private serviceWorkTypes: any
    private workTypeCategories: any
    rfpDetail: any = {}
    createdBy: string
    private selectedJobId: number;
    modifiedBy: string
    showRfpAddBtn: string = 'hide'
    private showRfpViewBtn: string = 'hide'
    private showRfpDeleteBtn: string = 'hide'
    // @HostListener allows us to also guard against browser refresh, close, etc.
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return this.formNotChanged
    }

    /**
     * This method define all services that requires in whole class
     * @method constructor
     */
    constructor(
        private router: Router,
        private toastr: ToastrService,
        private jobTypeServices: JobTypesServices,
        private ProjectDetailsServices: ProjectDetailsServices,
        private route: ActivatedRoute,
        private message: Message,
        private rd: Renderer2,
        private differs: IterableDiffers,
        private rfpListService: RfpListService,
        private modalService: BsModalService,
        private userRight: UserRightServices,
        private constantValues: constantValues,

    ) {
        this.errorMsg = this.message.msg
        this.differ = differs
    }

    /**
    * This method will check any element in form changed or not
    * @method isFieldValChange
    * @params label of parent Group, serviceItem which id checked, boolean value of check box, Array of Services
    */
    isFieldValChange(label?: string, serviceItem?: any, check?: boolean, serviceArray?: any, selectedItems?: any, index?: any) {
        let x = []
        if (label == 'Services') {
            this.checkInIndividualServices(label, serviceItem, check, serviceArray, selectedItems)
        } else if (this.detailArr[index].workTypeCategories.length > 0 && (serviceItem.partOf && check)) {
            let Categories = this.detailArr[index].workTypeCategories;
            Categories.forEach((category: any) => {
                x = category.workTypes.filter((item: any) => item.id == serviceItem.partOf);
                if (x.length > 0) {
                    this.parentNotFoundInCategories = false;
                    x[0].checked = true;
                    x[0].disabled = true;
                }
                if (x.length == 0 && this.parentNotFoundInCategories) {
                    this.checkInIndividualServices(label, serviceItem, check, serviceArray, selectedItems)
                }

            })



        } else if (this.detailArr[index].workTypeCategories.length > 0 && (serviceItem.partOf && !check)) {
            let Categories = this.detailArr[index].workTypeCategories;
            Categories.forEach((category: any) => {
                let x = category.workTypes.filter((item: any) => item.checked == true);
                if (x.length > 1) {

                } else if (x.length == 1) {
                    this.parentNotFoundInCategories = false;
                    x[0].checked = false;
                    x[0].disabled = false;
                } else if (x.length == 0 && this.parentNotFoundInCategories) {
                    this.checkInIndividualServices(label, serviceItem, check, serviceArray, selectedItems)
                }
            })

        } else if (this.detailArr[index].workTypeCategories.length == 0) {
            this.checkInIndividualServices(label, serviceItem, check, serviceArray, selectedItems)
        }

        //if (this.form.dirty) {
        this.formNotChanged = false
        // }
    }
    /**
    * This method will check any element in form changed or not
    * @method checkInIndividualServices
    * @params label of parent Group, serviceItem which id checked, boolean value of check box, Array of Services
    */

    checkInIndividualServices(label?: string, serviceItem?: any, check?: boolean, serviceArray?: any, selectedItems?: any) {
        if (label == 'Services') {
            if (serviceItem.partOf && check) {

                let parent = selectedItems.filter((x: any) =>
                    x.id == serviceItem.partOf
                )
                if (parent.length > 0) {
                    this.parentNotFoundInCategories = true;
                    parent[0].checked = true;
                    parent[0].disabled = true;
                }
            }
            if (serviceItem.partOf && !check) {
                let parent = selectedItems.filter((x: any) =>
                    x.checked == true
                )
                if (parent.length > 1) {

                } else if (parent.length == 1) {
                    this.parentNotFoundInCategories = true;
                    parent[0].checked = false;
                    parent[0].disabled = false;
                }
            }
        }
    }

    /**
    * This method will call when step 1 form loads first time
    * @method ngOnInit
    */
    ngOnInit() {
        document.title = 'RFP'
        this.loading = true;
        this.showRfpAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDRFP)
        this.showRfpViewBtn = this.userRight.checkAllowButton(this.constantValues.VIEWRFP)
        this.showRfpDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETERFP)
        this.detailArr = [];
        this.resultArr = [];
        this.tmpWorkTypes = [];
        this.project = []
        this.getJobTypes();
        this.sub = this.route.params.subscribe(params => {
            this.idRfp = +params['id']; // (+) converts string 'id' to a number
            //get Rfp Number
            this.getRfpDetail();
            this.isExist = false;
        });
    }

    /**
    * This method check Save the data and process to preffered step
    * @method saveOnHeader
    * @param{stepNo} Step Name of RFP
    */
    saveOnHeader(stepNo: string) {
        this.saveProjectDetail(false, stepNo)
    }

    /**
    * This method get rfp detail
    * @method getRfpDetail
    */
    private getRfpDetail() {
        this.ProjectDetailsServices.chkProjectdetail(this.idRfp).subscribe(r => {
            this.rfpNumber = r.rfpNumber;
            document.title = 'RFP# ' + this.rfpNumber;
            this.getHeaderStatus(r);
            this.setRfpProjectDetail();
            this.getRFPCreatorDetail(r);
        })
    }

    /**
    * This method get RFP creator detail
    * @method getRFPCreatorDetail
    * @param {object} rfpDetail request Object
    */
    private getRFPCreatorDetail(rfpDetail: any) {
        // get Whole RFP detail
        this.rfpDetail = rfpDetail;
        // for created by
        if (this.rfpDetail.createdByEmployee) {
            this.createdBy = this.rfpDetail.createdByEmployee;
        }
        if (this.rfpDetail.createdDate) {
            if (this.createdBy) {
                this.createdBy += " on " + moment(this.rfpDetail.createdDate).format('MM/DD/YYYY hh:mm A');
            } else {
                this.createdBy = moment(this.rfpDetail.createdDate).format('MM/DD/YYYY hh:mm A');
            }
        }

        // for modified by
        if (this.rfpDetail.lastModifiedByEmployee) {
            this.modifiedBy = this.rfpDetail.lastModifiedByEmployee;
        }
        if (this.rfpDetail.lastModifiedDate) {
            if (this.createdBy) {
                this.modifiedBy += " on " + moment(this.rfpDetail.lastModifiedDate).format('MM/DD/YYYY hh:mm A');
            } else {
                this.modifiedBy = moment(this.rfpDetail.lastModifiedDate).format('MM/DD/YYYY hh:mm A');
            }
        }
        setTimeout(() => {
            this.loading = false;
        }, 6000);
    }

    /**
    * This method get saved RFP detail from database
    * @method setRfpProjectDetail
    */
    setRfpProjectDetail() {
        this.loading = true;
        this.ProjectDetailsServices.getSavedProjectDetail(this.idRfp).subscribe(projectData => {
            if (projectData.length > 0) {
                projectData.forEach((data: any) => {
                    let tmpData = {};
                    tmpData['idSubTypeCategory'] = data.idRfpSubJobTypeCategory;
                    tmpData['idJobSubType'] = data.idRfpSubJobType;
                    if (data.idRfpJobType) { //1st level
                        let tmpJobData: any;
                        tmpJobData = this.jobTypes.filter(jobType => jobType.id == data.idRfpJobType)[0];
                        tmpData['description'] = tmpJobData.itemName;
                        tmpData['idJobType'] = data.idRfpJobType;
                        this.jobTypeServices.getRfpSubDataFromJobType(data.idRfpJobType).subscribe(jobTypeData => {
                            this.subTypeCategories = jobTypeData.filter(x => x.level == 2);
                            this.jobSubTypes = jobTypeData.filter(x => x.level == 3);
                            this.workTypeCategories = jobTypeData.filter(x => x.level == 4);
                            this.serviceWorkTypes = jobTypeData.filter(x => x.level == 5);
                            tmpData['subTypeCategories'] = jobTypeData.filter(x => x.level == 2);
                            if (tmpData['idSubTypeCategory']) { // 2nd level
                                this.jobTypeServices.getRfpSubDataFromJobType(tmpData['idSubTypeCategory']).subscribe(subTypeCatData => {
                                    tmpData['jobSubTypes'] = subTypeCatData.filter(x => x.level == 3);

                                    // set current status of filling flag
                                    let tmpCatWithStatusFilling = tmpData['subTypeCategories'].filter((x: any) => x.id == tmpData['idSubTypeCategory']);
                                    if (tmpCatWithStatusFilling && tmpCatWithStatusFilling.length > 0 && tmpCatWithStatusFilling[0].isCurrentStatusOfFiling) {
                                        tmpData['isCurrentStatusOfFiling'] = tmpCatWithStatusFilling[0].isCurrentStatusOfFiling;
                                    } else {
                                        tmpData['isCurrentStatusOfFiling'] = false;
                                    }

                                    let tmpWorkTypeCategories = subTypeCatData.filter(x => x.level == 4);
                                    // if direct level4,5 of level 2 exist then get level 4 & 5 of level 2
                                    if (tmpWorkTypeCategories && tmpWorkTypeCategories.length > 0) {
                                        let catLoopCtr = 0;
                                        for (let catCtr = 0, len = tmpWorkTypeCategories.length; catCtr < len; catCtr++) {
                                            let catData = tmpWorkTypeCategories[catCtr];
                                            this.jobTypeServices.getRfpSubDataFromJobType(catData.id).subscribe(workTypeData => {
                                              
                                                catData.workTypes = workTypeData.filter(x => x.level == 5);
                                                catData.tmpWorkTypes = [];
                                                if (catData.workTypes && catData.workTypes.length > 0) {
                                                    //tmpData['serviceWorkTypes'] = [];
                                                    for (let i = 0, len = catData.workTypes.length; i < len; i++) {
                                                        let matchedFeeRecord = _.findWhere(data.rfpFeeSchedules, { idRfpWorkType: catData.workTypes[i].id });
                                                        if (matchedFeeRecord) {
                                                            catData.workTypes[i].checked = true;
                                                            catData.workTypes[i].description = matchedFeeRecord['description'];
                                                            catData.workTypes[i].quantity = matchedFeeRecord['quantity'] ? matchedFeeRecord['quantity'] : 1;
                                                        }
                                                        catData.tmpWorkTypes[i] = catData.workTypes[i];
                                                    }
                                                }

                                            });
                                            catLoopCtr++;
                                        }
                                        if (tmpWorkTypeCategories && (tmpWorkTypeCategories.length == catLoopCtr)) {
                                            // this.loading = false;
                                            tmpData['workTypeCategories'] = tmpWorkTypeCategories;
                                        }
                                    }

                                    // Get level 4 & 5 data from level 3
                                    if (tmpData['idJobSubType']) {
                                        this.loading = true;
                                        this.jobTypeServices.getRfpSubDataFromJobType(tmpData['idJobSubType']).subscribe(workTypeCatData => {
                                            let tmpWorkTypeCategories = workTypeCatData.filter(x => x.level == 4);
                                            let catLoopCtr = 0;
                                            for (let catCtr = 0, len = tmpWorkTypeCategories.length; catCtr < len; catCtr++) {
                                                let catData = tmpWorkTypeCategories[catCtr];
                                                this.jobTypeServices.getRfpSubDataFromJobType(catData.id).subscribe(workTypeData => {

                                                    catData.workTypes = workTypeData.filter(x => x.level == 5);
                                                    catData.tmpWorkTypes = [];
                                                    if (catData.workTypes && catData.workTypes.length > 0) {
                                                        //  tmpData['serviceWorkTypes'] = [];
                                                        for (let i = 0, len = catData.workTypes.length; i < len; i++) {
                                                            let matchedFeeRecord = _.findWhere(data.rfpFeeSchedules, { idRfpWorkType: catData.workTypes[i].id });
                                                            if (matchedFeeRecord) {
                                                                catData.workTypes[i].checked = true;
                                                                catData.workTypes[i].description = matchedFeeRecord['description'];
                                                                catData.workTypes[i].quantity = matchedFeeRecord['quantity'] ? matchedFeeRecord['quantity'] : 1;
                                                            }
                                                            catData.tmpWorkTypes[i] = catData.workTypes[i];
                                                        }
                                                    }

                                                });
                                                catLoopCtr++;
                                            }
                                            if (tmpWorkTypeCategories && (tmpWorkTypeCategories.length == catLoopCtr)) {
                                                // this.loading = false;
                                                tmpData['workTypeCategories'] = tmpWorkTypeCategories;
                                            }

                                            // level 5 of level 3
                                            let level3ServiceItems = workTypeCatData.filter(x => x.level == 5);
                                            if (level3ServiceItems && level3ServiceItems.length > 0) {
                                                let tmpServiceWorkTypes: any = [];
                                                for (let i = 0, len = level3ServiceItems.length; i < len; i++) {
                                                    let matchedFeeRecord = _.findWhere(data.rfpFeeSchedules, { idRfpWorkType: level3ServiceItems[i].id });
                                                    if (matchedFeeRecord) {
                                                        level3ServiceItems[i].checked = true;
                                                        level3ServiceItems[i].description = matchedFeeRecord['description'];
                                                        level3ServiceItems[i].quantity = matchedFeeRecord['quantity'] ? matchedFeeRecord['quantity'] : 1;
                                                    }
                                                    tmpServiceWorkTypes[i] = level3ServiceItems[i];
                                                }
                                                tmpData['serviceWorkTypes'] = level3ServiceItems;
                                                tmpData['tmpServiceWorkTypes'] = tmpServiceWorkTypes;
                                                tmpData['tmpServiceWorkTypes'] = tmpServiceWorkTypes;
                                            }
                                            // this.loading = false;
                                        });
                                    } else {

                                    }




                                    // direct level 5 of level 2
                                    if (subTypeCatData.filter(x => x.level == 5).length > 0) {
                                        tmpData['serviceWorkTypes'] = subTypeCatData.filter(x => x.level == 5);
                                        if (tmpData['serviceWorkTypes'] && tmpData['serviceWorkTypes'].length > 0) {
                                            //let i = 0;
                                            let tmpServiceWorkTypes: any = [];
                                            for (let i = 0, len = tmpData['serviceWorkTypes'].length; i < len; i++) {
                                                let matchedFeeRecord = _.findWhere(data.rfpFeeSchedules, { idRfpWorkType: tmpData['serviceWorkTypes'][i].id });
                                                if (matchedFeeRecord) {
                                                    tmpData['serviceWorkTypes'][i].checked = true;
                                                    tmpData['serviceWorkTypes'][i].description = matchedFeeRecord['description'];
                                                    tmpData['serviceWorkTypes'][i].quantity = matchedFeeRecord['quantity'] ? matchedFeeRecord['quantity'] : 1;
                                                }
                                                tmpServiceWorkTypes[i] = tmpData['serviceWorkTypes'][i];
                                            }
                                            tmpData['tmpServiceWorkTypes'] = tmpServiceWorkTypes;
                                        }
                                    }

                                });
                            } else {
                                tmpData['jobSubTypes'] = jobTypeData.filter(x => x.level == 3);

                                let tmpWorkTypeCategories = jobTypeData.filter(x => x.level == 4);
                                // if direct level4,5 of level 1 exist then get level 4 & 5 of level 1
                                if (tmpWorkTypeCategories && tmpWorkTypeCategories.length > 0) {
                                    let catLoopCtr = 0;
                                    for (let catCtr = 0, len = tmpWorkTypeCategories.length; catCtr < len; catCtr++) {
                                        let catData = tmpWorkTypeCategories[catCtr];
                                        this.jobTypeServices.getRfpSubDataFromJobType(catData.id).subscribe(workTypeData => {

                                            catData.workTypes = workTypeData.filter(x => x.level == 5);
                                            catData.tmpWorkTypes = [];
                                            if (catData.workTypes && catData.workTypes.length > 0) {
                                                // tmpData['serviceWorkTypes'] = [];
                                                for (let i = 0, len = catData.workTypes.length; i < len; i++) {
                                                    let matchedFeeRecord = _.findWhere(data.rfpFeeSchedules, { idRfpWorkType: catData.workTypes[i].id });
                                                    if (matchedFeeRecord) {
                                                        catData.workTypes[i].checked = true;
                                                        catData.workTypes[i].description = matchedFeeRecord['description'];
                                                        catData.workTypes[i].quantity = matchedFeeRecord['quantity'] ? matchedFeeRecord['quantity'] : 1;
                                                    }
                                                    catData.tmpWorkTypes[i] = catData.workTypes[i];
                                                }
                                            }

                                        });
                                        catLoopCtr++;
                                    }
                                    if (tmpWorkTypeCategories && (tmpWorkTypeCategories.length == catLoopCtr)) {
                                        // this.loading = false;
                                        tmpData['workTypeCategories'] = tmpWorkTypeCategories;
                                    }
                                }
                                setTimeout(() => {
                                    // this.loading = false;
                                }, 3000);


                            }

                            // Direct level 5 of level 1
                            if (jobTypeData.filter(x => x.level == 5).length > 0) {
                                tmpData['serviceWorkTypes'] = jobTypeData.filter(x => x.level == 5);
                                if (tmpData['serviceWorkTypes'] && tmpData['serviceWorkTypes'].length > 0) {
                                    //      let i = 0;
                                    let tmpServiceWorkTypes: any = [];
                                    for (let i = 0, len = tmpData['serviceWorkTypes'].length; i < len; i++) {
                                        let matchedFeeRecord = _.findWhere(data.rfpFeeSchedules, { idRfpWorkType: tmpData['serviceWorkTypes'][i].id });
                                        if (matchedFeeRecord) {
                                            tmpData['serviceWorkTypes'][i].checked = true;
                                            tmpData['serviceWorkTypes'][i].description = matchedFeeRecord['description'];
                                            tmpData['serviceWorkTypes'][i].quantity = matchedFeeRecord['quantity'] ? matchedFeeRecord['quantity'] : 1;
                                        }
                                        tmpServiceWorkTypes[i] = tmpData['serviceWorkTypes'][i];
                                    }
                                    tmpData['tmpServiceWorkTypes'] = tmpServiceWorkTypes;
                                    tmpData['serviceWorkTypes'] = tmpServiceWorkTypes;
                                }
                            }


                        });
                    }
                    //    tmpData['workDescription'] = data.workDescription;
                    tmpData['arePlansNotPrepared'] = data.arePlansNotPrepared;
                    tmpData['arePlansCompleted'] = data.arePlansCompleted;
                    tmpData['isApproved'] = data.isApproved;
                    tmpData['isDisaproved'] = data.isDisaproved;
                    tmpData['isPermitted'] = data.isPermitted;
                    tmpData['approvedJobNumber'] = data.approvedJobNumber;
                    tmpData['disApprovedJobNumber'] = data.disApprovedJobNumber;
                    tmpData['permittedJobNumber'] = data.permittedJobNumber;
                    tmpData['id'] = data.id;
                    tmpData['idRfp'] = data.idRfp;
                    tmpData['displayOrder'] = data.displayOrder;
                    // setTimeout(()=>{    //<<<---    using ()=> syntax
                    this.detailArr.push(tmpData);
                    this.detailArr = _.sortBy(this.detailArr, 'displayOrder');
                    // },3000);

                });
                this.isExist = true
            }

            // this.loading = false
        })
    }

    /**
    * This method gets header status and set class name of progress bar
    * @method getHeaderStatus
    */
    getHeaderStatus(r: any) {

        if (r.completedStep >= 5) {
            this.showStep1 = this.showStep2 = this.showStep3 = this.showStep4 = this.showStep5 = 'success'
        } else if (r.completedStep >= 4) {
            this.showStep1 = this.showStep2 = this.showStep3 = this.showStep4 = 'success'
        } else if (r.completedStep >= 3) {
            this.showStep1 = this.showStep2 = this.showStep3 = 'success'
        } else if (r.completedStep >= 2) {
            this.showStep1 = this.showStep2 = 'success'
        } else if (r.completedStep >= 1) {
            this.showStep1 = 'success'
        }
    }

    /**
    * This method gets job types list
    * @method getJobTypes
    */
    private getJobTypes() {
        if (!this.jobTypes.length) {
            this.jobTypeServices.getRfpJobTypeDD().subscribe(r => {
                this.jobTypes = r
                setTimeout(() => {
                    // this.loading = false;
                }, 3000);
            }, e => { this.loading = false })
        }
    }

    /**
     * This method create Proposal address record in database
     * @method methodName
     */
    setJobSubTypeCategory() {
        if (this.project.idJobType) {
            this.selectJobType = false
        }
    }

    /**
     * This method will add new job section while click on Add new Job button
     * @method addJobType
     */
    addJobType(idsJobtype?: any, indexofarray?: any) {
        this.selectedJobId = this.project.idJobType;
        if (idsJobtype || !idsJobtype) {
            let jobTypeId = this.project.idJobType ? this.project.idJobType : idsJobtype
            this.loading = true
            this.jobTypeServices.getRfpSubDataFromJobType(jobTypeId).subscribe(r => {
                this.loading = false;
                this.subTypeCategories = r.filter(x => x.level == 2);
                this.jobSubTypes = r.filter(x => x.level == 3);
                this.workTypeCategories = r.filter(x => x.level == 4);
                this.serviceWorkTypes = r.filter(x => x.level == 5);

                let tmpJobData: any
                tmpJobData = this.jobTypes.filter(jobType => jobType.id == this.project.idJobType)[0];
                if (idsJobtype) {
                    tmpJobData = []
                    tmpJobData = this.jobTypes.filter(jobType => jobType.id == idsJobtype)[0];
                }
                // get level 5 of level 4 while select level 2 dropdown
                this.workTypeCategories.forEach((data: any) => {
                    this.jobTypeServices.getRfpSubDataFromJobType(data.id).subscribe(r => {
                        data.workTypes = r.filter(x => x.level == 5);
                        let i = 0;
                        data.tmpWorkTypes = [];
                        data.workTypes.forEach((tmpData: any) => {
                            data.tmpWorkTypes[i] = tmpData;
                            data.tmpWorkTypes[i].quantity = 1;
                            data.tmpWorkTypes[i].description = "";
                            i++;
                        });
                    });
                });
                let tempPushData = {
                    idJobType: jobTypeId,
                    description: tmpJobData.itemName,
                    number: tmpJobData.number,
                    idParent: tmpJobData.idParent,
                    subTypeCategories: this.subTypeCategories,
                    jobSubTypes: this.jobSubTypes,
                    workTypeCategories: this.workTypeCategories,
                    serviceWorkTypes: this.serviceWorkTypes,
                    workDescription: "",
                    tmpWorkTypes: {},
                    arePlansNotPrepared: 0,
                    arePlansCompleted: 0,
                    isApproved: 0,
                    isDisaproved: 0,
                    isPermitted: 0,
                }
                if (this.serviceWorkTypes && this.serviceWorkTypes.length > 0) {
                    let i = 0;
                    let tmpServiceWorkTypes: any = [];
                    this.serviceWorkTypes.forEach((tmpData: any) => {
                        tmpServiceWorkTypes[i] = tmpData;
                        tmpServiceWorkTypes[i].quantity = 1;
                        tmpServiceWorkTypes[i].description = "";
                        i++;
                    });
                    tempPushData['tmpServiceWorkTypes'] = tmpServiceWorkTypes;
                }
                if (!idsJobtype) {
                    this.detailArr.push(tempPushData);
                } else {
                    let array = [];
                    array.push(tempPushData)
                    array.forEach((object: any) => {
                        var found = this.detailArr.some(function (el: any) {
                            return el.idJobType === object.idJobType;
                        });
                        if (!found) {
                            this.detailArr.push(tempPushData);
                        } else {
                            this.detailArr[indexofarray] = tempPushData;
                        }
                    });
                }

                this.project.idJobType = null;
            })
        }
    }

    /**
     * This method set job sub types
     * @method setJobSubType
     * @param {number} idSubTypeCat ID of SubType Category
     * @param {any} item current row
     */
    setJobSubType(idSubTypeCat: number, item: any, j?: any) {
        item.workType = [];
        item.serviceWorkTypes = [];
        this.loading = true;
        if (idSubTypeCat) {
            this.jobTypeServices.getRfpSubDataFromJobType(idSubTypeCat).subscribe(r => {
                let tmpCatWithStatusFilling = this.subTypeCategories.filter((x: any) => x.id == idSubTypeCat);
                if (tmpCatWithStatusFilling && tmpCatWithStatusFilling.length > 0 && tmpCatWithStatusFilling[0].isCurrentStatusOfFiling) {
                    item.isCurrentStatusOfFiling = tmpCatWithStatusFilling[0].isCurrentStatusOfFiling;
                } else {
                    item.isCurrentStatusOfFiling = false;
                }

                item.jobSubTypes = r.filter(x => x.level == 3);
                item.workTypeCategories = r.filter(x => x.level == 4);
                item.serviceWorkTypes = r.filter(x => x.level == 5);
                if (item.serviceWorkTypes && item.serviceWorkTypes.length > 0) {
                    let tmpServiceWorkTypes: any = [];
                    let i = 0;
                    item.serviceWorkTypes.forEach((tmpData: any) => {
                        tmpServiceWorkTypes[i] = tmpData;
                        tmpServiceWorkTypes[i].quantity = 1;
                        tmpServiceWorkTypes[i].description = "";
                        i++;
                    });
                    // item.tmpServiceWorkTypes = [];
                    item.tmpServiceWorkTypes = tmpServiceWorkTypes;
                }

                // get level 5 of level 4 while select level 3 dropdown 
                item.workTypeCategories.forEach((data: any) => {
                    this.jobTypeServices.getRfpSubDataFromJobType(data.id).subscribe(r => {
                        data.workTypes = r.filter(x => x.level == 5);
                        let i = 0;
                        data.tmpWorkTypes = [];
                        data.workTypes.forEach((tmpData: any) => {
                            data.tmpWorkTypes[i] = tmpData;
                            data.tmpWorkTypes[i].quantity = 1;
                            data.tmpWorkTypes[i].description = "";
                            i++;
                        });
                    });
                });
                this.loading = false;
            });
        }
        if (idSubTypeCat == null) {
            this.addJobType(this.detailArr[j].idJobType, j);
            item.serviceWorkTypes = this.serviceWorkTypes;
            if (item.serviceWorkTypes && item.serviceWorkTypes.length > 0) {
                let tmpServiceWorkTypes: any = [];
                let i = 0;
                item.serviceWorkTypes.forEach((tmpData: any) => {
                    if (tmpData.checked) {
                        tmpData.checked = false;
                    }
                    tmpServiceWorkTypes[i] = tmpData;
                    tmpServiceWorkTypes[i].quantity = 1;
                    tmpServiceWorkTypes[i].description = "";
                    i++;
                });
                // item.tmpServiceWorkTypes = [];
                item.tmpServiceWorkTypes = tmpServiceWorkTypes;
            }
            item.jobSubTypes = [];
            item.isCurrentStatusOfFiling = false;
            item.idJobSubType = null;
            // item.serviceWorkTypes = [];
            item.workTypeCategories = [];
            this.loading = false;
        }
    }

    /**
     * This method will set work types
     * @method setWorkTypes
     * @param {number} idSubType ID of SubType
     * @param {any} item current row
     */
    setWorkTypes(idSubType: number, item: any) {
        this.loading = true;
        item.serviceWorkTypes = [];
        if (idSubType) {
            this.jobTypeServices.getRfpSubDataFromJobType(idSubType).subscribe(r => {
                item.workTypeCategories = r.filter(x => x.level == 4);

                item.workTypeCategories.forEach((data: any) => {
                    this.jobTypeServices.getRfpSubDataFromJobType(data.id).subscribe(r => {
                        data.workTypes = r.filter(x => x.level == 5);
                        let i = 0;
                        data.tmpWorkTypes = [];
                        data.workTypes.forEach((tmpData: any) => {
                            data.tmpWorkTypes[i] = tmpData;
                            data.tmpWorkTypes[i].quantity = 1;
                            data.tmpWorkTypes[i].description = "";
                            i++;
                        });
                    });
                });

                // level 5 of level 3
                item.serviceWorkTypes = r.filter(x => x.level == 5);
                if (item.serviceWorkTypes && item.serviceWorkTypes.length > 0) {
                    let tmpServiceWorkTypes: any = [];
                    let i = 0;
                    item.serviceWorkTypes.forEach((tmpData: any) => {
                        tmpServiceWorkTypes[i] = tmpData;
                        tmpServiceWorkTypes[i].quantity = 1;
                        tmpServiceWorkTypes[i].description = "";
                        i++;
                    });
                    item.tmpServiceWorkTypes = tmpServiceWorkTypes;
                }
                this.loading = false;
            });
        }

        if (idSubType == null) {
            // item.serviceWorkTypes = [];
            item.workTypeCategories = [];
            this.loading = false;
        }
    }

    /**
     * This method will save project detail
     * @method saveProjectDetail
     * @param {boolean} isSaveAndExit save&exist button is pressed or not
     */
    saveProjectDetail(isSaveAndExit: boolean, stepName: string) {
        // let filledProjectDetail = cloneDeep(this.detailArr)
        this.formNotChanged = true;
        this.loading = true;
        let i = 0;
        let detailArrlength = this.detailArr.length;
        let requestProjectArray = [];
        // this.loading = false;
        for (let detail of this.detailArr) {
            let projectRequestData = {}
            projectRequestData['id'] = detail.id ? detail.id : 0;
            projectRequestData['idRfp'] = this.idRfp;
            projectRequestData['idRfpJobType'] = detail.idJobType;
            projectRequestData['idRfpSubJobTypeCategory'] = detail.idSubTypeCategory;
            projectRequestData['idRfpSubJobType'] = detail.idJobSubType;
            // projectRequestData['idWorkTypeCategory'] = detail.tmpWorkTypes;
            let tmpWorkTypesArr: any = [];
            let checkedWorkTypesArr: any = [];
            if (detail.workTypeCategories && detail.workTypeCategories.length > 0) {
                detail.workTypeCategories.forEach((category: any) => {
                    if (category.tmpWorkTypes && category.tmpWorkTypes.length > 0) {
                        checkedWorkTypesArr = category.tmpWorkTypes.filter((x: any) => x.checked == true);
                        checkedWorkTypesArr.forEach((type: any) => {
                            type['idFeeSchedule'] = 0;
                            if(!type.duplicateId){
                                type['duplicateId'] = type.id;
                            }
                            type['idRfpWorkTypeCategory'] = category.id;
                            type['idRfpWorkType'] = type.id ? type.id : type.duplicateId ? type.duplicateId :0 ;
                            type['idProjectDetail'] = projectRequestData['id'];
                            delete type['id'];
                            // delete type['checked'];
                            delete type['disabled'];
                            tmpWorkTypesArr.push(type);
                        })
                    }
                })
            }

            // Direct step 5 level
            if (detail.tmpServiceWorkTypes && detail.tmpServiceWorkTypes.length > 0) {
                let checkedServiceTypesArr: any = [];
                checkedServiceTypesArr = detail.tmpServiceWorkTypes.filter((x: any) => x.checked == true);
                checkedServiceTypesArr.forEach((type: any) => {
                    type['idFeeSchedule'] = 0;
                    if(!type.duplicateId){
                        type['duplicateId'] = type.id;
                    }
                    type['idRfpWorkTypeCategory'] = checkedServiceTypesArr.id;
                    type['idRfpWorkType'] = type.id ? type.id : type.duplicateId ? type.duplicateId :0;
                    type['idProjectDetail'] = projectRequestData['id'];
                    delete type['id'];
                    // delete type['checked'];
                    delete type['disabled'];
                    tmpWorkTypesArr.push(type);
                })
            }

            projectRequestData['rfpFeeSchedules'] = tmpWorkTypesArr;
            //  projectRequestData['workDescription'] = detail.workDescription;
            projectRequestData['arePlansNotPrepared'] = detail.arePlansNotPrepared;
            projectRequestData['arePlansCompleted'] = detail.arePlansCompleted;
            projectRequestData['isApproved'] = detail.isApproved;
            projectRequestData['isDisaproved'] = detail.isDisaproved;
            projectRequestData['isPermitted'] = detail.isPermitted;
            projectRequestData['approvedJobNumber'] = detail.approvedJobNumber;
            projectRequestData['disApprovedJobNumber'] = detail.disApprovedJobNumber;
            projectRequestData['permittedJobNumber'] = detail.permittedJobNumber;
            projectRequestData['displayOrder'] = i;
            i++;
            requestProjectArray.push(projectRequestData);
        }
        this.loading = true;
        if (this.showRfpAddBtn == 'show') {
            this.ProjectDetailsServices.addProjectdetail(requestProjectArray, this.idRfp).subscribe(r => {
                if (detailArrlength == i) {
                    this.toastr.success('Project detail added successfully.')
                    setTimeout(() => {
                        this.loading = false;
                    }, 9000);
                    if (!isSaveAndExit && !stepName) {
                        this.router.navigate(['/scopeReview', this.idRfp])
                    } else if (!isSaveAndExit && stepName) {
                        this.router.navigate([stepName, this.idRfp])
                    } else if (isSaveAndExit) {
                        this.router.navigate(['/rfp'])
                    }
                }
            }, e => {
                this.loading = false
            });
        } else {
            this.loading = false
            if (!isSaveAndExit && !stepName) {
                this.router.navigate(['/scopeReview', this.idRfp])
            } else if (!isSaveAndExit && stepName) {
                this.router.navigate([stepName, this.idRfp])
            } else if (isSaveAndExit) {
                this.router.navigate(['/rfp'])
            }
        }

    }

    /**
     * This method will remove project detail item
     * @method removeProjectDetail
     * @param {number} idJobType ID of job type
     * @param {number} itemId ID of current row
     * @param {number} index?? Index of current row
     */
    removeProjectDetail(idJobType: number, itemId: number, index?: number) {
        let itemObj = this.detailArr[index]
        this.detailArr.splice(this.detailArr.indexOf(itemObj), 1);
    }
    getBack() {
        this.router.navigate(['/rfp'])
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
    * This method check given data is decimal or not
    * @method isDecimal
    * @param {any} evt event object
    */
    isDecimal(evt: any) {
        //getting key code of pressed key
        var keycode = (evt.which) ? evt.which : evt.keyCode;
        //comparing pressed keycodes
        if (!(keycode == 8 || keycode == 46) && (keycode < 48 || keycode > 57)) {
            return false;
        }
        else {
            var parts = evt.srcElement.value.split('.');
            if (parts.length > 1 && keycode == 46)
                return false;
            return true;
        }
    }

    /**
    * This method open add general note popup
    * @method addGeneralNote
    */
    addGeneralNote() {
        this.openModalSendEmail(this.rfpprogressionnote)
    }

    /**
    * This method is used to open modal popup for add general note
    * @method openModalSendEmail
    * @param {TemplateRef} template contains template of add general note
    * @param {number} id it is optional which contains id if record is in edit mode
    */
    private openModalSendEmail(template: TemplateRef<any>, id?: number) {
        this.modalRef = this.modalService.show(template, { class: 'modal-add-task' })
    }
}