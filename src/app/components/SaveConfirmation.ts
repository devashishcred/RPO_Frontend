import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'save-confirmation',
  template: `
      <ng-template #tplSaveConfirmation>
        <div class="modal-header">
          <button type="button" class="close close-icn" (click)="modalRef.hide()"><span class="fa fa-times-circle"></span></button>
          <h4 class="modal-title pull-left">Confirmation</h4>
        </div>

        <div class="modal-body"><label>Do you want to save your changes?</label></div>

        <div class="modal-footer">
          <button type="button" class="btn btn-blue pull-right" (click)="yes();modalRef.hide()">Save</button>
          <button type="button" class="btn btn-white pull-right" (click)="modalRef.hide()">Discard</button>
        </div>
      </ng-template>
`})
export class SaveConfirmation {
  @ViewChild('tplSaveConfirmation',{static: true})
  private tpl: TemplateRef<any>

  modalRef: BsModalRef

  private fn: Function
  private args: any

  constructor(
    private modalService: BsModalService,
    private toastr: ToastrService
  ) { }

  yes() {
    this.fn(...this.args).then(() => {
      this.modalRef.hide()
      this.toastr.success('Record deleted successfully.')
    }, () => {
    })
  }

  public show(fn: Function, args: any) {
    this.fn = fn
    this.args = args

    this.modalRef = this.modalService.show(this.tpl, { class: 'modal-sm' })
  }
}