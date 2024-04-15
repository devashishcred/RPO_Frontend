import { Component, ElementRef, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { assign, identity, pickBy } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

import { AppComponent } from '../../app.component';
import { ContactLicenseTypeServices } from '../../services/contactLicenseType.services';
import { CompanyItem } from '../../types/company';
import { Contact, IInviteContactRequest } from '../../types/contact';
import { ContactLicenseType } from '../../types/contactLicense';
import { arrayBufferToBase64, isIE } from '../../utils/utils';
import { CompanyServices } from '../company/company.services';
import { ContactServices } from './contact.services';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues, SharedService } from '../../app.constantValues';
import { Job } from '../../types/job';
import { API_URL } from '../../app.constants';
import * as _ from 'underscore';
import { HttpClient } from '@angular/common/http';
import { resolve } from 'url';
import { LocalStorageService } from '../../services/local-storage.service';
declare const $: any

const blankAvatar = "";
/**
* This component contains all function that are used in ContactComponent
* @class ContactComponent
*/
@Component({
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, OnDestroy {
  private pdfBtn: any
  private excelBtn: any

  /**
  *  this component is used for filtering records
  * @property filterDropdown
  */
  @ViewChild('filterDropdown', { static: true })
  private filterDropdown: ElementRef

  /**
  *  form add/edit formContact
  * @property formContact
  */
  @ViewChild('formContact', { static: true })
  private formContact: TemplateRef<any>

  /**
  *  form add/edit addtask
  * @property addtask
  */
  @ViewChild('addtask', { static: true })
  private addtask: TemplateRef<any>

  /**
  *  form add/edit formJob
  * @property formJob
  */
  @ViewChild('formJob', { static: true })
  private formJob: TemplateRef<any>

  /**
  *  form add/edit sendemail
  * @property sendemail
  */
  @ViewChild('sendemail', { static: true })
  private sendemail: TemplateRef<any>

  jobOfContact: Job

  filter: any = {}
  companies: CompanyItem[] = []

  modalRef: BsModalRef
  isConsulting: boolean = true

  private new: boolean = true
  contactLicenseTypes: ContactLicenseType[] = []

  rec: Contact

  private specialColumn: any

  private table: any
  loading: boolean = false;
  private highlighted: any


  private userAccessRight: any = {}



  //Conact show hide
  showContactAddBtn: string = 'hide'
  private showContactViewBtn: string = 'hide'
  private showContactDeleteBtn: string = 'hide'
  showContactExportBtn: string = 'hide'

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
  idContact: number
  private idCompany: number
  idCompanyFromContact: number
  private globalSearchType: number
  private globalSearchText: string
  private firstTime: boolean = true;
  private fulltabledata: any = [];
  private newDataArray: any = [];
  frommodeule: string
  contactdata: any
  private contactListPost = API_URL + 'api/ContactListPost';
  flager: any;
  localSearch: boolean;
  localSearchText: string;
  srch: any;

  isCustomerLoggedIn: boolean = false;
  requireAddType: boolean;


  constructor(
    private router: Router,
    private zone: NgZone,
    private appComponent: AppComponent,
    private companyServices: CompanyServices,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private contactLicenseTypeServices: ContactLicenseTypeServices,
    private contactServices: ContactServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private route: ActivatedRoute,
    private http: HttpClient,
    private sharedService: SharedService,
    private localStorageService: LocalStorageService

  ) {
    this.isCustomerLoggedIn = this.localStorageService.getCustomerLoggedIn();
    if(this.isCustomerLoggedIn) {
      toastr.error("Caution! You are currently signed in to the customer portal; kindly proceed to log out.")
      this.logout()
    }
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'Contacts'
    const queryParams = this.route.snapshot.queryParams;
    this.highlighted = queryParams['email'];
    // For Filter issue
    $(".filterLicense").click(function () {
      $(".filterLicense .ng-select-dropdown-outer").css("visibility", "hidden");
      $(this).toggleClass("opened11");
      $(this).removeClass("opened");
      $(".filterLicense .ng-select-dropdown-outer").toggleClass("opened2");
    });

    $(".filterCompany").click(function () {
      $(".filterCompany .ng-select-dropdown-outer").css("visibility", "hidden");
      $(this).toggleClass("opened11");
      $(this).removeClass("opened");
      $(".filterCompany .ng-select-dropdown-outer").toggleClass("opened2");
    });

    this.permission(this.constantValues)
    if (!this.contactLicenseTypes.length)
      this.contactLicenseTypeServices.getLicenceTypeDD().subscribe(r => {
        this.contactLicenseTypes = _.sortBy(r, "itemName")
      })

    if (!this.companies.length)
      this.companyServices.getCompanyDropdown().subscribe(r => {
        r.push({ id: "-1", itemName: 'Show Individual Contacts', name: "-1" })
        this.companies = _.sortBy(r, "name")
      })


    this.pdfBtn = $.fn.dataTable.button({
      extend: 'pdfHtml5',
      filename: 'Contacts',
      title: 'Contacts',
      exportOptions: {
        columns: [0, 1, 2, 3, 4, 5, 6, 7, 8]
      }
    })

    this.excelBtn = $.fn.dataTable.button({
      extend: 'excelHtml5',
      filename: 'Contacts',
      title: 'Contacts',
      exportOptions: {
        columns: [0, 1, 2, 3, 4, 5, 6, 7, 8]
      }
    })

    /* clearing local filter on routing to other route */
    this.router.events.subscribe(rEvent => {
      if (rEvent instanceof NavigationStart && !(rEvent.url.includes('contacts')))
        this.sharedService.contactLocalFilter = undefined;
    })

    if (this.sharedService.contactLocalFilter && (this.sharedService.contactLocalFilter.searchText || this.sharedService.contactLocalFilter.filter)) {

      if (this.sharedService.contactLocalFilter.searchText) {
        this.srch = this.sharedService.contactLocalFilter.searchText;
      }
      if (this.sharedService.contactLocalFilter.filter) {
        this.filter = this.sharedService.contactLocalFilter.filter;
      }
      this.loadDataTable(true);
      this.sharedService.contactLocalFilter = undefined;
    } else {
      this.filter = {};
      this.srch = ''
      this.sharedService.contactLocalFilter = undefined;
      this.loadDataTable(false)
    }
    /** Global search routing */
    this.route.params.subscribe(params => {
      this.globalSearchType = +params['globalSearchType'];
      this.globalSearchText = params['globalSearchText'];
    });
    if (this.globalSearchType && this.globalSearchText) {
      // this.filter['globalSearchType'] = this.globalSearchType
      // this.filter['globalSearchText'] = this.globalSearchText
      $('#dt-contact').DataTable().destroy()
      $('#dt-contact').empty()
      this.filter = {};
      this.srch = ''
      this.sharedService.contactLocalFilter = undefined;
      this.loadDataTable(false);
    }

  }

  /**
  * This method is used to check permission of this component
  * @method permission
  * @param {any} constantValues type request Object
  */
  permission(constantValues: any) {
    let CUIStatusClass = 'invite-register';
    this.showContactAddBtn = this.userRight.checkAllowButton(constantValues.ADDCONTACT)
    this.showContactViewBtn = this.userRight.checkAllowButton(constantValues.VIEWCONTACT)
    this.showContactDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETECONTACT)
    this.showContactExportBtn = this.userRight.checkAllowButton(constantValues.EXPORTCONTACT)
    this.showRfpAddBtn = this.userRight.checkAllowButton(constantValues.ADDRFP)
    this.showJobAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOB)
    this.showTaskAddBtn = 'show'
    if (this.showTaskAddBtn == 'show') {
      this.showTaskAddBtn = 'create-task';
    } else if (this.showTaskAddBtn == 'hide') {
      this.showTaskAddBtn = 'hidecreate-task';
    }
    if (this.showJobAddBtn == 'show') {
      this.showJobAddBtn = 'add-job';
    } else if (this.showJobAddBtn == 'hide') {
      this.showJobAddBtn = 'hideadd-job';
    }
    if (this.showRfpAddBtn == 'show') {
      this.showRfpAddBtn = 'add-rfp';
    } else if (this.showRfpAddBtn == 'hide') {
      this.showRfpAddBtn = 'hideadd-rfp';
    }


    this.specialColumn = new $.fn.dataTable.SpecialColumn([
      {
        id: 'CREATE_TASK',
        title: 'Create Task',
        class: 'ctask',
        customClass: this.showTaskAddBtn
      },
      {
        id: 'SEND_EMAIL',
        customClass: 'cmail',
        title: 'Send Email'
      }, {
        id: 'CREATE_RFP',
        title: 'Create Proposal',
        class: 'crfp',
        customClass: this.showRfpAddBtn
      }, {
        id: 'CREATE_JOB',
        title: 'Create Projects',
        class: 'cjob',
        customClass: this.showJobAddBtn
      },
      {
        id: 'INACTIVE',
        title: 'Mark Inactive',
        customClass: 'inactive-btn'
      },
      {
        id: 'ACTIVE',
        title: 'Mark Active',
        customClass: 'active-btn'
      },
      {
        id: 'INVITE_CONTACT',
        title: 'Invite Contact',
        customClass: 'invite-contact-btn',
        // visible: !this.isCustomerLoggedIn,
      },
      {
        id: 'RESEND',
        title: 'Re-Invite',
        customClass: 'resend-btn',
        // visible: !this.isCustomerLoggedIn,
      },
      // {
      //   id: 'DELETE_CONTACT',
      //   title: 'Delete Contact',
      //   customClass: this.showContactDeleteBtn
      // }
    ])
    this.delete = this.delete.bind(this)
  }

  loadDataTable(e: any): Promise<any> {
    console.log("ContactComponent -> e", e);

    return new Promise<any>((resolve) => {
      const vm = this

      vm.table = $('#dt-contact').DataTable({
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
        retrieve: true,
        serverSide: !vm.flager,
        processing: true,
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
            let dataToPost = { ...dataTablesParameters };
            // dataToPost['CompanyTypes'] = vm.tmpCmpType.map((e: any) => e.id).toString() || ""\
            dataToPost['IdContactLicenseType'] = this.filter.idContactLicenseType;
            dataToPost['IdCompany'] = this.filter.idCompany == -1 ? '' : this.filter.idCompany;
            dataToPost['search'] = this.srch;
            dataToPost['GlobalSearchText'] = this.globalSearchText
            dataToPost['GlobalSearchType'] = this.globalSearchType

            // e==true means localsearch is present
            if (e) {
              delete dataToPost['GlobalSearchText'];
              delete dataToPost['GlobalSearchType'];
            }
            dataToPost['Individual'] = this.filter.idCompany == -1 ? '-1' : '';
            // CompanyTypes
            vm.http.post<DataTablesResponse>(`${vm.contactListPost}`, dataToPost, {}).subscribe(resp => {
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
              finalURL = `${vm.contactListPost}${queryString}`
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
            title: 'FIRST NAME',
            data: 'firstName',
            width: 110,
            class: 'clickable contname',
            render: function (data: any, type: any, dataToSet: any) {
              return dataToSet.firstName;
            }
          }, {
            title: 'LAST NAME',
            data: 'lastName',
            width: 110,
            class: 'clickable',
          }, {
            title: 'COMPANY',
            data: 'name',
            class: 'clickable',
          }, {
            title: 'ADDRESS',
            data: 'address',
            class: 'clickable'
          }, {
            title: 'WORK PHONE',
            data: 'workPhone',
            width: '115px',
            class: 'clickable'
          }, {
            title: 'EMAIL',
            data: 'email',
            // width: 250,
            render: function (data: any, type: any) {
              if (data == "") {
                data = null;
              }
              if (type === 'display' && data != null && data != '')
                return `<a href="mailto:${data}" target="_top" class="link-blue">${data}</a>`

              return null;
            }
          },
          {
            title: 'Status',
            data: 'isActive',
            class: '',
            width: '50px',
            render: function (data: any, type: any, dataToSet: any) {
              if (dataToSet.isActive) {
                return 'Active';
              } else {
                return 'Inactive';
              }
            }
          },
          {
            title: 'CUI (Registered)',
            data: 'cuI_Invitatuionstatus',
            class: '',
            width: '',
            render: function (data: any, type: any, dataToSet: any) {
              if (!data) {
                return 'Not Invited'
              } else if (data == 1) {
                return 'Invitation Sent'
              } else if (data == 2) {
                return 'Registered'
              }
            }
          },
          {
            title: 'License',
            data: 'contactLicenseType',
            visible: false,
            class: 'selectable clickable'
          }, {
            title: 'License Number',
            data: 'licensesNumber',
            visible: false,
            class: 'selectable clickable'
          }, {
            title: 'Notes',
            data: 'notes',
            visible: false,
            class: 'selectable clickable',
            render: function (data: any, type: any) {
              if (data == null) {
                return '';
              }
              return `<div class='notes-info'>${data}</div>`;
            }
          },
          this.specialColumn
        ],
        drawCallback: (setting: any) => {
          if (vm.showContactAddBtn == "hide") {
            $('.select-column').hide()
          } else {
            $('.select-column').show()
          }
        },
        rowCallback: ((row: any, data: any, index: any) => {
          if (this.showContactAddBtn == 'hide') {
            $(row).find('.edit-icon').hide();
          }
          if (this.showContactDeleteBtn == 'hide') {
            $(row).find('.delete-icon').hide();
          }
          if (data.isActive) {
            $(row).find('.inactive-btn').show();
            $(row).find('.active-btn').hide();
          } else {
            $(row).find('.inactive-btn').hide();
            $(row).find('.cmail').hide();
            $(row).find('.create-task').hide();
            $(row).find('.add-job').hide();
            $(row).find('.add-rfp').hide();
            $(row).find('.active-btn').show();
          }
          if (this.showContactAddBtn == 'hide') {
            $(row).find('.inactive-btn').hide();
            $(row).find('.active-btn').hide();
          }
          if(!this.isCustomerLoggedIn) {
            if (!data.cuI_Invitatuionstatus || data.cuI_Invitatuionstatus == 0 || data.cuI_Invitatuionstatus == null) {
              $(row).find('.invite-contact-btn').show();
              $(row).find('.resend-btn').hide();
            }
            else if (data.cuI_Invitatuionstatus == 1) {
              $(row).find('.invite-contact-btn').hide();
              $(row).find('.resend-btn').show();
            } else if(data.cuI_Invitatuionstatus == 2) {
              $(row).find('.invite-contact-btn').hide();
              $(row).find('.resend-btn').hide();
            }
          } else {
            $(row).find('.invite-contact-btn').hide();
            $(row).find('.resend-btn').hide();
          }
        }),
        initComplete: () => {
          if (vm.highlighted) {
            vm.srch = vm.highlighted
            vm.search(vm.highlighted);
          }
          vm.table.columns.adjust()
          this.specialColumn
            .ngZone(vm.zone)
            .dataTable(vm.table)
            .onActionClick((row: any, actionId: any) => {
              const data = row.data()
              if (actionId == 'DELETE_CONTACT')
                this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
              if (actionId == 'EDIT_CONTACT') {
                vm.openModal(vm.formContact, data.id)
              }
              if (actionId == 'CREATE_RFP') {
                this.router.navigate(['/SiteInformation', { idCompany: data.idCompany, idContact: data.id }])
              }
              if (actionId == 'CREATE_JOB') {
                this.openJobModal(this.formJob, data.idCompany, data.id)
              }
              if (actionId == 'CREATE_TASK') {
                let contactdata = [{
                  id: data.id,
                  itemName: data.firstName + ' ' + data.lastName
                }];
                this.idContact = data.id
                vm.openModalFormAddTask(vm.addtask, null, 'ContactModule', contactdata);
              }
              if (actionId == 'SEND_EMAIL') {
                this.idContact = data.id
                vm.idCompanyFromContact = data.idCompany
                vm.openModalSendEmail(vm.sendemail)
              }
              if (actionId == 'INVITE_CONTACT') {
                vm.inviteContact(data);
              }
              if (actionId == 'RESEND') {
                vm.resendInvitation(data);
              }
              if (actionId == "INACTIVE" || actionId == "ACTIVE") {
                this.toggleContactStatus(data.id, actionId, data.firstName, data.personType);
              }
            })
        }
      })

      $('#dt-contact tbody').on('click', 'td.clickable', function (ev: any) {
        const row = vm.table.row($(this).parents('tr'))
        const data = row.data()
        if ($(this).hasClass('clickable')) {
          vm.onOpenContactDetail(data);
        }
      })

      $('#dt-contact tbody').on('click', 'span', function (ev: any) {
        const row = vm.table.row($(this).parents('tr'))
        const data = row.data()
        if ($(this).hasClass('delete-icon')) {
          vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
        }
        if ($(this).hasClass('edit-icon')) {
          vm.openModal(vm.formContact, data.id)
        }
      })
      $('#dt-contact tbody').on('mousedown', 'a.cont-name', function (ev: any) {

        const row = vm.table.row($(this).parents('tr'))
        const data = row.data()
        ev = ev || window.event;
        switch (ev.which) {
          case 1:
            vm.onOpenContactDetail(data);
            break;
          case 3:
            $(this).attr('href', './contactdetail/' + data.id);
            break;
        }
      });

      $(this.filterDropdown.nativeElement).on('click', (e: Event) => {
        e.stopPropagation()
      })

      this.onSave = this.onSave.bind(this);
    })
  }

  /**
  * This method will be destroy all elements and other values from whole module
  * @method ngOnDestroy
  */
  ngOnDestroy() {
    $(this.filterDropdown.nativeElement).off('click')

    $('#dt-contact tbody').off('click')
    isIE && $('.rpo-image-border').off('click')
  }

  /**
  * This method is used for toggle status of items from datatable
  * @method toggleTaskTypeStatus
  * @param {string} status,{id} id 
  */
  private toggleContactStatus(tid: number, status: string, name: string, person: any) {
    this.loading = true;
    let apidata = {}
    apidata['id'] = tid;
    apidata['firstName'] = name;
    apidata['persontype'] = person;
    apidata['isActive'] = status == 'INACTIVE' ? false : true;
    this.contactServices.toggleStatus(apidata).subscribe(r => {
      this.loading = false;
      this.toastr.success('Status Changed Successfully');
      this.reloadTable();
    }, (e: any) => {
      this.loading = false;
      // this.toastr.error('An Error occured');
      this.reloadTable();
    });

  };


  /**
  * This method is used to reload datatable with filered criteria
  * @method reload
  */
  reload(addtype?: any) {
    this.localSearch = true;
    this.sharedService.contactLocalFilter = { filter: { idContactLicenseType: this.filter.idContactLicenseType, idCompany: this.filter.idCompany }, searchText: this.localSearchText }
    this.sharedService.clearGlobalSearch.emit('contacts');
    this.newDataArray = [];
    if (this.firstTime) {
      this.fulltabledata = this.table.data().toArray();
      this.firstTime = false
    }

    // If filter was clear

    if (this.filter.idCompany == null && this.filter.idContactLicenseType == null) {
      this.table.clear();
      this.table.rows.add(this.fulltabledata);
      this.table.draw();
    }
    $(".dropdown-menu").parents(".dropdown").removeClass("open");
    // If filter was applied with Company but not License Type
    if ((this.filter.idCompany != undefined && this.filter.idCompany != '' && this.filter.idCompany != -1) && (this.filter.idContactLicenseType == undefined || this.filter.idContactLicenseType == '')) {
      let x = this.fulltabledata.filter((type: any) => type.idCompany == this.filter.idCompany);
      x.forEach((object: any) => {
        var found = this.newDataArray.some(function (el: any) {
          return el.id === object.id;
        });
        if (!found) {
          this.newDataArray.push(object);
        }
      });

      this.table.clear();
      this.table.rows.add(this.newDataArray);
      this.table.draw();
    }
    // If filter was applied with  License Type but not Company
    if ((this.filter.idContactLicenseType != undefined && this.filter.idContactLicenseType != '') && (this.filter.idCompany == '' || this.filter.idCompany == undefined)) {
      let x = this.fulltabledata.filter((type: any) => type.idContactLicenseType == this.filter.idContactLicenseType);
      x.forEach((object: any) => {
        var found = this.newDataArray.some(function (el: any) {
          return el.id === object.id;
        });
        if (!found) {
          this.newDataArray.push(object);
        }
      });

      this.table.clear();
      this.table.rows.add(this.newDataArray);
      this.table.draw();
    }
    // If filter was applied with both License Type and Company
    if ((this.filter.idContactLicenseType != undefined && this.filter.idContactLicenseType != '') && (this.filter.idCompany != undefined && this.filter.idCompany != '') && this.filter.idCompany != -1) {
      let x = this.fulltabledata.filter((type: any) => type.idCompany == this.filter.idCompany && type.idContactLicenseType == this.filter.idContactLicenseType);
      x.forEach((object: any) => {
        var found = this.newDataArray.some(function (el: any) {
          return el.id === object.id;
        });
        if (!found) {
          this.newDataArray.push(object);
        }
      });
      this.table.clear();
      this.table.rows.add(this.newDataArray);
      this.table.draw();
    }
    // For Individual Contacts
    if (this.filter.idCompany == -1) {
      let x = this.fulltabledata.filter((type: any) => type.idCompany == null);
      x.forEach((object: any) => {
        var found = this.newDataArray.some(function (el: any) {
          return el.id === object.id;
        });
        if (!found) {
          this.newDataArray.push(object);
        }
      });

      this.table.clear();
      this.table.rows.add(this.newDataArray);
      this.table.draw();
    }

  }

  /**
* This method is used to reload datatable
* @method reloadTable
*/
  reloadTable() {
    this.table.clearPipeline()
    this.table.ajax.reload()
  }

  /**
  * This method is used to check whether valus is undefined or not
  * @method isUndefined
  * @param {any} v type request Object
  */
  isUndefined(v: any): boolean {
    return (v === void 0) || (v === 'undefined')
  }

  /**
  * This method is used to export data from datatable
  * @method exportData
  * @param {string} str is used to check in which format data should be exported
  */
  exportData(str: string) {
    if (str == 'pdf') {
      this.pdfBtn.export()
    } else if (str == 'xls') {
      this.http.get(API_URL + 'api/contacts/exporttoexcel').subscribe((r: [any]) => {
        if (r) {
          r.forEach(e => {
            if (e.key == 'exportFilePath') {
              window.open(e.value, "_blank");
            }
          })
        }
      })
    }
  }

  /**
  * This method is used to open modal popup for _openModal
  * @method _openModal
  * @param {any} template type which contains template of create/edit module
  */
  private _openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-contact', backdrop: 'static', 'keyboard': false })
  }

  /**
  * This method is used to open modal popup for openModal
  * @method openModal
  * @param {any} template type which contains template of create/edit module
  * @param {number} id? it is optional which contains id if record is in edit mode
  */
  openModal(template: TemplateRef<any>, id?: number) {
    this.new = !!!id

    if (!this.new) {
      this.contactServices.getById(id).subscribe(r => {
        this.rec = r as Contact
        if (r.imageThumbUrl && r.imageThumbUrl != "")
          this.rec.imageAux = r.imageThumbUrl
        else
          this.rec.imageAux = blankAvatar

        this._openModal(template)
      })
    } else {
      this.rec = void 0
      this._openModal(template)
    }
  }

  private resendInvitation(data: any) {
    this.inviteContact(data, true)
  }

  private inviteContact(data: any, isResend?: boolean) {
    console.log(data)
    if (!data?.email || !data?.firstName) {
      this.toastr.error("Contact must have First Name and Email for send invitation.")
      // this.toastr.error("This customer doesn't have an email address for sending invitations.")
      return
    }
    if (!data?.isActive) {
      this.toastr.error("This customer is inactive; invitations cannot be sent.")
      return
    }
    this.loading = true;
    this.contactServices.sendInviteContact(data.id, 0).subscribe((res) => {
      console.log('res inviteContact', res)
      if (res) {
        this.toastr.success(isResend ? "Invitation resent successfully" : "Invitation sent successfully");
        this.loading = false;
        this.reloadTable();
      }
    },
      (error) => {
        this.loading = false;
        console.log(error)
        this.toastr.error(error.message);
      })
  }

  /**
  * This method is used to open modal popup for openModalSendEmail
  * @method openModalSendEmail
  * @param {any} template type which contains template of create/edit module
  */
  private openModalSendEmail(template: TemplateRef<any>, id?: number) {
    this.modalRef = this.modalService.show(template, { class: 'modal-send-email', backdrop: 'static', 'keyboard': false })
  }

  /**
  * This method is used to read the file
  * @method readUrl
  * @param {any} input input reader contains object of file
  * @param {Contact} rec rec is used for contact object
  */
  private readUrl(input: any, rec: Contact) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e: any) {
        rec.imageAux = e.target.result;
      }

      reader.readAsDataURL(input.files[0]);
    }
  }

  /**
  * This method is used to reload datatable
  * @method onSave
  */
  onSave(ctt: Contact, evt: any) {
    this.table.clearPipeline()
    this.table.ajax.reload()
  }

  /**
  * This method is used to delete record
  * @method delete
  * @param {number} id type which contains id to delete record 
  * @param {any} row type which contains entire selected row
  */
  private delete(id: number, row: any): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.contactServices.delete(id).subscribe(r => {
        row.delete()
        this.reload()
        resolve(null)
      }, e => {
        reject()
      })
    })
  }

  /**
  * This method is used for filter/search records from datatable
  * @method search
  * @param {string} srch type any which contains string that can be filtered from datatable
  */
  search(srch: string) {
    this.localSearch = true;
    this.localSearchText = srch;
    this.sharedService.contactLocalFilter = { filter: this.filter, searchText: this.localSearchText }
    if(!this.highlighted) {
      this.sharedService.clearGlobalSearch.emit('contacts');
    } 
    this.table.search(srch).draw()
  }

  /**
  * This method is used to navigate onOpenContactDetail
  * @method onOpenContactDetail
  * @param {any} obj contains contact object
  */
  private onOpenContactDetail(obj: any) {
    this.router.navigate(['/contactdetail', obj.id])
  }

  /**
  * This method is used to clear search
  * @method clearsearch
  */
  clearsearch() {
    $('#filterDropDown').dropdown('toggle')
    this.loading = true;
    this.filter.idContactLicenseType = ''
    this.filter.individual = ''
    this.filter.idCompany = ''
    this.table.clear();
    this.table.rows.add(this.fulltabledata);
    this.loading = false;
    this.table.columns().search('').draw();
  }

  /**
  * This method is used to open modal popup for openModalFormAddTask
  * @method openModalFormAddTask
  * @param {any} template type which contains template of create/edit module
  * @param {number} id it is optional which contains id if record is in edit mode
  */
  openModalFormAddTask(template: TemplateRef<any>, id?: number, from?: string, contactdata?: any) {
    if (from) {
      this.frommodeule = from;
      this.contactdata = contactdata;

    }
    this.modalRef = this.modalService.show(template, { class: 'modal-add-task', backdrop: 'static', 'keyboard': false })
  }

  /**
  * This method is used to open modal popup for openJobModal
  * @method openJobModal
  * @param {any} template type which contains template of create/edit module
  * @param {number} id it is optional which contains id if record is in edit mode
  * @param {number} contactId it is optional which contains contact id
  */
  private openJobModal(template: TemplateRef<any>, id?: number, contactId?: number) {
    this.jobOfContact = {
      idCompany: id,
      idContact: contactId
    } as Job
    this._openJobModal(template)
  }

  /**
  * This method is used to open modal popup for _openJobModal
  * @method _openJobModal
  * @param {any} template type which contains template of create/edit module
  */
  private _openJobModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-job', backdrop: 'static', 'keyboard': false })
  }

  logout() {
    if (localStorage.getItem('auth'))
      localStorage.removeItem('auth')

    if (localStorage.getItem('userinfo'))
      localStorage.removeItem('userinfo')

    if (localStorage.getItem('userRights'))
      localStorage.removeItem('userRights')

    if (localStorage.getItem('notificationCount'))
      localStorage.removeItem('notificationCount')

    if (localStorage.getItem('userLoggedInId'))
      localStorage.removeItem('userLoggedInId')

    if (localStorage.getItem('allPermissions'))
      localStorage.removeItem('allPermissions')

    if (localStorage.getItem('selectedRow'))
      localStorage.removeItem('selectedRow')

    if (localStorage.getItem('selectedJobType'))
      localStorage.removeItem('selectedJobType')

    if (localStorage.getItem('selectedSubMenu'))
      localStorage.removeItem('selectedSubMenu')

    if (localStorage.getItem('parentExpandedList'))
      localStorage.removeItem('parentExpandedList')

    if (localStorage.getItem('selectedChecklist'))
      localStorage.removeItem('selectedChecklist')

    if (localStorage.getItem('lastSelectedCompositeChecklist'))
      localStorage.removeItem('lastSelectedCompositeChecklist')

    if (localStorage.getItem('selectedChecklistType'))
      localStorage.removeItem('selectedChecklistType')

    if (localStorage.getItem('isCustomerLoggedIn'))
      this.isCustomerLoggedIn = localStorage.getItem('isCustomerLoggedIn') == "true" ? true : false;

    if (localStorage.getItem('userLoggedInName'))
      localStorage.removeItem('userLoggedInName')

    localStorage.clear()
    this.router.navigate(['login'])
  }

}

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}