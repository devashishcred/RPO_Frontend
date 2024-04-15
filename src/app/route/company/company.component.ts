import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { cloneDeep, identity, pickBy, assign, merge } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';

import { AppComponent } from '../../app.component';
import { AddressTypeServices } from '../../services/addressType.services';
import { CityServices } from '../../services/city.services';
import { StateServices } from '../../services/state.services';
import { AddressType } from '../../types/address';
import { Address } from '../../types/address';
import { City } from '../../types/city';
import { Company, CompanyType } from '../../types/company';
import { State } from '../../types/state';
import { equals } from '../../utils/utils';
import { CompanyServices } from './company.services';
import { Message } from '../../app.messages';
import { Contact } from '../../types/contact';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues, SharedService } from '../../app.constantValues';
import { Job } from '../../types/job';
import * as _ from 'underscore';
import * as moment from 'moment';
import { convertUTCDateToLocalDate } from '../../utils/utils';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../app.constants';

declare const $: any

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})
/**
 * This component contains all function that are used in this component
 * @class CompanyComponent
 */
export class CompanyComponent implements OnInit, OnDestroy {
  private pdfBtn: any
  private excelBtn: any
  //Company show hide
  showCompanyAddBtn: string = 'hide'
  private showCompanyViewBtn: string = 'hide'
  private showCompanyDeleteBtn: string = 'hide'
  showCompanyExportBtn: string = 'hide'
  //Conact show hide
  private showContactAddBtn: string = 'hide'
  private showContactViewBtn: string = 'hide'
  private showContactDeleteBtn: string = 'hide'
  //Rfp show hide
  private showRfpAddBtn: string = 'hide'
  private showRfpViewBtn: string = 'hide'
  private showRfpDeleteBtn: string = 'hide'
  //Job show hide
  private showJobAddBtn: string = 'hide'
  private showJobViewBtn: string = 'hide'
  private showJobDeleteBtn: string = 'hide'
  //Task show hide
  private showTaskAddBtn: string = 'hide'
  private showTaskViewBtn: string = 'hide'
  private showTaskDeleteBtn: string = 'hide'
  //Master show hide
  private showMasterAddBtn: string = 'hide'
  private showMasterViewBtn: string = 'hide'
  private showMasterDeleteBtn: string = 'hide'

  private userAccessRight: any = {}
  tmpCmpType: any = []
  showApplyClearButtons: boolean = false;
  isFiltered = false;
  fromPagination: boolean;

  /**
   * Get info form
   * @property getinfo
   */
  @ViewChild('getinfo', {static: true})
  private getinfo: TemplateRef<any>

  /**
   * Form for Company Add/Edit
   * @property formCompany
   */
  @ViewChild('formCompany', {static: true})
  private formCompany: TemplateRef<any>

  /**
   * Form for Contact Add/Edit
   * @property formContact
   */
  @ViewChild('formContact', {static: true})
  private formContact: TemplateRef<any>

  /**
   * Form for Task Add/Edit
   * @property addtask
   */
  @ViewChild('addtask', {static: true})
  private addtask: TemplateRef<any>

  /**
   * Form for Progression Note Add/Edit
   * @property progressionnote
   */
  @ViewChild('progressionnote', {static: true})
  progressionNote: TemplateRef<any>

  /**
   * Form for Job Add/Edit
   * @property formJob
   */
  @ViewChild('formJob', {static: true})
  private formJob: TemplateRef<any>

