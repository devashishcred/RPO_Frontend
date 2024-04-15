import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { JobSharedService } from '../route/job/JobSharedService';
import { ContactServices } from '../route/contact/contact.services';
import { CompanyServices } from '../route/company/company.services';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'delete-confirmation',
  template: `
      <ng-template #tplDeleteConfirmation>
      <div class="modal-custom-content" cdkDrag>
        <div class="modal-header" cdkDragHandle>
          <button type="button" class="close close-icn" cdkDragHandle>
          <span class="fa fa-arrows"></span></button>
          <h4 class="modal-title pull-left">Confirmation</h4>
        </div>
        
        <div class="modal-body" *ngIf="this.args">
          <label *ngIf="this.args[3] != 'JOB_CONTACT' && this.args[2] != 'PERMIT_COMPLETE' && this.args[0] != 'D_LINK'">Are you sure you want to delete?</label>
          <label *ngIf="this.args[3] != undefined && args[3] == 'JOB_CONTACT'">Are you sure you want to remove this contact from the project?</label>
          <label *ngIf="this.args[0] != undefined && this.args[0] == 'D_LINK'">Dlink</label>
          <label *ngIf="this.args[2] != undefined && args[2] == 'PERMIT_COMPLETE'">
          Are you sure you want to complete the permit? This will remove the permit from the list. However the document will be still accessible from job documents.</label>
        </div>
        <div class="modal-body" *ngIf="!this.args">
          <label>Are you sure you want to delete?</label>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-blue pull-right" (click)="yes()">Yes</button>
          <button type="button" class="btn btn-white pull-right" (click)="modalRef.hide()">No</button>
        </div>
        </div>


        <div class="lds-css" *ngIf="loading">
    <div class="lds-ripple">
        <div></div>
        <div></div>
    </div>
</div>
      </ng-template>
`})
export class DeleteConfirmation {
  @ViewChild('tplDeleteConfirmation',{static:true})
  private tpl: TemplateRef<any>

  modalRef: BsModalRef
  loading: boolean

  private fn: Function
  args: any

  constructor(
    private modalService: BsModalService,
    private toastr: ToastrService,
    private jobSharedService: JobSharedService,
    private contactServices: ContactServices,
    private companyServices: CompanyServices,
    private router: Router,
  ) { }

  yes() {
    this.loading = true;
    this.fn(...this.args).then(() => {
      console.log(this.args);
      this.modalRef.hide()
      if (this.args[2] != undefined && this.args[2] == 'PERMIT_COMPLETE') {
        this.loading = false;
        this.toastr.success('The Permit completed Successfully.')

      }
      if (this.args[0] != undefined && this.args[0] == 'D_LINK') {
        this.loading = false;
        this.toastr.success('The Rfp.')

      }
      if (this.args[3] != undefined && this.args[3] == 'JOB_CONTACT') {
        this.jobSharedService.toggleClient();
        this.loading = false;
        this.toastr.success('The contact has been removed from the job.')
      } else if (this.args[2] != 'PERMIT_COMPLETE' && this.args[3] != 'JOB_CONTACT'  && this.args[0] != 'D_LINK') {
        this.loading = false;
        this.toastr.success('Record deleted successfully.')
      }
    }, (e) => {
      console.log(e)
      this.loading = false;
      this.modalRef.hide()
    })
  }

  public show(fn: Function, args: any) {
    this.fn = fn
    this.args = args
    console.log(this.fn);
    console.log(this.args);
    if (this.args[2] != undefined && this.args[2] == 'PERMIT_COMPLETE') {
      this.modalRef = this.modalService.show(this.tpl, { class: 'modal-md' })
    } else {
      this.modalRef = this.modalService.show(this.tpl, { class: 'modal-sm' })
    }

  }

}