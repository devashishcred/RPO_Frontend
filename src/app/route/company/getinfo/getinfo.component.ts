import { equals, onlyThisProperty } from '../../../utils/utils';
import { State } from '../../../types/state';
import { City } from '../../../types/city';
import { CompanyServices } from '../company.services';
import { CityServices } from '../../../services/city.services';
import { StateServices } from '../../../services/state.services';
import { AddressTypeServices } from '../../../services/addressType.services';
import { ToastrService } from 'ngx-toastr';
import { Address, AddressType } from '../../../types/address';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Company, CompanyType } from '../../../types/company';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, pickBy, identity } from 'lodash';
import { Message } from '../../../app.messages';
import * as _ from 'underscore';
import * as moment from 'moment';
import { constantValues } from '../../../app.constantValues';
import { convertUTCDateToLocalDate } from '../../../utils/utils';
import { AppComponent } from '../../../app.component';
declare const $: any

@Component({
    selector: '[get-info-company]',
    templateUrl: './getinfo.component.html'
})
/**
* This component contains all function that are used in this component
* @class GetInfoComponent
*/
export class GetInfoComponent implements OnInit {
    @Input() idCompany: number
    @Input() modalRef: BsModalRef
    @Input() onSave: Function
    
    private company: Company
    loading: boolean = false
    errorMsg: any
    private gcSelected: boolean = false;
    private siSelected: boolean = false;
    private caSelected: boolean = false;
    private ctSelected: boolean = false;
    private gcSubTypes: CompanyType[] = [];
    private allCompanyTypes: CompanyType[] = [];
    private caSubTypes: CompanyType[] = [];
    private tmpComType: CompanyType[] = [];
    private tmpCompanySubTypes: any = [];
    private tmpCitySubTypes: any = [];
    private licenseNumber: number
    noResultFound: boolean = false
    companyBisInfo: any
    bisListOfCompanies: any
    private licenceType: string
    isBisDetailFound: boolean = false
    private idCompanyType:number = null;

    /**
    * This method define all services that requires in whole class
    * @method constructor
    */
    constructor(
        private modalService: BsModalService,
        private toastr: ToastrService,
        private addressTypeServices: AddressTypeServices,
        private stateServices: StateServices,
        private cityServices: CityServices,
        private companyServices: CompanyServices,
        private constantValues: constantValues,
        private message: Message,
        private appComponent: AppComponent
    ) {
        this.errorMsg = this.message.msg;
    }

    /**
    * This method will call when form loads first time
    * @method ngOnInit
    */
    ngOnInit() {
        this.loading = true;
        if (this.idCompany) {
            this.companyServices.getById(this.idCompany).subscribe(r => {
                let licenceNumber = null;
                this.company = r
                if (this.company['trackingNumber']) {
                    licenceNumber = this.company['trackingNumber'];
                } else if (this.company['specialInspectionAgencyNumber']) {
                    licenceNumber = this.company['specialInspectionAgencyNumber'];
                } else if (this.company['ctLicenseNumber']) {
                    licenceNumber = this.company['ctLicenseNumber'];
                }
                this.getCompanyInfo(this.company.name, licenceNumber);
            })
        }
    }

