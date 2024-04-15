import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { AddresstypeServices } from '../addresstype.services';
import { AddressType } from '../../../types/addresstype';
import { Message } from "../../../app.messages";

declare const $: any

@Component({
  selector: '[add-address-type]',
  templateUrl: './addressform.component.html',
  styleUrls: ['./addressform.component.scss']
})
export class AddressformComponent implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() addressTypeId: number
  addresstype: AddressType
  loading: boolean = false
  errorMsg: any

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private addresstypeServices: AddresstypeServices,
  ) {
    this.errorMsg = this.message.msg
  }

  ngOnInit() {
    document.title = 'Address Type'
    this.addresstype = {} as AddressType
    if (this.addressTypeId && this.addressTypeId > 0) {
      this.loading = true
      this.addresstypeServices.getById(this.addressTypeId).subscribe(r => {
        this.addresstype = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }

  saveAddressType() {
    this.loading = true
    if (this.isNew) {
      this.addresstypeServices.create(this.addresstype).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.addresstypeServices.update(this.addresstype.id, this.addresstype).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record updated successfully');
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }
}