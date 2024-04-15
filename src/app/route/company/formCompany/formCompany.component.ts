import { equals, onlyThisProperty } from '../../../utils/utils';
import { State } from '../../../types/state';
import { City } from '../../../types/city';
import { CompanyServices } from '../company.services';
import { CityServices } from '../../../services/city.services';
import { StateServices } from '../../../services/state.services';
import { AddressTypeServices } from '../../../services/addressType.services';
import { ToastrService } from 'ngx-toastr';
import { Address, AddressType, ResponsibilityType } from '../../../types/address';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Company, CompanyType, CompanyDocuments } from '../../../types/company';
import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { cloneDeep, pickBy, identity } from 'lodash';
import { Message } from '../../../app.messages';
import * as _ from 'underscore';
import * as moment from 'moment';
import { constantValues } from '../../../app.constantValues';
import { convertUTCDateToLocalDate } from '../../../utils/utils';
import { AppComponent } from '../../../app.component';
import { SharedDataService } from '../../../app.constantValues';
import { TaskServices } from '../../task/task.services';
import { ContactLicense } from '../../../types/contactLicense';
import { ContactLicenseType } from '../../../types/contactLicense';
import { CompanyLicense } from '../../../types/companyType';
import { CompanyLicenseType } from '../../../types/contact';

declare const $: any

/**
 * This component contains all function that are used in this component
 * @class FormCompanyComponent
 */
@Component({
  selector: '[form-company]',
  templateUrl: './formCompany.component.html'
})
export class FormCompanyComponent implements OnInit {
  @Input() company: Company
  @Input() modalRef: BsModalRef
  @Input() onSave: Function
  @Input() onSaveCompany: Function
  @Input() fromContactDetails?: boolean;

  /**
   * View BIS Company List
   * @property viewBisCompanyList
   */
  @ViewChild('viewBisCompanyList', {static: true})
  private viewBisCompanyList: TemplateRef<any>

  modalRefViewBis: any
  public companyType: any = {
    1: "Home Owners",
    2: "Owner's REP",
    3: "Engineer",
    4: "Architect",
    5: "Asbestos Investigator",
    6: "DOB",
    7: "DOT",
    8: "DEP",
    9: "FDNY",
    10: "ECB",
    11: "SCA",
    12: "SBS",
    13: "State Agencies",
    14: "Property Managers",
    15: "Developers",
    16: "Consultants",
    17: "Lobbyist",
    18: "Special Inspection",
    19: "1/2/3 Family",
    20: "Safety Reg",
    21: "Demolition",
    22: "Construction",
    23: "Concrete"
  }
  private companyTypeLayout: any = {
    specialInspection: 18
  }
  rec: Company
  address: Address = {} as Address
  private idxAddress: number = -1