  /**
   * Form for Send Email
   * @property sendemail
   */
  @ViewChild('sendemail', {static: false})
  private sendemail: TemplateRef<any>
  jobOfContact: Job
  private selectUndefinedOptionValue: any;
  modalRef: BsModalRef
  private new: boolean = true
  isConsulting: boolean = true
  rec: Company
  contactRec: Contact
  private address: Address
  private idxAddress: number = -1
  private specialColumn: any
  private filter: any = {}
  private companyName: string = "Filer Company"
  private table: any
  private fulltabledata: any = [];
  private newDataArray: any = [];
  private resultss: any = [];
  private firstTime: boolean = true;
  private companyList: any = []
  private ourt: any = []
  dropdownList: any = [];
  private tmpComType: CompanyType[] = [];
  private companyType: any = []
  private tmpSelectFilter: any = []
  dropdownSettings: any = {};
  idCompany: number
  private globalSearchType: number
  private globalSearchText: string
  private errorMsg: any
  loading: boolean = false
  private checkPermission: boolean = false
  frommodeule: string
  private companyUrl = API_URL + 'api/CompanyListPost';
  filterCompanies: any;
  localSearch: boolean;
  localSearchText: string;
  srch: any;
  flager: any;
  contactDetail: any;

  /**
   * This method define all services that requires in whole class
   * @method constructor
   */
  constructor(
    private router: Router,
    private zone: NgZone,
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private addressTypeServices: AddressTypeServices,
    private stateServices: StateServices,
    private cityServices: CityServices,
    private companyServices: CompanyServices,
    private message: Message,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private route: ActivatedRoute,
    private http: HttpClient,
    private sharedService: SharedService
  ) {
    this.errorMsg = this.message.msg;
    this.companyList[0] = "Select All";
    this.companyList[1] = "Home Owners";
    this.companyList[2] = "Owner's REP";
    this.companyList[3] = "Engineer";
    this.companyList[4] = "Architect";
    this.companyList[5] = "Asbestos Investigator";
    this.companyList[6] = "DOB";
    this.companyList[7] = "DOT";
    this.companyList[8] = "DEP";
    this.companyList[9] = "FDNY";
    this.companyList[10] = "ECB";
    this.companyList[11] = "SCA";
    this.companyList[12] = "SBS";
    this.companyList[13] = "State Agencies";
    this.companyList[14] = "Property Managers";
    this.companyList[15] = "Developers";
    this.companyList[16] = "Consultants";
    this.companyList[17] = "Lobbyist";
    this.companyList[18] = "Special Inspection";
    this.companyList[19] = "1/2/3 Family";
    this.companyList[20] = "Safety Reg";
    this.companyList[21] = "Demolition";
    this.companyList[22] = "Construction";
    this.companyList[23] = "Concrete";
  }

  /**
   * This method will call when form loads first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.loading = true
    document.title = 'Company'
    this.permission(this.constantValues)

    this.companyServices.getCompanyTypesDD().subscribe(r => {
      this.dropdownList = _.sortBy(r, 'itemName');
    });

    this.filter.companyType = []
    this.dropdownSettings = {
      singleSelection: false,
      text: "Company Types",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: false,
      classes: "myclass custom-class",
      badgeShowLimit: 1,
    };
    this.pdfBtn = $.fn.dataTable.button({
      extend: 'pdfHtml5',
      filename: 'Companies',
      title: 'Companies',
      visible: false,
      exportOptions: {
        columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      }
    })

    /* clearing local filter on routing to other route */
    this.router.events.subscribe(rEvent => {
      if (rEvent instanceof NavigationStart && !(rEvent.url.includes('company')))
        this.sharedService.contactLocalFilter = undefined;
    })

    this.excelBtn = $.fn.dataTable.button({
      extend: 'excelHtml5',
      filename: 'Companies',
      visible: false,
      title: 'Companies',
      exportOptions: {
        columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      }
    })

