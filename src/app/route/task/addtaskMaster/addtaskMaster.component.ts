import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'underscore';
import { EmployeeServices } from '../../employee/employee.services';
import { TaskServices } from '../task.services';
import { Message } from '../../../app.messages';
import { constantValues } from '../../../app.constantValues';
import { Task } from '../../../types/task';
import { RfpSubmitServices } from '../../addRfp/rfpSubmit/rfpSubmit.services';
import { ToastrService } from 'ngx-toastr';

declare var $: any;

/**
 * AddTaskComponent class contains all function that are used in Add/Edit Task
 * @class AddTaskComponent
 */
@Component({
  selector: '[add-task-master]',
  templateUrl: './addtaskMaster.component.html',
  styleUrls: ['./addtaskMaster.component.scss']
})
export class AddTaskMasterComponent implements OnInit {
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() isNew: boolean
  @Input() idTask: number

  task: any
  loading: boolean = false
  employees: any = []
  taskType: any = []
  taskStatus: any = []
  errorMsg: any
  documents: any
  taskDocuments: any
  allJobs: any = []
  exceedFileSize: boolean = false
  showExaminer: boolean = false
  disabled = false

  /**
   * This method define all services that requires in whole class
   * @method constructor
   */
  constructor(
    private employeeServices: EmployeeServices,
    private taskServices: TaskServices,
    private message: Message,
    private constantValues: constantValues,
    private rfpSubmitService: RfpSubmitServices,
    private toastr: ToastrService,
  ) {
    this.errorMsg = this.message.msg

  }

