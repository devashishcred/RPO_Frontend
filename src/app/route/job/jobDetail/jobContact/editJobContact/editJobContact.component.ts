import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { RelatedJob } from '../../../../../types/relatedJob';
import { JobContactServices } from '../JobContact.service';
import * as _ from 'underscore';
import { Job } from '../../../../../types/job';

import { AddressTypeServices } from '../../../../../services/addressType.services';
import { CityServices } from '../../../../../services/city.services';
import { ContactLicenseTypeServices } from '../../../../../services/contactLicenseType.services';
import { ContactTitleServices } from '../../../../../services/contactTitle.services';
import { PrefixServices } from '../../../../../services/prefix.services';
import { SuffixServices } from '../../../../../services/suffix.services';
import { StateServices } from '../../../../../services/state.services';
import { Address } from '../../../../../types/address';
import { AddressType } from '../../../../../types/address';
import { City } from '../../../../../types/city';
import { CompanyItem } from '../../../../../types/company';
import { Contact, ContactDocument } from '../../../../../types/contact';
import { ContactLicense } from '../../../../../types/contactLicense';
import { ContactLicenseType } from '../../../../../types/contactLicense';
import { ContactTitle } from '../../../../../types/contactTitle';
import { Prefix, Suffix } from '../../../../../types/prefix';
import { State } from '../../../../../types/state';
import { arrayBufferToBase64, downloadFile, equals, isIE, onlyThisProperty } from '../../../../../utils/utils';
import { Message } from '../../../../../app.messages';
import { API_URL } from '../../../../../app.constants';
import { CompanyServices } from '../../../../company/company.services';
import { JobContact } from '../../../../../types/jobContact';
import { Company } from '../../../../../types/company';
import * as moment from 'moment';
import { TaskServices } from '../../../../task/task.services';
import { constantValues } from '../../../../../app.constantValues';

declare const $: any

const blankAvatar = "";


@Component({
  selector: '[edit-job-contact]',
  templateUrl: './editJobContact.component.html'
})

export class EditJobContactComponent {
  @Input() modalRef: BsModalRef
  @Input() onSave: Function
  @Input() idJob: number
  @Input() reload: Function
  @Input() jobContact: JobContact
  private idCompany: number

  loading: boolean = false
  private dropdownList: any = [];
  private dropdownSettings: any = {};
  rec: Contact
  private recJobContact: JobContact
  address: Address
  private idxAddress: number = -1
  contactLicense: ContactLicense
  private idxContactLicense: number = -1

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
  requireAddLicence: boolean = false
  private profileImage: any
  private updatedProfileImage: any;
  private documents: any
  requireAddType: boolean = false
  private recCompany: Company
  private companyAddresses: Address[] = []
  companyAddressTypes: any =[]
  companyAddressType: number

  //job association
  private selectCompany: number
  private company: Company[] = []
  private companydropdownList: any = [];
  private selectContact: number
  private contact: Contact[] = []
  selectContactType: number
  private contactdropdownList: any = [];
  private contactAddress: any[] = []
  private contactAddressdropdownList: any = [];
  private selectContactAddress: number
  private contactType: any[] = []
  contactTypedropdownList: any = [];
  billingClient: boolean = false
  mainClient: boolean = false

  constructor(
    private toastr: ToastrService,
    private JobContactService: JobContactServices,
    private prefixServices: PrefixServices,
    private contactTitlesServices: ContactTitleServices,
    private contactLicenseTypeServices: ContactLicenseTypeServices,
    private addressTypeServices: AddressTypeServices,
    private stateServices: StateServices,
    private cityServices: CityServices,
    private message: Message,
    private suffixServices: SuffixServices,
    private companyServices: CompanyServices,
    private constantValues: constantValues,
    private taskServices: TaskServices,

  ) {
    this.errorMessage = this.message.msg;
  }

