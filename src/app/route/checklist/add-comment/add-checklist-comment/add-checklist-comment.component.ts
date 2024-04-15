import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { JobCheckListServices } from '../../checklist/checklist.service';

 interface AddComment {
  IdJobChecklistItemDetail: number,
  Description: string,
  Isinternal: boolean,
}

@Component({
  selector: '[add-checklist-comment]',
  templateUrl: './add-checklist-comment.component.html',
  styleUrls: ['./add-checklist-comment.component.css']
})
export class AddChecklistCommentComponent implements OnInit {
  @Input() modalRef: BsModalRef
  @Input() IdJobChecklistItemDetail:any;
  @Input() IdJobPlumbingInspection:any
  @Input () isPlChecklist = false;
  @Input () isCustomerLoggedIn = false;
  addChecklistComment: any
  exsitingComments: any = []
  @Output() sendChildValue: EventEmitter<any> = new EventEmitter<any>();
  loading: boolean = false;
  constructor( private jobCheckListServices: JobCheckListServices, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.addChecklistComment = {} as AddComment
    this.addChecklistComment.IdJobChecklistItemDetail = this.IdJobChecklistItemDetail;
    this.addChecklistComment.Isinternal = true;
    if(this.isPlChecklist){
     this.getHistroryPL(this.IdJobPlumbingInspection)
    }else{
      this.getHistrory(this.IdJobChecklistItemDetail)
    }
   
  }


  saveChecklistComment(){
    this.loading = true;
    console.log(this.addChecklistComment);
    this.jobCheckListServices.saveChecklistComment(this.addChecklistComment).subscribe(r=>{
      this.modalRef.hide()
      this.toastr.success('Record created successfully')
      this.sendChildValue.emit(true);
      this.loading = false;
    }, e => {
      this.loading = false;
    })
  }

  saveChecklistCommentPL(){
    this.loading = true;
    console.log(this.addChecklistComment);
    const payload ={
      IdJobPlumbingInspection:this.IdJobPlumbingInspection,
      Description :this.addChecklistComment.Description
    }
    console.log(payload);
    this.jobCheckListServices.saveChecklistCommentPL(payload).subscribe(r=>{
      this.modalRef.hide()
      this.toastr.success('Record created successfully')
      this.sendChildValue.emit(true);
      this.loading = false;
    }, e => {
      this.loading = false;
    })
  }

  getHistrory(id){
    this.jobCheckListServices.getChecklistCommentsById(id).subscribe(r=>{
      this.exsitingComments = r
    console.log(r)
      this.loading = false;
    }, e => {
      this.loading = false;
    })
  }

  getHistroryPL(id){
    this.jobCheckListServices.getChecklistCommentsPlById(id).subscribe(r=>{
      this.exsitingComments = r
    console.log(r)
      this.loading = false;
    }, e => {
      this.loading = false;
    })
  }
}
