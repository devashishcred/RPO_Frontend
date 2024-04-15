import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { JobCheckListServices } from '../checklist/checklist.service';

@Component({
  selector: '[add-violation-checklist]',
  templateUrl: './add-violation.component.html',
  styleUrls: ['./add-violation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddViolationComponent implements OnInit {
  @Input() modalRef: BsModalRef
  @Input() type: string = 'ECB';
  @Input() idJob: any;
  @Input() idCompositeChecklist: any;
  @Output() voilationAdded: EventEmitter<any> = new EventEmitter<any>();
  loading: boolean = false;
  ecbViolation: any = [];
  dobViolation: any = [];
  dobSafetyViolation: any = [];
  isAllSelected: boolean = false;
  listOfSelectedViolationsId: any = [];

  constructor(
    private toastr: ToastrService,
    private jobViolationServices: JobCheckListServices,
  ) {

  }

  ngOnInit() {
    this.getData()
  }

  getData() {
    this.loading = true;
    if (this.type === 'ECB') {
      this.jobViolationServices.getEcbViolationsOnAddModal(this.idJob, this.idCompositeChecklist).subscribe(res => {
        this.ecbViolation = res
        this.checkAlreadyAddedViolations()
        this.loading = false;
      }, err => {
        this.loading = false;
      })
    } else if (this.type === 'DOB') {
      this.jobViolationServices.getDobViolationsOnAddModal(this.idJob, this.idCompositeChecklist).subscribe(res => {
        this.dobViolation = res
        this.checkAlreadyAddedViolations()
        this.loading = false;
      }, err => {
        this.loading = false;
      })
    } else if (this.type === 'DOB Safety') {
      this.jobViolationServices.getDobSafetyViolationsOnAddModal(this.idJob, this.idCompositeChecklist).subscribe(res => {
        this.dobSafetyViolation = res
        this.checkAlreadyAddedViolations()
        this.loading = false;
      }, err => {
        this.loading = false;
      })
    } else {
      this.loading = false;
    }
  }

  checkAlreadyAddedViolations() {
    this.listOfSelectedViolationsId = []
    if (this.type === 'ECB') {
      for (let index = 0; index < this.ecbViolation.length; index++) {
        const violation = this.ecbViolation[index];
        if (violation.isPartofchecklist) {
          this.listOfSelectedViolationsId.push(violation.jobViolations.id)
        }
      }
      if (this.ecbViolation.length === this.listOfSelectedViolationsId.length) {
        this.isAllSelected = true;
      }
    } else if (this.type === 'DOB') {
      for (let index = 0; index < this.dobViolation.length; index++) {
        const violation = this.dobViolation[index];
        if (violation.isPartofchecklist) {
          this.listOfSelectedViolationsId.push(violation.jobViolations.id)
        }
      }
      if (this.dobViolation.length === this.listOfSelectedViolationsId.length) {
        this.isAllSelected = true;
      }
    } else if (this.type === 'DOB Safety') {
      for (let index = 0; index < this.dobSafetyViolation.length; index++) {
        const violation = this.dobSafetyViolation[index];
        if (violation.isPartofchecklist) {
          this.listOfSelectedViolationsId.push(violation.jobViolations.id)
        }
      }
      if (this.dobSafetyViolation.length === this.listOfSelectedViolationsId.length) {
        this.isAllSelected = true;
      }
    }
  }

  onEcbSelectAll() {
    if (this.isAllSelected) {
      this.isAllSelected = false;
      this.listOfSelectedViolationsId = [];
      for (let index = 0; index < this.ecbViolation.length; index++) {
        this.ecbViolation[index].isPartofchecklist = false;
      }
    } else {
      this.isAllSelected = true;
      this.listOfSelectedViolationsId = [];
      for (let index = 0; index < this.ecbViolation.length; index++) {
        const violation = this.ecbViolation[index]
        this.listOfSelectedViolationsId.push(violation.jobViolations.id)
        this.ecbViolation[index].isPartofchecklist = true;
      }
    }
  }

  onDobSelectAll() {
    if (this.isAllSelected) {
      this.isAllSelected = false;
      this.listOfSelectedViolationsId = [];
      for (let index = 0; index < this.dobViolation.length; index++) {
        this.dobViolation[index].isPartofchecklist = false;
      }
    } else {
      this.isAllSelected = true;
      this.listOfSelectedViolationsId = [];
      for (let index = 0; index < this.dobViolation.length; index++) {
        const violation = this.dobViolation[index]
        this.listOfSelectedViolationsId.push(violation.jobViolations.id)
        this.dobViolation[index].isPartofchecklist = true;
      }
    }
  }

  onDobSafetySelectAll() {
    if (this.isAllSelected) {
      this.isAllSelected = false;
      this.listOfSelectedViolationsId = [];
      for (let index = 0; index < this.dobSafetyViolation.length; index++) {
        this.dobSafetyViolation[index].isPartofchecklist = false;
      }
    } else {
      this.isAllSelected = true;
      this.listOfSelectedViolationsId = [];
      for (let index = 0; index < this.dobSafetyViolation.length; index++) {
        const violation = this.dobSafetyViolation[index]
        this.listOfSelectedViolationsId.push(violation.jobViolations.id)
        this.dobSafetyViolation[index].isPartofchecklist = true;
      }
    }
  }

  onSelectViolation(id, listIndex) {
    let index = this.listOfSelectedViolationsId.findIndex(el => el === id)
    if (this.type === 'ECB') {
      if (index === -1) {
        this.listOfSelectedViolationsId.push(id)
        this.ecbViolation[listIndex].isPartofchecklist = true;
      } else {
        this.listOfSelectedViolationsId.splice(index, 1)
        this.ecbViolation[listIndex].isPartofchecklist = false;
      }
      if (this.ecbViolation.length === this.listOfSelectedViolationsId.length) {
        this.isAllSelected = true;
      } else {
        this.isAllSelected = false;
      }
    } else if(this.type === 'DOB') {
      if (index === -1) {
        this.listOfSelectedViolationsId.push(id)
        this.dobViolation[listIndex].isPartofchecklist = true;
      } else {
        this.listOfSelectedViolationsId.splice(index, 1)
        this.dobViolation[listIndex].isPartofchecklist = false;
      }
      if (this.dobViolation.length === this.listOfSelectedViolationsId.length) {
        this.isAllSelected = true;
      } else {
        this.isAllSelected = false;
      }
    } else if(this.type === 'DOB Safety') {
      if (index === -1) {
        this.listOfSelectedViolationsId.push(id)
        this.dobSafetyViolation[listIndex].isPartofchecklist = true;
      } else {
        this.listOfSelectedViolationsId.splice(index, 1)
        this.dobSafetyViolation[listIndex].isPartofchecklist = false;
      }
      if (this.dobSafetyViolation.length === this.listOfSelectedViolationsId.length) {
        this.isAllSelected = true;
      } else {
        this.isAllSelected = false;
      }
    }

  }

  addEcbAndDobViolationInChecklist() {
    // this.loading = true;
    const payload = {
      IdCompositechecklist: this.idCompositeChecklist[0],
      lstIdViolations: this.listOfSelectedViolationsId,
      Type_ECB_DOB: this.type == 'DOB Safety' ? 'Safety' : this.type
    }
    console.log('payload', payload)
    this.jobViolationServices.addEcbAndDobViolationInChecklist(payload).subscribe(res => {
      this.loading = false;
      this.voilationAdded.emit()
      this.modalRef.hide()
    }, err => {
      this.loading = false;
    })
  }

}