  ngOnInit() {
    this.dropdownSettings = {
      singleSelection: false,
      text: "Contacts",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: false,
      classes: "myclass custom-class"
    };
    document.title = 'Project'
    //contact form

    this.contactLicense = {} as ContactLicense
    this.contactLicense.contactLicenseType = {} as ContactLicenseType;
    this.address = {} as Address
    this.documents = []
    this.recJobContact = cloneDeep(this.jobContact)

    this.rec = this.recJobContact['contact']
    if (this.contactLicense.expirationLicenseDate) {
      this.contactLicense.expirationLicenseDate = this.taskServices.dateFromUTC( this.contactLicense.expirationLicenseDate,true);
    }
    //pre fill company address
    if(this.rec.idCompany != null){
      this.companyAddressTypes = []
      this.companyAddressType = 0
      this.companyServices.getById(this.rec.idCompany).subscribe(r => {
        this.recCompany = r as Company
        this.companyAddresses = this.recCompany['addresses']
        if(this.companyAddresses.length > 0 && this.companyAddresses.length == 1){
          //prefill address
          this.address.idAddressType = this.companyAddresses[0].addressType.id
          this.address.address1 = this.companyAddresses[0].address1
          this.address.address2 = this.companyAddresses[0].address2
          this.address.city = this.companyAddresses[0].city
          this.address.idState = this.companyAddresses[0].idState
          this.address.zipCode = this.companyAddresses[0].zipCode
          this.address.phone = this.companyAddresses[0].phone
        }
        if(this.companyAddresses.length > 1){
          for (let i = 0; i < this.companyAddresses.length; i++) {
            this.companyAddressTypes.push({ "id": this.companyAddresses[i].id, "itemName": '['+this.companyAddresses[i].addressType.name+'] '+ this.companyAddresses[i].address1+', '+ (this.companyAddresses[i].address2 != null ? this.companyAddresses[i].address2 +', ': "")+ (this.companyAddresses[i].city != null ? this.companyAddresses[i].city+', ' : "")+ this.companyAddresses[i].state+' '+ (this.companyAddresses[i].zipCode != null ? this.companyAddresses[i].zipCode : "")});
          }
        }      
      })
    }    

    if (this.rec.birthDate) {
      this.rec.birthDate = moment(this.rec.birthDate).format(this.constantValues.DATEFORMAT);
    }

    if (this.rec.imageThumbUrl && this.rec.imageThumbUrl != "")
      this.rec.imageAux = this.rec.imageThumbUrl
    else
      this.rec.imageAux = blankAvatar

    if (!this.states.length) {
      this.stateServices.get().subscribe(r => {
        this.states = _.sortBy(r['data'], 'name');
      })
    }

    if (!this.cities.length) {
      this.cityServices.get().subscribe(r => {
        this.cities = r
      });
    }

    if (!this.prefixes.length) {
      if (this.rec.idPrefix)
        this.prefixes.push({ id: this.rec.idPrefix, name: this.rec.prefix.name } as Prefix);

      this.prefixServices.getPrefixDropdown().subscribe(r => {
        this.prefixes = r
      });
    }
    if (!this.suffixes.length) {
      if (this.rec.idSuffix)
        this.suffixes.push({ id: this.rec.idSuffix, description: this.rec.suffix.description } as Suffix);

      this.suffixServices.getSuffixDropdown().subscribe(r => {
        this.suffixes = r
      });
    }



    if (!this.contactTitles.length) {
      if (this.rec.idContactTitle)
        this.contactTitles.push({ id: this.rec.idContactTitle, name: this.rec.contactTitle } as ContactTitle);
        this.contactTitlesServices.getContactTitleDD().subscribe(r => {
          this.contactTitles = _.sortBy(r,"itemName")
        });
    }
    if (!this.contactLicenseTypes.length) {
      this.contactLicenseTypeServices.getLicenceTypeDD().subscribe(r => {
        this.contactLicenseTypes = _.sortBy(r,"itemName")
      });
    }
    if (!this.addressTypes.length) {
      this.addressTypeServices.getDropdownData().subscribe(r => {
        this.addressTypes = _.sortBy(r,"displayOrder")
      });
    }
    if (!this.companies.length) {
      this.companyServices.getCompanyDropdown().subscribe(r => {
        this.companies = _.sortBy(r,"itemName")
      });
    }

    $('.zipCode').mask('00000', {

    })

    $('.phone-number').mask('(000) 000-0000', {
      // placeholder: '(   )    -    '
    })

    $('.phone-number').attr("pattern", "\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}$")
    if (isIE) {
      $('.rpo-image-border').on('click', function () {
        $(this).parent().trigger('click')
      })
    }
    //job association
    this.getCompany();
    this.getJobContactTypes();
    this.selectCompany = this.recJobContact['jobContact'].idCompany != null ? this.recJobContact['jobContact'].idCompany : -1
    if (this.recJobContact['jobContact'].idCompany != null) {
      this.getContact(this.recJobContact['jobContact'].idCompany)
    } else {
      this.getContact(-1)
    }
    this.selectContact = this.recJobContact['jobContact'].idcontact
    if (this.recJobContact['jobContact'].idcontact != null) {
      this.getContactAddress(this.recJobContact['jobContact'].idcontact)
    }
    this.selectContactType = this.recJobContact['jobContact'].idJobContactType
    this.selectContactAddress = this.recJobContact['jobContact'].idAddress
    this.mainClient = this.recJobContact['jobContact'].isMainContact
    this.billingClient = this.recJobContact['jobContact'].isBilling
  }
  //job association functions start
  /**
  * get all job contact Type - selectContact
  */
  private getJobContactTypes() {
    this.JobContactService.getAllJobContactType().subscribe(r => {
      this.contactType = _.sortBy(r['data'], 'name');
      for (let i = 0; i < this.contactType.length; i++) {
        this.contactTypedropdownList.push({ "id": this.contactType[i].id, "itemName": this.contactType[i].name });
      }
    })
  }
  /**
  * get all company list - selectCompany
  */
  private getCompany() {
    this.JobContactService.getAllCompany().subscribe(r => {
      this.loading = false
      this.company = _.sortBy(r, 'name');
      this.companydropdownList.push({ "id": -1, "itemName": "Individual" });
      for (let j = 0; j < this.company.length; j++) {
        this.companydropdownList.push({ "id": this.company[j].id, "itemName": this.company[j].name });
      }
    })
  }

