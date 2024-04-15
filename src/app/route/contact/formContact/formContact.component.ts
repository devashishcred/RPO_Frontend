import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

import { AddressTypeServices } from '../../../services/addressType.services';
import { CityServices } from '../../../services/city.services';
import { ContactLicenseTypeServices } from '../../../services/contactLicenseType.services';
import { ContactTitleServices } from '../../../services/contactTitle.services';
import { PrefixServices } from '../../../services/prefix.services';
import { SuffixServices } from '../../../services/suffix.services';
import { StateServices } from '../../../services/state.services';
import { Address } from '../../../types/address';
import { AddressType } from '../../../types/address';
import { City } from '../../../types/city';
import { CompanyItem } from '../../../types/company';
import { Contact, ContactDocument } from '../../../types/contact';
import { ContactLicense } from '../../../types/contactLicense';
import { ContactLicenseType } from '../../../types/contactLicense';
import { ContactTitle } from '../../../types/contactTitle';
import { Prefix, Suffix } from '../../../types/prefix';
import { State } from '../../../types/state';
import { arrayBufferToBase64, downloadFile, equals, isIE, onlyThisProperty } from '../../../utils/utils';
import { ContactServices } from '../contact.services';
import { CompanyServices } from '../../company/company.services';
import { Message } from '../../../app.messages';
import { API_URL } from '../../../app.constants';
import * as _ from 'underscore';
import * as moment from 'moment';
import { constantValues } from '../../../app.constantValues';
import { Company } from '../../../types/company';
import { AppComponent } from '../../../app.component';

declare const $: any

const blankAvatar = "./assets/photo-upload.png";

@Component({
  selector: '[form-contact]',
  templateUrl: './formContact.component.html'
})

/**
 * This component contains all function that are used in FormContactComponent
 * @class FormContactComponent
 */
export class FormContactComponent implements OnInit, OnDestroy {
  @Input() contact: Contact
  @Input() modalRef: BsModalRef
  @Input() onSave: Function
  @Input() idCompany: number

  rec: Contact
  address: Address
  private idxAddress: number = -1
  contactLicense: ContactLicense
  private idxContactLicense: number = -1
  private alreadyMailAddress: any
  showWarningMsg: boolean = false
  showPersonalWarningMsg: boolean = false
  disableThePrimaryCheckbox: boolean = false
  disableThePersonalCheckbox: boolean = false

  private cities: City[] = []
  states: State[] = []
  prefixes: Prefix[] = []
  suffixes: Suffix[] = []
  contactTitles: ContactTitle[] = []
  private contactLicenses: ContactLicense[] = []
  contactLicenseTypes: ContactLicenseType[] = []
  private addresses: Address[] = []
  addressTypes: AddressType[] = []
  companies: CompanyItem[] = []

  errorMessage: any
  loading: boolean = false
  requireAddLicence: boolean = false
  private profileImage: any
  private updatedProfileImage: any;
  private documents: any
  requireAddType: boolean = false
  private recCompany: Company
  private companyAddresses: Address[] = []
  private companyAddressTypes: any = []
  companyPrimaryAddresses: any = []
  private companyAddressType: number
  private mainAddressDisable: boolean = false

