import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription ,  Observable } from 'rxjs';
import { Contact } from '../../../types/contact';
import { ContactServices } from '../../contact/contact.services';
import { ScopeReview } from '../../../types/scopereview';
import { AppComponent } from '../../../app.component';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ScopeReviewServices } from './scopeReview.services';
import { RfpListService } from '../../rfp/rfp.services';
import { ComponentCanDeactivate } from '../../../components/appSaveLeave/guard';
import { HostListener } from '@angular/core';
import * as _ from 'underscore';
import * as moment from 'moment';
import { UserRightServices } from '../../../services/userRight.services';
import { constantValues } from '../../../app.constantValues';
declare const $: any
declare var tinymce: any;

/**
* This component contains all function that are used in scopeReviewComponent
* @class scopeReviewComponent
*/
@Component({
  templateUrl: './scopeReview.component.html',
  styleUrls: ['./scopeReview.component.scss']
})
export class scopeReviewComponent implements ComponentCanDeactivate {

  /**
  *  scopeReviewForm add/edit form
  * @property scopeReviewForm
  */
  @ViewChild('scopeReviewForm',{static: true}) form: any;

  /**
  *  rfpprogressionnote add/edit form
  * @property rfpprogressionnote
  */
  @ViewChild('rfpprogressionnote',{static: true})
  private rfpprogressionnote: TemplateRef<any>

  modalRef: BsModalRef
  loading: boolean
  private ckeditorContent: string;
  private generalNote: string;
  private contactlist: Contact[] = [];
  contacts: Contact[] = []
  private contact: Contact;
  private selectUndefinedOptionValue: any;
  scopeReview: ScopeReview
  private sub: any;
  id: number;
  rfpNumber: string
  configuration: any;
  dropdownSettings: any = {};
  private dropdownList: any = [];
  tmpContactId: any = []
  private showNavigationTabs: boolean = true
  showStep1: string = ''
  showStep2: string = ''
  private showStep3: string = ''
  showStep4: string = ''
  showStep5: string = ''
  rfpDetail: any = {}
  createdBy: string
  modifiedBy: string
  private formNotChanged = true
  private showRfpAddBtn: string = 'hide'
  private showRfpViewBtn: string = 'hide'
  private showRfpDeleteBtn: string = 'hide'
  content: string;
  @ViewChild("ckeditor",{static: true}) ckeditor: any;
  // @HostListener allows us to also guard against browser refresh, close, etc.
  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return this.formNotChanged
  }

  constructor(
    private contactService: ContactServices,
    private router: Router,
    private toastr: ToastrService,
    private scopeReviewServices: ScopeReviewServices,
    private route: ActivatedRoute,
    private rfpListService: RfpListService,
    private modalService: BsModalService,
    private userRight: UserRightServices,
    private constantValues: constantValues,
  ) {
    this.tmpContactId = []
    this.content = null;
  }

  /**
  * This method is used check any element in form changed or not
  * @method isFieldValChange
  */
  isFieldValChange(type: any) {
    if (type != 'contact') {
      if (this.form.touched && this.form.dirty) {
        this.formNotChanged = false
      }
    } else {
      this.getContacts('click');
      this.formNotChanged = false
    }
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    this.constantValues.CKEDITORCONFIGSETTING.autoparagraph = true
    this.configuration = this.constantValues.CKEDITORCONFIGSETTING;
    this.loading = true
    document.title = 'RFP'

    this.showRfpAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDRFP)
    this.showRfpViewBtn = this.userRight.checkAllowButton(this.constantValues.VIEWRFP)
    this.showRfpDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETERFP)

    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
      this.getRfpDetail()
    });
    this.dropdownSettings = {
      singleSelection: false,
      text: "Contacts",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: false,
      classes: "myclass custom-class",
      badgeShowLimit: 1
    };

    this.scopeReview = {} as ScopeReview
    this.scopeReview.id = this.id
    // this.scopeReviewServices.getScopeReview(this.scopeReview.id).subscribe(r => {
    //   // this.content = r.description
    //   //  this.scopeReview.generalNotes = r.generalNotes
    //   this.tmpContactId = r.contactsCcList;
    //   // for (let i = 0; i < r.contactsCc.length; i++) {
    //   //   this.tmpContactId.push({ "id": r.contactsCc[i].id, "itemName": r.contactsCc[i].firstName + " " + r.contactsCc[i].lastName });
    //   // }
    // })
    this.getContacts();

    if (this.showRfpAddBtn == 'hide') {
      setTimeout(function () {
        this.showAddressAddBtn = 'hide'
        $(".wizard-body").addClass("disabled");
        $(".wizard-body .form-control, .wizard-body input[type='checkbox'], .wizard-body input[type='radio'], .wizard-body .btn").attr("disabled", "disabled");
      }, 500);
    }

  }

  onReady() {
    if(this.ckeditor && this.content!= null)
    {
      this.scopeReview.description  = this.content;
      this.loading = false
      // or
      //this.ckeditor.instance.setData(this.myModelChanged);
    } else{
      this.getScopedata();
    }
  }

