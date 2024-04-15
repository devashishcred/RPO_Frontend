import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, ElementRef, NgZone, TemplateRef, ViewChild, OnInit, Inject } from '@angular/core';
import { cloneDeep, identity, pickBy, assign } from 'lodash';
import { AppComponent } from '../../../../app.component';
import { JobContact } from '../../../../types/jobContact'
import { JobContactServices } from './JobContact.service';
import { JobServices } from '../../job.services';
import { BasicInfoComponent } from '../basicInfo/basicInfo.component';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'underscore';
import { JobSharedService } from '../../JobSharedService';
import { Router } from '@angular/router';
import { UserRightServices } from '../../../../services/userRight.services';
import { JobDetailComponent } from '../jobDetail.component';

import { constantValues, SharedService } from '../../../../app.constantValues';
import { LocalStorageService } from '../../../../services/local-storage.service';

declare const $: any
/**
* This component contains all function that are used in JobContactComponent
* @class JobContactComponent
*/
@Component({
  selector: '[job-contact]',
  templateUrl: './jobContact.component.html',
  styleUrls: ['./jobContact.component.scss']
})
export class JobContactComponent implements OnInit {
  /**
   * Add Job Contact Form
   * @property addJobContact
   */
  @ViewChild('addJobContact', { static: true })
  private addJobContact: TemplateRef<any>

  /**
   * Manage Group Form
   * @property manageGroup
   */
  @ViewChild('addGroup', { static: true })
  private addGroup: TemplateRef<any>


  @ViewChild('editJobContact', { static: true })
  private editJobContact: TemplateRef<any>

  /**
   * Add Task Form
   * @property addtask
   */
  @ViewChild('addtask', { static: true })
  private addtask: TemplateRef<any>

  private id: number

  private filter: any = {}
  private table: any

  modalRef: BsModalRef
  private recJobContact: JobContact
  private sub: any
  idJob: number
  idJobContact: number
  frommodeule: string
  private JobContact: any
  private isJobContact: boolean = true
  private selectedJobType: any = []
  jobDetail: any = []
  showBtnStatus: string = "hide";
  private taskbtn: string = "task-btn";
  private specialColumn: any
  private actionRow: any
  rec: JobContact
  isNew: boolean = false
  public data: any = []
  isCustomerLoggedIn: boolean = false;
  isCustomerAllowToSendEmail: boolean = false;
  srch: string;
  jobId: number;

  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(
    private zone: NgZone,
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private JobContactService: JobContactServices,
    private route: ActivatedRoute,
    private jobServices: JobServices,
    private jobSharedService: JobSharedService,
    private sharedService: SharedService,
    private router: Router,
    private jobDetailComponent: JobDetailComponent,
    private constantValues: constantValues,
    private userRight: UserRightServices,
    private localStorageService: LocalStorageService
  ) {
    this.sub = this.route.parent.params.subscribe(params => {
      this.idJob = +params['id']; // (+) converts string 'id' to a number
    });
    //set button visibility on job status change
    // this.jobSharedService.getJobData().subscribe((data: any) => {
    //   this.jobDetail = data
    //   this.setDataIfJobDetail();
    //   this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
    //   console.log('this.jobDetail', this.jobDetail)
    //   if (this.jobDetail != null) {
    //     this.setBtnBasedonStatus(this.jobDetail)
    //   }
    // })
    this.setDataIfJobDetail();
    this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
    this.sharedService.getJobStatus.subscribe((data: any) => {
      if (data == 'statuschanged') {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
          this.setBtnBasedonStatus(this.jobDetail)
        }
      }
    }, (e: any) => { })

