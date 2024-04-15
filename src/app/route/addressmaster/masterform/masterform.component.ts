import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { AddressMasterServices } from '../addressmaster.services';
import { Address } from '../../../types/address';
import { Message } from "../../../app.messages";
import { borough } from '../../../types/borough';
import { BoroughServices } from '../../../services/borough.services';
import { Contact } from '../../../types/contact';
import { Company } from '../../../types/company';
import { ContactTitle } from '../../../types/contactTitle';
import { CompanyServices } from '../../company/company.services';
import { ContactTitleServices } from '../../../services/contactTitle.services';
import { ContactServices } from '../../contact/contact.services';
import { OccuClasificationsServices } from '../../../services/OccuClassification.services';
import { ConstClasificationsServices } from '../../../services/ConstClassification.services';
import { multipleDwellingClassificationsServices } from '../../../services/MultiDwellingClassifications.services';
import { PrimaryStructuralSystemsServices } from '../../../services/PrimaryStructuralSystems.services';
import {
  StructureOccupancyCategoriesServices
} from '../../structureoccupancycategories/structureoccupancycategories.services';
import { SeismicDesignCategoriesServices } from '../../seismicdesigncategories/seismicdesigncategories.services';
import { AddressTypeServices } from '../../../services/addressType.services';
import { AddressType } from '../../../types/address';

import * as _ from 'underscore';

declare const $: any

@Component({
  selector: '[add-master]',
  templateUrl: './masterform.component.html',
  styleUrls: ['./masterform.component.scss']
})
export class MasterformComponent implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() addressId: number

  address: Address
  loading: boolean = false
  errorMsg: any
  companies: Company[] = []
  boroughs: borough[] = []
  private contactTitles: ContactTitle[] = []
  private contacts: Contact[] = []
  addressTypes: AddressType[] = []
  contactList: any
  displayGetInfo: boolean;
  selectUndefinedOptionValue: any;
  

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private boroughServices: BoroughServices,
    private companyService: CompanyServices,
    private contactTitlesServices: ContactTitleServices,
    private contactService: ContactServices,
    private addressTypeServices: AddressTypeServices,
    private addressMasterServices: AddressMasterServices,
  ) {
    this.errorMsg = this.message.msg
  }

  ngOnInit() {
    document.title = 'Address'
    this.address = {} as Address
    this.getBoroughs();
    this.getCompanies();
    this.getContacts();
    this.telephoneVal();
    this.getAddressType();


    if (this.addressId && this.addressId > 0) {
      this.loading = true
      this.addressMasterServices.getById(this.addressId).subscribe(r => {
        this.address = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }

  getAddressType() {
    this.addressTypeServices.getDropdownData().subscribe(r => {
      this.addressTypes = _.sortBy(r, "itemName")
    });
  }


  /**
   * get all comapny list
   */
  private getCompanies() {
    if (!this.companies.length) {
      this.companyService.getCompanyData().subscribe(r => {
        this.companies = _.sortBy(r.data, function (i: any) {
          return i.name.toLowerCase();
        });
      })
    }

  }

  /**
   * get all contacts list
   */
  private getContacts() {
    if (!this.contacts.length) {
      this.contactService.getContactDropdown().subscribe(r => {
        this.contactList = r
      })
    }
  }

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
   * get all borough list
   */
  private getBoroughs() {
    if (!this.boroughs.length) {
      this.boroughServices.getDropdownData().subscribe(r => {
        this.boroughs = _.sortBy(r, "description")
      })
    }
  }


  saveAddressType() {
    this.loading = true
    if (this.isNew) {
      this.addressMasterServices.create(this.address).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully.')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.addressMasterServices.update(this.address.id, this.address).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record updated successfully.');
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }

  checkBisAddressInfo() {
    //TODO: ng12
  }

  getBisAddressInfo() {
    //TODO: ng12
  }

  setOccupancyClassification() {
    //TODO: ng12
  }
}