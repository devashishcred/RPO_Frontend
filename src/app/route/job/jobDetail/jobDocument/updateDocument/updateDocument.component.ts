import { Component, Input, OnDestroy, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { RelatedJob } from '../../../../../types/relatedJob';
import { FieldValue, ModelTosent } from '../../../../../types/document';
import { JobDocumentServices } from '../jobDocument.service';
import * as _ from 'underscore';
import { Message } from '../../../../../app.messages';
import { DomSanitizer } from '@angular/platform-browser';


declare const $: any

@Component({
  selector: '[update-job-document]',
  templateUrl: './updateDocument.component.html'
})
export class UpdateJobDocumentComponent implements OnInit {
  @Input() modalRef: BsModalRef
  @Input() idJob: number
  @Input() DocumentObj: any
  @Input() reload: Function
  @Input() DocumentId: number
  @ViewChild('iframe', {static: true}) iframe: ElementRef;

  private ListOfDocuments: any[] = []
  private ListOfFields: any[] = []
  private ListOfFieldsTosent: ModelTosent
  loading: boolean = false
  private errorMessage: any
  private showFieldValues: boolean = false
  private dropdownSettings: any = {};
  private ListOfMultiSelect: any
  private itemsToshow: any[] = []
  files: File[] = []
  dragAreaClass: string = 'dragarea';
  documents: any[] = [];
  selectedDocumentPath: any;
  selectedDocumentName: any

  // Event listener for dragevent
  @HostListener('dragover', ['$event']) onDragOver(event: any) {
    this.dragAreaClass = "droparea";
    event.preventDefault();
  }

  constructor(
    private toastr: ToastrService,
    private message: Message,
    private jobDocumentServices: JobDocumentServices,
    public sanitizer: DomSanitizer
  ) {
    this.errorMessage = this.message.msg;
  }

  ngOnInit() {
    if (this.DocumentId && this.DocumentId != null) {
      this.getTheEditDocument()
    }
  }

  getTheEditDocument() {
    this.jobDocumentServices.getDocumentById(this.DocumentId).subscribe(resOfDocument => {
      this.selectedDocumentPath = resOfDocument.documentPath
      this.selectedDocumentName = resOfDocument.documentName

    });
  }

  //file selection
  filesChange(file: any) {
    if (file.length == 1) {
      this.documents = file;
    } else {
      this.documents = [file[file.length - 1]];
    }
    this.files = []
  }

  //uploading the document
  validComboDrag: boolean = false;
  lastInvalids: any;
  dragFiles: any;

  uploadDocument() {
    this.loading = true
    let formData = new FormData();
    formData.append('idJobDocument', this.DocumentObj.idJobDocument.toString())
    for (var i = 0; i < this.documents.length; i++) {
      formData.append('documents_' + i, this.documents[i])
    }
    this.jobDocumentServices.uploadDocument(formData).subscribe(res => {
      this.loading = false;
      this.modalRef.hide();
      this.reload();
      this.toastr.success("Document uploaded successfully");
    }, e => {
      this.loading = false;
      this.toastr.error("Something went wrong");

    });
  }

  deleteDocument(document: any) {
    this.documents = []
  }
}



