import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: '[job-check-list]',
  templateUrl: './jobCheckList.component.html',
  styleUrls: ['./jobCheckList.component.scss']
})
export class JobCheckListComponent implements OnInit {

  private modalRef: BsModalRef
  private sub: any
  jobId: number

  constructor(
    
    private modalService: BsModalService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
  ) {
    this.sub = this.route.params.subscribe(params => {
      this.jobId = +params['id'];
    });
  }

  ngOnInit() {
    
  }

  getBack() {

  }
}