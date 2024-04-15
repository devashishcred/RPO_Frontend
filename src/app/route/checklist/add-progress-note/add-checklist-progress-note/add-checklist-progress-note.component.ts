import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Message } from '../../../../app.messages';
import { JobCheckListServices } from '../../checklist/checklist.service';

interface AddRfpProgressionNote {
  id: number,
  idRfpProgress: number,
  notes: string,
  createdBy: number,
  createdByEmployee: string,
  createdDate: Date
  lastModifiedBy: number,
  lastModified: string,
  lastModifiedDate: Date,
}

@Component({
  selector: '[add-checklist-progress-note]',
  templateUrl: './add-checklist-progress-note.component.html',
  styleUrls: ['./add-checklist-progress-note.component.css']
})
export class AddChecklistProgressNoteComponent implements OnInit {

  @Input() modalRef: BsModalRef
  @Input() IdJobPlumbingInspection: any
  @Input() idRfp: number
  @Input() isPlChecklist = false;
  private sub: any
  private idJob: number
  loading: boolean = false
  errorMsg: any
  exsitingNotes: any = []
  addRfpProgressionNote: any
  isNewGenrealNote: boolean = false

  /**
   * This method define all services that requires in whole class
   * @method constructor
   */
  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private jobCheckListServices: JobCheckListServices,
    private message: Message,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.addRfpProgressionNote = {} as AddRfpProgressionNote
    this.loading = true

    if (this.isPlChecklist) {
      this.getAddRfpProgressionNotePl()
    } else {
      this.getAddRfpProgressionNote()
    }
    this.isNewGenrealNote = true
  }

  /**
   * This method will get RFP progression note
   * @method getAddRfpProgressionNote
   */
  getAddRfpProgressionNote() {
    if (this.idRfp) {
      this.addRfpProgressionNote.idRfp = this.idRfp
      this.loading = false
      this.jobCheckListServices.getReferenceNoteById(this.idRfp).subscribe(r => {
        console.log(r)
        this.exsitingNotes = r
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.loading = false
    }

  }

  getAddRfpProgressionNotePl() {
    if (this.idRfp) {
      this.addRfpProgressionNote.idRfp = this.IdJobPlumbingInspection
      this.loading = false
      this.jobCheckListServices.getReferenceNoteByIdPl(this.IdJobPlumbingInspection).subscribe(r => {
        console.log(r)
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
    if (this.addRfpProgressionNote.notes != '' && this.addRfpProgressionNote.notes != null) {
      console.log(this.addRfpProgressionNote)
      console.log(this.idRfp);

      const payLoad = {
        IdJobChecklistItemDetail: this.idRfp,
        Description: this.addRfpProgressionNote.notes

      };
      this.jobCheckListServices.createProgressNote(payLoad).subscribe(r => {
        this.toastr.success('Progression notes added successfully')
        this.modalRef.hide();
        this.getAddRfpProgressionNote()
        this.addRfpProgressionNote.notes = null
        this.isNewGenrealNote = false
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.isNewGenrealNote = true
    }
  }


  /**
   * This method is used to save progression note
   * @method saveProgressionNotePl
   */
  saveProgressionNotePl() {
    this.loading = true
    if (this.addRfpProgressionNote.notes != '' && this.addRfpProgressionNote.notes != null) {
      console.log(this.addRfpProgressionNote)
      console.log(this.idRfp);

      const payLoad = {
        IdJobPlumbingInspection: this.IdJobPlumbingInspection,
        Description: this.addRfpProgressionNote.notes

      };
      this.jobCheckListServices.createProgressNotePl(payLoad).subscribe(r => {
        this.toastr.success('Progression notes added successfully')
        this.modalRef.hide();
        this.getAddRfpProgressionNotePl();
        this.addRfpProgressionNote.notes = null
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
