import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { cloneDeep, identity, assign, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { RelatedJob } from '../../../../../types/relatedJob';
import { FieldValue, ModelTosent } from '../../../../../types/document';
import { JobDocumentServices } from '../jobDocument.service';
import * as _ from 'underscore';
import { Message } from '../../../../../app.messages';
import { API_URL } from '../../../../../app.constants';

declare const $: any
class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Component({
  selector: '[select-job-document]',
  templateUrl: './selectJobDocument.component.html',
  styleUrls: ['./selectJobDocument.component.scss']

})

export class SelectJobDocumentComponent {
  @Input() modalRefDoc: BsModalRef
  @Input() idJob: number
  @Input() jobDocumentList: any[]
  @Input() documentsToDelete: any[]
  @Output() getSelectedDocument = new EventEmitter<any>();
  @Output() getSelectedDocumentToDelete = new EventEmitter<any>();

  loading: boolean = false
  private errorMessage: any
  private jobdocsurl = API_URL + '/api/JobDocumentsListTransmittal'
  private listOfDocuments: any = []
  private alllistOfDocuments: any = []
  private selectedDocument: number
  private filter: any
  private table: any
  srch: any
  docList: any
  private searchResult: any = []

  constructor(
    private toastr: ToastrService,
    private message: Message,
    private jobDocumentServices: JobDocumentServices,
    private http: HttpClient,
  ) {
    this.errorMessage = this.message.msg;
  }

  ngOnInit() {
    const vm = this
    vm.docList = []
    this.filter = {
      idJob: this.idJob,
      isTransmittal: true
    } as any
    vm.table = $('#dt-jobDocuments').DataTable({
      ajax: (dataTablesParameters: any, callback: any) => {
        dataTablesParameters['idJob'] = vm.idJob;
          vm.http
            .post<DataTablesResponse>(
              `${vm.jobdocsurl}`,
              dataTablesParameters, {}
            ).subscribe(resp => {
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: resp.data
              });
            });
        

      },
      scrollY: "500px",
      scrollCollapse: true,
      paging: false,
      order: [[2, "asc"]],
      columnDefs: [
        { "width": "10%", "targets": 1 }
      ],
      columns: [
        {
          data: 'id',
          class: 'clickable',
          width: '10px',
          orderable: false,
          render: function (data: any, type: any, dataToSet: any) {
            return`<div class="checkbox form-check">
            <label class="form-check-label">
                <input type="checkbox" class="form-check-input chk" id="checkboxId_${dataToSet.id}" name='checkboxId' value="${dataToSet.id}" (click)="selectAllRow()" />
                <i class="input-helper"></i>
            </label>
        </div>`
          }
        },
        {
          data: 'id',
          class: 'clickable',
        },
        {
          data: 'documentCode',
          class: 'clickable',
          width: '60px',
        },
        {
          data: 'applicationNumber summonsNumber',
          class: 'clickable',
          render: function (data: any, type: any, dataToSet: any) {
            if(dataToSet.applicationNumber){
              return dataToSet.applicationNumber;  
            }else if(dataToSet.summonsNumber){
              return dataToSet.summonsNumber;
            }else if(dataToSet.trackingNumber){
              return dataToSet.trackingNumber;
            }else{
              return dataToSet.applicationNumber;
            }
            
            
            
          }
        },

        {
          data: 'appplicationType',
          class: 'clickable',
        },
        {
          data: 'documentName',
          class: 'clickable',
        },
        {
          data: 'documentDescription',
          class: 'clickable',
        },
        {
          data: 'lastModifiedByEmployeeName',
          class: 'clickable',
          render: function (data: any, type: any, dataToSet: any) {
            return dataToSet.lastModifiedByEmployeeName ? dataToSet.lastModifiedByEmployeeName : dataToSet.createdByEmployeeName;
          },
        },
        {
          data: 'lastModifiedDate',
          class: 'clickable',
          render: function (data: any, type: any, dataToSet: any) {
            return dataToSet.lastModifiedDate ? dataToSet.lastModifiedDate : dataToSet.createdDate;
          },
        },

      ],
      rowCallback: ((row: any, data: any, index: any) => {
        vm.listOfDocuments.push(data)
      }),
      initComplete: () => {
        if (vm.jobDocumentList.length > 0) {
          vm.setSelectedRow();
        }
        $('#dt-jobDocuments tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()

          if ($(this).hasClass('clickable')) {
            var checkBox: any = document.getElementById("checkboxId_" + data.id);
            vm.setDocList(checkBox, data)
          }
        })
      }
    }).on('search.dt', function (e: any, setting: any) {
      vm.searchResult = vm.table.rows({ search: 'applied', order: 'index' }).data()
    })
  }

  setSelectedRow() {
    this.docList = []
    for (var index = 0; index < this.jobDocumentList.length; index++) {
      var element = this.jobDocumentList[index];
      let docFilter: any = this.jobDocumentList.filter(x => x.id == element.id)
      if (docFilter) {
        this.docList.push(element)
        $('#checkboxId_' + element.idJobDocument).prop('checked', true);
      }
    }
    if (this.jobDocumentList.length == this.table.data().count()) {
      $('#selectall').prop('checked', true);
    }

  }

  setDocList(checkBox: any, data: any) {

    if (checkBox.checked == true) {
      this.docList.push(data)
      if (this.docList.length == this.table.data().count()) {
        $('#selectall').prop('checked', true);
      }
    } else {
      let recDel: any = this.jobDocumentList.filter((x: any) => x.idJobDocument == data.idJobDocument);
      if (recDel && recDel.length > 0) {
        this.documentsToDelete.push(recDel[0].id)
      }
      this.docList = this.docList.filter((x: any) => x.idJobDocument != data.idJobDocument);
      this.jobDocumentList = this.jobDocumentList.filter((x: any) => x.idJobDocument != data.idJobDocument);
      $('#selectall').prop('checked', false); // Unchecks it
    }
  }


  selectAllRow() {
    var checkBoxAll: any = document.getElementById("selectall");
    this.docList = []
    var checkboxValues: any = [];
    if (checkBoxAll.checked == true) {
      $('input:checkbox[class=chk]').not(this).prop('checked', true);
      if (this.searchResult && this.searchResult.length > 0) {
        this.docList = this.searchResult;
        if (this.jobDocumentList && this.jobDocumentList.length > 0) {
          for (let i of this.jobDocumentList) {
            if (i) {
              this.docList.push(i);
            }
          }
        }
      } else {
        this.getAllDocumentList();
      }
    } else {
      $('input:checkbox').not(this).prop('checked', false);
      this.docList = []
      for (var index = 0; index < this.jobDocumentList.length; index++) {
        this.documentsToDelete.push(this.jobDocumentList[index]['id'])
      }
    }

  }
  getAllDocumentList() {
    this.jobDocumentServices.getJobDocumentsList(this.idJob).subscribe(documents => {
      this.docList = documents.data
    })
  }
  getDocumentList() {
    this.jobDocumentServices.getJobDocumentsList(this.idJob).subscribe(documents => {
      this.listOfDocuments = documents.data
      this.alllistOfDocuments = documents.data
      if (this.jobDocumentList && this.jobDocumentList.length > 0) {
        this.jobDocumentList.forEach((data: any) => {

          let matchedItem = this.listOfDocuments.filter((x: any) => x.id == data.idJobDocument);
          if (matchedItem && matchedItem.length > 0) {
            let index = this.listOfDocuments.indexOf(matchedItem[0]);
            this.listOfDocuments.splice(index, 1);
          }
        });
      }
      this.loading = false
    }, e => {
      this.loading = false
    })
  }

  setDocument() {

    let selectedDocument: any = []
    if (this.docList && this.docList.length > 0) {
      for (let object of this.docList) {
        var found = this.jobDocumentList.some(function (el: any) {
          return el.id === object.id;

        });
        if (found) {
          selectedDocument.push(object);
        }
        if (!found) {
          object['id'] = 0
          selectedDocument.push(object);
        }
      }
      this.getSelectedDocument.emit(selectedDocument);
      if (this.documentsToDelete && this.documentsToDelete.length > 0) {
        this.getSelectedDocumentToDelete.emit(this.documentsToDelete)
      }
      this.modalRefDoc.hide();
    }
  }


  search(srch: string) {
    this.table.search(srch).draw()
  }
}