    /**
    * This method get company info from BIS fo given company type and licence number
    * @method getCompanyInfo
    * @param {string} businessName Company Type
    * @param {number} licenceNumber Company licence number
    */
    getCompanyInfo(businessName: string, licenceNumber: number) {
        this.loading = true;
        let companyTypeText = ''
        businessName = businessName.toUpperCase();
        var companyTypes = this.company.companyTypes;
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
            this.companyServices.getBusinessFromBis(businessName, companyTypeText,licenceNumber).subscribe(data => {
                data = JSON.parse(data);
                if (data && data.length > 1) {
                    this.bisListOfCompanies = data;
                    this.loading = false;
                } else if (data && data.length == 1) {
                    this.companyBisInfo = data[0];
                    this.licenceType = licenceType;
                    this.getBisDetails();
                } else {
                    this.loading = false;
                    this.toastr.info(this.errorMsg.noResultForBis);
                }
            }, err => {
                this.loading = false;
                this.toastr.info(this.errorMsg.noResultForBis);
            });
        } else {
            this.loading = false;
            this.toastr.info(this.errorMsg.noResultForBis);
        }
    }

    /**
     * This method set all BIS detail in to company form
     * @method getBisDetails
     */
    private getBisDetails() {
        this.isBisDetailFound = true;
        if (this.companyBisInfo['business_name']) {
            this.companyBisInfo['business_name'] = this.toTitleCase(this.companyBisInfo['business_name']);
        }
        this.licenseNumber = this.companyBisInfo.license_number;
        if (this.licenceType == 'G') {
            this.companyBisInfo['trackingNumber'] = this.companyBisInfo.license_number;
            this.idCompanyType = 13;
        } else if (this.licenceType == 'I') {
            this.companyBisInfo['specialInspectionAgencyNumber'] = this.companyBisInfo.license_number;
            this.idCompanyType = 11;
        } else if (this.licenceType == 'C') {
            this.companyBisInfo['ctLicenseNumber'] = this.companyBisInfo.license_number;
            this.idCompanyType = 27;
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
     * This method get insurance detail of company
     * @method scrapBisPage
     * @param {string} licenseNo Licence Number
     * @param {string} licenseType Licence Type 
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
                this.company['endorsementsDemolition'] = result.endorsementsDemolition;
                this.companyBisInfo['endorsementsDemolition'] = result.endorsementsDemolition ? 'Yes' : 'No';
            }
            if (result.endorsementsConstruction) {
                this.company['endorsementsConstruction'] = result.endorsementsConstruction;
                this.companyBisInfo['endorsementsConstruction'] = result.endorsementsConstruction ? 'Yes' : 'No';
            }
            if (result.endorsementsConcrete) {
                this.company['endorsementsConcrete'] = result.endorsementsConcrete;
                this.companyBisInfo['endorsementsConcrete'] = result.endorsementsConcrete ? 'Yes' : 'No';
            }

            this.loading = false;
        }, err => {
            this.loading = false;
            this.noResultFound = true;
        })
    }

    /**
     * This method converts given string into title case
     * @method toTitleCase
     * @param {string} str request string 
     */
    private toTitleCase(str: string) {
        return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    }

    /**
     * This method save company bis info
     * @method saveBisInfo
     */
    saveBisInfo() {
        this.loading = true;
        this.company.name = this.companyBisInfo['business_name'] ? this.companyBisInfo['business_name'] : this.company.name;
        this.company.trackingNumber = this.licenseNumber ? this.licenseNumber : this.company.trackingNumber;
        this.company.trackingExpiry = this.companyBisInfo['trackingExpiry'] ? this.companyBisInfo['trackingExpiry'] : this.company.trackingExpiry;
        this.company.specialInspectionAgencyNumber = this.licenseNumber ? this.licenseNumber : this.company.specialInspectionAgencyNumber;
        this.company.ctLicenseNumber = this.licenseNumber ? this.licenseNumber : this.company.ctLicenseNumber;
        this.company.insuranceDisability = this.companyBisInfo['insuranceDisability'] ? this.companyBisInfo['insuranceDisability'] : this.company.insuranceDisability;
        this.company.insuranceGeneralLiability = this.companyBisInfo['insuranceGeneralLiability'] ? this.companyBisInfo['insuranceGeneralLiability'] : this.company.insuranceGeneralLiability;
        this.company.insuranceWorkCompensation = this.companyBisInfo['insuranceWorkCompensation'] ? this.companyBisInfo['insuranceWorkCompensation'] : this.company.insuranceWorkCompensation;
        this.company.specialInspectionAgencyExpiry = this.companyBisInfo['specialInspectionAgencyExpiry'] ? this.companyBisInfo['specialInspectionAgencyExpiry'] : this.company.specialInspectionAgencyExpiry;
        this.company.ctExpirationDate = this.companyBisInfo['ctExpirationDate'] ? this.companyBisInfo['ctExpirationDate'] : this.company.ctExpirationDate;
        
        this.companyServices.update(this.company.id, this.company).subscribe(r => {
            this.toastr.success('Record updated successfully')
            this.modalRef.hide()
            this.loading = false;
            this.onSave(r);
        }, e => {
            this.loading = false;
        })
    }

}