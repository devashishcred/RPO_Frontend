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
import { convertUTCDateToLocalDate } from '../../../utils/utils';
import { SharedDataService } from '../../../app.constantValues';
import { SiteInformationServices } from '../../addRfp/siteInformation/siteInformation.services';

declare const $: any

@Component({
  selector: '[view-address-list]',
  templateUrl: './viewAddressList.component.html'
})

export class ViewAddressListComponent implements OnInit {
  @Input() modalRefAddress: BsModalRef
  @Input() addressList?: any
  @Input() permitdata?: any
  @Input() appid?: any
  @Input() permitid?: any
  @Input() isAnomalyBin?: boolean = false;
  @Output() updateFormFieldsFromGetInfo? = new EventEmitter<any>();


  loading: boolean = false
  private addressModal: boolean = true;
  errorMsg: any
  private companyBisInfo: any
  private licenceType: string
  noResultFound: boolean = false
  isAddressDetailFound: boolean = false
  dobpermitdata: boolean = false
  address: any = {}

  constructor(
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private appComponent: AppComponent,
    private constantValues: constantValues,
    public _SharedDataService: SharedDataService,
    private siteInformationServices: SiteInformationServices,
  ) {
    this.errorMsg = this.message.msg;
  }


  ngOnInit() {
    if (this.permitdata) {
      this.dobpermitdata = true;

    }
    if (this.permitdata == undefined && this.addressList && this.addressList.length == 1) {
      this.isAddressDetailFound = true;
      this.getAddressDetail(this.addressList[0].borough, this.addressList[0].houseNumber, this.addressList[0].streetName);
    }
  }

  getAddressDetail(borough: string, houseNum: string, street: string) {
    let requestParams = {
      houseNumber: houseNum.trim(),
      streetName: street.trim(),
      borough: borough.trim(),
      isExactMatch: true,
    }
    this.loading = true;
    this.siteInformationServices.getBisAddresInfo(requestParams).subscribe(addressDetail => {
      this.loading = false;
      this.isAddressDetailFound = true;
      this.address = addressDetail[0];
    });
  }

  toTitleCase(str: string) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  setAddressInfo() {
    let address = this.address;
    this.updateFormFieldsFromGetInfo.emit(address);
    this.modalRefAddress.hide();
  }

  setPermitInfo() {
    let permit = this.permitdata;
    this.updateFormFieldsFromGetInfo.emit(permit);
    this.modalRefAddress.hide();
  }
}