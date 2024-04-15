import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { RfpSubmitServices } from "../rfpSubmit/rfpSubmit.services";
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription ,  Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AppComponent } from '../../../app.component';
import { proposalReview, Milestones, proposalReviewSections } from '../../../types/proposalReview';
import { ProposalReviewServices } from './proposalReview.services';
import { RfpListService } from '../../rfp/rfp.services';
import { ScopeReviewServices } from '../scopeReview/scopeReview.services';
import { Verbiages } from '../../../types/verbiages';
import * as _ from 'underscore';
import { ComponentCanDeactivate } from '../../../components/appSaveLeave/guard';
import { HostListener } from '@angular/core';
import { Message } from '../../../app.messages';
import { ContactServices } from '../../contact/contact.services';
import { UserRightServices } from '../../../services/userRight.services';
import { constantValues } from '../../../app.constantValues';
import * as moment from 'moment';

declare const $: any

/**
* This component contains all function that are used in proposalReviewComponent
* @class proposalReviewComponent
*/
@Component({
    templateUrl: './proposalReview.component.html',
    styleUrls: ['./proposalReview.component.scss']
})
export class proposalReviewComponent implements ComponentCanDeactivate {

    /**
    *  feeschedule add/edit form
    * @property feeschedule
    */
    @ViewChild('feeschedule',{static: true})
    private feeschedule: TemplateRef<any>

    /**
    *  review add/edit form
    * @property review
    */
    @ViewChild('review',{static: true})
    private review: TemplateRef<any>


    /**
    *  rfpprogressionnote add/edit form
    * @property rfpprogressionnote
    */
    @ViewChild('rfpprogressionnote',{static: true})
    private rfpprogressionnote: TemplateRef<any>

    /**
    *  proposalForm add/edit form
    * @property proposalForm
    */
    @ViewChild('proposalForm',{static: true}) form: any;

    proposalReview: proposalReview
    private tmpDropdown: any;
    milestone: any = [];
    private sectionDp: any = [];
    exsitingProposal: any = [];
    private finalProposal: any = [];
    private dp: any = [];
    private requestData: any = [];
    milestoneCost: number;
    services: any[] = []
    dropdownSettings: any = {};
    tmpServicesId: any[] = []
    autoCalculatedCost: number
    showReviewBtn: boolean = false
    costClass: string = 'cost-same'

    private section: string
    private isIntro: boolean
    private isScope: boolean
    private isCost: boolean
    private isAdditionalScope: boolean
    private isMileStone: boolean
    private sub: any
    saveBtnEnable = false
    private selectUndefinedOptionValue: any;
    private selectedSections: any = [];
    private scopeDesc: any;
    rfpNumber: string;
    id: number
    private unitType: any = []

    private Options: any = []
    private displayOptions: any = []

