import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, NgZone, EventEmitter, Input, ViewChild, OnInit, Output, TemplateRef } from '@angular/core';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../../../app.component';
import { Message } from '../../../../app.messages';
import { JobServices } from '../../job.services';
import { TaskServices } from '../../../task/task.services'
import { JobSharedService } from '../../JobSharedService';
import { UserRightServices } from '../../../../services/userRight.services';
import { constantValues, SharedService } from '../../../../app.constantValues';
import { EmployeeServices } from '../../../employee/employee.services'
import * as _ from 'underscore';

declare const $: any

/**
* This component contains all function that are used in Job Task 
* @class JobTaskComponent
*/
@Component({
  selector: '[job-task]',
  templateUrl: './jobTask.component.html',
  styleUrls: ['./jobTask.component.scss']
})

export class JobTaskComponent implements OnInit {
  /**
  * addtask add/edit form
  * @property addtask
  */
  @ViewChild('addtask',{static: true})
  private addtask: TemplateRef<any>

  /**
  * progressionnote add/edit form
  * @property progressionnote
  */
  @ViewChild('progressionnote',{static: true})
  progressionNote: TemplateRef<any>

  /**
  * reminder add/edit form
  * @property reminder
  */
  @ViewChild('reminder',{static: true})
  private reminder: TemplateRef<any>

  /**
  * viewtask view form
  * @property viewtask
  */
  @ViewChild('viewtask',{static: true})
  private viewtask: TemplateRef<any>

  /**
  * addtransmittal add/edit form
  * @property addtransmittal
  */
  @ViewChild('addtransmittal',{static: true})
  private addtransmittal: TemplateRef<any>

