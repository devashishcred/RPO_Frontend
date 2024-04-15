import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { RelatedJob } from '../../../../../types/relatedJob';
import { JobContactServices } from '../JobContact.service';
import * as _ from 'underscore';
import { Job } from '../../../../../types/job';
import { Company } from '../../../../../types/company';
import { Contact } from '../../../../../types/contact';
import { Message } from '../../../../../app.messages';
import { JobContact } from '../jobConact'
import { TreeviewModule } from 'ngx-treeview';
import { TreeviewItem, TreeviewConfig } from 'ngx-treeview';

declare const $: any

/**
 * This component contains all function that are used in AddJobContactComponent
 * @class AddJobContactComponent
 */
@Component({
  selector: '[add-job-contact]',
  templateUrl: './addJobContact.component.html'
})

export class AddJobContactComponent {
  @Input() modalRef: BsModalRef
  @Input() onSave: Function
  @Input() idJob: number
  @Input() addRelatedJob: RelatedJob
  @Input() reload: Function
  @Input() loadagain?: Function
  @Input() isNew: boolean
  @Input() idJobContact: number

  private preRelatedJobContacts: any[] = []
  loading: boolean = false
  private selectCompany: number
  private company: Company[] = []
  companydropdownList: any = [];
  private selectContact: number
  private contact: Contact[] = []
  contactdropdownList: any = [];
  private selectContactAddress: number
  private contactAddress: any[] = []
  contactAddressdropdownList: any = [];
  private selectContactType: number
  private contactType: any[] = []
  contactTypedropdownList: any = [];
  dropdownSettings: any = {};
  private billingClient: boolean = false
  private mainClient: boolean = false
  errorMessage: any
  jobContact: JobContact
  private isAlreadyHaveProjectAccess: boolean = false;

  private config: any = {
    hasAllCheckBox: true,
    hasFilter: true,
    hasCollapseExpand: true,
    decoupleChildFromParent: false,
    maxHeight: 500,
    maxWidth: 5000
  }
  private items: TreeviewItem[];
  tmpServicesId: any

  private buttonClasses = [
    'btn-outline-primary',
    'btn-outline-secondary',
    'btn-outline-success',
    'btn-outline-danger',
    'btn-outline-warning',
    'btn-outline-info',
    'btn-outline-light',
    'btn-outline-dark'
  ];
  buttonClass = this.buttonClasses[3];

  jobGroupList: any = []
  blankList: any;
  blankList2: any;


  /**
   * This method define all services that requires in whole class
   * @method constructor
   */
  constructor(
    private toastr: ToastrService,
    private JobContactService: JobContactServices,
    private message: Message
  ) {
    this.errorMessage = this.message.msg;
    this.items = this.getBooks()
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.loading = true
    this.dropdownSettings = {
      singleSelection: false,
      text: "Group",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: true,
      classes: "myclass custom-class",
      badgeShowLimit: 1,
      tagToBody: false
    };
    document.title = 'Project'
    this.jobContact = {} as JobContact
    this.getJobContactTypes();
    this.jobContact.idJob = this.idJob
    this.getCompany();
    if (this.idJob != undefined && !this.isNew) {

      this.getJobContact('Edit');

      this.JobContactService.jobcontactgroups(this.idJob).subscribe(r => {
        this.jobGroupList = []
        if (r.length > 0) {
          this.jobGroupList = r
          if (!this.isNew && this.idJobContact > 0 && this.jobGroupList.length > 0) {

          }
        }
      }, e => {

      })
    }


  }

  /**
   * This method get all job contacts
   * @method getJobContact
   */
  getJobContact(editTime?: string) {
    this.JobContactService.getJobContactById(this.idJob, this.idJobContact).subscribe(r => {
      this.jobContact = r
      console.log('this.jobContact', this.jobContact)
      if (r?.hasJobAccess) {
        this.isAlreadyHaveProjectAccess = true
      }
      this.tmpServicesId = []
      if (r.jobContactJobContactGroups && r.jobContactJobContactGroups.length > 0) {
        r.jobContactJobContactGroups.forEach((element: any) => {
          this.tmpServicesId.push({
            id: element.idJobContactGroup,
            itemName: element.jobContactGroup
          })
        });
      }

      this.getContact(this.jobContact.idCompany, editTime)
      if (this.jobContact.idContact) {
        this.getContactAddress(this.jobContact.idCompany, this.jobContact.idContact)
      }
      this.jobContact.idCompany = this.jobContact.idCompany ? this.jobContact.idCompany : -1;
      this.JobContactService.getAllActiveContact(this.jobContact.idCompany).subscribe(r => {
        this.contact = _.sortBy(r, 'firstName');
      })

      if (!this.jobContact.idCompany && !editTime) {
        this.jobContact.idAddress = null
        this.jobContact.idContact = null
        this.contactAddressdropdownList = []
        this.contactdropdownList = []
      }
    })
  }


