import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { TransmittalServices } from '../../jobTransmittal/jobTransmittal.service';

declare const $: any
@Component({
  selector: '[scope-history]',
  templateUrl:'./scopeHistory.component.html',
})
/**
* This component contains all function that are used in ScopeHistoryComponent
* @class ScopeHistoryComponent
*/
export class ScopeHistoryComponent implements OnInit {
  @Input() scopeHistoryData: any
  @Input() modalRefHistory: BsModalRef
  @Input() costType: number

  /**
  * To view specific task
  * @property viewtask
  */
  @ViewChild('viewtask',{static: true})
  private viewtask: TemplateRef<any>
  idTask: number
  modalRef: BsModalRef
  loading: boolean = false;
  static vmNew: any
  static loadingNew: boolean = false;
  setVM(vm1: any, loading: boolean) {
    ScopeHistoryComponent.vmNew = vm1
    ScopeHistoryComponent.loadingNew = loading
  }

  /**
    * This method define all services that requires in whole class
    * @method constructor
    */
  constructor(
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private transmittalServices: TransmittalServices,
    private elRef: ElementRef,
    private modalService: BsModalService,
  ) {
  }

  /**
    * This method will be called once only when module is call for first time and get task history of selected scope
    * @method ngOnInit
    */
  ngOnInit() {
    document.title = 'Projects'
    var vm = this;
    var loading = this.loading;
    this.setVM(vm, loading);
    this.loading = true;
    setTimeout(() => {
      if (this.scopeHistoryData && this.scopeHistoryData.length > 0) {
        this.loading = false;
      }
    }, 1000);
  }
}