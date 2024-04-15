import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription ,  Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SiteInformationServices } from './siteInformation.services';
import { AddressTypeServices } from '../../../services/addressType.services';
import { CompanyServices } from '../../company/company.services';
import { ContactTitleServices } from '../../../services/contactTitle.services';
import { ContactServices } from '../../contact/contact.services';
import { OccuClasificationsServices } from '../../../services/OccuClassification.services';
import { ConstClasificationsServices } from '../../../services/ConstClassification.services';
import { multipleDwellingClassificationsServices } from '../../../services/MultiDwellingClassifications.services';
import { PrimaryStructuralSystemsServices } from '../../primarystructuralsystems/primarystructuralsystems.services';
import { StructureOccupancyCategoriesServices } from '../../structureoccupancycategories/structureoccupancycategories.services';
import { SeismicDesignCategoriesServices } from '../../seismicdesigncategories/seismicdesigncategories.services';
import { BoroughServices } from '../../../services/borough.services';
import { JobServices } from '../../job/job.services';

import { rfpAddress } from '../../../types/rfpAddress';

import { AddressType } from '../../../types/address';
import { CompanyDTO, Company } from '../../../types/company';
import { Contact } from '../../../types/contact';
import { Job } from '../../../types/job';
import { ContactTitle } from '../../../types/contactTitle';
import { occupancyClasifications, constructionClassifications, multipleDwellingClassifications, primaryStructuralSystems, structureOccupancyCategories, seismicDesignCategories } from '../../../types/classifications';
import { rfp } from '../../../types/rfp';
import { borough } from '../../../types/borough';
import { ScopeReview } from '../../../types/scopereview';
import { proposalReview } from '../../../types/proposalReview';
import { Message } from '../../../app.messages';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'underscore';
import { ComponentCanDeactivate } from '../../../components/appSaveLeave/guard';
import { HostListener } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { StateServices } from '../../../services/state.services';
import { State } from '../../../types/state';
import { RfpListService } from '../../rfp/rfp.services';
import { UserRightServices } from '../../../services/userRight.services';
import { constantValues } from '../../../app.constantValues';
import { OwnerType } from '../../ownertype/ownerType';
import { OwnerTypeServices } from '../../ownertype/ownertype.services';
import * as moment from 'moment';

declare const $: any

/**
  * SiteInformationComponent class contains all function that are used in RFP step 1 
  * @class SiteInformationComponent
  */
@Component({
    templateUrl: './siteInformation.component.html',
    styleUrls: ['./siteInformation.component.scss']
})
export class SiteInformationComponent implements ComponentCanDeactivate {
    /**
     * Site information form
     * @property siteForm
     */
    @ViewChild('siteForm',{static: true}) form: any;

    /**
     * It will open new RFP address form popup
     * @property formAddNewAddress
     */
    @ViewChild('formAddNewAddress',{static: true})
    private formCompany: TemplateRef<any>

    /**
     * It will open view RFP address pouup
     * @property formAddNewAddress
     */
    @ViewChild('viewAddress',{static: true})
    private viewAddress: TemplateRef<any>

    /**
     * It will open popup when click on existing Job
     * @property addRelatedJob
     */
    @ViewChild('addRelatedJob',{static: true})
    private addRelatedJob: TemplateRef<any>

    /**
     * It will open RFP progession note popup
     * @property rfpprogressionnote
     */
    @ViewChild('rfpprogressionnote',{static: true})
    private rfpprogressionnote: TemplateRef<any>

    /**
    * It will open popup on select of get info in add address popup
    * @property viewAddressList
    */
    @ViewChild('viewAddressList',{static: true})
    private viewAddressList: TemplateRef<any>
    modalRefAddress: BsModalRef
    addressList: any = []