  /**
   * This method get all job contact Type - selectContact
   * @method getJobContactTypes
   */
  private getJobContactTypes() {
    this.JobContactService.getAllJobContactType().subscribe(r => {
      this.contactType = _.sortBy(r['data'], 'name');
      for (let i = 0; i < this.contactType.length; i++) {
        this.contactTypedropdownList.push({"id": this.contactType[i].id, "itemName": this.contactType[i].name});
      }
    })
  }

  /**
   * This method get all company list - selectCompany
   * @method getCompany
   */
  private getCompany() {
    this.loading = true;
    this.JobContactService.getAllCompany().subscribe(r => {
      this.company = _.sortBy(r, 'name');
      if (this.isNew) {
        this.getContact(this.jobContact.idCompany)
      }
      for (let j = 0; j < this.company.length; j++) {
        this.companydropdownList.push({"id": this.company[j].id, "itemName": this.company[j].name});

      }
      this.loading = false;
    })
  }


  getContactList(selectCompany: any) {
    this.contactdropdownList = []
    this.contactdropdownList = this.contact;
  }


  /**
   * This method get all contact list of company - selectContact
   * @method getContact
   * @param {number} selectCompany CompanyID
   */
  getContact(selectCompany: number, editTime?: string, contact?: number) {
    this.loading = true
    this.selectContact = null

    this.contactdropdownList = []
    if (selectCompany != null) {
      this.contactAddressdropdownList = [];
      this.JobContactService.getAllAddress(selectCompany, null).subscribe(r => {
        this.contactAddress = r;
        this.contactAddressdropdownList = [
          {
            id: this.contactAddress[0].id,
            itemName: '[' + this.contactAddress[0].addressType.name + '] ' + this.contactAddress[0].address1 + ', ' + (this.contactAddress[0].address2 != null ? this.contactAddress[0].address2 + ', ' : "") + (this.contactAddress[0].city != null ? this.contactAddress[0].city + ', ' : "") + this.contactAddress[0].state + ' ' + (this.contactAddress[0].zipCode != null ? this.contactAddress[0].zipCode : "") + '|' + (this.contactAddress[0].phone != null ? this.contactAddress[0].phone : '-')
          }
        ]
        for (let i = 1; i < this.contactAddress.length; i++) {
          this.contactAddressdropdownList.push({
            id: this.contactAddress[i].id,
            itemName: '[' + this.contactAddress[i].addressType.name + '] ' + this.contactAddress[i].address1 + ', ' + (this.contactAddress[i].address2 != null ? this.contactAddress[i].address2 + ', ' : "") + (this.contactAddress[i].city != null ? this.contactAddress[i].city + ', ' : "") + this.contactAddress[i].state + ' ' + (this.contactAddress[i].zipCode != null ? this.contactAddress[i].zipCode : "") + '|' + (this.contactAddress[i].phone != null ? this.contactAddress[i].phone : '-')
          });
        }
      })
      if (!this.isNew && this.idJobContact && !contact) {
        this.JobContactService.getAllContact(selectCompany).subscribe(r => {
          this.contact = _.sortBy(r, 'firstName');
          for (var i = 0; i < this.preRelatedJobContacts.length; i++) {
            this.contact = this.contact.filter(x => x.id != this.preRelatedJobContacts[i].idContact)
          }
          for (let k = 0; k < this.contact.length; k++) {
            this.contactdropdownList.push({"id": this.contact[k].id, "itemName": this.contact[k].firstName + ' ' + (this.contact[k].lastName != null ? this.contact[k].lastName : '')});
          }
        })
      } else {

        this.JobContactService.getAllActiveContact(selectCompany).subscribe(r => {
          this.contact = _.sortBy(r, 'firstName');
          for (var i = 0; i < this.preRelatedJobContacts.length; i++) {
            this.contact = this.contact.filter(x => x.id != this.preRelatedJobContacts[i].idContact)
          }
          for (let k = 0; k < this.contact.length; k++) {
            this.contactdropdownList.push({"id": this.contact[k].id, "itemName": this.contact[k].firstName + ' ' + (this.contact[k].lastName != null ? this.contact[k].lastName : '')});
          }
        })
      }

      this.loading = false;
    } else if (selectCompany == null && editTime) {
      if (!this.isNew) {
        this.JobContactService.getAllContact(-1).subscribe(r => {
          this.contact = _.sortBy(r, 'firstName');
          for (var i = 0; i < this.preRelatedJobContacts.length; i++) {
            this.contact = this.contact.filter(x => x.id != this.preRelatedJobContacts[i].idContact)
          }
          for (let k = 0; k < this.contact.length; k++) {
            this.contactdropdownList.push({"id": this.contact[k].id, "itemName": this.contact[k].firstName + ' ' + (this.contact[k].lastName != null ? this.contact[k].lastName : '')});
          }
        })
      } else {
        this.JobContactService.getAllActiveContact(-1).subscribe(r => {
          this.contact = _.sortBy(r, 'firstName');
          for (var i = 0; i < this.preRelatedJobContacts.length; i++) {
            this.contact = this.contact.filter(x => x.id != this.preRelatedJobContacts[i].idContact)
          }
          for (let k = 0; k < this.contact.length; k++) {
            this.contactdropdownList.push({"id": this.contact[k].id, "itemName": this.contact[k].firstName + ' ' + (this.contact[k].lastName != null ? this.contact[k].lastName : '')});
          }
        })
      }


      this.loading = false
    } else if (selectCompany == null && !editTime) {
      this.contactAddressdropdownList = [];
      this.jobContact.idJobContactType = null;
      if (!this.isNew && !contact) {
        this.JobContactService.getAllContact(-1).subscribe(r => {
          this.contact = _.sortBy(r, 'firstName');
          for (var i = 0; i < this.preRelatedJobContacts.length; i++) {
            this.contact = this.contact.filter(x => x.id != this.preRelatedJobContacts[i].idContact)
          }
          for (let k = 0; k < this.contact.length; k++) {
            this.contactdropdownList.push({"id": this.contact[k].id, "itemName": this.contact[k].firstName + ' ' + (this.contact[k].lastName != null ? this.contact[k].lastName : '')});
          }
        })
      } else {
        this.JobContactService.getAllActiveContact(-1).subscribe(r => {
          this.contact = _.sortBy(r, 'firstName');
          for (var i = 0; i < this.preRelatedJobContacts.length; i++) {
            this.contact = this.contact.filter(x => x.id != this.preRelatedJobContacts[i].idContact)
          }
          for (let k = 0; k < this.contact.length; k++) {
            this.contactdropdownList.push({"id": this.contact[k].id, "itemName": this.contact[k].firstName + ' ' + (this.contact[k].lastName != null ? this.contact[k].lastName : '')});
          }
        })
      }
    }
    this.loading = false
  }