  modalRef: BsModalRef
  private sub: any
  jobId: number
  private table: any
  private specialColumn: any
  private errorMessage: any
  private filter: any
  idTask: number
  idTaskType: number
  btnShowHide: string = 'show'
  isNew: boolean = false
  private disableeditCompletedTask: boolean = false
  jobDetail: any = []
  private isJobDetail: boolean = false
  private selectedJobType: any = []
  showTaskAddBtn: string = 'hide'
  private editCompletedTask: string = 'hide'
  private showTaskDeleteBtn: string = 'hide'
  private showTransmittalAddBtn: string = 'hide'
  private JobAddBtn: string = 'hide'
  private errorMsg: any
  private taskStatusArr: any
  private employeesArr: any
  frommodeule: string
  loading: boolean;
  srch: boolean;
  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private zone: NgZone,
    private appComponent: AppComponent,
    private toastr: ToastrService,
    private message: Message,
    private taskServices: TaskServices,
    private jobServices: JobServices,
    private jobSharedService: JobSharedService,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private sharedService: SharedService,
    private employeeServices: EmployeeServices,

  ) {
    this.errorMsg = this.message.msg
    this.JobAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOB)
    this.showTaskAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDJOBTASKS)
    this.editCompletedTask = this.userRight.checkAllowButton(this.constantValues.EDITCOMPLETEDJOBTASKS)
    this.showTaskDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEJOBTASKS)
    this.showTransmittalAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDTRANSMITTALS)
    this.errorMessage = this.message.msg;
    this.sub = this.route.parent.params.subscribe(params => {
      this.jobId = +params['id']; // (+) converts string 'id' to a number
    });
    this.sharedService.getJobStatus.subscribe((data: any) => {
      if (data == 'statuschanged') {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
          this.setBtnBasedonStatus(this.jobDetail)

        }
      }
    }, (e: any) => { })
    //set button visibility on job status change
    this.jobSharedService.getJobData().subscribe((data: any) => {
      this.jobDetail = data
      if (this.jobDetail == null) {
        this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
      } else {
        this.setBtnBasedonStatus(this.jobDetail)
      }
    })

    this.specialColumn = new $.fn.dataTable.SpecialColumn([
    {
      id: 'SET_REMINDER',
      title: 'Task Reminder',
      customClass: 'setremainder'
    }, 
    {
      id: 'DELETE_TASK',
      title: 'Delete Task',
      customClass: this.showTaskDeleteBtn 
    }, 
    {
      id: 'SEND_EMAIL',
      title: 'Send Transmittal',
      customClass: 'sendEmail' + ' ' + this.showTransmittalAddBtn
    }], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)


  }





  /**
    * This method is used to set button for violation module
    * @method setBtnBasedonStatus
    * @param {any} jobDetail jobDetail is an object of Job
    */
  setBtnBasedonStatus(jobDetail: any) {
    this.isJobDetail = true
    if (jobDetail.status > 1) {
      this.btnShowHide = 'hide';
      $('.select-column').hide()
      $('#dt-task > tbody > tr').each(function (row: any) {
        $(this).find('td select').each(function () {
          $(this).attr("disabled", "disabled")
        })
        $(this).find('td input').each(function () {
          $(this).attr("disabled", "disabled")
        })
      });
    } else {
      this.btnShowHide = 'show';
      $('.select-column').show();
      $('#dt-task > tbody > tr').each(function (row: any) {
        $(this).find('td select').each(function () {
          $(this).removeAttr("disabled", "disabled")
        })
        $(this).find('td input').each(function () {
          $(this).removeAttr("disabled", "disabled")
        })
      });
    }
    this.reload();
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    // document.title = 'Jobs'
    document.title = 'Project -' + this.jobId
    this.sharedService.getJobTaskFromHeader.subscribe((data: any) => {
      if (data == 'taskfromheader') {
        this.reload()
      }
    }, (e: any) => { })

    this.taskServices.getTaskStatus().subscribe(r => {
      this.taskStatusArr = _.sortBy(r, function (i: any) { return i.name.toLowerCase(); });
    }, e => {
    })
    this.employeeServices.getEmpDropdown().subscribe(r => {
      this.employeesArr = _.sortBy(r, function (r: any) { return r.employeeName.toLowerCase(); });
    }, e => {
    })
    const vm = this
    this.filter = {} as any
    this.filter = {
      idJob: this.jobId
    }

    if (this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE)) {
      this.selectedJobType = this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE);
      this.filter.idJobApplicationType = this.selectedJobType;
      if (this.jobDetail == null || this.jobDetail == 'undefined') {
        this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
      } else if (this.jobDetail != null) {
        this.setBtnBasedonStatus(this.jobDetail)
      }
    }
    $.fn.dataTableExt.ofnSearch['select'] = function (value: any) {
      return $(value).val();
    };

    vm.table = $('#dt-task').DataTable({
      paging: true,
      dom: "<'row'<'col-sm-12'tr>>" +"<'row'<'col-sm-12 col-md-2'l><'col-sm-12 col-md-3'i><'col-sm-12 col-md-7'p>>",
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
      ajax: this.taskServices.getJobTasks({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      "aaSorting": [],
      columnDefs: [
        { "type": "select", "targets": [2, 9] },
        { type: 'date-uk', targets: [1] }, //specify your date column number,starting from 0        

      ],

      columns: [
        {
          title: 'Task #',
          data: 'id',
          class: 'clickable',
          width: 84,
          createdCell: function (td, cellData, rowData, row, col) {
            console.log(`${rowData.badgeClass}-status-border`)
            $(td).addClass(`${rowData.badgeClass}-status-border`);
           },
        },
        {
          title: 'Due Date',
          data: 'completeBy',
          class: 'badgeClass',
          type: 'datepicker',
          width: 106,
          render: function (data: any, type: any, dataToSet: any) {
            return '<div datetime-picker class="inner-addon right-addon input-group"><i class="icon material-symbols-outlined clickable datepickerbutton">event</i><input style="padding-left: 5px;" type="text" class="mydatepicker form-control" data-id=' + dataToSet.id + '  data-assignedDate=' + dataToSet.assignedDate + ' placeholder="Due date" value=' + (dataToSet.completeBy != null ? dataToSet.completeBy : '') + '>' + '</div>'
          }
        },
        {
          title: 'Assigned To',
          data: 'assignedTo',
          class: '',
          width: 130,
          type: 'select',
          render: function (data: any, type: any, dataToSet: any) {
            if(dataToSet.taskStatus == 'Completed' || dataToSet.taskStatus ==  'Unattainable')
            {
              let label = "<label class= 'clickable' data-taskId=" + dataToSet.id + ">" + dataToSet.assignedTo + "</label>"
              return label;
            }
            else if(dataToSet.assignedTo && (dataToSet.taskStatus != 'Completed' && dataToSet.taskStatus != 'Unattainable')) {
              let options = "<select class='form-control' id='AssigneForTask' data-taskId=" + dataToSet.id + " >"
              for (let i = 0; i <= vm.employeesArr?.length - 1; i++) {
                options = options + "<option irr=" + vm.employeesArr[i].id + " value=" + vm.employeesArr[i].employeeName + "  " + (dataToSet.assignedTo.toLowerCase() === vm.employeesArr[i].employeeName.toLowerCase() ? 'selected' : '') + " >" + vm.employeesArr[i].employeeName + "</option>"
              }
              options += "</select>";
              return options;
            }
          }
        }, {
          title: 'Task Type',
          data: 'taskType',
          class: 'clickable',
          width: 116
        }, {
          title: 'Task details',
          data: 'generalNotes',
          class: 'clickable  min-width-350',
          // width: 140
        }, {
          title: 'A#/LOC/V#',
          width: 120,
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.jobApplication) {

              if (dataToSet.jobApplication.search('A#') != -1) {
                let bisRef = dataToSet.jobApplication.replace('A# : ', '');
                return "<a href='https://a810-bisweb.nyc.gov/bisweb/JobsQueryByNumberServlet?passjobnumber=" + bisRef + "' target='_blank'>" + dataToSet.jobApplication + "</a>";
              }
              if (dataToSet.jobApplication.search('V#') != -1) {
                let bisRef = dataToSet.jobApplication.replace('V# : ', '');
                return "<a href='http://a820-ecbticketfinder.nyc.gov/getViolationbyID.action?searchViolationObject.violationNo=0" + bisRef + "&searchViolationObject.searchOptions=All&submit=Search&searchViolationObject.searchType=violationNumber' target='_blank'>" + dataToSet.jobApplication + "</a>";
              }
              return dataToSet.jobApplication

            } else {
              return ''
            }

          },
        },
        {
          title: 'Recent Note',
          class: 'clickable min-width-350',
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.progressNote) {
              return " <div> " + dataToSet.progressNote + "<br>" + "<span class='modify'> " + dataToSet.notesDateStamp + " " + dataToSet.notesTimeStamp + " </span> </div>";
            } else {
              return ''
            }

          },
        },
        {
          title: 'Assigned By',
          data: 'assignedBy',
          class: 'clickable',
          width: 130
        },
        {
          title: 'Status',
          data: 'taskStatus',
          class: 'statustask',
          type: 'select',
          width: 100,
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.taskStatus) {
              let Status = dataToSet.taskStatus.toLowerCase();
              let options = "<select class='form-control statustaskk' id='statusForTask' data-taskId=" + dataToSet.id + " >"
              for (let i = 0; i <= vm.taskStatusArr.length - 1; i++) {
                options = options + "<option value=" + vm.taskStatusArr[i].name + "  " + (Status === vm.taskStatusArr[i].name.toLowerCase() ? 'selected' : '') + " >" + vm.taskStatusArr[i].name + "</option>"
              }
              options += "</select>";
              return options;
            }
          },
        },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        // check Job task permission
        $(row).find('.note-icon').removeClass('hide');
        $(row).find('.note-icon').addClass("addprogression");
        $(row).find('.edit-icon').addClass("edittask");
        $(row).find('.delete-icon').hide();
        if (vm.showTaskDeleteBtn == 'hide') {
          $(row).find('.delete-icon').hide();
          $(row).find('.addprogression').addClass("disabled");
        }
        if (vm.showTaskAddBtn != 'hide') {
          $(row).find('.addprogression').removeClass("disabled");
          if (data.taskFor.startsWith("Job#") && this.editCompletedTask === 'hide' && data.taskStatus === 'Completed') {
            $(row).find('.edittask').addClass("disabled");
            $(row).find('td select').attr("disabled", true);
            $(row).find('.mydatepicker').attr("disabled", true);
          } else {
            $(row).find('.edittask').removeClass("disabled");
          }
        } else {
          $(row).find('.setremainder').hide();
          $(row).find('.edittask').addClass("disabled");
          $(row).find('.select-column').hide();
          $(row).find('td select').attr("disabled", true);
          $(row).find('.mydatepicker').attr("disabled", true);
          $(".select-column").hide();
        }


        if (data.taskStatus === 'Completed') {
          $(row).find('.edittask').addClass("disabled");
          $(row).find('.addprogression').addClass("disabled");
          $(row).find('.setremainder').hide();
          $(row).find('.sendEmail').removeClass("show");
          $(row).find('.sendEmail').hide();
        }
        if (data.taskStatus === 'Unattainable') {
          $(row).find('.edittask').addClass("disabled");
          $(row).find('.addprogression').addClass("disabled");
          $(row).find('.setremainder').hide();
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.JobAddBtn == "show" && vm.btnShowHide == "hide") {
          $('.select-column').hide()
        } else {
          $('.select-column').show()
        }
        if (vm.JobAddBtn == "show" && vm.showTaskAddBtn == 'hide') {
          $('.select-column').hide()
        } else {
          if(this.jobDetail && (this.jobDetail.status ==  2  ||  this.jobDetail.status ==  3))
          {
            $('.select-column').hide()  
            $('#dt-task > tbody > tr').each(function (row: any) {
              $(this).find('td select').each(function () {
                $(this).attr("disabled", "disabled")
              })
              $(this).find('td input').each(function () {
                $(this).attr("disabled", "disabled")
              })
            });
          }
          else
          {
            $('.select-column').show()
            $('#dt-task > tbody > tr').each(function (row: any) {
              $(this).find('td select').each(function () {
                $(this).removeAttr("disabled", "disabled")
              })
              $(this).find('td input').each(function () {
                $(this).removeAttr("disabled", "disabled")
              })
            });
          }
          
        }
        if (vm.JobAddBtn == "hide") {
          $('.select-column').hide()
        } else {
          if(this.jobDetail && (this.jobDetail.status ==  2 || this.jobDetail.status ==  3))
          {
            $('#dt-task > tbody > tr').each(function (row: any) {
              $(this).find('td select').each(function () {
                $(this).attr("disabled", "disabled")
              })
              $(this).find('td input').each(function () {
                $(this).attr("disabled", "disabled")
              })
            });
            $('.select-column').hide()  
          }
          else
          {
            $('.select-column').show()
            $('#dt-task > tbody > tr').each(function (row: any) {
              $(this).find('td select').each(function () {
                $(this).removeAttr("disabled", "disabled")
              })
              $(this).find('td input').each(function () {
                $(this).removeAttr("disabled", "disabled")
              })
            });
          }
        }
        $(".mydatepicker").datepicker({
          format: "mm/dd/yy",
          todayBtn: true,
          autoclose: true,
          changeMonth: true,
          changeYear: true,
          onSelect: function (dateText: any, date: any) {
            if (new Date(dateText) >= new Date($(this)[0].dataset.assigneddate)) {
              vm.taskServices.updateTaskInGrid($(this)[0].dataset.id, dateText, 'dueDate').subscribe((r: any) => {
                vm.reload()
                vm.toastr.success(vm.errorMsg.DueDate);
              }, (e: any) => {
              })
            } else {
              vm.reload();
              vm.toastr.error(vm.errorMsg.errorInDueDate);
            }
          }
        }).keydown(function (e: any) {
          event.preventDefault();
        });
      },
      initComplete: () => {
        $('#dt-task tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.idTask = data.id
            vm.openModalForm(vm.viewtask, data.id)
          }
        })
        $(function () {
          $(".mydatepicker").datepicker({
            format: "mm/dd/yy",
            todayBtn: true,
            autoclose: true,
            changeMonth: true,
            changeYear: true,
            onSelect: function (dateText: any, date: any) {
              if (new Date(dateText) >= new Date($(this)[0].dataset.assigneddate)) {
                vm.taskServices.updateTaskInGrid($(this)[0].dataset.id, dateText, 'dueDate').subscribe((r: any) => {
                  vm.reload();
                  vm.toastr.success(vm.errorMsg.DueDate);
                }, (e: any) => {
                })
              } else {
                vm.reload();
                vm.toastr.error(vm.errorMsg.errorInDueDate);
              }

            }
          }).keydown(function (e: any) {
            event.preventDefault();
          });
        });

        this.specialColumn
          .ngZone(this.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()
            this.idTask = data.id
            if (actionId == 'ADD_PROGRESSION_NOTE') {
              vm.openModalForm(vm.progressionNote)
            }
            if (actionId == "EDIT_TASK") {
              vm.isNew = false
              vm.idTaskType = data.idTaskType;
              vm.openModalForm(vm.addtask, vm.idTask, 'JobModule')
            }
            if (actionId == "SET_REMINDER") {
              vm.openModalForm(vm.reminder)
            }
            if (actionId == "DELETE_TASK") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
            if (actionId == "SEND_EMAIL") {
              vm.idTask = data.id
              vm.openCreateTransmittalModal(vm.addtransmittal, "", data.id)
            }
          })
        $("#dt-task tbody").on("change", "select", function (e: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          let id: number = 0
          let statusChange: string = ''
          let from: string = ''
          id = $(e.target).attr('data-taskId')
          statusChange = $(e.target).val()
          if ($(e.target).attr('id') == 'statusForTask') {
            from = 'status'
            statusChange = $(e.target).val()
            if (statusChange == 'Completed') {
              statusChange = '3'
            }
            if (statusChange == 'Pending') {
              statusChange = '1'
            }
            if (statusChange == 'Unattainable') {
              statusChange = '4'
            }
          } else {
            from = 'assigned'
            statusChange = $(e.target).val();
            var element = $(this).find('option:selected');
            statusChange = element.attr("irr");
          }
          vm.taskServices.updateTaskInGrid(id, statusChange, from, data.idJob).subscribe((r: any) => {
            vm.reload();
            if (from == 'status') {
              vm.toastr.success(vm.errorMsg.statusOftask);
            } else {
              vm.toastr.success(vm.errorMsg.assignTo);
            }
          }, (e: any) => {
            vm.reload();

          })

        });
        $('#dt-task tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          vm.idTask = data.id
          if($(this).hasClass('disabled')) {
            return
          }
          if ($(this).hasClass('delete-icon')) {
            vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row]);
          }
          if ($(this).hasClass('edit-icon')) {
            vm.isNew = false;
            vm.idTaskType = data.idTaskType;
            vm.openModalForm(vm.addtask, vm.idTask, 'JobModule');
          }
          if ($(this).hasClass('note-icon')) {
            vm.openModalForm(vm.progressionNote);
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
  * This method is used to open modal popup for sending transmittal
  * @method openCreateTransmittalModal
  * @param {any} template type which contains template of create/edit module
  * @param {number} id it is optional which contains id if record is in edit mode
  * @param {string} action action is used from which module it is used
  */
  private openCreateTransmittalModal(template: TemplateRef<any>, action?: string, id?: number) {
    this.modalRef = this.modalService.show(template, { class: 'modal-add-transmittal', backdrop: 'static', 'keyboard': false })
  }

  /**
  * This method is used to open modal popup for view task
  * @method openModalForm
  * @param {any} template type which contains template of create/edit module
  * @param {number} id it is optional which contains id if record is in edit mode
  */
  openModalForm(template: TemplateRef<any>, id?: number, from?: string) {
    this.isNew = false
    if (!id) {
      this.isNew = true
    }
    if (from) {
      this.frommodeule = from;
    }
    this.modalRef = this.modalService.show(template, { class: 'modal-view-task', backdrop: 'static', 'keyboard': false })
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
  * This method is used to reload datatable
  * @method reload
  */
  reload() {
    if(this.table){
      this.table.clearPipeline()
    this.table.ajax.reload()
    }
    
  }

  /**
  * This method is used to delete record
  * @method delete
  * @param {number} id type which contains id to delete record 
  * @param {any} row type which contains entire selected row
  */
  delete(id: number, row: any) {
    return new Promise((resolve, reject) => {
      this.taskServices.delete(id).subscribe(r => {
        row.delete()
        resolve(r)
      }, e => {
        reject()
      })
    })
  }
}