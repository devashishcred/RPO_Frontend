import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { PrefixServices } from '../../../services/prefix.services';
import { Prefix } from '../prefix';
import { Message } from "../../../app.messages";

declare const $: any

/**
* This component contains all function that are used in PrefixformComponent for create and update prefix
* @class PrefixformComponent
*/
@Component({
  selector: '[add-prefix]',
  templateUrl: './prefixform.component.html',
})
export class PrefixformComponent implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() prefixId: number

  prefix: Prefix
  loading: boolean = false
  errorMsg: any

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private prefixServices: PrefixServices,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {

    this.prefix = {} as Prefix
    
    if (!this.isNew && this.prefixId && this.prefixId > 0) {
      this.loading = true
      this.prefixServices.getById(this.prefixId).subscribe((r:any) => {
        this.prefix = r
        this.loading = false
      }, (e:any) => {
        this.loading = false
      })
    }
  }

  /**
  * This method is used to save record
  * @method savePrefix
  */
  savePrefix() {
    this.loading = true
    if (this.isNew) {
      this.prefixServices.create(this.prefix).subscribe((r:any) => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, (e:any) => {
        this.loading = false
      })
    } else {
      this.prefixServices.update(this.prefix.id, this.prefix).subscribe((r:any) => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record updated successfully');
        this.loading = false
      }, (e:any) => {
        this.loading = false
      })
    }
  }
}