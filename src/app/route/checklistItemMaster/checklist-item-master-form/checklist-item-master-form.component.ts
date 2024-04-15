import { Component, Input, OnInit, ViewChild } from '@angular/core';
import * as _ from 'underscore';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { constantValues } from '../../../app.constantValues';
import { CheckListItemMaterServices } from '../checklistItemMaster.service';
import { JobDocumentServices } from '../../job/jobDetail/jobDocument/jobDocument.service';
import { Task } from '../../../types/task';
import { AddressProperty, ChecklistAddressProperty, checklistItem } from '../checklistItemMaster';
import { ToastrService } from 'ngx-toastr';
import { OwnerType } from '../../ownertype/ownerType';
import { OwnerTypeServices } from '../../ownertype/ownertype.services';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: '[checklist-item-master-form]',
  templateUrl: './checklist-item-master-form.component.html',
  styleUrls: ['./checklist-item-master-form.component.scss']
})
export class ChecklistItemMasterFormComponent implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() itemId: number
  @ViewChild("ckeditor", {static: true}) ckeditor: any;
  checklistItemData: any;
  private addressPropertyData: any;
  configuration: any;
  private dropdownSettings: any = {};
  InternalDocdropdownSettings: any = {};
  dropdownSettingsFroWorkPermits: any = {};
  loading: boolean = false
  private isApplication: boolean = false
  checklistGroups: any
  createDocuments: any
  uploadDocuments: any
  private applicationTypes = []
  private applicationTypeIds = []
  websiteLinks = []
  ownerTypes: OwnerType[] = []
  private addressPayload = [];

  dummyAddress = []
  specialDistricts = []


  jobDocumentPermitDDSettings: any = {}

  constructor(private constantValues: constantValues,
              private checkListItemMaterServices: CheckListItemMaterServices,
              private ownerTypeServices: OwnerTypeServices,
              private toastr: ToastrService,
              private jobDocumentServices: JobDocumentServices,) {
  }

  private dropdownList: any[] = [];
  listOfDocuments: any = []
  listOfWorkpermit: any = []
  internalReferenceDocuments: any = []
  id: number
  private selectedPeople3 = [];
  fetch: any[] = [];
  dummyPermit: any = [];

  ngOnInit(): void {
    this.configuration = this.constantValues.CKEDITORCONFIGSETTING;
    this.dropdownSettingsFroWorkPermits = {
      singleSelection: false,
      text: "Work Permit Types",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: true,
      classes: "myclass custom-class",
      badgeShowLimit: 1,
      tagToBody: false
    };
    this.InternalDocdropdownSettings = {
      singleSelection: false,
      text: "Internal Document",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: false,
      classes: "myclass custom-class",
      badgeShowLimit: 1,
      tagToBody: false
    };
    this.jobDocumentPermitDDSettings = {
      singleSelection: false,
      text: "Application Types",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: true,
      classes: "myclass custom-class",
      badgeShowLimit: 1,
      tagToBody: false
    };
    this.id = this.itemId

    this.getApplicationDropdown();
    this.getGroupTypeDropdown();
    this.getCreateFormDropdown();
    this.getUploadFormDropdown();
    this.getInternalDocumentDropdown();
    this.getOwnerTypeDropdown();
    this.getAddressPropertyData();
    this.getSpecialDistrictDropdown();
    this.checklistItemData = {} as checklistItem
    this.addressPropertyData = {} as AddressProperty
    this.checklistItemData.isActive = true;

    if (this.id && !this.isNew) {
      this.loading = true
      this.checkListItemMaterServices.getByItemMasterId(this.id).subscribe(r => {
        this.checklistItemData = r
        this.patchValue(r)
        if (r) {
          this.checkListItemMaterServices.getByItemChecklistAddressPropertyMaping(this.id).subscribe(r => {
            if (r.length > 0) {
              this.setAddressPropertyData(r)
            }
          })
        }
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.getApplicationDropdown();
      this.getAllPermitNoTypeBase();
    }
  }

  getAddressPropertyData() {
    this.loading = true;
    this.checkListItemMaterServices.getAddressProperty().subscribe(r => {
      this.dummyAddress = r;
      console.log('dummyAddress', this.dummyAddress)
      this.dummyAddress.map(r => {
        let pattern = /\s/g;
        r.fieldName = r.description.replace(pattern, '_');
        r.value = (r.idChecklistAddressProperty == 3 || r.idChecklistAddressProperty == 4) ? null : false;
        r.IsActive = false;
        r.siteSafty = (r.description.toLowerCase() == "site safety manager" || r.description.toLowerCase() == "site safety co-ordinator" || r.description.toLowerCase() == "superintendent of construction") ? true : false;
      })
      this.dummyAddress.sort((x, y) => Number(x.siteSafty) - Number(y.siteSafty));
    }, e => {
      this.loading = false
    })
  }


  patchValue(r) {
    if (r.idJobApplicationTypes) {
      this.getWorkpermitDropdown(r.idJobApplicationTypes)
      this.isApplication = true
      const ids = r.idJobApplicationTypes.split(',')
      this.applicationTypeIds = ids.map(r => parseInt(r))
    } else {
      this.getAllPermitNoTypeBase();
    }
    this.checklistItemData.idCheckListGroup = r.idCheckListGroup
    this.checklistItemData.IdCreateFormDocument = r.idCreateFormDocument;
    this.checklistItemData.idUploadFormDocument = r.idUploadFormDocument;
    this.checklistItemData.referenceDocuments = this.checklistItemData.referenceDocuments.map(v => ({...v, itemName: v.name}))
    this.websiteLinks = (this.checklistItemData.externalReferenceLink) ? this.checklistItemData.externalReferenceLink.split(',') : [];
    this.checklistItemData.externalReferenceLink = null;
    this.checklistItemData.jobapplicationtypes = this.checklistItemData.jobApplicationTypes.map(v => ({...v, itemName: v.description}))
    this.checklistItemData.jobWorkTypes = this.checklistItemData.jobWorkTypes.map(v => ({...v, itemName: v.description}))
  }


  setAddressPropertyData(r) {
    this.loading = true
    const activeProperty = r
    this.dummyAddress.map(r => {
      let findresult = activeProperty.find(ele => ele.idChecklistAddressProperty === r.id)
      r.id = findresult ? findresult.id : 0
      r.value = findresult ? findresult.value : null
      return r
    })
    const ownerTypeValue = r.find(r => r.idChecklistAddressProperty == 3)
    const specialDistrictValue = r.find(r => r.idChecklistAddressProperty == 4)
    const ids = r.map(r => r.idChecklistAddressProperty)

    this.dummyAddress.forEach(element => {
      if (ids.includes(element.idChecklistAddressProperty)) {
        if (element.idChecklistAddressProperty == 3) {
          element.value = parseInt(ownerTypeValue.value);
        }
        if (element.idChecklistAddressProperty == 4) {
          element.value = specialDistrictValue.value.split(',');
        }
        element.IsActive = true;
      }
    });
    console.log(this.dummyAddress)
    this.loading = false
  }

  /**
   * This method is used to get job types
   * @method getGroupTypes
   */
  getGroupTypeDropdown() {
    this.loading = true;
    this.checkListItemMaterServices.getCheckListGroupDropdown().subscribe(r => {
      const res = (!this.id) ? r.data.filter(r => r.isActive == true) : r.data;
      this.checklistGroups = res
      this.loading = false

    }, e => {
      this.loading = false
    })
  }


  /**
   * This method is used to get job types
   * @method getGroupTypes
   */
  getSpecialDistrictDropdown() {
    this.loading = true;
    this.checkListItemMaterServices.getSpecialDistrictDropdown().subscribe(r => {
      this.specialDistricts = r;
      this.loading = false

    }, e => {
      this.loading = false
    })
  }

  /**
   * This method is used to get job types
   * @method getCreateFormDropdown
   */
  getCreateFormDropdown() {
    this.loading = true;
    this.checkListItemMaterServices.getCreateDocuments().subscribe(r => {
      this.createDocuments = r
      this.loading = false

    }, e => {
      this.loading = false
    })
  }

  /**
   * This method is used to get job types
   * @method getUploadFormDropdown
   */
  getUploadFormDropdown() {
    this.loading = true;
    this.checkListItemMaterServices.getUploadDocuments().subscribe(r => {
      this.uploadDocuments = r
      this.loading = false

    }, e => {
      this.loading = false
    })
  }


  getWorkpermitDropdown(ids) {
    this.loading = true;
    const payload = {
      PermitId: ids.toString()
    };
    this.checkListItemMaterServices.getWorkpermitDropdown(payload).subscribe(res => {
      this.listOfWorkpermit = res
      if (this.checklistItemData.jobWorkTypes) {
        const arrayTwoIds = new Set(this.checklistItemData.jobWorkTypes.map((el) => el.id));
        const arrayOneFiltered = this.listOfWorkpermit.filter((el) => arrayTwoIds.has(el.id));
        this.checklistItemData.jobWorkTypes = (arrayOneFiltered.length == 0) ? null : arrayOneFiltered;
      }

      this.loading = false;
    }, e => {
      this.loading = false
    })
  }


  getInternalDocumentDropdown() {
    this.loading = true;
    this.checkListItemMaterServices.getInternalDocumentDropdown().subscribe(r => {
      this.internalReferenceDocuments = r
      this.loading = false
    }, e => {
      this.loading = false
    })

  }

  getOwnerTypeDropdown() {
    this.loading = true;
    this.ownerTypeServices.getDropdownData().subscribe(r => {
      this.ownerTypes = _.sortBy(r, "name")
      this.loading = false;
    }, e => {
      this.loading = false
    });


  }

  getApplicationDropdown() {
    this.loading = true;
    this.checkListItemMaterServices.getApplicationTypeDropdown().subscribe(r => {
      this.listOfDocuments = r
    }, e => {
      this.loading = false
    })

  }

  getAllPermitNoTypeBase() {
    this.loading = true;
    this.checkListItemMaterServices.getWorkpermitDropdownAll().subscribe(r => {
      this.dummyPermit = r
      this.listOfWorkpermit = this.dummyPermit;
      this.loading = false
    }, e => {
      this.loading = false
      //this.listOfWorkpermit = this.dummyPermit;
    })

  }

  /**
   * Get selected item from multiselect dropdown
   * @method onItemSelect
   * @param {any} item selected item
   */
  onItemSelect(item: any) {
    if (item) {
      this.applicationTypeIds.push(item.id)
      this.getWorkpermitDropdown(this.applicationTypeIds)
    }
  }

  /**
   * Get selected item from multiselect dropdown
   * @method OnItemDeSelect
   * @param {any} item selected item
   */
  OnItemDeSelect(item: any) {
    console.log(item)
    this.applicationTypeIds.splice(this.applicationTypeIds.indexOf(item.id), 1)
    if (this.applicationTypeIds.length == 0) {
      // this.listOfWorkpermit = this.dummyPermit
      this.getAllPermitNoTypeBase();
      console.log(this.dummyPermit)
      this.checklistItemData.jobWorkTypes = null
    } else {
      this.getWorkpermitDropdown(this.applicationTypeIds)
    }

  }

  /**
   * select on all in multiselect dropdown
   * @method onSelectAll
   * @param {any} items selected all items
   */
  onSelectAll(items: any) {
    const ids = items.map(r => r.id)
    this.applicationTypeIds = ids
    this.getWorkpermitDropdown(this.applicationTypeIds)
  }

  /**
   * deselect on all in multiselect dropdown
   * @method onDeSelectAll
   * @param {any} items deselected all items
   */
  onDeSelectAll(items: any) {
    this.applicationTypeIds = [];
    this.getAllPermitNoTypeBase();
  }


  saveItemMaster() {
    this.loading = true
    this.checklistItemData.IsUserfillable = false
    if (this.websiteLinks.length > 0) {
      const data = this.websiteLinks.toString()
      this.checklistItemData.externalReferenceLink = data
    }
    if (!this.id) {
      this.loading = true
      this.checkListItemMaterServices.create(this.checklistItemData).subscribe(r => {
        if (r.id) {
          this.dummyAddress.map(resp => {
            resp.IdChecklistItem = r.id
          })

          this.checkListItemMaterServices.createChecklistAddressPropertyMaping(this.dummyAddress).subscribe(r => {
            this.reload()
            this.modalRef.hide()
            this.toastr.success('Record created successfully')
            this.loading = false
          }, e => {
            this.loading = false
          })
        }
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.toastr.error('Wrong')
        this.loading = false
      })
    } else {
      this.checkListItemMaterServices.update(this.id, this.checklistItemData).subscribe(r => {
        this.loading = false
        if (r.id) {
          this.loading = true
          this.dummyAddress.map(resp => {
            resp.IdChecklistItem = r.id
          })

          this.checkListItemMaterServices.updateChecklistAddressPropertyMaping(this.dummyAddress, this.id).subscribe(r => {
            this.reload()
            this.modalRef.hide()
            this.toastr.success('Record updated successfully')
            this.loading = false
          }, e => {
            this.loading = false
          })
        }
      }, e => {
        this.loading = false
      })
    }
  }

  getSpecialDistrict(value) {
    if (value.length == 0) {
      this.addressPropertyData.Special_District = null;
      this.dummyAddress.forEach(r => {
        if (r.id == 4) {
          r.value = null;
        }
      })
    }
  }

  changeApplicationtType(event) {
    if (event.length > 0) {
      const ids = event.map(r => r.id)
      this.applicationTypeIds = ids
      this.isApplication ? this.getPermitDataBaseOnApplicationId(this.applicationTypeIds) : this.getWorkpermitDropdown(this.applicationTypeIds)
    } else {
      this.applicationTypeIds = [];
      this.listOfWorkpermit = [];
    }
  }

  getPermitDataBaseOnApplicationId(jobApplicationIds) {
    const jobWorkTypesids = this.checklistItemData.idJobWorkTypes.split(',')
    const jobWorkids = jobWorkTypesids.map(r => parseInt(r))
    const payload = {
      PermitId: jobApplicationIds.toString()
    };
    this.checkListItemMaterServices.getWorkpermitDropdown(payload).subscribe(r => {
      this.listOfWorkpermit = r
      this.listOfWorkpermit.map(r => r.disabled = false)
      this.listOfWorkpermit.forEach(element => {
        if (jobWorkids.includes(element.id)) {
          element.disabled = true;
        }
      });
    })
  }


  onCheckBoxSelect() {

  }

  /**
   * This method is used to delete documents from document object
   * @method addlink
   */
  addlink(link, isvalid) {
    if (link && isvalid) {
      const webSite = link.trim()
      this.websiteLinks.push(webSite);
      this.checklistItemData.externalReferenceLink = null;
    }


  }

  /**
   * This method is used to delete documents from document object
   * @method deletelink
   */
  deletelink(link) {
    this.websiteLinks.splice(this.websiteLinks.indexOf(link), 1)
  }

}
