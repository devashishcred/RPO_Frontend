import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { JobCheckListServices } from '../../checklist/checklist.service';

interface AddComment {
  idJobViolation: number,
  description: string,
}

@Component({
  selector: '[add-violation-comment]',
  templateUrl: './add-violation-comment.component.html',
  styleUrls: ['./add-violation-comment.component.css']
})
export class AddViolationCommentComponent implements OnInit {
  @Input() modalRef: BsModalRef
  @Input() idViolation: any
  @Input() isCustomerLoggedIn: boolean = false;
  public addViolationComment: any
  public exsitingComments: any = []
  @Output() sendChildValue: EventEmitter<any> = new EventEmitter<any>();
  loading: boolean = false;
  isPlChecklist: boolean = false;

  constructor(private jobCheckListServices: JobCheckListServices, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.addViolationComment = {} as AddComment
    this.addViolationComment.idJobViolation = this.idViolation;
    this.getHistory(this.idViolation)
  }


  saveChecklistComment() {
    this.loading = true;
    console.log(this.addViolationComment);
    this.jobCheckListServices.saveViolationComment(this.addViolationComment).subscribe(r => {
      this.modalRef.hide()
      this.toastr.success('Record created successfully')
      this.sendChildValue.emit(true);
      this.loading = false;
    }, e => {
      this.loading = false;
    })
  }

  getHistory(id) {
    this.jobCheckListServices.getViolationCommentsById(id).subscribe(r => {
      this.exsitingComments = r
      console.log(r)
      this.loading = false;
    }, e => {
      this.loading = false;
    })
  }

  saveChecklistCommentPL() {
    //TODO ng12
  }
}
