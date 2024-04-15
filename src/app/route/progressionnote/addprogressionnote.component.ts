import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { TaskServices } from '../task/task.services';

import { JobViolationServices } from '../job/jobDetail/jobViolation/jobViolation.service';
import { Task, ProgressionNotes } from '../../types/task';
import { Message } from "../../app.messages";
import { AppComponent } from '../../app.component';
import * as moment from 'moment';
import { constantValues } from '../../app.constantValues';

/**
* This component contains all function that are used in ProgressionNoteComponent
* @class ProgressionNoteComponent
*/
@Component({
  selector: '[add-progression-note]',
  templateUrl: './addprogressionnote.component.html',
  styleUrls: ['./addprogressionnote.component.scss']
})
export class ProgressionNoteComponent implements OnInit {
  @Input() progressionNote: any
  @Input() modalRef: BsModalRef
  @Input() modelcheck: BsModalRef
  @Input() modelForTime: BsModalRef
  @Input() reload: Function
  @Input() idTask: number
  @Input() jobId: number
  @Input() idViolation: number
  @Input() fromTask: boolean
  @Input() isFromNotification: boolean
  @Input() isPl: boolean
  //for client note start
  @Input() customerId: any
  @Input() itemIdForClientNote: any
  //for client note end

  @ViewChild('addtimenotes', { static: true })
  private addtimenotes: TemplateRef<any>
  @ViewChild('saveTimeNote', { static: true })
  private tpl: TemplateRef<any>
  private sub: any
  idJob: number
  loading: boolean = false
  errorMsg: any
  exsitingNotes: any = []
  private progressionNotes: any
  isNewGenrealNote: boolean = false
  private addedProgressionNote: boolean = false
  public charCount: number = 0;
  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private taskServices: TaskServices,
    private jobViolationServices: JobViolationServices,
    private message: Message,
    private appComponent: AppComponent,
    private constantValues: constantValues,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    this.progressionNote = {} as ProgressionNotes
    if (this.route.parent != null) {
      this.sub = this.route.parent.params.subscribe(params => {
        this.idJob = +params['id']; // (+) converts string 'id' to a number
      });
    }