/**
* This method is to get the Scope data to the RFP
* @method getScopedata
*/
  getScopedata(){
    this.scopeReviewServices.getScopeReview(this.scopeReview.id).subscribe(r => {
      this.scopeReview.description = r.description
      this.loading = false;
      //  this.scopeReview.generalNotes = r.generalNotes
      this.tmpContactId = r.contactsCcList;
      // for (let i = 0; i < r.contactsCc.length; i++) {
      //   this.tmpContactId.push({ "id": r.contactsCc[i].id, "itemName": r.contactsCc[i].firstName + " " + r.contactsCc[i].lastName });
      // }
    })
  }


  /**
* This method check Save the data and process to preffered step
* @method saveOnHeader
* @param{stepNo} Step Name of RFP
*/
  saveOnHeader(stepNo: string) {
    this.saveScopeReview(false, stepNo)
  }
  /**
  * This method is used to get rfp detail
  * @method getRfpDetail
  */
  private getRfpDetail() {
    this.rfpListService.getById(this.id).subscribe(r => {
      this.rfpNumber = r.rfpNumber;
      document.title = 'RFP# ' + this.rfpNumber;
      this.getHeaderStatus(r);
      this.getRFPCreatorDetail(r);
    })
  }

  /**
 * This method is used to display rfp create and update details
 * @method getRfpDetail
 * @param {any} rfpDetail rfpDetail is an object of rfp
 */
  private getRFPCreatorDetail(rfpDetail: any) {
    // get Whole RFP detail
    this.rfpDetail = rfpDetail;
    // for created by
    if (this.rfpDetail.createdByEmployee) {
      this.createdBy = this.rfpDetail.createdByEmployee;
    }
    if (this.rfpDetail.createdDate) {
      if (this.createdBy) {
        this.createdBy += " on " + moment(this.rfpDetail.createdDate).format('MM/DD/YYYY hh:mm A');
      } else {
        this.createdBy = moment(this.rfpDetail.createdDate).format('MM/DD/YYYY hh:mm A');
      }
    }

    // for modified by
    if (this.rfpDetail.lastModifiedByEmployee) {
      this.modifiedBy = this.rfpDetail.lastModifiedByEmployee;
    }
    if (this.rfpDetail.lastModifiedDate) {
      if (this.createdBy) {
        this.modifiedBy += " on " + moment(this.rfpDetail.lastModifiedDate).format('MM/DD/YYYY hh:mm A');
      } else {
        this.modifiedBy = moment(this.rfpDetail.lastModifiedDate).format('MM/DD/YYYY hh:mm A');
      }
    }
  }

  /**
  * This method is used to display status of rfp
  * @method getHeaderStatus
  * @param {any} r rfpDetail is an object of rfp
  */
  getHeaderStatus(r: any) {
    if (r.completedStep >= 5) {
      this.showStep1 = this.showStep2 = this.showStep3 = this.showStep4 = this.showStep5 = 'success'
    } else if (r.completedStep >= 4) {
      this.showStep1 = this.showStep2 = this.showStep3 = this.showStep4 = 'success'
    } else if (r.completedStep >= 3) {
      this.showStep1 = this.showStep2 = this.showStep3 = 'success'
    } else if (r.completedStep >= 2) {
      this.showStep1 = this.showStep2 = 'success'
    } else if (r.completedStep >= 1) {
      this.showStep1 = 'success'
    }
  }

  /**
  * This method is used to restrict user from closing dropdown
  * @method closeDropdown
  */
  private closeDropdown(event: any) {
    event.stopPropagation();
  }

  /**
  * Get all dropdown data from contacts
  * @method getContacts
  */
  private getContacts(click?:string) {
    if (!this.contacts.length && !click && this.id > 0) {
      this.contactService.getContactDropdown().subscribe(r => {
        this.contacts = _.sortBy(r, function (i: any) { return i.itemName.toLowerCase(); });
      })
    }else{
      this.contactService.getrfpContactDropdown().subscribe(r => {
        this.contacts = _.sortBy(r, function (i: any) { return i.itemName.toLowerCase(); });
      })
    }
  }

  /**
  * This method is used to save record
  * @method saveScopeReview
  * @param {boolean} isSaveAndExit isSaveAndExit if it is true and redirect to listing RFP and if it is false than move to next step
  */
  saveScopeReview(isSaveAndExit: boolean, stepName: string) {
    this.formNotChanged = true
    this.loading = true
    this.scopeReview.contactsCc = []

    for (let i = 0; i < this.tmpContactId.length; i++) {
      this.scopeReview.contactsCc.push(parseInt(this.tmpContactId[i].id));
    }
    if (this.showRfpAddBtn == 'show') {
      this.scopeReviewServices.addScopeReview(this.scopeReview, this.id)
        .subscribe((r: any) => {
          this.loading = false
          this.toastr.success('Scope Review detail added successfully.')
          if (!isSaveAndExit && !stepName) {
            this.router.navigate(['/proposalReview', this.id])
          } else if (!isSaveAndExit && stepName) {
            this.router.navigate([stepName, this.id])
          } else if (isSaveAndExit) {
            this.router.navigate(['/rfp'])
          }

        }, e => {
          this.loading = false;
        });
    } else {
      if (!isSaveAndExit && !stepName) {
        this.router.navigate(['/proposalReview', this.id])
      } else if (!isSaveAndExit && stepName) {
        this.router.navigate([stepName, this.id])
      } else if (isSaveAndExit) {
        this.router.navigate(['/rfp'])
      }
    }

  }

  /**
  * This method is used to navigate user to RFP listing screen
  * @method getBack
  */
  getBack() {
    this.router.navigate(['/rfp'])
  }

  /**
 * This method is used to apply filter in company
 * @method applyCompanyFilter
 */
  applyCompanyFilter() {
    // this.table.clearPipeline()
    // this.table.ajax.reload()
  }

  /**
   *  Get selected item from dropdown
   * @method onItemSelect
   */
  onItemSelect(item: any) {
    this.applyCompanyFilter()
  }

  /**
*  Deselect item from dropdown
* @method OnItemDeSelect
*/
  OnItemDeSelect(item: any) {
    this.applyCompanyFilter()
  }

  /**
*  all items are selected from dropdown
* @method onSelectAll
*/
  onSelectAll(items: any) {
    this.applyCompanyFilter()
  }

  /**
*  all items are deselected from dropdown
* @method onDeSelectAll
*/
  onDeSelectAll(items: any) {
    this.applyCompanyFilter()
  }

  /**
  * This method is used for adding general notes in RFP
  * @method addGeneralNote
  */
  addGeneralNote() {
    this.openModalSendEmail(this.rfpprogressionnote)
  }

  /**
  * This method is used to open modal popup for openModalForm
  * @method openModalForm
  * @param {any} template type which contains template of create/edit module
  * @param {number} id it is optional which contains id if record is in edit mode
  */
  private openModalSendEmail(template: TemplateRef<any>, id?: number) {
    this.modalRef = this.modalService.show(template, { class: 'modal-add-task' })
  }

}