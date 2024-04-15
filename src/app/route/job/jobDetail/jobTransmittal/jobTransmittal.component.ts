import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, NgZone, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../../../app.component';
import { Message } from '../../../../app.messages';
import { JobServices } from '../../job.services';
import { TaskServices } from '../../../task/task.services'
import { JobSharedService } from '../../JobSharedService';
import { TransmittalServices } from './jobTransmittal.service';
import { UserRightServices } from '../../../../services/userRight.services';
import { constantValues } from '../../../../app.constantValues';
import { SharedService } from '../../../../app.constantValues';

declare const $: any

/**
 * This component contains all function that are used in Job Transmittal
 * @class JobTransmittalComponent
 */
@Component({
  selector: '[job-transmittal]',
  templateUrl: './jobTransmittal.component.html',
  styleUrls: ['./jobTransmittal.component.scss']
})
export class JobTransmittalComponent implements OnInit {

  /**
   * addtransmittal add/edit form
   * @property addtransmittal
   */
  @ViewChild('addtransmittal', {static: true})
  private addtransmittal: TemplateRef<any>

  /**
   * To view specific task
   * @property viewtask
   */
  @ViewChild('viewtask', {static: true})
  private viewtask: TemplateRef<any>

  modalRef: BsModalRef
  private sub: any
  private jobId: number
  idJob: number
  btnShowHide: string = 'show'
  private isNew: boolean = false
  jobDetail: any = []
  private isJobDetail: boolean = false
  private selectedJobType: any = []
  private table: any
  private filter: any
  private specialColumn: any
  idOldTrasmittal: number
  tasknumberofTransmittal: any
  isResend: boolean = false
  isRevise: boolean = false
  loading: boolean = false
  createNewTransmittal: boolean = false
  private errorMsg: any
  idTask: number
  //Company show hide
  showTransmittalAddBtn: string = 'hide'
  private showTransmittalDeleteBtn: string = 'hide'
  private showTransmittalPrintBtn: string = 'hide'
  private showReviseResendBtn: string = 'hide'
  private showTransmittalViewBtn: string
  srch: any;

  constructor(
    private modalService: BsModalService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private zone: NgZone,
    private message: Message,
    private taskServices: TaskServices,
    private jobServices: JobServices,
    private jobSharedService: JobSharedService,
    private transmittalServices: TransmittalServices,
    private appComponent: AppComponent,
    private errorMessage: Message,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private sharedService: SharedService,
  ) {

    this.showTransmittalAddBtn = this.userRight.checkAllowButton(constantValues.ADDTRANSMITTALS)
    this.showTransmittalViewBtn = this.userRight.checkAllowButton(constantValues.VIEWTRANSMITTALS)
    this.showTransmittalDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETETRANSMITTALS)
    this.showTransmittalPrintBtn = this.userRight.checkAllowButton(constantValues.VIEWJOB)
    this.showReviseResendBtn = this.userRight.checkAllowButton(constantValues.ADDTRANSMITTALS)


    this.errorMsg = this.errorMessage.msg
    this.sub = this.route.parent.params.subscribe(params => {
      this.idJob = +params['id']; // (+) converts string 'id' to a number
    });
    //set button visibility on job status change
    this.jobSharedService.getJobData().subscribe((data: any) => {
      this.jobDetail = data
      if (this.jobDetail == null) {
        this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
        if (!this.jobDetail) {
          this.setDataIfJobDetail();
        }
      } else {
        this.setBtnBasedonStatus(this.jobDetail)
      }
    })


    //bind event
    this.reload = this.reload.bind(this)

    this.specialColumn = new $.fn.dataTable.SpecialColumn([
      {
        id: 'EDIT',
        title: 'Edit',
        customClass: 'edittransmittal'
      },
      {
        id: 'RESEND',
        title: 'Resend',
        customClass: 'revisebtn'
      }, {
        id: 'PRINT',
        title: 'Print Transmittal',
        customClass: this.showTransmittalPrintBtn
      }, {
        id: 'CREATE_LABEL',
        title: 'Generate Mailing Label',
        customClass: ""
      },
    ], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }

