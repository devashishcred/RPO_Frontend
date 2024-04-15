import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { cloneDeep, pickBy, identity } from 'lodash';
import { Message } from '../../../app.messages';
import * as _ from 'underscore';
import * as moment from 'moment';
import { constantValues } from '../../../app.constantValues';
import { AppComponent } from '../../../app.component';
import { CompanyServices } from '../company.services';
import { convertUTCDateToLocalDate } from '../../../utils/utils';
import { SharedDataService } from '../../../app.constantValues';
declare const $: any

/**
  * BisCompanyListComponent class contains all function that are used in this component
  * @class BisCompanyListComponent
  */
@Component({
    selector: '[view-bis-companylist]',
    templateUrl: './bisCompanyList.component.html'
})

export class BisCompanyListComponent implements OnInit {
    @Input() modalRefViewBis: BsModalRef
    @Input() bisListOfCompanies: any
    @Input() companyObj: any
    @Input() address: any
    @Input() states: any
    @Output() messageEvent = new EventEmitter<string>();
    @Output() updateFormFieldsFromBIS = new EventEmitter<any>();

    /**
     * update bis info company form
     * @property updateBISInfoToCompany
     */
    @ViewChild('updateBISInfoToCompany',{static: true})
    private updateBISInfoToCompany: TemplateRef<any>

    loading: boolean = false
    errorMsg: any
    companyBisInfo: any
    private licenceType: string
    noResultFound: boolean = false
    isBisDetailFound: boolean = false

    /**
     * This method define all services that requires in whole class
     * @method constructor
     */
    constructor(
        private modalService: BsModalService,
        private toastr: ToastrService,
        private message: Message,
        private appComponent: AppComponent,
        private companyServices: CompanyServices,
        private constantValues: constantValues,
        public _SharedDataService: SharedDataService,
    ) {
        this.errorMsg = this.message.msg;
    }

    /**
    * This method will call when form loads first time
    * @method ngOnInit
    */
    ngOnInit() {
        if (this.bisListOfCompanies.length == 1) {
            this.getCompanyBISInfo(this.bisListOfCompanies[0].business_name, this.bisListOfCompanies[0].license_number);
        }
    }

    /**
    * This method get company info from BIS
    * @method getCompanyBISInfo
    * @param {string} businessName company type
    * @param {string} licenceNumber licence number
    */
    getCompanyBISInfo(businessName: string, licenceNumber: string) {
        this.loading = true;
        let companyTypeText = '';
        var companyTypes = this.companyObj.companyTypes;
        var gcCompanyType = companyTypes.filter((type: any) => type.id == 13);
        var SiaCompanyType = companyTypes.filter((type: any) => type.id == 11);
        var ctCompanyType = companyTypes.filter((type: any) => type.id == 27);
        let licenceType = '';
        if (gcCompanyType.length > 0) {
            companyTypeText = 'GENERAL CONTRACTOR';
            licenceType = 'G';
        } else if (SiaCompanyType.length > 0) {
            companyTypeText = 'SPECIAL INSPECTION AGENCY';
            licenceType = 'I';
        } else if (ctCompanyType.length > 0) {
            companyTypeText = 'CONCRETE TESTING LAB';
            licenceType = 'C';
        }
        if (companyTypeText != '') {
            this.companyServices.getBusinessFromBis(businessName, companyTypeText, licenceNumber).subscribe(data => {
                this.loading = false;
                data = JSON.parse(data);
                if (data && data.length == 1) {
                    this.companyBisInfo = data[0];
                    this.licenceType = licenceType;
                    this.getBisDetails();
                }
            });
        }
    }

    /**
     * This method will open company info popup
     * @method openCompanyInfoModal
     * @param {TemplateRef} template Template Object
     * @param {number} id ID of Company
     */
    private openCompanyInfoModal(template: TemplateRef<any>, id?: number) {
        this.modalRefViewBis = this.modalService.show(template, { class: 'modal-bis-company-info' })
    }

    /**
     * This method will fetch all detail from BIS
     * @method getBisDetails
     */
    private getBisDetails() {
        this.isBisDetailFound = true;
        if (this.companyBisInfo['business_name']) {
            this.companyBisInfo['business_name'] = this.toTitleCase(this.companyBisInfo['business_name']);
        }
        if (this.companyBisInfo['first_name']) {
            this.companyBisInfo['first_name'] = this.toTitleCase(this.companyBisInfo['first_name']);

            if (this.companyBisInfo['last_name']) {
                this.companyBisInfo['first_name'] = this.companyBisInfo['first_name'] + " " + this.toTitleCase(this.companyBisInfo['last_name']);
            }
        }

        if (this.licenceType == 'G') {
            this.companyBisInfo['trackingNumber'] = this.companyBisInfo.license_number;
        } else if (this.licenceType == 'I') {
            this.companyBisInfo['specialInspectionAgencyNumber'] = this.companyBisInfo.license_number;
        } else if (this.licenceType == 'C') {
            this.companyBisInfo['ctLicenseNumber'] = this.companyBisInfo.license_number;
        }

        if (this.companyBisInfo['business_street_name']) {
            this.companyBisInfo['business_street_name'] = this.toTitleCase(this.companyBisInfo['business_street_name']);
        }
        if (this.companyBisInfo['license_business_city']) {
            this.companyBisInfo['license_business_city'] = this.toTitleCase(this.companyBisInfo['license_business_city']);
        }
        if (this.companyBisInfo['business_phone_number']) {
            this.companyBisInfo['business_phone_number'] = this.appComponent.phoneFormat(this.companyBisInfo['business_phone_number']);
        }

        this.scrapBisPage(this.companyBisInfo.license_number, this.licenceType);
    }