  private cities: City[] = []
  states: State[] = []
  private addresses: Address[] = []
  addressTypes: AddressType[] = []
  loading: boolean = false
  private companyTypes: any = []
  private cityAgency: any = []
  private contractorTypes: any = []
  errorMsg: any
  private companyTypeDropdown: any = []
  private testselectedItems2: any = []
  private bothExist: boolean = false
  isTwoTypesSelected: boolean = false
  dropdownList: CompanyType[] = [];
  private selectedItems: CompanyType[] = [];
  dropdownSettings: any = {};
  gcSelected: boolean = false;
  siSelected: boolean = false;
  caSelected: boolean = false;
  ctSelected: boolean = false;
  gcSubTypes: CompanyType[] = [];
  private allCompanyTypes: CompanyType[] = [];
  caSubTypes: CompanyType[] = [];
  tmpComType: CompanyType[] = [];
  tmpCompanySubTypes: any = [];
  tmpCitySubTypes: any = [];
  requireAddType: boolean = false
  private GC: boolean = false
  requireAddPhone: boolean = false
  private requireAddZip: boolean = false
  bisListOfCompanies: any[]
  addressFieldRequire: boolean = false
  private documents: any
  companyLicense: CompanyLicense
  private idxContactLicense: number = -1
  private companyLicenses: CompanyLicense[] = []
  companyLicenseTypes: CompanyLicenseType[] = []
  requireAddLicence: boolean = false
  responsibility: any = [];
  private responsibilityData: ResponsibilityType = {} as ResponsibilityType
  applicationPasswordType: string = 'password'

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
    private appComponent: AppComponent,
    public _SharedDataService: SharedDataService,
    private message: Message,
    private taskServices: TaskServices,
  ) {
    this.errorMsg = this.message.msg;
  }

  /**
   * This method will call when form loads first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.dropdownSettings = {
      singleSelection: false,
      text: "Company Types",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      badgeShowLimit: 2,
      tagToBody: false
    };

    document.title = 'Company'

    this.rec = cloneDeep(this.company)

    this.companyLicense = {} as CompanyLicense
    this.companyLicense.companyLicenseType = {} as CompanyLicenseType;
    // call all company types 
    if (!this.fromContactDetails) {
      if (this.rec.hicExpiry) {
        this.rec.hicExpiry = this.rec.hicExpiry ? this.taskServices.dateFromUTC(this.rec.hicExpiry, true) : '';
      }
      if (this.rec.trackingExpiry) {
        this.rec.trackingExpiry = this.rec.trackingExpiry ? this.taskServices.dateFromUTC(this.rec.trackingExpiry, true) : '';
      }
      if (this.rec.insuranceWorkCompensation) {
        this.rec.insuranceWorkCompensation = this.rec.insuranceWorkCompensation ? this.taskServices.dateFromUTC(this.rec.insuranceWorkCompensation, true) : '';
      }
      if (this.rec.insuranceDisability) {
        this.rec.insuranceDisability = this.rec.insuranceDisability ? this.taskServices.dateFromUTC(this.rec.insuranceDisability, true) : '';
      }
      if (this.rec.insuranceGeneralLiability) {
        this.rec.insuranceGeneralLiability = this.rec.insuranceGeneralLiability ? this.taskServices.dateFromUTC(this.rec.insuranceGeneralLiability, true) : '';
      }
      if (this.rec.dotInsuranceGeneralLiability) {
        this.rec.dotInsuranceGeneralLiability = this.rec.dotInsuranceGeneralLiability ? this.taskServices.dateFromUTC(this.rec.dotInsuranceGeneralLiability, true) : '';
      }
      if (this.rec.dotInsuranceWorkCompensation) {
        this.rec.dotInsuranceWorkCompensation = this.rec.dotInsuranceWorkCompensation ? this.taskServices.dateFromUTC(this.rec.dotInsuranceWorkCompensation, true) : '';
      }
      if (this.rec.specialInspectionAgencyExpiry) {
        this.rec.specialInspectionAgencyExpiry = this.rec.specialInspectionAgencyExpiry ? this.taskServices.dateFromUTC(this.rec.specialInspectionAgencyExpiry, true) : '';
      }
      if (this.rec.insuranceObstructionBond) {
        this.rec.insuranceObstructionBond = this.rec.insuranceObstructionBond ? this.taskServices.dateFromUTC(this.rec.insuranceObstructionBond, true) : '';
      }
      if (this.rec.ctExpirationDate) {
        this.rec.ctExpirationDate = this.rec.ctExpirationDate ? this.taskServices.dateFromUTC(this.rec.ctExpirationDate, true) : '';
      }
    }


    this.companyServices.getCompanyTypesDD().subscribe(r => {
      this.allCompanyTypes = r
      this.dropdownList = r.filter((x: any) => x.idParent == null)
      this.dropdownList = _.sortBy(this.dropdownList, 'itemName');
      // while edit set ctype ngmodel
      if (this.rec.companyTypes) {
        this.tmpComType = this.rec.companyTypes.filter(x => x.idParent == null)
        this.checkCompanyType(this.tmpComType);
      }
    })
    this.documents = []
    if (!this.rec) {
      this.rec = {
        addresses: []
      } as Company
      this.address = {} as Address
    } else {
      if (onlyThisProperty(this.rec, 'id'))
        this.companyServices.getById(this.rec.id).subscribe(r => {
          this.rec = r as Company
        })
      setTimeout(() => {
        this.address = {} as Address
      })
    }
    this.companyLicense = {} as CompanyLicense;
    // already saved subtype show checkbox
    if (this.rec.companyTypes) {
      this.checkCompanyType(this.rec.companyTypes);
    }
    $('.zipCode').mask('00000', {})
    $('.gcdate').mask('00/00/0000', {})
    $('.phone-number').mask('(000) 000-0000', {
      // placeholder: '(   )    -    '
    });
    $('.phone-number').attr("pattern", "\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}$")
    setTimeout(() => {
      $("[autofocus]").focus();
    });

    if (!this.states.length) {
      this.stateServices.getDropdown().subscribe(r => {
        this.states = _.sortBy(r, 'name');
      })
    }

    if (!this.cities.length) {
      this.cityServices.get().subscribe(r => {
        this.cities = r
      });
    }
    if (!this.addressTypes.length) {
      this.addressTypeServices.getDropdownData().subscribe(r => {
        this.addressTypes = _.sortBy(r, "displayOrder")
      });
    }
    if (!this.companyLicenseTypes.length) {
      this.companyServices.getCompanyLicenseTypesDD().subscribe(r => {
        this.companyLicenseTypes = _.sortBy(r, "itemName")
      });
    }

    this.companyServices.getResponsibilityDD().subscribe(r => {
      this.responsibility = _.sortBy(r, "id")
    })

  }

  /**
   * This method is used to change password type either text or password
   * @method togglePassword
   * @param {any} p p which contains template of password
   * @param {any} obj it contains input element
   */
  togglePassword(p: any, obj: any = null) {
    obj = obj || this;
    obj[p] = obj[p] == 'password' ? 'text' : 'password'
  }

  /**
   * Get selected item from multiselect dropdown
   * @method onItemSelect
   * @param {any} item selected item
   */
  onItemSelect(item: any) {
    this.checkCompanyType(this.rec.companyTypes);
  }

  /**
   *  Deselect item from multiselect dropdown
   * @method OnItemDeSelect
   * @param {any} item deselected item
   */
  OnItemDeSelect(item: any) {
    this.deSelectComType(item.id);
  }


  addContactLicense() {
    console.log(this.rec.companyLicenses);
    if (this.rec.companyLicenses == null) {
      this.rec.companyLicenses = []
    }
    const cl = {...this.companyLicense}
    console.log(cl);
    if (cl.idCompanyLicenseType != undefined) {
      this.requireAddLicence = false;
      cl.companyLicenseType = {...this.companyLicenseTypes.find(dt => dt.id == cl.idCompanyLicenseType)}

      if (this.idxContactLicense != -1) {
        this.rec.companyLicenses[this.idxContactLicense] = cl
        this.idxContactLicense = -1
        console.log(this.rec.companyLicenses);
      } else {
        this.rec.companyLicenses.unshift(cl);
        console.log(this.rec.companyLicenses);
      }

      this.companyLicense = {} as CompanyLicense
    } else {

      this.requireAddLicence = true;
    }
  }


  /**
   * This method is used to update existing contact license
   * @method editContactLicense
   * @param  {ContactLicense} cl contact license object
   * @param {number} idx id of contact licenese
   */
  editContactLicense(cl: CompanyLicense, idx: number) {
    this.companyLicense = {...cl}
    this.idxContactLicense = idx
  }

  /**
   * This method is used to delete records from model
   * @method deleteContactLicense
   * @param {ContactLicense} cl  cl object that we need to delete
   */
  deleteContactLicense(cl: CompanyLicense) {
    this.rec.companyLicenses.splice(this.rec.companyLicenses.indexOf(cl), 1)
  }

  /**
   * select on all in multiselect dropdown
   * @method onSelectAll
   * @param {any} items selected all items
   */
  onSelectAll(items: any) {
    this.checkCompanyType(this.rec.companyTypes);
  }

  /**
   * deselect on all in multiselect dropdown
   * @method onDeSelectAll
   * @param {any} items deselected all items
   */
  onDeSelectAll(items: any) {
    this.checkCompanyType(this.rec.companyTypes);
  }

  /**
   * This method calls when check or uncheck subtype checkbox push or splice data from rec.companyType
   * @method OnCheckboxSelect
   * @param {number} id ID of Company
   * @param {number} idParent ID of Company Type
   * @param {any} event event object
   */
  OnCheckboxSelect(id: number, idParent: number, event: any) {
    if (!this.rec.id && !this.rec.companyTypes) {
      if (!this.rec.companyTypes) {
        this.rec.companyTypes = [];
      }
      this.tmpComType.forEach((item, index) => {
        this.rec.companyTypes.push(this.tmpComType[index])
      });
    }
    let tempArr = this.allCompanyTypes.filter(x => x.id == id)[0]
    if (event.target.checked === true) {
      if (!this.rec.companyTypes) {
        this.rec.companyTypes = [];
      }
      this.rec.companyTypes.push(tempArr)
    }
    if (event.target.checked === false) {
      this.rec.companyTypes = this.rec.companyTypes.filter(item => item.id !== id);
    }
  }

  /**
   * This method will set all subtypes based on selection of company type
   * @method deSelectComType
   * @param {number} id ID of Company Type
   */
  private deSelectComType(id: number) {

    if (id == 12) {
      this.caSelected = false;
    }
    if (id == 13 || id == 34) {
      this.gcSelected = false;
    }
    if (id == 11) {
      this.siSelected = false;
    }
    if (id == 27) {
      this.ctSelected = false;
    }
    if (this.tmpComType) {
      let cTypes = this.tmpComType.filter(x => x.idParent == id)

      cTypes.forEach((type: any) => {
        let index = this.tmpComType.indexOf(type)
        delete this.tmpComType[index]
      })
      let mainCTypes = this.tmpComType.filter(x => x.id == id)[0]
      let cindex = this.tmpComType.indexOf(mainCTypes)
      delete this.tmpComType[cindex]
    }
    let gcType = this.tmpComType.filter(itemX => itemX.id == 13)
    let siType = this.tmpComType.filter(itemX => itemX.id == 11)
    let ctType = this.tmpComType.filter(itemX => itemX.id == 27)

    // select either gc or si or ct

    // ||
    //   (ctType && ctType.length > 0 && siType && siType.length > 0) ||
    //   (gcType && gcType.length > 0 && ctType && ctType.length > 0)

    if ((gcType && gcType.length > 0 && siType && siType.length > 0) ||
      (gcType && gcType.length > 0 && ctType && ctType.length > 0)) {
      this.isTwoTypesSelected = true
    } else {
      this.isTwoTypesSelected = false
    }
    if (this.rec.companyTypes) {
      this.rec.companyTypes = this.rec.companyTypes.filter(item => item.id !== id);
    }
  }

  /**
   * This method checks which company type is selected and based on that set subtypes of that type
   * @method checkCompanyType
   * @param {any} selectedType Company Type
   * @param {any} deSelect Flag to identify type is deselected
   */
  private checkCompanyType(selectedType: any, deSelect?: boolean) {
    if (!this.rec.companyTypes) {
      this.rec.companyTypes = [];
    }
    this.tmpComType.forEach((item, index) => {
      this.rec.companyTypes = this.rec.companyTypes.filter(itemX => itemX.id !== item.id);
      let gcType = this.tmpComType.filter(itemX => itemX.id == 13)
      let siType = this.tmpComType.filter(itemX => itemX.id == 11)
      let ctType = this.tmpComType.filter(itemX => itemX.id == 27)

      // select either gc or si or ct

      // ||
      //   (ctType && ctType.length > 0 && siType && siType.length > 0) ||
      //   (gcType && gcType.length > 0 && ctType && ctType.length > 0)

      if ((gcType && gcType.length > 0 && siType && siType.length > 0) ||
        (gcType && gcType.length > 0 && ctType && ctType.length > 0)) {
        this.isTwoTypesSelected = true
      } else {
        this.isTwoTypesSelected = false
        this.rec.companyTypes.push(this.tmpComType[index])
      }
    });

    this.gcSelected = false;
    this.caSelected = false;
    this.siSelected = false;
    this.ctSelected = false
    if (this.tmpComType.length > 0) {
      this.tmpComType.forEach((type: any) => {
        if (type.id == 13 || type.id == 34) {
          this.gcSelected = true;
          this.gcSubTypes = this.allCompanyTypes.filter(x => x.idParent == type.id)
        }
        if (type.id == 12) {
          this.caSelected = true;
          this.caSubTypes = this.allCompanyTypes.filter(x => x.idParent == type.id)
        }
        if (type.id == 11) {
          this.siSelected = true;
        }
        if (type.id == 27) {
          this.ctSelected = true
        }
      });
    }
    this.gcSubTypes.forEach((data: any) => {
      this.tmpCompanySubTypes[data.id] = {}
      if (this.rec.companyTypes) {
        let tmpSelectedType = this.rec.companyTypes.filter(x => x.id == data.id)
        if (tmpSelectedType.length > 0) {
          this.tmpCompanySubTypes[data.id].checked = true
        } else {
          this.tmpCompanySubTypes[data.id].checked = false
        }
      } else {
        this.tmpCompanySubTypes[data.id].checked = false
      }
    })

    this.caSubTypes.forEach((data: any) => {
      this.tmpCitySubTypes[data.id] = {}
      if (this.rec.companyTypes) {
        let tmpSelectedType = this.rec.companyTypes.filter(x => x.id == data.id)
        if (tmpSelectedType.length > 0) {
          this.tmpCitySubTypes[data.id].checked = true
        } else {
          this.tmpCitySubTypes[data.id].checked = false
        }
      } else {
        this.tmpCitySubTypes[data.id].checked = false
      }
    })
  }

  /**
   * This method will call when state is changed from address
   * @method onStateCityChange
   * @param {boolean} state Selected State
   */
  private onStateCityChange(state: boolean) {
    const city = this.cities.find(c => c.id == this.address.idCity)
    if (city && city.idState != this.address.idState) {
      $('#idCity')[0].setCustomValidity("");
      $('#idState')[0].setCustomValidity("");
      if (state)
        this.address.idCity = 0
      else
        this.address.idState = city.idState
    }
  }

  /**
   * This method add address of company
   * @method addAddress
   */
  addAddress() {
    const ad = {...this.address}
    if (ad && (!ad.idAddressType || !ad.idState || !ad.address1)) {
      this.requireAddType = true;
    } else {
      if (!(this.address.phone && this.address.phone.length != 14) || (this.address.zipCode && this.address.zipCode.length != 5)) {
        this.requireAddType = false;
        ad.addressType = {...this.addressTypes.find(dt => dt.id == ad.idAddressType)}
        ad.state = {...this.states.find(st => st.id == ad.idState)}.acronym

        if (this.idxAddress != -1) {
          this.rec.addresses[this.idxAddress] = ad
          this.idxAddress = -1
        } else {
          this.rec.addresses.unshift(ad)
        }
        this.address = {} as Address
      }
    }
  }

  /**
   * This method will edit address of company
   * @method editAddress
   * @param {Address} ad Address Object
   * @param {number} idx ID of Address
   */
  editAddress(ad: Address, idx: number) {
    this.address = {...ad}
    this.idxAddress = idx
  }

  /**
   * This method will delete company address
   * @method deleteAddress
   * @param {Address} ad Address Object
   */
  deleteAddress(ad: Address) {
    this.rec.addresses.splice(this.rec.addresses.indexOf(ad), 1)
  }

  /**
   * This method save company record in database
   * @method save
   */
  save() {
    let typeofcompany = this.rec.companyTypes.filter((type: any) => type.itemName == 'General Contractor');
    this.rec.companyTypes.forEach(x => {
      if (x.itemName == 'General Contractor') {
        this.GC = true;
      }
    })
    if (typeofcompany.length == 0 && this.GC) {
      this.rec.dotInsuranceGeneralLiability = null
      this.rec.dotInsuranceWorkCompensation = null
      this.rec.hicExpiry = null
      this.rec.hicNumber = null
      this.rec.ibmNumber = null
      this.rec.insuranceDisability = null
      this.rec.insuranceGeneralLiability = null
      this.rec.insuranceObstructionBond = null
      this.rec.insuranceWorkCompensation = null
      this.rec.specialInspectionAgencyExpiry = null
      this.rec.specialInspectionAgencyNumber = null
      this.rec.taxIdNumber = null
      this.rec.trackingExpiry = null
      this.rec.trackingNumber = null
      this.rec.responsibility = null
    }
    if (this.GC) {
      this.rec.trackingExpiry = $('#trackingExpiry').val();
      this.rec.hicExpiry = $('#hicExpiry').val();
      this.rec.insuranceDisability = $('#insuranceDisability').val();
      this.rec.insuranceGeneralLiability = $('#insuranceGeneralLiability').val();
      this.rec.insuranceObstructionBond = $('#insuranceObstructionBond').val();
      this.rec.insuranceWorkCompensation = $('#insuranceWorkCompensation').val();
      this.rec.dotInsuranceGeneralLiability = $('#dotInsuranceGeneralLiability').val();
      this.rec.dotInsuranceWorkCompensation = $('#dotInsuranceWorkCompensation').val();
      if (this.rec.idResponsibility) {
        const resName = this.responsibility.find((e: any) => e.id == this.rec.idResponsibility);
        this.rec.responsibilityName = resName.name;
      } else {
        this.rec.responsibilityName = null;
      }

    }
    if (this.siSelected) {
      this.rec.specialInspectionAgencyExpiry = $('#specialInspectionAgencyExpire').val();
    }
    if (this.ctSelected) {
      this.rec.ctExpirationDate = $('#ctExpirationDate').val();
    }
    // this.loading = true;
    const rec = cloneDeep(this.rec)
    if (rec.companyLicenses) {
      for (let i = 0; i < rec.companyLicenses.length; i++) {
        if (rec.companyLicenses[i]['expirationLicenseDate']) {
          let contactLinceseDate = moment(rec.companyLicenses[i]['expirationLicenseDate']).format(this.constantValues.DATEFORMAT);
          rec.companyLicenses[i]['expirationLicenseDate'] = contactLinceseDate;
        }
      }
    }
    console.log(this.rec);
    //company address
    let address = null
    if (!equals(pickBy(this.address, identity), {})) {
      const $formAddress = $('#formAddress')
      if (!$formAddress[0].checkValidity()) {
        $formAddress.find(':submit').click()
      } else {
        address = this.address
      }
    }
    if (address) {
      if (this.idxAddress != -1)
        rec.addresses[this.idxAddress] = address
      else
        rec.addresses.unshift(address)
    }
    //company type
    if (!rec.companyTypes) {
      rec.companyTypes = [];
    }

    if (rec.addresses[0] && (!rec.addresses[0].idAddressType || !rec.addresses[0].idState || !rec.addresses[0].address1)) {
      this.loading = false;
      this.requireAddType = true;
    } else {
      if (!rec.id) {
        this.companyServices.create(rec).subscribe(r => {
          const company = r as any
          if (this.onSave)
            this.onSave(company, "1")
          let chkPromise = this.uploadDocuments(r.id)
          chkPromise.then(value => {
            this.loading = false
            this.toastr.success('Record created successfully')
            this.modalRef.hide()
          })
        }, e => {
          this.loading = false
        })
      } else {
        this.companyServices.update(rec.id, rec).subscribe(r => {
          console.log('updated data', r);
          const company = r as any
          if (this.onSave)
            this.onSave(company, "2")
          let chkPromise = this.uploadDocuments(r.id)
          chkPromise.then(value => {
            this.loading = false
            this.toastr.success('Record updated successfully')
            this.modalRef.hide()
          })
        }, e => {
          this.loading = false
        })
      }
    }
  }

  documentUpload(evt: any) {
    if (this.rec.documents == null) {
      this.rec.documents = []
    }
    let files = evt.target.files;
    for (var i = 0; i < files.length; i++) {
      this.rec.documents.push(files[i])
      this.documents.push(files[i]);
    }
  }


  /**
   * This method is used for uploading documents
   * @method uploadDocuments
   * @param {number} id id is used as a comapny id
   */
  uploadDocuments(id: number): Promise<{}> {
    return new Promise((resolve, reject) => {
      if (this.documents && this.documents.length > 0) {
        let formData = new FormData();
        formData.append('idCompany', id.toString())

        for (var i = 0; i < this.documents.length; i++) {
          formData.append('documents_' + i, this.documents[i])
        }
        this.companyServices.saveCompanyDocuments(formData).subscribe(r => {
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
   * This method is used to delete documents from document object
   * @method deleteDocument
   * @param {ContactDocument} d  d is used as a contact document objec
   */
  deleteDocument(d: CompanyDocuments) {
    if (d.id) {
      this.rec.documentsToDelete.push(d.id);
    }
    this.rec.documents.splice(this.rec.documents.indexOf(d), 1)
    this.documents.splice(this.rec.documents.indexOf(d), 1)
  }

  /**
   * This method get company information from bis
   * @method getCompanyInfo
   * @param {any} cInfo Company Object
   */
  getCompanyInfo(cInfo: any) {
    if (typeof cInfo.name != 'undefined' && cInfo.name != '') {
      this.loading = true;
      let companyTypeText = ''
      let businessName = cInfo.name.toUpperCase();
      var companyTypes = cInfo.companyTypes;
      var gcCompanyType = companyTypes.filter((type: any) => type.id == 13);
      var SiaCompanyType = companyTypes.filter((type: any) => type.id == 11);
      var ctCompanyType = companyTypes.filter((type: any) => type.id == 27);
      let licenceNumber = null;
      if (gcCompanyType.length > 0) {
        companyTypeText = 'GENERAL CONTRACTOR';
        licenceNumber = cInfo.trackingNumber;
      } else if (SiaCompanyType.length > 0) {
        companyTypeText = 'SPECIAL INSPECTION AGENCY';
        licenceNumber = cInfo.specialInspectionAgencyNumber;
      } else if (ctCompanyType.length > 0) {
        companyTypeText = 'CONCRETE TESTING LAB';
        licenceNumber = cInfo.ctLicenseNumber;
      }

      if (companyTypeText != '') {
        this.companyServices.getBusinessFromBis(businessName, companyTypeText, licenceNumber).subscribe(data => {
          data = JSON.parse(data);
          if (data && data.length >= 1) {
            this.bisListOfCompanies = data;
            this.loading = false;
            this.openModalBisCompanyList(this.viewBisCompanyList)
          } else {
            this.loading = false;
            this.toastr.info(this.errorMsg.noResultForBis);
          }
        }, err => {
          this.loading = false;
        });
      }
    }
  }

  /**
   * This method update all fields in company form which is fetched from BIS
   * @method updateFormFieldsFromBIS
   * @param {any} res BIS Result
   */
  updateFormFieldsFromBIS(res: any) {
    this.gcSubTypes.forEach((data: any) => {
      this.tmpCompanySubTypes[data.id] = {}
      if (this.allCompanyTypes) {
        let tmpSelectedType = this.allCompanyTypes.filter(x => x.id == data.id)
        if (tmpSelectedType.length > 0) {
          if (res.companyBISInfo.endorsementsDemolition && tmpSelectedType[0].itemName == 'Demolition') {
            this.tmpCompanySubTypes[data.id].checked = true
            tmpSelectedType[0]['children'] = [];
            this.rec.companyTypes.push(tmpSelectedType[0])
          }
          if (res.companyBISInfo.endorsementsConstruction && tmpSelectedType[0].itemName == 'Construction') {
            this.tmpCompanySubTypes[data.id].checked = true
            tmpSelectedType[0]['children'] = [];
            this.rec.companyTypes.push(tmpSelectedType[0])
          }
          if (res.companyBISInfo.endorsementsConcrete && tmpSelectedType[0].itemName == 'Concrete') {
            this.tmpCompanySubTypes[data.id].checked = true
            tmpSelectedType[0]['children'] = [];
            this.rec.companyTypes.push(tmpSelectedType[0])
          }
        }
      }
    });
    if (res.addressInfo) {
      if (this.address.phone && this.address.phone.length != 14) {
        this.requireAddPhone = true;
        this.addressFieldRequire = true;
      }
      if (this.address.zipCode && this.address.zipCode.length != 5) {
        this.requireAddZip = true;
        this.addressFieldRequire = true;
      }
      if (!this.address.idAddressType || !this.address.idState || !this.address.address1) {
        this.requireAddType = true;
        this.addressFieldRequire = true;
      }
    }
  }

  /**
   * This method open popup for matching Company list
   * @method openModalBisCompanyList
   * @param {TemplateRef} template TemplateRef Object
   */
  private openModalBisCompanyList(template: TemplateRef<any>) {
    this.modalRefViewBis = this.modalService.show(template, {class: 'modal-bisCompany-task'})
  }

  /**
   * This method select company type
   * @method selectCompanyTypeFn
   * @param {any} value company type
   * @param {any} event Event object
   */
  private selectCompanyTypeFn(value: any, event: any) {
    if (event.target.checked) {
      this.cityAgency.push(value);
    } else if (!event.target.checked) {
      let indexx = this.cityAgency.indexOf(value);
      this.cityAgency.splice(indexx, 1);
    }
  }

  /**
   * This method will format phone number
   */
  formatPhone() {
    this.address.phone = this.appComponent.phoneFormat(this.address.phone)
  }

  /**
   * This method checks given data is number or not
   * @method isNumber
   * @param {any} evt request data
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
   * This method checks address require fields
   * @method checkAddressFields
   * @param {any} fieldVal Value of Field
   */
  checkAddressFields(fieldVal: any) {
    if (!fieldVal) {
      this.addressFieldRequire = true;
    } else {
      this.addressFieldRequire = false;
    }
  }

}