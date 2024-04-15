import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SubscriptionLike as ISubscription } from "rxjs";
import { Component, ElementRef, NgZone, TemplateRef, Input, ViewChild, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, assign } from 'lodash';
import { AppComponent } from '../../../../app.component';
import { ActivatedRoute } from '@angular/router';
import { JobApplicationService } from '../../../../services/JobApplicationService.services';
import { JobSharedService } from '../../JobSharedService';
import { JobServices } from '../../job.services';
import { constantValues } from '../../../../app.constantValues';
import { UserRightServices } from '../../../../services/userRight.services';
import { SharedService, GetAppNoOnSelectRow } from '../../../../app.constantValues';
import { LocalStorageService } from '../../../../services/local-storage.service';
declare const $: any

/**
* This component contains all function that are used in JobApplicationPermitComponent
* @class JobApplicationPermitComponent
*/
@Component({
  selector: 'job-work-permit-dep',
  templateUrl: './jobApplicationPermitDEP.component.html',
})
export class JobApplicationPermitDEPComponent implements OnInit {
  @Input() jobDetail: any
  @Input() isDep: any



  /**
   * Form Add Permit
   * @property formAddDEPPermit
   */
  @ViewChild('formAddDEPPermit', { static: true })
  private formAddDEPPermit: TemplateRef<any>

  modalRef: BsModalRef
  private specialColumn: any
  idJobApp: number
  appType: any
  private idJobAppPermit: number
  idApp: number
  idApplicationNumber: any
  private table: any
  private filter: any = {}
  searchpermit: any
  idJob: number
  isNew: boolean = false
  showBtnStatus: string = "show"
  private sub: any
  private id: number
  isAppData: Boolean = false
  private subscription: ISubscription;
  private applicationModuleSubscription: ISubscription;
  private selectedJobType: number;
  //Job Add Application
  showJobApplicationAddBtn: string = 'hide'
  private showJobApplicationDeleteBtn: string = 'hide'
  private appRowChanges: boolean = false;
  isCustomerLoggedIn: boolean = false;