    //special column description
    this.specialColumn = new $.fn.dataTable.SpecialColumn([
      //   {
      //   id: 'EDIT_JOB_CONTACT',
      //   title: 'Edit Contact',
      //   customClass: '',
      //   visibility: this.showBtnStatus
      // }, 
      {
        id: 'CREATE_TASK',
        title: 'Create Task',
        customClass: this.taskbtn,
        visibility: this.showBtnStatus
      },
      // {
      //   id: 'DELETE_CONTACT',
      //   title: 'Remove Contact',
      //   customClass: '',
      //   visibility: this.showBtnStatus
      // }
    ], false)
    //bind event
    this.reload = this.reload.bind(this)
    this.loadagain = this.loadagain.bind(this)
    this.delete = this.delete.bind(this)
 
  }

  /**
   * This method set button based on job status
   * @method setBtnBasedonStatus
   * @param {any} jobDetail Job object 
   */
  setBtnBasedonStatus(jobDetail: any) {
    if (jobDetail.status > 1) {
      this.showBtnStatus = 'hide'
      $('.select-column').hide()
    } else {
      this.showBtnStatus = 'show'
      $('.select-column').show()
    }
    this.reload()
  }



  /**
    * This method will be called once only when module is call for first time
    * @method ngOnInit
  */
  ngOnInit() {
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
    this.isCustomerAllowToSendEmail = this.userRight.checkAllowButton(this.constantValues.VIEWSENDEMAILCONTACT) == 'hide' ? false : true;
    document.title = 'Project -' + this.idJob;
    this.frommodeule = 'JobModule';
    this.showBtnStatus = this.userRight.checkAllowButton(this.constantValues.ADDJOB);
    if (this.showBtnStatus == 'show' && !this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
      // this.setBtnBasedonStatus(this.jobDetail)
      this.setDataIfJobDetail();

    } else if (this.showBtnStatus == 'show' && this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
      this.setBtnBasedonStatus(this.jobDetail)
    }
    this.sub = this.route.parent.params.subscribe(params => {
      this.idJob = +params['id']; // (+) converts string 'id' to a number
    });

    const vm = this
    //table structure
    this.table = $('#dt-Jobcontact').DataTable({
      paging: true,
      dom: "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-12 col-md-2'l><'col-sm-12 col-md-3'i><'col-sm-12 col-md-7'p>>",
      pageLength: 25,
      "bFilter": true,
      lengthChange: true,
      lengthMenu: [25, 50, 75, 100],
      language: {
        oPaginate: {
          sNext: `<span class="material-symbols-outlined">arrow_forward</span>`,
          sPrevious: `<span class="material-symbols-outlined">
            arrow_back
            </span>`,
        },
        lengthMenu: 'Rows per page _MENU_',
        infoFiltered: ""
      },
      "aaSorting": [],
      ajax: this.isCustomerLoggedIn ? this.JobContactService.get(this.idJob, true) : this.JobContactService.get(this.idJob),
      columns: [
        {
          title: 'Hide Contact',
          data: 'isHidden',
          visible: !this.isCustomerLoggedIn ? true : false,
          // render: function (data: any) {
          //   return `<input type="checkbox" [checked]="${data}">`
          // },
          // render: function (data: any, type: any, dataToSet: any) {
          //   if (dataToSet.isMainCompany && dataToSet.isBilling && !dataToSet.isActive) {
          //     return `<div class="work-permit-status green"></div><div class="work-permit-status grey"></div>` +"<label class='form-check-label input-inline'> <input type='checkbox' class='form-check-input' name=" + dataToSet.id + "" + "value=" + data + " /><i class='input-helper'></i></label>";
          //     // return "<span class='status red'> </span> <span class='status green'> </span> <span class='status nb-grey'> </span>" + data;
          //   } else if (dataToSet.isMainCompany && !dataToSet.isActive) {
          //     return `<div class="work-permit-status grey"></div>` +"<label class='form-check-label input-inline'> <input type='checkbox' class='form-check-input' name=" + dataToSet.id + "" + "value=" + data + " /><i class='input-helper'></i></label>";
          //   } else if (dataToSet.isBilling && dataToSet.isMainCompany && dataToSet.isActive) {
          //     return `<div class="work-permit-status green"></div>`  +"<label class='form-check-label input-inline'> <input type='checkbox' class='form-check-input' name=" + dataToSet.id + "" + "value=" + data + " /><i class='input-helper'></i></label>";
          //   }
          //   else {
          //     return "<label class='form-check-label input-inline'> <input type='checkbox' class='form-check-input' name=" + dataToSet.id + "" + "value=" + data + " /><i class='input-helper'></i></label>";
          //   }
          // },
          render: function (data: any, type: any, dataToSet: any) {
            let isChecked = data === true; // Assuming data is a boolean value

            if (dataToSet.isMainCompany && dataToSet.isBilling && !dataToSet.isActive) {
              return `<div class="work-permit-status green"></div><div class="work-permit-status grey"></div>` +
                `<div class="checkbox form-check"><label class='form-check-label input-inline'> <input type='checkbox' class='form-check-input' name="${dataToSet.id}" value="${data}" ${isChecked ? 'checked' : ''} /><i class='input-helper'></i></label></div>`;
            } else if (dataToSet.isMainCompany && !dataToSet.isActive) {
              return `<div class="work-permit-status grey"></div>` +
                `<div class="checkbox form-check"><label class='form-check-label input-inline'> <input type='checkbox' class='form-check-input' name="${dataToSet.id}" value="${data}" ${isChecked ? 'checked' : ''} /><i class='input-helper'></i></label></div>`;
            } else if (dataToSet.isBilling && dataToSet.isMainCompany && dataToSet.isActive) {
              return `<div class="work-permit-status green"></div>` +
                `<div class="checkbox form-check"><label class='form-check-label input-inline'> <input type='checkbox' class='form-check-input' name="${dataToSet.id}" value="${data}" ${isChecked ? 'checked' : ''} /><i class='input-helper'></i></label></div>`;
            } else {
              return `<div class="checkbox form-check"><label class='form-check-label input-inline'> <input type='checkbox' class='form-check-input' name="${dataToSet.id}" value="${data}" ${isChecked ? 'checked' : ''} /><i class='input-helper'></i></label></div>`;
            }
          },
          createdCell: function (td, cellData, rowData, row, col) {
            console.log('rowData', rowData)
            if (rowData.isMainCompany && rowData.isBilling && !rowData.isActive) {
              $(td).addClass('red-status-border');
            } else if (rowData.isMainCompany && !rowData.isActive) {
              $(td).addClass('red-status-border');
            } else if (rowData.isBilling && rowData.isMainCompany && rowData.isActive) {
              $(td).addClass('red-status-border');
            } else if (rowData.isBilling && rowData.isActive) {
              $(td).addClass('green-status-border');
            } else if (rowData.isMainCompany && rowData.isActive) {
              $(td).addClass('red-status-border');
            } else if (rowData.isMainCompany && !rowData.isBilling && !rowData.isActive) {
              $(td).addClass('grey-status-border');
            } else if (!rowData.isMainCompany && !rowData.isBilling && !rowData.isActive) {
              $(td).addClass('grey-status-border');
            }
          },
        },
        {
          title: 'CONTACT TYPE',
          data: 'jobcontactType',
          class: 'clickable custom-status-bar',
          // render: function (data: any, type: any, dataToSet: any) {
          //   if (dataToSet.isMainCompany && dataToSet.isBilling && !dataToSet.isActive) {
          //     return `<div class="work-permit-status green"></div><div class="work-permit-status grey"></div>` + data;
          //     // return "<span class='status red'> </span> <span class='status green'> </span> <span class='status nb-grey'> </span>" + data;
          //   } else if (dataToSet.isMainCompany && !dataToSet.isActive) {
          //     return `<div class="work-permit-status grey"></div>` + data;
          //   } else if (dataToSet.isBilling && dataToSet.isMainCompany && dataToSet.isActive ) {
          //     return `<div class="work-permit-status green"></div>` + data;
          //   } 
          //   else {
          //     return data
          //   }
          // },
          // createdCell: function (td, cellData, rowData, row, col) {
          //   console.log('rowData',rowData)
          //   if(rowData.isMainCompany && rowData.isBilling && !rowData.isActive) {
          //     $(td).addClass('red-status-border');
          //   } else if (rowData.isMainCompany && !rowData.isActive) {
          //     $(td).addClass('red-status-border');
          //   } else if (rowData.isBilling && rowData.isMainCompany && rowData.isActive ) {
          //     $(td).addClass('red-status-border');
          //   } else if (rowData.isBilling && rowData.isActive) {
          //     $(td).addClass('green-status-border');
          //   } else if (rowData.isMainCompany && rowData.isActive) {
          //     $(td).addClass('red-status-border');
          //   } else if(rowData.isMainCompany &&!rowData.isBilling && !rowData.isActive){
          //     $(td).addClass('grey-status-border');
          //   } else if(!rowData.isMainCompany &&!rowData.isBilling && !rowData.isActive){
          //     $(td).addClass('grey-status-border');
          //   } 
          //  },
          visible: !this.isCustomerLoggedIn ? true : false,
        },
        {
          title: 'CONTACT',
          data: 'contactName',
          class: 'clickable',
          // width: 100
        },
        {
          title: 'COMPANY',
          data: 'companyName',
          class: 'clickable',
        },
        {
          title: 'ADDRESS',
          data: 'address',
          class: 'clickable',
        },
        {
          title: 'Group Name',
          data: 'groupName',
          class: 'clickable',
          visible: !this.isCustomerLoggedIn ? true : false,
        },
        {
          title: 'WORK PHONE',
          data: 'workphone',
          class: 'clickable',
          width: 150,
          render: function (data: any, type: any, dataToSet: any) {
            let phn: any[] = [];

            for (let key in dataToSet) {
              if (dataToSet[key] === null) {
                dataToSet[key] = '';
              }
              if ((key == 'workPhone' || key == 'ext') && dataToSet[key] != "") {
                phn.push(dataToSet[key]);
              }
            }
            if (phn.length > 0) {
              return phn.join(' + ');
            } else {
              return '';
            }
          }
        },
        {
          title: 'Cell phone',
          data: 'mobilePhone',
          class: 'clickable',
          width: 150,
          // render: function (data: any, type: any, dataToSet: any) {
          //   return '123';
          // }
        },
        {
          title: 'Project Access',
          data: 'isAuthorized',
          class: 'clickable',
          visible: !this.isCustomerLoggedIn ? true : false,
          // render: function (data: any, type: any, dataToSet: any) {
          //   return 'UnAuthorize';
          // }
        },
        {
          title: 'Email Address',
          data: null,
          class: 'text-left' + this.isCustomerLoggedIn ? ' maxWidth-300 text-left' : '',
          render: function (data, type, full, meta) {
            let nycUrl = null;
            if (vm.isCustomerLoggedIn && !vm.isCustomerAllowToSendEmail) {
              return data.email
            } else {
              return '<a href=mailto:' + data.email + ' data-placement="center"  title="mail address">' + data.email + '</a>';
            }
          },
          // visible: this.isCustomerLoggedIn ? true : false,
        },
        !this.isCustomerLoggedIn ? this.specialColumn : {
          title: 'Action',
          data: 'mobilePhone',
          visible: false
        }
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        if (this.isCustomerLoggedIn) {
          $(row).find('.edit-icon').hide();
          $(row).find('.delete-icon').hide();
          $(row).find('.more_vert').hide();
        }
        else {
          $(row).find('.edit-icon').addClass("isButton");
          $(row).find('.delete-icon').addClass("isButton");
        }
        if (!data.isActive) {
          $(row).find('.task-btn').hide();
          $(row).find('.more_vert').addClass("disabled");
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.showBtnStatus == "hide") {
          $('.select-column').hide()
        } else {
          $('.select-column').show()
        }
      },
      initComplete: () => {
        $('#dt-Jobcontact tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable') && !vm.isCustomerLoggedIn) {
            this.idJobContact = data.id;
            vm.onOpenContactDetail(data)
          }
        })

        $("#dt-Jobcontact tbody").on("click", "input", function (e: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          console.log(data)
          vm.hideUnHideContact(data.id, !data.isHidden)
        });

        this.specialColumn
          .ngZone(this.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            this.actionRow = row
            const data = row.data()
            if (actionId == 'EDIT_JOB_CONTACT') {
              vm.idJobContact = data.id;
              vm.isNew = false
              // vm.openEditModal(vm.editJobContact, data.id)
              vm.openModalAddJobContact(vm.addJobContact, data.id, data.idJob)
            } else if (actionId == 'CREATE_TASK') {
              vm.isNew = true
              vm.openModalForm(vm.addtask)
            } else if (actionId == 'DELETE_CONTACT') {
              vm.appComponent.showDeleteConfirmation(vm.delete, [vm.idJob, data.id, row, 'JOB_CONTACT'])
            }
          })
      }
    })

    $('#dt-Jobcontact').on('draw.dt', () => {
      $('[data-toggle="tooltip"]').tooltip()
    })

    $('#dt-Jobcontact tbody').on('click', 'span', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      if ($(this).hasClass('delete-icon')) {
        vm.appComponent.showDeleteConfirmation(vm.delete, [vm.idJob, data.id, row, 'JOB_CONTACT'])
      }
      if ($(this).hasClass('edit-icon')) {
        vm.idJobContact = data.id;
        vm.isNew = false
        vm.openModalAddJobContact(vm.addJobContact, data.id, data.idJob)
      }
    })

  }

  /**
 * This method set job detail
 * @method setDataIfJobDetail
 */
  setDataIfJobDetail() {
    this.jobServices.getJobDetailById(this.idJob, true).subscribe(r => {
      this.jobDetail = r
      this.jobSharedService.setJobData(r);
      this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, r)
      this.setBtnBasedonStatus(this.jobDetail)
    })
  }
  /**
   * This method get job status
   * @method getJobStatus
   */
  private getJobStatus(): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.jobSharedService.getJobData().subscribe((data: any) => {
        this.jobDetail = data;
        this.idJob = this.jobDetail.id;
        resolve(null)
      }, e => {
        reject()
      })
    })
  }

  /**
   * This method open job detail page
   * @method onOpenJobDetail
   * @param {any} data Job Object 
   */
  private onOpenJobDetail(data: any) {
    this.router.navigate(['/job/' + data.id + '/application']).then(result => { window.location.reload(); });
  }

  /**
   * This method open contact detail page
   * @method onOpenContactDetail
   * @param {any} obj Contact Object 
   */
  private onOpenContactDetail(obj: any) {

    this.router.navigate(['/contactdetail', obj.idContact])
  }

  /**
   * This method call when selection change
   * @method onSelectionChange
   * @param {any} entry JobType Entry 
   */
  private onSelectionChange(entry: any) {
    this.selectedJobType = entry;
  }
  private dropdownPropagation(event: any) {
    event.stopPropagation();
  }

  /**
   * This method open add job contact method
   * @method _openModalAddJobContact
   * @param {any} template TemplateRef Object 
   */
  private _openModalAddJobContact(template: TemplateRef<any>) {
    this.idJob = this.idJob;
    this.modalRef = this.modalService.show(template, { class: 'modal-add-job-contact', backdrop: 'static', 'keyboard': false })
  }

  /**
   * This method open add job contact method
   * @method openModalAddJobContact
   * @param {any} template TemplateRef Object
   * @param {number} id? ID
   */
  openModalAddJobContact(template: TemplateRef<any>, id?: number, jobID?: number) {
    if (jobID) {
      this.idJob = jobID;
    }
    this.isNew = true
    if (id) {
      this.isNew = false
      this.idJobContact = id
    }
    this._openModalAddJobContact(template)
  }

  /**
     * This method open popup for manage group
     * @method openModalManageGroup
     * @param {any} template TemplateRef Object
     * @param {number} id? ID
     */
  openModalManageGroup(template: TemplateRef<any>, id?: number) {
    this.isNew = true
    if (id) {
      this.isNew = false
    }
    this.modalRef = this.modalService.show(template, {
      class: 'modal-add-job-contact',
      backdrop: 'static',
      'keyboard': false
    })
  }

  /**
   * This method open edit job contact method
   * @method openEditModal
   * @param {any} template TemplateRef Object
   * @param {number} id ID 
   */
  private openEditModal(template: TemplateRef<any>, id?: number) {
    this.JobContactService.getById(this.idJob, id).subscribe(r => {
      this.rec = r as JobContact
      this._openEditModal(template)
    })
  }

  /**
   * This method open edit job contact method
   * @method _openEditModal
   * @param {any} template TemplateRef Object
   */
  private _openEditModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-edit-job-contact modal-contact', backdrop: 'static', 'keyboard': false })
  }

  /**
   * This method will delete job contact 
   * @param {number} idJob ID of Job 
   * @param {number} id Id of Job Contact 
   * @param {any} row selected job contact 
   */
  private delete(idJob: number, id: number, row: any): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.JobContactService.delete(idJob, id).subscribe(r => {
        row.delete()
        this.reload()
        resolve(null)
      }, e => {
        reject()
      })
    })
  }

  /**
   * This method will reload data table
   * @method reload
   */
  reload() {
    if (this.table) {
      this.table.clearPipeline()
      this.table.ajax.reload()
    }
  }

  loadagain() {
    this.jobSharedService.toggleClient();
  }

  /**
   * This method search in datatable
   * @method search
   * @param {string} srch Search criteria 
   */
  search(srch: string) {
    this.table.search(srch).draw()
  }

  /**
   * This method open add task popup
   * @method openModalForm
   * @param {any} template TemplateRef Object 
   * @param {number} id If of Job Contact 
   */
  openModalForm(template: TemplateRef<any>, id?: number) {
    this.isNew = false
    if (!id) {
      this.isNew = true
    }
    this.modalRef = this.modalService.show(template, { class: 'modal-add-task', backdrop: 'static', 'keyboard': false })
  }

  async hideUnHideContact(idJobContact, ishiddenFromCustomer: boolean) {
    try {
      const res = await this.jobServices.hideUnHideContact(idJobContact, ishiddenFromCustomer)
      this.reload()
    } catch (err) {
      this.toastr.error(err)
    }
  }
}