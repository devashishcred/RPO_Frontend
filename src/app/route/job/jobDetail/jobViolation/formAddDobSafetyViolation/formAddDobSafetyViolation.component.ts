import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Message } from "../../../../../app.messages";
import { isIE } from '../../../../../utils/utils';
import { JobViolationServices } from '../jobViolation.service';
import { TaskServices } from '../../../../task/task.services';
import { Violation, ExplanationOfCharges } from '../violation';
import * as moment from 'moment';
import { constantValues } from '../../../../../app.constantValues';
import { JobApplicationService } from '../../../../../services/JobApplicationService.services';
import * as _ from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare const $: any

/**
 * This component contains all function that are used in Form Add Violation
 * @class FormAddDobSafetyViolation
 */
@Component({
  selector: '[add-dob-safety-violation]',
  templateUrl: './formAddDobSafetyViolation.component.html',
  styleUrls: ['./formAddDobSafetyViolation.component.scss'],
})
export class FormAddDobSafetyViolation {
  @Input() modalRef: BsModalRef
  @Input() idJob: number
  @Input() idViolation: any
  @Input() reload: any
  @Input() isNew: any
  @Input() isFromChecklist: boolean = false;
  @Output() voilationUpdated: EventEmitter<any> = new EventEmitter<any>();

  errorMsg: any
  loading: boolean = false
  public violation: any
  PartyResponsible: any;
  formData: FormGroup;
  private showCOCDate: boolean = true
  partOfProjects: any = [];

  constructor(
    private toastr: ToastrService,
    private message: Message,
    private jobViolationServices: JobViolationServices,
    private fb: FormBuilder,
    private taskServices: TaskServices
  ) {
    this.errorMsg = this.message.msg
    this.initializeForm()
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    console.log('idJob', this.idJob)
    this.jobId.setValue(this.idJob)
    if (this.idViolation) {
      this.getData()
      this.getPartOfProjects()
    }
  }

  getData() {
    this.loading = true;
    this.jobViolationServices.getDobSafetyVioationById(this.idViolation).subscribe(res => {
      console.log(res)
      this.violation = res
      if (this.violation.dateIssued) {
        this.violation.dateIssued = this.taskServices.dateFromUTC(this.violation.dateIssued, true);
      }
      this.formData.patchValue(this.violation)
      this.loading = false;
    }, err => {
      this.loading = false;
      this.toastr.error(err)
      console.log(err)
    })
  }

  getPartOfProjects() {
    this.loading = true;
    this.jobViolationServices.getDobPartOfProjects(this.idViolation).subscribe((res: any) => {
      console.log(res)
      this.partOfProjects = res.data
      if (this.partOfProjects.length > 0) {
        for (let index = 0; index < this.partOfProjects.length; index++) {
          this.partOfProjects[index].startDate = this.taskServices.dateFromUTC(this.partOfProjects[index].startDate, true);
        }
      }
    }, err => {
      this.loading = false;
      this.toastr.error(err)
      console.log(err)
    })
  }

  initializeForm() {
    this.formData = this.fb.group({
      'dateIssued': ['', Validators.required],
      'summonsNumber': ['', Validators.required],
      'device_Type': [''],
      'deviceNumber': [''],
      'violation_Status': [''],
      'violationType': [''],
      // 'dispositionComments': [''],
      'violationDescription': [''],
      'partyResponsible': ['3', Validators.required],
      'manualPartyResponsible': [''],
      'idJob': [this.idJob],
      'notes': [],
      'isManually': [true],

    })
  }

  get dateIssued() {
    return this.formData.get('dateIssued')
  }

  get summonsNumber() {
    return this.formData.get('summonsNumber')
  }

  get deviceNumber() {
    return this.formData.get('deviceNumber')
  }

  // get dispositionComments() {
  //   return this.formData.get('dispositionComments')
  // }
  get description() {
    return this.formData.get('ViolationDescription')
  }

  get partyResponsible() {
    return this.formData.get('partyResponsible')
  }

  get jobId() {
    return this.formData.get('idJob')
  }

  /**
   * This method is used to show date picker on based on selection of COC date
   * @method showDatePicker
   * @param {any} e e is an instance of an element
   */
  showDatePicker(e: any) {
    if (e) {
      this.showCOCDate = false
    } else {
      this.showCOCDate = true
      this.violation.cocDate = ''
    }
  }

  onSubmit() {
    console.log(this.formData.value)
    this.loading = true;
    if (this.idViolation) {
      this.formData.value.id = this.idViolation
      this.jobViolationServices.updateDobSafetyViolation(this.idViolation, this.formData.value).subscribe(res => {
        console.log(res)
        this.loading = false;
        if (this.isFromChecklist) {
          this.voilationUpdated.emit()
        } else {
          this.reload()
        }
        this.modalRef.hide();
        this.toastr.success('DOB Safety Violation Updated!')
      }, err => {
        this.loading = false;
        this.toastr.error(err)
        console.log(err)
      })
    } else {
      this.jobViolationServices.createDobSafetyViolation(this.formData.value).subscribe(res => {
        console.log(res)
        this.loading = false;
        this.reload()
        this.modalRef.hide();
        this.toastr.success('DOB Safety Violation Created!')
      }, err => {
        this.loading = false;
        this.toastr.error(err)
        console.log(err)
      })
    }
  }
}