  /**
  * get all contact list - selectContact
  */
  private getContact(selectCompany: number) {
    this.contactdropdownList = []
    this.JobContactService.getAllContact(selectCompany).subscribe(r => {
      this.contact = _.sortBy(r, 'firstName');
      for (let k = 0; k < this.contact.length; k++) {
        this.contactdropdownList.push({ "id": this.contact[k].id, "itemName": this.contact[k].firstName + ' ' + this.contact[k].lastName });
      }
    })
  }

  /**
  * get all address list of contact
  */
  private getContactAddress(selectContact: number) {
    this.contactAddressdropdownList = [];
    this.JobContactService.getAllContactAddress(selectContact).subscribe(r => {
      this.contactAddress = r['addresses'];
      for (let l = 0; l < this.contactAddress.length; l++) {
        this.contactAddressdropdownList.push({ "id": this.contactAddress[l].id, "itemName": this.contactAddress[l].address1 + ', ' + this.contactAddress[l].address2 + ', ' + this.contactAddress[l].city + ', ' + this.contactAddress[l].state });
      }
    })
  }
  //job association functions complete
  ngOnDestroy(): void {
    $('#contact-file-upload').parent().off('change');
    isIE && $('.rpo-image-border').off('click')
  }

  onStateCityChange(state: boolean) {
    const city = this.cities.find(c => c.id == this.address.idCity)

    if (city && city.idState != this.address.idState) {
      if (state)
        this.address.idCity = 0
      else
        this.address.idState = city.idState
    }
  }

