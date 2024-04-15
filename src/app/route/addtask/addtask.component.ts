import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { EmployeeServices } from '../employee/employee.services';
import { TaskServices } from '../task/task.services';
import { Task } from '../../types/task';
import { JobApplicationService } from '../../services/JobApplicationService.services';
import { Message } from "../../app.messages";
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { constantValues, SharedService } from '../../app.constantValues';
import { ContactServices } from '../contact/contact.services';
import * as _ from 'underscore';
import { JobServices } from '../job/job.services';
import { JobContactServices } from '../job/jobDetail/jobContact/JobContact.service';
import { JobDocumentServices } from '../job/jobDetail/jobDocument/jobDocument.service';
import { CompanyServices } from '../company/company.services';
import { JobSharedService } from '../job/JobSharedService';
import { LocalStorageService } from '../../services/local-storage.service';

declare var $: any;

/**
 * AddTaskComponent class contains all function that are used in Add/Edit Task
 * @class AddTaskComponent
 */
@Component({
  selector: '[add-task]',
  templateUrl: './addtask.component.html',
  styleUrls: ['./addtask.component.scss']
})
export class AddTaskComponent implements OnInit {
  @Input() addtask: any
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() idJob: number
  @Input() idRfp: number
  @Input() idCompany: number
  @Input() idContact: number
  @Input() idTask: number
  @Input() isNew: boolean
  @Input() isSendFromTask: boolean
  @Input() isHeader: boolean
  @Input() frommodeule: string;
  @Input() contactdata: any;
  @Input() idrfpContact?: any;
  @Input() idTaskType?: any;
  @Input() isFromNotification: boolean

  private sub: any

  task: any
  loading: boolean = false
  private newApplication: boolean = false
  employees: any = []
  contactList: any = []
  taskType: any = []
  taskStatus: any = []
  application: any = []
  workpermit: any = []
  errorMsg: any
  showExaminer: boolean = false
  private isDisabled: boolean = false
  scopeDDOptions: any
  jobFeeScheduleItems: any
  masterServiceItems: any
  showQtyTextbox: boolean = false
  showHoursTextbox: boolean = false
  serviceQtyZero: boolean = false
  private isEdit: boolean = false
  requireServiceItem: boolean = false
  workPermitDDSettings: any = {}
  jobDocumentPermitDDSettings: any = {}
  showDuration: boolean = false
  showDateTime: boolean = false
  private filteredObj: any
  private serviceItemId: number
  resOfJobTypes: any
  showThedropDownValues: boolean = false
  LabelType: string = ''
  showPermitDropDown: boolean = false
  selectedJobType: any
  documents: any
  taskDocuments: any
  private selection: any
  listOfDocuments: any = []
  isCustomerLoggedIn: boolean = false;

