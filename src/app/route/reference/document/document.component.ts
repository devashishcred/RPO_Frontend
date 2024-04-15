import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, ElementRef, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms'
import { cloneDeep, identity, pickBy, assign } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AppComponent } from '../../../app.component';
import { Message } from '../../../app.messages';
import { Document } from '../../../types/document';
import { DocumentServices } from './document.services';
import { arrayBufferToBase64, downloadFile } from '../../../utils/utils';
import { UserRightServices } from '../../../services/userRight.services';
import { constantValues } from '../../../app.constantValues';


declare const $: any

/**
 * This component contains all function that are used in DocumentComponent
 * @class DocumentComponent
 */
@Component({
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent implements OnInit, OnDestroy {
  loading: boolean = false
  public btndisabled = true;
  private userAccessRight: any = {}

  //Button show hide
  showDocumentAddBtn: string = 'hide'
  private showDocumentEditBtn: string = 'hide'
  private showDocumentDeleteBtn: string = 'hide'

  //validation
  private selectDocName: boolean
  @ViewChild('formDocument', {static: true})
  private formDocument: TemplateRef<any>
  private selectUndefinedOptionValue: any;
  modalRef: BsModalRef
  new: boolean = true
  isConsulting: boolean = true
  rec: Document
  private specialColumn: any
  private errorMessage: any
  errorMsg: any
  private base64textString: any
  private table: any
  private fileContent: any
  chkfile: any;
  valfile: boolean = false;
  private FileAttached: string = "false";
  srch: string;

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
    private message: Message,
    private documentServices: DocumentServices,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private el: ElementRef
  ) {
    this.errorMsg = this.message.msg
    this.delete = this.delete.bind(this)

    this.showDocumentAddBtn = this.userRight.checkAllowButton(constantValues.ADDREFERENCEDOCUMENT)
    this.showDocumentDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETEREFERENCEDOCUMENT)

    this.specialColumn = new $.fn.dataTable.SpecialColumn([{
      id: 'EDIT',
      title: 'Edit Document',
      customClass: this.showDocumentAddBtn
    }, {
      id: 'DELETE',
      title: 'Delete Document',
      customClass: this.showDocumentDeleteBtn
    }], false)
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    document.title = 'Reference Document'
    this.table = $('#dt-document').DataTable({
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
      ajax: this.documentServices.get(),
      columns: [
        {
          title: 'DOCUMENT NAME',
          data: 'name',
          class: 'clickable',
          width: '250'
        }, {
          title: 'DESCRIPTION',
          data: 'description',
          orderable: false,
          class: 'clickable'
        },
        {
          title: 'KEYWORDS',
          data: 'keywords',
          visible: false,
          orderable: false
        },
        this.specialColumn
      ],
      rowCallback: ((row: any, data: any, index: any) => {
        $(row).find('.more_vert').hide();
        if (this.showDocumentAddBtn == 'hide') {
          $(row).find('.edit-icon').addClass("disabled");
        }
        if (this.showDocumentDeleteBtn == 'hide') {
          $(row).find('.delete-icon').addClass("disabled");
        }
      }),
      drawCallback: (setting: any) => {
        if (this.showDocumentAddBtn == "hide" && this.showDocumentDeleteBtn == "hide") {
          $('.select-column').hide()
        } else {
          $('.select-column').show()
        }
      },
      initComplete: () => {
        $('#dt-document tbody').on('click', 'td.clickable', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('clickable')) {
            vm.getDocumentViaDownload(data.id)
          }
        })
        this.specialColumn
          .ngZone(this.zone)
          .dataTable(vm.table)
          .onActionClick((row: any, actionId: any) => {
            const data = row.data()
            if (actionId == "EDIT") {
              vm.openModal(vm.formDocument, data.id)
            }
            if (actionId == "DELETE") {
              vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
            }
          })
        $('#dt-document tbody').on('click', 'span', function (ev: any) {
          const row = vm.table.row($(this).parents('tr'))
          const data = row.data()
          if ($(this).hasClass('delete-icon')) {
            vm.appComponent.showDeleteConfirmation(vm.delete, [data.id, row])
          }
          if ($(this).hasClass('edit-icon')) {
            vm.openModal(vm.formDocument, data.id)
          }
        })
      }
    })
    $('#dt-document').on('draw.dt', () => {
      $('[data-toggle="tooltip"]').tooltip()
    })
    const vm = this
  }

  /**
   * This method calls when destroy component
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    $('#dt-document tbody').off('click')
    $('#dt-document').off('draw.dt')
  }

  /**
   * This method open form popup for add/edit document
   * @method openModal
   * @param {any} template TemplateRef Object
   * @param {number} id? ID of Document
   */
  openModal(template: TemplateRef<any>, id?: number) {
    this.new = !!!id
    if (this.new) {
      this.chkfile = null;
      this.rec = {
        name: "",
        keywords: "",
        description: "",
        fileName: "",
        content: ""
      } as Document

      this.modalRef = this.modalService.show(template, {class: 'modal-lg'})
    } else {
      this.documentServices.getById(id).subscribe(r => {
        this.rec = r as Document
        this.chkfile = this.rec.fileName;
        this.modalRef = this.modalService.show(template, {class: 'modal-lg'})
      })
    }

    setTimeout(() => {
      $("[autofocus]").focus()
    })
  }

  /**
   * This method reload data table
   * @method reload
   */
  reload() {
    this.table.clearPipeline()
    this.table.ajax.reload()
  }

  /**
   * This method delete document
   * @method deleteDocument
   * @param {Document} d Document Object
   */
  private deleteDocument(d: Document) {
    if (!d.id) {
      delete this.rec.file;
      delete this.rec.fileName;
    }
  }

  /**
   * This method set selected file
   * @method handleFileSelect
   * @param {any} evt Event Object
   */
  handleFileSelect(evt: any) {
    var files = evt.target.files;
    var file = files[0];
    this.rec.file = file;
    this.rec.fileName = file.name;
    this.FileAttached = "true";
    this.chkfile = null;
  }

  /**
   * This method read file content
   * @method _handleReaderLoaded
   * @param {any} readerEvt Event Reader
   */
  _handleReaderLoaded(readerEvt: any) {
    var binaryString = readerEvt.target.result;
    this.base64textString = btoa(binaryString);
    this.rec.content = this.base64textString;
  }

  /**
   * This method save document
   * @method save
   */
  save() {
    this.loading = true
    if (this.rec.fileName != '') {
      let formData = new FormData();
      formData.append('Name', this.rec.name);
      formData.append('Keywords', this.rec.keywords);
      formData.append('Description', this.rec.description);
      formData.append('FileName', this.rec.fileName);
      formData.append('document-file-upload', this.rec.file);
      formData.append('FileAttached', this.FileAttached);
      if (!this.rec.id) {
        this.documentServices.create(formData).subscribe(r => {
          this.loading = false
          const doc = r as any
          this.table.rows.insert(doc)
          this.reload()
          this.toastr.success('Record created successfully')
          this.modalRef.hide()
        }, e => {
          this.loading = false
        })
      } else {
        formData.append('Id', this.rec.id.toString());
        this.documentServices.update(this.rec.id, formData).subscribe(r => {
          this.loading = false
          this.table.row(this.table.rows.idxByDataId(this.rec.id)).update({...this.rec})
          this.reload()
          this.toastr.success('Record updated successfully')
          this.modalRef.hide()
        }, e => {
          this.loading = false
        })
      }
      this.FileAttached = "false";
    } else {
      this.valfile = true;
    }
    this.btndisabled = false;
  }

  /**
   * This method delete document
   * @method delete
   * @param {number} id ID of Document
   * @param {any} row Document Row
   */
  delete(id: number, row: any) {
    return new Promise((resolve, reject) => {
      this.documentServices.delete(id).subscribe(r => {
        row.delete()
        this.reload()
        resolve(r)
      }, e => {
        reject()
      })
    })
  }

  /**
   * This method download the document
   * @method getDocumentViaDownload
   * @param {number} id ID of Document
   */
  getDocumentViaDownload(id: number) {
    this.documentServices.getById(id).subscribe(r => {
      window.open(r.contentPath, '_blank');
    })
  }

  /**
   * This method search document
   * @method search
   * @param {string} srch Search Criteria
   */
  search(srch: string) {
    this.table.search(srch).draw()
  }
}