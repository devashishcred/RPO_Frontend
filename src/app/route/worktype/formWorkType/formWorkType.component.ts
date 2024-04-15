import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'underscore';
import * as moment from 'moment';

import { Message } from '../../../app.messages';
import { constantValues } from '../../../app.constantValues';
import { WorkTypeServices } from '../workType.services';
import { WorkTypeDTO, RfpJobTypeCostRanges } from '../workType';
import { JobTypeServices } from '../../jobtype/jobType.services';
import { WorkTypeCategoryServices } from '../../worktypecategory/worktypecategory.services';

declare const $: any

/**
 * This component contains all function that are used in FormWorkType
 * @class FormWorkType
 */
@Component({
  selector: '[form-work-type]',
  templateUrl: './formWorkType.component.html'
})

export class FormWorkType implements OnInit {
  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() idRfpWorkType: number
  @ViewChild("ckeditor", {static: true}) ckeditor: any;
  content: string;
  id: number
  errorMessage: any
  configuration: any
  loading: boolean = false
  jobTypes: any
  subJobTypesCategory: any
  subJobTypes: any
  workTypesCategory: any
  workType: any
  costTypeListing: any = []
  partOfListing: any = []
  showAdditionalCost: boolean = false
  showCostRange: boolean = false
  costRange: any
  range: any
  rangeLength: number
  totalCum: number = 0

   cumulativeLenght: number
   showCumulative: boolean = false
   showServiceInHrs: boolean = false
   showCostType: boolean = false
   costNull: boolean = false