    /**
     * This method will fetch all information about insurance
     * @method scrapBisPage
     * @param {string} licenseNo license Number
     * @param {string} licenseType license Type 
     */
    private scrapBisPage(licenseNo: string, licenseType: string) {
        this.loading = true;
        this.companyServices.getBisPage(licenseNo, licenseType).subscribe(result => {
            if (result.insuranceWorkCompensation) {
                this.companyBisInfo['insuranceWorkCompensation'] = moment(result.insuranceWorkCompensation).format(this.constantValues.DATEFORMAT);
            }
            if (result.insuranceDisability) {
                this.companyBisInfo['insuranceDisability'] = moment(result.insuranceDisability).format(this.constantValues.DATEFORMAT);
            }
            if (result.insuranceGeneralLiability) {
                this.companyBisInfo['insuranceGeneralLiability'] = moment(result.insuranceGeneralLiability).format(this.constantValues.DATEFORMAT);
            }
            if (result.concreteTestingLabExpiry) {
                this.companyBisInfo['ctExpirationDate'] = moment(result.concreteTestingLabExpiry).format(this.constantValues.DATEFORMAT);
            }
            if (result.specialInspectionAgencyExpiry) {
                this.companyBisInfo['specialInspectionAgencyExpiry'] = moment(result.specialInspectionAgencyExpiry).format(this.constantValues.DATEFORMAT);
            }
            if (result.generalContractorExpiry) {
                this.companyBisInfo['trackingExpiry'] = moment(result.generalContractorExpiry).format(this.constantValues.DATEFORMAT);
            }
            if (result.endorsementsDemolition) {
                this.companyBisInfo['endorsementsDemolition'] = result.endorsementsDemolition ? 'Yes' : 'No';
            }
            if (result.endorsementsConstruction) {
                this.companyBisInfo['endorsementsConstruction'] = result.endorsementsConstruction ? 'Yes' : 'No';
            }
            if (result.endorsementsConcrete) {
                this.companyBisInfo['endorsementsConcrete'] = result.endorsementsConcrete ? 'Yes' : 'No';
            }

            this.loading = false;
        }, err => {
            this.loading = false;
            this.noResultFound = true;
        })
    }

    /**
     * This method will convert given string into title case
     * @method toTitleCase
     * @param {string} str request string 
     */
    toTitleCase(str: string) {
        return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    }

    /**
     * This method save bis info
     * @method saveBisInfo
     */
    saveBisInfo() {
        this.loading = true;
        this.companyObj.name = this.companyBisInfo['business_name'] ? this.companyBisInfo['business_name'] : this.companyObj.name;
        this.companyObj.trackingNumber = this.companyBisInfo['trackingNumber'] ? this.companyBisInfo['trackingNumber'] : this.companyObj.trackingNumber;
        this.companyObj.trackingExpiry = this.companyBisInfo['trackingExpiry'] ? this.companyBisInfo['trackingExpiry'] : this.companyObj.trackingExpiry;
        this.companyObj.specialInspectionAgencyNumber = this.companyBisInfo['specialInspectionAgencyNumber'] ? this.companyBisInfo['specialInspectionAgencyNumber'] : this.companyObj.specialInspectionAgencyNumber;
        this.companyObj.ctLicenseNumber = this.companyBisInfo['ctLicenseNumber'] ? this.companyBisInfo['ctLicenseNumber'] : this.companyObj.ctLicenseNumber;
        this.companyObj.insuranceDisability = this.companyBisInfo['insuranceDisability'] ? this.companyBisInfo['insuranceDisability'] : this.companyObj.insuranceDisability;
        this.companyObj.insuranceGeneralLiability = this.companyBisInfo['insuranceGeneralLiability'] ? this.companyBisInfo['insuranceGeneralLiability'] : this.companyObj.insuranceGeneralLiability;
        this.companyObj.insuranceWorkCompensation = this.companyBisInfo['insuranceWorkCompensation'] ? this.companyBisInfo['insuranceWorkCompensation'] : this.companyObj.insuranceWorkCompensation;
        this.companyObj.specialInspectionAgencyExpiry = this.companyBisInfo['specialInspectionAgencyExpiry'] ? this.companyBisInfo['specialInspectionAgencyExpiry'] : this.companyObj.specialInspectionAgencyExpiry;
        this.companyObj.ctExpirationDate = this.companyBisInfo['ctExpirationDate'] ? this.companyBisInfo['ctExpirationDate'] : this.companyObj.ctExpirationDate;

        this.address.address1 = this.companyBisInfo['business_house_number'] + ' ' + this.toTitleCase(this.companyBisInfo['business_street_name']);
        this.address.zipCode = this.companyBisInfo.business_zip_code ? this.companyBisInfo['business_zip_code'] : this.address.zipCode;
        this.address.phone = this.companyBisInfo.business_phone_number ? this.appComponent.phoneFormat(this.companyBisInfo['business_phone_number']) : this.appComponent.phoneFormat(this.address.phone);
        this.address.city = this.companyBisInfo.license_business_city ? this.toTitleCase(this.companyBisInfo['license_business_city']) : this.address.city;
        if (this.companyBisInfo.business_state) {
            let bisState = this.states.filter((x: any) => x.acronym == this.companyBisInfo.business_state)
            if (bisState) {
                this.address.idState = bisState[0].id
            }
        }
        this.scrapBisPage(this.companyBisInfo.license_number, this.licenceType);

        // send information to parent component
        let companyBISInfo = this.companyBisInfo;
        let addressInfo = this.address;
        this.updateFormFieldsFromBIS.emit({ companyBISInfo, addressInfo });

        this.modalRefViewBis.hide();
        this.loading = false;
    }


}