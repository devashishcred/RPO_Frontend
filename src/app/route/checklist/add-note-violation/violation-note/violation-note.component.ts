
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../../app.component';
import { Message } from '../../../../app.messages';
import { ProgressionNotes } from '../../../../types/task';
import { JobViolationServices } from '../../../job/jobDetail/jobViolation/jobViolation.service';
import { TaskServices } from '../../../task/task.services';

@Component({
  selector: '[violation-note]',
  templateUrl: './violation-note.component.html',
  styleUrls: ['./violation-note.component.css']
})
export class ViolationNoteComponent implements OnInit {

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
  @ViewChild('addtimenotes',{static: true})
  private addtimenotes: TemplateRef<any>
  @ViewChild('saveTimeNote',{static: true})
  private tpl: TemplateRef<any>
  private sub: any
  idJob: number
  loading: boolean = false
  errorMsg: any
  exsitingNotes: any = []
  private progressionNotes: any
  isNewGenrealNote: boolean = false
  private addedProgressionNote: boolean = false


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
  ) {
    this.errorMsg = this.message.msg
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    this.progressionNote = {} as ProgressionNotes
    if(this.route.parent != null)
    {
      this.sub = this.route.parent.params.subscribe(params => {
        this.idJob = +params['id']; // (+) converts string 'id' to a number
      });
    }
    
    this.loading = true
    if(!this.idJob){
      this.progressionNote.idJob = this.jobId
      this.idJob = this.jobId
    }
    //this.progressionNote.idJob = this.idJob
    console.log(this.idJob)
    this.getProgressionNotes()
    this.isNewGenrealNote = true
  }

  openModalAddTimeNotes(template: TemplateRef<any>, id?: number) {
    this.modelForTime.hide()
    this.modelcheck = this.modalService.show(template, { class: 'modal-add-time-notes' , backdrop: 'static', 'keyboard': false})
  }

  openModalAddTime(template: TemplateRef<any>, id?: number) {
    if(this.idJob){
      this.modelForTime = this.modalService.show(template, { class: 'modal-add-time-notes' , backdrop: 'static', 'keyboard': false})
    }else{
      this.saveProgressionNoteForNoJob();
    }
  }

  TimeNoteSave(evt:boolean){;
    if(evt){
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
      //this.progressionNote.idJob = this.jobId
      this.taskServices.getProgressionNotes(this.idTask).subscribe(r => {
        this.exsitingNotes = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else if (this.idViolation) {
      this.progressionNote.idJobViolation = this.idViolation
      this.jobViolationServices.getViolationProgressionNotes(this.idViolation).subscribe(r => {
        this.exsitingNotes = r.data
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
          this.modalRef.hide();
          //this.modelForTime.hide()
          this.isNewGenrealNote = false
          this.loading = false
        }, e => {
          this.loading = false
        })
      }
}