  constructor(
    private toastr: ToastrService,
    private message: Message,
    private constantValues: constantValues,
    private WorkTypeCategoryServices: WorkTypeCategoryServices,
    private jobTypeServices: JobTypeServices,
    private workTypeServices: WorkTypeServices,
  ) {
    this.errorMessage = this.message.msg;
    this.content = null;
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */

  ngOnInit() {
    this.constantValues.CKEDITORCONFIGSETTING.autoparagraph = false;
    this.configuration = this.constantValues.CKEDITORCONFIGSETTING;
    this.loading = true
    this.id = this.idRfpWorkType
    this.showAdditionalCost = false
    this.showCostRange = false
    this.showCumulative = false
    this.workType = {} as WorkTypeDTO
    this.costRange = {} as RfpJobTypeCostRanges
    this.workType.rfpJobTypeCostRanges = []
    this.workType.rfpJobTypeCumulativeCosts = []


    this.workType.level = 5
    this.partOfListing.push({id: 0, itemName: "ALT I"})
    this.partOfListing.push({id: 0, itemName: "ALT II"})
    this.partOfListing.push({id: 0, itemName: "ALT III"})
    this.costTypeListing.push({id: 1, itemName: "Fixed Cost"})
    this.costTypeListing.push({id: 2, itemName: "Per Unit Price"})
    this.costTypeListing.push({id: 3, itemName: "Additional Cost Per Unit"})
    this.costTypeListing.push({id: 6, itemName: "Cumulative Cost"})
    this.costTypeListing.push({id: 7, itemName: "Hourly Cost"})

    this.getJobTypes()
    if (!this.id && this.isNew) {
      this.workType.isActive = true
      this.getSubJobTypesCagetory(0, false)
      this.getSubJobTypes(0, false)
      this.getWorkTypeCategory(0, false)
    } else {
    }

  }

  onReady() {
    if (this.ckeditor && this.content != null) {
      this.workType.serviceDescription = this.content;
      this.loading = false
    } else {
      if (!this.isNew) {
        this.getWorkTypeById();
      }

    }
  }

  /**
   * This method is used to get all work type based on id
   * @method getWorkTypeById
   */
  getWorkTypeById() {
    if (this.id && !this.isNew) {
      this.workTypeServices.getById(this.id).subscribe(r => {
          this.workType = r
          this.constantValues.CKEDITORCONFIGSETTING.autoparagraph = true
          this.configuration = this.constantValues.CKEDITORCONFIGSETTING;
          if (this.workType.idRfpJobType) {
            this.getJobTypes()
            this.getSubJobTypesCagetory(this.workType.idRfpJobType, false)
          }


          this.costTypeChange()

          if (this.workType.rfpJobTypeCumulativeCosts.length > 0) {
            this.cumulativeLenght = this.workType.rfpJobTypeCumulativeCosts.length
          }

          if (this.workType.rfpJobTypeCostRanges.length > 0) {
          }

          this.loading = false
        },
        e => {
          this.loading = false
        })
    }
  }

  /**
   * This method is used to get all job types
   * @method getJobTypes
   */
  getJobTypes() {

    this.jobTypeServices.getDropDown().subscribe(r => {
      this.jobTypes = r.filter((x: any) => x.level == 1)
      this.loading = false
    }, e => {
      this.loading = false
    })
  }

  /**
   * This method is used to get sub job type category
   * @method getSubJobTypesCagetory
   * @param {number} idJobType idJobType as number
   * @param {boolean} isNew is used to check whether record is new or old
   */
  getSubJobTypesCagetory(idJobType: number, isNew?: boolean) {
    if (isNew) {
      this.workType.idRfpSubJobTypeCategory = null
      this.subJobTypesCategory = []
      this.subJobTypes = []
      this.workTypesCategory = []
      this.workType.idRfpSubJobTypeCategory = null
      this.workType.idRfpSubJobType = null
      this.workType.idRfpServiceGroup = null
    }


    if (idJobType != null) {
      this.jobTypeServices.getRfpSubJobType(idJobType).subscribe(r => {
        this.subJobTypesCategory = []
        this.subJobTypesCategory = r.filter((x: any) => x.level == 2)
        this.getSubJobTypes(idJobType, false)
        this.getWorkTypeCategory(idJobType, false)
        if (this.workType.idRfpSubJobTypeCategory) {
          this.getSubJobTypes(this.workType.idRfpSubJobTypeCategory, false)
        }
        this.getPartOfbyServiceGroup(idJobType, this.workType.idRfpSubJobTypeCategory, this.workType.idRfpSubJobType);
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {

      this.subJobTypesCategory = []
      this.subJobTypes = []
      this.workTypesCategory = []
      this.partOfListing = []
      this.workType.partOf = null
      this.workType.idRfpSubJobTypeCategory = null
      this.workType.idRfpSubJobType = null
      this.workType.idRfpServiceGroup = null
    }
  }


  /**
   * This method is used to get sub job type category
   * @method getSubJobTypesCagetory
   * @param {number} idRfpSubJobTypeCategory idRfpSubJobTypeCategory as number for getting sub job type category
   * @param {boolean} isNew is used to check whether record is new or old
   */
  getSubJobTypes(idRfpSubJobTypeCategory: number, isNew?: boolean) {
    if (idRfpSubJobTypeCategory != null) {
      if (idRfpSubJobTypeCategory != null) {
        this.jobTypeServices.getRfpSubJob(idRfpSubJobTypeCategory).subscribe(r => {
          this.subJobTypes = []
          this.subJobTypes = r.filter((x: any) => x.level == 3)
          this.getWorkTypeCategory(idRfpSubJobTypeCategory, false)
          if (this.workType.idRfpSubJobType) {
            this.getWorkTypeCategory(this.workType.idRfpSubJobType, false)
          }
          this.loading = false
        }, e => {
          this.loading = false
        })
      }
      this.getPartOfbyServiceGroup(this.workType.idRfpJobType, idRfpSubJobTypeCategory, this.workType.idRfpSubJobType);
    } else {
      this.subJobTypes = []
      this.workTypesCategory = []
      this.partOfListing = []
      this.workType.partOf = null
      this.workType.idRfpSubJobType = null
      this.workType.idRfpServiceGroup = null
      this.getPartOfbyServiceGroup(this.workType.idRfpJobType, this.workType.idRfpSubJobTypeCategory, this.workType.idRfpSubJobType);
    }
  }

  /**
   * This method is used to get work type category
   * @method getSubJobTypesCagetory
   * @param {number} idRfpWorkTypeCategory idRfpWorkTypeCategory as number for getting work type category
   * @param {boolean} isNew is used to check whether record is new or old
   */
  getWorkTypeCategory(idRfpWorkTypeCategory: number, isNew?: boolean) {
    if (idRfpWorkTypeCategory != null) {
      this.jobTypeServices.getRfpWorkTypeCategory(idRfpWorkTypeCategory).subscribe(r => {
        this.workTypesCategory = []
        this.workTypesCategory = r.filter((x: any) => x.level == 4)
        this.loading = false
      }, e => {
        this.loading = false
      })
      this.getPartOfbyServiceGroup(this.workType.idRfpJobType, this.workType.idRfpSubJobTypeCategory, this.workType.idRfpSubJobType);
    } else {
      this.workTypesCategory = []
      this.workType.idRfpServiceGroup = null
      this.partOfListing = []
      this.workType.partOf = null
      this.getPartOfbyServiceGroup(this.workType.idRfpJobType, this.workType.idRfpSubJobTypeCategory, this.workType.idRfpSubJobType);

    }
  }

  getPartOfbyServiceGroup(idJobType: number, idJobTypeDesc?: number, idSubJobType?: number) {
    if (idJobType == undefined) {
      idJobType = 0
    }
    if (idJobTypeDesc == undefined) {
      idJobTypeDesc = 0
    }
    if (idSubJobType == undefined) {
      idSubJobType = 0
    }


    this.loading = true;
    this.workTypeServices.getPartOfDD(idJobType, idJobTypeDesc, idSubJobType).subscribe(r => {
      this.partOfListing = []
      this.partOfListing = r
      this.loading = false
    }, e => {
      this.loading = false
    })

  };


  costBlur(value: any) {
    if (value == '') {
      this.costNull = true;
    } else {
      this.costNull = false;
    }
  }

  /**
   * This method is used to get all job types
   * @method isDecimal
   * @param {any} evt event that occurs when key press
   * @param {boolean} isNew is used to check whether record is new or old
   */
  isDecimal(evt: any) {
    //getting key code of pressed key
    var keycode = (evt.which) ? evt.which : evt.keyCode;
    //comparing pressed keycodes
    if (!(keycode == 8 || keycode == 46) && (keycode < 48 || keycode > 57)) {
      return false;
    } else {
      var parts = evt.srcElement.value.split('.');
      if (parts.length > 1 && keycode == 46)
        return false;
      return true;
    }
  }

  /**
   * This method is used to get selection on start
   * @method getSelectionStart
   * @param {any} o event that occurs when key press
   */
  getSelectionStart(o: any) {
    return o.selectionStart
  }


  /**
   * This method is used to calculate cost when cost type is changed
   * @method costTypeChange
   */
  costTypeChange() {
    if (this.workType.costType == 0) {
      this.showCostType = true
    } else {
      this.showCostType = false
    }
    if (this.workType.costType == null) {
      this.workType.cost = null
    }
    this.showAdditionalCost = false
    this.showCostRange = false
    this.showCumulative = false

    if (this.workType.costType == 3) {
      this.showAdditionalCost = true
    }
    if (this.workType.costType == 4) {
      this.showCostRange = true
    }
    if (this.workType.costType == 6) {
      this.showCumulative = true
    }
    if (this.workType.costType == 7) {
      this.showServiceInHrs = false
    }
    if (this.workType.costType == null) {
      this.workType.costType = null;
    }
  }


  /**
   * This method is used to add new range for specific cost
   * @method addNewRange
   */
  addNewRange(isNew?: boolean, id?: number) {
    let index = null
    if (isNew) {
      index = this.workType.rfpJobTypeCostRanges.length + 1
    } else {
      index = id
    }

    let tmpRange =
      {
        id: index,
        idRfpJobType: this.workType.idRfpJobType,
        minimumQuantity: '',
        maximumQuantity: '',
        cost: ''
      }
    this.workType.rfpJobTypeCostRanges.push(tmpRange)
    this.rangeLength = this.workType.rfpJobTypeCostRanges.length
  }

  /**
   * This method is used to remove exsiting range
   * @method removeRange
   * @param {number} index index is used to indicate which record in array
   */
  removeRange(index: number) {
    let delItem = this.workType.rfpJobTypeCostRanges[index];
    this.workType.rfpJobTypeCostRanges.splice(this.workType.rfpJobTypeCostRanges.indexOf(delItem), 1)
  }

  /**
   * This method is used to add cumulative cost when cost type is cumulative
   * @method addNewCumulative
   * @param {boolean} isNew it is optional used to check whether record is new or old
   * @param {number} id it is optional used to get previous array id
   */
  addNewCumulative(isNew?: boolean, id?: number) {
    if (this.workType.rfpJobTypeCumulativeCosts.length == 0 || this.workType.rfpJobTypeCumulativeCosts[this.workType.rfpJobTypeCumulativeCosts.length - 1].cumulativeCost > 0) {
      let index = null
      let cost = ''
      this.totalCum = this.workType.rfpJobTypeCumulativeCosts.length + 1
      this.cumulativeLenght = this.totalCum
      if (this.workType.rfpJobTypeCumulativeCosts.length > 0) {
        cost = this.workType.rfpJobTypeCumulativeCosts[this.totalCum - 2].cumulativeCost
      }
      if (isNew) {
        index = this.workType.rfpJobTypeCumulativeCosts.length + 1
      } else {
        index = id
      }
      let tmpCumilative =
        {
          id: index,
          idRfpJobType: this.workType.idRfpJobType,
          qty: this.totalCum,
          cumulativeCost: this.workType.rfpJobTypeCumulativeCosts.length > 0 ? cost : 1,
        }
      this.workType.rfpJobTypeCumulativeCosts.push(tmpCumilative)
    }
  }

  /**
   * This method is used to remove exsiting cumulative
   * @method removeCumulative
   * @param {number} index index is used to indicate which record in array
   */
  removeCumulative(index: number) {
    let delItem = this.workType.rfpJobTypeCumulativeCosts[index];
    this.workType.rfpJobTypeCumulativeCosts.splice(this.workType.rfpJobTypeCumulativeCosts.indexOf(delItem), 1)
    this.cumulativeLenght = this.workType.rfpJobTypeCumulativeCosts.length
  }

  /**
   * This method is used to save record
   * @method saveWorkType
   */
  saveWorkType() {
    this.workType.level = 5
    if (this.workType.idRfpJobType) {
      this.workType.idParent = this.workType.idRfpJobType
    }
    if (this.workType.idRfpSubJobTypeCategory) {
      this.workType.idParent = this.workType.idRfpSubJobTypeCategory
    }
    if (this.workType.idRfpSubJobType) {
      this.workType.idParent = this.workType.idRfpSubJobType
    }
    if (this.workType.idRfpServiceGroup) {
      this.workType.idParent = this.workType.idRfpServiceGroup
    }

    if (this.workType.costType == null) {
      delete this.workType.costType;
    }


    if (!this.id) {
      this.workType.isActive = true;
      this.jobTypeServices.create(this.workType).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.jobTypeServices.update(this.id, this.workType).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record updated successfully');
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }

  /**
   * This method is used to check whether entered value is min or max
   * @method CheckMinMax
   * @param {any} item the item which need to compare
   */
  CheckMinMax(item: any) {
    if (item.minimumQuantity) {
      item.minimumQuantity = parseInt(item.minimumQuantity)
    }
    if (item.maximumQuantity) {
      item.maximumQuantity = parseInt(item.maximumQuantity)
    }
  }
}