    this.loading = true
    if (!this.idJob) {
      this.progressionNote.idJob = this.jobId
      this.idJob = this.jobId
    }
    console.log(this.idJob)
    this.getProgressionNotes()
    this.isNewGenrealNote = true
  }

  openModalAddTimeNotes(template: TemplateRef<any>, id?: number) {
    this.modelForTime.hide()
    this.modelcheck = this.modalService.show(template, { class: 'modal-add-time-notes', backdrop: 'static', 'keyboard': false })
  }

  openModalAddTime(template: TemplateRef<any>, id?: number) {
    if (this.idJob) {
      this.modelForTime = this.modalService.show(template, { class: 'modal-add-time-notes', backdrop: 'static', 'keyboard': false })
    } else {
      this.saveProgressionNoteForNoJob();
    }
  }

  TimeNoteSave(evt: boolean) {
    ;
    if (evt) {
      this.saveProgressionNote();
    }
  }
  /**
   * This method get progression note
   * @method getProgressionNotes
   */
  getProgressionNotes() {
    if (this.idTask) {
      this.progressionNote.idTask = this.idTask
      this.taskServices.getProgressionNotes(this.idTask).subscribe(r => {
        this.exsitingNotes = r
        console.log('if exsitingNotes', this.exsitingNotes)
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else if (this.idViolation) {
      this.progressionNote.idJobViolation = this.idViolation
      this.jobViolationServices.getViolationProgressionNotes(this.idViolation).subscribe(r => {
        this.exsitingNotes = r.data
        console.log('this.exsitingNotes', r)
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else if (this.customerId) {
      this.jobViolationServices.getClientNotes(this.itemIdForClientNote,this.isPl).subscribe(r => {
        this.exsitingNotes = r
        console.log('client notes', r)
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.loading = false
    }
  }

  /**
   * This method close popup for progression note
   * @method closePopup
   */
  private closePopup() {
    if (typeof this.fromTask != 'undefined' && this.fromTask && this.addedProgressionNote) {
      this.reload();
    }
    this.modalRef.hide()
  }

  /* dropdown should not close */
  private dropdownPropagation(event: any) {
    event.stopPropagation();
  }

  /**
   * This method save progression note
   * @method saveProgressionNote
   */
  saveProgressionNote() {
    this.modelForTime.hide()
    this.loading = true
    if (this.progressionNote.notes != '' && this.progressionNote.notes != null) {
      if (this.idTask) {
        this.addPrgoressionNote()
      } else {
        this.addViolationPrgoressionNote()
      }
    } else {
      this.isNewGenrealNote = true
    }
  }



  /**
   * This method save progression note
   * @method saveProgressionNote
   */
  saveProgressionNoteForNoJob() {
    this.loading = true
    if (this.progressionNote.notes != '' && this.progressionNote.notes != null) {
      if (this.idTask) {
        this.addPrgoressionNoteNoJob()
      } else {
        this.addViolationPrgoressionNoteNoJob()
      }
    } else {
      this.isNewGenrealNote = true
    }
  }

  /**
  * This method add violation progression note
  * @method addViolationPrgoressionNote
  */
  addViolationPrgoressionNote() {
    this.jobViolationServices.createViolationProgressionNote(this.progressionNote).subscribe(r => {
      this.toastr.success('Progression notes added successfully')
      this.reload();
      this.modalRef.hide();
      this.modelForTime.hide()
      this.progressionNote = {} as ProgressionNotes
      this.getProgressionNotes()
      this.isNewGenrealNote = false
      this.loading = false
    }, e => {
      this.loading = false
    })
  }

  /**
   * This method add progression note for task
   * @method addPrgoressionNote
   */
  addPrgoressionNote() {
    this.taskServices.createProgressionNote(this.progressionNote).subscribe(r => {
      this.addedProgressionNote = true;
      this.toastr.success('Progression notes added successfully')
      this.progressionNote = {} as ProgressionNotes
      this.getProgressionNotes()
      this.reload();
      this.modalRef.hide();
      this.modelForTime.hide()
      this.isNewGenrealNote = false
      this.loading = false
    }, e => {
      this.loading = false
    })
  }

  /**
* This method add violation progression note
* @method addViolationPrgoressionNote
*/
  addViolationPrgoressionNoteNoJob() {
    this.jobViolationServices.createViolationProgressionNote(this.progressionNote).subscribe(r => {
      this.toastr.success('Progression notes added successfully')
      this.reload();
      this.modalRef.hide();
      // this.modelForTime.hide()
      this.progressionNote = {} as ProgressionNotes
      this.getProgressionNotes()
      this.isNewGenrealNote = false
      this.loading = false
    }, e => {
      this.loading = false
    })
  }

  /**
   * This method add progression note for task
   * @method addPrgoressionNote
   */
  addPrgoressionNoteNoJob() {
    this.taskServices.createProgressionNote(this.progressionNote).subscribe(r => {
      this.addedProgressionNote = true;
      this.toastr.success('Progression notes added successfully')
      this.progressionNote = {} as ProgressionNotes
      this.getProgressionNotes()
      this.reload();
      this.modalRef.hide();
      //this.modelForTime.hide()
      this.isNewGenrealNote = false
      this.loading = false
    }, e => {
      this.loading = false
    })
  }

  getTimestamp(time) {
    return new Date(time)
  }

  addClientNotes() {
    console.log('run')
    let data:any = {
      IdCustomer: this.customerId,
      Description: this.progressionNote.notes,
      IdJobChecklistItemDetail: this.itemIdForClientNote
    }
    if(this.isPl) {
      data.IdJobPlumbingInspection = this.itemIdForClientNote
      delete data.IdJobChecklistItemDetail
    }
    this.jobViolationServices.addClientNotes(data,this.isPl).subscribe(r => {
      this.addedProgressionNote = true;
      this.toastr.success('Client notes added successfully')
      this.progressionNote = {} as ProgressionNotes
      this.modalRef.hide();
      //this.modelForTime.hide()
      this.isNewGenrealNote = false
      this.loading = false
    }, e => {
      this.loading = false
    })
  }

  updateCount() {
    if(!this.customerId) {
      return
    }
    this.charCount = this.progressionNote.notes.length;
    if (this.charCount > 1000) {
      this.progressionNote.notes = this.progressionNote.notes.substring(0, 1000);
      this.charCount = 1000;
    }
  }
}