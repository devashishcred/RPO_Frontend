import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { JobApplication, Application } from '../../../../../types/jobApplication';
import { Message } from "../../../../../app.messages";
import { isIE } from '../../../../../utils/utils';
import { JobApplicationService } from '../../../../../services/JobApplicationService.services';
import { GetAppNoOnSelectRow } from '../../../../../app.constantValues';

declare const $: any

/**
 * This component contains all function that are used in FormAddApplication
 * @class FormAddApplication
 */
@Component({
  selector: '[form-add-application]',
  templateUrl: './formAddApplication.component.html'
})

export class FormAddApplication {
  @Input() modalRef: BsModalRef
  @Input() onSave: Function
  @Input() formAddApplication: JobApplication
  @Input() idJob: number
  @Input() selectedJobType: number
  @Input() reload: Function
  @Input() idJobApp: number
  dropdownSettings: any = {}
  private project: any = []
  applicationType: any = []
  workTypes: any = []
  private selectUndefinedOptionValue: any
  errorMsg: any
  private app: any
  application: Application
  private new: boolean = true
  loading: boolean = false
  appNUmberRequired: boolean = false
  workOnFloorRequired: boolean = false;

  /**
   * This method define all services that requires in whole class
   * @method constructor
   */
  constructor(
    private toastr: ToastrService,
    private message: Message,
    private jobApplicationService: JobApplicationService,
    private getAppNoOnSelectRow: GetAppNoOnSelectRow,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    this.dropdownSettings = {
      singleSelection: false,
      text: "select",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: true,
      badgeShowLimit: 1,
      classes: "myclass custom-class",
    };
    document.title = 'Projects'
    this.application = {} as Application
    this.loading = true
    this.applicationType = []
    this.jobApplicationService.getApplicationTypeDD(1).subscribe(r => {
      this.applicationType = r;
      this.getAppStatus()
    }, e => {
      this.loading = false
    })

  }

  /**
   * Get selected item from multiselect dropdown
   * @method onItemSelect
   * @param {any} item selected item
   */
  onItemSelect(item: any) {
  }

  /**
   *  Deselect item from multiselect dropdown
   * @method OnItemDeSelect
   * @param {any} item deselected item
   */
  OnItemDeSelect(item: any) {
  }

  /**
   * select on all in multiselect dropdown
   * @method onSelectAll
   * @param {any} items selected all items
   */
  onSelectAll(items: any) {
  }

  /**
   * deselect on all in multiselect dropdown
   * @method onDeSelectAll
   * @param {any} items deselected all items
   */
  onDeSelectAll(items: any) {
  }


  /**
   * This method get application status
   * @method getAppStatus
   */
  getAppStatus() {
    if (this.idJobApp && this.idJobApp > 0) {
      this.jobApplicationService.getApplicationById(this.idJobApp).subscribe(r => {
        this.application = r
        if (this.application.jobApplicationTypeName.indexOf("DOB NOW") !== -1) {
          this.workTypes = [];
          this.jobApplicationService.getWorkTypesDD(this.application.idJobApplicationType).subscribe(r => {
            this.workTypes = r;
            if (this.application.idJobWorkType) {
              const jp = this.application.idJobWorkType.split(',')
              const work: any = [];
              jp.forEach((element: any) => {
                let matchedParent = this.workTypes.filter((x: any) => x.id == element)[0];
                work.push(matchedParent);
              })
              this.application.idJobWorkTypes = work;
            }
          });
          this.workOnFloorRequired = true;

        }

        if (this.application.idJobWorkType != null) {
          this.workOnFloorRequired = true;
        }

        if (this.application.applicationNumber != null) {
          this.appNUmberRequired = true
        }
        if (this.application.floorWorking == null) {
          this.application.floorWorking = ""
        }
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.loading = false
    }
    this.application.idJob = this.idJob
  }

  /**
   * This method save DOB Job Application
   * @method saveDepJobApplication
   */
  saveJobApplication() {
    this.loading = true
    let newApplication = false
    if (this.application.id && this.application.id > 0) {
      newApplication = false
    } else {
      newApplication = true
    }
    delete this.application.lastModifiedDate
    if (this.application.idJobWorkTypes) {
      const idJobWorkTypes: any = this.application.idJobWorkTypes
      const Ids = idJobWorkTypes.map((s: any) => s.id)
      this.application.idJobWorkType = Ids.toString()
    }
    delete this.application.idJobWorkTypes
    this.loading = false
    this.jobApplicationService.addEditApplication(this.application, newApplication).subscribe(r => {
      if (newApplication) {
        this.toastr.success('Application added successfully')
      } else {
        this.toastr.success('Application updated successfully')
      }
      this.modalRef.hide()
      this.reload()
    }, e => {
      this.loading = false
    })
  }

  /**
   * This method delete DOB Job Application
   * @method deleteApplication
   */
  deleteApplication() {
    this.jobApplicationService.deleteApplication(this.application.id).subscribe(r => {
      this.toastr.success('Application deleted successfully')
      this.reload()
    }, e => {

    })
  }

  onChangeApplicationType(eve: any, idJobApplicationType: number) {
    if (eve) {
      if (eve.itemName.indexOf("DOB NOW") !== -1) {
        this.workTypes = [];
        this.jobApplicationService.getWorkTypesDD(idJobApplicationType).subscribe(r => {
          this.workTypes = r;
        });
        this.workOnFloorRequired = true;
      } else {
        this.application.idJobWorkType = null
        this.application.idJobWorkTypes = null
        this.workOnFloorRequired = false;
      }
    }

  }

}