import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, pickBy, identity } from 'lodash';
import { Message } from '../../../../app.messages';

declare const $: any
/**
* This component contains all function that are used in FormDocumentComponent
* @class FormDocumentComponent
*/
@Component({
  selector: '[form-document]',
  templateUrl: './formDocument.component.html'
})

export class FormDocumentComponent implements OnInit {
  @Input() document: Document
  @Input() modalRef: BsModalRef
  @Input() onSave: Function
  @Input() onSaveDocument: Function

  loading: boolean = false
  private errorMsg: any

  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message
  ) {
    this.errorMsg = this.message.msg;
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'Document'
  }

  save() {
    //TODO: ng12
  }
}