  addContactLicense() {
    if (this.rec.contactLicenses == null) {
      this.rec.contactLicenses = []
    }
    const cl = { ...this.contactLicense }

    if (cl.idContactLicenseType != undefined) {
      this.requireAddLicence = false;
      cl.contactLicenseType = { ... this.contactLicenseTypes.find(dt => dt.id == cl.idContactLicenseType) }

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

  editContactLicense(cl: ContactLicense, idx: number) {
    this.contactLicense = { ...cl }
    this.idxContactLicense = idx
  }

  deleteContactLicense(cl: ContactLicense) {
    this.rec.contactLicenses.splice(this.rec.contactLicenses.indexOf(cl), 1)
  }

  addAddress() {
    const ad = { ...this.address }
    if (ad && (!ad.idAddressType || !ad.idState || !ad.address1)) {
      this.requireAddType = true;
    } else {
      if (!(this.address.phone && this.address.phone.length != 14) || (this.address.zipCode && this.address.zipCode.length != 5)) {
        this.requireAddType = false;
        ad.addressType = { ... this.addressTypes.find(dt => dt.id == ad.idAddressType) }
        ad.state = { ... this.states.find(st => st.id == ad.idState) }.acronym

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

  editAddress(ad: Address, idx: number) {
    this.address = { ...ad }
    this.idxAddress = idx
  }

  deleteAddress(ad: Address) {
    this.rec.addresses.splice(this.rec.addresses.indexOf(ad), 1)
  }

  private getDocumentById(id: number) {
    this.JobContactService.getDocumentById(this.rec.id, id).subscribe(r => {
      var fileName = r.headers.get('Content-Disposition').split(';')[1].split('=')[1]
      var contentType = r.headers.get('Content-Type')
      downloadFile(r.body, contentType, fileName)
    }, e => {
    })
  }

  deleteDocument(d: ContactDocument) {
    if (d.id) {
      this.rec.documentsToDelete.push(d.id);
    }
    this.rec.documents.splice(this.rec.documents.indexOf(d), 1)
    this.documents.splice(this.rec.documents.indexOf(d), 1)
  }

  private changePersonalType() {
    if (this.rec.personalType == '2')
      this.rec.birthDate = void 0
  }


  handleFileSelect(evt: any) {
    var files = evt.target.files;
    var file = files[0];
    this.profileImage = file;
    this.readUrl(evt.target, this.rec);
    this.base64(evt.target.files[0], this.rec, 'image');

  }
  private readUrl(input: any, rec: Contact) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e: any) {
        rec.imageAux = e.target.result;
      }

      reader.readAsDataURL(input.files[0]);
    }
  }

  private base64(file: any, rec: any, prop: string) {
    let reader = new FileReader()

    reader.onload = () => {
      rec[prop] = arrayBufferToBase64(reader.result)
    }
    reader.onerror = (error: any) => {
      this.toastr.error(error, 'Error')
    }
  }

  private uploadProfileImage(id: number): Promise<{}> {
    return new Promise((resolve, reject) => {
      if (this.profileImage) {
        let formData = new FormData();
        formData.append('idContact', id.toString())
        formData.append('image', this.profileImage)
        this.JobContactService.saveProfileImage(formData).subscribe(r => {
          this.updatedProfileImage = r.contactImagePath;
          resolve(null)
        }, e => {
          reject()
        })
      }
    })
  }
  uploadDocuments(id: number): Promise<{}> {
    return new Promise((resolve, reject) => {
      if (this.documents && this.documents.length > 0) {
        let formData = new FormData();
        formData.append('idContact', id.toString())
  
        for (var i = 0; i < this.documents.length; i++) {
          formData.append('documents_' + i, this.documents[i])
        }
        this.JobContactService.saveContactDocuments(formData).subscribe(r => {
          resolve(null)
        }, e => { 
          reject()
        })
      }else{
        resolve(null)
      }
    })    
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

  applyContactFilter() {

  }
  onItemSelect(item: any) {
    this.applyContactFilter()
  }
  OnItemDeSelect(item: any) {
    this.applyContactFilter()
  }
  onSelectAll(items: any) {
    this.applyContactFilter()
  }
  onDeSelectAll(items: any) {
    this.applyContactFilter()
  }

  save() {
    this.loading = true;
    let address = null
    if (!equals(pickBy(this.address, identity), {})) {
      const $formAddress = $('#formAddress')

      if (!$formAddress[0].checkValidity()) {
        $formAddress.find(':submit').click()
        return;
      } else {
        address = this.address
      }
    }

    const rec = cloneDeep(this.rec)
    
    if (address) {
      if (this.idxAddress != -1)
        rec.addresses[this.idxAddress] = address
      else
        rec.addresses.unshift(address)
    }
    
    //job association data
    let JobContactData = {};
    if (this.selectCompany == -1) {
      JobContactData = {
        "idContact": this.recJobContact['jobContact'].idcontact,
        "idJobContactType": this.selectContactType,
        "idAddress": this.recJobContact['jobContact'].idAddress,
        "isBilling": this.billingClient,
        "isMainCompany": this.mainClient
      }
    } else {
      JobContactData = {
        "idCompany": rec.idCompany,
        "idContact": this.recJobContact['jobContact'].idcontact,
        "idJobContactType": this.selectContactType,
        "idAddress": this.recJobContact['jobContact'].idAddress,  
        "isBilling": this.billingClient,
        "isMainCompany": this.mainClient
      }
    }



    this.recJobContact['jobContact'] = JobContactData

    if (this.recJobContact['contact'].contactLicenses && this.recJobContact['contact'].contactLicenses.length > 0) {
      for (let i = 0; i < this.recJobContact['contact'].contactLicenses.length; i++) {
        if(this.recJobContact['contact'].contactLicenses[i]['expirationLicenseDate']){
          let contactLinceseDate = moment(this.recJobContact['contact'].contactLicenses[i]['expirationLicenseDate']).format(this.constantValues.DATEFORMAT);
          this.recJobContact['contact'].contactLicenses[i]['expirationLicenseDate'] = contactLinceseDate
        }
      }
    }

    this.JobContactService.update(this.idJob, this.recJobContact['id'], this.recJobContact).subscribe(r => {
      let imagePromise = this.uploadProfileImage(rec.id)
      imagePromise.then(value => {
        r.imageThumbUrl = this.updatedProfileImage;
      })
      //promise for documents
      let chkPromise = this.uploadDocuments(rec.id)
      chkPromise.then(value => {
        this.loading = false
        this.toastr.success('Record updated successfully')
        this.reload()
        this.modalRef.hide()
      })
    }, e => {
      this.loading = false
    })

    this.modalRef.hide()

  }

  fetchAddressFromCompany(){
    this.companyAddressTypes = []
    this.companyAddressType = 0
    this.address.idAddressType = 0
    this.address.address1 = ''
    this.address.address2 = ''
    this.address.city = ''
    this.address.idState = 0
    this.address.zipCode = ''
    this.address.phone = ''
    if(this.rec.idCompany != null){
      this.companyServices.getById(this.rec.idCompany).subscribe(r => {
        this.recCompany = r as Company
        this.companyAddresses = this.recCompany['addresses']
        if(this.companyAddresses.length > 0 && this.companyAddresses.length == 1){
          //prefill address
          this.address.idAddressType = this.companyAddresses[0].addressType.id
          this.address.address1 = this.companyAddresses[0].address1
          this.address.address2 = this.companyAddresses[0].address2
          this.address.city = this.companyAddresses[0].city
          this.address.idState = this.companyAddresses[0].idState
          this.address.zipCode = this.companyAddresses[0].zipCode
          this.address.phone = this.companyAddresses[0].phone
        }else{
          for (let i = 0; i < this.companyAddresses.length; i++) {
            this.companyAddressTypes.push({ "id": this.companyAddresses[i].id, "itemName": '['+this.companyAddresses[i].addressType.name+'] '+ this.companyAddresses[i].address1+', '+ (this.companyAddresses[i].address2 != null ? this.companyAddresses[i].address2 +', ': "")+ (this.companyAddresses[i].city != null ? this.companyAddresses[i].city+', ' : "")+ this.companyAddresses[i].state+' '+ (this.companyAddresses[i].zipCode != null ? this.companyAddresses[i].zipCode : "")});
          }
        }      
      })
    }  
   }

  fillAddressFromCompany(){
    let prefillAddress = this.companyAddresses.filter(x => x.id == this.companyAddressType)
    //prefill address
    this.address.idAddressType = prefillAddress[0].addressType.id
    this.address.address1 = prefillAddress[0].address1
    this.address.address2 = prefillAddress[0].address2
    this.address.city = prefillAddress[0].city
    this.address.idState = prefillAddress[0].idState
    this.address.zipCode = prefillAddress[0].zipCode
    this.address.phone = prefillAddress[0].phone
    //set blank company address type
   }
}