    if (this.sharedService.companyLocalFilter && (this.sharedService.companyLocalFilter.searchText || this.sharedService.companyLocalFilter.filter)) {
      if (this.sharedService.companyLocalFilter.searchText) {
        this.srch = this.sharedService.companyLocalFilter.searchText;
        this.tmpCmpType = null
        this.loadDataTable('search').then(() => {
          this.table.search(this.srch).draw()
          this.sharedService.companyLocalFilter = undefined;
        })
      }
      if (this.sharedService.companyLocalFilter.filter) {
        this.tmpCmpType = this.sharedService.companyLocalFilter.filter;
        this.loadDataTable("filter").then(() => {
          this.tmpCmpType = this.sharedService.companyLocalFilter.filter;
          this.sharedService.companyLocalFilter = undefined;
        });
      }
    } else {
      if (this.sharedService.companyLocalFilter) {
        this.tmpCmpType = this.sharedService.companyLocalFilter.filter || [];
      }

      this.loadDataTable()
    }

    /** Global search routing */
    this.route.params.subscribe(params => {
      this.globalSearchType = +params['globalSearchType'];
      this.globalSearchText = params['globalSearchText'];
    });
    if (this.globalSearchType && this.globalSearchText) {
      this.filter['globalSearchType'] = this.globalSearchType
      this.filter['globalSearchText'] = this.globalSearchText
      $('#dt-company').DataTable().destroy()
      $('#dt-company').empty()
      this.tmpCmpType = [];
      this.srch = ''
      this.loadDataTable();
    }
  }

  /**
   * This method set permission to this module
   * @method permission
   * @param {any} constantValues Rights value
   */
  permission(constantValues: any) {
    //checking permission of company
    this.showCompanyAddBtn = this.userRight.checkAllowButton(constantValues.ADDCOMPANY)
    this.showCompanyViewBtn = this.userRight.checkAllowButton(constantValues.VIEWCOMPANY)
    this.showCompanyDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETECOMPANY)
    this.showCompanyExportBtn = this.userRight.checkAllowButton(constantValues.EXPORTCOMPANY)

    //checking permission of contact
    this.showContactAddBtn = this.userRight.checkAllowButton(constantValues.ADDCONTACT)

    //checking permission of RFP
    this.showRfpAddBtn = this.userRight.checkAllowButton(constantValues.ADDRFP)

    //checking permission of JOB
    this.showJobAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOB)
    this.showTaskAddBtn = 'show'
    this.specialColumn = new $.fn.dataTable.SpecialColumn([{
      id: 'ADD_CONTACT',
      title: 'Add Contact',
      customClass: this.showContactAddBtn
    },
      {
        id: 'CREATE_TASK',
        title: 'Create Task',
        customClass: this.showTaskAddBtn
      }, {
        id: 'ADD_JOB',
        title: 'Create Project',
        customClass: this.showJobAddBtn
      }, {
        id: 'SEND_EMAIL',
        title: 'Send Email'
      }, {
        id: 'VIEW_ON_BIS',
        title: 'View on BIS',
        customClass: 'bisClass'
      }, {
        id: 'GET_INFO',
        title: 'Get Info',
        customClass: 'bisClass'
      }, {
        id: 'CREATE_RFP',
        title: 'Create Proposal',
        customClass: this.showRfpAddBtn
      },
    ])

    this.delete = this.delete.bind(this)
    this.onSave = this.onSave.bind(this)
  }

  /**
   * This method load data table
   * @method loadDataTable
   */
  loadDataTable(e?: any): Promise<any> {
    var vm = this;
    return new Promise((resolve) => {
      vm.table = $('#dt-company').DataTable({
        retrieve: true,
        serverSide: !vm.flager,
        processing: true,
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
        ajax: (dataTablesParameters: any, callback: any) => {
          if (!vm.flager) {

            delete dataTablesParameters['draw']
            dataTablesParameters['start'] = dataTablesParameters['start'] + dataTablesParameters.length
            let order = dataTablesParameters.order[0];
            if (dataTablesParameters['search'].value) {
              let searchValue = dataTablesParameters['search'].value;
              delete dataTablesParameters['search']
              dataTablesParameters['search'] = searchValue;
            }
            let columnIndex = order.column;
            let columnName = dataTablesParameters.columns[columnIndex].data;
            order['column'] = columnName;
            dataTablesParameters['orderedColumn'] = order;
            delete dataTablesParameters['order'];
            delete dataTablesParameters['columns'];
            if (dataTablesParameters['search'].value == '') {
              delete dataTablesParameters['search'];
              dataTablesParameters['search'] = ''
            }
            let dataToPost = {...dataTablesParameters};
            dataToPost['CompanyTypes'] = (vm.tmpCmpType || []).map((e: any) => e.id).toString() || ""
            if (!this.localSearch) {
              dataToPost['GlobalSearchText'] = this.filter.globalSearchText
              dataToPost['GlobalSearchType'] = this.filter.globalSearchType
            } else {
              vm.tmpCmpType = this.sharedService.companyLocalFilter.filter;
            }
            // CompanyTypes
            vm.http.post<DataTablesResponse>(`${vm.companyUrl}`, dataToPost, {}).subscribe(resp => {
              this.loading = false
              resolve(null);
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: resp.data
              });
            });
          } else {
            let queryString = ''
            let finalURL = ''
            for (let key in vm.filter) {
              queryString = `${queryString}${key}=${vm.filter[key]}&`
              finalURL = `${vm.companyUrl}${queryString}`
            }
            vm.http
              .get<DataTablesResponse>(
                `${finalURL}`,
              ).subscribe(resp => {
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: resp.data
              });
            });
            this.flager = false;
          }
        },
        buttons: [this.pdfBtn, this.excelBtn],
        columns: [
          {
            title: 'COMPANY',
            data: 'name',
            class: 'clickable compname',
            render: function (data: any, type: any, dataToSet: any) {
              return dataToSet.name;
            }
          }, {
            title: 'ADDRESS',
            data: 'address',
            class: 'clickable',
          }, {
            title: 'PHONE',
            data: 'phone',
            class: 'clickable'
          }, {
            title: 'Company URL',
            data: 'url',
            class: '',
            render: function (data: any, type: any, dataToSet: any) {

              if (dataToSet != null) {
                if (dataToSet.url) {
                  if (/\b(http|https)/.test(dataToSet.url)) {
                    return "<a class='taskfor' href=' " + dataToSet.url + "'   target='_blank'>" + dataToSet.url + " </a>";
                  } else {
                    return "<a class='taskfor' href=' https://" + dataToSet.url + "'   target='_blank'>" + dataToSet.url + " </a>";
                  }

                } else {
                  return '';
                }

              }

            }
          }, {
            title: 'Tracking#',
            data: 'trackingNumber',
            visible: false,
            class: 'selectable clickable'
          }, {
            title: 'IBM#',
            data: 'ibmNumber',
            visible: false,
            class: 'selectable clickable'
          }, {
            title: 'Tax Id#',
            data: 'taxIdNumber',
            visible: false,
            class: 'selectable clickable'
          }, {
            title: 'HIC#',
            data: 'hicNumber',
            visible: false,
            class: 'selectable clickable'
          }, {
            title: 'Work Compensation',
            data: 'insuranceWorkCompensation',
            visible: false,
            class: 'selectable clickable'
          }, {
            title: 'Disability',
            data: 'insuranceDisability',
            visible: false,
            class: 'selectable clickable'
          }, {
            title: 'General Liability',
            data: 'insuranceGeneralLiability',
            visible: false,
            class: 'selectable clickable'
          }, {
            title: 'Street Obstruction Bond',
            data: 'insuranceObstructionBond',
            visible: false,
            class: 'selectable clickable'
          }, {
            title: 'Notes',
            data: 'notes',
            visible: false,
            class: 'selectable',
            render: function (data: any, type: any) {
              if (data == null) {
                return '';
              }
              return `<div class='notes-info'>${data}</div>`;
            }
          },
          this.specialColumn
        ],
        rowCallback: ((row: any, data: any, index: any) => {
          $(row).find('.bisClass').hide();
          if (this.showCompanyDeleteBtn == 'hide') {
            $(row).find('.delete-icon').hide();
          }
          if (this.showCompanyAddBtn == 'hide') {
            $(row).find('.edit-icon').hide();
          }
          if (data.companyType_Id) {
            let comptypes = data.companyType_Id.split(',')
            if (comptypes.includes('13') ||
              comptypes.includes('11') ||
              comptypes.includes('27')
            ) {
              $(row).find('.bisClass').show();
            }
          }


        }),
        initComplete: () => {
          vm.table.columns.adjust()
          this.specialColumn
            .ngZone(vm.zone)
            .dataTable(vm.table)
            .onActionClick((row: any, actionId: any) => {
              const data = row.data()
              if (actionId == 'DELETE_COMPANY')
                this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
              if (actionId == 'ADD_CONTACT') {
                vm.openModalContact(vm.formContact, data.id)
              }
              if (actionId == 'EDIT_COMPANY') {
                vm.openModal(vm.formCompany, data.id)
              }
              if (actionId == 'VIEW_ON_BIS') {
                this.goToBis(data);
              }
              if (actionId == 'CREATE_RFP') {
                this.router.navigate(['/SiteInformation', {idCompany: data.id}])
              }
              if (actionId == 'CREATE_TASK') {
                this.idCompany = data.id
                vm.openModalFormAddTask(vm.addtask, null, 'CompanyModule');
              }
              if (actionId == 'ADD_JOB') {
                this.openJobModal(this.formJob, data.id)
              }
              if (actionId == 'GET_INFO') {
                this.idCompany = data.id
                vm.openModalGetInfo(vm.getinfo, data.id)
                //this.router.navigate(['/companydetail/', data.id])
              }
              if (actionId == 'SEND_EMAIL') {
                this.idCompany = data.id
                vm.openModalSendEmail(vm.sendemail)
              }
            })
        }
      });

      $('#dt-company').on('page.dt', function () {
        var info = vm.table.page.info();
        vm.fromPagination = true;
      });
      $('#dt-company tbody').on('click', 'td.clickable', function (ev: any) {
        const row = vm.table.row($(this).parents('tr'))
        const data = row.data()
        if ($(this).hasClass('clickable')) {
          vm.onOpenCompanyDetail(data);
        }
      });
      $('#dt-company tbody').on('click', 'span', function (ev: any) {
        const row = vm.table.row($(this).parents('tr'))
        const data = row.data()
        if ($(this).hasClass('delete-icon')) {
          vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
        }
        if ($(this).hasClass('edit-icon')) {
          vm.openModal(vm.formCompany, data.id)
        }
      })
      $('#dt-company tbody').on('mousedown', 'a.comp-red', function (ev: any) {
        const row = vm.table.row($(this).parents('tr'))
        const data = row.data()
        ev = ev || window.event;
        switch (ev.which) {
          case 1:
            vm.onOpenCompanyDetail(data);
            break;
          case 3:
            $(this).attr('href', './companydetail/' + data.id);
            break;
        }
      });
    })
  }

  /**
   * This method calls when user moved another component from current coponent
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    $('#dt-company tbody').off('click')
    this.srch = ""
    this.localSearchText = ""
    this.sharedService.companyLocalFilter = {filter: undefined, searchText: this.localSearchText}
  }

  /**
   * This method export company data
   * @method exportData
   * @param {string} str
   */
  exportData(str: string) {

    if (str == 'pdf') {
      this.pdfBtn.export()
    } else if (str == 'xls') {
      this.http.get(API_URL + 'api/companies/exporttoexcel').subscribe((r: [any]) => {
        if (r) {
          r.forEach(e => {
            if (e.key == 'exportFilePath') {
              window.open(e.value, "_blank");
            }
          })
        }
      })
      // this.excelBtn.export()
    }
  }

  /**
   * This method reload datatable
   * @method reload
   */
  reload() {
    if (this.companyList[this.filter.companyType] != "") {
      this.companyName = this.companyList[this.filter.companyType];
    }
  }

  /**
   * This method open send email popup
   * @method openModalSendEmail
   * @param {any} template TemplateRef Object
   * @param {number} id ID
   */
  private openModalSendEmail(template: TemplateRef<any>, id?: number) {
    this.modalRef = this.modalService.show(template, {class: 'modal-send-email', backdrop: 'static', 'keyboard': false})
  }

  /**
   * This method open get info popup
   * @method openModalGetInfo
   * @param {any} template TemplateRef Object
   * @param {number} id ID
   */
  private openModalGetInfo(template: TemplateRef<any>, id?: number) {
    if (this.idCompany) {
      this.companyServices.getById(this.idCompany).subscribe(r => {
        let company = r
        let licenceNumber = null;

        if (company['trackingNumber']) {
          licenceNumber = company['trackingNumber'];
        } else if (company['specialInspectionAgencyNumber']) {
          licenceNumber = company['specialInspectionAgencyNumber'];
        } else if (company['ctLicenseNumber']) {
          licenceNumber = company['ctLicenseNumber'];
        }
        this.getCompanyInfo(company.companyTypes, company.name, licenceNumber, template);
      })
    }
  }

  /**
   * This method will fetch company information from BIS
   * @method getCompanyInfo
   * @param {any} companyTypes All Company Types
   * @param {string} businessName Company Type
   * @param {number} licenceNumber Licence Number
   * @param {any} template template ref object
   */
  private getCompanyInfo(companyTypes: any, businessName: string, licenceNumber: number, template: TemplateRef<any>) {
    this.loading = true;
    let companyTypeText = ''
    businessName = businessName.toUpperCase();
    var gcCompanyType = companyTypes.filter((type: any) => type.id == 13);
    var SiaCompanyType = companyTypes.filter((type: any) => type.id == 11);
    var ctCompanyType = companyTypes.filter((type: any) => type.id == 27);
    if (gcCompanyType.length > 0) {
      companyTypeText = 'GENERAL CONTRACTOR';
    } else if (SiaCompanyType.length > 0) {
      companyTypeText = 'SPECIAL INSPECTION AGENCY';
    } else if (ctCompanyType.length > 0) {
      companyTypeText = 'CONCRETE TESTING LAB';
    }
    if (companyTypeText != '') {
      this.companyServices.getBusinessFromBis(businessName, companyTypeText, licenceNumber).subscribe(data => {
        data = JSON.parse(data);
        if (data && data.length >= 1) {
          this.modalRef = this.modalService.show(template, {
            class: 'modal-get-info',
            backdrop: 'static',
            'keyboard': false
          })
          this.loading = false;
        } else {
          this.loading = false;
          this.toastr.info(this.errorMsg.noResultForBis);
        }
      }, err => {
        this.loading = false;
        this.toastr.info(this.errorMsg.noResultForBis);
      });
    } else {
      this.loading = false;
      this.toastr.info(this.errorMsg.noResultForBis);
    }
  }

  /**
   * This method open contact popup
   * @method _openModalContact
   * @param {any} template TemplateRef Object
   */
  private _openModalContact(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-contact', backdrop: 'static', 'keyboard': false})
  }

  /**
   * This method open contact popup
   * @method openModalContact
   * @param {any} template TemplateRef Object
   * @param {number} id ID
   */
  private openModalContact(template: TemplateRef<any>, id?: number) {
    this.contactRec = {} as Contact
    if (id) {
      this.contactRec.idCompany = id
      this._openModalContact(template)
    }
  }

  /**
   * This method open company popup
   * @method _openModal
   * @param {any} template TemplateRef Object
   */
  private _openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-company', backdrop: 'static', 'keyboard': false})
  }

  /**
   * This method open company popup
   * @method openModal
   * @param {any} template TemplateRef Object
   * @param {number} id? ID
   */
  openModal(template: TemplateRef<any>, id?: number) {

    this.new = !!!id

    if (this.new) {
      this.rec = {
        addresses: []
      } as Company

      this.address = {} as Address

      this._openModal(template)
    } else {
      this.companyServices.getById(id).subscribe(r => {
        this.rec = r as Company
        this.address = {} as Address
        this._openModal(template)
      })
    }
  }

  /**
   * This method will delete company
   * @method delete
   * @param {number} id ID of Company
   * @param {any} row Selected Company Row
   */
  private delete(id: number, row: any): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.companyServices.delete(id).subscribe(r => {
        row.delete()
        this.table.clearPipeline()
        this.table.ajax.reload()
        resolve(null)
      }, e => {
        reject()
      })
    })
  }

  /**
   * This method set search in datatable
   * @method search
   * @param {string} srch Search Criteria
   */
  search(srch: string) {
    this.localSearch = true;
    this.localSearchText = srch;
    this.sharedService.companyLocalFilter = {filter: undefined, searchText: this.localSearchText}
    this.sharedService.clearGlobalSearch.emit('company');
    this.table.search(srch).draw()
  }

  /**
   * This method open company detail page
   * @method onOpenCompanyDetail
   * @param {any} obj Company Object
   */
  private onOpenCompanyDetail(obj: any) {
    this.router.navigate(['/companydetail', obj.id])
  }

  /**
   * This method will call when click on View on BIS link of Company
   * @method goToBis
   * @param {any} bisTracking Company ID
   */
  private goToBis(bisTracking: any) {
    this.loading = true
    if (bisTracking.id) {
      this.companyServices.getById(bisTracking.id).subscribe(r => {
        this.loading = false
        var trackingNumber = 0;
        var companyTypes = r.companyTypes;
        var gcCompanyType = companyTypes.filter((type: any) => type.id == 13);
        var SiaCompanyType = companyTypes.filter((type: any) => type.id == 11);
        var ctCompanyType = companyTypes.filter((type: any) => type.id == 27);
        let licenceType = '';
        if (gcCompanyType.length > 0) {
          licenceType = 'G';
          trackingNumber = r.trackingNumber;
        } else if (SiaCompanyType.length > 0) {
          licenceType = 'I';
          trackingNumber = r.specialInspectionAgencyNumber;
        } else if (ctCompanyType.length > 0) {
          licenceType = 'C';
          trackingNumber = r.ctLicenseNumber;
        }
        if (trackingNumber) {
          window.open('http://a810-bisweb.nyc.gov/bisweb/LicenseQueryServlet?licensetype=' + licenceType + '&licno=' + trackingNumber + '&requestid=1');
        } else {
          this.toastr.info(this.errorMsg.noResultForBis);
        }
      });
    }
  }

  /**
   * This method calls after company record save
   * @method onSave
   * @param {Company} comp Company record object
   * @param {any} evt Event Object
   */
  onSave(comp: Company, evt: any) {
    if (comp && !comp['jobNumber']) { // if create Project open from company then do not refresh company data table
      if (evt == "1") {
        this.loadme();

      }

      if (evt == "2") {
        this.table.clearPipeline()
        this.table.ajax.reload()
      }

    }
  }

  /**
   * This method apply filter and reload datatable
   * @method loadme
   */
  loadme() {
    this.table.clearPipeline()

    this.table.ajax.reload()
  }

  /**
   * This method apply filter and reload datatable
   * @method applyCompanyFilter
   */
  applyCompanyFilter() {
    this.loading = true
    this.newDataArray = [];
    this.resultss = [];
    this.tmpSelectFilter = [];
    (this.tmpCmpType || []).forEach((element: any) => {
      this.tmpSelectFilter.push(element.id)
    });
    this.filter.companyType = _.uniq(this.tmpSelectFilter).join(",")
    this.table.clearPipeline()
    if (this.tmpSelectFilter.length == 0) {
      this.loading = false;
      this.table.clear();
      this.table.rows.add(this.fulltabledata);
      this.table.draw();
    } else {
      this.tmpSelectFilter.forEach((element: any) => {
        element = element.toString();
        element = "" + element;
        if (this.fulltabledata) {
          this.fulltabledata.forEach((tableobj: any) => {
            if (tableobj.companyType_Id) {
              let xy = tableobj.companyType_Id.split(',');
              var result = xy.map((x: any) => {
                return x;
              });
              tableobj['comapnyTypes'] = result;
            }
          })
        }

        let xxx: any = [];
        this.fulltabledata.forEach((tab: any) => {
          if (tab.comapnyTypes) {
            tab.comapnyTypes.forEach(function (value: any) {
              if (value == element) {
                xxx.push(tab);
              }
            });
          }
        })
        xxx.forEach((object: any) => {
          var found = this.newDataArray.some(function (el: any) {
            return el.id === object.id;
          });
          if (!found) {
            this.newDataArray.push(object);
          }
        })
      });
      this.table.clear();
      this.loading = false;
      this.table.rows.add(this.newDataArray);
      this.table.draw();
    }

  }

  /**
   * Get selected item from multiselect dropdown
   * @method onItemSelect
   * @param {any} item selected item
   */
  onItemSelect(item: any, event?: any) {
    this.isFiltered = true;
    setTimeout(() => {
      this.tmpCmpType = item;
      if (this.firstTime) {
        this.fulltabledata = this.table.data().toArray();
        this.firstTime = false
      }
      this.applyCompanyFilter()
    }, 500);
  }

  applyCompanyTypesFilter(item: any) {
    this.localSearch = true;
    this.sharedService.companyLocalFilter = {filter: item, searchText: this.localSearchText}
    this.sharedService.clearGlobalSearch.emit('company')
    this.isFiltered = true;
    this.filterCompanies = [...item];
    setTimeout(() => {
      this.tmpCmpType = item;
      if (this.firstTime) {
        this.fulltabledata = this.table.data().toArray();
        this.firstTime = false
      }
      this.applyCompanyFilter()
    }, 500);
  }

  /**
   *  Deselect item from multiselect dropdown
   * @method OnItemDeSelect
   * @param {any} item deselected item
   */
  OnItemDeSelect(item: any) {
    this.applyCompanyFilter()
  }

  /**
   * select on all in multiselect dropdown
   * @method onSelectAll
   * @param {any} items selected all items
   */
  onSelectAll(items: any) {
    this.applyCompanyFilter()
  }

  /**
   * deselect on all in multiselect dropdown
   * @method onDeSelectAll
   * @param {any} items deselected all items
   */
  onDeSelectAll(items: any) {
    this.applyCompanyFilter()
  }

  /**
   * This method open popup for add task
   * @method openModalFormAddTask
   * @param {any} template TemplateRef Object
   * @param {number} id ID
   */
  openModalFormAddTask(template: TemplateRef<any>, id?: number, from?: string) {
    if (from) {
      this.frommodeule = from;
    }
    this.modalRef = this.modalService.show(template, {class: 'modal-add-task'})
  }

  /**
   * This method open popup for job
   * @method openJobModal
   * @param {any} template TemplateRef Object
   * @param {number} id ID of Company
   * @param {number} contactId ID of Contact
   */
  private openJobModal(template: TemplateRef<any>, id?: number, contactId?: number) {
    this.jobOfContact = {
      idCompany: id,
      idContact: contactId
    } as Job
    this._openJobModal(template)
  }

  /**
   * This method open popup for job
   * @method openJobModal
   * @param {any} template TemplateRef Object
   */
  private _openJobModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-job'})
  }

  clearCompanyTypes() {
    this.isFiltered = false;
    this.tmpCmpType = [];
    this.applyCompanyFilter();
    this.clear()
  }


  clear() {
    if (this.isFiltered) {
      // Load old selection on close
      this.tmpCmpType = [...this.filterCompanies];
    } else {
      this.tmpCmpType = []
    }
  }

}