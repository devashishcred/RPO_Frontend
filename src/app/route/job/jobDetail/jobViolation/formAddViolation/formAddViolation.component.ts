import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
import { DatePipe } from '@angular/common';

declare const $: any

/**
 * This component contains all function that are used in Form Add Violation
 * @class FormAddViolation
 */
@Component({
  selector: '[add-violation]',
  templateUrl: './formAddViolation.component.html',
  styleUrls: ['./formAddViolation.component.scss'],
  providers: [DatePipe]
})
export class FormAddViolation {
  @Input() modalRef: BsModalRef
  @Input() idJob: number
  @Input() idViolation: number
  @Input() reload: any
  @Input() isNew: any

  errorMsg: any
  private new: boolean = true
  loading: boolean = false
  public violation: any
  disableGetInfo: string = 'hide'
  private documents: any = []
  private showCOCDate: boolean = true
  private penaltyCode: any = []
  private idViolationPaneltyCode: number
  private summonsNotice: any = []
  private chargesNorFromAuth: any = []
  disableSummons: boolean = false
  private blankExplanationCharge: boolean = false
  PartyResponsible: any;
  violationTypes: any = [
    'Administrative',
    'Boilers',
    'Construction',
    'Cranes and Derricks',
    'Elevators',
    'HPD',
    'Local Law',
    'Padlock',
    'Plumbing',
    'Public Assembly',
    'Quality of Life',
    'Signs',
    'Site Safety',
    'Unknown',
    'Zoning',
  ];
  partOfProjects: any = [];

  constructor(
    private toastr: ToastrService,
    private message: Message,
    private constantValues: constantValues,
    private jobViolationServices: JobViolationServices,
    private jobApplicationService: JobApplicationService,
    private taskServices: TaskServices,
    private datePipe: DatePipe
  ) {
    this.errorMsg = this.message.msg

  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.violation = {} as Violation
    this.violation.idJob = this.idJob
    this.violation.documentsToDelete = []
    this.violation.partyResponsible = 3

    this.getSummonsNoticeStatus();
    this.jobViolationServices.getPenaltyCode().subscribe(r => {
      this.penaltyCode = []
      this.penaltyCode = r
    }, e => {
    })

    if (this.idViolation > 0) {
      this.loading = true
      this.disableSummons = true
      this.jobViolationServices.getById(this.idViolation).subscribe(r => {
        this.violation = r

        // Date format logic
        if (this.violation.dateIssued) {
          this.violation.dateIssued = this.taskServices.dateFromUTC(this.violation.dateIssued, true);
        }
        if (this.violation.hearingDate) {
          this.violation.hearingDate = this.taskServices.dateFromUTC(this.violation.hearingDate, true);
        }
        if (this.violation.hearingTime) {
          this.violation.hearingTime = this.datePipe.transform(this.violation.hearingTime, 'HH:mm')
        }
        if (this.violation.complianceOn) {
          this.violation.complianceOn = this.taskServices.dateFromUTC(this.violation.complianceOn, true);
        }
        if (this.violation.resolvedDate) {
          this.violation.resolvedDate = this.taskServices.dateFromUTC(this.violation.resolvedDate, true);
        }
        if (this.violation.cureDate) {
          this.violation.cureDate = this.taskServices.dateFromUTC(this.violation.cureDate, true);
        }
        if (this.violation?.partOfJobs?.length > 0) {
          for (let index = 0; index < this.violation?.partOfJobs.length; index++) {
            this.violation.partOfJobs[index].startDate = this.taskServices.dateFromUTC(this.violation.partOfJobs[index].startDate, true);
            ;
          }
        }

        console.log('this.violation', this.violation)

        // Date fromat logic ends here

        this.chargesNorFromAuth = r.explanationOfCharges
        if (r.explanationOfCharges && r.explanationOfCharges.length > 0) {
          this.chargesNorFromAuth = r.explanationOfCharges.filter((x: any) => x.isFromAuth == false)
        }
        this.violation.notesLastModifiedDate = moment(r.notesLastModifiedDate).format(this.constantValues.DATETIMEFORMATWITHAMPM);
        console.log('notesLastModifiedDate', r.notesLastModifiedDate)
        if (this.violation.idViolationPaneltyCode) {
          this.idViolationPaneltyCode = this.violation.idViolationPaneltyCode
        }
        if (this.violation.isCOC) {
          this.showCOCDate = false
        }
        this.violation.documentsToDelete = [];
        this.disableGetInfo = 'show'
        this.loading = false
      }, e => {
        this.loading = false
      })
      this.getPartOfProjects()
    }


  }

