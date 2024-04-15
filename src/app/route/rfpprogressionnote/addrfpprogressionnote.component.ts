import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { Message } from "../../app.messages";
import { AddRfpProgressionNoteServices } from './addrfpprogressionnote.services';
import { AddRfpProgressionNote } from './addrfpprogressionnotes';

/**
* This component contains all function that are used in AddRfpProgressionNoteComponent
* @class AddRfpProgressionNoteComponent
*/
@Component({
  selector: '[add-rfp-progression-note]',
  templateUrl: './addrfpprogressionnote.component.html',
  styleUrls: ['./addrfpprogressionnote.component.scss']
})
export class AddRfpProgressionNoteComponent implements OnInit {

  @Input() modalRef: BsModalRef

  @Input() idRfp: number

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
    private addRfpProgressionNoteServices: AddRfpProgressionNoteServices,
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
    this.getAddRfpProgressionNote()
    this.isNewGenrealNote = true
  }

  /**
   * This method will get RFP progression note
   * @method getAddRfpProgressionNote
   */
  getAddRfpProgressionNote() {
    if (this.idRfp) {
      this.addRfpProgressionNote.idRfp = this.idRfp
      this.addRfpProgressionNoteServices.getRfpNotes(this.idRfp).subscribe(r => {
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
      this.addRfpProgressionNoteServices.create(this.addRfpProgressionNote).subscribe(r => {
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
}