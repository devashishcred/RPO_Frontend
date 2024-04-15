import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { Message } from "../../app.messages";
import { AddJobProgressionNoteServices } from './addjobprogressionnote.services';
import { AddJobProgressionNote } from './addjobprogressionnotes';

/**
 * This component contains all function that are used in AddJobProgressionNoteComponent
 * @class AddJobProgressionNoteComponent
 */
@Component({
  selector: '[add-job-progression-note]',
  templateUrl: './addjobprogressionnote.component.html',
  styleUrls: ['./addjobprogressionnote.component.scss']
})
export class AddJobProgressionNoteComponent implements OnInit {

  @Input() modalRef: BsModalRef

  @Input() idJob: number

  public loading: boolean = false
  public errorMsg: any
  public exsitingNotes: any = []
  public addJobProgressionNote: any
  public isNewGenrealNote: boolean = false

  /**
   * This method define all services that requires in whole class
   * @method constructor
   */
  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private addJobProgressionNoteServices: AddJobProgressionNoteServices,
    private message: Message,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.addJobProgressionNote = {} as AddJobProgressionNote
    this.loading = true
    this.getJobProgressionNote()
    this.isNewGenrealNote = true
  }

  /**
   * This method will get JOB progression note
   * @method getAddJobProgressionNote
   */
  getJobProgressionNote() {
    if (this.idJob) {
      this.addJobProgressionNote.idJob = this.idJob
      this.addJobProgressionNoteServices.getJobNotes(this.idJob).subscribe(r => {
        this.exsitingNotes = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.loading = false
    }

  }

  /**
   * This method is used to close popup
   * @method closePopup
   */
  private closePopup() {
    this.modalRef.hide()
  }

  /* dropdown should not close */
  private dropdownPropagation(event: any) {
    event.stopPropagation();
  }

  /**
   * This method is used to save progression note
   * @method saveProgressionNote
   */
  saveProgressionNote() {
    this.loading = true
    if (this.addJobProgressionNote.notes != '' && this.addJobProgressionNote.notes != null) {
      this.addJobProgressionNoteServices.create(this.addJobProgressionNote).subscribe(r => {
        this.toastr.success('Progression notes added successfully')
        this.modalRef.hide();
        this.getJobProgressionNote()
        this.addJobProgressionNote.notes = null
        this.isNewGenrealNote = false
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.isNewGenrealNote = true
    }
  }
}