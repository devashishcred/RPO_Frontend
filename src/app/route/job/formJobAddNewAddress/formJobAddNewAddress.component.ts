import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, EventEmitter, Output } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { rfpAddress } from '../../../types/rfpAddress';
import { AddressType } from '../../../types/address';
import { BoroughServices } from '../../../services/borough.services';
import { borough } from '../../../types/borough';
import { CompanyDTO, Company } from '../../../types/company';
import { Contact } from '../../../types/contact';
import { ContactTitle } from '../../../types/contactTitle';
import { AddressTypeServices } from '../../../services/addressType.services';
import { CompanyServices } from '../../company/company.services';
import { ContactTitleServices } from '../../../services/contactTitle.services';
import { ContactServices } from '../../contact/contact.services';
import { Message } from '../../../app.messages';
import { occupancyClasifications, constructionClassifications, multipleDwellingClassifications, primaryStructuralSystems, structureOccupancyCategories, seismicDesignCategories } from '../../../types/classifications';
import { rfp } from '../../../types/rfp';
import { OccuClasificationsServices } from '../../../services/OccuClassification.services';
import { ConstClasificationsServices } from '../../../services/ConstClassification.services';
import { multipleDwellingClassificationsServices } from '../../../services/MultiDwellingClassifications.services';
import { PrimaryStructuralSystemsServices } from '../../primarystructuralsystems/primarystructuralsystems.services';
import { StructureOccupancyCategoriesServices } from '../../structureoccupancycategories/structureoccupancycategories.services';
import { SeismicDesignCategoriesServices } from '../../seismicdesigncategories/seismicdesigncategories.services';
import { SiteInformationServices } from '../../addRfp/siteInformation/siteInformation.services';
import { AddressMasterServices } from '../../addressmaster/addressmaster.services';
import { OwnerType } from '../../ownertype/ownerType';
import { OwnerTypeServices } from '../../ownertype/ownertype.services';
import { Job } from '../../../types/job';
import * as _ from 'underscore';

declare const $: any

@Component({
  selector: '[form-Add-new-address]',
  templateUrl: './formJobAddNewAddress.component.html'
})
/**
* This component contains all function that are used in Form Job Add New Address Component
* @class FormJobAddNewAddressComponent
*/

export class FormJobAddNewAddressComponent {
  @Input() modalRef: BsModalRef
  @Input() onSave: Function
  @Input() idCompany: number
  @Input() formAddNewAddress: rfpAddress
  @Input() rfpAddressList: rfpAddress[]
  @Input() jobOject: Job
  @Input() setAddressData: any
  @Output() setAddressInDropDownList = new EventEmitter<any>()
  @Input() moduleName: string
  @Input() addressId: number
  @Input() reloadAddress: Function
  @Input() isNew: boolean
  @Input() isTitle: boolean

  /**
  * viewAddressList add/edit form
  * @property viewAddressList
  */
  @ViewChild('viewAddressList', { static: true })
  private viewAddressList: TemplateRef<any>
  modalRefAddress: BsModalRef

  loading: boolean = false
  private addressTypes: AddressType[] = []
  ownerTypes: OwnerType[] = []
  boroughs: borough[] = []
  private selectUndefinedOptionValue: any;
  rfpAddressRec: rfpAddress
  companies: Company[] = []
  private contactTitles: ContactTitle[] = []
  contacts: Contact[] = []
  Secondcontacts: Contact[] = []
  errorMsg: any
  occuClassifications: occupancyClasifications[] = []
  private alloccuClassifications: occupancyClasifications[] = []
  constructionClassifications: constructionClassifications[] = []
  private allConstructionClassifications: constructionClassifications[] = []
  multipleDwellingClassifications: multipleDwellingClassifications[] = []
  primaryStructuralSystems: primaryStructuralSystems[] = []
  structureOccupancyCategories: structureOccupancyCategories[] = []
  seismicDesignCategories: seismicDesignCategories[] = []
  private rfp: rfp
  displayGetInfo: boolean = false
  private boroughName: string
  addressList: any = []
  isSecondOfficerRequire: boolean = false;
  isOutsideNYC: boolean = false
  anomalyBin = [
    1000000,
    2000000,
    3000000,
    4000000,
    5000000,
    6000000
  ]
  isAnomalyBin:boolean = false;

