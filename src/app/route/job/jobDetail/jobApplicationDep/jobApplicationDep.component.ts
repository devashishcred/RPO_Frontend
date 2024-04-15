import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, ElementRef, NgZone, TemplateRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { cloneDeep, identity, pickBy, assign } from 'lodash';
import { SubscriptionLike as ISubscription } from "rxjs";
import { AppComponent } from '../../../../app.component';
import {} from '../../../../types/jobApplication';
import { JobPermit } from '../../../../types/jobPermit';
import { Document } from '../../../../types/document';
import { Job } from '../../../../types/job';
import { BasicInfoComponent } from '../basicInfo/basicInfo.component';
import { AddTaskComponent } from '../../../addtask/addtask.component';
import { ActivatedRoute } from '@angular/router';
import { JobServices } from '../../job.services';
import { JobApplicationService } from '../../../../services/JobApplicationService.services';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { JobDetailComponent } from '../jobDetail.component';
import { ChangeDetectorRef } from '@angular/core';
import { constantValues } from '../../../../app.constantValues';
import { SharedService, GetAppNoOnSelectRow } from '../../../../app.constantValues';
import { JobSharedService } from '../../JobSharedService';
import { UserRightServices } from '../../../../services/userRight.services';
import { LocalStorageService } from '../../../../services/local-storage.service';

declare const $: any

/**
 * This component contains all function that are used in JobApplicationDepComponent
 * @class JobApplicationDepComponent
 */
@Component({
  selector: '[job-application-dep]',
  templateUrl: './jobApplicationDep.component.html',
})

export class JobApplicationDepComponent implements OnInit {
  /**
   * Add Dep Application Form
   * @property formAddDepApplication
   */
  @ViewChild('formAddDepApplication', {static: true})
  private formAddDepApplication: TemplateRef<any>

  private recformAddPermit: JobPermit
  modalRef: BsModalRef
  private sub: any
  idJob: number
  jobDetail: any = []
  selectedJobType: number
  private data: any
  btnShowHide: string = 'show'
  private filter: any = {}
  private filterAppPermit: any = {}
  private table: any
  private tablePermit: any
  private specialColumn: any
  private jobTypeSelected: any = []
  idJobApp: number
  private isJobDetail: boolean = false
  private userAccessRight: any = {}
  //Job Add Application
  showJobApplicationAddBtn: string = 'hide'
  private showJobApplicationDeleteBtn: string = 'hide'
  private subscription: ISubscription;
  private isShowWOrkPermit: boolean = false;
  isCustomerLoggedIn: boolean = false;
  srch: string;