  /**
   * This method is used to set button based on status
   * @method setBtnBasedonStatus
   * @param {any} jobDetail jobDetail is an object of job
   */
  setBtnBasedonStatus(jobDetail: any) {
    if (this.showTransmittalViewBtn == 'hide') {
      this.toastr.error("You don't have permission to view Job Transmittals", '', {timeOut: 3000});

    }
    this.isJobDetail = true
    if (jobDetail.jobApplicationTypes && jobDetail.jobApplicationTypes.length > 0) {
      this.selectedJobType = jobDetail.jobApplicationTypes[0]
    }
    if (jobDetail.status > 1) {
      this.btnShowHide = 'hide'
      $('.select-column').hide()
    } else {
      this.btnShowHide = 'show'
      $('.select-column').show()
    }
    this.reload()
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    // document.title = 'Jobs'
    document.title = 'Project -' + this.idJob
    this.sharedService.getJobTransmittalFromHeader.subscribe((data: any) => {
      if (data == 'trasmittalFromHeader') {
        this.reload();
      }
    }, (e: any) => {
    })
    this.sharedService.getJobStatus.subscribe((data: any) => {
      if (data == 'statuschanged') {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
          this.setBtnBasedonStatus(this.jobDetail)
        }
      }
    }, (e: any) => {
    })
    const vm = this
    this.filter = {} as any
    this.filter = {
      idJob: this.idJob
    }

    vm.table = $('#dt-transmittal').DataTable({
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
      ajax: this.transmittalServices.get({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      order: [[2, "desc"]],
      columnDefs: [
        {type: 'date-uk', targets: 2} //specify your date column number,starting from 0

      ],
      columns: [
        {
          title: 'Transmittal#',
          data: 'transmittalNumber',
          width: 90,
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.isDraft) {
              return ''
            } else {
              return data
            }
          }
        },
        {
          title: 'Task#',
          data: 'idTask',
          width: 50,
          render: function (data: any, type: any, dataToSet: any) {
            vm.idTask = data;
            if (vm.idTask) {
              return "<a class='taskfor' href='javascript:void(0)' rel='noreferrer'>" + data + " </a>";
            } else {
              return "";
            }
          },
          class: 'clickable',
        },
        {
          title: 'Date',
          data: 'sentDate',
          width: 90
        }, {
          title: 'Type',
          data: 'emailType',
        }, {
          title: 'Recipient',
          data: 'contactAttention',
        }, {
          title: 'Sender',
          data: 'fromEmployee',
          width: 100
        }, {
          title: 'Send Via',
          data: 'transmissionType',
          width: 100
        },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.edit-icon').hide();
        $(row).find('.revise-icon').removeClass('hide');
        $(row).find('.revise-icon').addClass("revisebtn");
        if (data.isDraft && this.showReviseResendBtn == 'show') {
          $(row).find('.revisebtn').addClass("disabled");
        } else if (!data.isDraft && this.showReviseResendBtn == 'show') {
          $(row).find('.revisebtn').removeClass("disabled");
        } else if (this.showReviseResendBtn == 'hide') {
          $(row).find('.revisebtn').addClass("disabled");
        }

        if (this.showTransmittalDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
        $(row).find('.edittransmittal').hide();
        $(row).find('.revisetransmittal').hide();
        if (data.isDraft && vm.showTransmittalAddBtn == 'show') {
          $(row).find('.edittransmittal').show();
        } else {
          $(row).find('.edittransmittal').removeClass(vm.showTransmittalAddBtn);
          $(row).find('.revisetransmittal').show();
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.btnShowHide == "hide") {
          $('.select-column').hide()
        } else {
          $('.select-column').show()
        }
      },
      initComplete: () => {
        $('#dt-transmittal tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.idTask = data.idTask
            if (data.idTask != null) {
              vm.openViewTask(vm.viewtask, data.idTask);
            } else {
              vm.toastr.error('No Task was mapped to this Transmittal.');
            }

          }
        })

        this.specialColumn
          .ngZone(this.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()
            if (actionId == 'EDIT') {
              vm.openCreateTransmittalModal(vm.addtransmittal, "draft", data.id, data);
            }
            if (actionId == 'REVISE') {
              vm.openCreateTransmittalModal(vm.addtransmittal, "revise", data.id, data)
            }
            if (actionId == "RESEND") {
              vm.openCreateTransmittalModal(vm.addtransmittal, "resend", data.id, data)
            }
            if (actionId == "PRINT") {
              this.loading = true;
              this.transmittalServices.printTransmittal(data.id).subscribe(r => {
                this.loading = false;
                window.open(r.value, '_blank');
              }, error => {
                console.log(error)
                this.loading = false;
              })

            }
            if (actionId == "CREATE_LABEL") {
              window.open(this.transmittalServices.createLabel(data.id), '_blank');
            }
            if (actionId == "DELETE") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }

          })

