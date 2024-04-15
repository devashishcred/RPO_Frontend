import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { OwnerTypeServices } from '../ownertype.services';
import { OwnerType } from '../ownerType';
import { Message } from "../../../app.messages";

declare const $: any

@Component({
  selector: '[add-owner-type]',
  templateUrl: './ownerform.component.html',
  styleUrls: ['./ownerform.component.scss']
})
export class OwnerformComponent implements OnInit {

  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() ownerTypeId: number

  ownerType: OwnerType
  loading: boolean = false
  errorMsg: any

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private ownerTypeServices: OwnerTypeServices,
  ) {
    this.errorMsg = this.message.msg
  }

  ngOnInit() {
    document.title = 'Owner Type'
    this.ownerType = {} as OwnerType
    if (this.ownerTypeId && this.ownerTypeId > 0) {
      this.loading = true
      this.ownerTypeServices.getById(this.ownerTypeId).subscribe(r => {
        this.ownerType = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }

  saveOwnerType() {
    this.loading = true
    if (this.isNew) {
      this.ownerTypeServices.create(this.ownerType).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.ownerTypeServices.update(this.ownerType.id, this.ownerType).subscribe(r => {
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