  constructor(
    private toastr: ToastrService,
    private prefixServices: PrefixServices,
    private contactTitlesServices: ContactTitleServices,
    private contactLicenseTypeServices: ContactLicenseTypeServices,
    private addressTypeServices: AddressTypeServices,
    private stateServices: StateServices,
    private cityServices: CityServices,
    private contactServices: ContactServices,
    private companyServices: CompanyServices,
    private message: Message,
    private constantValues: constantValues,
    private appComponent: AppComponent,
    private suffixServices: SuffixServices
  ) {
    this.errorMessage = this.message.msg;
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {

    this.rec = cloneDeep(this.contact)
    if (this.idCompany != null) {
      this.companyPrimaryAddresses = []
      this.companyServices.getById(this.idCompany).subscribe(r => {
        this.recCompany = r as Company
        this.companyAddresses = this.recCompany['addresses']
        this.companyPrimaryAddresses = [
          {
            id: this.companyAddresses[0].id,
            itemName: '[' + this.companyAddresses[0].addressType.name + '] ' + this.companyAddresses[0].address1 + ', ' + (this.companyAddresses[0].address2 != null ? this.companyAddresses[0].address2 + ', ' : "") + (this.companyAddresses[0].city != null ? this.companyAddresses[0].city + ', ' : "") + this.companyAddresses[0].state + ' ' + (this.companyAddresses[0].zipCode != null ? this.companyAddresses[0].zipCode : "")
          }
        ]
        for (let i = 1; i < this.companyAddresses.length; i++) {
          this.companyPrimaryAddresses.push({
            id: this.companyAddresses[i].id,
            itemName: '[' + this.companyAddresses[i].addressType.name + '] ' + this.companyAddresses[i].address1 + ', ' + (this.companyAddresses[i].address2 != null ? this.companyAddresses[i].address2 + ', ' : "") + (this.companyAddresses[i].city != null ? this.companyAddresses[i].city + ', ' : "") + this.companyAddresses[i].state + ' ' + (this.companyAddresses[i].zipCode != null ? this.companyAddresses[i].zipCode : "")
          });
        }
      })
    }
    this.contactLicense = {} as ContactLicense
    this.contactLicense.contactLicenseType = {} as ContactLicenseType;

    this.address = {} as Address
    this.documents = []
    if (!this.rec) {

      this.rec = {
        personalType: this.idCompany ? "2" : "1",
        addresses: [],
        documents: [],
        contactLicenses: [],
        imageAux: blankAvatar,
        idCompany: this.idCompany,
        isActive: true
      } as Contact

      if (this.rec.personalType == "2") {
        $('#personalTypeIndividual').prop("disabled", true);
        $('#idCompany').prop("disabled", true);
      }

      this.idCompany = null;
      this.contactLicense = {} as ContactLicense;
      this.address = {} as Address;
    } else {
      if (this.rec.id)
        this.contactServices.getById(this.rec.id).subscribe(r => {
          this.rec = r as Contact
          if (this.rec.birthDate) {
            this.rec.birthDate = moment(this.rec.birthDate).format(this.constantValues.DATEFORMAT);
          }
          if (this.contactLicense.expirationLicenseDate) {
            this.contactLicense.expirationLicenseDate = moment(this.contactLicense.expirationLicenseDate).format(this.constantValues.DATEFORMAT);
          }
          if (r.imageThumbUrl && r.imageThumbUrl != "")
            this.rec.imageAux = r.imageThumbUrl
          else
            this.rec.imageAux = blankAvatar
        })
      if (this.rec.idCompany != null) {
        this.companyAddressTypes = []
        this.companyAddressType = 0
        this.companyServices.getById(this.rec.idCompany).subscribe(r => {
          this.recCompany = r as Company
          this.companyAddresses = this.recCompany['addresses']
          this.companyPrimaryAddresses = [
            {
              id: this.companyAddresses[0].id,
              itemName: '[' + this.companyAddresses[0].addressType.name + '] ' + this.companyAddresses[0].address1 + ', ' + (this.companyAddresses[0].address2 != null ? this.companyAddresses[0].address2 + ', ' : "") + (this.companyAddresses[0].city != null ? this.companyAddresses[0].city + ', ' : "") + this.companyAddresses[0].state + ' ' + (this.companyAddresses[0].zipCode != null ? this.companyAddresses[0].zipCode : "")
            }
          ]
          for (let i = 1; i < this.companyAddresses.length; i++) {
            this.companyPrimaryAddresses.push({
              id: this.companyAddresses[i].id,
              itemName: '[' + this.companyAddresses[i].addressType.name + '] ' + this.companyAddresses[i].address1 + ', ' + (this.companyAddresses[i].address2 != null ? this.companyAddresses[i].address2 + ', ' : "") + (this.companyAddresses[i].city != null ? this.companyAddresses[i].city + ', ' : "") + this.companyAddresses[i].state + ' ' + (this.companyAddresses[i].zipCode != null ? this.companyAddresses[i].zipCode : "")
            });
          }
          this.showWarning('PrimaryCompany');
          this.showWarning('PrimaryPersonal');
        })
      }
      if (this.rec.addresses != null && this.rec.addresses.length > 0) {
        this.rec.addresses.forEach(element => {
          if (element.isMainAddress) {

            this.alreadyMailAddress = element
          }
        });
      }
      if (this.rec.isPrimaryCompanyAddress) {
        this.alreadyMailAddress = this.rec.isPrimaryCompanyAddress
      }
    }

    if (!this.states.length) {
      this.stateServices.getDropdown().subscribe(r => {
        this.states = _.sortBy(r, 'itemName');
      })
    }

    if (!this.cities.length) {
      this.cityServices.get().subscribe(r => {
        this.cities = r
      });
    }

    if (!this.prefixes.length) {
      if (this.rec.idPrefix) {
        this.prefixes.push({id: this.rec.idPrefix, name: this.rec.prefix.name} as Prefix);
      }


      this.prefixServices.getPrefixDropdown().subscribe(r => {
        this.prefixes = r
      });
    }
    if (!this.suffixes.length) {

      if (this.rec.idSuffix) {
        this.suffixes.push({id: this.rec.idSuffix, description: this.rec.suffix.description} as Suffix);
      }


      this.suffixServices.getSuffixDropdown().subscribe(r => {
        this.suffixes = r
      });
    }


    if (!this.contactTitles.length) {
      if (this.rec.idContactTitle)
        this.contactTitles.push({id: this.rec.idContactTitle, name: this.rec.contactTitle} as ContactTitle);

      this.contactTitlesServices.getContactTitleDD().subscribe(r => {
        this.contactTitles = _.sortBy(r, "itemName")
      });
    }
    if (!this.contactLicenseTypes.length) {
      this.contactLicenseTypeServices.getLicenceTypeDD().subscribe(r => {
        this.contactLicenseTypes = _.sortBy(r, "itemName")
      });
    }
    if (!this.addressTypes.length) {
      this.addressTypeServices.getDropdownData().subscribe(r => {
        this.addressTypes = _.sortBy(r, "displayOrder")
      });
    }
    if (!this.companies.length) {
      this.companyServices.getCompanyDropdown().subscribe(r => {
        this.companies = _.sortBy(r, "itemName")
      });
    }


    $('.zipCode').mask('00000', {})

    $('.phone-number').mask('(000) 000-0000', {
      // placeholder: '(   )    -    '
    })

    $('.phone-number').attr("pattern", "\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}$")
    if (isIE) {
      $('.rpo-image-border').on('click', function () {
        $(this).parent().trigger('click')
      })
    }
  }

  /**
   * This method will be destroy all elements and other values from whole module
   * @method ngOnDestroy
   */
  ngOnDestroy(): void {
    $('#contact-file-upload').parent().off('change');
    isIE && $('.rpo-image-border').off('click')
  }


  /**
   * This method is used to display show warning message
   * @method showWarning
   */
  showWarning(str: string) {
    if (str == 'PrimaryCompany') {
      if (this.rec.isPrimaryCompanyAddress) {
        this.alreadyMailAddress = this.rec.isPrimaryCompanyAddress
        this.rec.addresses.forEach(element => {
          if (element && element.isMainAddress) {
            element.isMainAddress = false;
            this.address.isMainAddress = false;
          } else {

          }
        });
      }

      this.disableThePersonalCheckbox = this.rec.isPrimaryCompanyAddress ? true : false;
    }
    if (str == 'PrimaryPersonal') {
      this.disableThePrimaryCheckbox = this.address.isMainAddress ? true : false;
    }

    if (this.alreadyMailAddress && this.address.isMainAddress || (this.alreadyMailAddress && this.rec.isPrimaryCompanyAddress)) {

      // IS PERSONAL ADDRESS
      if (this.alreadyMailAddress.id != undefined && this.alreadyMailAddress.id != this.address.id) {
        this.showPersonalWarningMsg = true

      } else {
        this.showPersonalWarningMsg = false
      }
      if (this.rec.addresses.length == 0) {
        this.showPersonalWarningMsg = false
      }
    } else {
      this.showPersonalWarningMsg = false
      this.showWarningMsg = false
    }
  }

  /**
   * This method is used to get state and city dropdown
   * @method onStateCityChange
   * @param {boolean} state request for getting state and dropdown
   */
  onStateCityChange(state: boolean) {
    const city = this.cities.find(c => c.id == this.address.idCity)

    if (city && city.idState != this.address.idState) {
      if (state)
        this.address.idCity = 0
      else
        this.address.idState = city.idState
    }
  }

  /**
   * This method is used for adding contact lincense
   * @method addContactLicense
   */
  addContactLicense() {
    if (this.rec.contactLicenses == null) {
      this.rec.contactLicenses = []
    }
    const cl = {...this.contactLicense}

    if (cl.idContactLicenseType != undefined) {
      this.requireAddLicence = false;
      cl.contactLicenseType = {...this.contactLicenseTypes.find(dt => dt.id == cl.idContactLicenseType)}

      if (this.idxContactLicense != -1) {
        this.rec.contactLicenses[this.idxContactLicense] = cl
        this.idxContactLicense = -1
      } else {
        this.rec.contactLicenses.unshift(cl)
      }

      this.contactLicense = {} as ContactLicense
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
  editContactLicense(cl: ContactLicense, idx: number) {
    this.contactLicense = {...cl}
    this.idxContactLicense = idx
  }

  /**
   * This method is used to delete records from model
   * @method deleteContactLicense
   * @param {ContactLicense} cl  cl object that we need to delete
   */
  deleteContactLicense(cl: ContactLicense) {
    this.rec.contactLicenses.splice(this.rec.contactLicenses.indexOf(cl), 1)
  }


  /**
   * This method is used set to set address as main address or not
   * @method addAddress
   */
  addAddress() {
    if (this.address.isMainAddress) {
      this.rec.addresses.forEach(element => {
        if (element.id && element.id == this.address.id) {

          element.isMainAddress = this.address.isMainAddress
        } else {
          element.isMainAddress = false
        }
      });
    }

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
    this.showWarningMsg = false
  }

  /**
   * This method is used to update existing address
   * @method editAddress
   * @param  {Address} ad type request Object
   * @param {number} idx id of address to be updated
   */
  editAddress(ad: Address, idx: number) {
    this.address = {...ad}
    this.idxAddress = idx
  }

  /**
   * This method is used to delete records from address
   * @method deleteAddress
   * @param {Address} ad  object of address
   */
  deleteAddress(ad: Address) {
    this.rec.addresses.splice(this.rec.addresses.indexOf(ad), 1)
  }

  /**
   *  Get single record from database
   * @method getDocumentById
   * @param {number} id id of {{name}} for getting specific record
   */
  private getDocumentById(id: number) {
    this.contactServices.getDocumentById(this.rec.id, id).subscribe(r => {
      var fileName = r.headers.get('Content-Disposition').split(';')[1].split('=')[1]
      var contentType = r.headers.get('Content-Type')
      downloadFile(r.body, contentType, fileName)
    }, e => {
    })
  }


  /**
   * This method is used to delete documents from document object
   * @method deleteDocument
   * @param {ContactDocument} d  d is used as a contact document objec
   */
  deleteDocument(d: ContactDocument) {
    if (d.id) {
      this.rec.documentsToDelete.push(d.id);
    }
    this.rec.documents.splice(this.rec.documents.indexOf(d), 1)
    this.documents.splice(this.rec.documents.indexOf(d), 1)
  }

  /**
   * This method is used for saving record in database
   * @method save
   */
  save() {
    this.loading = true;
    let address = null
    if (!this.idCompany && !equals(pickBy(this.address, identity), {})) {
      const $formAddress = $('#formAddress')
      if (!$formAddress[0].checkValidity()) {
        $formAddress.find(':submit').click()
        if (this.address.isMainAddress) {
          this.rec.addresses.forEach(element => {

            if (element.id && element.id == this.address.id) {
              element.isMainAddress = this.address.isMainAddress
            } else {
              element.isMainAddress = false
            }
          });
        }
        this.loading = false;
        return false;
      } else {
        address = this.address
        if (this.address.isMainAddress) {
          this.rec.addresses.forEach(element => {
            if (element.id && element.id == this.address.id) {
              element.isMainAddress = this.address.isMainAddress
            } else {
              element.isMainAddress = false
            }
          });
        }
      }
    }

    const rec = cloneDeep(this.rec)
    if (rec.contactLicenses) {
      for (let i = 0; i < rec.contactLicenses.length; i++) {
        if (rec.contactLicenses[i]['expirationLicenseDate']) {
          let contactLinceseDate = moment(rec.contactLicenses[i]['expirationLicenseDate']).format(this.constantValues.DATEFORMAT);
          rec.contactLicenses[i]['expirationLicenseDate'] = contactLinceseDate;
        }
      }
    }

    if (address) {
      if (this.idxAddress != -1)
        rec.addresses[this.idxAddress] = address
      else
        rec.addresses.unshift(address)
    }
    this.loading = true
    if (rec.addresses[0] && (!rec.addresses[0].idAddressType || !rec.addresses[0].idState || !rec.addresses[0].address1)) {
      this.requireAddType = true;
      this.loading = false;
      // this.toastr.error('Please select Address Properly', 'Error')
    } else {

      if (!rec.id) {
        this.contactServices.create(rec).subscribe(r => {
          let imagePromise = this.uploadProfileImage(r.id)
          imagePromise.then(value => {
            r.imageThumbUrl = this.updatedProfileImage;
            const contact = r as any
            if (this.onSave)
              this.onSave(contact, "2")
          })
          const contact = r as any
          if (window.location.pathname != "/company") { // when add contact open from comapny list it should not update data table
            if (this.onSave)
              this.onSave(contact, "1")
          }
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
        this.contactServices.update(rec.id, rec).subscribe(r => {
          let imagePromise = this.uploadProfileImage(r.id)
          imagePromise.then(value => {
            r.imageThumbUrl = this.updatedProfileImage;
            const contact = r as any
            if (this.onSave)
              this.onSave(contact, "2")
          })
          const contact = r as any
          if (this.onSave)
            this.onSave(contact, "2")

          //promise for documents
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

  /**
   * This method is used for changing the person type
   * @method changePersonalType
   */
  private changePersonalType() {
    if (this.rec.personalType == '2')
      this.rec.birthDate = void 0
  }

  /**
   * This method is used for selecting file and handling images
   * @method handleFileSelect
   * @param {any} evt evt is an image object which contains image properties
   */
  handleFileSelect(evt: any) {
    console.log(evt)
    var files = evt.target.files;
    var file = files[0];
    console.log(file)
    if (file) {
      this.profileImage = file;
      this.readUrl(evt.target, this.rec);
      this.base64(evt.target.files[0], this.rec, 'image');
    } else {
      this.profileImage = null
      this.rec.imageAux = blankAvatar
    }
  }

  /**
   * This method is used to read files from given URL
   * @method readUrl
   * @param {any} input type any which contains string that can be filtered from datatable
   * @param {Contact} rec rec is used as contact object
   */
  readUrl(input: any, rec: Contact) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e: any) {
        rec.imageAux = e.target.result;
      }

      reader.readAsDataURL(input.files[0]);
    }
  }

  /**
   * This method is used to convert image into base64 encode format
   * @method base64
   * @param {any} file file is an object of files which contains files various properties
   * @param {any} rec rec is an object of reader
   * @param {string} prop prop is used as string
   */
  private base64(file: any, rec: any, prop: string) {
    let reader = new FileReader()

    reader.onload = () => {
      rec[prop] = arrayBufferToBase64(reader.result)
    }
    reader.onerror = (error: any) => {
      this.toastr.error(error, 'Error')
    }
  }

  /**
   * This method is used for upload an image to server and database
   * @method uploadProfileImage
   * @param {number} id id of contact
   */
  private uploadProfileImage(id: number): Promise<{}> {
    return new Promise((resolve, reject) => {
      if (this.profileImage) {
        let formData = new FormData();
        formData.append('idContact', id.toString())
        formData.append('image', this.profileImage)
        this.contactServices.saveProfileImage(formData).subscribe(r => {
          this.updatedProfileImage = r.contactImagePath;
          resolve(null)
        }, e => {
          reject()
        })
      }
    })
  }

  /**
   * This method is used for uploading documents
   * @method uploadDocuments
   * @param {number} id id is used as a contact id
   */
  uploadDocuments(id: number): Promise<{}> {
    return new Promise((resolve, reject) => {
      if (this.documents && this.documents.length > 0) {
        let formData = new FormData();
        formData.append('idContact', id.toString())

        for (var i = 0; i < this.documents.length; i++) {
          formData.append('documents_' + i, this.documents[i])
        }
        this.contactServices.saveContactDocuments(formData).subscribe(r => {
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
   * This method is used for uploading documents
   * @method documentUpload
   * @param {any} evt evt is used as a file object
   */
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
   * This method is used for fetching address from company
   * @method fetchAddressFromCompany
   */
  fetchAddressFromCompany() {
    if (this.rec.idCompany != null) {
      this.companyServices.getById(this.rec.idCompany).subscribe(r => {
        this.recCompany = r as Company
        this.companyAddresses = this.recCompany['addresses']
        this.companyPrimaryAddresses = [
          {
            id: this.companyAddresses[0].id,
            itemName: '[' + this.companyAddresses[0].addressType.name + '] ' + this.companyAddresses[0].address1 + ', ' + (this.companyAddresses[0].address2 != null ? this.companyAddresses[0].address2 + ', ' : "") + (this.companyAddresses[0].city != null ? this.companyAddresses[0].city + ', ' : "") + this.companyAddresses[0].state + ' ' + (this.companyAddresses[0].zipCode != null ? this.companyAddresses[0].zipCode : "")
          }
        ]
        for (let i = 1; i < this.companyAddresses.length; i++) {
          this.companyPrimaryAddresses.push({
            id: this.companyAddresses[i].id,
            itemName: '[' + this.companyAddresses[i].addressType.name + '] ' + this.companyAddresses[i].address1 + ', ' + (this.companyAddresses[i].address2 != null ? this.companyAddresses[i].address2 + ', ' : "") + (this.companyAddresses[i].city != null ? this.companyAddresses[i].city + ', ' : "") + this.companyAddresses[i].state + ' ' + (this.companyAddresses[i].zipCode != null ? this.companyAddresses[i].zipCode : "")
          });
        }
        this.rec.isPrimaryCompanyAddress = false;
        this.rec.idPrimaryCompanyAddress = null;
      })
    } else {
      this.companyPrimaryAddresses = [];
      this.rec.idPrimaryCompanyAddress = null;
      this.rec.isPrimaryCompanyAddress = false;
      this.disableThePersonalCheckbox = this.rec.isPrimaryCompanyAddress ? true : false;
    }
  }

  switchCheckbox(AddressId: any) {
    if (AddressId == null) {
      this.rec.isPrimaryCompanyAddress = false;
      this.disableThePersonalCheckbox = this.rec.isPrimaryCompanyAddress ? true : false;
    }
  }

  /**
   * This method is used to check whether entered input contains only digits
   * @method isNumber
   * @param {any} evt evt is an object of element
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
   * This method is used for formatting phone number
   * @method formatPhone
   */

  formatPhone() {
    if (this.address.phone) {
      this.address.phone = this.appComponent.phoneFormat(this.address.phone)
    }
    if (this.rec.workPhone) {
      this.rec.workPhone = this.appComponent.phoneFormat(this.rec.workPhone)
    }
    if (this.rec.mobilePhone) {
      this.rec.mobilePhone = this.appComponent.phoneFormat(this.rec.mobilePhone)
    }
    if (this.rec.otherPhone) {
      this.rec.otherPhone = this.appComponent.phoneFormat(this.rec.otherPhone)
    }

  }
}