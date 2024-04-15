import { Component, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { rfpAddress } from '../../types/rfpAddress';
import { ViewAddressServices } from './viewAddress.services';

declare const $: any

/**
 * This component contains all function that are used in ViewAddressComponent
 * @class ViewAddressComponent
 */
@Component({
  selector: '[view-address]',
  templateUrl: './viewAddress.component.html'
})

export class ViewAddressComponent {
  @Input() modalRef: BsModalRef
  @Input() viewAddress: rfpAddress
  @Input() addressId: rfpAddress

  address = {} as rfpAddress
  loading: boolean = false
  jobDetail: any

  /**
   * This method define all services that requires in whole class
   * @method constructor
   */
  constructor(
    private modalService: BsModalService,
    private toastr: ToastrService,
    private viewAddressServices: ViewAddressServices,
  ) {

  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    if (this.addressId) {
      this.loading = true
      this.viewAddressServices.getByIdRfpAddress(this.addressId).subscribe(r => {
        this.address = r
        this.loading = false
      })
    }
  }
}