import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'processing-loader',
  template: `
  <ng-template #tplProcessinLoader>
  <div class="lds-css" *ngIf="loading">
  <div class="lds-ripple">
    <div></div>
    <div></div>
  </div>
</div>
</ng-template>
`})
export class Loader {
  @ViewChild('tplProcessinLoader',{static: true})
  private tpl: TemplateRef<any>

  

  constructor(
   
    private toastr: ToastrService
  ) { }

  
}