  getPartOfProjects() {
    this.loading = true;
    this.jobViolationServices.getDobPartOfProjects(this.idViolation).subscribe((res: any) => {
      this.loading = false;
      this.partOfProjects = res.data
      if (this.partOfProjects.length > 0) {
        for (let index = 0; index < this.partOfProjects.length; index++) {
          console.log(this.partOfProjects[index].startDate)
          this.partOfProjects[index].startDate = this.taskServices.dateFromUTC(this.partOfProjects[index].startDate, true);
        }
      }
    }, err => {
      this.loading = false;
      this.toastr.error(err)
      console.log(err)
    })
  }


  /**
   * This method is used to get all status of summonce notice
   * @method getSummonsNoticeStatus
   */
  getSummonsNoticeStatus() {
    this.summonsNotice = []
    this.summonsNotice.push({id: "NEW ISSUANCE", itemName: "New Issuance"})
    this.summonsNotice.push({id: "PAID IN FULL", itemName: "Paid in full"})
    this.summonsNotice.push({id: "ASSIGNED", itemName: "Assigned"})
    this.summonsNotice.push({id: "STIPULATION OFFERED", itemName: "Stipulation Offered"})
  }


  /**
   * This method is used to make get info button enable disable
   * @method getInfoEnable
   */
  getInfoEnable() {
    if (this.violation.summonsNumber) {
      this.disableGetInfo = 'show'
    } else {
      this.disableGetInfo = 'hide'
    }
  }

  /**
   * This method is used to convert sting to title case
   * @method toTitleCase
   * @param {string} str str contains a string that need to be converted to title case
   */
  private toTitleCase(str: string) {
    if (str != null) {
      return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    } else {
      return str
    }
  }

