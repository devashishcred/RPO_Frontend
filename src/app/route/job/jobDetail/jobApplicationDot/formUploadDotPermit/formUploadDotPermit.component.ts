import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Message } from "../../../../../app.messages";
import * as moment from 'moment';
import { constantValues } from '../../../../../app.constantValues';
import * as _ from 'underscore';
import { JobApplicationService } from '../../../../../services/JobApplicationService.services';
import { SharedService } from '../../../../../app.constantValues'

declare const $: any

/**
 * This component contains all function that are used in FormUploadDotPermit
 * @class FormUploadDotPermit
 */
@Component({
  selector: '[form-upload-dot-permit]',
  templateUrl: './formUploadDotPermit.component.html'
})

export class FormUploadDotPermit {
  @Input() modalRef: BsModalRef;
  @Input() idJob: number;
  @Input() reload = Function;

  private selectedJobType: number
  private errorMsg: any
  loading: boolean = false
  pdfToRead: any = "";
  workPermits: any[] = [];
  fileExtensionError: boolean = false;
  fileExtensionMessage: string;
  private uploadedDocument: any;
  disabled: boolean;

  /**
   * This method define all services that requires in whole class
   * @method constructor
   */
  constructor(
    private toastr: ToastrService,
    private message: Message,
    private constantValues: constantValues,
    private jobApplicationService: JobApplicationService,
    private sharedService: SharedService
  ) {
    this.errorMsg = this.message.msg

  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    if (localStorage.getItem('selectedJobType')) {
      this.selectedJobType = JSON.parse(localStorage.getItem('selectedJobType')).jobType;
    }
  }

  /**
   * This method call when attach document
   * @method documentUpload
   * @param {any} evt Event Object
   */
  documentUpload(evt: any) {
    let files = evt.target.files;
    this.pdfToRead = files[0];
    this.uploadedDocument = files[0];
    let allowedExtensions = ["pdf"];
    let fileExtension = this.pdfToRead.name.split('.').pop();
    if (this.isInArray(allowedExtensions, fileExtension)) {
      this.fileExtensionError = false;
      this.fileExtensionMessage = "";
    } else {
      this.fileExtensionMessage = "Only pdf files are allowed!!";
      this.fileExtensionError = true;
      this.pdfToRead = "";
    }
  }

  /**
   * This method checks that value is in array or not
   * @method isInArray
   * @param {any} array Array in which want to search
   * @param {string} word Search String
   */
  isInArray(array: any, word: string) {
    return array.indexOf(word.toLowerCase()) > -1;
  }

  /**
   * This method read PDF File
   * @method readPDFFile
   */
  readPDFFile() {
    this.loading = true
    if (this.pdfToRead) {
      let formData = new FormData();
      formData.append('documents', this.pdfToRead);
      formData.append('idJob', this.idJob.toString());
      this.jobApplicationService.readPDFWorkPermitFileForDOT(formData).subscribe(r => {
        this.workPermits = r;
        this.loading = false;
      }, e => {
        this.loading = false;
      });
    }
  }

  /**
   * This method save permit
   * @method savePermit
   */
  savePermit() {
    this.loading = true;
    let requestParams: any = [];
    this.workPermits.forEach((data: any) => {
      let tempData = {};
      tempData["filed"] = data.fromDate ? moment(data.fromDate).format(this.constantValues.DATEFORMAT) : null;
      tempData["issued"] = data.issuedDate ? moment(data.issuedDate).format(this.constantValues.DATEFORMAT) : null;
      tempData["expires"] = data.expiredDate ? moment(data.expiredDate).format(this.constantValues.DATEFORMAT) : null;
      tempData["workDescription"] = data.workTypeCode + ' - ' + this.toTitleCase(data.permitType);
      tempData["permitNumber"] = data.permitNumber;
      tempData["previousPermitNumber"] = data.previousPermitNumber;
      tempData["renewalFee"] = data.renewalFees;
      tempData["contractNumber"] = data.contractNumber;
      tempData["streetWorkingFrom"] = this.toTitleCase(data.streetWorkingFrom);
      tempData["streetWorkingOn"] = this.toTitleCase(data.streetWorkingOn);
      tempData["streetWorkingTo"] = this.toTitleCase(data.streetWorkingTo);
      tempData["trackingNumber"] = data.trackingNumber;
      tempData["idJob"] = this.idJob;
      tempData['code'] = data.workTypeCode ? data.workTypeCode.trim() : "";
      tempData['forPurposeOf'] = this.toTitleCase(data.forPurposeOf);
      tempData['permitType'] = this.toTitleCase(data.permitType);
      tempData['equipmentType'] = data.equipmentType;
      requestParams.push(tempData);
      if (requestParams.length == this.workPermits.length) {
        this.jobApplicationService.saveMultipleWorkPermits(requestParams).subscribe((r: any) => {
          let formData = new FormData();
          formData.append('documents', this.pdfToRead);
          formData.append('idJob', this.idJob.toString());
          formData.append('workPermitIds', r.workPermitIds);
          this.jobApplicationService.createJobDocumentOnUploadPermit(formData).subscribe((response: any) => {
            this.loading = false;
            this.toastr.success(this.errorMsg.successUploadPermit);
            this.modalRef.hide();
            this.sharedService.getSelectedJobAppType.emit('reload')
          }, e => {
            this.loading = false;
          });
        }, e => {
          this.loading = false;
        });
      }
    });
  }

  /**
   * This method convert given string into pascal case (e.g = Rpo App)
   * @method toTitleCase
   * @param{string} str request string
   */
  toTitleCase(str: string) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

}