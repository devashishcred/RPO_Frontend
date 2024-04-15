import {
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import { ToastrService } from "ngx-toastr";
import { AppComponent } from "../../../../app.component";
import { StatesServices } from "../../../states/states.services";
import { Router } from "@angular/router";
import { cloneDeep, intersectionBy, identity, pickBy, assign } from "lodash";
import { ActivatedRoute } from "@angular/router";
import { JobServices } from "../../job.services";
import { UserRightServices } from "../../../../services/userRight.services";
import { constantValues, SharedService } from "../../../../app.constantValues";
import { JobViolationServices } from "./jobViolation.service";
import { JobSharedService } from "../../JobSharedService";
import { Message } from "../../../../app.messages";

declare const $: any;
import "jquery-ui/ui/widgets/datepicker.js";
import "jquery-ui/themes/base/datepicker.css";
import "jquery-ui/themes/base/theme.css";
import { LocalStorageService } from "../../../../services/local-storage.service";

/**
 * This component contains all function that are used in Job Violation
 * @class JobViolationComponent
 */
@Component({
  templateUrl: "./jobViolation.component.html",
  styleUrls: ["./jobViolation.component.scss"],
})
export class JobViolationComponent implements OnInit, OnDestroy {
  /**
   * formAddViolation add/edit form
   * @property formAddViolation
   */
  @ViewChild("formAddViolation", {static: true})
  private formAddViolation: TemplateRef<any>;

  /**
   * formAddDobViolation add/edit form
   * @property formAddDobViolation
   */
  @ViewChild('formAddDobViolation', {static: true})
  private formAddDobViolation: TemplateRef<any>

  /**
   * FormAddDobSafetyViolation add/edit form
   * @property FormAddDobSafetyViolation
   */
  @ViewChild('formAddDobSafetyViolation', {static: true})
  private formAddDobSafetyViolation: TemplateRef<any>

  /**
   * addTimeNote add/edit form
   * @property addTimeNote
   */
  @ViewChild('addTimeNote', {static: true})
  private addTimeNote: TemplateRef<any>

  /**
   * explainationCharges add/edit form
   * @property explainationCharges
   */
  @ViewChild('explainationCharges', {static: true})
  private explainationCharges: TemplateRef<any>

  /**
   * addtransmittal add/edit form
   * @property addtransmittal
   */
  @ViewChild('addtransmittal', {static: true})
  private addtransmittal: TemplateRef<any>

  /**
   *  progressionnote add/edit form
   * @property progressionnote
   */
  @ViewChild('progressionnote', {static: true}) progressionNote: TemplateRef<any>

  /**
   *  viewViolation add/edit form
   * @property viewViolation
   */
  @ViewChild('viewViolation', {static: true})
  private viewViolation: TemplateRef<any>

  /**
   *  viewEcbFromDobViolation add/edit form
   * @property viewEcbFromDobViolation
   */
  @ViewChild('viewEcbFromDobViolation', {static: true})
  private viewEcbFromDobViolation: TemplateRef<any>

  modalRef: BsModalRef
  isNew: boolean = true
  loading: boolean = false
  private table: any
  private filter: any
  private specialColumn: any
  idViolation: number
  idJob: number
  search: string
  showJobViolation: string = 'hide'
  showAddJobViolation: string = 'hide'

  public showDeleteJobViolation: string = 'hide'
  public showAddDOBJobViolation: string = 'hide'
  public showDeleteDOBJobViolation: string = 'hide'
  public showDOBJobViolation: string = 'hide'
  public showAddDOBSafetyJobViolation: string = 'hide'
  public showDeleteDOBSafetyJobViolation: string = 'hide'
  public showDOBSafetyJobViolation: string = 'hide'
  private sub: any
  jobDetail: any
  btnShowHide: string = 'show'
  private editor: any;
  private errorMsg: any
  modalRefJob: BsModalRef
  violationData: any
  highlighted: any
  isDob: any

  isSafety: any
  public violationOptions: any[] = [];
  public violationType: string = '';
  aothColumns = [];
  dobColumns = [];
  dobSafetyColumns = [];
  apiUrl: string = 'api/jobviolations'
  isCustomerLoggedIn: boolean = false;

  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private zone: NgZone,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private jobViolationServices: JobViolationServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private route: ActivatedRoute,
    private jobServices: JobServices,
    private jobSharedService: JobSharedService,
    private sharedService: SharedService,
    private message: Message,
    private localStorageService: LocalStorageService
  ) {
    this.errorMsg = this.message.msg

    // ECB
    this.showJobViolation = this.userRight.checkAllowButton(this.constantValues.VIEWECBVIOLATION)
    this.showAddJobViolation = this.userRight.checkAllowButton(this.constantValues.ADDEDITVIOLATION)
    this.showDeleteJobViolation = this.userRight.checkAllowButton(this.constantValues.DELETEECBVIOLATION)
    if (this.showJobViolation != 'hide') {
      // this.violationOptions.splice(0, 1)
      this.violationOptions.push({id: 'AOTH Violation', label: 'ECB/OATH Violations'})
      this.violationType = "AOTH Violation"
    }

    // DOB 
    this.showDOBJobViolation = this.userRight.checkAllowButton(this.constantValues.VIEWDOBVIOLATION)
    this.showDeleteDOBJobViolation = this.userRight.checkAllowButton(this.constantValues.DELETEDOBVIOLATION)
    this.showAddDOBJobViolation = this.userRight.checkAllowButton(this.constantValues.ADDEDITDOBVIOLATION)
    console.log('showDOBJobViolation', this.showDOBJobViolation)
    if (this.showDOBJobViolation != 'hide') {
      // this.violationOptions.splice(1, 1)
      this.violationOptions.push({id: 'DOB Violation', label: 'DOB Violations'})
      if (!this.violationType) {
        this.violationType = "DOB Violation"
      }
    }

    // DOB Safety
    this.showAddDOBSafetyJobViolation = this.userRight.checkAllowButton(this.constantValues.ADDEDITDOBSAFETYVIOLATION)
    this.showDeleteDOBSafetyJobViolation = this.userRight.checkAllowButton(this.constantValues.DELETEDOBSAFETYVIOLATION)
    this.showDOBSafetyJobViolation = this.userRight.checkAllowButton(this.constantValues.VIEWDOBSAFETYVIOLATION)
    if (this.showDOBSafetyJobViolation != 'hide') {
      // this.violationOptions.splice(2, 1)
      this.violationOptions.push({id: 'DOB Safety Violation', label: 'DOB Safety Violations'})
      if (!this.violationType) {
        this.violationType = "DOB Safety Violation"
      }
    }
    console.log('showDOBSafetyJobViolation', this.showDOBSafetyJobViolation)

    if (!this.violationType) {
      return
    }
    this.sub = this.route.parent.params.subscribe(params => {
      this.idJob = +params['id']; // (+) converts string 'id' to a number
      console.log('idJob', this.idJob)
    });
    const queryParams = this.route.snapshot.queryParams;
    this.highlighted = queryParams['highlighted'];
    this.isDob = queryParams['isDob'];
    this.isSafety = queryParams['isSafety'];
    if (this.isDob) {
      this.violationType = "DOB Violation";
    }
    if (this.isSafety) {
      this.violationType = "DOB Safety Violation";
    }
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
    // if (this.isCustomerLoggedIn) {
    //   let isECBViolation = this.userRight.checkAllowButton(this.constantValues.VIEWECBVIOLATION) == 'show' ? true : false
    //   let isDOBViolation = this.userRight.checkAllowButton(this.constantValues.VIEWDOBVIOLATION) == 'show' ? true : false
    //   let isDOBSafetyViolation = this.userRight.checkAllowButton(this.constantValues.VIEWDOBSAFETYVIOLATION) == 'show' ? true : false
    //   if (isDOBViolation == false || isECBViolation == false) {
    //     if (isDOBViolation) {
    //       this.violationOptions.splice(this.violationOptions.findIndex(a => a.id === 'AOTH Violation'), 1);
    //       this.violationType = "DOB Violation";
    //     }
    //     if (isECBViolation) {
    //       this.violationOptions.splice(this.violationOptions.findIndex(a => a.id === 'DOB Violation'), 1);
    //       this.violationType = "AOTH Violation";
    //     }
    //   }
    // }
    console.log('highlighted', this.highlighted)
    if (this.highlighted && !this.jobDetail) {
      console.log('if con run')
      this.setDataIfJobDetail()
    }
    this.jobSharedService.getJobData().subscribe((data: any) => {
      this.jobDetail = data
      console.log('jobDetail', this.jobDetail)
      if (this.jobDetail == null) {
        if (
          this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
        ) {
          this.jobDetail = this.appComponent.getFromSessionStorage(
            this.constantValues.JOBOBECT
          );
          this.setDataIfJobDetail();
        } else {
          this.setDataIfJobDetail();
        }
      } else {
        this.setDataIfJobDetail();
      }
    })
    this.sharedService.getJobStatus.subscribe((data: any) => {
      if (data == 'statuschanged') {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
          this.setDataIfJobDetail()
        }
      }
    }, (e: any) => {
    })


  }

  initializeData() {
    if (this.violationType === 'AOTH Violation') {
      this.specialColumn = new $.fn.dataTable.SpecialColumn([
        {
          id: 'OATH',
          title: 'OATH',
          customClass: 'show'
        },
        {
          id: 'BIS',
          title: 'BIS',
          customClass: 'bis'
        },
        {
          id: 'DELETE',
          title: 'Delete Violation',
          customClass: this.showDeleteJobViolation || this.isCustomerLoggedIn ? 'delete-violation' : '',
        }
      ], false)
      this.aothColumns = [
        {
          title: 'ISSUE DATE',
          data: 'dateIssued',
          class: 'viewViolationClicked maxWidth-150',
          width: '90px'
        },
        {
          title: 'ECB Violation #',
          data: 'summonsNumber',
          class: 'viewViolationClicked maxWidth-150',
          // width: 150
        },
        {
          title: 'Issuing Agency',
          data: 'issuingAgency',
          class: 'viewViolationClicked maxWidth-150',
          // width: 150
        },
        {
          title: 'Violation Description',
          data: 'violationDescription',
          class: 'viewViolationClicked maxWidth-400 minWidth-180',
          // render: function (data: any, type: any, dataToSet: any) {
          //   if (data == null || data == "null") {
          //     return "-"
          //   } else {
          //     return `<div class="long-text">${data ? data : '-'}</div>`
          //   }
          // },
        },
        {
          title: 'Respondent Name',
          data: 'respondentName',
          class: 'viewViolationClicked maxWidth-175',
        },
        {
          title: 'HEARING DATE',
          data: 'hearingDate',
          class: 'hearing',
          width: 140,
          orderDataType: "dom-text", // for sorting in html
          visible: !this.isCustomerLoggedIn,
          render: function (data: any, type: any, dataToSet: any) {
            return '<div datetime-picker class="inner-addon right-addon input-group"><i class="icon material-symbols-outlined clickable datepickerbutton">event</i><input style="width:100%; padding-left: 5px;" type="text" class="mydatepicker form-control hearing" data-id=' + dataToSet.id + '  data-hearingtype=' + "hearing" + ' placeholder="MM/DD/YYYY" value=' + (dataToSet.hearingDate != null ? dataToSet.hearingDate : '') + '>' + '</div>'
          }
        },
        {
          title: 'HEARING Status',
          data: 'statusOfSummonsNotice',
          class: 'viewViolationClicked min-auto',
          visible: !this.isCustomerLoggedIn,
        },
        {
          title: 'Penalty Imposed ($)',
          data: 'paneltyAmount',
          class: 'viewViolationClicked' + this.isCustomerLoggedIn ? 'maxWidth-185 text-right' : 'min-auto text-right',

          // class: 'clickable min-auto text-right',
        },
        {
          title: 'Balance Due ($)',
          data: 'balanceDue',
          class: 'viewViolationClicked text-right maxWidth-100',
          width: 130
          // visible: !this.isCustomerLoggedIn
          // class: 'clickable min-auto text-right',
        },
        {
          title: 'Certification Status',
          data: 'certificationStatus',
          class: 'viewViolationClicked min-auto',
          visible: !this.isCustomerLoggedIn,
          render: function (data: any, type: any, dataToSet: any) {
            return data
          },
        },
        this.specialColumn
      ]
      this.apiUrl = 'api/jobviolations';
      document.title = 'Project - ' + this.idJob;
      this.filter = {} as any
      this.filter.idJob = this.idJob

      $.fn.dataTable.ext.order['dom-text'] = function (settings: any, col: any) {
        return this.api().column(col, {order: 'index'}).nodes().map(function (td: any, i: any) {
          return $('input', td).val();
        });
      }

      /* Create an array with the values of all the select options in a column */
      $.fn.dataTable.ext.order['dom-select'] = function (settings: any, col: any) {
        return this.api().column(col, {order: 'index'}).nodes().map(function (td: any, i: any) {
          return $('select', td).val();
        });
      }

      this.reload = this.reload.bind(this)
      this.delete = this.delete.bind(this)
      setTimeout(() => {
        this.getData()
      }, 1000);
    } else if (this.violationType === 'DOB Violation') {
      this.specialColumn = new $.fn.dataTable.SpecialColumn([
        {
          id: 'BIS',
          title: 'BIS',
          customClass: ''
        },
        {
          id: 'DELETE',
          title: 'Delete Violation',
          customClass: this.showDeleteJobViolation
        }
      ], false)
      this.dobColumns = [
        {
          title: 'ISSUE DATE',
          data: 'dateIssued',
          class: 'viewViolationClicked maxWidth-150',
          width: '90px'
        },
        {
          title: 'DOB Violation #',
          data: 'summonsNumber',
          class: 'viewViolationClicked maxWidth-150',
        },
        {
          title: 'Related ECB#',
          data: 'ecbNumber',
          class: 'relatedEcb maxWidth-150',
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet?.ecbNumber == null || !dataToSet?.ecbNumber) {
              return "-"
            } else {
              return `<a>${dataToSet?.ecbNumber}</a>`
            }
          },
        },
        {
          title: 'Violation Description',
          data: 'violationDescription',
          class: 'viewViolationClicked maxWidth-400 minWidth-180',
          // width: 380,
          // render: function (data: any, type: any, dataToSet: any) {
          //   if (data == null || data == "null") {
          //     return "-"
          //   } else {
          //     return `<div class="long-text">${data ? data : '-'}</div>`
          //   }
          // },
        },
        {
          title: 'Device Number',
          data: 'deviceNumber',
          class: 'viewViolationClicked maxWidth-150',
        },
        {
          title: 'Violation Category',
          data: 'violationCategory',
          class: 'viewViolationClicked min-auto ' + this.isCustomerLoggedIn ? 'text-left maxWidth-200' : '',
        },
        {
          title: 'Party Responsible',
          data: 'partyResponsible',
          visible: this.isCustomerLoggedIn ? false : true,
          class: 'viewViolationClicked min-auto ' + this.isCustomerLoggedIn ? 'text-left' : '',
          render: function (data: any, type: any, dataToSet: any) {
            console.log(dataToSet)
            let responsibleParty = '';
            if (dataToSet?.partyResponsible == '3') {
              responsibleParty = 'Other'
            } else if (dataToSet?.partyResponsible == '1') {
              responsibleParty = 'RPO'
              // responsibleParty = 'RPO Team'
            } else {
              responsibleParty = '-'
            }
            return responsibleParty
          },
        },
        this.specialColumn
      ]
      this.apiUrl = 'api/JobDOBViolations';
      document.title = 'Project - ' + this.idJob;
      this.filter = {} as any
      this.filter.idJob = this.idJob

      this.reload = this.reload.bind(this)
      this.delete = this.delete.bind(this)
      setTimeout(() => {
        this.getData()
      }, 1000);
    } else if (this.violationType === 'DOB Safety Violation') {
      this.specialColumn = new $.fn.dataTable.SpecialColumn([
        {
          id: 'DELETE',
          title: 'Delete Violation',
          customClass: this.showDeleteJobViolation
        }
      ], false)
      this.dobSafetyColumns = [
        {
          title: 'ISSUE DATE',
          data: 'dateIssued',
          class: 'viewViolationClicked maxWidth-150',
          width: '90px'
        },
        {
          title: 'Violation #',
          data: 'summonsNumber',
          class: 'viewViolationClicked maxWidth-150',
        },
        {
          title: ' Violation Type',
          data: 'violation_type',
          class: 'viewViolationClicked maxWidth-150',
        },
        {
          title: 'Violation Description',
          data: 'violationDescription',
          class: 'viewViolationClicked maxWidth-400 minWidth-180',
        },
        {
          title: 'Device Type',
          data: 'device_type',
          class: 'viewViolationClicked maxWidth-150',
        },
        {
          title: 'Device Number',
          data: 'deviceNumber',
          class: 'viewViolationClicked maxWidth-150',
        },
        {
          title: 'Violation Status',
          data: 'violation_status',
          class: 'text-left viewViolationClicked',
        },
        {
          title: 'Party Responsible',
          data: 'partyResponsible',
          visible: this.isCustomerLoggedIn ? false : true,
          class: 'viewViolationClicked min-auto ' + this.isCustomerLoggedIn ? 'text-left' : '',
          render: function (data: any, type: any, dataToSet: any) {
            console.log(dataToSet)
            let responsibleParty = '';
            if (dataToSet?.partyResponsible == '3') {
              responsibleParty = 'Other'
            } else if (dataToSet?.partyResponsible == '1') {
              responsibleParty = 'RPO'
              // responsibleParty = 'RPO Team'
            } else {
              responsibleParty = '-'
            }
            return responsibleParty
          },
        },
        this.specialColumn
      ]
      this.apiUrl = 'api/JobSafetyViolations';
      document.title = 'Project - ' + this.idJob;
      this.filter = {} as any
      this.filter.idJob = this.idJob

      this.reload = this.reload.bind(this)
      this.delete = this.delete.bind(this)
      setTimeout(() => {
        this.getData()
      }, 1000);
    }
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.initializeData()
  }

  getData() {
    console.log('run getdata')
    const vm = this
    vm.table = $('#dt-company-types').DataTable({
      "order": [[0, 'desc'], [6, 'desc']],
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
      ajax: this.jobViolationServices.getRecords(this.apiUrl, {
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columnDefs: [
        {type: 'date-uk', targets: [0, 6]},//specify your date column number,starting from 0
      ],
      columns: this.violationType === 'AOTH Violation' ? this.aothColumns : this.violationType === 'DOB Violation' ? this.dobColumns : this.dobSafetyColumns,
      rowCallback: ((row: any, data: any, index: any) => {
        if (this.isCustomerLoggedIn) {
          $(row).find(".edit-icon").hide();
          $(row).find(".delete-icon").hide();
          $(row).find(".note-icon").hide();
          $(row).find(".delete-violation").hide();
          $(row).find('.more_vert').hide();
        }
        $(row).find('.note-icon').removeClass('hide');
        $(row).find('.delete-icon').hide();
        if (this.showAddJobViolation == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
        }
        if (this.showAddDOBSafetyJobViolation == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
        }
        if (this.showDeleteDOBSafetyJobViolation == 'hide') {
          $(row).find('.more_vert').hide();
        }
        if (data.issuingAgency == null || data.issuingAgency == '') {
          $(row).find('.bis').hide();
        } else if (data.issuingAgency != 'Dept Of Buildings' && data.issuingAgency != 'DEPT. OF BUILDINGS') {
          $(row).find('.bis').hide();
        }
        if (data.isFullyResolved) {
          $(row).addClass('low-opacity');
        } else {
          $(row).removeClass('low-opacity');
        }
        if (this.jobDetail?.status > 1) {
          $(row).find('select').attr("disabled", "disabled")
          $(row).find('input').attr("disabled", "disabled")
        } else {
          if (data.isFullyResolved) {
            $(row).find("input.resolvedate").removeAttr("disabled");
          } else {
            $(row).find("input.resolvedate").attr("disabled", "disabled");
          }
          $(row).find("input.hearing").removeAttr("disabled");
          $(row).find("select").removeAttr("disabled");
        }
      }),
      drawCallback: function () {
        if (vm.btnShowHide == "hide") {
          $(".select-column").hide();
        } else {
          $(".select-column").show();
        }

        $(".mydatepicker").datepicker({
          todayBtn: true,
          autoclose: true,
          changeMonth: true,
          changeYear: true,
          onSelect: function (dateText: any, row: any) {
            if ($(this)[0].dataset && $(this)[0].dataset.hearingtype) {
              vm.jobViolationServices.setHearingDate($(this)[0].dataset.id, dateText).subscribe((r: any) => {
                vm.toastr.success(vm.errorMsg.hearingDate);
              }, (e: any) => {
              })
            } else {
              vm.jobViolationServices.setResolveDate($(this)[0].dataset.id, dateText).subscribe((r: any) => {
                vm.toastr.success(vm.errorMsg.resolveDate);
              }, (e: any) => {
              })
            }

          }
        }).keydown(function (e: any) {
          event.preventDefault();
        });


      },

      initComplete: () => {
        if (vm.isCustomerLoggedIn) {
          const table = $('#dt-company-types').DataTable();
          vm.setPermissionForEmptyActionColumn(table);
        }
        if (vm.highlighted) {
          vm.search = vm.highlighted;
          vm.searchStates(vm.search);
        }
        $("#dt-company-types tbody").on(
          "click",
          "td.clickable",
          function (ev: any) {
            const row = vm.table.row($(this).parents("tr"));
            const data = row.data();
            if ($(this).hasClass("clickable")) {
              vm.openExplainationCharges(vm.explainationCharges, data.id);
            }
          }
        );
        $("#dt-company-types tbody").on(
          "click",
          "td.viewViolationClicked,td.relatedEcb",
          function (ev: any) {
            const row = vm.table.row($(this).parents("tr"));
            const data = row.data();
            if ($(this).hasClass("viewViolationClicked")) {
              vm.idViolation = data.id;
              vm.openViolationViewModal(vm.viewViolation);
            } else if ($(this).hasClass("relatedEcb")) {
              console.log(" i am running", data);
              vm.idViolation = data.ecbNumber;
              vm.openViolationViewModal(vm.viewEcbFromDobViolation);
            }
          }
        );
        $(function () {
          $(".mydatepicker")
            .datepicker({
              format: {
                toDisplay: function (date: any, format: any, language: any) {
                  let date1 = new Date(date),
                    month = "" + (date1.getMonth() + 1),
                    day = "" + date1.getDate(),
                    year = date1.getFullYear().toString().substr(-2);

                  if (month.length < 2) month = "0" + month;
                  if (day.length < 2) day = "0" + day;
                  return [month, day, year].join("/");
                },
                toValue: function (date: any, format: any, language: any) {
                  let date2 = new Date(date),
                    month = "" + (date2.getMonth() + 1),
                    day = "" + date2.getDate(),
                    year = date2.getFullYear();

                  if (month.length < 2) month = "0" + month;
                  if (day.length < 2) day = "0" + day;

                  return [month, year, day].join("/");
                },
              },
              todayBtn: true,
              autoclose: true,
              changeMonth: true,
              changeYear: true,
              // minDate: 0 ,
              onSelect: function (dateText: any) {
                if ($(this)[0].dataset && $(this)[0].dataset.hearingtype) {
                  vm.jobViolationServices
                    .setHearingDate($(this)[0].dataset.id, dateText)
                    .subscribe(
                      (r: any) => {
                        vm.toastr.success(vm.errorMsg.hearingDate);
                      },
                      (e: any) => {
                      }
                    );
                } else {
                  vm.jobViolationServices
                    .setResolveDate($(this)[0].dataset.id, dateText)
                    .subscribe(
                      (r: any) => {
                        vm.toastr.success(vm.errorMsg.resolveDate);
                      },
                      (e: any) => {
                      }
                    );
                }
              },
            })
            .keydown(function (e: any) {
              event.preventDefault();
            });
        });
        this.specialColumn
          .ngZone(this.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data();
            if (actionId == "EDIT") {
              vm.isNew = false;
              vm.idViolation = data.id;
              vm.idJob = data.idJob;
              vm.openModalForm(vm.formAddViolation, data.id, false);
            }
            if (actionId == "DELETE") {
              this.appComponent.showDeleteConfirmation(this.delete, [
                data.id,
                row,
              ]);
            }
            if (actionId == "BIS") {
              if (vm.violationType === "AOTH Violation") {
                window.open(`https://a810-bisweb.nyc.gov/bisweb/ECBQueryByNumberServlet?requestid=2&ecbin=${data.summonsNumber}`, '_blank');
              } else {
                window.open(`https://a810-bisweb.nyc.gov/bisweb/ActionViolationDisplayServlet?requestid=5&allbin=${data.binNumber}&allinquirytype=BXS3OCV4&allboroughname=&allstrt=&allnumbhous=&allisn=${data.isnViolation}&ppremise60=${data.summonsNumber}`, '_blank');
              }
            }
            if (actionId == "OATH") {
              window.open(
                "http://a820-ecbticketfinder.nyc.gov/getViolationbyID.action?searchViolationObject.violationNo=0" +
                data.summonsNumber +
                "&searchViolationObject.searchOptions=All&submit=Search&searchViolationObject.searchType=violationNumber",
                "_blank"
              );
            }
            if (actionId == "TIMENOTE") {
              vm.openModalTimeNote(this.addTimeNote);
            }
            if (actionId == "TRANSMITTAL") {
              vm.openCreateTransmittalModal(vm.addtransmittal);
            }
            if (actionId == "ADD_PROGRESSION_NOTE") {
              vm.idViolation = data.id;
              vm.openViolationProgressionModalForm(vm.progressionNote);
            }
          });

        $("#dt-company-types ").on("change", "select", function (e: any) {
          let id: number = 0
          let statusChange: string = ''
          if ($(e.target).attr('data-id')) {
            id = $(e.target).attr('data-id')
            status = $(e.target).val()
            vm.jobViolationServices.setFullyResolved(id, status).subscribe((r: any) => {
              vm.reload()
              vm.toastr.success(vm.errorMsg?.status);
            }, (e: any) => {

            })
          }
        });

        $('#dt-company-types tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('disabled')) {
            return
          }
          if ($(this).hasClass('delete-icon')) {
            vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
          }
          if ($(this).hasClass('edit-icon')) {
            console.log('run')
            vm.isNew = false
            vm.idViolation = data.id
            vm.idJob = data.idJob
            console.log('isNew', vm.isNew)
            console.log('idViolation', vm.idViolation)
            console.log('idJob', vm.idJob)
            if (vm.violationType === 'AOTH Violation') {
              vm.openModalForm(vm.formAddViolation, data.id, false)
            } else if (vm.violationType === 'DOB Violation') {
              vm.openModalForm(vm.formAddDobViolation, data.id, false)
            } else if (vm.violationType === 'DOB Safety Violation') {
              vm.openModalForm(vm.formAddDobSafetyViolation, data.id, false)
            }
          }
          if ($(this).hasClass('note-icon')) {
            vm.idViolation = data.id
            vm.openViolationProgressionModalForm(vm.progressionNote)
          }
        })

      }
    })
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
   * This method is used to open modal popup for Explaination of charges
   * @method openExplainationCharges
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   * @param {boolean} isNew it is optional which contains true if it is new record and false when it is old record
   */
  private openExplainationCharges(
    template: TemplateRef<any>,
    id?: number,
    isNew?: boolean
  ) {
    if (id) {
      this.jobViolationServices.getById(id).subscribe(
        (r) => {
          this.violationData = r;
          if (r.explanationOfCharges && r.explanationOfCharges.length > 0) {
            this.modalRefJob = this.modalService.show(template, {
              class: "modal-job modal-explanation-charges",
              backdrop: "static",
              keyboard: false,
            });
          } else {
            this.toastr.info(this.errorMsg.noExplainationCharges);
          }
        },
        (e) => {
        }
      );
    }
  }

  /**
   * This method will be destroy all elements and other values from whole module
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    $("#dt-company-types tbody").off("click");
    $("#dt-company-types").off("draw.dt");
  }

  /**
   * This method is used to open modal popup for Time note add
   * @method openModalTimeNote
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   */
  private openModalTimeNote(template: TemplateRef<any>, id?: number) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-edit-timenote",
      backdrop: "static",
      keyboard: false,
    });
  }

  /**
   * This method is used to open modal popup for sending transmittal
   * @method openCreateTransmittalModal
   * @param {any} template type which contains template of create/edit module
   */
  private openCreateTransmittalModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-add-transmittal",
      backdrop: "static",
      keyboard: false,
    });
  }

  /**
   * This method is used for filter/search records from datatable
   * @method searchStates
   * @param {string} srch type any which contains string that can be filtered from datatable
   */
  searchStates(srch: string) {
    this.table.search(srch).draw();
  }

  /**
   * This method is used to open modal popup for violation
   * @method openModalForm
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   * @param {boolean} isNew it is optional which contains true if it is new record and false when it is old record
   */
  openModalForm(
    template: TemplateRef<any>,
    id?: number,
    isNew?: boolean
  ) {
    console.log('template', template)
    if (isNew) {
      this.isNew = true;
      this.idViolation = 0;
    }
    this.modalRef = this.modalService.show(template, {
      class: "modal-contact",
      backdrop: "static",
      keyboard: false,
    });
  }

  /**
   * This method is used to open modal popup for openViolationProgressionModalForm
   * @method openViolationProgressionModalForm
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   */
  private openViolationProgressionModalForm(
    template: TemplateRef<any>,
    id?: number
  ) {
    if (!id) {
    }
    this.modalRef = this.modalService.show(template, {
      class: "modal-add-task",
      backdrop: "static",
      keyboard: false,
    });
  }

  /**
   * This method is used to open modal popup for openViolationProgressionModalForm
   * @method openViolationViewModal
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   */
  private openViolationViewModal(template: TemplateRef<any>) {
    if (!this.isCustomerLoggedIn) {
      this.modalRef = this.modalService.show(template, {class: 'modal-add-task', backdrop: 'static', 'keyboard': false})
    }
  }


  /**
   * This method set job detail
   * @method setDataIfJobDetail
   */
  setDataIfJobDetail() {
    console.log('setDataIfJobDetail run', this.jobDetail)
    // if(this.jobDetail) {
    //   this.jobSharedService.setJobData(this.jobDetail);
    // }
    if (this.jobDetail == null) {
      this.jobServices.getJobDetailById(this.idJob, true).subscribe(r => {
        this.jobDetail = r
        console.log('from db', this.jobDetail)
        this.jobSharedService.setJobData(r);
        this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, r);
        // this.isJobDetail = true
        if (this.jobDetail.status > 1) {
          $('.select-column').hide()
          this.btnShowHide = 'hide'
        } else {
          $('.select-column').show()
          this.btnShowHide = 'show'
          $('#dt-company-types > tbody > tr').each(function (row: any) {
            $(this).find('td select').each(function () {
              $(this).removeAttr("disabled", "disabled")
            })
            $(this).find('td input').each(function () {
              $(this).removeAttr("disabled", "disabled")
            })
          });
        }
      })
    }
    if (this.jobDetail) {
      // this.isJobDetail = true
      if (this.jobDetail.status > 1) {
        $(".select-column").hide();
        this.btnShowHide = "hide";
      } else {
        $(".select-column").show();
        this.btnShowHide = "show";
        $("#dt-company-types > tbody > tr").each(function (row: any) {
          $(this)
            .find("td select")
            .each(function () {
              $(this).removeAttr("disabled", "disabled");
            });
          $(this)
            .find("td input")
            .each(function () {
              $(this).removeAttr("disabled", "disabled");
            });
        });
      }
    }
  }

  /**
   * This method is used to reload datatable
   * @method reload
   */
  reload() {
    this.table.clearPipeline();
    this.table.ajax.reload();
  }

  /**
   * This method is used to delete record
   * @method delete
   * @param {number} id type which contains id to delete record
   * @param {any} row type which contains entire selected row
   */
  delete(id: number, row: any) {
    return new Promise((resolve, reject) => {
      if (this.violationType === 'AOTH Violation') {
        this.jobViolationServices.delete(id).subscribe(r => {
          row.delete()
          resolve(r)
        }, e => {
          reject()
        })
      } else if (this.violationType === 'DOB Violation') {
        this.jobViolationServices.deleteDob(id).subscribe(r => {
          row.delete()
          resolve(r)
        }, e => {
          reject()
        })
      } else if (this.violationType === 'DOB Safety Violation') {
        this.jobViolationServices.deleteDobSafety(id).subscribe(r => {
          row.delete()
          resolve(r)
        }, e => {
          reject()
        })
      }
    })
  }

  onSelectViolationType() {
    console.log('this.violationType', this.violationType)
    if(this.highlighted) {
      this.search = "";
      this.highlighted = "";
      this.isSafety = false;
      this.isDob = false;
    }
    this.table.destroy();
    $('#dt-company-types').empty();
    this.initializeData();
  }

  async fetchViolation() {
    this.loading = true;
    try {
      // let type = this.violationType == "AOTH Violation" ? "ECB" : "DOB"
      let type = ""
      if (this.violationType == 'AOTH Violation') {
        type = "ECB"
      } else if (this.violationType == 'DOB Violation') {
        type = "DOB"
      } else if (this.violationType == 'DOB Safety Violation') {
        type = "DOB Safety"
      }
      await this.jobViolationServices.runCronJob(type, this.jobDetail.binNumber)
      this.toastr.success("Fetch Violations Successfully!")
      this.reload()
      this.loading = false;
    } catch (err) {
      this.toastr.error(err);
      this.loading = false;
    }
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

}
