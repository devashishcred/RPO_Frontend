import { HttpClient } from '@angular/common/http';
import { Component, Input, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from '../../../../app.component';
import { API_URL } from '../../../../app.constants';
import { constantValues, SharedService } from '../../../../app.constantValues';
import { UserRightServices } from '../../../../services/userRight.services';
import { JobDocumentServices } from '../../../job/jobDetail/jobDocument/jobDocument.service';
import { JobSharedService } from '../../../job/JobSharedService';
import { Message } from '../../../../app.messages';
declare const $: any
class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Component({
  selector: '[view-checklist-doc]',
  templateUrl: './view-checklist-doc.component.html',
  styleUrls: ['./view-checklist-doc.component.css']
})
export class ViewChecklistDocComponent implements OnInit {
  @Input() modalRefChecklist: BsModalRef
  @ViewChild('updateJobDocument', { static: true })
  private updateDocument: TemplateRef<any>
  @ViewChild('addJobDocument', { static: true })
  private addDocument: TemplateRef<any>
  @Input() IsPlGroup: boolean
  @ViewChild('pullpermit', { static: true })
  private pullpermit: TemplateRef<any>
  @Input() idChecklistItem: any
  public modalRef: BsModalRef
  private sub: any
  jobId: number
  showdocumentAddBtn: string = 'hide'
  private specialColumn: any
  private table: any
  private filter: any
  DocumentObj: any
  DocumentId: number
  private jobDetail: any = []
  private isJobDetail: boolean = false
  private flager: boolean = false
  private jobDocUrl = API_URL + 'api/JobDocumentsListPostChecklistItemwise';
  private selectedJobType: any = []
  private isClone: boolean = false
  private showSearch: boolean = false
  private binNumber: number
  srch: string
  private errorMsg: any
  loading: boolean
  PullpermitData: any
  private isPW517Open: boolean = false
  private showJobDocumentDeleteBtn: string = 'hide'
  selectedDocumentCode: string

  constructor(
    private modalService: BsModalService,
    private http: HttpClient,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private appComponent: AppComponent,
    private zone: NgZone,
    private JobDocumentService: JobDocumentServices,
    private jobSharedService: JobSharedService,
    private sharedService: SharedService,
    private message: Message,

  ) {
    this.errorMsg = message.msg
    this.showdocumentAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOBDOCUMENTS)
    this.showJobDocumentDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETEJOBDOCUMENTS)
    this.sub = this.route.parent.params.subscribe(params => {
      this.jobId = +params['id'];
    });
    this.specialColumn = new $.fn.dataTable.SpecialColumn([
      {
        id: 'ViewPDf',
        title: 'View',
        customClass: "viewClass"
      },
      {
        id: 'Clone',
        title: 'Clone',
        customClass: ""
      },
      {
        id: 'PULL_PERMIT',
        title: 'Pull Permit',
        customClass: "pullpermit"
      },
      {
        id: 'LOC_PULL_PERMIT',
        title: 'Pull LOC',
        customClass: "pullpermit-loc"
      },
      {
        id: 'COC_PULL_PERMIT',
        title: 'Pull COO',
        customClass: "pullpermit-coo"
      },
      {
        id: 'ADD_PAGE',
        title: 'Add Page',
        customClass: "add-page"
      },
    ], false)
    this.reload = this.reload.bind(this);
    this.delete = this.delete.bind(this)
  }

  ngOnInit() {
    document.title = 'Project -' + this.jobId;
    //set button visibility on job status change
    this.jobSharedService.getJobData().subscribe((data: any) => {
      this.jobDetail = data
      if (this.jobDetail == null) {
        this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
        this.setBtnBasedonStatus(this.jobDetail)
      } else {
        this.setBtnBasedonStatus(this.jobDetail)
      }
      if (this.jobDetail.rfpAddress) {
        if (this.jobDetail.rfpAddress.binNumber) {
          this.binNumber = this.jobDetail.rfpAddress.binNumber
        }
      }
    })
    this.sharedService.getJobStatus.subscribe((data: any) => {
      if (data == 'statuschanged') {
        if (this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)) {
          this.jobDetail = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
          this.setBtnBasedonStatus(this.jobDetail)
        }
      }
    }, (e: any) => { })
    const vm = this
    this.filter = {
      idJob: this.jobId,
      IdJobchecklistItemDetails: this.idChecklistItem
    } as any

    vm.table = $('#dt-jobDocument').DataTable({
      order: [[0, "desc"]],
      retrieve: true,
      serverSide: true,
      processing: true,
      lengthChange: true,
      dom: "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-12 col-md-2'l><'col-sm-12 col-md-3'i><'col-sm-12 col-md-7'p>>",
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
          let order = {
            column: '',
            dir: ''
          };
          delete dataTablesParameters['draw']
          dataTablesParameters['start'] = dataTablesParameters['start'] + 10
          if (dataTablesParameters.order[0]) {
            order = dataTablesParameters.order[0];
          }

          let columnName = ''
          let columnIndex = ''
          if (dataTablesParameters['search'].value) {
            let searchValue = dataTablesParameters['search'].value;
            delete dataTablesParameters['search']
            dataTablesParameters['search'] = searchValue;
          }
          if (order) {
            columnIndex = order.column;
          }
          if (!columnIndex) {
            columnName = dataTablesParameters.columns[0].data;
            order['dir'] = order.dir;
          } else {
            columnName = dataTablesParameters.columns[columnIndex].data;
          }

          order['column'] = columnName;
          dataTablesParameters['orderedColumn'] = order;
          dataTablesParameters['idJob'] = vm.jobId;
          console.log(this.IsPlGroup)
          if (this.IsPlGroup) {
            dataTablesParameters['IdJobPlumbingInspections'] = vm.idChecklistItem;
          } else {
            dataTablesParameters['IdJobchecklistItemDetails'] = vm.idChecklistItem;
          }
          dataTablesParameters['length'] = dataTablesParameters['start'];
          delete dataTablesParameters['order'];
          delete dataTablesParameters['columns'];
          if (dataTablesParameters['search'].value == '') {
            delete dataTablesParameters['search'];
            dataTablesParameters['search'] = ''
          }
          console.log('dataTablesParameters', dataTablesParameters)
          vm.http
            .post<DataTablesResponse>(
              `${vm.jobDocUrl}`,
              dataTablesParameters, {}
            ).subscribe(resp => {
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: resp.data
              });
            });
        } else {
       
        }

      },
      columnDefs: [
        { "width": "10%", "targets": 1 },
        { type: 'date-uk', targets: 6 } //specify your date column number,starting from 0

      ],
      columns: [
        {
          title: 'DOC ID',
          data: 'id',
          class: 'clickable',
        },
        {
          title: 'CODE',
          data: 'documentCode',
          class: 'clickable',
        },
        {
          title: 'A#/LOC/VIO#',
          data: 'applicationNumber',
          class: 'clickable',
          render: function (data: any, type: any, dataToSet: any) {
            if (dataToSet.applicationNumber) {
              return dataToSet.applicationNumber;
            } else if (dataToSet.summonsNumber) {
              return dataToSet.summonsNumber;
            } else if (dataToSet.trackingNumber) {
              return dataToSet.trackingNumber;
            } else {
              return dataToSet.applicationNumber;
            }
          }
        },
        {
          title: 'Application Type',
          data: 'appplicationType',
          class: 'clickable',
        },
        {
          title: 'DOCUMENT NAME',
          data: 'documentName',
          class: 'clickable',
        },
        {
          title: 'DOCUMENT DESCRIPTION',
          data: 'documentDescription',
          class: 'clickable',
        },
        {
          title: 'CREATED/MODIFIED DATE',
          data: 'lastModifiedDate',
          class: 'clickable',
          render: function (data: any, type: any, dataToSet: any) {
            let combineSteet = '';
            if (dataToSet.lastModifiedDate) {
              combineSteet += dataToSet.lastModifiedDate ? dataToSet.lastModifiedDate : '';
            } else {
              combineSteet += dataToSet.createdDate ? dataToSet.createdDate : '';
            }

            return combineSteet.replace(/^ \| | \|$/g, '');

          }
        },
        {
          title: 'CREATED/MODIFIED BY',
          data: 'lastModifiedByEmployeeName',
          class: 'clickable',
          render: function (data: any, type: any, dataToSet: any) {
            let combineSteet = '';
            if (dataToSet.lastModifiedByEmployeeName) {
              combineSteet += dataToSet.lastModifiedByEmployeeName ? dataToSet.lastModifiedByEmployeeName : '';
            } else {
              combineSteet += dataToSet.createdByEmployeeName ? dataToSet.createdByEmployeeName : '';
            }
            return combineSteet.replace(/^ \| | \|$/g, '');

          }
        },

        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        if (data.documentPath == '') {
          $(row).find('.viewClass').hide();
        } else {
          $(row).find('.viewClass').show();
        }
        if(vm.showJobDocumentDeleteBtn  == "hide") {
          $(row).find('.delete-icon').hide();
        }

        $(row).find('.pullpermit').hide();
        $(row).find('.pullpermit-loc').hide();
        $(row).find('.pullpermit-coo').hide();
        $(row).find('.add-page').hide();
        if (data.documentCode == vm.constantValues.DOBPULLPERMITCODE ||
          data.documentCode == vm.constantValues.VARPMTPULLPERMITCODE) {
          $(row).find('.pullpermit').show();
        }
        if (data.documentCode == vm.constantValues.LOCPULLPERMITCODE) {
          $(row).find('.pullpermit-loc').show();
        }
        if (data.documentCode == vm.constantValues.COOPULLPERMITCODE) {
          $(row).find('.pullpermit-coo').show();
        }
        if (data.isAddPage) {
          $(row).find('.add-page').show();
        }
      }),
      drawCallback: (setting: any) => {
        if (vm.showdocumentAddBtn == "hide") {
          $('.select-column').hide()
        } else {
          $('.select-column').show()
        } 
      },
      initComplete: () => {

        this.specialColumn
          .ngZone(this.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()
            if (actionId == 'ViewPDf') {
              window.open(data.documentPath, "_blank")
            }
            if (actionId == "Upload") {
              vm.DocumentObj = data;
              vm.DocumentId = data.id
              vm.openupdateDocumentModal(vm.updateDocument)
            }
            if (actionId == "EditPdf") {
              vm.DocumentObj = data;
              vm.isClone = false;
              vm._openModalAddJobDocument(vm.addDocument, 'EditPdf', data.id)
            }
            if (actionId == "Clone") {
              vm.DocumentObj = data;
              vm.isClone = true;
              vm.callCloneAPI(data.id);
              // vm._openModalAddJobDocument(vm.addDocument, 'EditPdf', data.id)

            }
            if (actionId == "Delete") {
              this.appComponent.showDeleteConfirmation(this.delete, [data.id, row, true])
            }
            if (actionId == "DeletePdf") {
              this.delete(data.id, row, false, data)
            }
            if (actionId == "PULL_PERMIT") {
              this.loading = true;
              vm.pullPermitRequest(data.documentDescription, data.applicationNumber, data.id, data.documentCode, data.ahvReferenceNumber)
            }
            if (actionId == "LOC_PULL_PERMIT") {
              vm.pullLocPermitRequest(data.applicationNumber)
            }
            if (actionId == "COC_PULL_PERMIT") {
              vm.pullCooPermitRequest(data.applicationNumber)
            }
            if (actionId == "ADD_PAGE") {
              vm.addPage(data.id)
            }
            if (actionId == "RegenaratePDF") {
              vm.regeneratePDF(data.id)
            }

          })
      }
    })

    $('#dt-jobDocument tbody').on('click', 'span', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const data = row.data()
      if ($(this).hasClass('edit-icon')) {
        vm.DocumentObj = data;
        vm.isClone = false;
        vm._openModalAddJobDocument(vm.addDocument, 'EditPdf', data.id)
      }

      if ($(this).hasClass('delete-icon')) {
        vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row, true])
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

  pullLocPermitRequest(jobappid: string) {
    let apidata = {
      JobApplicationNumber: jobappid
    }
    if (apidata) {
      this.loading = true
      this.JobDocumentService.locPullpermit(apidata).subscribe(r => {
        this.loading = false
        if (r && r[0].downloadLink) {
          this.reload()
          // this.toastr.success(this.errorMsg.successLOCPullPermitMsg)
          window.open(r[0].downloadLink, '_blank', 'toolbar=0,width=500,height=500');
        } else {
          this.toastr.info(this.errorMsg.errorLOCPullPermitMsg)
        }
      }, e => { this.loading = false })
    } else {
      this.toastr.info(this.errorMsg.errorLOCPullPermitMsg)
    }
  }
  pullCooPermitRequest(jobappid: string) {
    let apidata = {
      JobApplicationNumber: jobappid
    }
    if (apidata) {
      this.loading = true
      this.JobDocumentService.cooPullpermit(apidata).subscribe(r => {
        this.loading = false
        if (r.length > 0 && r[0].detailUrl) {
          this.reload()
          // this.toastr.success(this.errorMsg.successLOCPullPermitMsg)
          window.open(r[0].detailUrl, '_blank', 'toolbar=0,width=930,height=500');
        } else {
          this.toastr.info('No Permits available');
        }
      }, e => { this.loading = false })
    } else {
      this.toastr.info(this.errorMsg.errorLOCPullPermitMsg)
    }
  }

  addPage(id: number) {
    if (id) {
      this.loading = true
      this.JobDocumentService.addPage(id).subscribe(r => {
        this.loading = false
        if (r && r.documentPath) {
          this.reload()
          this.toastr.success(this.errorMsg.successAddPageMsg)
          window.open(r.documentPath, "_blank")
        } else {
          this.toastr.info(this.errorMsg.successAddPageMsg)
        }
      }, e => { this.loading = false })
    } else {
      this.toastr.info(this.errorMsg.errorAddPageMsg)
    }
  }
  /**
   * This method regenerate PDF if data of that related pdf will change
   * @method regeneratePDF
   * @param {number} id ID of Record 
   */
  regeneratePDF(id: number) {
    this.JobDocumentService.regeneratePDF(id).subscribe(r => {
      if (r) {
        window.open(r.documentPath, "_blank")
      }
    });
  }

  //popup for the upload document

  private openupdateDocumentModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-job-document', backdrop: 'static', 'keyboard': false })
  }

  //reload function for the data tables

  reload() {
    if (this.table) {
      this.table.clearPipeline()
      this.table.ajax.reload()
    }
  }
  /**
  * This method is clear search
  * @method clearsearch
  */
  private clearsearch() {
    this.showSearch = false;

    this.srch = ''

    this.table.search(this.srch).draw()
  }


  setBtnBasedonStatus(jobDetail: any) {
    if (this.showdocumentAddBtn == 'show') {
      if (jobDetail.status > 1) {
        this.showdocumentAddBtn = 'hide'
        $('.select-column').hide()
      } else {
        this.showdocumentAddBtn = 'show'
        $('.select-column').show()
      }
    }
    this.reload()
  }


  private callCloneAPI(id?: number) {
    this.loading = true;
    this.JobDocumentService.cloneJobDOC(id).subscribe((result) => {
      if (result.message) {
        this.toastr.success(result.message);
        this.reload()
      }
      this.loading = false;
    }, err => {
      this.toastr.error(err);
      this.loading = false;
    });
  }


  private _openModalAddJobDocument(template: TemplateRef<any>, action?: string, id?: number) {
    if (action == 'EditPdf') {
      this.DocumentId = id
    } else {
      this.DocumentId = null
      this.DocumentObj = null
      this.isClone = false;
    }
    this.modalRef = this.modalService.show(template, { class: 'modal-job-document', backdrop: 'static', 'keyboard': false })
  }

  //popup for the adding job document

  openModalAddJobDocument(template: TemplateRef<any>, id?: number) {
    this._openModalAddJobDocument(template)
  }

  //searching on the list of documents


  search(srch: string) {
    this.showSearch = true;
    this.table.search(srch).draw()
  }

  //Deleting the document from listing


  delete(id: number, row: any, type: boolean, data?: any) {
    return new Promise((resolve, reject) => {
      this.JobDocumentService.deleteDocument(id, type, data).subscribe(r => {
        this.reload();
        if (type) {
          row.delete()

        } else {
          this.reload()
        }
        resolve(r)
      }, e => {
        reject()
      })
    })
  }


  pullPermitRequest(docdesc: string, idApplication: number, idDocument: number, documentCode: string, ahvReferenceNumber: string) {

    this.loading = true
    if (documentCode == 'VARPMT') {
      if (idApplication && ahvReferenceNumber != null && ahvReferenceNumber != '') {
        this.loading = true
        this.selectedDocumentCode = documentCode
        this.JobDocumentService.pullPermitVARPMT(idApplication, ahvReferenceNumber).subscribe(r => {
          this.PullpermitData = r
          this.loading = false;
          if (r.length > 0 && !r[0].isError) {
            this._openModalPullPermit(this.pullpermit, 'PULL_PERMIT', idDocument)
          } else if (r.length > 0 && r[0].isError) {
            this.toastr.info('Unable to access BIS. Please try in some time.')
          } else if (r.length == 0) {
            this._openModalPullPermit(this.pullpermit, 'PULL_PERMIT', idDocument)
          }
          // r[0].isError = false ?  : 

          this.loading = false
        }, e => { this.loading = false })
      } else {
        this.loading = false;
        if (!idApplication) {
          this.toastr.info(this.errorMsg.applicationNoNotAvailable)
        }
        if (ahvReferenceNumber == null || ahvReferenceNumber == '') {
          this.toastr.info('AHV Reference# in not provided.')
        }

      }
    } else if (documentCode != 'VARPMT') {
      if (idApplication && this.binNumber && docdesc) {
        this.loading = true
        this.selectedDocumentCode = documentCode
        let apidata = {
          idJob: this.jobId,
          JobApplicationNumber: idApplication,
          binNumber: this.binNumber,
          documentDescription: docdesc
        }
        this.JobDocumentService.pullpermit(apidata).subscribe(r => {
          this.PullpermitData = r
          this.loading = false;
          this._openModalPullPermit(this.pullpermit, 'PULL_PERMIT', idDocument)
          this.loading = false
        }, e => { this.loading = false })
      } else {
        this.loading = false;
        this.toastr.info(this.errorMsg.binNumberOrApplication)
      }
    }
  }

  private _openModalPullPermit(template: TemplateRef<any>, action?: string, id?: number) {
    this.DocumentId = id
    this.modalRef = this.modalService.show(template, { class: 'modal-pull-permit', backdrop: 'static', 'keyboard': false })
  }
  openDropBoxFolder(jobId?: number) {
    this.JobDocumentService.openDocumentinDropBox(jobId).subscribe(r => {
      if (r) {
        window.open(r.documentPath, "_blank")
      }
    });
  }


}
