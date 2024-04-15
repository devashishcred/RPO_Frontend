import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppComponent } from '../../../app.component';
import { ToastrService } from 'ngx-toastr';
import { Message } from '../../../app.messages';
import { NewsLetterServices } from '../../../services/news-letter.services';

@Component({
  selector: '[add-edit-news-letter]',
  templateUrl: './add-edit-news-letter.component.html',
  styleUrls: ['./add-edit-news-letter.component.scss']
})
export class AddEditNewsLetterComponent implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() id: number

  public news: any
  public loading: boolean = false
  public errorMsg: any

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private newsLetterService: NewsLetterServices,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {

    this.news = {}
    
    if (!this.isNew && this.id && this.id > 0) {
      this.loading = true
      this.newsLetterService.getById(this.id).subscribe((r:any) => {
        this.news = r
        this.loading = false
      }, (e:any) => {
        this.loading = false
      })
    }
  }

  /**
  * This method is used to save record
  * @method save
  */
  save() {
    this.loading = true
    if (this.isNew) {
      this.newsLetterService.create(this.news).subscribe((r:any) => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, (e:any) => {
        this.loading = false
      })
    } else {
      this.newsLetterService.update(this.news.id, this.news).subscribe((r:any) => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record updated successfully');
        this.loading = false
      }, (e:any) => {
        this.loading = false
      })
    }
  }
}