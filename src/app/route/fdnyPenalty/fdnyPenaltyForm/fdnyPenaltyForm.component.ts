import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../app.component';
import { FdnyPenaltyServices } from '../fdnyPenalty.services';
import { FdnyPenalty } from '../fdnyPenalty';
import { Message } from "../../../app.messages";

declare const $: any
/**
*  This component contains all function that are used in FdnyPenaltyFormComponent
* @class FdnyPenaltyFormComponent
*/
@Component({
  selector: '[add-fdny-penalty]',
  templateUrl: './fdnyPenaltyForm.component.html',
  styleUrls: ['./fdnyPenaltyForm.component.scss']
})
export class FdnyPenaltyFormComponent implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() id: number

  fdnyPenalty: FdnyPenalty
  loading: boolean = false
  errorMsg: any

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private fdnyPenaltyServices: FdnyPenaltyServices,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {

    this.fdnyPenalty = {} as FdnyPenalty

    if (!this.isNew && this.id && this.id > 0) {
      this.loading = true
      this.fdnyPenaltyServices.getById(this.id).subscribe(r => {
        this.fdnyPenalty = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }

  /**
  * This method is used to save record
  * @method saveFdnyPenalty
  */
  saveFdnyPenalty() {
    this.loading = true
    if (this.isNew) {
      this.fdnyPenaltyServices.create(this.fdnyPenalty).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.fdnyPenaltyServices.update(this.fdnyPenalty.id, this.fdnyPenalty).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record updated successfully');
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }

  /**
* This method is used to get all job types
* @method isDecimal
* @param {any} evt event that occurs when key press
* @param {boolean} isNew is used to check whether record is new or old
*/
  isDecimal(evt: any) {
    //getting key code of pressed key
    var keycode = (evt.which) ? evt.which : evt.keyCode;
    //comparing pressed keycodes
    if (!(keycode == 8 || keycode == 46) && (keycode < 48 || keycode > 57)) {
      return false;
    }
    else {
      var parts = evt.srcElement.value.split('.');
      if (parts.length > 1 && keycode == 46)
        return false;
      return true;
    }
  }

}