  totalCost: any;
  loading: boolean;
  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private zone: NgZone,
    private jobApplicationServices: JobApplicationService,
    private jobSharedService: JobSharedService,
    private jobServices: JobServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private sharedService: SharedService,
    private getAppNoOnSelectRow: GetAppNoOnSelectRow,
    private localStorageService: LocalStorageService
  ) {
    this.sub = this.route.parent.params.subscribe(params => {
      this.idJob = +params['id'];
    });

  }

  /**
    * This method will be called once only when module is call for first time
    * @method ngOnInit
  */
  ngOnInit() {
    //check permission
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')

    this.showJobApplicationAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDAPPLICATIONSWORKPERMITS)
    this.showJobApplicationDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEAPPLICATIONSWORKPERMITS)
    this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
    this.setDataIfJobDetail();
    this.sharedService.getJobStatus.subscribe((data: any) => {
      if (data == 'statuschanged') {
        this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
        this.setDataIfJobDetail();
      }
    }, (e: any) => { })
    var vm = this;
    this.getApplication(vm);
    this.applicationModuleSubscription = this.getAppNoOnSelectRow.getAppNumber.subscribe((appNumber: any) => {
      this.appRowChanges = true;
      this.getApplication(vm);
    });
    this.sharedService.getApplicationCount.subscribe((data: any) => {
      if (data == 0) {
        this.isAppData = false;
      } else {
        this.isAppData = true;
      }
    })
  }  

  /**
   * This method destroy all object when user moves from component
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    this.applicationModuleSubscription.unsubscribe();
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
        // this.setBtnBasedonStatus(this.jobDetail)

        if (this.jobDetail.status > 1) {
          $('.select-column').hide()
          this.showBtnStatus = 'hide'
        } else {
          $('.select-column').show()
          this.showBtnStatus = 'show'
        }
      })
    }
    if (this.jobDetail) {
      if (this.jobDetail.status > 1) {
        $('.select-column').hide()
        this.showBtnStatus = 'hide'
      } else {
        $('.select-column').show()
        this.showBtnStatus = 'show'
      }
    }

  }

  /**
   * This method will get Application
   * @method getApplication
   * @param {any} vm Table Object
   */
  private getApplication(vm: any) {
    if (this.appRowChanges) {
      $("#dt-aplication-permit").DataTable().destroy();
      $("#dt-aplication-permit").empty();
      this.appRowChanges = false;
    }
    this.jobSharedService.getJobData().subscribe((data: any) => {
      this.jobDetail = data
      if (this.jobDetail == null || this.jobDetail == 'undefined') {
        this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
        // this.setBtnBasedonStatus(this.jobDetail)
        this.setDataIfJobDetail();
      }
    })
    this.jobSharedService.getSelectedApplication().subscribe((data: any) => {
      if (data) {
        this.isAppData = true
        this.appType = data
        if (this.appType.totalCost && this.appType.jobApplicationTypeName == 'Hydrant') {
          this.totalCost = this.appType.totalCost
        }
        this.filter = [];
        this.filter.idJobApplication = data.id;
        this.idJob = this.idJob
        if (data.applicationNumber != "") {
          this.idApplicationNumber = data.applicationNumber
        }
        this.idApp = data.id
        this.loadDataTable(vm);
      } else {
        this.loadDataTable(vm);
      }
    });
  }

  /**
   * This method will load data table
   * @method loadDataTable
   * @param {any} vm Table Object 
   */
  private loadDataTable(vm: any) {
    this.specialColumn = new $.fn.dataTable.SpecialColumn([
      {
        id: 'EDIT_DETAIL',
        title: 'Edit Work Permit',
        customClass: this.showJobApplicationAddBtn
      },
      {
        id: 'DELETE',
        title: 'Delete Work Permit',
        customClass: this.showJobApplicationDeleteBtn
      },
    ], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
    this.filter.idJob = this.idJob
    if (typeof this.filter.idJobApplication == "undefined" || this.filter.idJobApplication == null) {
      this.filter.idJobApplication = -1
    }
    vm.table = $('#dt-aplication-permit').DataTable({
      paging: true,
      dom: "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-12 col-md-4'l><'col-sm-12 col-md-4'i><'col-sm-12 col-md-4'p>>",
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
      "processing": false,
      ajax: this.jobApplicationServices.getPermitByApplicationId({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'WORK / PERMIT TYPE',
          data: 'jobWorkTypeDescription',
          class: 'clickable minWidth-130',
          width: 130
        },
        {
          title: 'CODE',
          data: 'code',
          class: 'clickable',
          width: '50'
        },
        {
          title: 'PERMIT#',
          data: 'permitNumber',
          class: 'min-auto clickable',
        },
        {
          title: 'FILED',
          data: 'filed',
          class: 'min-auto clickable',
        }, {
          title: 'ISSUED ON',
          data: 'issued',
          class: 'min-auto clickable',
        }, {
          title: 'EXPIRES',
          data: 'expires',
          class: 'min-auto clickable',
        },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        if(this.isCustomerLoggedIn){
          $(row).find('.edit-icon').hide();
          $(row).find('.delete-icon').hide();
        }
        else{
          $(row).find('.edit-icon').addClass("isButton");
          $(row).find('.delete-icon').addClass("isButton");
        }
        $(row).find('.more_vert').hide();
        if (index == 0) {
          this.appType = data
        }
        if (this.showJobApplicationDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
        if (this.showJobApplicationAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
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
        if (this.isCustomerLoggedIn) {
          const table = $('#dt-aplication-permit').DataTable();
          this.setPermissionForEmptyActionColumn(table);
      }
        this.specialColumn
          .ngZone(vm.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()
            if (actionId == 'DELETE') {
              vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
            }
            if (actionId == 'EDIT_DETAIL') {
              this.idJobApp = data.id
              this.appType = data
              // vm.openModalFormAddPermit(vm.formAddDEPPermit, data.id)
            }
            if (actionId == "BIS") {
              if (data.jobApplicationNumber) {
                let nycUrl = "http://a810-bisweb.nyc.gov/bisweb/PermitQueryByNumberServlet?passjobnumber=" + data.jobApplicationNumber
                window.open(nycUrl, '_blank');
              }
            }
          })
         
      }
    });
    $('#dt-aplication-permit tbody').on('click', 'span', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      if($(this).hasClass('disabled')) {
        return
      }
      if ($(this).hasClass('delete-icon')) {
        vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
      }
      if ($(this).hasClass('edit-icon')) {
        vm.idJobApp = data.id
        vm.appType = data
        vm.openModalFormAddPermit(vm.formAddDEPPermit, data.id)
      }
    })
    $('#dt-aplication-permit tbody').on('click', 'td.clickable', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      if ($(this).hasClass('clickable')) {
        vm.idJobApp = data.id
        vm.appType = data
        if(!vm.isCustomerLoggedIn) {
          vm.openModalFormAddPermit(vm.formAddDEPPermit, data.id)
        }
      }
    });
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
   * This method will delete work permit
   * @method delete
   * @param {number} id ID of work pemit 
   * @param {any} row WorkPermit Row 
   */
  private delete(id: number, row: any): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.jobApplicationServices.deleteWorkPermit(id).subscribe(r => {
        this.reload()
        resolve(null)
      }, e => {
        reject()
      })
    })
  }

  /**
   * This method will search permit
   * @method searchPermit
   * @param {string} searchpermit Search Criteria 
   */
  searchPermit(searchpermit: string) {
    this.table.search(searchpermit).draw()
  }

  /**
   * This method will open Add permit model
   * @method _openModalFormAddPermit
   * @param {any} template TemplateRef Object
   */
  private _openModalFormAddPermit(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-add-permit', backdrop: 'static', 'keyboard': false })
  }

  /**
   * This method will open Add permit model
   * @method openModalFormAddPermit
   * @param {any} template TemplateRef Object
   * @param {number} id? Id of permit
   */
  openModalFormAddPermit(template: TemplateRef<any>, id?: number) {
    if (!id) {
      this.idJobAppPermit = 0
      this.isNew = false
    } else {
      this.isNew = true
    }
    this._openModalFormAddPermit(template)
  }

  /**
   * This method will open popup for upload permit
   * @method openModalUploadPermit
   * @param {any} template TemplateRef Object
   */
  private openModalUploadPermit(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-upload-permit', backdrop: 'static', 'keyboard': false })
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
                }
                else {
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
}