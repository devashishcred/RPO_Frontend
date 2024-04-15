import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Time } from 'ngx-bootstrap/timepicker/timepicker.models';
import { ToastrService } from 'ngx-toastr';
import { constantValues, SharedService } from '../../../../../app.constantValues';
import { Message } from "../../../../../app.messages";
import { TimeNote } from '../../../../../types/timeNote';
import { TimeNotesServices } from '../../timeNotes/TimeNotes.service';
import { JobServices } from '.././../../job.services';

/**
* This component contains all function that are used in AddTimeNotesComponent
* @class AddTimeNotesComponent
*/
@Component({
  selector: '[add-time-notes]',
  templateUrl: './addtimenotes.component.html'
})
export class AddTimeNotesComponent implements OnInit {
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() idJob: number
  @Input() idTimeNote: number
  @Input() fromProgressionNote:boolean
  @Input() description:any
  @Output() onTimeNoteSave = new EventEmitter<boolean>()
  timeNote: TimeNote
  private dropdownSettings: any = {};
  loading: boolean = false;
  private showHoursZeroerror: boolean = false;
  private selectCategory: number
  private timeNoteCat: any[] = []
  timeNoteCatdropdownList: any = [];
  private selectDescription: string;
  private selectDate: Date;
  private selectTime: Time;
  private selectBillable: boolean = false
  errorMessage: any
  jobFeeScheduleItems: any
  masterServiceItems: any
  requireServiceItem: boolean = false;

  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private timeNotesService: TimeNotesServices,
    private message: Message,
    private jobServices: JobServices,
    private sharedService: SharedService,
    private router: Router,
    private constantValues: constantValues,
  ) {
    this.errorMessage = this.message.msg;
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'Project';
    this.timeNote = {} as TimeNote;
    this.timeNote.progressNotes = this.description;
    this.timeNote.fromProgressionNote = this.fromProgressionNote;
    this.timeNote.timeNoteDate = moment(new Date()).format(this.constantValues.DATEFORMAT);
    // this.timeNote.timeNoteDate = moment(convertUTCDateToLocalDate(new Date())).format(this.constantValues.DATEFORMAT);;
    this.requireServiceItem = false;
    this.timeNoteCatdropdownList = [
      { itemName: "Scope Time", value: 1 },
      { itemName: "Other Billable Service", value: 2 },
      { itemName: "Non Billable", value: 3 }
    ];
    if (this.idTimeNote) {
      this.timeNotesService.getById(this.idTimeNote).subscribe(r => {
        this.timeNote = r;
        this.timeNote.timeNoteDate = moment(this.timeNote.timeNoteDate).utc().format(this.constantValues.DATEFORMAT);
        this.setServiceItemsDD(true);
      })
    }
    this.timeNote.timeHours = '00';
    this.timeNote.timeMinutes = '00';
  }

  checkTimeNoteHours(hours: string, minutes: string) {
    if ((hours == '00' && minutes == '00') || (hours == '' && minutes == '') || (hours == '00' && minutes == '') || (hours == '' && minutes == '00')) {
      this.loading = false;
      this.toastr.error('Either Hours or Minutes Mandatory for Timenotes');
    } else {
      this.loading = false;
      return true;
    }
  }
  /**
   * This method will get all sevice items for dropdown
   * @method setServiceItemsDD
   */
  setServiceItemsDD(id?: any) {
    if (this.timeNote.jobBillingType != null && this.timeNote.jobBillingType != 3) {
      this.requireServiceItem = true;
      this.loading = true;
      if (this.timeNote.jobBillingType == 1) {
        this.timeNotesService.getScopeServices(this.idJob, this.idTimeNote).subscribe(r => {
          if (!id)
            this.timeNote.idJobFeeSchedule = undefined;
          this.jobFeeScheduleItems = r;
          this.loading = false;
        }, e => {
          this.loading = false;
        });
      }
      if (this.timeNote.jobBillingType == 2) {
        this.timeNotesService.getMasterFeeSchedule().subscribe(r => {
          this.masterServiceItems = r;
          if (!id)
            this.timeNote.idRfpJobType = undefined;
          this.loading = false;
        }, e => {
          this.loading = false;
        });
      }
    }
  }

  /**
    * This method is used to check whether value entered is number or not
    * @method isNumber
    * @param {any} evt evt of input
    */
  isNumber(evt: any) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  /**
    * This method is used to check whether value entered is decimal or not
    * @method isDecimal
    * @param {any} evt evt of input
    */
  isDecimal(evt: any) {
    //getting key code of pressed key
    var keycode = (evt.which) ? evt.which : evt.keyCode;
    //comparing pressed keycodes
    if (!(keycode == 8 || keycode == 46) && (keycode < 48 || keycode > 57)) {
      return false;
    }
    else {
      var parts = evt.srcElement.value.split('.');
      if (parts.length > 1 && keycode == 46)
        return false;
      if (typeof parts[1] != "undefined" && parts[1].length > 1) { // allow only 2 digit after decimal
        return false;
      }
      return true;
    }
  }

  /**
   * This method will save time note entry
   * @method save
   */
  save(type?: string) {
    this.loading = true;
    if (this.timeNote.jobBillingType != 3) {
      this.loading = false;
      this.checkTimeNoteHours(this.timeNote.timeHours, this.timeNote.timeMinutes);
    }
    this.timeNote.idJob = this.idJob;
    if (this.timeNote.jobBillingType != 3 && (this.timeNote.timeMinutes != '00' || this.timeNote.timeHours != '00') && (this.timeNote.timeMinutes != '' && this.timeNote.timeHours != '')) {
      this.loading = true;
      if (this.timeNote.timeHours == '') {
        this.timeNote.timeHours = '00'
      }
      if (this.timeNote.timeMinutes == '') {
        this.timeNote.timeMinutes = '00'
      }
      if (this.idTimeNote) {
        this.timeNotesService.updateJobTimeNote(this.timeNote, this.idTimeNote).subscribe(
          r => {
            this.loading = false;
            this.toastr.success(this.errorMessage.editTimeNote);
            this.modalRef.hide();
            if (window.location.pathname === '/job/' + this.idJob + '/timenotes' ||
              window.location.pathname === '/job/' + this.idJob + '/scope') {
              this.sharedService.getJobTimeNoteFromInfo.emit('timenote');
            }
          }, e => {
            this.loading = false
          }
        )
      } else {
        this.loading = true;
        this.timeNotesService.addJobTimeNote(this.timeNote).subscribe(
          r => {
            this.loading = false;
            this.toastr.success(this.errorMessage.addTimeNote);
            this.onTimeNoteSave.emit(true)
            this.modalRef.hide();
            if (window.location.pathname === '/job/' + this.idJob + '/timenotes' ||
              window.location.pathname === '/job/' + this.idJob + '/scope') {
              this.sharedService.getJobTimeNoteFromInfo.emit('timenote');
            }
          }, e => {
            this.loading = false
          }
        )
      }
    }
    if (this.timeNote.jobBillingType == 3) {
      this.loading = true;
      if (this.timeNote.timeHours == '') {
        this.timeNote.timeHours = '00'
      }
      if (this.timeNote.timeMinutes == '') {
        this.timeNote.timeMinutes = '00'
      }
      if (this.idTimeNote) {
        this.timeNotesService.updateJobTimeNote(this.timeNote, this.idTimeNote).subscribe(
          r => {
            this.loading = false;
            this.toastr.success(this.errorMessage.editTimeNote);
            this.modalRef.hide();
            if (window.location.pathname === '/job/' + this.idJob + '/timenotes' ||
              window.location.pathname === '/job/' + this.idJob + '/scope') {
              this.sharedService.getJobTimeNoteFromInfo.emit('timenote');
            }
          }, e => {
            this.loading = false
          }
        )
      } else {
        this.timeNotesService.addJobTimeNote(this.timeNote).subscribe(
          r => {
            this.loading = false;
            this.onTimeNoteSave.emit(true);
            this.toastr.success(this.errorMessage.addTimeNote);
            this.modalRef.hide();
            if (window.location.pathname === '/job/' + this.idJob + '/timenotes' ||
              window.location.pathname === '/job/' + this.idJob + '/scope') {
              this.sharedService.getJobTimeNoteFromInfo.emit('timenote');
            }
          }, e => {
            this.loading = false
          }
        )
      }

    }



  }
}