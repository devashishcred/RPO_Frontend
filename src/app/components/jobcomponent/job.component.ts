import { Component, Input, ElementRef, NgZone, TemplateRef, ViewChild, OnInit, SimpleChanges } from '@angular/core';
import { assign, identity, pickBy } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

import { AppComponent } from '../../app.component';
import { arrayBufferToBase64, isIE } from '../../utils/utils';
import { Contact } from '../../types/contact';
import { borough } from '../../types/borough';
import { BoroughServices } from '../../services/borough.services';
import { JobServices } from '../../route/job/job.services';
import { Job } from '../../types/job';
import { rfp } from '../../types/rfp';
import { constantValues } from '../../app.constantValues';

import { Router } from '@angular/router';
import { UserRightServices } from '../../services/userRight.services';
import { CompanyServices } from '../../route/company/company.services';
declare const $: any

@Component({
  selector: 'job-data-table',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobCommonComponent implements OnInit {
  @Input() companyId: number
  @Input() contactId: number
  @Input() srch: string;
  private boroughs: borough[] = []
  private selectUndefinedOptionValue: any
  private table: any
  private specialColumn: any

  private new: boolean = true
  private rec: Job
  private idBoroughSearch: number
  private houseSearch: string
  private placeSearch: string
  private filter: any = {}
  private userAccessRight: any = {}

  //Job show hide
  private showJobAddBtn: string = 'hide'
  private showJobViewBtn: string = 'hide'
  private showJobDeleteBtn: string = 'hide'
  //task
  private showTaskAddBtn: string = 'hide'
  //RFP
  private showRfpViewBtn: string = 'hide'
  private viewClick: string = "hide"
  static vmNew: any
  setVM(vm1: any) {
    JobCommonComponent.vmNew = vm1
  }
  constructor(
    private boroughServices: BoroughServices,
    private router: Router,
    private jobServices: JobServices,
    private zone: NgZone,
    private modalService: BsModalService,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private companyServices: CompanyServices,
    private appComponent: AppComponent,

  ) {
    //JOB

    this.showJobAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOB)
    this.showJobViewBtn = this.userRight.checkAllowButton(constantValues.VIEWJOB)
    if (this.showJobViewBtn == "show") {
      this.viewClick = "clickable"
    }
    this.showJobDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETEJOB)
    //TASK
    this.userAccessRight = this.userRight.checkUserRights(constantValues.TASKS)
    this.showTaskAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOBTASKS)
    //RFP    
    this.showRfpViewBtn = this.userRight.checkAllowButton(constantValues.VIEWRFP)


    this.specialColumn = new $.fn.dataTable.SpecialColumn([{
      id: 'EDIT_JOB',
      title: 'Edit Job',
      customClass: this.showJobAddBtn
    }, {
      id: 'JOB_HOLD',
      title: 'Put job on Hold',
      customClass: ""
    }, {
      id: 'JOB_COMPLETED',
      title: 'Job Completed',
      customClass: ""
    }, {
      id: 'ADD_TASK',
      title: 'Add Task',
      customClass: this.showTaskAddBtn
    }, {
      id: 'JOB_DETAIL',
      title: 'Job Detail',
      customClass: ""
    }, {
      id: 'VIEW_PROPOSAL',
      title: 'View Proposal/RFP',
      customClass: this.showRfpViewBtn
    }, {
      id: 'ADD_TIME_NOTE',
      title: 'Add Time Note',
      customClass: ""
    }, {
      id: 'SEND_EMAIL',
      title: 'Send Email',
      customClass: ""
    }, {
      id: 'GENERATE_LABEL',
      title: 'Generate Label',
      customClass: ""
    }, {
      id: 'DELETE_JOB',
      title: 'Delete Job',
      customClass: this.showJobDeleteBtn
    }], false)
    // this.onSave = this.onSave.bind(this)
    //  this.delete = this.delete.bind(this)

  }



  ngOnInit() {
    var vm = this;
    this.setVM(vm);
    if (this.companyId) {
      this.filter.idCompany = this.companyId
    }
    if (this.contactId) {
      this.filter.idContact = this.contactId
    }
    this.filter['onlyMyJobs'] = 'false'
    vm.table = $('#dt-job').DataTable({
      paging: true,
      dom: "<'row'<'col-sm-12'tr>>" +"<'row'<'col-sm-12 col-md-3'l><'col-sm-12 col-md-3'i><'col-sm-12 col-md-6'p>>",
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
      ajax: this.jobServices.getRecords({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      // buttons: [this.pdfBtn, this.excelBtn],
      columnDefs: [
        { type: 'date-uk', targets: 1 } //specify your date column number,starting from 0
      ],
      columns: [
        {
          title: 'PROJECT #',
          data: 'jobNumber',
          class: this.viewClick,
          width: 70,
          render: function (data: any, type: any, dataToSet: any) {
            // return "<span class='status status" + dataToSet.status + "'> </span>" + dataToSet.jobNumber;
            return dataToSet.jobNumber;
            // return "<a class='jobRedirect' href='javascript:void(0)'rel='noreferrer'> <span class='status status" + dataToSet.status + "'> </span>" + dataToSet.jobNumber + " </a>";
          },
          createdCell: function (td, cellData, rowData, row, col) {
            console.log('rowData',rowData)
            if(rowData.status.toString() == '3') {
              $(td).addClass('grey-status-border');
            } else if(rowData.status.toString() == '2') {
              $(td).addClass('red-status-border');
            } else if(rowData.status.toString() == '1') {
              $(td).addClass('green-status-border');
            }
           } 
        },
        {
          title: 'PROJECT NAME',
          data: 'qbJobName',
          class: this.viewClick,
          width: 80
        },
        {
          title: 'ADDRESS',
          data: 'specialPlace',
          class: this.viewClick,
          // width:240,
          render: function (data: any, type: any, dataToSet: any) {
            let address = ""
            if (dataToSet.houseNumber) {
              address = address + dataToSet.houseNumber
            }
            if (dataToSet.streetNumber) {
              address = address + " " + dataToSet.streetNumber
            }
            if (dataToSet.borough) {
              address = address + ", " + dataToSet.borough
            }
            if (dataToSet.zipCode) {
              address = address + ", " + dataToSet.zipCode
            }
            return address;
          }
        },
        {
          title: 'FLOOR',
          data: 'floorNumber',
          class: this.viewClick,
        }, {
          title: 'APT',
          data: 'apartment',
          class: this.viewClick,
        }, {
          title: 'SPECIAL PLACE',
          data: 'specialPlace',
          class: this.viewClick,
        }, 
         {
          title: 'CLIENT COMPANY',
          data: 'company',
          class: this.viewClick + ' text-left',
        },
        {
          title: 'PROJECT ACCESS',
          data: 'isAuthorized',
          class: this.viewClick + ' text-left',
        },
        // this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        // $(row).append("<a class='myanchor jobRedirect' id='' href='./job/" + data.id + "'/application'' rel='noreferrer' target='_blank'></a>")
      }),
      initComplete: () => {
        $('.jobRedirect').on('click', function (ev: any) {
          localStorage.setItem('isFromTask', 'true')
        })
      }
    });
    $('#dt-job tbody').on('click', 'td.clickable', function (ev: any) {
      if ($(this).hasClass('clickable')) {
        // $(this).parent('tr').find('.myanchor')[0].click()
        const row = vm.table.row($(this).parents('tr'))
        const data = row.data()
        vm.onOpenJobDetail(data)
      }
    });

    $('#dt-job tbody').on('mousedown', 'a.jobRedirect', function (ev: any) {

      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      ev = ev || window.event;
      switch (ev.which) {
        case 1: vm.onOpenJobDetail(data);
          ; break;
        case 2: '';
          break;
        case 3:

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
            $(this).attr('href', './job/' + data.id + '/' + jobtype + ';' + 'idJobAppType=' + jobtypeId)
          } else {
            $(this).attr('href', './job/' + data.id + '/' + jobtype)
          }
          ; break;
      }
    });

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

  ngOnChanges(changes: SimpleChanges) {
    if(this.srch) {
      this.search(this.srch)
    }
  }


  /**
   * This method will call when job detail page open
   * @method onOpenJobDetail
   * @param {any} data JobData 
   */
  private onOpenJobDetail(data: any) {
    //this call is used to set data in shared service
    this.appComponent.setCommonJobObject(data.id);
  }
  public search(srch: string) {
    this.table.search(srch).draw()
  }

  reload() {
    JobCommonComponent.vmNew.table.clearPipeline()
    JobCommonComponent.vmNew.table.ajax.reload()
  }

}