  constructor(
    private modalService: BsModalService,
    private toastr: ToastrService,
    private boroughServices: BoroughServices,
    private addressTypeServices: AddressTypeServices,
    private ownerTypeServices: OwnerTypeServices,
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
    private addressMasterServices: AddressMasterServices,
    private message: Message

  ) {
    this.errorMsg = this.message.msg;
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    if (this.isTitle) {
      document.title = 'Address'
    } else {
      document.title = 'Projects'
    }

    this.rfpAddressRec = {
    } as rfpAddress
    if (typeof this.rfpAddressRec.isOcupancyClassification20082014 == "undefined") {
      this.rfpAddressRec.isOcupancyClassification20082014 = false;
    }
    if (typeof this.rfpAddressRec.isConstructionClassification20082014 == "undefined") {
      this.rfpAddressRec.isConstructionClassification20082014 = false;
    }
    this.getCompanies();
    this.getBoroughs();
    if (!this.ownerTypes.length) {
      this.ownerTypeServices.getDropdownData().subscribe(r => {
        this.ownerTypes = _.sortBy(r, "name")
      });
    }

    if (!this.contactTitles.length) {
      this.contactTitlesServices.get().subscribe(r => {
        this.contactTitles = r
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
    if (this.addressId && this.addressId > 0) {
      this.loading = true
      this.getRfpAddress()
    }
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
    }
  }

  /**
  * Get all dropdown data from RFP address data
  * @method getRfpAddress
  */
  getRfpAddress() {
    this.SiteInformationServices.getRfpAddressById(this.addressId).subscribe(r => {
      this.rfpAddressRec = {} as rfpAddress
      this.rfpAddressRec = r
      if (this.rfpAddressRec.idCompany) {
        this.getContacts('mainCompany');
      }
      if (this.rfpAddressRec.idSecondOfficerCompany) {
        this.getContacts('secondCompany');
      }
      this.occuClassifications = this.alloccuClassifications.filter(x => x.is_2008_2014 == this.rfpAddressRec.isOcupancyClassification20082014);
      this.constructionClassifications = this.allConstructionClassifications.filter(x => x.is_2008_2014 == this.rfpAddressRec.isConstructionClassification20082014);
      this.checkBisAddressInfo();
      this.set2ndOfficer();
      this.displayGetInfo = true
    }, e => { this.loading = false })

  }

  /**
  * This method is used check BIS Info
  * @method checkBisAddressInfo
  */
  checkBisAddressInfo(formChanged?: string) {
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
    if (this.rfpAddressRec.idBorough == 6) {
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
  * This method is used get BIS Address Info
  * @method getBisAddressInfo
  */
  getBisAddressInfo() {
    let requestParams = {
      houseNumber: this.rfpAddressRec.houseNumber.trim(),
      streetName: this.rfpAddressRec.street.trim(),
      borough: this.boroughName.trim(),
      isExactMatch: false,
    }
    this.loading = true
    this.SiteInformationServices.getBisAddresInfo(requestParams).subscribe(address => {
      this.loading = false
      console.log('address',address)
      if (address && address.length > 0) {
        this.addressList = address;
        let i = this.anomalyBin.findIndex(el=> el == address[0]?.bin)
        console.log("index",i)
        if(i > -1) {
          this.isAnomalyBin = true
          this.toastr.warning("BIN Anomaly recognized, please confirm address details!")
        } else {
          this.isAnomalyBin = false
        }
        this.openModalAddressList(this.viewAddressList);
      } else {
        this.isAnomalyBin = false
        this.toastr.info(this.errorMsg.noAddressFound)
      }

    }, e => { this.loading = false })
  }

  /**
  * This method is used convert value or label to Title case
  * @method toTitleCase
  * @param {string} str str is a string which is used to convert string to Title case
  */
  private toTitleCase(str: string) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
  }

  /**
  * This method is used to update form fields from get info
  * @method updateFormFieldsFromGetInfo
  * @param {any} address  address is an object which is used to update form fields from get info
  */
  updateFormFieldsFromGetInfo(address: any) {
    this.rfpAddressRec.houseNumber = address.houseNumber
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
    this.rfpAddressRec.isBSADecision = address.bsaDecision
    this.rfpAddressRec.cityOwnedCheck = address.cityOwned
    this.rfpAddressRec.loftLawCheck = address.loftLaw
    this.rfpAddressRec.sroRestrictedCheck = address.sRORestricted
  }

  /**
  * This method is used to open modal popup for openModalAddressList
  * @method openModalAddressList
  * @param {any} template type which contains template of create/edit module
  */
  private openModalAddressList(template: TemplateRef<any>) {
    this.modalRefAddress = this.modalService.show(template, { class: 'modal-address-list' })
  }

  /**
  * This method is used make formatting of phone number
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
  * Get all dropdown data from Boroughs
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
  * Get all dropdown data from Companies
  * @method getCompanies
  */
  private getCompanies() {
    this.loading = true;
    if (!this.companies.length) {

      this.companyService.getCompanyDropdown().subscribe(r => {
        this.companies = r;
        this.loading = false;
      }, e => {
        this.loading = false;
      })

    }
    this.getContacts('mainCompany');
    this.getContacts('secondCompany');
  }

  /**
  *  Get all dropdown data from Contacts
  * @method getContacts
  */
  getContacts(from?: string) {
    let companyId = -1
    if (this.rfpAddressRec.idCompany && from == 'mainCompany') {
      this.contacts = [] as Contact[]
      companyId = this.rfpAddressRec.idCompany
      this.getContactsDD(companyId, from);
    }
    if (this.rfpAddressRec.idSecondOfficerCompany && from == 'secondCompany') {
      this.Secondcontacts = [] as Contact[]
      companyId = this.rfpAddressRec.idSecondOfficerCompany
      this.getContactsDD(companyId, from);

    }
    if (!this.rfpAddressRec.idCompany && !this.rfpAddressRec.idSecondOfficerCompany) {
      this.contacts = [] as Contact[]
      this.getContactsDD(companyId, from);
    }
  }

  /**
  * This method is get Contacts Dropdown Values
  * @method getContactsDD
  * @param CompanyId
  */
  getContactsDD(companyId: any, from: string) {
    this.companyService.getContactOfComDD(companyId).subscribe(r => {
      if (r && r.length > 0) {
        if (companyId == -1 && from == undefined) {
          this.contacts = _.sortBy(r, function (i) { return i['itemName'].toLowerCase(); });
          this.Secondcontacts = _.sortBy(r, function (i) { return i['itemName'].toLowerCase(); });
        }
        if (from == 'mainCompany' && companyId != -1) {
          this.contacts = _.sortBy(r, function (i) { return i['itemName'].toLowerCase(); });
        }
        if (from == 'secondCompany' && companyId != -1) {
          this.Secondcontacts = _.sortBy(r, function (i) { return i['itemName'].toLowerCase(); });
        }

        if (companyId == -1 && from == 'mainCompany') {
          this.contacts = _.sortBy(r, function (i) { return i['itemName'].toLowerCase(); });
        }
        if (companyId == -1 && from == 'secondCompany') {
          this.Secondcontacts = _.sortBy(r, function (i) { return i['itemName'].toLowerCase(); });
        }
      }
    }, e => { this.loading = false })
  }
  /**
  * This method is used to save address record
  * @method saveRfpAddress
  */
  saveRfpAddress() {
    this.loading = true
    const rec = cloneDeep(this.rfpAddressRec)
    if (this.moduleName != "addressMaster") {
      this.createAddress(rec)
    } else {
      if (!this.isNew) {
        this.updateAddress(rec)
      } else {
        this.createAddress(rec)

      }
    }
  }

  /**
  * This method is used to update existing address record in database
  * @method updateAddress
  * @param  {any} rec type request Object
  */
  updateAddress(rec: any) {
    this.addressMasterServices.updateRfpAddress(rec).subscribe(r => {
      this.toastr.success('Record updated successfully')
      this.reloadAddress();
      this.modalRef.hide()
    }, e => { this.loading = false })
  }

  /**
  * This method is used to create a new address record in database
  * @method createAddress
  * @param {any} rec address request Object
  */
  createAddress(rec: any) {
    this.SiteInformationServices.createRfpAddress(rec).subscribe(r => {
      const rfpAddress = r as any
      if (this.moduleName != "addressMaster") {
        if (r.idBorough) {
          rfpAddress.borough = this.boroughs.filter(x => x.id == r.idBorough)[0].description
        }
        let descAddress = r.houseNumber + " " + (r.street ? r.street + "," : "") + " " + (r.borough ? r.borough : "") + " " + (r.zipCode ? "," + r.zipCode : "")
        rfpAddress.itemName = descAddress
        this.rfpAddressList.push(rfpAddress)

        this.jobOject.idRfpAddress = r.id
        this.jobOject.houseNumber = r.houseNumber;
        this.jobOject.streetNumber = r.street;
        this.jobOject.specialPlace = '';
        this.jobOject.block = r.block;
        this.jobOject.lot = r.lot;
        this.jobOject.hasLandMarkStatus = r.isLandmark;
        this.jobOject.hasEnvironmentalRestriction = r.isLittleE;
        this.jobOject.idBorough = r.idBorough;
        let addressAndJobInfo = {
          'rfpAddressList': this.rfpAddressList,
          'jobObject': this.jobOject
        }
        this.setAddressInDropDownList.emit(addressAndJobInfo)
      } else {
        this.reloadAddress();
      }
      this.toastr.success('Record created successfully')
      this.modalRef.hide()
    }, e => { this.loading = false })
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
  * This method is used to set company data
  * @method setCompany
  */
  setCompany() {
    this.rfpAddressRec.company = this.companies.filter(x => x.id == this.rfpAddressRec.idCompany)[0];
  }

  /**
  * This method is used to set contact data
  * @method setContact
  */
  setContact() {
    this.rfpAddressRec.ownerContact = this.contacts.filter(x => x.id == this.rfpAddressRec.idOwnerContact)[0];
  }

  /**
  * This method is used to set Occupancy Classification data
  * @method setOccupancyClassification
  */
  setOccupancyClassification() {
    this.rfpAddressRec.occupancyClassification = this.occuClassifications.filter(x => x.id == this.rfpAddressRec.idOccupancyClassification)[0];
  }

  /**
   * This method is used to set Construction Classification data
   * @method setConstructionClassifications
   */
  setConstructionClassifications() {
    this.rfpAddressRec.constructionClassification = this.constructionClassifications.filter(x => x.id == this.rfpAddressRec.idConstructionClassification)[0];
  }

  /**
   * This method is used to set Multiple Dwelling Classification data
   * @method setmultipleDwellingClassifications
   */
  setmultipleDwellingClassifications() {
    this.rfpAddressRec.multipleDwellingClassification = this.multipleDwellingClassifications.filter(x => x.id == this.rfpAddressRec.idMultipleDwellingClassification)[0];
  }

  /**
   * This method is used to set Primary Structural Systems data
   * @method setprimaryStructuralSystems
   */
  setprimaryStructuralSystems() {
    this.rfpAddressRec.primaryStructuralSystem = this.primaryStructuralSystems.filter(x => x.id == this.rfpAddressRec.idPrimaryStructuralSystem)[0];
  }

  /**
   * This method is used to set Structure Occupancy Categories data
   * @method setstructureOccupancyCategories
   */
  setstructureOccupancyCategories() {
    this.rfpAddressRec.structureOccupancyCategory = this.structureOccupancyCategories.filter(x => x.id == this.rfpAddressRec.idStructureOccupancyCategory)[0];
  }

  /**
   * This method is used to set Seismic Design Categories data
   * @method setseismicDesignCategories
   */
  setseismicDesignCategories() {
    this.rfpAddressRec.seismicDesignCategory = this.seismicDesignCategories.filter(x => x.id == this.rfpAddressRec.idSeismicDesignCategory)[0];
  }


}