    private milestoneLength: number
    private showNavigationTabs: boolean = true
    showStep1: string = ''
    showStep2: string = ''
    showStep3: string = ''
    private showStep4: string = ''
    showStep5: string = ''
    private proposalPDFFile: string = ''
    loading: boolean = false
    private isMileStoneEmpty: boolean = false
    errorMsg: any
    private formNotChanged = true
    modalRef: BsModalRef
    rfpDetail: any = {}
    createdBy: string
    modifiedBy: string
    private showRfpAddBtn: string = 'hide'
    private showRfpViewBtn: string = 'hide'
    private showRfpDeleteBtn: string = 'hide'
    introduction: number
    introductionItems: any = []
    sign: number
    signItems: any = []
    signatoryItems: any = [
        { id: "17", name: "Michael Pressel" },
        { id: "18", name: "Robert Anic" },
        { id: "19", name: "Kevin Danielson" }
    ]
    additionalScope: number
    additionalScopeItems: any = []
    conclusion: number
    conclusionItems: any = []
    disabledBtn: boolean = false
    pendingMilestoneCost: number
    totalMileStoneCost: number
    signatory: any;
    // @HostListener allows us to also guard against browser refresh, close, etc.
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return this.formNotChanged
    }

    constructor(
      private ProposalReviewServices: ProposalReviewServices,
      private route: ActivatedRoute,
      private toastr: ToastrService,
      private router: Router,
      private RfpListService: RfpListService,
      private scopeReviewServices: ScopeReviewServices,
      private message: Message,
      private modalService: BsModalService,
      private contactService: ContactServices,
      private userRight: UserRightServices,
      public constantValues: constantValues,
      private rfpSubmitService: RfpSubmitServices
    ) {
        this.unitType.push({ "id": 1, "desc": "Dollar($)" })
        this.unitType.push({ "id": 2, "desc": "Meetings" })
        this.unitType.push({ "id": 3, "desc": "Hours" })
        this.errorMsg = message.msg
    }

    ngOnInit() {
        //   this.loading = true
        document.title = 'RFP'
        this.showRfpAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDRFP)
        this.showRfpViewBtn = this.userRight.checkAllowButton(this.constantValues.VIEWRFP)
        this.showRfpDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETERFP)
        if (this.showRfpAddBtn == 'hide') {
            this.disabledBtn = true
        }

        this.getVerbiageMaster()


        this.dropdownSettings = {
            singleSelection: false,
            text: "Services",
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableSearchFilter: true,
            enableCheckAll: true,
            classes: "myclass custom-class",
            badgeShowLimit: 2
        };
        this.isCost = true
        this.isMileStone = true
        this.saveBtnEnable = true

        this.tmpDropdown = [];
        this.proposalReview = {} as proposalReview

        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.getRfpDetail()
            this.getServices()
        });

        if (this.showRfpAddBtn == 'hide') {
            setTimeout(function () {
                this.showAddressAddBtn = 'hide'
                $(".wizard-body").addClass("disabled");
                $(".wizard-body .form-control, .wizard-body input[type='checkbox'], .wizard-body input[type='radio'], .wizard-body .btn").attr("disabled", "disabled");
            }, 500);
        }
    }

    /**
  * This method check Save the data and process to preffered step
  * @method saveOnHeader
  * @param{stepNo} Step Name of RFP
  */
    saveOnHeader(stepNo: string) {
        this.saveProposalReview(false, stepNo)
    }

    /**
    * This method is used to check whether value entered is number or not
    * @method isNumber
    * @param {any} evt evt of input
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
    * This method is used to get details of specific RFP
    * @method getRfpDetail
    */
    private getRfpDetail() {
        this.loading = true
        this.RfpListService.getById(this.id).subscribe(r => {
            this.rfpNumber = r.rfpNumber
            document.title = 'RFP# ' + this.rfpNumber;
            // this.scopeDesc = r.scopeReview ? r.scopeReview.description : "";
            this.getHeaderStatus(r)
            this.getVerbiages()
        })
    }
    /**
   * This method is used to downaload RFP proposal in PDF format
   * @method downloadPdf
   */
    downloadPdf() {
    //window.open("http://rpoback.azurewebsites.net/PDF/RFP-Pdf_1.pdf", '_system');
    this.rfpSubmitService.downloadPdf(this.id).subscribe(r => {
        if (r && r[0]['key'] == 'pdfFilePath') {
            this.proposalPDFFile = r[0]['value']
            window.open(this.proposalPDFFile, '_blank');
        }
        // window.open("http://rpoback.azurewebsites.net/PDF/RFP-Pdf_1.pdf", '_blank');

    })
}

    /**
   * This method is used to get all verbiages 
   * @method getVerbiageMaster
   */
    getVerbiageMaster() {
        this.scopeReviewServices.getVerbiagesDropDown().subscribe(r => {
            let introItemsRec = r.filter((x: any) => x.verbiageType == 1)
            let addtionalSpItemsRec = r.filter((x: any) => x.verbiageType == 5)
            let conclusionItemsRec = r.filter((x: any) => x.verbiageType == 6)
            let signItemsRec = r.filter((x: any) => x.verbiageType == 7)

            if (introItemsRec && introItemsRec.length > 0) {
                this.introductionItems = introItemsRec
            }
            if (addtionalSpItemsRec && addtionalSpItemsRec.length > 0) {
                this.additionalScopeItems = addtionalSpItemsRec
            }
            if (conclusionItemsRec && conclusionItemsRec.length > 0) {
                this.conclusionItems = conclusionItemsRec
            }
            if (signItemsRec && signItemsRec.length > 0) {
                this.signItems = signItemsRec
            }
        }, e => { })
    }

    /**
    * This method is used to set introduction on verbiage selection
    * @method getIntroduction
    * @param {any} e e is used as an event
    * @param {any} option option is which contains details of which introduction we need to set
    */
    getIntroduction(e: any, option: any) {
        if (this.introduction) {

            this.scopeReviewServices.getVerbiageByyId(this.id, this.introduction).subscribe(r => {
                option.content = r.content
                option.idVerbiage = this.introduction
            })
        } else {
            option.content = ''
        }
        this.formNotChanged = false
    }

    /**
  * This method is used to set additional scope on verbiage selection
  * @method getAdditionalScope
  * @param {any} e e is used as an event
  * @param {any} option option is which contains details of which additional scope we need to set
  */
    getAdditionalScope(e: any, option: any) {
        if (this.additionalScope) {
            this.scopeReviewServices.getVerbiageById(this.additionalScope).subscribe(r => {
                option.content = r.content
                option.idVerbiage = this.additionalScope
            })
        } else {
            option.content = ''
        }
        this.formNotChanged = false
    }

    /**
 * This method is used to set conclusion scope on verbiage selection
 * @method getConclusion
 * @param {any} e e is used as an event
 * @param {any} option option is which contains details of which conclusion scope we need to set
 */
    getConclusion(e: any, option: any) {
        if (this.conclusion) {
            this.scopeReviewServices.getVerbiageById(this.conclusion).subscribe(r => {
                option.content = r.content
                option.idVerbiage = this.conclusion
            })
        } else {
            option.content = ''
        }
        this.formNotChanged = false
    }
    /**
* This method is used to set conclusion scope on verbiage selection
* @method getSign
* @param {any} e e is used as an event
* @param {any} option option is which contains details of which conclusion scope we need to set
*/
    getSign(e: any, option: any) {
        if (this.sign) {
            this.scopeReviewServices.getVerbiageById(this.sign).subscribe(r => {
                option.content = r.content
                option.idVerbiage = this.sign
            })
        } else {
            option.content = ''
        }
        this.formNotChanged = false
    }


    /**
    * Get all records from verbiage database 
    * @method getVerbiages
    */
    getVerbiages() {
        this.scopeReviewServices.getAllVerbiages().subscribe(r => {
            this.sectionDp = r.data
            this.getProposal();
        }, e => {

        })
    }

    /**
    * This method is used to display status of rfp
    * @method getHeaderStatus
    * @param {any} r rfpDetail is an object of rfp
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
    * This method is used to get specific proposal 
    * @method getProposal
    */
    getProposal() {
        this.ProposalReviewServices.getProposalReview(this.id).subscribe(r => {
            if (r.rfpProposalReviewList.length > 0) {
                this.exsitingProposal = r.rfpProposalReviewList
                r.rfpProposalReviewList.forEach((element: any, i: any) => {
                    if (element.verbiageType == 1 && element.idVerbiage) {
                        this.introduction = element.idVerbiage
                    }
                    if (element.verbiageType == 5 && element.idVerbiage) {
                        this.additionalScope = element.idVerbiage
                    }
                    if (element.verbiageType == 6 && element.idVerbiage) {
                        this.conclusion = element.idVerbiage
                    }
                    if (element.verbiageType == 7 && element.idVerbiage) {
                        this.sign = element.idVerbiage
                    }
                })
            }
            this.autoCalculatedCost = r.calculatedCost
            this.milestone = r.rfpMilestoneList
            this.proposalReview.cost = r.cost
            this.proposalReview.isSignatureNewPage = r.isSignatureNewPage
            this.proposalReview.idSignature = r.idSignature
            this.proposalReview.cost = r.cost

            this.milestoneCost = 0
            if (this.milestone.length > 0) {
                this.setTotalMileStoneCost()
                this.tmpServicesId = []
                this.milestone.forEach((element: any, i: any) => {

                    this.milestoneCost = this.milestoneCost + element.value
                    this.valueUpdated();
                    this.tmpServicesId[i] = []
                    if (element.milestoneServices.length > 0) {
                        element.milestoneServices.forEach((list: any, j: number) => {

                            if (element.id == list.idMilestone) {
                                // let x =  this.services.filter( (service: any) => service.id == element.id);
                                this.tmpServicesId[i].push({
                                    id: list.idRfpFeeSchedule,
                                    itemName: list.itemName
                                })
                            }
                        });
                    }
                });
            }
            // let tmpSectionDp = cloneDeep(this.sectionDp);
            // if (tmpSectionDp.length > 0) {
            //     tmpSectionDp.forEach((element: any, index: number) => {
            //         let remove = this.exsitingProposal.filter((x: any) => x.idVerbiage == element.id)[0]
            //         if (typeof remove == "undefined") {
            //             this.dp.push({ "id": element.id, "itemName": element.name })
            //         }
            //     });
            // }
            this.getRFPCreatorDetail(r);
        }, e => {
            this.loading = false
        })
    }

    /**
    * This method is used for delete particular section
    * @method deleteSection
    * @param {string} section section is which scope we need to delete
    */
    private deleteSection(section: string) {
        let removeSection = this.exsitingProposal.filter((x: any) => x.idVerbiage == section)

        if (removeSection) {
            let removeIndex = _.findIndex(this.exsitingProposal,
                function (voteItem: any) {
                    return voteItem.idVerbiage == section
                }
            )
            this.exsitingProposal.splice(removeIndex, 1);
            this.dp.push({ id: removeSection[0].idVerbiage, "itemName": removeSection[0].verbiageName })
        }
    }

    /**
    * This method is used for add particular section, this will push a new section in specific array 
    * @method addSection
    */
    private addSection() {
        let content = ""
        if (this.section != null && this.section != '' && typeof this.section != 'undefined') {
            let addNewSection = this.sectionDp.filter((x: any) => x.id == this.section)
            if (addNewSection[0].id == 2) {
                content = this.scopeDesc
            } else {
                content = addNewSection[0].content
            }
            if (addNewSection) {
                this.exsitingProposal.push({
                    content: content,
                    displayOrder: 0,
                    id: 0,
                    idRfp: this.id,
                    idVerbiage: addNewSection[0].id,
                    verbiageName: addNewSection[0].name,
                })
                let removeIndex = _.findIndex(this.dp,
                    function (voteItem: any) {
                        return voteItem.id == addNewSection[0].id
                    }
                )
                this.dp.splice(removeIndex, 1);
            }
        }
    }

    /**
    * This method is used to save record
    * @method saveProposalReview
    * @param {boolean} isSaveAndExit isSaveAndExit if it is true than navigate to RFP listing, otherwise it will go to next step
    * @param {string} param param it is used to indicate that where we need to navigate
    */
    saveProposalReview(isSaveAndExit: boolean, param?: string) {
        let isApproveSend = false
        this.loading = true
        this.finalProposal = []
        let serviceItem: any = []
        this.finalProposal = this.exsitingProposal
        let milestoneServiceFlag: boolean = true
        let milestoneServicesArr: any = []
        if (this.tmpServicesId && this.tmpServicesId.length > 0) {
            this.tmpServicesId.forEach((element: any, index: number) => {
                serviceItem = []

                let tmpElement = element
                this.milestone.forEach((mile: any, k: number) => {
                    if (mile.value > 0 && mile.name != '') { //
                        if (index == k) {
                            this.milestone[k]['milestoneServices'] = []
                            tmpElement.forEach((tmp: any, i: number) => {
                                this.milestone[k]['milestoneServices'].push({
                                    id: 0,
                                    idMilestone: mile.id,
                                    idRfpFeeSchedule: tmp.id,
                                    itemName: tmp.itemName,
                                    isMileStoneService: true
                                })
                                milestoneServicesArr.push({
                                    id: 0,
                                    idMilestone: mile.id,
                                    idRfpFeeSchedule: tmp.id,
                                    itemName: tmp.itemName
                                })

                            });
                        }
                    } else {
                        this.toastr.error(this.errorMsg.requiredMilestoneCostValue)
                        milestoneServiceFlag = false
                        this.loading = false
                    }
                })

            });
        } else {
            // add new milestone set require name and cost validation
            this.milestone.forEach((mile: any, k: number) => {
                if (mile.value == 0 || mile.name == '') { //
                    this.toastr.error(this.errorMsg.requiredMilestoneCostValue)
                    milestoneServiceFlag = false
                    this.loading = false
                }
            })
        }

        if (milestoneServiceFlag) {
            // this.removeCostAndMilestone()
            this.requestData = {
                idRfp: this.id,
                cost: this.proposalReview.cost,
                RfpMilestoneList: this.milestone,
                rfpProposalReviewList: this.finalProposal,
                milestoneServices: milestoneServicesArr,
                isSignatureNewPage: this.proposalReview.isSignatureNewPage,
                idSignature: this.proposalReview.idSignature
            }
            if (this.showRfpAddBtn == 'show'){
                if(param == 'Approve'){
                     isApproveSend = true
                }else{
                     isApproveSend = false;
                }
                this.ProposalReviewServices.addProposalReview(this.requestData, this.id, isSaveAndExit, isApproveSend).subscribe(r => {
                    this.formNotChanged = true
                    this.toastr.success('Proposal review added successfully.')
                    if (!isSaveAndExit && param == 'save') {
                        this.router.navigate(['/proposalReview', this.id])
                    } else if (!isSaveAndExit && param != 'Approve') {
                        this.router.navigate([param, this.id])
                    } else if (!isSaveAndExit && param == 'Approve') {
                        this.router.navigate(['/rfpSubmit', this.id])
                    } else if (isSaveAndExit) {
                        this.router.navigate(['/rfp'])
                    }
                    this.loading = false
                }, e => {
                    this.loading = false
                });
            } else {
                if (!isSaveAndExit && param == 'save') {
                    this.router.navigate(['/proposalReview', this.id])
                } else if (!isSaveAndExit && param != 'Approve') {
                    this.router.navigate([param, this.id])
                } else if (!isSaveAndExit && param == 'Approve') {
                    this.router.navigate(['/rfpSubmit', this.id])
                } else if (isSaveAndExit) {
                    this.router.navigate(['/rfp'])
                }
            }
            
        }
    }


    /**
    * This method is used for removing milestone 
    * @method removeCostAndMilestone
    */
    removeCostAndMilestone() {
        let removeCostIndex = _.findIndex(this.finalProposal,
            function (voteItem: any) {
                return voteItem.idVerbiage == 5
            }
        )
        if (removeCostIndex) {
            this.finalProposal.splice(removeCostIndex, 1);
        }
        let removeMilestoneIndex = _.findIndex(this.finalProposal,
            function (voteItem: any) {
                return voteItem.idVerbiage == 6
            }
        )
        if (removeMilestoneIndex) {
            this.finalProposal.splice(removeMilestoneIndex, 1);
        }

    }

    /**
    * This method is used to display rfp create and update details
    * @method getRFPCreatorDetail
    * @param {any} rfpDetail rfpDetail is an object of rfp
    */
    private getRFPCreatorDetail(rfpDetail: any) {
        this.RfpListService.getById(this.id).subscribe(r => {

            // get Whole RFP detail
            this.rfpDetail = r;

            if (this.rfpDetail.idCreatedBy == parseInt(localStorage.getItem("userLoggedInId"))) {
                this.showReviewBtn = true
            }


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
            this.loading = false
        }, e => {
            this.loading = false
        })
    }

    /**
    * This method is used to reset cost to actual fees schedule cost
    * @method resetCost
    */
    resetCost() {
        this.proposalReview.cost = this.autoCalculatedCost
    }

    /**
    * This method is used to add new milestone
    * @method addNewMileStone
    */
    addNewMileStone() {

        let tmpCost = this.valueUpdated('add');
        let mileCost = this.proposalReview.cost - tmpCost;
        this.pendingMilestoneCost = mileCost;
        this.milestoneCost = tmpCost + mileCost
        let addMilestone: any
        addMilestone = {
            id: 0,
            idRfp: this.id,
            milestoneServices: [],
            name: "",
            value: (mileCost > 0) ? mileCost : 0
        }
        this.milestone.push(addMilestone)
        this.setTotalMileStoneCost();
        this.valueUpdated(); // update cost text box class after 1st milestone added
    }

    /**
     * 
     */
    setTotalMileStoneCost() {
        this.totalMileStoneCost = 0;
        this.milestone.forEach((element: any, i: any) => {
            if (element.value) {
                this.totalMileStoneCost = this.totalMileStoneCost + parseFloat(element.value);
                this.pendingMilestoneCost = this.proposalReview.cost - this.totalMileStoneCost;
            }

            // this.milestoneCost = this.milestoneCost + parseFloat(element.value)
        })
    }
    /**
   * This method is used to delete existing  milestone
   * @method deleteMilestone
   * @param {number} index index for which we are deleting milestone
   */
    deleteMilestone(index: number) {
        this.milestone.splice(index, 1);
        this.tmpServicesId.splice(index, 1);
        this.setTotalMileStoneCost();
        this.valueUpdated()
    }

    /**
    * This method is used to calculate renaining cost and set in milestone
    * @method valueUpdated
    * @param {string} add it is optional
    */
    valueUpdated(add?: string) {
        this.milestoneCost = 0
        this.milestone.forEach((element: any, i: any) => {
            this.milestoneCost = this.milestoneCost + parseFloat(element.value)
        })
        if (this.proposalReview.cost == this.milestoneCost) {
            this.costClass = ''
        } else {
            this.costClass = 'same-cost'
        }
        if (add == 'add') {
            return this.milestoneCost
        }
    }

    /**
    * This method is used to get RFP fee schedule services
    * @method getServices
    */
    getServices() {
        if (!this.services.length) {
            this.ProposalReviewServices.getRfpFeeScheduleService(this.id).subscribe(r => {
                let itemServices = _.sortBy(r, function (i: any) { return i.itemName.toLowerCase(); });
                itemServices.forEach((element: any) => {
                    this.services.push({
                        id: element.idRfpFeeSchedule,
                        itemName: element.itemName
                    })
                })
            })

        }

    }

    /**
    * This method is used to submit reviewer, who can review proposal
    * @method submitForReview
    */
    submitForReview() {
        this.openModalReview(this.review)
    }

    /**
    * This method is used to open modal popup for openModalFeeSchedule
    * @method openModalFeeSchedule
    * @param {any} template type which contains template of fee schedule module
    */
    openModalFeeSchedule(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template, { class: 'modal-fee-schedule', backdrop: 'static', 'keyboard': false })
    }

    /**
   * This method is used to open modal popup for openModalReview
   * @method openModalReview
   * @param {any} template type which contains template of proposal review module
   */
    private openModalReview(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template, { class: '', backdrop: 'static', 'keyboard': false })
    }

    /**
      * This method is used check any element in form changed or not
      * @method isFieldValChange
      */
    isFieldValChange(type?: any, val?: any) {
        if (type != 'cost') {
            if (this.form.touched && (this.form.dirty || this.form.invalid)) {
                this.formNotChanged = false
            }
        } else {
            if (typeof val != 'undefined') {
                if (this.autoCalculatedCost != parseInt(val)) {
                    this.formNotChanged = false
                } else {
                    this.formNotChanged = true
                }
            } else {
                this.formNotChanged = false
            }
        }
    }

    /**
    * This method is used to navigate user to RFP listing screen
    * @method getBack
    */
    getBack() {
        this.router.navigate(['/rfp'])
    }

    /**
       * This method is used to check user can enter only numeric value
       * @method onlyNumberKey
       */
    onlyNumberKey(event: any) {
        return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
    }

    /**
       * This method is used to check user can enter only numeric and decimal value
       * @method isDecimal
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
     *  Get selected item from dropdown
     * @method onItemSelect
     */
    onItemSelect(item: any, itemArr: any) {

    }

    /**
      *  Deselect item from dropdown
      * @method OnItemDeSelect
      */
    OnItemDeSelect(item: any) {

    }

    /**
    *  all items are selected from dropdown
    * @method onSelectAll
    */
    onSelectAll(items: any) {

    }

    /**
    *  all items are deselected from dropdown
    * @method onDeSelectAll
    */
    onDeSelectAll(items: any) {

    }

    /**
    * This method is used for adding general notes in RFP
    * @method addGeneralNote
    */
    addGeneralNote() {
        this.openModalSendEmail(this.rfpprogressionnote)
    }

    /**
    * This method is used to open modal popup for openModalForm
    * @method openModalSendEmail
    * @param {any} template type which contains template of email module
    * @param {number} id it is optional which contains send email module
    */
    private openModalSendEmail(template: TemplateRef<any>, id?: number) {
        this.modalRef = this.modalService.show(template, { class: 'modal-add-task', backdrop: 'static', 'keyboard': false })
    }

}