  /**
   * This method will get already added job contacts
   * @method getPreviouslyAddedJobContact
   */
  private getPreviouslyAddedJobContact(): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.JobContactService.getAllJobContactById(this.idJob).subscribe(r => {
        this.preRelatedJobContacts = r.data
        resolve(null)
      }, e => {
        reject()
      })
    })
  }

  /**
   * This method get all address list of contact
   * @method getContactAddress
   * @param {number} selectContact Contact ID
   */
  getContactAddress(selectCompany: number, selectContact: number, contact?: string) {
    if (contact) {
      let num = 1;
      this.getContact(selectCompany, '', 1);
    }

    this.contactAddressdropdownList = [];
    if (selectContact != null) {
      this.JobContactService.getAllAddress(selectCompany, selectContact).subscribe(r => {
        this.contactAddress = r;
        this.contactAddressdropdownList = [
          {
            id: this.contactAddress[0].id,
            itemName: '[' + this.contactAddress[0].addressType.name + '] ' + this.contactAddress[0].address1 + ', ' + (this.contactAddress[0].address2 != null ? this.contactAddress[0].address2 + ', ' : "") + (this.contactAddress[0].city != null ? this.contactAddress[0].city + ', ' : "") + this.contactAddress[0].state + ' ' + (this.contactAddress[0].zipCode != null ? this.contactAddress[0].zipCode : "") + '|' + (this.contactAddress[0].phone != null ? this.contactAddress[0].phone : '-')
          }
        ]
        for (let i = 1; i < this.contactAddress.length; i++) {
          this.contactAddressdropdownList.push({
            id: this.contactAddress[i].id,
            itemName: '[' + this.contactAddress[i].addressType.name + '] ' + this.contactAddress[i].address1 + ', ' + (this.contactAddress[i].address2 != null ? this.contactAddress[i].address2 + ', ' : "") + (this.contactAddress[i].city != null ? this.contactAddress[i].city + ', ' : "") + this.contactAddress[i].state + ' ' + (this.contactAddress[i].zipCode != null ? this.contactAddress[i].zipCode : "") + '|' + (this.contactAddress[i].phone != null ? this.contactAddress[i].phone : '-')
          });
        }
        // this.loading = false
      }, e => {
        // this.loading = false
      });
    } else {
      this.jobContact.idAddress = null
      this.contactAddressdropdownList = []
    }
  }

  onItemSelect(item: any) {
  }

  OnItemDeSelect(item: any) {
  }

  onSelectAll(items: any) {
  }

  onDeSelectAll(items: any) {
  }

  /**
   * This method save job contact
   * @method save
   */
  save() {

    this.jobContact.jobContactJobContactGroups = []
    if (this.tmpServicesId && this.tmpServicesId.length > 0) {
      this.tmpServicesId.forEach((element: any) => {
        this.jobContact.jobContactJobContactGroups.push({
          id: 0,
          idJobContact: (this.isNew) ? 0 : this.jobContact.id,
          idJobContactGroup: element.id,
          itemName: element.itemName,
          name: element.name
        })
      });
    }
    this.loading = true
    if (!this.isNew) {
      // let data:any = this.jobContact
      // data['giveJobAccess'] = this.jobContact.hasJobAccess;
      // delete data.hasJobAccess
      // if(!this.isAlreadyHaveProjectAccess && this.jobContact.hasJobAccess && !this.jobContact.) {

      // }
      this.JobContactService.updateJobContact(this.jobContact, this.idJob, this.jobContact.id).subscribe(
        (r: any) => {
          if (!this.isAlreadyHaveProjectAccess && this.jobContact.hasJobAccess) {
            // if(!this.jobContact.isRegisteredCustomer) {
            //   this.toastr.warning('This customer is not registered on CUI Portal! Invitation mail sent!')
            //   this.loading = false;
            //   return
            // }
            if (this.jobContact.isRegisteredCustomer) {
              this.JobContactService.sendProjectAccessMail(this.jobContact.idContact, this.idJob).subscribe((res: any) => {
                this.toastr.success(res)
                this.reload()
                this.loadagain();
              }, e => {
                // this.loading = false
                this.toastr.error(e)
              })
            } else {
              this.toastr.success(r?.message || "Job Contact updated successfully")
              this.reload()
              this.loadagain();
            }
          } else {
            this.toastr.success(r?.message || "Job Contact updated successfully")
            this.reload()
            this.loadagain();
          }
          // this.loading = false
        }, e => {
          this.toastr.error(e)
          // this.loading = false
        })
      this.modalRef.hide()
    } else {
      this.JobContactService.addJobContact(this.jobContact, this.idJob).subscribe(
        (r: any) => {
          if (r?.idcustomer && r?.idcustomer !== 0) {
            this.JobContactService.sendProjectAccessMail(this.jobContact.idContact, this.idJob).subscribe((res: any) => {
              this.toastr.success(res)
              this.reload()
              this.loadagain();
            }, e => {
              // this.loading = false
              this.toastr.error(e)
            })
          } else if (r.idcustomer == 0) {
            this.toastr.success(r?.message)
            this.reload()
            this.loadagain();
          } else {
            this.toastr.success(r?.message || r)
            this.reload()
            this.loadagain();
          }
          // this.loading = false
        }, e => {
          this.toastr.error(e)
          // this.loading = false
        })
      this.modalRef.hide()
    }
  }


  onSelectedChange(event: any) {
  }

  onFilterChange(event: any) {
  }


  getBooks() {
    let arr: any = []
    const itCategory = new TreeviewItem(
      {
        text: 'Frontend', value: 911, children: [
          {text: 'Angular 1', value: 9111, checked: false},
          {text: 'Angular 2', value: 9112, checked: false},
          {text: 'ReactJS', value: 9113, checked: false}
        ]
      }
    );

    arr.push(itCategory)

    const itCategory1 = new TreeviewItem(
      {
        text: 'Backend', value: 911, children: null,
      },
    );
    arr.push(itCategory1)

    return arr
  }

}