  /**
   * This method will call add/edit task form loads first time
   * @method ngOnInit
   */
  ngOnInit() {
    console.log(this.isNew);
    let userId = localStorage.getItem('userLoggedInId');
    let userName = localStorage.getItem('userLoggedInName');
    userName = userName.replace(/"/g, "");
    this.getTobeLinkJobsList();
    this.getEmployees();
    this.getTaskSatus();
    this.getTaskType();
    this.task = {} as Task
    this.task.assignedDate = moment().format(this.constantValues.DATEFORMAT);
    this.task.idTaskStatus = 1
    this.task.idAssignedBy = JSON.parse(userId)// userId.toString()//

    if (this.isNew) {
      this.loading = false;
    } else {
      if (this.idTask) {
        this.getTaskById();
      }
    }
  }


  /**
   * This method gets task types for dropdown list
   * @method getTaskType
   */
  getTaskType() {
    return new Promise((resolve, reject) => {
      this.taskServices.getTaskType().subscribe(r => {

        this.taskType = _.sortBy(r, function (r: any) {
          return r.name.toLowerCase();
        });
        resolve(r)
      }, e => {
        this.loading = false
        reject()
      })
    })
  }

  /**
   * This method gets task types for dropdown list
   * @method getTaskTypes
   */
  getTaskTypes(idTasktype: any) {
    return new Promise((resolve, reject) => {
      this.taskServices.getTaskTypeS(idTasktype).subscribe(r => {
        this.taskType = _.sortBy(r, function (r: any) {
          return r.name.toLowerCase();
        });
        resolve(r)
      }, e => {
        this.loading = false
        reject()
      })
    })
  }

  /**
   * This method gets task status for dropdown list
   * @method getTaskSatus
   */
  getTaskSatus() {
    this.loading = true;
    this.taskServices.getTaskStatus().subscribe(r => {
      this.taskStatus = _.sortBy(r, function (i: any) {
        return i.name.toLowerCase();
      });
    }, e => {
      this.loading = false
    })
  }

  /**
   * This method gets employees data for dropdown list
   * @method getEmployees
   */
  getEmployees() {
    this.loading = true
    this.employeeServices.getEmpDropdown().subscribe(r => {
      this.employees = _.sortBy(r, function (r: any) {
        return r.employeeName.toLowerCase();
      });
    }, e => {
      this.loading = false
    })
  }

  /**
   * This method will close popup
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
   * This method will save task to database
   * @method saveTask
   */
  saveTask() {
    let msg = this.isNew ? "Task Created successfully" : "Task Updated successfully";
    this.loading = true

    // For Job Documents
    if (this.task && this.task.idJobDocuments && this.task.idJobDocuments.length > 0) {
      let selectedJobDocument = this.task.idJobDocuments;
      this.task.idJobDocuments = [];
      selectedJobDocument.forEach((data: any) => {
        this.task.idJobDocuments.push(data.id);
        console.log(this.task.idJobDocuments);
      });
    }
    this.task.isGeneric = true;
    this.taskServices.addGeneralTask(this.task, this.isNew).subscribe(r => {
      this.uploadDocumentsinDB(r.id); // Upload attachments
      this.toastr.success(msg)
      this.modalRef.hide()
      this.reload()
      this.loading = false
    }, e => {
      console.log(e);
      this.loading = false
    })
  }


  /**
   * This method will set data when task type is change
   * @method taskTypechange
   * @param {any} ele task type element
   */

  clicked() {
    this.getTaskType();
  }

  /**
   * This method will upload documents in database
   * @method uploadDocumentsinDB
   * @param {number} id Task ID
   */
  uploadDocumentsinDB(id: number) {
    if (this.documents && this.documents.length > 0) {
      let formData = new FormData();
      for (var i = 0; i < this.documents.length; i++) {
        formData.append('documents_' + i, this.documents[i])
      }
      formData.append('idTask', id.toString())
      this.taskServices.saveAttachments(formData).subscribe(r => {
      }, e => {
        this.loading = false
      })
    }
  }

  /**
   * This method call when attach button for upload attachments
   * @method documentUpload
   * @param {any} evt request Object
   */
  documentUpload(evt: any) {
    if (this.documents == null) {
      this.documents = []
    }
    let files = evt.target.files;
    for (var i = 0; i < files.length; i++) {
      this.documents.push(files[i]);
    }
  }

  /**
   * This method will call when delete document icon clicked
   * @method deleteDocument
   * @param {any} d document object
   */
  deleteDocument(d: any) {
    this.documents.splice(this.documents.indexOf(d), 1)
  }

  /**
   * This method will delete alredy saved attached document
   * @method deleteAlreadyAttchedFile
   * @param {any} document Document Object
   */
  deleteAlreadyAttchedFile(document: any) {
    if (document.id) {
      this.task.documentsToDelete.push(document.id);
    }
    this.taskDocuments = _.without(this.taskDocuments, _.findWhere(this.taskDocuments, {id: document.id}));
  }

  /**
   * This method converts string date into date object
   * @method getTheDateObject
   * @param {any} date String Date
   */
  getTheDateObject(date: any) {
    return new Date(date)
  }


  private getTobeLinkJobsList() {
    this.loading = true;
    this.rfpSubmitService.getTobeLinkJobslist().subscribe(r => {
      this.allJobs = r;
      this.loading = false;
    });
  }

  /**
   * This method gets task detail of given task id
   * @method getTaskById
   */
  getTaskById() {
    this.loading = true;
    this.taskServices.getTaskById(this.idTask).subscribe(r => {
      this.task = r;
      this.task.documentsToDelete = [];
      this.taskDocuments = r.taskDocuments
      let adate = this.task.assignedDate.split('T');
      let aformateddate = moment(adate[0]).format(this.constantValues.DATEFORMAT);
      this.task.assignedDate = aformateddate;
      let date = this.task.completeBy.split('T');
      let formateddate = moment(date[0]).format(this.constantValues.DATEFORMAT);
      this.task.completeBy = formateddate;
      this.taskType.filter((obj: any) => this.task.idTaskType === obj.id)[0];
      // For Job Document
      if (this.task.taskJobDocuments && this.task.taskJobDocuments.length > 0) {
        this.task.idJobDocuments = [];
        for (let i = 0; i < this.task.taskJobDocuments.length; i++) {
          let tempDocumentObj = {
            id: this.task.taskJobDocuments[i].idJobDocument,
            itemName: this.task.taskJobDocuments[i].itemName,
            name: this.task.taskJobDocuments[i].name
          };
          this.task.idJobDocuments.push(tempDocumentObj);
        }
      }
    })
  }

}