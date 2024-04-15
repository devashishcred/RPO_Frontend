import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { ContactTitleServices } from '../../../services/contactTitle.services';
import { ContactTitle } from '../../../types/contactTitle';
import { Message } from "../../../app.messages";

declare const $: any
/**
*  This component contains all function that are used in ContactTitleformComponent
* @class ContactTitleformComponent
*/
@Component({
  selector: '[add-contact-title]',
  templateUrl: './contacttitleform.component.html',
  styleUrls: ['./contacttitleform.component.scss']
})
export class ContactTitleformComponent implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() contacttitleId: number

  contactTitle: ContactTitle
  loading: boolean = false
  errorMsg: any

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private contactTitleServices: ContactTitleServices,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {

    this.contactTitle = {} as ContactTitle
    
    if (!this.isNew && this.contacttitleId && this.contacttitleId > 0) {
      this.loading = true
      this.contactTitleServices.getById(this.contacttitleId).subscribe(r => {
        this.contactTitle = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }

  /**
  * This method is used to save record
  * @method saveContactTitle
  */
  saveContactTitle() {
    this.loading = true
    if (this.isNew) {
      this.contactTitleServices.create(this.contactTitle).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.contactTitleServices.update(this.contactTitle.id, this.contactTitle).subscribe(r => {
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