  /**
   * This method is used to make get info from OATH and fill all details in violation form
   * @method getViolationInfo
   */
  getViolationInfo() {
    if (!this.violation.summonsNumber.match("^[a-zA-Z0-9]*$")) {
      this.toastr.error('Summons Number is Invalid')
    } else {
      this.violation.summonsNumber = this.violation.summonsNumber.trim();
      this.loading = true
      this.violation.explanationOfCharges = []
      this.jobViolationServices.getOATH(this.violation.summonsNumber).subscribe(r => {
        this.loading = false
        if (r.summonsNumber == null) {
          this.toastr.warning("The summons number you provided does not appear to be valid. Please check the number and try again.");
        } else {
          this.violation.dateIssued = r.dateIssued
          this.violation.hearingDate = r.hearingDate
          this.violation.hearingTime = r.hearingTime
          this.violation.hearingLocation = this.toTitleCase(r.hearingLocation)
          this.violation.hearingResult = this.toTitleCase(r.hearingResult)
          this.violation.statusOfSummonsNotice = this.toTitleCase(r.statusOfSummonsNotice)
          this.violation.respondentAddress = this.toTitleCase(r.respondentAddress)
          this.violation.inspectionLocation = this.toTitleCase(r.inspectionLocation)
          r.balanceDue = r.balanceDue ? r.balanceDue.replace('$', '') : ''
          this.violation.balanceDue = r.balanceDue
          this.violation.respondentName = this.toTitleCase(r.respondentName)
          this.violation.issuingAgency = this.toTitleCase(r.issuingAgency)
          this.violation.complianceOn = r.complianceOn
          this.violation.certificationStatus = this.toTitleCase(r.certificationStatus)
          this.violation.explanationOfCharges = []
          if (r.explanationOfCharges && r.explanationOfCharges.length > 0) {
            r.explanationOfCharges.forEach((element: any) => {
              element.description = this.toTitleCase(element.description)
              this.violation.explanationOfCharges.push(element)
            });
          }
          if (this.chargesNorFromAuth && this.chargesNorFromAuth.length > 0) {
            this.chargesNorFromAuth.forEach((element: any) => {
              element.description = this.toTitleCase(element.description)
              this.violation.explanationOfCharges.push(element)
            });
          }
        }

      }, e => {
        this.loading = false
      })
    }
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

  /**
   * This method is used to add explanation charges from violation
   * @method addCharges
   */
  addCharges() {
    let chargesLength = Math.floor(100000 + Math.random() * 900000)
    if (typeof this.violation.explanationOfCharges == 'undefined' || this.violation.explanationOfCharges == null) {
      this.violation.explanationOfCharges = []
    }
    if (this.violation.explanationOfCharges.length >= 10) {
      this.toastr.warning("Max 10 records you can add.")
      return
    }

    this.violation.explanationOfCharges.push({
      id: 0,
      paneltyAmount: null,
      description: null,
      codeSection: null,
      code: null,
      IsFromAuth: false,
      rowCnt: chargesLength
    })

  }

  /**
   * This method is used to delete explanation charges from violation
   * @method deleteCharges
   * @param {number} index  of row that we want to delete
   * @param {any} charges  object that row we want to delete
   */
  deleteCharges(index: number, charges: any) {
    let remove: any
    if (charges.id > 0) {
      this.violation.explanationOfCharges = this.violation.explanationOfCharges.filter((x: any) => x.id != charges.id)
    } else {
      this.violation.explanationOfCharges = this.violation.explanationOfCharges.filter((x: any) => x.rowCnt != index)
    }
  }

  /**
   * This method is used to save violation record while create/update
   * @method saveViolation
   */
  saveViolation() {
    this.blankExplanationCharge = false
    this.violation.idJob = this.idJob
    this.violation.dateIssued = $('#dateIssued').val();
    this.violation.hearingDate = $('#hearingDate').val();
    this.violation.complianceOn = $('#complianceOn').val();
    this.violation.resolvedDate = $('#resolvedDate').val();
    this.violation.cureDate = $('#cureDate').val();
    if (!this.idViolationPaneltyCode) {
      this.idViolationPaneltyCode = null
    }
    this.violation.idViolationPaneltyCode = this.idViolationPaneltyCode

    this.loading = true
    if (this.violation.explanationOfCharges && this.violation.explanationOfCharges.length > 0) {
      this.violation.explanationOfCharges.forEach((data: any, key: any) => {
        if (!data.code || !data.codeSection || !data.description || !data.paneltyAmount) {
          this.blankExplanationCharge = true
          return false
        }
      })
    }
    if (this.blankExplanationCharge) {
      this.toastr.error(this.errorMsg.blankExplanationCharges)
      this.loading = false
    } else {
      if (this.idViolation > 0) {
        this.jobViolationServices.updateViolation(this.idViolation, this.violation).subscribe(r => {
          this.reload()
          let chkPromise = this.uploadDocuments(r.id)
          chkPromise.then(value => {

          })
          this.toastr.success(this.errorMsg.violationUpdated);
          this.modalRef.hide();
          this.loading = false
        }, r => {
          this.loading = false
        })
      } else {
        this.violation.id = 0
        this.jobViolationServices.createViolation(this.violation).subscribe(r => {
          this.toastr.success(this.errorMsg.violationCreated);
          let chkPromise = this.uploadDocuments(r.id)
          chkPromise.then(value => {

          })
          this.reload()
          this.modalRef.hide();
          this.loading = false
        }, r => {
          this.loading = false
        })
      }
    }
  }


  /**
   * This method is used for uploading documents that are attached in violation
   * @method documentUpload
   * @param {any} evt evt is an object of files
   */
  documentUpload(evt: any) {
    if (this.violation.jobViolationDocuments == null) {
      this.violation.jobViolationDocuments = []
    }
    let files = evt.target.files;
    for (var i = 0; i < files.length; i++) {
      this.violation.jobViolationDocuments.push(files[i])
      this.documents.push(files[i]);
    }
  }

  /**
   * This method is used to call api for uploading document to server
   * @method documentUpload
   * @param {number} id id is job violation Id
   */
  uploadDocuments(id: number): Promise<{}> {
    return new Promise((resolve, reject) => {
      if (this.documents && this.documents.length > 0) {
        let formData = new FormData();
        formData.append('idJobViolation', id.toString())

        for (var i = 0; i < this.documents.length; i++) {
          formData.append('documents_' + i, this.documents[i])
        }
        this.jobViolationServices.saveDocuments(formData).subscribe(r => {
          resolve(null)
        }, e => {
          reject()
        })
      } else {
        resolve(null)
      }
    })
  }

  /**
   * This method is used to delete document from database
   * @method deleteDocument
   * @param {any} d  d is the id of the document that we need to delete
   */
  deleteDocument(d: any) {
    if (d.id) {
      this.violation.documentsToDelete.push(d.id);
    }
    this.violation.jobViolationDocuments.splice(this.violation.jobViolationDocuments.indexOf(d), 1)
    this.documents.splice(this.violation.jobViolationDocuments.indexOf(d), 1)
  }

  /**
   * This method is used to show whether resolve date should be appear if it is fully resolved not compulsory
   * @method showResolveDate
   */
  showResolveDate() {
    if (!this.violation.isFullyResolved) {
      this.violation.resolvedDate = null
    }
  }

  /**
   * This method check given data is decimal or not
   * @method isDecimal
   * @param {any} evt event object
   */
  isDecimal(evt: any) {
    //getting key code of pressed key
    var keycode = (evt.which) ? evt.which : evt.keyCode;
    //comparing pressed keycodes
    if (!(keycode == 8 || keycode == 46) && (keycode < 48 || keycode > 57)) {
      return false;
    } else {
      var parts = evt.srcElement.value.split('.');
      if (parts.length > 1 && keycode == 46)
        return false;
      return true;
    }
  }

  updatePartyResponcible(status: string) {
    console.log(status)
    this.violation.partyResponsible = status
    console.log(this.violation.PartyResponsible)
    this.PartyResponsible = status;
  }

}