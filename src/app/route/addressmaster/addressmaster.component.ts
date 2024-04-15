import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../app.component';
import { AddressType, Address } from '../../types/address';
import { AddressMasterServices } from './addressmaster.services';
import { Router } from '@angular/router';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';
import { Job } from '../../types/job';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';
import { API_URL } from '../../app.constants';
import { HttpClient } from '@angular/common/http';


declare const $: any

@Component({
  templateUrl: './addressmaster.component.html',
  styleUrls: ['./addressmaster.component.scss']
})

/**
* This component contains all function that are used in AddressMasterComponent
* @class AddressMasterComponent
*/
export class AddressMasterComponent implements OnInit, OnDestroy {

  /**
  *  form add/edit masterform
  * @property masterform
  */
  @ViewChild('masterform',{static: true})
  private masterform: TemplateRef<any>

  /**
  *  form add/edit formJobAddNewAddress
  * @property formJobAddNewAddress
  */
  @ViewChild('formJobAddNewAddress',{static: true})
  private formAddAddress: TemplateRef<any>

  /**
  *  viewAddress
  * @property viewAddress
  */
  @ViewChild('viewAddress',{static: true})
  private viewAddress: TemplateRef<any>

  /**
  *  form add/edit formJob
  * @property formJob
  */
  @ViewChild('formJob',{static: true})
  private formJob: TemplateRef<any>

  modalRef: BsModalRef
  isNew: boolean = true
  private addressType: any = []
  loading: boolean = false
  private table: any
  private filter: any
  private specialColumn: any
  search: string
  addressId: number
  moduleName: string = "addressMaster"
  idAddress: any
  private addressJobId: number
  jobOfComp: Job
  flager: any;
  private AddressListPost = API_URL + 'api/AddressListPost';

