import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, ElementRef, NgZone, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, assign } from 'lodash';
import { AppComponent } from '../../../../app.component';
import { RelatedJob } from '../../../../types/relatedJob'
import { RelatedJobServices } from './relatedJob.service';
import { JobServices } from '../../job.services';
import { BasicInfoComponent } from '../basicInfo/basicInfo.component';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'underscore';
import { JobSharedService } from '../../JobSharedService';
import { Router } from '@angular/router';
import { JobDetailComponent } from '../jobDetail.component';
import { constantValues, SharedService } from '../../../../app.constantValues';
import { UserRightServices } from '../../../../services/userRight.services';

declare const $: any

@Component({
  selector: '[related-job]',
  templateUrl: './relatedJob.component.html',
  styleUrls: ['./relatedJob.component.scss']
})
export class RelatedJobComponent implements OnInit {
  @ViewChild('addRelatedJob', { static: true })
  private addRelatedJob: TemplateRef<any>

  private filter: any = {}
  private table: any

  modalRef: BsModalRef
  recRelatedJob: RelatedJob
  private sub: any
  idJob: number

  private RelatedJob: any
  private isRelatedJob: boolean = true
  private selectedJobType: any = []
  private jobDetail: any = []
  showBtnStatus: string = "show";
  loading: boolean = false
  srch: string;

  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private RelatedJobService: RelatedJobServices,
    private route: ActivatedRoute,
    private jobServices: JobServices,
    private jobSharedService: JobSharedService,
    private router: Router,
    private jobDetailComponent: JobDetailComponent,
    private constantValues: constantValues,
    private sharedService: SharedService,
    private userRight: UserRightServices

  ) {
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

    //fetch related job
    this.sub = this.route.parent.params.subscribe(params => {
      this.idJob = +params['id'];
    });
  }

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

  ngOnInit() {
    document.title = 'Project -' + this.idJob;
    this.showBtnStatus = this.userRight.checkAllowButton(this.constantValues.ADDJOB);
    if (this.showBtnStatus == 'show') {
      this.setBtnBasedonStatus(this.jobDetail)
    }
    const vm = this


    this.sharedService.getJobStatus.subscribe((data: any) => {
      if (data == 'statuschanged') {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
          this.setBtnBasedonStatus(this.jobDetail)
        }
      }
    }, (e: any) => { })
    vm.table = $('#dt-relatedJob').DataTable({
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
      ajax: this.RelatedJobService.get(this.idJob),
      columnDefs: [
        { type: 'date-uk', targets: 1 } //specify your date column number,starting from 0

      ],
      columns: [
        {
          title: 'PROJECTS',
          data: 'jobNumber',
          class: 'clickable',
          width: 100,
          render: function (data: any, type: any, dataToSet: any) {
            return dataToSet.jobNumber;
          },
          createdCell: function (td, cellData, rowData, row, col) {
            console.log('rowData', rowData)
            if (rowData.status.toString() == '3') {
              $(td).addClass('grey-status-border');
            } else if (rowData.status.toString() == '2') {
              $(td).addClass('red-status-border');
            } else if (rowData.status.toString() == '1') {
              $(td).addClass('green-status-border');
            }
          }
        },
        {
          title: 'START',
          data: 'startDate',
          class: 'clickable',
          width: 100
        },
        {
          title: 'FLOOR',
          data: 'floorNumber',
          class: 'clickable',
          width: 80
        },
        {
          title: 'APT',
          data: 'apartment',
          class: 'clickable',
          width: 60
        },
        {
          title: 'SPECIAL PLACE NAME',
          data: 'specialPlace',
          class: 'clickable',
          width: 194
        },
        {
          title: 'HOUSE',
          data: 'houseNumber',
          class: 'clickable',
          width: 80
        },
        {
          title: 'STREET',
          data: 'streetNumber',
          class: 'clickable',
          // width: 180
        },
        {
          title: 'COMPANY',
          data: 'company',
          class: 'clickable',
          // width: 180
        },
        {
          title: 'CONTACT',
          data: 'contact',
          class: 'clickable',
          // width: 180
        },
        {
          title: 'ACTION',
          type: 'html',
          orderable: false,
          searchable: false,
          class: 'doc-action',
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.parentStatusId > 1 || vm.showBtnStatus == 'hide') {
              return '';
            } else {
              return '<span data-toggle="tooltip" title="Delete" class="material-symbols-rounded pull-right delete-icon">delete</span>'
            }
          },
        }
      ],
      drawCallback: (setting: any) => {
      },
      initComplete: () => {

        $('.jobRedirect').on('click', function (ev: any) {
          localStorage.setItem('isFromTask', 'true')
        })
        $('div.loading').remove();
      }
    })


    $('#dt-relatedJob tbody').on('click', 'i.editLink, i.fa-trash, td.clickable, input[type="checkbox"],span.delete-icon', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()

      if ($(this).hasClass('delete-icon')) {
        vm.appComponent.showDeleteConfirmation(vm.deleteRelatedJob, [data.id, row, vm])
      }
    })

    this.reload = this.reload.bind(this)

    $('#dt-relatedJob tbody').on('click', 'td.clickable', function (ev: any) {
      if ($(this).hasClass('clickable')) {
        const row = vm.table.row($(this).parents('tr'))
        const data = row.data()
        vm.onOpenJobDetail(data)
      }
    });

    $('#dt-relatedJob tbody').on('mousedown', 'a.jobRedirect', function (ev: any) {

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
                    jobtype = 'dot';
                    jobtypeId = idJobAppType;
                  } else {
                    keepGoing = false;
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
  ngOnDestroy() {
    $('#dt-relatedJob tbody').off('click')
  }
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

  private onOpenJobDetail(data: any) {
    this.loading = true
    this.appComponent.setCommonJobObject(data.id);
  }
  private onSelectionChange(entry: any) {
    this.selectedJobType = entry;
  }
  private dropdownPropagation(event: any) {
    event.stopPropagation();
  }

  private _openModalAddRelatedJob(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-add-related-job', backdrop: 'static', 'keyboard': false })
  }

  openModalAddRelatedJob(template: TemplateRef<any>, id?: number) {
    this._openModalAddRelatedJob(template)
  }

  deleteRelatedJob(id: number, row: any, vm: any) {
    return new Promise((resolve, reject) => {
      vm.RelatedJobService.deleteRelatedJob(vm.idJob, id).subscribe((r: any) => {
        row.delete()
        vm.reload()
        resolve(r)
      }, (e: any) => {
        reject()
      })
    })
  }

  reload() {
    if (this.table) {
      this.table.clearPipeline()
      this.table.ajax.reload()
    }
  }

  search(srch: string) {
    this.table.search(srch).draw()
  }

}