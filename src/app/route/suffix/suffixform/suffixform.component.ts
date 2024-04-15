import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { SuffixServices } from '../../../services/suffix.services';
import { Suffix } from '../suffix';
import { Message } from "../../../app.messages";

declare const $: any

/**
 *  This component contains all function that are used in SuffixformComponent
 * @class SuffixformComponent
 */

@Component({
  selector: '[add-suffix]',
  templateUrl: './suffixform.component.html',
})
export class SuffixformComponent implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() suffixId: number

  suffix: Suffix
  loading: boolean = false
  errorMsg: any

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private suffixServices: SuffixServices,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {

    this.suffix = {} as Suffix

    if (!this.isNew && this.suffixId && this.suffixId > 0) {
      this.loading = true
      this.suffixServices.getById(this.suffixId).subscribe((r: any) => {
        this.suffix = r
        this.loading = false
      }, (e: any) => {
        this.loading = false
      })
    }
  }

  /**
   * This method is used to save record
   * @method saveSuffix
   */
  saveSuffix() {
    this.loading = true
    if (this.isNew) {
      this.suffixServices.create(this.suffix).subscribe((r: any) => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, (e: any) => {
        this.loading = false
      })
    } else {
      this.suffixServices.update(this.suffix.id, this.suffix).subscribe((r: any) => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record updated successfully');
        this.loading = false
      }, (e: any) => {
        this.loading = false
      })
    }
  }
}