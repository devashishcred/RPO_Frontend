import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { PenaltyCodeServices } from '../penaltycode.services';
import { PenaltyCode } from '../penaltyCode';
import { Message } from "../../../app.messages";

declare const $: any
/**
*  This component contains all function that are used in PaneltyCodeformComponent
* @class PaneltyCodeformComponent
*/
@Component({
  selector: '[add-panelty-code]',
  templateUrl: './paneltycodeform.component.html',
})
export class PaneltyCodeformComponent implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() penaltyCodeId: number

  penaltyCode: PenaltyCode
  loading: boolean = false
  errorMsg: any

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private penaltyCodeServices: PenaltyCodeServices,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {

    this.penaltyCode = {} as PenaltyCode
    
    if (!this.isNew && this.penaltyCodeId && this.penaltyCodeId > 0) {
      this.loading = true
      this.penaltyCodeServices.getById(this.penaltyCodeId).subscribe(r => {
        this.penaltyCode = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }

  /**
  * This method is used to save record
  * @method savePenaltyCode
  */
  savePenaltyCode() {
    this.loading = true
    if (this.isNew) {
      this.penaltyCodeServices.create(this.penaltyCode).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.penaltyCodeServices.update(this.penaltyCode.id, this.penaltyCode).subscribe(r => {
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