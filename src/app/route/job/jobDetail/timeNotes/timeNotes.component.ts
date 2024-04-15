import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, ElementRef, NgZone, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, assign } from 'lodash';
import { AppComponent } from '../../../../app.component';
import { TimeNotesServices } from './TimeNotes.service';
import { JobServices } from '../../job.services';
import { BasicInfoComponent } from '../basicInfo/basicInfo.component';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'underscore';
import * as moment from 'moment';
import { JobSharedService } from '../../JobSharedService';
import { Router } from '@angular/router';
import { JobDetailComponent } from '../jobDetail.component';
import { constantValues, SharedService } from '../../../../app.constantValues';
import { Document } from '../../../../types/document';

declare const $: any
import { DatePipe } from '@angular/common';
import { UserRightServices } from '../../../../services/userRight.services';

/**
 * This component contains all function that are used in Time Notes
 * @class TimeNotesComponent
 */
@Component({
  selector: '[time-notes]',
  templateUrl: './timeNotes.component.html',
  styleUrls: ['./timeNotes.component.scss'],
  providers: [DatePipe]
})
export class TimeNotesComponent implements OnInit {

  id: number

  private filter: any = {}
  private table: any

  modalRef: BsModalRef
  private sub: any
  private idJob: number
  idTimeNote: number

  private selectedJobType: any = []
  private jobDetail: any = []
  private showBtnStatus: string = "show";
  private specialColumn: any
  private actionRow: any
  private isNew: boolean = false

  /**
   * editTimeNote add/edit form
   * @property editTimeNote
   */
  @ViewChild('editTimeNote', {static: true})
  private editTimeNote: TemplateRef<any>
  showTaskAddBtn: any;
  columns: any;
  loading: boolean = false;
  srch: string;