  /**
   * This method define all services that requires in whole class
   * @method constructor
   */
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private jobServices: JobServices,
    private jobApplicationServices: JobApplicationService,
    private zone: NgZone,
    private router: Router,
    private jobDetailComponent: JobDetailComponent,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private sharedService: SharedService,
    private jobSharedService: JobSharedService,
    private getAppNoOnSelectRow: GetAppNoOnSelectRow,
    private localStorageService: LocalStorageService
  ) {
    // get selected Job Type from job detail component as per selection of radio button
    this.jobSharedService.getJobAppType().subscribe(_sharingJobAppType => {
      this.selectedJobType = _sharingJobAppType
      if (this.selectedJobType) {
        this.filter.idJobApplicationType = this.selectedJobType
      }
    });

    this.sub = this.route.parent.params.subscribe(params => {
      this.idJob = +params['id']; // (+) converts string 'id' to a number
    });

    // when job status change then emited jobDetail will call and reset data tables
    this.jobSharedService.getJobData().subscribe((data: Job) => {
      this.jobDetail = data

      if (this.jobDetail == null) {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
        } else {
          this.setDataIfJobDetail()
        }
      }
    })
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
    this.filter.idJob = this.idJob
    document.title = 'Project -' + this.idJob
    var vm = this;
    if (this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE)) {
      this.selectedJobType = this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE);
      this.filter.idJobApplicationType = this.selectedJobType;
      if (this.jobDetail == null || this.jobDetail == 'undefined') {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
          this.setDataIfJobDetail();

        } else {
          this.setDataIfJobDetail()
        }
      } else {
        this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
        this.setDataIfJobDetail();
      }
    }

    this.sharedService.getJobStatus.subscribe((data: any) => {
      if (data == 'statuschanged') {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
          this.setDataIfJobDetail();
        }
      }
    }, (e: any) => {
    })

    //check permission
    this.showJobApplicationAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDAPPLICATIONSWORKPERMITS)
    this.showJobApplicationDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEAPPLICATIONSWORKPERMITS)
    this.dataTable(vm)
  }

  dataTable(vm: any) {
    this.specialColumn = new $.fn.dataTable.SpecialColumn([
      {
        id: 'EDIT_DETAIL',
        title: 'Edit Application',
        customClass: this.showJobApplicationAddBtn
      },
      {
        id: 'DELETE',
        title: 'Delete Application',
        customClass: this.showJobApplicationDeleteBtn
      },
    ], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)


    //application data table start
    vm.table = $('#dt-aplication').DataTable({
      "aaSorting": [],
      paging: true,
      dom: "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-12 col-md-4'l><'col-sm-12 col-md-4'i><'col-sm-12 col-md-4'p>>",
      pageLength: 25,
      "bFilter": true,
      lengthChange: true,
      lengthMenu: [25, 50, 75, 100],
      language: {
        "emptyTable": "No application available online",
        oPaginate: {
          sNext: `<span class="material-symbols-outlined">arrow_forward</span>`,
          sPrevious: `<span class="material-symbols-outlined">
                    arrow_back
                    </span>`,
        },
        lengthMenu: 'Rows per page _MENU_',
        infoFiltered: "",
        sEmptyTable: "No application available online",
      },
      ajax: this.jobApplicationServices.get({
          onData: (data: any) => {
            assign(data, pickBy(this.filter, identity))
          }
        }
      ),
      columns: [
        {
          title: 'Description',
          data: 'description',
          class: 'clickable',
        },
        {
          title: 'TYPE',
          width: 90,
          data: 'jobApplicationTypeName',
          class: 'clickable'
        }, {
          title: 'STATUS',
          data: 'status',
          width: 90,
          class: 'clickable',
          // visible: !this.isCustomerLoggedIn,
        }, {
          title: 'FROM/TO STREETS ',
          data: 'streetFrom',
          // width: 174,
          class: 'clickable' + this.isCustomerLoggedIn ? 'minWidth-180 maxWidth-100 text-left' : 'text-left',
          render: function (data: any, type: any, dataToSet: any) {
            return (dataToSet.streetWorkingOn ? dataToSet.streetWorkingOn : '-') +
              " | " + (dataToSet.streetFrom ? dataToSet.streetFrom : '-') +
              " | " + (dataToSet.streetTo ? dataToSet.streetTo : '-')
          }
        },
        // {
        //     title: 'VIEW ONLINE',
        //     data: null,
        //     class: 'text-left',
        //     render: function (data: any, type: any, dataToSet: any) {
        //         let nycUrl = "http://a810-bisweb.nyc.gov/bisweb/JobsQueryByNumberServlet?passjobnumber=" + dataToSet.applicationNumber
        //         return '<a href=' + nycUrl + ' data-placement="center" target="_blank" title="view online">View Online</a>';
        //     },
        //     visible: this.isCustomerLoggedIn ? true : false,
        // },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        if (this.isCustomerLoggedIn) {
          $(row).find('.edit-icon').hide();
          $(row).find('.delete-icon').hide();
        } else {
          $(row).find('.edit-icon').addClass("isButton");
          $(row).find('.delete-icon').addClass("isButton");
        }
        $(row).find('.more_vert').hide();
        if (index == 0) {
          vm.jobSharedService.setSelectedApplication(data);
          vm.getAppNoOnSelectRow.getAppNumber.emit(data.id);
          vm.isShowWOrkPermit = true;
        }
        if (this.showJobApplicationAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
        }
        if (this.showJobApplicationDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.btnShowHide == "hide") {
          $('.select-column').hide()
        } else {
          $('.select-column').show()
        }

        if ($('#dt-aplication > tbody > tr:first > td').hasClass('dataTables_empty')) {
          $('#dt-aplication > tbody > tr:first').addClass('row-selected')
        } else {
          $("#dt-aplication").find('> tbody > tr').removeClass('row-selected')
          $('#dt-aplication > tbody > tr:first').addClass('row-selected')
        }
      },

      initComplete: () => {
        if (this.isCustomerLoggedIn) {
          const table = $('#dt-aplication').DataTable();
          this.setPermissionForEmptyActionColumn(table);
        }
        if (!$('#dt-aplication > tbody > tr:first > td').hasClass('dataTables_empty')) {
          $('#dt-aplication > tbody > tr:first').addClass('row-selected')
        }
        if ($('#dt-aplication > tbody > tr:first > td').hasClass('dataTables_empty')) {
          this.sharedService.getApplicationCount.emit(0);
        }
        this.specialColumn
          .ngZone(vm.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()
            if (actionId == 'DELETE') {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
            if (actionId == 'EDIT_DETAIL') {
              this.idJobApp = data.id
              vm.openModalFormAddApplication(this.formAddDepApplication, data.id)
            }
            if (actionId == "BIS") {
              if (data.applicationNumber) {
                let nycUrl = "https://a810-bisweb.nyc.gov/bisweb/JobsQueryByNumberServlet?passjobnumber=" + data.applicationNumber
                window.open(nycUrl, '_blank');
              }
            }
          })

        $('#dt-aplication tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('disabled')) {
            return
          }
          if ($(this).hasClass('delete-icon')) {
            vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
          }
          if ($(this).hasClass('edit-icon')) {
            vm.idJobApp = data.id
            vm.openModalFormAddApplication(vm.formAddDepApplication, data.id)
          }
        })
      }
    });


    //work permit data table end
    $('#dt-aplication tbody').on('click', 'td.clickable', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const appData = row.data()
      if ($(this).hasClass('clickable')) {
        $(this).closest('table').find('> tbody > tr').removeClass('row-selected')
        $(this).parents('tr').addClass('row-selected')
        vm.jobSharedService.setSelectedApplication(appData);
        vm.getAppNoOnSelectRow.getAppNumber.emit(appData.id);
        $("body > rpo-app ~ .dropdown-menu").remove();
      }
    })
  }

  setPermissionForEmptyActionColumn(dataTable) {
    const columns = dataTable.columns().header().toArray();
    columns.forEach((column, columnIndex) => {
      const cells = dataTable.column(columnIndex).nodes();
      let hasVisibleContent = false;

      cells.each(function () {
        const cellContent = $(this).find('div'); // Assuming the content is within a div
        let hasVisibleSpan = false;

        cellContent.find('span').each(function () {
          if ($(this).css('display') === 'none') {
            hasVisibleSpan = true;
            return hasVisibleSpan; // Exit the loop if visible span is found
          } else {
            hasVisibleSpan = false;
            return hasVisibleSpan
          }
        });

        if (hasVisibleSpan) {
          hasVisibleContent = true;
          return hasVisibleContent; // Exit the loop if visible content is found
        }
      });

      if (hasVisibleContent) {
        dataTable.column(columnIndex).visible(false);
      }
    });
  }

  /**
   * This method distroy all object value when user moves from this component
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  /**
   * This method set job detail
   * @method setDataIfJobDetail
   */
  setDataIfJobDetail() {
    if (!this.jobDetail) {
      this.jobServices.getJobDetailById(this.idJob, true).subscribe(r => {
        this.jobDetail = r
        this.jobSharedService.setJobData(r);
        this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, r)

        if (this.jobDetail.status > 1) {
          $('.select-column').hide()
          this.btnShowHide = 'hide'
        } else {
          $('.select-column').show()
          this.btnShowHide = 'show'
        }
      })
    }
    if (this.jobDetail) {
      if (this.jobDetail.status > 1) {
        $('.select-column').hide()
        this.btnShowHide = 'hide'
      } else {
        $('.select-column').show()
        this.btnShowHide = 'show'
      }
    }

  }


  private dropdownPropagation(event: any) {
    event.stopPropagation();
  }

  private onSelectionChange(entry: any) {
    this.selectedJobType = entry;
  }

  /**
   * This method will open add application popup
   * @method _openModalFormAddApplication
   * @param {any} template TemplateRef object
   */
  private _openModalFormAddApplication(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-add-application',
      backdrop: 'static',
      'keyboard': false
    })
  }

  /**
   * This method will open add application popup
   * @method _openModalFormAddApplication
   * @param {any} template TemplateRef object
   * @param {number} id?? ID of Job Application
   */
  openModalFormAddApplication(template: TemplateRef<any>, id?: number) {
    if (!id) {
      this.idJobApp = 0
    }
    this._openModalFormAddApplication(template)
  }

  /**
   * This method will search in datatable
   * @method search
   * @param {string} srch Search Criteria
   */
  search(srch: string) {
    this.table.search(srch).draw()
  }

  /**
   * This method will reload datatable
   * @method reload
   */
  reload() {
    this.table.clearPipeline()
    this.table.ajax.reload()
  }

  /**
   * This method will delete dep job application
   * @method delete
   * @param {number} id ID of Application
   * @param {any} row Row of Application
   */
  private delete(id: number, row: any): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.jobApplicationServices.deleteApplication(id).subscribe(r => {
        if (r && r.jobApplicationCount == 0) {
          this.sharedService.getApplicationCount.emit(r.jobApplicationCount);
        }
        this.reload()
        resolve(null)
      }, e => {
        reject()
      })
    })
  }
}