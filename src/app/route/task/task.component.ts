import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { AppComponent } from '../../app.component';
import { AgentCertificate, DocumentType, Employee, EmployeeDocument } from '../../types/employee';
import { Message } from '../../app.messages';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues, SharedService } from '../../app.constantValues';
import * as _ from 'underscore';
import { TaskServices } from '../task/task.services'
import { TaskJobDTO } from '../../types/task';
import { EmployeeServices } from '../employee/employee.services'
//import { Search } from 'angular2-multiselect-dropdown/menu-item';
import { GlobalSearchServices } from '../../services/globalSearch.services';


declare const $: any

/**
 * This component contains all function that are used in TaskComponent
 * @class TaskComponent
 */
@Component({
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit, OnDestroy {

  /**
   *  taskfilter add/edit form
   * @property taskfilter
   */
  @ViewChild('taskfilter', {static: true})
  private taskfilter: TemplateRef<any>

  /**
   *  addtask add/edit form
   * @property addtask
   */
  @ViewChild('addtask', {static: true})
  private addtask: TemplateRef<any>

  /**
   *  addtask add/edit form
   * @property addtask
   */
  @ViewChild('addTaskMaster', {static: true})
  private addTaskMaster: TemplateRef<any>

  /**
   *  progressionnote add/edit form
   * @property progressionnote
   */
  @ViewChild('progressionnote', {static: true})
  progressionNote: TemplateRef<any>

  /**
   *  reminder add form
   * @property reminder
   */
  @ViewChild('reminder', {static: true})
  private reminder: TemplateRef<any>

  /**
   * To view specific task
   * @property viewtask
   */
  @ViewChild('viewtask', {static: true})
  private viewtask: TemplateRef<any>

  loading: boolean = false
  private selectUndefinedOptionValue: any

  private rows: any;
  modalRef: BsModalRef
  private new: boolean = true
  private table: any
  private specialColumn: any
  private errorMessage: any
  filter: any
  idTask: number
  private jobId: number
  idTaskType: number
  isNew: boolean = false
  isSendFromTask: boolean = true
  private idJobfortaskstatus: number
  idJob: number
  private taskStatusArr: any
  private employeesArr: any
  private showEditCompletedTaskBtn: string = 'hide'
  srch: any;
  showDocumentAddBtn: string

  constructor(
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private taskServices: TaskServices,
    private router: Router,
    private zone: NgZone,
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private employeeServices: EmployeeServices,
    private sharedService: SharedService,
    private route: ActivatedRoute,
  ) {
    this.showEditCompletedTaskBtn = this.userRight.checkAllowButton(constantValues.EDITCOMPLETEDJOBTASKS)
    this.errorMessage = this.message.msg;
    this.specialColumn = new $.fn.dataTable.SpecialColumn([
      {
        id: 'SET_REMINDER',
        title: 'Set Reminder',
        customClass: "setremainder"
      }, {
        id: 'DELETE_TASK',
        title: 'Delete Task',
        customClass: ""
      }], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
    this.reloadSearch = this.reloadSearch.bind(this)
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit EDITCOMPLETEDJOBTASKS
   */

  ngOnInit() {
    document.title = 'Task'
    this.filter = {} as any
    if (!this.filter.idTaskStatus) {
      this.filter.idTaskStatus = 1;
    }
    this.loadDataTable()
    this.employeeServices.getEmpDropdown().subscribe(r => {
      this.employeesArr = _.sortBy(r, function (r: any) {
        return r.lastName.toLowerCase();
      });
    }, e => {
    })
    this.taskServices.getTaskStatus().subscribe(r => {
      this.taskStatusArr = _.sortBy(r, function (i: any) {
        return i.name.toLowerCase();
      });
    }, e => {
    })


    /* clearing local filter on routing to other route */
    this.router.events.subscribe(rEvent => {
      if (rEvent instanceof NavigationStart && !(rEvent.url.includes('tasks')))
        this.sharedService.taskLocalFilter = undefined;
    })
    /** Global search routing */
    this.route.params.subscribe(params => {
      let globalSearchType = +params['globalSearchType'];
      let globalSearchText = params['globalSearchText'];
      if (globalSearchType && globalSearchText) {
        this.sharedService.taskLocalFilter = undefined;
        this.filter['globalSearchType'] = globalSearchType
        this.filter['globalSearchText'] = globalSearchText
        this.filter.idTaskStatus = "";
        $('#dt-task').DataTable().destroy()
        $('#dt-task').empty()
        this.loadDataTable()
      }
    });

    if (this.sharedService.taskLocalFilter && (this.sharedService.taskLocalFilter.searchText || this.sharedService.taskLocalFilter.filter)) {
      if (this.sharedService.taskLocalFilter.searchText) {
        this.srch = this.sharedService.taskLocalFilter.searchText;
        this.table.search(this.srch).draw()
      }
      this.sharedService.taskLocalFilter = undefined;
    }

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


  loadDataTable() {
    var vm = this;
    this.filter.isActiveJob = true;
    this.filter.isRfp = true;
    this.filter.isCompany = true;
    this.filter.isContact = true;
    // For sorting in html input tag
    /* Create an array with the values of all the input boxes in a column */
    $.fn.dataTable.ext.order['dom-text'] = function (settings: any, col: any) {
      return this.api().column(col, {order: 'index'}).nodes().map(function (td: any, i: any) {
        return $('input', td).val();
      });
    }
    $.fn.dataTableExt.ofnSearch['select'] = function (value: any) {
      return $(value).val();
    };

    /* Create an array with the values of all the select options in a column */
    $.fn.dataTable.ext.order['dom-select'] = function (settings: any, col: any) {
      return this.api().column(col, {order: 'index'}).nodes().map(function (td: any, i: string) {
        return $('select', td).val();
      });


    }
    vm.table = $('#dt-task').DataTable({
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
      ajax: this.taskServices.get({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columnDefs: [
        {type: 'date-uk', targets: [1]}, //specify your date column number,starting from 0
        {"type": "select", "targets": [5, 11]},
      ],
      columns: [
        {
          title: 'Task #',
          data: 'id',
          class: 'clickable',
          width: 90,
          createdCell: function (td, cellData, rowData, row, col) {
            if (rowData.badgeClass) {
              $(td).addClass(`${rowData.badgeClass}-status-border`);
            }
          },
        },
        {
          title: 'Due Date',
          data: 'completeBy',
          // type: 'datepicker',
          orderDataType: "dom-text",
          width: 108,
          render: function (data: any, type: any, dataToSet: any) {
            return '<div datetime-picker class="inner-addon right-addon input-group"><i class="icon material-symbols-outlined clickable datepickerbutton">event</i><input style="padding-left: 5px;" type="text" class="mydatepicker form-control" data-id=' + dataToSet.id + '  data-assignedDate=' + dataToSet.assignedDate + ' placeholder="Due date" value=' + (dataToSet.completeBy != null ? dataToSet.completeBy : '') + '>' + '</div>'
            // return "<div class='flex-col'><span class='" + dataToSet.badgeClass + " status'> </span>" + '<div><input style="padding-left: 5px;" type="text" class="mydatepicker form-control" data-id=' + dataToSet.id + ' data-assignedDate=' + dataToSet.assignedDate + ' placeholder="Due date" value=' + (dataToSet.completeBy != null ? dataToSet.completeBy : '') + '>  </div></div>';
          }
        },
        {
          title: 'Assigned By',
          data: 'assignedBy',
          // width: 136,
          class: 'clickable min-auto'
        },
        {
          title: 'For',
          data: 'taskFor',
          class: 'taskfor pointer min-auto',
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.idContact) {
              // return "<a class='taskfor' href='./contactdetail/" + dataToSet.idContact + "'  rel='noreferrer'  target='_blank'>" + dataToSet.taskFor + " </a>";
              return "<a class='taskfor' href='javascript:void(0)'   rel='noreferrer'>" + dataToSet.taskFor + " </a>";
            } else if (dataToSet.idCompany) {
              // return "<a class='taskfor' href='./companydetail/" + dataToSet.idCompany + "'  rel='noreferrer'  >" + dataToSet.taskFor + " </a>";
              return "<a class='taskfor' href='javascript:void(0)'  rel='noreferrer'  >" + dataToSet.taskFor + " </a>";
            } else if (dataToSet.idRfp) {
              // return "<a class='taskfor' href='./editSiteInformation/" + dataToSet.idRfp + "'  rel='noreferrer'  target='_blank'>" + dataToSet.taskFor + " </a>";
              return "<a class='taskfor' href='javascript:void(0)'  rel='noreferrer' >" + dataToSet.taskFor + " </a>";
            } else if (dataToSet.idJob) {
              // return "<a class='taskfor jobRedirect' href='./job/" + dataToSet.idJob + "' rel='noreferrer' target='_blank'>" + dataToSet.taskFor + " </a>";
              return "<a class='taskfor jobRedirect' href='javascript:void(0)' rel='noreferrer'>" + dataToSet.taskFor + " </a>";
            } else {
              return ''
            }
          }
        },
        {
          title: 'Address / Special place name',
          data: '',
          class: 'clickable',
          width: 160,
          render: function (data: any, type: any, dataToSet: any) {
            let address = ""
            if (dataToSet.idJob != null || dataToSet.idRfp != null) {
              if (dataToSet.houseNumber) {
                address = address + dataToSet.houseNumber
              }
              if (dataToSet.street) {
                address = address + " " + dataToSet.street
              }
              if (dataToSet.borough) {
                address = address + ", " + dataToSet.borough
              }
              if (dataToSet.zipCode) {
                address = address + ", " + dataToSet.zipCode
              }
            }
            let specialPlaceName = dataToSet.specialPlace ? dataToSet.specialPlace : "-";
            return (address ? address : "-") + " | " + specialPlaceName;
          }
        },
        {
          title: 'Assigned To',
          data: 'assignedTo',
          class: '',
          type: 'select',
          width: 136,
          orderDataType: "dom-select",
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.assignedTo) {
              let options = "<select class='form-control' id='AssigneForTask' data-taskId=" + dataToSet.id + " >"
              for (let i = 0; i <= vm.employeesArr.length - 1; i++) {
                options = options + "<option irr=" + vm.employeesArr[i].id + " value=" + vm.employeesArr[i].employeeName + "  " + (dataToSet.assignedTo.toLowerCase() === vm.employeesArr[i].employeeName.toLowerCase() ? 'selected' : '') + " > " + vm.employeesArr[i].employeeName + "</option>"
              }
              options += "</select>";
              return options;
            }
          }
        },
        {
          title: 'Task Type',
          data: 'taskType',
          class: 'clickable',
          // width: 116,
        },
        {
          title: 'Task Details',
          data: 'generalNotes',
          class: 'clickable',
          width: 140,
        },
        {
          title: 'A#/LOC/V#',
          data: 'jobApplication',
          // width: 136,
          class: 'min-auto',
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.jobApplication) {

              if (dataToSet.jobApplication.search('A#') != -1) {
                let bisRef = dataToSet.jobApplication.replace('A# : ', '');
                return "<a rel='noreferrer' href='https://a810-bisweb.nyc.gov/bisweb/JobsQueryByNumberServlet?passjobnumber=" + bisRef + "' target='_blank'>" + dataToSet.jobApplication + "</a>";
              }
              if (dataToSet.jobApplication.search('V#') != -1) {
                let bisRef = dataToSet.jobApplication.replace('V# : ', '');
                return "<a rel='noreferrer' href='http://a820-ecbticketfinder.nyc.gov/getViolationbyID.action?searchViolationObject.violationNo=0" + bisRef + "&searchViolationObject.searchOptions=All&submit=Search&searchViolationObject.searchType=violationNumber' target='_blank'>" + dataToSet.jobApplication + "</a>";
              }
              return dataToSet.jobApplication

            } else {
              return ''
            }
          }
        },
        {
          title: 'PERMITS',
          data: 'workPermitType',
          // width: '525px',
          class: 'clickable'
        },
        {
          title: 'Recent Note',
          // data: 'progressNote',
          class: 'clickable',
          width: 140,
          // width: '500px',
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.progressNote) {
              return " <div> " + dataToSet.progressNote + "<br>" + "<span class='modify'> " + dataToSet.notesDateStamp + " " + dataToSet.notesTimeStamp + " </span> </div>";
            } else {
              return ''
            }

          }
        }, {
          title: 'Task Status',
          data: 'taskStatus',
          class: 'Status',
          width: 100,
          type: 'select',
          orderDataType: "dom-select",
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.taskStatus) {
              let Status = dataToSet.taskStatus.toLowerCase();
              let options = "<select class='form-control statustaskk' id='statusForTask' data-taskId=" + dataToSet.id + " >"
              for (let i = 0; i <= vm.taskStatusArr.length - 1; i++) {
                options = options + "<option  value=" + vm.taskStatusArr[i].name + "  " + (Status === vm.taskStatusArr[i].name.toLowerCase() ? 'selected' : '') + " >" + vm.taskStatusArr[i].name + "</option>"
              }
              options += "</select>";
              return options;
            }
          },
        },
        this.specialColumn
      ],

      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.note-icon').removeClass('hide');
        $(row).find('.note-icon').addClass("addprogression");
        $(row).find('.edit-icon').addClass("showEditBtnForCompletedJobTasks");
        $(row).find('.delete-icon').addClass('hide');
        this.idJobfortaskstatus = data.idJob;
        if (data.taskFor.startsWith("Job#") && this.showEditCompletedTaskBtn === 'hide' && data.taskStatus === 'Completed') {
          $(row).find('.showEditBtnForCompletedJobTasks').hide();
          $(row).find('td select').attr("disabled", true);
          $(row).find('.mydatepicker').attr("disabled", true);
        } else {
          $(row).find('.showEditBtnForCompletedJobTasks').show();
        }

        if (data.taskStatus === 'Completed') {
          $(row).find('.showEditBtnForCompletedJobTasks').hide();
          $(row).find('.addprogression').hide();
          $(row).find('.setremainder').hide();
        }
      }),
      drawCallback: function (settings: any) {
        var api = this.api();
        var rows = api.rows({page: 'current'}).data()
        rows.each((data: any) => {
          if (data.idJob != null && data.idJob) {
            if (data.idJobStatus > 1) {
              $('#' + data.id).find('.select-column span').hide()
            } else {
              $('#' + data.id).find('.select-column span').show()
            }
          } else {
            $('#' + data.id).find('.select-column span').show()
          }
        })
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
                vm.toastr.success(vm.errorMessage.DueDate);
              }, (e: any) => {
                vm.reload();
              })
            } else {
              vm.reload();
              vm.toastr.error(vm.errorMessage.errorInDueDate);
            }
          }
        }).keydown(function (e: any) {
          event.preventDefault();
        });
      },

      initComplete: () => {
        $('.jobRedirect').on('click', function (ev: any) {
          localStorage.setItem('isFromTask', 'true')
        })

        $('#dt-task tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.idTask = data.id
            vm.idJob = data.idJob
            vm.openModalFormView(vm.viewtask, data.id)
          }
        })
        $('#dt-task tbody').on('click', 'td.taskfor', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          localStorage.setItem('isFromTask', 'true')
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
                  vm.toastr.success(vm.errorMessage.DueDate);
                }, (e: any) => {
                })
              } else {
                vm.reload();
                vm.toastr.error(vm.errorMessage.errorInDueDate);
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
            vm.idTask = data.id
            vm.idJob = data.idJob
            this.idJob = data.idJob
            if (actionId == 'ADD_PROGRESSION_NOTE') {
              vm.openModalForm(vm.progressionNote)
            }
            if (actionId == "EDIT_TASK") {
              vm.idJob = data.idJob
              this.idTaskType = data.idTaskType;
              if (data.isGeneric) {
                vm.openAddTaskForm(vm.addTaskMaster, vm.idTask)
              } else {
                vm.openModalForm(vm.addtask)
              }
            }
            if (actionId == "SET_REMINDER") {
              vm.openModalForm(vm.reminder)
            }
            if (actionId == "DELETE_TASK") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
          })
        $("#dt-task tbody").on("change", "select", function (e: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          let id: number = 0
          let statusChange: string = ''
          let from: string = ''
          id = $(e.target).attr('data-taskId')
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
            if (r.taskStatus == "Completed") {
              vm.reload();
            }
            if (from == 'status') {
              vm.reload();
              vm.toastr.success(vm.errorMessage.statusOftask);
            } else {
              vm.reload();
              vm.toastr.success(vm.errorMessage.assignTo);
            }
          }, (e: any) => {
            vm.reload();

          })

        });
        $('#dt-task tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          vm.idTask = data.id
          vm.idJob = data.idJob
          this.idJob = data.idJob
          if ($(this).hasClass('edit-icon')) {
            vm.idJob = data.idJob
            vm.idTaskType = data.idTaskType;
            console.log(data)
            if (data.isGeneric) {
              console.log('if')
              vm.openAddTaskForm(vm.addTaskMaster, vm.idTask)
            } else {
              console.log('else')
              vm.openModalForm(vm.addtask)
            }
          }
          if ($(this).hasClass('note-icon')) {
            vm.openModalForm(vm.progressionNote)
          }
        })
      }
    })

    $('#dt-task tbody').on('click', 'td.clickable', function (ev: any) {
      if ($(this).hasClass('clickable')) {
        $(this).closest('table').find('> tbody > tr').removeClass('row-selected')
        $(this).parents('tr').addClass('row-selected')
      }
    })

    $('#dt-task_paginate').on('click', function (ev: any) {
      window.scrollTo(100, 100);
    });
    $('#dt-task_paginate').on('click', 'a.paginate_button', function (ev: any) {
      window.scrollTo(100, 100);
    });

    // To reset the sorted columns to default
    $.fn.dataTableExt.oApi.fnSortNeutral = function (oSettings: any) {
      /* Remove any current sorting */
      oSettings.aaSorting = [];
      /* Redraw */
      oSettings.oApi._fnReDraw(oSettings);
    };

    // $('#dt-task tbody').on('click', 'td.taskfor', function (ev: any) {

    //   const row = vm.table.row($(this).parents('tr'))
    //   const data = row.data()

    //     vm.onOpenJobDetail(data);

    // });
    $('#dt-task tbody').on('mousedown', 'a.taskfor', function (ev: any) {

      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      ev = ev || window.event;
      switch (ev.which) {
        case 1:
          vm.onOpenJobDetail(data);
          ;
          break;
        case 2:
          '';
          break;
        case 3:
          if (data.idContact) {
            $(this).attr('href', './contactdetail/' + data.idContact)
          } else if (data.idCompany) {
            $(this).attr('href', './companydetail/' + data.idCompany)
          } else if (data.idRfp) {
            $(this).attr('href', './editSiteInformation/' + data.idRfp)
          } else if (data.idJob) {
            let jobtype = '';
            let jobtypeId = '';
            if (data.jobApplicationType) {
              let appType = data.jobApplicationType.split(',');
              if (appType && appType.length > 0) {
                let keepGoing = true;
                appType.forEach((idJobAppType: any) => {
                  if (keepGoing) {
                    if (idJobAppType == 3) {

                      keepGoing = false;
                      jobtype = 'violation';
                    } else if (idJobAppType == 2) {
                      keepGoing = false;
                      // this.loading = false
                      jobtype = 'dot';
                      jobtypeId = idJobAppType;
                    } else {
                      keepGoing = false;
                      // this.loading = false
                      jobtype = 'application';
                      jobtypeId = idJobAppType;
                    }
                  }
                })
              }
            }
            if (jobtypeId != '') {
              $(this).attr('href', './job/' + data.idJob + '/' + jobtype + ';' + 'idJobAppType=' + jobtypeId)
            } else {
              $(this).attr('href', './job/' + data.idJob + '/' + jobtype)
            }
          }
          ;
          break;
      }
    });
  }

  /**
   * This method will call when job detail page open
   * @method onOpenJobDetail
   * @param {any} data JobData
   */
  private onOpenJobDetail(data: any) {
    //this call is used to set data in shared service
    if (data.idContact) {
      this.router.navigate(['./contactdetail/' + data.idContact])
      // return "<a class='taskfor' href='./contactdetail/" + data.idContact + "'  rel='noreferrer'  target='_blank'>" + data.taskFor + " </a>";
    } else if (data.idCompany) {
      this.router.navigate(['./companydetail/' + data.idCompany])
      // return "<a class='taskfor' href='./companydetail/" + data.idCompany + "'  rel='noreferrer'  target='_blank'>" + data.taskFor + " </a>";
    } else if (data.idRfp) {
      this.router.navigate(['./editSiteInformation/' + data.idRfp])
      // return "<a class='taskfor' href='./editSiteInformation/" + data.idRfp + "'  rel='noreferrer'  target='_blank'>" + data.taskFor + " </a>";
    } else if (data.idJob) {
      this.appComponent.setCommonJobObject(data.idJob);
    }
    // this.appComponent.setCommonJobObject(data.id);
  }


  /**
   * This method will be destroy all elements and other values from whole module
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    this.specialColumn.destroy()
    $('#dt-task tbody').off('click')
  }

  clearSort() {
    this.filter = {};
    this.filter.isActiveJob = true;
    this.filter.isRfp = true;
    this.filter.isCompany = true;
    this.filter.isContact = true;
    if (!this.filter.idTaskStatus) {
      this.filter.idTaskStatus = 1;
    }
    this.table.clearPipeline()
    this.table.ajax.reload();
    this.table.order([]);
  }

  /**
   * This method is used for filter/search records from datatable
   * @method search
   * @param {string} srch type any which contains string that can be filtered from datatable
   */
  search(srch: any) {
    this.table.search(srch).draw()
  }

  /**
   * This method is used to reload datatable
   * @method reload
   */
  reload() {
    this.table.clearPipeline()
    this.table.ajax.reload();
  }

  /**
   * This method is used to open modal popup for openModalForm
   * @method openModalForm
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   */
  openModalForm(template: TemplateRef<any>, id?: number, idTaskType?: any) {
    if (!id) {
      // this.idJobApp = 0
    }
    console.log(this.idJob, this.idTaskType)
    this.isNew = false;
    this.modalRef = this.modalService.show(template, {class: 'modal-add-task', backdrop: 'static', 'keyboard': false})
  }

  /**
   * This method is used to open modal popup for openAddTaskForm
   * @method openAddTaskForm
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   */
  openAddTaskForm(template: TemplateRef<any>, id?: number) {
    this.isNew = false
    if (!id) {
      this.isNew = true
    }
    this.modalRef = this.modalService.show(template, {class: 'modal-add-task', backdrop: 'static', 'keyboard': false})
  }

  /**
   * This method is used to open modal popup for openModalFormView
   * @method openModalFormView
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   */
  private openModalFormView(template: TemplateRef<any>, id?: number) {
    if (!id) {
      // this.idJobApp = 0
    }
    this.modalRef = this.modalService.show(template, {class: 'modal-view-task', backdrop: 'static', 'keyboard': false})
  }

  /**
   * This method is used to open modal popup for openModalTaskFilter
   * @method openModalTaskFilter
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   */
  openModalTaskFilter(template: TemplateRef<any>, id?: number) {
    if (!id) {
      // this.idJobApp = 0
    }
    this.modalRef = this.modalService.show(template, {
      class: 'modal-task-filter',
      backdrop: 'static',
      'keyboard': false
    })
  }

  /**
   * This method is used to close popup
   * @method closePopup
   */
  closePopup() {
    this.modalRef.hide()
  }

  /**
   * This method is used to reload datatable
   * @method reloadSearch
   * @param {any} filter filter parameter is used to reload datatable
   */
  reloadSearch(filter: any) {
    this.filter = filter
    if (Object.keys(filter).length === 0) {
      this.filter.isActiveJob = true;
      this.filter.isRfp = true;
      this.filter.isCompany = true;
      this.filter.isContact = true;
    }


    this.table.clearPipeline()
    this.table.ajax.reload();
    this.table.order([]);
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