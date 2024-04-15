import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { JobPermit } from '../../../../../types/jobPermit';
import { JobApplicationService } from '../../../../../services/JobApplicationService.services';
import { Message } from "../../../../../app.messages";
import * as moment from 'moment';
import { TaskServices } from '../../../../task/task.services';
import { constantValues } from '../../../../../app.constantValues';
import * as _ from 'underscore';

declare const $: any
/**
* This component contains all function that are used in FormAddDotPermit
* @class FormAddDotPermit
*/
@Component({
  selector: '[form-add-dot-permit]',
  templateUrl: './formAddDotPermit.component.html'
})

export class FormAddDotPermit {
  @Input() modalRef: BsModalRef
  @Input() onSave: Function
  @Input() idApplicationNumber: any
  @Input() formAddPermit: JobPermit
  @Input() appType: any
  @Input() reload: Function
  @Input() idJob: number
  @Input() idJobAppObject: any
  @Input() isNew: boolean
  @Input() idApp: any
  @Input() jobAppObject: any

  private selectedJobType: number
  jobPermit: any
  private workPermit: any
  errorMsg: any
  private responsiblityList: any = []
  private jobContacts: any = []
  loading: boolean = false
  private workPermitId: number
  private disablePerson: boolean = false;

  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(
    private toastr: ToastrService,
    private message: Message,
    private JobApplicationService: JobApplicationService,
    private constantValues: constantValues,
    private taskServices: TaskServices,

  ) {
    this.errorMsg = this.message.msg

  }

  /**
    * This method will be called once only when module is call for first time
    * @method ngOnInit
  */
  ngOnInit() {
    this.jobPermit = {} as JobPermit
    this.loading = true
    if (this.jobAppObject) {
          this.jobPermit.streetWorkingOn = this.jobAppObject.streetWorkingOn
          this.jobPermit.streetTo = this.jobAppObject.streetTo
          this.jobPermit.streetFrom = this.jobAppObject.streetFrom
    }

    if (this.appType.idJobApplicationType) {
      this.JobApplicationService.getResponsibleDropDown().subscribe(r => {
        this.responsiblityList = r
      }, e => { })
      this.JobApplicationService.getWorkPermitTypes(this.appType.idJobApplicationType).subscribe(r => {
        this.workPermit = r
        this.jobPermit.idJob = this.idJob
        this.contacts(this.idJob)
        this.jobPermit.idJobApplication = this.idApp
        this.jobPermit.idApplicationNumber = this.appType.applicationNumber
        this.jobPermit.applicationType = this.appType.idJobApplicationType
        this.jobPermit.jobApplicationTypeName = this.appType.jobApplicationTypeName
        this.jobPermit.applicationNumber = this.idApplicationNumber
        if (this.appType.id && this.isNew) {
          this.workPermitId = this.appType.id
          this.getWorkPermit()
        } else {
          this.loading = false
        }
      }, e => { this.loading = false })
    } else {
      this.loading = false
    }
  }

  /**
   * This method disable person responsible
   * @method disablePersonResposible
   */
  disablePersonResposible() {
    if (this.jobPermit.idResponsibility == 1) {
      this.jobPermit.idContactResponsible = null;
      this.disablePerson = true;
    } else {
      this.disablePerson = false;
    }
  }

  /**
   * This method get all contacts
   * @method contacts
   * @param {number} idJob ID of Job 
   */
  contacts(idJob: number) {
    this.JobApplicationService.getJobContacts(idJob).subscribe(r => {
      if (r.data.length > 0) {
        let data = r.data
        let contacts = _.sortBy(data, function (data: any) { return data.contactName.toLowerCase(); });
        this.jobContacts = contacts
      }
    }, e => { this.loading = false })
  }

  /**
   * This method get all work permits
   * @method getWorkPermit
   */
  getWorkPermit() {
    this.JobApplicationService.getWorkPermitById(this.idJobAppObject).subscribe(r => {
      this.jobPermit = {} as JobPermit
      this.jobPermit = r
      this.jobPermit.idJob = this.idJob
      this.jobPermit.idJobApplication = this.idApp
      this.jobPermit.idApplicationNumber = this.appType.applicationNumber
      this.jobPermit.applicationNumber = this.idApplicationNumber
      this.jobPermit.applicationType = this.appType.idJobApplicationType
      this.jobPermit.jobApplicationTypeName = this.appType.jobApplicationTypeName
      this.jobPermit.streetWorkingOn = this.jobAppObject.streetWorkingOn
      this.jobPermit.streetTo = this.jobAppObject.streetTo
      this.jobPermit.streetFrom = this.jobAppObject.streetFrom
      if (this.jobPermit.expires) {
        this.jobPermit.expires = this.taskServices.dateFromUTC(this.jobPermit.expires, true);
      }
      if (this.jobPermit.filed) {
        this.jobPermit.filed = this.taskServices.dateFromUTC(this.jobPermit.filed, true);
      }
      if (this.jobPermit.issued) {
        this.jobPermit.issued = this.taskServices.dateFromUTC(this.jobPermit.issued, true);
      }
      if (this.jobPermit.signedOff) {
        this.jobPermit.signedOff = this.taskServices.dateFromUTC(this.jobPermit.signedOff, true);
      }
      if (this.jobPermit.withdrawn) {
        this.jobPermit.withdrawn = this.taskServices.dateFromUTC(this.jobPermit.withdrawn, true);
      }
      this.disablePersonResposible()
      this.loading = false

    }, e => { this.loading = false })
  }

  /**
   * This method save work permit
   * @method savePermit
   */
  savePermit() {
    this.loading = true
    let newApplication = false
    if (this.jobPermit.id && this.jobPermit.id > 0) {
      newApplication = false
    } else {
      newApplication = true
    }
    delete this.jobPermit.lastModifiedDate
    this.jobPermit.filed = $('#filed').val();
    this.jobPermit.issued = $('#issued').val();
    this.jobPermit.expires = $('#expires').val();
    this.jobPermit.signedOff = $('#signOff').val();
    this.loading = true
    this.jobPermit.companyResponsible = null
    this.JobApplicationService.addEditWorkPermit(this.jobPermit, newApplication).subscribe(r => {
      if (newApplication) {
        this.toastr.success('Work Permit added successfully')
      } else {
        this.toastr.success('Application updated successfully')
      }
      this.modalRef.hide()
      this.reload()
      this.loading = false
    }, e => {
      this.modalRef.hide()
      this.loading = false
    })
  }

  /**
   * This method get company list
   * @method getCompany
   * @param {any} e Event Object
   */
  getCompany(e: any) {
    if (e != null) {
      if (e.companyName) {
        this.jobPermit.companyResponsible = e.companyName
      } else {
        this.jobPermit.companyResponsible = 'Individual'
      }
    } else {
      this.jobPermit.companyResponsible = ""
    }
  }

  /**
   * This method convert string date to object 
   * @method getTheDateObject
   * @param {any} date Date String 
   */
  getTheDateObject(date: any) {
    return new Date(date)
  }

  /**
   * This method check given number is decimal or not
   * @method isDecimal
   * @param {any} evt Event Object 
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
      return true;
    }
  }
}