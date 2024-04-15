import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { cloneDeep } from 'lodash';
import { RfpListService } from './../../rfp/rfp.services';
import { Router, ActivatedRoute } from '@angular/router';

/**
* This component contains all function that are used in EmailHistoryComponent
* @class EmailHistoryComponent
*/
@Component({
  selector: 'email-history',
  templateUrl: './emailHistory.component.html'
})
export class EmailHistoryComponent implements OnInit {
  private modalRef: BsModalRef
  private sub: any
  loading: boolean = false
  idRfp: number
  rfpNumber:string
  private rfpData:any
  historyData:any = []

  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(
    private route: ActivatedRoute,
    private rfpListService: RfpListService,
  ) {

  }

  /**
  * This method will be called once only when module is call for first time and load all records of email history
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'RFP'
    this.loading = true
    this.sub = this.route.params.subscribe(params => {
      this.idRfp = +params['id']; // (+) converts string 'id' to a number
      this.rfpListService.getById(this.idRfp).subscribe(r => {
        this.rfpNumber = r.rfpNumber
        this.rfpData = r
        // Call Email History API
        this.rfpListService.getEmailHistory(this.idRfp).subscribe(r => {
          this.historyData = r
          this.loading = false
        })
      })
    });
  }
}