  //Company show hide
  showAddressAddBtn: string = 'hide'
  private showAddressViewBtn: string = 'hide'
  private showAddressDeleteBtn: string = 'hide'
  //Rfp show hide
  private showRfpAddBtn: string = 'hide'
  //Job show hide
  private showJobAddBtn: string = 'hide'
  private showJobViewBtn: string = 'hide'


  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private zone: NgZone,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private addressMasterServices: AddressMasterServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private http: HttpClient
  ) {

  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'Address'
    this.permission(this.constantValues)

    const vm = this
    this.filter = {} as any
    vm.table = $('#dt-address-master').DataTable({
      "aaSorting": [[2,'asc']],
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
      retrieve: true,
        serverSide: !vm.flager,
        processing: true,
      // ajax: this.addressMasterServices.get({
      //   onData: (data: any) => {
      //     assign(data, pickBy(this.filter, identity))
      //   }
      // }),


      ajax: (dataTablesParameters: any, callback: any) => {
        if (!vm.flager) {
          delete dataTablesParameters['draw'];
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
          dataToPost['search'] = this.search;                     
          // CompanyTypes
          vm.http.post<DataTablesResponse>(`${vm.AddressListPost}`, dataToPost, {}).subscribe(resp => {
            this.loading = false
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
            finalURL = `${vm.AddressListPost}${queryString}`
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


          //  vm.jobServices.getRecords({
          //   onData: (data: any) => {
          //     assign(data, pickBy(this.filter, identity))
          //   },

          // });
        }
      },
      columns: [
        {
          title: 'BIN#',
          data: 'binNumber',
          class: 'clickable',
          width: 55
        },
        {
          title: 'HOUSE#',
          data: 'houseNumber',
          class: 'clickable',
          width: 60
        }, {
          title: 'STREET Name',
          data: 'street',
          class: 'clickable'
        }, {
          title: 'BOROUGH',
          data: 'borough',
          class: 'clickable',
          width: 80
        }, {
          title: 'Zip',
          data: 'zipcode',
          class: 'clickable',
          width: 40,
        }, {
          title: 'Owner type',
          data: 'ownerType',
          class: 'clickable',
          width: 120
        }, {
          title: 'OWNERSHIP',
          data: 'company',
          class: 'clickable'
        }, {
          title: 'contact',
          data: 'ownerContact',
          class: 'clickable'
        },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        if(this.showAddressAddBtn == 'hide') {
          $(row).find('.edit-icon').hide();
        }
        if(this.showAddressDeleteBtn == 'hide') {
          $(row).find('.delete-icon').hide();
        }
      }),
      initComplete: () => {
        $('#dt-address-master tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.idAddress = data.id
            vm.openModalForm(vm.viewAddress, data.id, false)
          }
        })
        this.specialColumn
          .ngZone(this.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()

            if (actionId == "EDIT_ADDRESS") {
              vm.isNew = false
              vm.addressId = data.id
              this.idAddress = data.id
              vm.openModalForm(vm.formAddAddress, data.id, false)
            }
            if (actionId == "DELETE_ADDRESS") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row])
            }
            if (actionId == "VIEW_ON_BIS") {
              window.open("http://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?houseno=" + data.houseNumber + "&street=" + data.street + "&boro=" + data.boroughBisCode, '_blank');
            }
            if (actionId == "CREATE_RFP") {
              let paramPass = {}
              if (data.id) {
                paramPass["idAddress"] = data.id
              }
              // if (data.idCompany) {
              //   paramPass["idCompany"] = data.idCompany
              // }
              // if (data.idOwnerContact) {
              //   paramPass["idContact"] = data.idOwnerContact
              // }
              this.router.navigate(['/SiteInformation', paramPass])
            }
            if (actionId == "CREATE_JOB") {
              vm.addressJobId = data.id
              vm.jobOfComp = {
                idCompany: data.idCompany,
                idContact: data.idOwnerContact,
                idRfpAddress: data.id
              } as Job
              this.openJobModal(vm.formJob)
            }
            if (actionId == "JOB_DETAIL") {
              let filledFilter = {
                'idRfpAddress': data.id
              }

              this.router.navigate(['/jobs', filledFilter])

            }
          })
          $('#dt-address-master tbody').on('click', 'span', function (ev: any) {
            const row = vm.table.row($(this).parents('tr'))
            const data = row.data()
            if ($(this).hasClass('delete-icon')) {
              vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
            }
            if ($(this).hasClass('edit-icon')) {
              vm.isNew = false
              vm.addressId = data.id
              vm.idAddress = data.id
              vm.openModalForm(vm.formAddAddress, data.id, false)
            }
          })
      }
    }) .on( 'page.dt', function () { 
      // hide dropdown on route change
      $("ul[class*='action'].dropdown-menu").hide();
    })
  }

  /**
  * This method is used to check permission of component
  * @method permission
  * @param {any} constantValues type request Object
  */
  permission(constantValues: any) {
    //checking permission of company
    this.showAddressAddBtn = this.userRight.checkAllowButton(constantValues.ADDADDRESS)
    this.showAddressViewBtn = this.userRight.checkAllowButton(constantValues.VIEWADDRESS)
    this.showAddressDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETEADDRESS)

    //checking permission of RFP
    this.showRfpAddBtn = this.userRight.checkAllowButton(constantValues.ADDRFP)

    //checking permission of JOB
    this.showJobAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOB)
    this.showJobViewBtn = this.userRight.checkAllowButton(constantValues.VIEWJOB)



    this.specialColumn = new $.fn.dataTable.SpecialColumn([
    //   {
    //   id: 'EDIT_ADDRESS',
    //   title: 'Edit Address',
    //   customClass: this.showAddressAddBtn
    // }, {
    //   id: 'DELETE_ADDRESS',
    //   title: 'Delete Address',
    //   customClass: this.showAddressDeleteBtn
    // },
    {
      id: 'CREATE_RFP',
      title: 'Create Proposal',
      customClass: this.showRfpAddBtn
    },
    {
      id: 'CREATE_JOB',
      title: 'Create Projects',
      customClass: this.showJobAddBtn
    },
    {
      id: 'JOB_DETAIL',
      title: 'Project List',
      customClass: this.showJobViewBtn
    },
    {
      id: 'VIEW_ON_BIS',
      title: 'View On BIS',
      customClass: ""
    }
    ], false)
    this.reload = this.reload.bind(this)
    this.delete = this.delete.bind(this)
  }


  /**
  * This method will be destroy all elements and other values from whole module
  * @method ngOnDestroy
  */
  ngOnDestroy() {
    $('#dt-address-master tbody').off('click')
    $('#dt-address-master').off('draw.dt')
  }

  /**
  * This method is used for filter/search records from datatable
  * @method searchAddress
  * @param {string} srch type any which contains string that can be filtered from datatable
  */
  searchAddress(srch: string) {
    this.table.search(srch).draw()
  }

  /**
  * This method is used to open modal popup for openModalForm
  * @method openModalForm
  * @param {any} template type which contains template of create/edit module
  * @param {number} id it is optional which contains id if record is in edit mode
  * @param {boolean} isNew it is optional which contains true if it is new record and false when it is old record
  */
  openModalForm(template: TemplateRef<any>, id?: number, isNew?: boolean) {
    if (isNew) {
      this.isNew = true
      this.addressId = 0
    }
    this.modalRef = this.modalService.show(template, { class: 'modal-new-address', backdrop: 'static', 'keyboard': false })
  }

  /**
  * This method is used to reload datatable
  * @method reload
  */
  reload() {
    this.table.clearPipeline()
    this.table.ajax.reload()
  }

  /**
  * This method is used to delete record
  * @method delete
  * @param {number} id type which contains id to delete record 
  * @param {any} row type which contains entire selected row
  */
  delete(id: number, row: any) {
    return new Promise((resolve, reject) => {
      this.addressMasterServices.delete(id).subscribe(r => {
        row.delete()
        this.reload();
        resolve(r)
      }, e => {
        reject()
      })
    })
  }

  /**
  * This method is used to open modal popup for openModalForm
  * @method openJobModal
  * @param {any} template type which contains template of create/edit module
  */
  private openJobModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-job', backdrop: 'static', 'keyboard': false })
  }
}
class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}