  /**
   * This method define all services that requires in whole class
   * @method constructor
   */
  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private employeeServices: EmployeeServices,
    private taskServices: TaskServices,
    private applicationService: JobApplicationService,
    private message: Message,
    private constantValues: constantValues,
    private sharedService: SharedService,
    private contactServices: ContactServices,
    private JobServices: JobServices,
    private jobDocumentServices: JobDocumentServices,
    private JobContactService: JobContactServices,
    private CompanyService: CompanyServices,
    private jobSharedService: JobSharedService,
    private localStorageService: LocalStorageService
  ) {
    this.errorMsg = this.message.msg

  }

  // getContactOfComDD
  /**
   * This method will call add/edit task form loads first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.isCustomerLoggedIn = this.localStorageService.getCustomerLoggedIn();
    let userId = localStorage.getItem('userLoggedInId');
    let userName = localStorage.getItem('userLoggedInName');
    userName = userName.replace(/"/g, "");
    if (this.frommodeule == 'ContactModule') {
      this.contactList = this.contactdata;
    }
    this.loading = true
    if (this.isNew) {
      this.getContacts(true)
    } else {
      this.getContacts()
    }

    this.getEmployees()
    if (!this.isNew) {
      this.getTaskTypes(this.idTaskType).then((val: any) => {
        if (this.idTask && this.idTask > 0 && !this.isNew) {
          this.getTaskById()
        }
      })
    } else {
      this.getTaskType().then((val: any) => {
        if (this.idTask && this.idTask > 0 && !this.isNew) {
          this.getTaskById()
        }
      })
    }

    this.getTaskSatus()
    this.task = {} as Task
    this.task.documentsToDelete = [];
    if (this.idJob && this.idJob != null) {
      if (this.isCustomerLoggedIn) {
        this.JobServices.getCustomerJobDetailById(this.idJob).subscribe(res => {
          this.resOfJobTypes = res.jobApplicationTypes;
        });
      } else {
        this.JobServices.getJobById(this.idJob).subscribe(res => {
          this.resOfJobTypes = res.jobApplicationTypes;
        });
      }
    }
    this.task.assignedDate = moment().format(this.constantValues.DATEFORMAT);
    this.task.idTaskStatus = 1
    this.task.idAssignedBy = JSON.parse(userId)// userId.toString()//


    if (this.idRfp && this.idRfp != null && this.idrfpContact) {
      this.contactServices.getById(this.idrfpContact).subscribe(r => {
        let contactdetail = r;
        this.contactList = [
          {
            itemName: contactdetail.firstName + ' ' + contactdetail.lastName,
            id: this.idrfpContact
          }
        ]
      })
      this.task.idRfp = this.idRfp
    }
    if (this.idCompany && this.idCompany != null) {
      this.task.idCompany = this.idCompany
    }
    if (this.idContact && this.idContact != null) {
      this.task.idContact = this.idContact
    }
    if ((this.idJob && this.idJob > 0)) {
      this.task.idJob = this.idJob
      // this.getApplicationDD()
      this.scopeDDOptions = [
        {itemName: "Scope Billing", value: 1},
        {itemName: "Other Billable Service", value: 2},
        {itemName: "Non Billable Service", value: 3},
        {itemName: "Scope Time", value: 4}
      ];
      this.task.jobBillingType = null;
      if (this.task.jobBillingType) {
        this.setServiceItemsDD();
      }
      this.getJobDocumentList();
    }

    this.workPermitDDSettings = {
      singleSelection: false,
      text: "Permits",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: true,
      classes: "myclass custom-class",
      disabled: this.isDisabled ? this.isDisabled : false,
      badgeShowLimit: 1,
      tagToBody: false
    };

    this.jobDocumentPermitDDSettings = {
      singleSelection: false,
      text: "Project Documents",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: true,
      classes: "myclass custom-class",
      badgeShowLimit: 1,
      disabled: this.isDisabled ? this.isDisabled : false,
      tagToBody: false
    };
    if (this.isNew) {
      this.loading = false;
    }
  }

  /**
   * This method get Job Document list
   */
  getJobDocumentList() {
    this.loading = true;
    this.jobDocumentServices.getJobDocumentsDDList(this.idJob).subscribe(documents => {
      this.listOfDocuments = documents;
    });
  }

  optionChange(contact: any) {
    if (this.frommodeule == 'JobModule') {
      this.selection = this.contactList.filter((x: any) => x.id == contact)[0];
    }


  }

  /**
   * This method set service items dropdown based on billing type selected
   * @method setServiceItemsDD
   */
  setServiceItemsDD() {
    this.showQtyTextbox = false;
    this.showHoursTextbox = false;
    // this.task.idJobFeeSchedule = null

    if (this.task.jobBillingType) {
      this.requireServiceItem = true;
      if (!this.isEdit) {
        this.task.idRfpJobType = null;
        //     this.task.idJobFeeSchedule = null;
      }
      if (this.task.jobBillingType == 1) {
        let taskId: number = 0
        if (!this.isNew) {
          taskId = this.idTask
        }
        this.taskServices.getFeeScheduleOptions(this.idJob, taskId).subscribe(r => {
          this.jobFeeScheduleItems = r;
          for (let iterator of this.jobFeeScheduleItems) {
            if (iterator) {
              iterator.idJobFeeSchedule = iterator.idJobFeeSchedule != 0 ? iterator.idJobFeeSchedule : iterator.idMilestone;
            }
          }
          this.showServiceQty('feeschedule', this.task.idJobFeeSchedule)
        });
      }
      if (this.task.jobBillingType == 2) {

        this.editOfServiceItems();

      }
    }
  }

  editOfServiceItems(click?: string) {
    if (!click && !this.isNew) {
      if (this.serviceItemId) {
        this.taskServices.getEditAdditionalServices(this.serviceItemId).subscribe(r => {
          this.masterServiceItems = r;
          this.showServiceQty('all')
        });
      } else {
        this.editOfServiceItems('click');
      }


    } else if (click) {
      this.taskServices.getAdditionalServices().subscribe(r => {
        this.masterServiceItems = r;
        this.showServiceQty('all')
      });
    }
  }

  /**
   * This method decide service quantity textbox should display or not based on cost type
   * @method showServiceQty
   * @param {string} flag request data
   */
  showServiceQty(flag: string, idJobFeeSchedule?: number) {
    if (idJobFeeSchedule && this.task.idJobFeeSchedule == null) {
      this.task.idJobFeeSchedule = idJobFeeSchedule
    }
    this.showQtyTextbox = false;
    this.showHoursTextbox = false;
    if (!this.isEdit) {
      this.task.serviceQuantity = 1;
    }
    let matchedItem = [];
    if (flag == 'feeschedule') {
      if (this.jobFeeScheduleItems && this.jobFeeScheduleItems.length > 0) {
        matchedItem = this.jobFeeScheduleItems.filter((x: any) => x.idJobFeeSchedule == this.task.idJobFeeSchedule);
      }
    }
    if (flag == 'all') {
      if (this.masterServiceItems && this.masterServiceItems.length > 0) {
        matchedItem = this.masterServiceItems.filter((x: any) => x.id == this.task.idRfpJobType);
      }
    }

    if (matchedItem && matchedItem.length > 0) {
      let costType = matchedItem[0].costType;
      if (costType == 1) {
        this.showHoursTextbox = false;
        this.showQtyTextbox = false;
        this.task.serviceQuantity = 1
      }
      if (costType == 2 || costType == 3 || costType == 4 || costType == 6) {
        this.showQtyTextbox = true;
        this.showHoursTextbox = false;
      }
      if (costType == 7) {
        this.showHoursTextbox = true;
        this.showQtyTextbox = false;
      }

      // if (typeof idJobFeeSchedule == 'undefined') {
      //   this.task.serviceQuantity =   1;
      // }else{
      this.task.serviceQuantity = this.task.serviceQuantity ? this.task.serviceQuantity : 1;
      // }

    }
  }

  /**
   * This method check that quantity of service item is zero or not
   * @method checkServiceQty
   */
  checkServiceQty() {
    if (this.task.serviceQuantity == '0' || this.task.serviceQuantity == "") {
      this.serviceQtyZero = true;
    } else {
      this.serviceQtyZero = false;
    }
  }

  /**
   * This method is check given data is number or not
   * @method isNumber
   * @param {any} evt request data
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
   * This method is check given data is decimal or not
   * @method isDecimal
   * @param {any} evt request data
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

      if (typeof parts[1] != "undefined" && parts[1].length > 1) { // allow only 2 digit after decimal
        return false;
      }
      return true;
    }
  }

  /**
   * This method gets all contacts for dropdowm list
   * @method getContacts
   */
  getContacts(editTime?: boolean) {
    editTime = editTime ? editTime : false;
    if (this.frommodeule == 'CompanyModule') {
      if (editTime) {
        this.CompanyService.getActiveContactOfComDD(this.idCompany).subscribe(r => {
          this.contactList = _.sortBy(r, function (i: any) {
            return i.itemName.toLowerCase();
          });
        })
      } else {
        this.CompanyService.getContactOfComDD(this.idCompany).subscribe(r => {
          this.contactList = _.sortBy(r, function (i: any) {
            return i.itemName.toLowerCase();
          });
        })
      }

    }
    if (this.frommodeule == 'JobModule') {
      if (editTime) {
        this.JobContactService.getAllJobContactById(this.idJob, editTime).subscribe(r => {
          this.contactList = r.data;

        }, e => {
          this.loading = false
        })
      } else {
        this.JobContactService.getAllJobContactById(this.idJob).subscribe(r => {
          this.contactList = r.data;

        }, e => {
          this.loading = false
        })
      }

    }


  }

  /**
   * This method gets task detail of given task id
   * @method getTaskById
   */
  getTaskById() {
    this.loading = true;
    this.taskServices.getTaskById(this.idTask).subscribe(r => {
      this.task = r
      this.serviceItemId = this.task.idRfpJobType;
      // if(!this.task.idJobFeeSchedule && this.task.idMilestone){
      //   this.task.idJobFeeSchedule = this.task.idMilestone;
      // }
      this.task.documentsToDelete = [];
      this.taskDocuments = r.taskDocuments
      this.isEdit = true
      if (this.task.idTaskStatus == 3) {
        this.isDisabled = true
      }

      // view only task if scope is deleted for this task
      if (this.idJob && this.idJob > 0 && (this.task.isScopeRemoved || this.task.idTaskStatus == 3)) {
        this.isDisabled = true;
        this.workPermitDDSettings = {
          singleSelection: false,
          text: "Permits",
          selectAllText: 'Select All',
          unSelectAllText: 'UnSelect All',
          enableSearchFilter: true,
          enableCheckAll: true,
          classes: "myclass custom-class",
          disabled: this.isDisabled ? this.isDisabled : false,
          badgeShowLimit: 1
        };
      }
      if (typeof this.task.taskDuration != 'undefined' && this.task.taskDuration != null && this.task.taskDuration != '') {
        this.task.taskDuration = this.task.taskDuration.replace(/\./g, ':');

      }
      let adate = this.task.assignedDate.split('T');
      let aformateddate = moment(adate[0]).format(this.constantValues.DATEFORMAT);
      this.task.assignedDate = aformateddate;
      // this.task.assignedDate = moment(this.task.assignedDate).format(this.constantValues.DATEFORMAT);
      this.filteredObj = this.taskType.filter((obj: any) => this.task.idTaskType === obj.id)[0];
      if (this.filteredObj) {
        this.showExaminer = this.filteredObj.isDisplayContact
        this.showDuration = this.filteredObj.isDisplayDuration
        this.showDateTime = this.filteredObj.isDisplayTime;
      }
      if (this.filteredObj.isDisplayTime) {
        let date = this.task.completeBy.split('T');
        let formattime = date[1].split('Z')
        let formattimes = this.taskServices.tConvert(formattime[0]);
        let formateddate = moment(date[0]).format(this.constantValues.DATEFORMAT);
        this.task.completeBy = formateddate + ' ' + formattimes;
        // this.task.completeBy = formateddate+ ' ' +formattime[0]+':'+formattime[1];
        // this.task.completeBy = moment(this.task.completeBy).format(this.constantValues.DATETIMEFORMAT);
      } else {
        let date = this.task.completeBy.split('T');
        let formateddate = moment(date[0]).format(this.constantValues.DATEFORMAT);
        this.task.completeBy = formateddate;
      }
      if (this.task.idJob) {
        this.idJob = this.task.idJob
        if (this.task.idJobType) {
          this.onJobTypeSelectionChange(this.task.idJobType, 'getById')
        }
        this.setServiceItemsDD();


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
      }
      if (this.task.idRfp) {
        this.idRfp = this.task.idRfp
      }
      if (this.task.idJobApplication) {
        let e = {
          id: this.task.idJobApplication
        }
        this.getWorkPermits(e, 'getById')
      }
      this.loading = false
    }, e => {
      this.loading = false
    })
  }

  /**
   * This method gets application data for dropdown list
   * @method getApplicationDD
   * @param {number} ele application id
   */
  getApplicationDD(ele: number) {
    this.application = []
    this.workpermit = []
    this.selectedJobType = ele
    if (ele == 3) {
      this.applicationService.getListOfViolationDropdown(this.idJob).subscribe(r => {
        this.application = r
      }, e => {
      })
    } else {
      this.applicationService.getApplicationsDD(this.idJob, ele).subscribe(r => {
        if (r.length > 0) {
          this.application = _.sortBy(r, function (i: any) {
            return i.jobApplicationTypeName.toLowerCase();
          });
        } else {
          this.loading = false
        }
      }, e => {
        this.loading = false
      })
    }
  }

  /**
   * This method gets work permits from given application id and type
   * @method getWorkPermits
   * @param {any} e application ID
   * @param {string} type request string
   */
  getWorkPermits(e: any, type: string) {
    this.workpermit = []
    if (type != 'getById') {
      this.task.idWorkPermitType = null
    }
    if (e) {
      this.loading = true
      this.applicationService.getAppWorkPermitDD(e.id).subscribe(r => {
        if (r && r.length > 0) {
          this.workpermit = _.sortBy(r, function (i: any) {
            return i.itemName.toLowerCase();
          });
        }
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.loading = false
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
  disabled: boolean;
  exceedFileSize: boolean;

  private dropdownPropagation(event: any) {
    event.stopPropagation();
  }

  /**
   * This method will save task to database
   * @method saveTask
   */
  saveTask() {
    this.task.completeBy = $('#dueDate').val();
    let msg = "Task Created successfully"
    this.loading = true
    if (this.idTask && this.idTask > 0 && !this.isNew) {
      msg = "Task Updated successfully"
      this.newApplication = false
    } else {
      this.newApplication = true
    }
    if (this.task && this.task.idWorkPermitType && this.task.idWorkPermitType.length > 0) {
      let workPermits = cloneDeep(this.task.idWorkPermitType);
      this.task.idWorkPermitType = [];
      for (let i = 0; i < workPermits.length; i++) {
        this.task.idWorkPermitType.push(workPermits[i].id);
      }
    }
    if (!this.showPermitDropDown) {
      _.omit(this.task, 'idJobApplication');
    } else {
      _.omit(this.task, 'idJobViolation');
    }
    if (typeof this.task.taskDuration != 'undefined' && this.task.taskDuration != null && this.task.taskDuration != '') {
      this.task.taskDuration = this.task.taskDuration.replace(/:/g, '.');
    }
    // For Job Documents
    if (this.task && this.task.idJobDocuments && this.task.idJobDocuments.length > 0) {
      let selectedJobDocument = this.task.idJobDocuments;
      this.task.idJobDocuments = [];
      selectedJobDocument.forEach((data: any) => {
        this.task.idJobDocuments.push(data.id);
      });
    }
    this.frommodeule == 'JobModule' ? this.task['ModuleName'] = this.frommodeule : this.task['ModuleName'] = '';
    if (this.frommodeule == 'JobModule' && this.showExaminer && this.selection) {
      this.task.idExaminer = this.selection.idContact;
    }
    if (this.task.idJobFeeSchedule) {
      let matchedItemss = this.jobFeeScheduleItems.filter((x: any) => x.idJobFeeSchedule == this.task.idJobFeeSchedule)[0];
      this.task.isMilestone = matchedItemss.isMilestone;
    }
    this.taskServices.addorEditTask(this.task, this.newApplication).subscribe(r => {
      this.uploadDocumentsinDB(r.id); // Upload attachments
      if (this.isHeader) {
        this.sharedService.getJobTaskFromHeader.emit('taskfromheader');
        this.jobSharedService.isUserLoggedIn.next(true);
      }
      if (!this.isHeader && (this.idJob || this.isSendFromTask)) {
        this.reload()
      }
      this.toastr.success(msg)
      this.modalRef.hide()
      this.loading = false
    }, e => {
      this.loading = false
    })
  }

  /**
   * This method will set data when job type radio button change
   * @method onJobTypeSelectionChange
   * @param {number} jobType jobType ID
   * @param {string} type flag
   */
  onJobTypeSelectionChange(jobType: number, type: string) {
    this.showThedropDownValues = true;
    this.task.idJobType = jobType;
    if (type != 'getById') {
      this.task.idJobApplication = null
      this.task.idJobViolation = null
      this.task.idWorkPermitType = null
    }
    if (jobType == 3) {
      this.showPermitDropDown = false;
    } else {
      this.showPermitDropDown = true;
    }
    if (jobType) {
      this.LabelType = ((jobType == 1 || jobType == 4) ? 'Application' : (jobType == 2) ? 'Location' : 'Summons/Notice#')
      this.getApplicationDD(jobType);
    }
  }

  /**
   * This method will set data when task type is change
   * @method taskTypechange
   * @param {any} ele task type element
   */

  clicked() {
    this.getTaskType();
  }

  taskTypechange(ele: any) {
    this.showExaminer = false
    this.showDuration = false
    this.showDateTime = false;
    if (ele) {
      this.showExaminer = ele.isDisplayContact;
      if (!ele.isDisplayContact) {
        this.task.idExaminer = ''
      } else {
        // this.task.idExaminer = this.contactdata.id;
      }
      this.showDuration = ele.isDisplayDuration;
      this.showDateTime = ele.isDisplayTime
    }

    this.task.taskDuration = null
    if (typeof this.task.completeBy != 'undefined' && this.task.completeBy != '' && (ele && !ele.isDisplayTime)) {
      this.task.completeBy = this.task.completeBy.substring(0, 10)
    } else {
      if (ele == null) {
        this.task.completeBy = '';
      }
    }
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

  /**
   * This method used to reset qty on selection of billable type
   * @method resetQty
   */
  resetQty() {
    this.task.serviceQuantity = 1
    this.task.idRfpJobType = null
    this.task.idJobFeeSchedule = null
  }
}