  constructor(
    private zone: NgZone,
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private TimeNotesService: TimeNotesServices,
    private route: ActivatedRoute,
    private jobServices: JobServices,
    private router: Router,
    private jobDetailComponent: JobDetailComponent,
    private datePipe: DatePipe,
    private constantValues: constantValues,
    private sharedService: SharedService,
    private jobSharedService: JobSharedService,
    private userRight: UserRightServices
  ) {
    this.sub = this.route.parent.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
    });
    //set button visibility on job status change
    this.jobSharedService.getJobData().subscribe((data: any) => {
      this.jobDetail = data
      if (this.jobDetail == null) {
        this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
        this.setBtnBasedonStatus(this.jobDetail)
      } else {
        this.setBtnBasedonStatus(this.jobDetail)
      }
    })
    //bind event
    this.specialColumn = new $.fn.dataTable.SpecialColumn([], false);

    this.reload = this.reload.bind(this)
  }

  /**
   * This method is used to set button based on status
   * @method setBtnBasedonStatus
   * @param {any} jobDetail jobDetail is an object of job
   */
  setBtnBasedonStatus(jobDetail: any) {
    this.idJob = jobDetail.id;
    if (jobDetail.status > 1) {
      this.showBtnStatus = 'hide'
    } else {
      this.showBtnStatus = 'show'
    }
    this.reload()
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.sub = this.route.parent.params.subscribe(params => {
      this.idJob = +params['id']; // (+) converts string 'id' to a number
    });
    document.title = 'Project -' + this.idJob;

    const vm = this

    this.sharedService.getJobTimeNoteFromInfo.subscribe((data: any) => {
      if (data == 'timenote') {
        this.reload()
      }
    }, (e: any) => {
    })

    this.columns = [
      {
        title: 'NOTES',
        data: 'progressNotes',
        width: 200,
        class: 'clickable',
        createdCell: function (td, cellData, rowData, row, col) {
          console.log('rowData', rowData)
          if (rowData) {
            if (rowData?.isQuickbookSynced && rowData?.jobBillingType != 3) {
              $(td).addClass('qb-green-status-border');
            } else if (rowData?.jobBillingType != 3) {
              if (rowData?.quickbookSyncError && rowData?.jobBillingType != 3) {
                $(td).addClass('red-status-border');
              } else {
                $(td).addClass('yellow-status-border');
              }
            } else {
              $(td).addClass('nb-grey-status-border');
            }
          }
        }
      },
      {
        title: 'PERFORMED DATE',
        data: 'timeNoteDate',
        width: 40,
        class: 'clickable',
        render: function (data: any, type: any, dataToSet: any) {
          let date = new Date(data);
          let month = date.getMonth() + 1;
          let datee = date.getDate()
          let displaydate = datee >= 10 ? datee : '0' + datee
          let className = "";
          if (dataToSet.isQuickbookSynced) {
            className = "green";
          } else {
            if (dataToSet.quickbookSyncError) {
              className = "red";
            } else {
              className = "yellow";
            }
          }
          return (month >= 10 ? month : "0" + month) + "/" + displaydate + "/" + date.getFullYear();
        }
      },
      {
        title: 'TIME',
        data: 'timeMinutes',
        class: 'clickable',
        width: 35,
        render: function (data: any, type: any, dataToSet: any) {
          let time = '';
          if (dataToSet.timeHours) {
            time += dataToSet.timeHours + 'h';
          } else {
            time += '00';
          }
          if (dataToSet.timeMinutes) {
            time += ':' + dataToSet.timeMinutes + 'm';
          } else {
            time += ':00';
          }
          return time;
        }
      },
      {
        title: 'SERVICE ITEM',
        data: 'serviceItem',
        width: 70,
        class: 'clickable'
      },
      {
        title: 'CATEGORY',
        data: 'jobBillingType',
        width: 60,
        class: 'clickable',
        render: function (data: any, type: any, dataToSet: any) {
          if (data == 1) {
            return "Scope Time";
          }
          if (data == 2) {
            return "Other Billable Service";
          }
          if (data == 3) {
            return "Non Billable";
          }
        }
      },
      {
        title: 'CREATED BY',
        data: 'createdByEmployeeName',
        width: 60,
        class: 'clickable',
      },
      {
        title: 'CREATED DATE',
        data: 'createdDate',
        width: 50,
        class: 'clickable',
      },
      {
        title: 'Quick Book Error',
        data: 'quickbookSyncError',
        width: 50,
        class: 'clickable',
      },
      this.specialColumn
    ]

    //table structure
    this.table = $('#dt-TimeNotes').DataTable({
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
      ajax: this.TimeNotesService.get({
        onData: (data: any) => {
          assign(data, pickBy({'idJob': this.idJob}, identity))
        }
      }),
      pageLengh: 50,
      "aaSorting": [[1, 'desc']],
      columnDefs: [
        {type: 'date-uk', targets: [1, 7]}, //specify your date column number,starting from 0
      ],
      columns: this.columns,
      drawCallback: (setting: any) => {
      },
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.select-column').show();
        $(row).find('.delete-icon').hide();
        $(row).find('.more_vert').hide();
        $(row).find('.edit-icon').addClass('edittimenote');
        if (!data.isQuickbookSynced) {
          this.showBtnStatus = 'show';
          $(row).find('.select-column span').show(); // hide quick menu
					$(row).find('.more_vert').hide();
        } else {
          this.showBtnStatus = 'hide';
          $(row).find('.select-column span').hide();
          $(row).find('.edittimenote').addClass("disabled");
          $(row).find('td').removeClass('clickable');
        }
      }),
      initComplete: () => {
        this.specialColumn
          .ngZone(this.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()
            if (actionId == 'EDIT_TIMENOTE') {
              vm.idTimeNote = data.id
              vm.openModalTimeNote(vm.editTimeNote, data.id)
            }
          })
        $('#dt-TimeNotes tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.idTimeNote = data.id
            vm.openModalTimeNote(vm.editTimeNote, data.id)
          }
        })
        $('#dt-TimeNotes tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('disabled')) {
            return
          }
          if ($(this).hasClass('edit-icon')) {
            vm.idTimeNote = data.id
            vm.openModalTimeNote(vm.editTimeNote, data.id)
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

  private openModalTimeNote(template: TemplateRef<any>, id?: number) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-add-time-notes',
      backdrop: 'static',
      'keyboard': false
    })
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
   * This method is used to redirect user to job detail screen
   * @method onOpenJobDetail
   * @param {any} data data is an object of job
   */
  private onOpenJobDetail(data: any) {
    this.router.navigate(['/job/' + data.id + '/application']).then(result => {
      window.location.reload();
    });
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
}