        $('#dt-transmittal tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('disabled')) {
            return
          }
          if ($(this).hasClass('delete-icon')) {
            vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
          }
          if ($(this).hasClass('revise-icon')) {
            vm.openCreateTransmittalModal(vm.addtransmittal, "revise", data.id, data)
          }
        })
      }
    })

    //If your date format is mm/dd//yyyy.
    jQuery.extend($.fn.dataTableExt.oSort, {
      "date-uk-pre": function (a: any) {
        if (a == null || a == "") {
          return 0;
        }
        var ukDatea = a.split('/');
        return (ukDatea[2] + ukDatea[0] + ukDatea[1]) * 1;
      },
      "date-uk-asc": function (a: any, b: any) {
        return ((a < b) ? -1 : ((a > b) ? 1 : 0));
      },
      "date-uk-desc": function (a: any, b: any) {
        return ((a < b) ? 1 : ((a > b) ? -1 : 0));
      }
    });
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

  private openViewTask(template: TemplateRef<any>, idTask: number) {
    this.modalRef = this.modalService.show(template, {class: 'modal-view-task', backdrop: 'static', 'keyboard': false})
  }

  /**
   * This method is used to set job status
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
   * This method is used to open modal popup for create transmittal
   * @method openCreateTransmittalModal
   * @param {any} template type which contains template of create/edit module
   * @param {string} action? action is used as a parameter to resend transmittal or revise transmittal
   * @param {number} id? it is optional which contains id if record is in edit mode
   */
  openCreateTransmittalModal(template: TemplateRef<any>, action?: string, id?: number, taskdata?: any) {

    this.idOldTrasmittal = 0
    this.isResend = false
    this.isRevise = false
    if (action == "resend") {
      this.createNewTransmittal = false;
      this.idOldTrasmittal = id
      this.isResend = true
      if (taskdata.taskNumber != '' && taskdata.taskNumber != '') {
        this.tasknumberofTransmittal = taskdata.taskNumber;
      }
    }
    if (action == "revise") {
      this.createNewTransmittal = false;
      this.idOldTrasmittal = id
      this.isRevise = true
      if (taskdata.taskNumber != '' && taskdata.taskNumber != '') {
        this.tasknumberofTransmittal = taskdata.taskNumber;
      }
    }
    if (action == "draft") {
      this.createNewTransmittal = false;
      this.idOldTrasmittal = id
      if (taskdata.taskNumber != '' && taskdata.taskNumber != '') {
        this.tasknumberofTransmittal = taskdata.taskNumber;
      }
    }
    if (action == 'fromList') {
      this.createNewTransmittal = true;
    }

    this.modalRef = this.modalService.show(template, {
      class: 'modal-add-transmittal',
      backdrop: 'static',
      'keyboard': false
    })
  }

  /**
   * This method is used to change the selected application type
   * @method onSelectionChange
   * @param {any} entry entry is an selected job type
   */
  private onSelectionChange(entry: any) {
    this.selectedJobType = entry;
  }

  /**
   * This method is used to avoid from closing dropdown
   * @method dropdownPropagation
   * @param {any} event event of an input element
   */
  private dropdownPropagation(event: any) {
    event.stopPropagation();
  }

  /**
   * This method is used to reload datatable
   * @method reload
   */
  reload() {
    if (this.table) {
      this.table.clearPipeline()
      this.table.ajax.reload()
    }
  }

  /**
   * This method is used for filter/search records from datatable
   * @method search
   * @param {string} srch type any which contains string that can be filtered from datatable
   */
  search(srch: string) {
    this.table.search(srch).draw()
  }

  /**
   * This method is used to delete record
   * @method delete
   * @param {number} id type which contains id to delete record
   * @param {any} row type which contains entire selected row
   */
  delete(id: number, row: any) {
    return new Promise((resolve, reject) => {
      this.transmittalServices.delete(id).subscribe(r => {
        row.delete()
        resolve(r)
      }, e => {
        reject()
      })
    })
  }

}