    companies: Company[] = []
    boroughs: borough[] = []
    modalRef: BsModalRef
    selectUndefinedOptionValue: any;
    rfpAddressList: rfpAddress[] = []
    private tmprfpAddress: rfpAddress[] = []
    private jobObj: Job
    private sub: any;
    private selectedRfpAddress: any;
    rfpAddressRec: rfpAddress
    private addressTypes: AddressType[] = []
    private contactTitles: ContactTitle[] = []
    contacts: Contact[] = []
    SecondOfficerContact: Contact[] = []
    rfp: rfp
    private scopeReview: any
    private proposalReview: any
    occuClassifications: occupancyClasifications[] = []
    private alloccuClassifications: occupancyClasifications[] = []
    constructionClassifications: constructionClassifications[] = []
    private allConstructionClassifications: constructionClassifications[] = []
    multipleDwellingClassifications: multipleDwellingClassifications[] = []
    primaryStructuralSystems: primaryStructuralSystems[] = []
    structureOccupancyCategories: structureOccupancyCategories[] = []
    seismicDesignCategories: seismicDesignCategories[] = []
    rfpAddressdropdownList: any;
    errorMsg: any
    private slectecontact: number
    loading: boolean = false
    showNavigationTabs: boolean = false
    private showStep1: string = ''
    showStep2: string = ''
    showStep3: string = ''
    showStep4: string = ''
    showStep5: string = ''
    private contactList: any
    private contactListForEmail: any
    displayGetInfo: boolean = false
    private boroughName: string
    id: number
    loadingaddress: boolean = false
    formNotChanged = true
    private getAddressId: any
    private states: State[] = []
    private hasZipInAddress: boolean = false
    addresseeContactsList: any
    receipientContactsList: any
    referedByContactsList: any
    addAddContactsList: any
    static currentVM: any
    showRfpAddBtn: string = 'hide'
    private showRfpViewBtn: string = 'hide'
    private showRfpDeleteBtn: string = 'hide'
    showAddressAddBtn: string = 'hide'
    private documents: any = []
    ownerTypes: OwnerType[] = []
    isSecondOfficerRequire: boolean = false;
    setVM(vm1: any) {
        SiteInformationComponent.currentVM = vm1
    }
    private rfpMainDetail: any = {}
    createdBy: string
    modifiedBy: string
    isOutsideNYC:boolean =false
    // @HostListener allows us to also guard against browser refresh, close, etc.
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        // insert logic to check if there are pending changes here;
        // returning true will navigate without confirmation
        // returning false will show a confirm dialog before navigating away
        return this.formNotChanged
    }

    /**
     * This method define all services that requires in whole class
     * @method constructor
     */
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private modalService: BsModalService,
        private addressTypeServices: AddressTypeServices,
        private companyService: CompanyServices,
        private contactTitlesServices: ContactTitleServices,
        private contactService: ContactServices,
        private OccuClasificationsServices: OccuClasificationsServices,
        private ConstClasificationsServices: ConstClasificationsServices,
        private multipleDwellingClassificationsServices: multipleDwellingClassificationsServices,
        private PrimaryStructuralSystemsServices: PrimaryStructuralSystemsServices,
        private StructureOccupancyCategoriesServices: StructureOccupancyCategoriesServices,
        private SeismicDesignCategoriesServices: SeismicDesignCategoriesServices,
        private SiteInformationServices: SiteInformationServices,
        private toastr: ToastrService,
        private boroughServices: BoroughServices,
        private message: Message,
        private appComponent: AppComponent,
        private jobServices: JobServices,
        private stateServices: StateServices,
        private rfpListService: RfpListService,
        private userRight: UserRightServices,
        private constantValues: constantValues,
        private ownerTypeServices: OwnerTypeServices,
    ) {
        this.errorMsg = this.message.msg;
        this.permission(this.constantValues)
    }

    /**
    * This method will call when step 1 form loads first time
    * @method ngOnInit
    */
    ngOnInit() {
        // this.rfpAddressdropdownList = [];
        document.title = 'RFP'
        this.showRfpAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDRFP)
        this.showRfpViewBtn = this.userRight.checkAllowButton(this.constantValues.VIEWRFP)
        this.showRfpDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETERFP)


        var vm = this;
        this.setVM(vm);
        this.rfp = {} as rfp;
        this.getRfpAddress();
        this.getBoroughs();
        this.getCompanies();
        this.telephoneVal();
        this.getStates();

        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            if (this.id > 0) {
                this.rfp.id = this.id;
                this.loading = true;
                this.getRfpByRfpId();
            } else {
                this.rfp.id = 0;
                this.showNavigationTabs = false

            }
        });
        this.getContacts();
        this.loading = true


        // setTimeout(() => {
        //     this.loading = false;
        // }, 7000);
    }

    /**
    * This method reroute user
    * @method saveOnHeader
    * @param{stepName} name of the Step
    */
    saveOnHeader(stepNo: string) {
        this.saveStep1SiteInfo(false, stepNo)
    }


    /**
    * This method check permission for address
    * @method permission
    * @param{constantValues} data request Object
    */
    permission(constantValues: any) {
        //checking permission of company
        this.showAddressAddBtn = this.userRight.checkAllowButton(constantValues.ADDADDRESS)
        this.showRfpAddBtn = this.userRight.checkAllowButton(constantValues.ADDRFP)
        if (this.showRfpAddBtn == 'hide') {
            setTimeout(function () {
                this.showAddressAddBtn = 'hide'
                $(".wizard-body").addClass("disabled");
                $(".wizard-body .form-control, .wizard-body input[type='checkbox'], .wizard-body input[type='radio'], .wizard-body .btn, .savebtn").attr("disabled", "disabled");
            }, 500);
        }
    }
    /**
     * It will check any element in site information form changed or not
     * @method isFieldValChange
     */
    isFieldValChange() {
        // if (this.form.dirty) {
        this.formNotChanged = false
        // this.formatPhone()
        // }
    }

    /**
     * This method get rfp details from RFPId
     * @method getRfpByRfpId
     */
    private getRfpByRfpId() {
        this.rfpListService.getById(this.id).subscribe(r => {
            this.getRFPCreatorDetail(r);
        })
    }

    /**
     * This method will get RFP creator and modified user detail of give RFP record
     * @method getRFPCreatorDetail
     * @param {Object} rfpDetail request object
     */
    private getRFPCreatorDetail(rfpDetail: any) {

        // get Whole RFP detail
        this.rfpMainDetail = rfpDetail;
        // update Address Dropdown based on selected contact
        this.SiteInformationServices.getAllAddressforForm(null, this.rfpMainDetail.idContact).subscribe(r => {
            this.selectedRfpAddress = r;
            this.rfpAddressdropdownList = [
                { id: this.selectedRfpAddress[0].id, itemName: '[' + this.selectedRfpAddress[0].addressType.name + '] ' + this.selectedRfpAddress[0].address1 + ', ' + (this.selectedRfpAddress[0].address2 != null ? this.selectedRfpAddress[0].address2 + ', ' : "") + (this.selectedRfpAddress[0].city != null ? this.selectedRfpAddress[0].city + ', ' : "") + this.selectedRfpAddress[0].state + ' ' + (this.selectedRfpAddress[0].zipCode != null ? this.selectedRfpAddress[0].zipCode : "") + '|' + (this.selectedRfpAddress[0].phone ? this.selectedRfpAddress[0].phone : (this.selectedRfpAddress[0].workPhone ? this.selectedRfpAddress[0].workPhone : '-')) }
            ]
            for (let i = 1; i < this.selectedRfpAddress.length; i++) {
                this.rfpAddressdropdownList.push({ id: this.selectedRfpAddress[i].id, itemName: '[' + this.selectedRfpAddress[i].addressType.name + '] ' + this.selectedRfpAddress[i].address1 + ', ' + (this.selectedRfpAddress[i].address2 != null ? this.selectedRfpAddress[i].address2 + ', ' : "") + (this.selectedRfpAddress[i].city != null ? this.selectedRfpAddress[i].city + ', ' : "") + this.selectedRfpAddress[i].state + ' ' + (this.selectedRfpAddress[i].zipCode != null ? this.selectedRfpAddress[i].zipCode : "") + '|' + (this.selectedRfpAddress[i].phone ? this.selectedRfpAddress[i].phone : (this.selectedRfpAddress[i].workPhone ? this.selectedRfpAddress[i].workPhone : '-')) });
            }
            this.loading = false
        }, e => {
            this.loading = false
        })
        // for created by
        if (this.rfpMainDetail.createdByEmployee) {
            this.createdBy = this.rfpMainDetail.createdByEmployee;
        }
        if (this.rfpMainDetail.createdDate) {
            if (this.createdBy) {
                this.createdBy += " on " + moment(this.rfpMainDetail.createdDate).format('MM/DD/YYYY hh:mm A');
            } else {
                this.createdBy = moment(this.rfpMainDetail.createdDate).format('MM/DD/YYYY hh:mm A');
            }
        }

        // for modified by
        if (this.rfpMainDetail.lastModifiedByEmployee) {
            this.modifiedBy = this.rfpMainDetail.lastModifiedByEmployee;
        }
        if (this.rfpMainDetail.lastModifiedDate) {
            if (this.createdBy) {
                this.modifiedBy += " on " + moment(this.rfpMainDetail.lastModifiedDate).format('MM/DD/YYYY hh:mm A');
            } else {
                this.modifiedBy = moment(this.rfpMainDetail.lastModifiedDate).format('MM/DD/YYYY hh:mm A');
            }
        }
    }

    /**
     * This method will decide that "Get Info" button should display or not in add new RFP address form
     * @method checkBisAddressInfo
     */
    checkBisAddressInfo(formChanged: string) {
        this.isOutsideNYC = false;
        if (formChanged == 'formChanged') {
            this.rfpAddressRec.zipCode = '';
            this.rfpAddressRec.binNumber = '';
            this.rfpAddressRec.lot = '';
            this.rfpAddressRec.block = '';
            this.rfpAddressRec.comunityBoardNumber = '';
            this.rfpAddressRec.zoneDistrict = '';
            this.rfpAddressRec.specialDistrict = '';
            this.rfpAddressRec.overlay = '';
            this.rfpAddressRec.map = '';
            this.rfpAddressRec.idOwnerType = null;
            this.rfpAddressRec.ownerContact = null;
            this.rfpAddressRec.idOwnerContact = null;
            this.rfpAddressRec.idOwnerType = null;
            this.rfpAddressRec.nonProfit = null;
            this.rfpAddressRec.idCompany = null;
            this.rfpAddressRec.idSecondOfficerCompany = null;
            this.rfpAddressRec.idSecondOfficer = null;
            this.rfpAddressRec.idOccupancyClassification = null;
            this.rfpAddressRec.isOcupancyClassification20082014 = null;
            this.rfpAddressRec.isConstructionClassification20082014 = null;
            this.rfpAddressRec.idConstructionClassification = null;
            this.rfpAddressRec.idMultipleDwellingClassification = null;
            this.rfpAddressRec.idPrimaryStructuralSystem = null;
            this.rfpAddressRec.primaryStructuralSystem = null;
            this.rfpAddressRec.idStructureOccupancyCategory = null;
            this.rfpAddressRec.idSeismicDesignCategory = null;
            this.rfpAddressRec.stories = null;
            this.rfpAddressRec.height = null;
            this.rfpAddressRec.feet = null;
            this.rfpAddressRec.dwellingUnits = null;
            this.rfpAddressRec.grossArea = null;
            this.rfpAddressRec.streetLegalWidth = null;
            this.rfpAddressRec.isLandmark = null;
            this.rfpAddressRec.isLittleE = null;
            this.rfpAddressRec.tidalWetlandsMapCheck = null;
            this.rfpAddressRec.coastalErosionHazardAreaMapCheck = null;
            this.rfpAddressRec.specialFloodHazardAreaCheck = null;
            this.rfpAddressRec.freshwaterWetlandsMapCheck = null;
        }
        if(this.rfpAddressRec.idBorough == 6)
        {
            this.isOutsideNYC = true;
        }
        if (this.rfpAddressRec.idBorough && this.rfpAddressRec.houseNumber && this.rfpAddressRec.street) {
            this.displayGetInfo = true
            this.boroughName = this.boroughs.filter(x => x.id == this.rfpAddressRec.idBorough)[0].description
        } else {
            this.displayGetInfo = false
        }
    }

    /**
     * This method will get information from BIS site and display in RFP add new address form
     * @method getBisAddressInfo
     */
    getBisAddressInfo() {
        let requestParams = {
            houseNumber: this.rfpAddressRec.houseNumber.trim(),
            streetName: this.rfpAddressRec.street.trim(),
            borough: this.boroughName.trim(),
        }
        this.loadingaddress = true
        this.SiteInformationServices.getBisAddresInfo(requestParams).subscribe(address => {
            this.loadingaddress = false
            if (address && address.length > 0) {
                this.addressList = address;
                this.openModalAddressList(this.viewAddressList);
            } else {
                this.toastr.info(this.errorMsg.noAddressFound)
            }
        })
    }

    /**
    * This method convert given string into pascal case (e.g = Rpo App)
    * @method toTitleCase
    * @param{string} str request string
    */
    private toTitleCase(str: string) {
        return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    }

    /**
    * This method updates fields in add address form on click on get info button
    * @method updateFormFieldsFromGetInfo
    * @param {Object} address request Object
    */
    updateFormFieldsFromGetInfo(address: any) {
        let stringToSplit = address.bisAddress;
        let x = stringToSplit.split(" ");
        x.splice(0, 1);
        let joinStreet = x.join(" ");
        this.rfpAddressRec.houseNumber = address.houseNumber
        // this.rfpAddressRec.street = this.toTitleCase(joinStreet);
        this.rfpAddressRec.binNumber = address.bin
        this.rfpAddressRec.block = address.block
        this.rfpAddressRec.comunityBoardNumber = address.communityBoard
        this.rfpAddressRec.dwellingUnits = address.dwellingUnits
        this.rfpAddressRec.grossArea = address.grossArea
        this.rfpAddressRec.isLandmark = address.landmark
        this.rfpAddressRec.isLittleE = address.little_E
        this.rfpAddressRec.lot = address.lot
        this.rfpAddressRec.map = address.map
        this.rfpAddressRec.overlay = address.overlays
        this.rfpAddressRec.specialDistrict = this.toTitleCase(address.specialDistrict)
        this.rfpAddressRec.stories = address.strories
        this.rfpAddressRec.zipCode = address.zip
        this.rfpAddressRec.zoneDistrict = address.zoneDistrinct
        this.rfpAddressRec.freshwaterWetlandsMapCheck = address.freshwaterWetlandsMapCheck
        this.rfpAddressRec.specialFloodHazardAreaCheck = address.specialFloodHazardAreaCheck
        this.rfpAddressRec.tidalWetlandsMapCheck = address.tidalWetlandsMapCheck
        this.rfpAddressRec.coastalErosionHazardAreaMapCheck = address.coastalErosionHazardAreaMapCheck
    }

    /**
    * This method open address list popup if there are multiple matching address while click on get info
    * @method openModalAddressList
    * @param {TemplateRef} template request Object
    */
    private openModalAddressList(template: TemplateRef<any>) {
        this.modalRefAddress = this.modalService.show(template, { class: 'modal-address-list' })
    }

    /**
     * This method get all information on selection of existing job and set in RFP step 1 fields
     * @method receiveJobId
     * @param {job} jobObj response object 
     */
    receiveJobId(jobObj: Job) {
        this.rfpAddressdropdownList = [];
        this.addresseeContactsList = [];
        this.jobObj = jobObj
        this.rfp.idCompany = this.jobObj.idCompany
        this.rfp.idContact = this.jobObj.idContact
        this.rfp.idRfpAddress = this.jobObj.idRfpAddress
        this.rfp.idBorough = this.jobObj.idBorough
        this.rfp.houseNumber = this.jobObj.houseNumber
        this.rfp.streetNumber = this.jobObj.streetNumber
        this.rfp.floorNumber = this.jobObj.floorNumber
        this.rfp.apartment = this.jobObj.apartment
        this.rfp.specialPlace = this.jobObj.specialPlace
        this.rfp.block = this.jobObj.block
        this.rfp.lot = this.jobObj.lot
        this.rfp.hasLandMarkStatus = this.jobObj.hasLandMarkStatus
        this.rfp.hasEnvironmentalRestriction = this.jobObj.hasEnvironmentalRestriction
        this.rfp.hasOpenWork = this.jobObj.hasOpenWork
        if (this.jobObj.idCompany && !this.jobObj.idContact) {
            this.getContactsFromCompany(this.rfp.idCompany, 'addressee', true, SiteInformationComponent.currentVM);
        } else if (!this.jobObj.idCompany && this.jobObj.idContact) {
            this.setContactDetail(SiteInformationComponent.currentVM);
            this.getContactsFromCompany(null, 'all', true, SiteInformationComponent.currentVM);
        }
        if (this.jobObj.idContact && this.jobObj.idCompany) {
            this.getContactsFromCompany(this.rfp.idCompany, 'addressee', true, SiteInformationComponent.currentVM);
            this.setContactDetail(SiteInformationComponent.currentVM);
        } else {
            // this.rfp.idContact = null
        }
        this.loading = false;
    }

    /**
     * This method will get RFP address detail and set in step 1 fields
     * @method getRfpAddress
     */
    getRfpAddress() {
        this.SiteInformationServices.getRfpAddressDropdown().subscribe(r => {
            this.tmprfpAddress = r;
            this.rfpAddressList = r
            if (this.getAddressId) {
                this.setAddressData()
            }
            // this.loading = false
        })
    }

    getBack() {
        this.router.navigate(['/rfp'])
    }

    /**
     * This method will get all comapny list
     * @method getCompanies
     */
    private getCompanies() {
        if (!this.companies.length) {
            this.companyService.getCompanyDropdown().subscribe(r => {
                this.companies = _.sortBy(r, "itemName");
                this.getContactsFor2ndOfficer()
            })
        }
    }
    /**
     * This method will get rfp info while edit
     * @method getRfpDetail
     */
    private getRfpDetail() {
        this.SiteInformationServices.getSiteInformation(this.id).subscribe(r => {
            document.title = "RFP# " + r.rfpNumber;
            this.rfp = r
            this.rfp.documentsToDelete = [];
            this.getHeaderStatus()
            this.setEmail();
            // this.loading = false
            this.showNavigationTabs = true
            if (this.rfp.idCompany) {
                this.getContactsFromCompany(this.rfp.idCompany, 'addressee', false);
            }
            if (this.rfp.idReferredByCompany) {
                this.getContactsFromCompany(this.rfp.idReferredByCompany, 'referBy');
            }

        })
    }

    setEmail() {
        this.receipientContactsList = this.contacts.filter(x => x.id == this.rfp.idContact);
        if (this.receipientContactsList.length > 0) {
            this.rfp.email = this.receipientContactsList[0].email;
        } else {
            this.rfp.email = null;
        }
    }

    /**
     * This method will set company contacts while create Proposal from Proposal Address
     * @method setComContactDetailFromAddress
     */
    private setComContactDetailFromAddress() {
        this.getAddressId = this.route.snapshot.paramMap.get("idAddress")
        let companyId = this.route.snapshot.paramMap.get("idCompany")
        let contactId = this.route.snapshot.paramMap.get("idContact")
        if (companyId) {
            this.rfp.idCompany = parseInt(companyId)
            this.getContactsFromCompany(this.rfp.idCompany, 'addressee', true);
        }
        if (contactId) {
            this.rfp.idContact = parseInt(contactId)
            this.setContactDetail()
        }
        if (this.getAddressId) {
            this.rfp.idRfpAddress = parseInt(this.getAddressId)
            this.setAddressData();
        }
    }

    /**
     * This method will get all contacts list
     * @method getContacts
     */
    getAllContacts(type?: string, companyId?: number) {
        console.log(this.contacts)
        this.loading = true;
        this.contactService.getrfpContactDropdown().subscribe(r => {
            this.contacts = _.sortBy(r, function (i) { return i['itemName'].toLowerCase(); });
          
            if (this.contacts.length > 0) {
                if (companyId == null) {
                    this.addresseeContactsList = this.contacts.filter(x => x.idCompany == companyId);
                    this.receipientContactsList = this.contacts.filter(x => x.id == this.rfp.idContact);
                    if (this.receipientContactsList.length > 0) {
                        this.rfp.email = this.receipientContactsList[0].email;
                    } else {
                        this.rfp.email = null;
                    }
                }
                this.loading = false;
            }



            if (!type) {
                this.getContactsFromCompany(null, 'all');
                if (this.id) {
                    this.getRfpDetail();
                }
                this.setComContactDetailFromAddress();
            }
        }, e => {
            this.loading = false;
        })
    }
    getAllActiveContacts(type?: string, companyId?: number) {
        console.log(this.contacts)
        // this.loading = true;
        this.contactService.getrfpContactDropdown().subscribe(r => {
            this.contacts = _.sortBy(r, function (i) { return i['itemName'].toLowerCase(); });
            if (this.contacts.length > 0) {
                this.addresseeContactsList = this.contacts.filter(x => x.idCompany == companyId);
                this.receipientContactsList = this.contacts.filter(x => x.id == this.rfp.idContact);

                if (this.receipientContactsList.length > 0) {
                    this.rfp.email = this.receipientContactsList[0].email;
                } else {
                    this.rfp.email = null;
                }

                this.loading = false;
            }
            if (!type) {
                this.getContactsFromCompany(null, 'all');
                if (this.id) {
                    this.getRfpDetail();
                }
                this.setComContactDetailFromAddress();
            }

        }, e => {
            this.loading = false;
        })
    }

    /**
     * This method will get all contacts list
     * @method getContacts
     */
    private getContacts() {
        console.log(this.id)
        this.loading = false
        if (!this.loading) {
            this.loading = true
        }
        if (this.id > 0) {
            console.log("callgetAllContacts")
            this.getAllContacts();
        } else {
            this.getAllActiveContacts();
            console.log("getAllActiveContacts")

        }


    }

    /**
  *  Get contacts data for dropdown based on company
  * @method getContacts
  */
    getContactsFor2ndOfficer() {
        this.SecondOfficerContact = [] as Contact[]
        let companyId = -1
        if (this.rfpAddressRec && this.rfpAddressRec.idSecondOfficerCompany) {
            companyId = this.rfpAddressRec.idSecondOfficerCompany
        }
        this.companyService.getContactOfComDD(companyId).subscribe(r => {
            if (r && r.length > 0) {
                this.SecondOfficerContact = _.sortBy(r, function (i) { return i['itemName'].toLowerCase(); });
            }
        })
    }

    /**
    * This method get contact list based on company selection
    * @method getContactsFromCompany
    * @param {number} companyId? company id
    *
    */
    getContactsFromCompany(companyId?: number, forContact?: string, isAddressFromCmp?: boolean, currentVM?: any) {
        if (forContact == 'addressee') {
            this.addresseeContactsList = []
        }

        if (companyId && forContact == 'addressee' && isAddressFromCmp) {
            this.rfp.idContact = null;
            this.rfpAddressdropdownList = [];
            this.rfp.idClientAddress = null;
            this.rfp.phone = ""
            this.rfp.email = ""
            this.rfp.address1 = ""
            this.rfp.address2 = ""
            this.rfp.city = ""
            this.rfp.idState = null
            if (!this.hasZipInAddress) {
                this.rfp.zipCode = ""
            }
            this.contacts = [];
            this.getAllActiveContacts('notLoad', companyId)
        }
        // this.loading = true;
        if (!companyId && forContact == 'addressee') {
            this.rfp.idClientAddress = null;
            this.rfpAddressdropdownList = [];
            companyId = null
            this.contacts = [];
            this.rfp.idContact = null;
            this.getAllActiveContacts('notLoad', companyId)
            // if(this.id > 0){
            //     this.getAllActiveContacts('notLoad', companyId)
            // }else{
            //     // this.getAllContacts('notLoad', companyId)
            // }

        }
        // FOR THE ADDRESSES DROP DOWN
        if (this.rfp.idContact) {
            this.slectecontact = this.rfp.idContact
        } else {

        }
        if (!currentVM && forContact == 'addressee') {
            this.SiteInformationServices.getAllAddressforForm(companyId, this.slectecontact).subscribe(r => {
                this.selectedRfpAddress = r;
                this.rfpAddressdropdownList = [
                    { id: this.selectedRfpAddress[0].id, itemName: '[' + this.selectedRfpAddress[0].addressType.name + '] ' + this.selectedRfpAddress[0].address1 + ', ' + (this.selectedRfpAddress[0].address2 != null ? this.selectedRfpAddress[0].address2 + ', ' : "") + (this.selectedRfpAddress[0].city != null ? this.selectedRfpAddress[0].city + ', ' : "") + this.selectedRfpAddress[0].state + ' ' + (this.selectedRfpAddress[0].zipCode != null ? this.selectedRfpAddress[0].zipCode : "") + '|' + (this.selectedRfpAddress[0].phone ? this.selectedRfpAddress[0].phone : (this.selectedRfpAddress[0].workPhone ? this.selectedRfpAddress[0].workPhone : '-')) }
                ]
                for (let i = 1; i < this.selectedRfpAddress.length; i++) {
                    this.rfpAddressdropdownList.push({ id: this.selectedRfpAddress[i].id, itemName: '[' + this.selectedRfpAddress[i].addressType.name + '] ' + this.selectedRfpAddress[i].address1 + ', ' + (this.selectedRfpAddress[i].address2 != null ? this.selectedRfpAddress[i].address2 + ', ' : "") + (this.selectedRfpAddress[i].city != null ? this.selectedRfpAddress[i].city + ', ' : "") + this.selectedRfpAddress[i].state + ' ' + (this.selectedRfpAddress[i].zipCode != null ? this.selectedRfpAddress[i].zipCode : "") + '|' + (this.selectedRfpAddress[i].phone ? this.selectedRfpAddress[i].phone : (this.selectedRfpAddress[i].workPhone ? this.selectedRfpAddress[i].workPhone : '-')) });
                }
                this.loading = false
            }, e => {
                this.loading = false
            })
        }

        if (currentVM) {
            currentVM.SiteInformationServices.getAllAddressforForm(companyId, this.slectecontact).subscribe((r: any) => {
                this.selectedRfpAddress = r;
                this.rfpAddressdropdownList = [
                    { id: this.selectedRfpAddress[0].id, itemName: '[' + this.selectedRfpAddress[0].addressType.name + '] ' + this.selectedRfpAddress[0].address1 + ', ' + (this.selectedRfpAddress[0].address2 != null ? this.selectedRfpAddress[0].address2 + ', ' : "") + (this.selectedRfpAddress[0].city != null ? this.selectedRfpAddress[0].city + ', ' : "") + this.selectedRfpAddress[0].state + ' ' + (this.selectedRfpAddress[0].zipCode != null ? this.selectedRfpAddress[0].zipCode : "") + '|' + (this.selectedRfpAddress[0].phone ? this.selectedRfpAddress[0].phone : (this.selectedRfpAddress[0].workPhone ? this.selectedRfpAddress[0].workPhone : '-')) }
                ]
                for (let i = 1; i < this.selectedRfpAddress.length; i++) {
                    this.rfpAddressdropdownList.push({ id: this.selectedRfpAddress[i].id, itemName: '[' + this.selectedRfpAddress[i].addressType.name + '] ' + this.selectedRfpAddress[i].address1 + ', ' + (this.selectedRfpAddress[i].address2 != null ? this.selectedRfpAddress[i].address2 + ', ' : "") + (this.selectedRfpAddress[i].city != null ? this.selectedRfpAddress[i].city + ', ' : "") + this.selectedRfpAddress[i].state + ' ' + (this.selectedRfpAddress[i].zipCode != null ? this.selectedRfpAddress[i].zipCode : "") + '|' + (this.selectedRfpAddress[i].phone ? this.selectedRfpAddress[i].phone : (this.selectedRfpAddress[i].workPhone ? this.selectedRfpAddress[i].workPhone : '-')) });
                }
                this.loading = false
            }, (e: any) => {
                if (e['status'] == 404) {
                    this.loading = false;
                }
            })
            if (forContact == 'all') {
                currentVM.addresseeContactsList = this.contacts.filter(x => x.idCompany == companyId);
                currentVM.receipientContactsList = this.contacts.filter(x => x.idCompany == companyId);
                currentVM.referedByContactsList = this.contacts.filter(x => x.idCompany == companyId);
                currentVM.addAddContactsList = this.contacts.filter(x => x.idCompany == companyId);
            }
            if (forContact == 'addressee') {
                currentVM.addresseeContactsList = this.contacts.filter(x => x.idCompany == companyId);
                currentVM.receipientContactsList = this.contacts.filter(x => x.idCompany == companyId);
                currentVM.setComAddress(isAddressFromCmp);
            }
            if (forContact == 'referBy') {
                //this.rfp.idReferredByContact = null;
                currentVM.referedByContactsList = this.contacts.filter(x => x.idCompany == companyId);
            }
            if (forContact == 'addAddress') {
                currentVM.addAddContactsList = this.contacts.filter(x => x.idCompany == companyId);
            }
        } else {
            if (forContact == 'all') {
                this.addresseeContactsList = this.contacts.filter(x => x.idCompany == companyId);
                this.receipientContactsList = this.contacts.filter(x => x.idCompany == companyId);
                this.referedByContactsList = this.contacts.filter(x => x.idCompany == companyId);
                this.addAddContactsList = this.contacts.filter(x => x.idCompany == companyId);
            }
            if (forContact == 'addressee') {
                this.addresseeContactsList = this.contacts.filter(x => x.idCompany == companyId);
                this.receipientContactsList = this.contacts.filter(x => x.idCompany == companyId);
                this.setComAddress(isAddressFromCmp);
            }
            if (forContact == 'referBy') {
                //this.rfp.idReferredByContact = null;
                this.referedByContactsList = this.contacts.filter(x => x.idCompany == companyId);
            }
            if (forContact == 'addAddress') {
                this.addAddContactsList = this.contacts.filter(x => x.idCompany == companyId);
            }
        }
        this.loading = false;
    }


    /**
    * This method apply Single Address to the RFP
    * @method setSingleRFPAddress
    */
    setSingleRFPAddress(selectedRFP: any) {
        if (selectedRFP != undefined) {
            const ClientAddress = SiteInformationComponent.currentVM.selectedRfpAddress.filter(
                (x: any) => x.id == selectedRFP)[0];
            // this.rfp.phone = ClientAddress.phone ? ClientAddress.phone : ClientAddress.workPhone;
            this.rfp.phone = ClientAddress.phone ? ClientAddress.phone : (ClientAddress.workPhone ? ClientAddress.workPhone : '');
            // this.rfp.email = ClientAddress.email


            this.rfp.address1 = ClientAddress.address1
            this.rfp.address2 = ClientAddress.address2
            this.rfp.city = ClientAddress.city
            this.rfp.idState = ClientAddress.idState
            if (!this.hasZipInAddress) {
                this.rfp.zipCode = ClientAddress.zipCode
            }
        } else {
            this.rfp.phone = ""
            this.rfp.address1 = ""
            this.rfp.address2 = ""
            this.rfp.city = ""
            this.rfp.idState = null
            this.rfp.idClientAddress = null
            if (!this.hasZipInAddress) {
                this.rfp.zipCode = ""
            }
        }
    }

    /**
    * This method apply telephone masking
    * @method telephoneVal
    */
    private telephoneVal() {
        $('.tele-number').mask('(000) 000-0000', {
            placeholder: '(   )    -    '
        })
        $('.tele-number').attr("pattern", "\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}$")

        setTimeout(() => {
            $("[autofocus]").focus()
        })
    }

    /**
     * This method will get all borough list
     * @method getBoroughs
     */
    private getBoroughs() {
        if (!this.boroughs.length) {
            this.boroughServices.getDropdownData().subscribe(r => {
                this.boroughs = _.sortBy(r, "description")
            })
        }
    }

    /**
     * This method will get all states
     * @method getStates
     */
    getStates() {
        if (!this.states.length) {
            this.stateServices.getDropdown().subscribe(r => {
                this.states = _.sortBy(r, 'name');
            })
        }
    }

    /**
     * This method will open add new address popup
     * @method openModal
     * @param {TemplateRef} template request object
     */
    openModal(template: TemplateRef<any>) {
        this.displayGetInfo = false
        this.modalRef = this.modalService.show(template, { class: 'modal-new-address', backdrop: 'static', 'keyboard': false })

        this.rfpAddressRec = {
            //addresses: []
        } as rfpAddress
        if (typeof this.rfpAddressRec.isOcupancyClassification20082014 == "undefined") {
            this.rfpAddressRec.isOcupancyClassification20082014 = false;
        }
        if (typeof this.rfpAddressRec.isConstructionClassification20082014 == "undefined") {
            this.rfpAddressRec.isConstructionClassification20082014 = false;
        }

        this.getCompanies();
        this.getContactsFromCompany(null, 'addAddress');
        this.getBoroughs();

        this.ownerTypeServices.getDropdownData().subscribe(r => {
            this.ownerTypes = _.sortBy(r, "name")
            this.set2ndOfficer();
        });

        if (!this.addressTypes.length) {
            this.addressTypeServices.getDropdownData().subscribe(r => {
                this.addressTypes = _.sortBy(r, "displayOrder")
            });
        }

        if (!this.contactTitles.length) {
            this.contactTitlesServices.getContactTitleDD().subscribe(r => {
                this.contactTitles = _.sortBy(r, "itemName")
            });
        }

        if (!this.occuClassifications.length) {
            this.OccuClasificationsServices.getDropdown().subscribe(r => {
                this.alloccuClassifications = r
                this.occuClassifications = this.alloccuClassifications.filter(x => x.is_2008_2014 == this.rfpAddressRec.isOcupancyClassification20082014);
            });
        }

        if (!this.constructionClassifications.length) {
            this.ConstClasificationsServices.getDropdown().subscribe(r => {
                this.allConstructionClassifications = r
                this.constructionClassifications = this.allConstructionClassifications.filter(x => x.is_2008_2014 == this.rfpAddressRec.isConstructionClassification20082014);
            });
        }
        if (!this.multipleDwellingClassifications.length) {
            this.multipleDwellingClassificationsServices.getDropdown().subscribe(r => {
                this.multipleDwellingClassifications = r
            });
        }
        if (!this.primaryStructuralSystems.length) {
            this.PrimaryStructuralSystemsServices.getDropdown().subscribe(r => {
                this.primaryStructuralSystems = r
            });
        }
        if (!this.structureOccupancyCategories.length) {
            this.StructureOccupancyCategoriesServices.getDropdown().subscribe(r => {
                this.structureOccupancyCategories = r
            });
        }
        if (!this.seismicDesignCategories.length) {
            this.SeismicDesignCategoriesServices.getDropdown().subscribe(r => {
                this.seismicDesignCategories = r
            });
        }
    }

    /**
  * This method will change options of occupancy dropdown based on 2008/2014 checkbox
  * @method setOccupancyDropDown
  */
    setOccupancyDropDown() {
        if (this.alloccuClassifications && this.alloccuClassifications.length > 0) {
            this.occuClassifications = this.alloccuClassifications.filter(x => x.is_2008_2014 == this.rfpAddressRec.isOcupancyClassification20082014);
        }
    }
    /**
     * This method will change options of constructor dropdown based on 2008/2014 checkbox
     * @method setOccupancyDropDown
     */
    setConstructorDropDown() {
        if (this.allConstructionClassifications && this.allConstructionClassifications.length > 0) {
            this.constructionClassifications = this.allConstructionClassifications.filter(x => x.is_2008_2014 == this.rfpAddressRec.isConstructionClassification20082014);
        }
    }


    /**
     * This method will open Job popup to select existing job 
     * @method selectJobModal
     * @param {TemplateRef} template request object
     */
    selectJobModal(template: TemplateRef<any>) {
        this.formNotChanged = false
        this.modalRef = this.modalService.show(template, { class: 'modal-add-related-job', backdrop: 'static', 'keyboard': false })
    }

    /**
     * This methos save add new Rfp Address form 
     * @method saveRfpAddress
     */
    saveRfpAddress() {
        const rec = cloneDeep(this.rfpAddressRec)
        this.SiteInformationServices.createRfpAddress(rec).subscribe(r => {
            const rfpAddress = r as any
            this.tmprfpAddress.push(rfpAddress)
            this.getRfpAddress()
            this.rfp.idRfpAddress = r.id
            this.rfp.houseNumber = r.houseNumber;
            this.rfp.streetNumber = r.street;
            this.rfp.block = r.block;
            this.rfp.lot = r.lot;
            this.rfp.hasLandMarkStatus = r.isLandmark;
            this.rfp.hasEnvironmentalRestriction = r.isLittleE;
            this.rfp.idBorough = r.idBorough;

            this.toastr.success('Record created successfully.')
            this.modalRef.hide()
        }, e => {
        })
    }

    /**
     * This method will set address 1,2 based on company selection
     * @method setComAddress
     * @param {boolean} isNew request flag that identify record is new or edit 
     */
    setComAddress(isNew?: boolean) {
        let selectedCompany: any = {}

        if (this.rfp.idCompany && isNew) {
            this.loading = true
            this.companyService.getById(this.rfp.idCompany).subscribe(r => {
                selectedCompany = r
                if (selectedCompany && selectedCompany.addresses.length > 0) {
                    this.rfp.address1 = selectedCompany.addresses[0].address1
                    this.rfp.address2 = selectedCompany.addresses[0].address2
                    this.rfp.city = selectedCompany.addresses[0].city
                    this.rfp.idState = selectedCompany.addresses[0].idState
                    if (!this.hasZipInAddress) {
                        this.rfp.zipCode = selectedCompany.addresses[0].zipCode
                    }

                }
                this.loading = false
            })
        } else {
            if (isNew) {
                this.rfp.address1 = ""
                this.rfp.address2 = ""
                this.rfp.city = ""
                this.rfp.idState = null
                if (!this.hasZipInAddress) {
                    this.rfp.zipCode = ""
                }
                // this.rfp.idContact = null
                this.rfp.email = ""
                this.rfp.phone = ""
            }
        }
    }

    /**
     * This methos Set Telephone and Email based on contact selection
     * @method setContactDetail
     */
    setContactDetail(currentVM?: any) {
        this.contacts = [];
        if (this.id > 0) {
            this.getAllActiveContacts('notLoad', this.rfp.idCompany)
        } else {
            console.log('notLoad');
            this.getAllContacts('notLoad', this.rfp.idCompany)
        }
        this.rfpAddressdropdownList = [];
        //   this.formNotChanged = true;
        let selectedContact: any = {};
        if (this.rfp.idCompany && !this.rfp.idContact) {
            this.rfp.idClientAddress = null
            this.rfp.email = '';
            this.rfp.phone = '';
            this.loading = true
            if (currentVM) {
                currentVM.SiteInformationServices.getAllAddressforForm(this.rfp.idCompany, null).subscribe((r: any) => {
                    this.selectedRfpAddress = r;
                    currentVM.selectedRfpAddress = r;
                    currentVM.rfpAddressdropdownList = [
                        { id: this.selectedRfpAddress[0].id, itemName: '[' + this.selectedRfpAddress[0].addressType.name + '] ' + this.selectedRfpAddress[0].address1 + ', ' + (this.selectedRfpAddress[0].address2 != null ? this.selectedRfpAddress[0].address2 + ', ' : "") + (this.selectedRfpAddress[0].city != null ? this.selectedRfpAddress[0].city + ', ' : "") + this.selectedRfpAddress[0].state + ' ' + (this.selectedRfpAddress[0].zipCode != null ? this.selectedRfpAddress[0].zipCode : "") + '|' + (this.selectedRfpAddress[0].phone ? this.selectedRfpAddress[0].phone : (this.selectedRfpAddress[0].workPhone ? this.selectedRfpAddress[0].workPhone : '-')) }
                    ]
                    for (let i = 1; i < this.selectedRfpAddress.length; i++) {
                        currentVM.rfpAddressdropdownList.push({ id: this.selectedRfpAddress[i].id, itemName: '[' + this.selectedRfpAddress[i].addressType.name + '] ' + this.selectedRfpAddress[i].address1 + ', ' + (this.selectedRfpAddress[i].address2 != null ? this.selectedRfpAddress[i].address2 + ', ' : "") + (this.selectedRfpAddress[i].city != null ? this.selectedRfpAddress[i].city + ', ' : "") + this.selectedRfpAddress[i].state + ' ' + (this.selectedRfpAddress[i].zipCode != null ? this.selectedRfpAddress[i].zipCode : "") + '|' + (this.selectedRfpAddress[i].phone ? this.selectedRfpAddress[i].phone : (this.selectedRfpAddress[i].workPhone ? this.selectedRfpAddress[i].workPhone : '-')) });
                    }
                    this.loading = false
                }, (e: any) => {
                    this.loading = false
                })
            } else {
                this.SiteInformationServices.getAllAddressforForm(this.rfp.idCompany, null).subscribe(r => {
                    this.selectedRfpAddress = r;
                    this.rfpAddressdropdownList = [
                        { id: this.selectedRfpAddress[0].id, itemName: '[' + this.selectedRfpAddress[0].addressType.name + '] ' + this.selectedRfpAddress[0].address1 + ', ' + (this.selectedRfpAddress[0].address2 != null ? this.selectedRfpAddress[0].address2 + ', ' : "") + (this.selectedRfpAddress[0].city != null ? this.selectedRfpAddress[0].city + ', ' : "") + this.selectedRfpAddress[0].state + ' ' + (this.selectedRfpAddress[0].zipCode != null ? this.selectedRfpAddress[0].zipCode : "") + '|' + (this.selectedRfpAddress[0].phone ? this.selectedRfpAddress[0].phone : (this.selectedRfpAddress[0].workPhone ? this.selectedRfpAddress[0].workPhone : '-')) }
                    ]
                    for (let i = 1; i < this.selectedRfpAddress.length; i++) {
                        this.rfpAddressdropdownList.push({ id: this.selectedRfpAddress[i].id, itemName: '[' + this.selectedRfpAddress[i].addressType.name + '] ' + this.selectedRfpAddress[i].address1 + ', ' + (this.selectedRfpAddress[i].address2 != null ? this.selectedRfpAddress[i].address2 + ', ' : "") + (this.selectedRfpAddress[i].city != null ? this.selectedRfpAddress[i].city + ', ' : "") + this.selectedRfpAddress[i].state + ' ' + (this.selectedRfpAddress[i].zipCode != null ? this.selectedRfpAddress[i].zipCode : "") + '|' + (this.selectedRfpAddress[i].phone ? this.selectedRfpAddress[i].phone : (this.selectedRfpAddress[i].workPhone ? this.selectedRfpAddress[i].workPhone : '-')) });
                    }
                    this.loading = false
                }, e => {
                    this.loading = false
                })
            }
        } else if (!this.rfp.idCompany && this.rfp.idContact) {
            this.loading = true
            if (currentVM) {
                currentVM.SiteInformationServices.getAllAddressforForm(null, this.rfp.idContact).subscribe((r: any) => {
                    this.selectedRfpAddress = r;
                    currentVM.selectedRfpAddress = r;
                    currentVM.rfpAddressdropdownList = [
                        { id: this.selectedRfpAddress[0].id, itemName: '[' + this.selectedRfpAddress[0].addressType.name + '] ' + this.selectedRfpAddress[0].address1 + ', ' + (this.selectedRfpAddress[0].address2 != null ? this.selectedRfpAddress[0].address2 + ', ' : "") + (this.selectedRfpAddress[0].city != null ? this.selectedRfpAddress[0].city + ', ' : "") + this.selectedRfpAddress[0].state + ' ' + (this.selectedRfpAddress[0].zipCode != null ? this.selectedRfpAddress[0].zipCode : "") + '|' + (this.selectedRfpAddress[0].phone ? this.selectedRfpAddress[0].phone : (this.selectedRfpAddress[0].workPhone ? this.selectedRfpAddress[0].workPhone : '-')) }
                    ]
                    for (let i = 1; i < this.selectedRfpAddress.length; i++) {
                        currentVM.rfpAddressdropdownList.push({ id: this.selectedRfpAddress[i].id, itemName: '[' + this.selectedRfpAddress[i].addressType.name + '] ' + this.selectedRfpAddress[i].address1 + ', ' + (this.selectedRfpAddress[i].address2 != null ? this.selectedRfpAddress[i].address2 + ', ' : "") + (this.selectedRfpAddress[i].city != null ? this.selectedRfpAddress[i].city + ', ' : "") + this.selectedRfpAddress[i].state + ' ' + (this.selectedRfpAddress[i].zipCode != null ? this.selectedRfpAddress[i].zipCode : "") + '|' + (this.selectedRfpAddress[i].phone ? this.selectedRfpAddress[i].phone : (this.selectedRfpAddress[i].workPhone ? this.selectedRfpAddress[i].workPhone : '-')) });
                    }
                    this.loading = false
                }, (e: any) => {
                    this.loading = false
                })
            } else {
                this.SiteInformationServices.getAllAddressforForm(null, this.rfp.idContact).subscribe(r => {
                    this.selectedRfpAddress = r;
                    this.rfpAddressdropdownList = [
                        { id: this.selectedRfpAddress[0].id, itemName: '[' + this.selectedRfpAddress[0].addressType.name + '] ' + this.selectedRfpAddress[0].address1 + ', ' + (this.selectedRfpAddress[0].address2 != null ? this.selectedRfpAddress[0].address2 + ', ' : "") + (this.selectedRfpAddress[0].city != null ? this.selectedRfpAddress[0].city + ', ' : "") + this.selectedRfpAddress[0].state + ' ' + (this.selectedRfpAddress[0].zipCode != null ? this.selectedRfpAddress[0].zipCode : "") + '|' + (this.selectedRfpAddress[0].phone ? this.selectedRfpAddress[0].phone : (this.selectedRfpAddress[0].workPhone ? this.selectedRfpAddress[0].workPhone : '-')) }
                    ]
                    for (let i = 1; i < this.selectedRfpAddress.length; i++) {
                        this.rfpAddressdropdownList.push({ id: this.selectedRfpAddress[i].id, itemName: '[' + this.selectedRfpAddress[i].addressType.name + '] ' + this.selectedRfpAddress[i].address1 + ', ' + (this.selectedRfpAddress[i].address2 != null ? this.selectedRfpAddress[i].address2 + ', ' : "") + (this.selectedRfpAddress[i].city != null ? this.selectedRfpAddress[i].city + ', ' : "") + this.selectedRfpAddress[i].state + ' ' + (this.selectedRfpAddress[i].zipCode != null ? this.selectedRfpAddress[i].zipCode : "") + '|' + (this.selectedRfpAddress[i].phone ? this.selectedRfpAddress[i].phone : (this.selectedRfpAddress[i].workPhone ? this.selectedRfpAddress[i].workPhone : '-')) });
                    }
                    this.loading = false
                }, e => {
                    this.loading = false
                })
            }
            this.receipientContactsList = this.contacts.filter(x => x.id == this.rfp.idContact);
            if (this.receipientContactsList.length > 0) {
                this.rfp.email = this.receipientContactsList[0].email;
            } else {
                this.rfp.email = null;
            }
        } else {
            this.rfp.phone = ""
            this.rfp.email = ""
            this.rfp.address1 = ""
            this.rfp.address2 = ""
            this.rfp.city = ""
            this.rfp.idState = null
            if (!this.hasZipInAddress) {
                this.rfp.zipCode = ""
            }
            if (this.rfp.idCompany && this.rfp.idContact) {
                this.rfp.idClientAddress = null
                let selectedCompany: any = {}
                this.loading = true
                if (currentVM) {
                    currentVM.SiteInformationServices.getAllAddressforForm(this.rfp.idCompany, this.rfp.idContact).subscribe((r: any) => {
                        this.selectedRfpAddress = r;
                        currentVM.selectedRfpAddress = r;
                        currentVM.rfpAddressdropdownList = [
                            { id: this.selectedRfpAddress[0].id, itemName: '[' + this.selectedRfpAddress[0].addressType.name + '] ' + this.selectedRfpAddress[0].address1 + ', ' + (this.selectedRfpAddress[0].address2 != null ? this.selectedRfpAddress[0].address2 + ', ' : "") + (this.selectedRfpAddress[0].city != null ? this.selectedRfpAddress[0].city + ', ' : "") + this.selectedRfpAddress[0].state + ' ' + (this.selectedRfpAddress[0].zipCode != null ? this.selectedRfpAddress[0].zipCode : "") + '|' + (this.selectedRfpAddress[0].phone ? this.selectedRfpAddress[0].phone : (this.selectedRfpAddress[0].workPhone ? this.selectedRfpAddress[0].workPhone : '-')) }
                        ]
                        for (let i = 1; i < this.selectedRfpAddress.length; i++) {
                            currentVM.rfpAddressdropdownList.push({ id: this.selectedRfpAddress[i].id, itemName: '[' + this.selectedRfpAddress[i].addressType.name + '] ' + this.selectedRfpAddress[i].address1 + ', ' + (this.selectedRfpAddress[i].address2 != null ? this.selectedRfpAddress[i].address2 + ', ' : "") + (this.selectedRfpAddress[i].city != null ? this.selectedRfpAddress[i].city + ', ' : "") + this.selectedRfpAddress[i].state + ' ' + (this.selectedRfpAddress[i].zipCode != null ? this.selectedRfpAddress[i].zipCode : "") + '|' + (this.selectedRfpAddress[i].phone ? this.selectedRfpAddress[i].phone : (this.selectedRfpAddress[i].workPhone ? this.selectedRfpAddress[i].workPhone : '-')) });
                        }
                        this.loading = false
                    }, (e: any) => {
                        if (e['status'] == 404) {
                            this.loading = false;
                        }

                    })

                } else {
                    this.SiteInformationServices.getAllAddressforForm(this.rfp.idCompany, this.rfp.idContact).subscribe(r => {
                        this.selectedRfpAddress = r;
                        this.rfpAddressdropdownList = [
                            { id: this.selectedRfpAddress[0].id, itemName: '[' + this.selectedRfpAddress[0].addressType.name + '] ' + this.selectedRfpAddress[0].address1 + ', ' + (this.selectedRfpAddress[0].address2 != null ? this.selectedRfpAddress[0].address2 + ', ' : "") + (this.selectedRfpAddress[0].city != null ? this.selectedRfpAddress[0].city + ', ' : "") + this.selectedRfpAddress[0].state + ' ' + (this.selectedRfpAddress[0].zipCode != null ? this.selectedRfpAddress[0].zipCode : "") + '|' + (this.selectedRfpAddress[0].phone ? this.selectedRfpAddress[0].phone : (this.selectedRfpAddress[0].workPhone ? this.selectedRfpAddress[0].workPhone : '-')) }
                        ]
                        for (let i = 1; i < this.selectedRfpAddress.length; i++) {
                            this.rfpAddressdropdownList.push({ id: this.selectedRfpAddress[i].id, itemName: '[' + this.selectedRfpAddress[i].addressType.name + '] ' + this.selectedRfpAddress[i].address1 + ', ' + (this.selectedRfpAddress[i].address2 != null ? this.selectedRfpAddress[i].address2 + ', ' : "") + (this.selectedRfpAddress[i].city != null ? this.selectedRfpAddress[i].city + ', ' : "") + this.selectedRfpAddress[i].state + ' ' + (this.selectedRfpAddress[i].zipCode != null ? this.selectedRfpAddress[i].zipCode : "") + '|' + (this.selectedRfpAddress[i].phone ? this.selectedRfpAddress[i].phone : (this.selectedRfpAddress[i].workPhone ? this.selectedRfpAddress[i].workPhone : '-')) });
                        }
                        this.loading = false
                    }, e => {
                        this.loading = false;
                    })
                }

                this.receipientContactsList = this.contacts.filter(x => x.id == this.rfp.idContact);
                if (this.receipientContactsList.length > 0) {
                    this.rfp.email = this.receipientContactsList[0].email;
                } else {
                    this.rfp.email = null;
                }

            } else {
                this.loading = false
            }
        }
    }

    /**
     * This methis set step 1 address fields on selection of RFP address
     * @method setAddressData
     */
    setAddressData() {
        let addressDetail = this.rfpAddressList.filter(x => x.id == this.rfp.idRfpAddress)[0];
        let address = this.tmprfpAddress.filter(x => x.id == this.rfp.idRfpAddress)[0];;
        if (addressDetail) {
            if (address.houseNumber != "") {
                this.rfp.houseNumber = address.houseNumber;
            }
            if (address.street != "") {
                this.rfp.streetNumber = address.street;
            }
            if (address.block != "") {
                this.rfp.block = address.block;
            }
            if (address.lot != "") {
                this.rfp.lot = address.lot;
            }
            if (address.isLandmark) {
                this.rfp.hasLandMarkStatus = address.isLandmark;
            }
            if (address.isLittleE) {
                this.rfp.hasEnvironmentalRestriction = address.isLittleE;
            }
            if (address.idBorough) {
                this.rfp.idBorough = address.idBorough;
            }
        }

        // while remove address
        if (typeof addressDetail == "undefined") {
            this.rfp.idBorough = 0
            this.rfp.houseNumber = "";
            this.rfp.streetNumber = "";
            this.rfp.block = "";
            this.rfp.lot = "";
            this.rfp.hasLandMarkStatus = false;
            this.rfp.hasEnvironmentalRestriction = false;
        }
    }

    /**
    * This method will open view address popup on click of icon besides RFP address dropdown
    * @method viewAddressModal
    * @param {TemplateRef} template request Object
    * @param {number} id? ID of address
    */
    viewAddressModal(template: TemplateRef<any>, id?: number) {
        this.modalRef = this.modalService.show(template, { class: 'modal-new-address', backdrop: 'static', 'keyboard': false })
    }


    setAddressType() {
        this.rfpAddressRec.addressType = this.addressTypes.filter(x => x.id == this.rfpAddressRec.idAddressType)[0];
    }

    setCompany() {
        this.rfpAddressRec.company = this.companies.filter(x => x.id == this.rfpAddressRec.idCompany)[0];
    }

    setContact() {
        this.rfpAddressRec.ownerContact = this.contacts.filter(x => x.id == this.rfpAddressRec.idOwnerContact)[0];
    }

    setOccupancyClassification() {
        this.rfpAddressRec.occupancyClassification = this.occuClassifications.filter(x => x.id == this.rfpAddressRec.idOccupancyClassification)[0];
    }
    setConstructionClassifications() {
        this.rfpAddressRec.constructionClassification = this.constructionClassifications.filter(x => x.id == this.rfpAddressRec.idConstructionClassification)[0];
    }
    setmultipleDwellingClassifications() {
        this.rfpAddressRec.multipleDwellingClassification = this.multipleDwellingClassifications.filter(x => x.id == this.rfpAddressRec.idMultipleDwellingClassification)[0];
    }
    setprimaryStructuralSystems() {
        this.rfpAddressRec.primaryStructuralSystem = this.primaryStructuralSystems.filter(x => x.id == this.rfpAddressRec.idPrimaryStructuralSystem)[0];
    }
    setstructureOccupancyCategories() {
        this.rfpAddressRec.structureOccupancyCategory = this.structureOccupancyCategories.filter(x => x.id == this.rfpAddressRec.idStructureOccupancyCategory)[0];
    }
    setseismicDesignCategories() {
        this.rfpAddressRec.seismicDesignCategory = this.seismicDesignCategories.filter(x => x.id == this.rfpAddressRec.idSeismicDesignCategory)[0];
    }

    /**
     * This methos save Step1 Site information in database
     * @method saveStep1SiteInfo
     * @param {boolean} isSaveAndExit? save&exist button pressed or not
     */
    saveStep1SiteInfo(isSaveAndExit?: boolean, stepName?: string) {
        this.formNotChanged = true
        this.loading = true
        const rec = cloneDeep(this.rfp)
        
        rec.lastUpdatedStep = 1
        if (this.showRfpAddBtn == 'show') {
            if (this.rfp.id > 0) {

                this.SiteInformationServices.updateSiteInformation(rec, this.rfp.id).subscribe(r => {
                    if (!this.documents) {
                        this.loading = false
                    }
                    let chkPromise = this.uploadDocuments(r.id)
                    chkPromise.then(value => {
                        this.loading = false
                        this.toastr.success('Site information updated successfully');
                        if (!isSaveAndExit && !stepName) {
                            this.router.navigate(['/projectDetails', this.rfp.id])
                        } else if (!isSaveAndExit && stepName) {
                            this.router.navigate([stepName, this.rfp.id])
                        } else if (isSaveAndExit) {
                            this.router.navigate(['/rfp'])
                        }
                    })


                }, e => {
                    this.loading = false;
                })
            } else {
                this.SiteInformationServices.addSiteInformation(rec).subscribe(r => {
                    if (!this.documents) {
                        this.loading = false
                    }

                    let chkPromise = this.uploadDocuments(r.id)
                    chkPromise.then(value => {
                        this.loading = false
                        this.toastr.success('Site information created successfully');
                        if (!isSaveAndExit) {
                            this.router.navigate(['/projectDetails', r.id])
                        } else {
                            this.router.navigate(['/rfp'])
                        }
                    })

                }, e => {
                    this.loading = false
                });
            }

        } else {
            if (!isSaveAndExit && !stepName) {
                this.router.navigate(['/projectDetails', this.rfp.id])
            } else if (!isSaveAndExit && stepName) {
                this.router.navigate([stepName, this.rfp.id])
            } else if (isSaveAndExit) {
                this.router.navigate(['/rfp'])
            }
        }
    }

    /**
    * This method gets header status and set class name of progress bar
    * @method getHeaderStatus
    */
    getHeaderStatus() {
        if (this.rfp.completedStep >= 5) {
            this.showStep1 = this.showStep2 = this.showStep3 = this.showStep4 = this.showStep5 = 'success'
        } else if (this.rfp.completedStep >= 4) {
            this.showStep1 = this.showStep2 = this.showStep3 = this.showStep4 = 'success'
        } else if (this.rfp.completedStep >= 3) {
            this.showStep1 = this.showStep2 = this.showStep3 = 'success'
        } else if (this.rfp.completedStep >= 2) {
            this.showStep1 = this.showStep2 = 'success'
        } else if (this.rfp.completedStep >= 1) {
            this.showStep1 = 'success'
        }
    }

    /**
    * This method clear job data while select New Job
    * @method clearJobData
    */
    clearJobData() {
        this.rfpAddressdropdownList = null;
        this.addresseeContactsList = null;
        this.formNotChanged = false
        this.rfp.idRfpAddress = 0
        this.rfp.idBorough = 0
        this.rfp.houseNumber = ""
        this.rfp.streetNumber = ""
        this.rfp.floorNumber = ""
        this.rfp.apartment = ""
        this.rfp.specialPlace = ""
        this.rfp.block = ""
        this.rfp.lot = ""
        this.rfp.hasLandMarkStatus = false
        this.rfp.hasEnvironmentalRestriction = false
        this.rfp.hasOpenWork = false
        this.rfp.idCompany = null
        this.rfp.idContact = null
        this.rfp.address1 = ""
        this.rfp.address2 = ""
        this.rfp.city = ""
        this.rfp.idState = null
        this.rfp.zipCode = ""
        this.rfp.phone = ""
        this.rfp.email = ""
    }

    /**
    * This method format phone numbers
    * @method formatPhone
    */
    formatPhone() {
        this.rfp.phone = this.appComponent.phoneFormat(this.rfp.phone)
    }

    /**
    * This method add general notes
    * @method addGeneralNote
    */

    changeContacts() {
        this.getAllActiveContacts('type', this.rfp.idCompany);
    }

    /**
    * This method add general notes
    * @method addGeneralNote
    */
    addGeneralNote() {
        this.openModalSendEmail(this.rfpprogressionnote)
    }

    /**
    * This method open add general notes popup 
    * @method openModalSendEmail
    * @param {TemplateRef} template request Object
    */
    private openModalSendEmail(template: TemplateRef<any>, id?: number) {
        this.modalRef = this.modalService.show(template, { class: 'modal-add-task' })
    }

    /**
    * This method checks given data is number or not
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
    * This method will call on click on document upload
    * @method documentUpload
    * @param {any} evt event object
    */
    documentUpload(evt: any) {
        if (this.rfp.rfpDocuments == null) {
            this.rfp.rfpDocuments = []
        }
        let files = evt.target.files;
        for (var i = 0; i < files.length; i++) {
            this.rfp.rfpDocuments.push(files[i])
            this.documents.push(files[i]);
        }
    }

    /**
    * This method uploads document in database
    * @method uploadDocuments
    * @param {number} id ID of rfp
    */
    uploadDocuments(id: number): Promise<{}> {
        return new Promise((resolve, reject) => {
            if (this.documents && this.documents.length > 0) {
                let formData = new FormData();
                formData.append('idRfp', id.toString())

                for (var i = 0; i < this.documents.length; i++) {
                    formData.append('documents_' + i, this.documents[i])
                }
                this.SiteInformationServices.saveRfpDocuments(formData).subscribe(r => {
                    resolve(null)
                }, e => {
                    reject()
                })
            } else {
                resolve(null)
            }
        })
    }

    /**
    * This method delete document from database
    * @method deleteDocument
    * @param {any} d Id of document delete 
    */
    deleteDocument(d: any) {
        if (d.id) {
            this.rfp.documentsToDelete.push(d.id);
        }
        this.rfp.rfpDocuments.splice(this.rfp.rfpDocuments.indexOf(d), 1)
        this.documents.splice(this.rfp.rfpDocuments.indexOf(d), 1)
    }

    /**
   * This method decide 2nd officer fields should be display or not
   * @method set2ndOfficer
   */
    set2ndOfficer() {
        if (this.rfpAddressRec.idOwnerType && this.ownerTypes && this.ownerTypes.length > 0) {
            let matchedItem = this.ownerTypes.filter(x => x.id == this.rfpAddressRec.idOwnerType);
            if (matchedItem && matchedItem.length > 0) {
                this.isSecondOfficerRequire = matchedItem[0].isSecondOfficerRequire;
            }
        } else {
            this.isSecondOfficerRequire = false;
        }
    }
}