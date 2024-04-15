import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'message-sent-success-modal',
  templateUrl: './message-sent-success-modal.component.html',
  styleUrls: ['./message-sent-success-modal.component.scss']
})
export class MessageSentSuccessModalComponent implements OnInit {
  

  constructor(
    public bsModalRef: BsModalRef
  ) { }

  ngOnInit(): void {
  }

}
