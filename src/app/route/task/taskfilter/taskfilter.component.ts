import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { FilterTask } from '../../../types/task';
import { EmployeeServices } from '../../employee/employee.services';
import { TaskServices } from '../../task/task.services';
import { borough } from '../../../types/borough';
import { BoroughServices } from '../../../services/borough.services';
import * as _ from 'underscore';

/**
 * This component contains all function that are used in TaskFilterComponent
 * @class TaskFilterComponent
 */
@Component({
  selector: '[task-filter]',
  templateUrl: './taskfilter.component.html',
  styleUrls: ['./taskfilter.component.scss']
})
export class TaskFilterComponent implements OnInit {
  @Input() taskFilter: any
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() filledFilter: any
  @Input() reloadSearch: Function


  private sub: any
  private idJob: number
  employees: any = []
  taskType: any = []
  taskStatus: any = []
  boroughs: borough[] = []
  assignedByDDSettings: any
  loading: boolean = false
  task: any

  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private employeeServices: EmployeeServices,
    private taskServices: TaskServices,
    private boroughServices: BoroughServices,
  ) {
  }

  /**
   * This method will be called once only when module is call for first time
   * @method ngOnInit
   */
  ngOnInit() {
    // document.title = 'Task'
    this.sub = this.route.parent.params.subscribe(params => {
      this.idJob = +params['id']; // (+) converts string 'id' to a number
    });


    this.assignedByDDSettings = {
      singleSelection: false,
      text: "Select",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: false,
      badgeShowLimit: 1,
      classes: "myclass custom-class",
      tagToBody: false
    };
    this.loading = true
    this.getBoroughs();
    this.getTaskType()
    this.getTaskSatus()
    this.task = this.filledFilter
    if (this.isEmptyObject(this.filledFilter)) {
      this.task.isActiveJob = true
      this.task.isRfp = true
      this.task.isCompany = true
      this.task.isContact = true
      this.task.idTaskStatus = 1
    }

    this.getEmployees().then((r: any) => {
      if (typeof this.task.idAssignedBy != 'undefined' && this.task.idAssignedBy != '') {
        this.task.assignedBy = []
        const dataToSplit = this.task.idAssignedBy.split('-').map(Number)
        this.task.assignedBy = this.employees.filter((f: any) => dataToSplit.includes(f.id));
        console.log(this.employees)
      }
      if (typeof this.task.idAssignedTo != 'undefined' && this.task.idAssignedTo != '') {
        this.task.assignedTo = []
        const dataToSplitToOn = this.task.idAssignedTo.split('-').map(Number)
        this.task.assignedTo = this.employees.filter((f: any) => dataToSplitToOn.includes(f.id));
        console.log(this.employees)
      }
    })
  }

  /**
   * This method is used to check whether given object is empty or not
   * @method isEmptyObject
   * @param {any} obj obj which contains data
   */
  isEmptyObject(obj: any) {
    return (obj && (Object.keys(obj).length === 0));
  }

  /**
   * This method is used to close popup
   * @method closePopup
   */
  private closePopup() {
    this.modalRef.hide()
  }

  /**
   * This method is used when dropdown should not close
   * @method dropdownPropagation
   */
  private dropdownPropagation(event: any) {
    event.stopPropagation();
  }

  /**
   * This method is used to clear advance search, i.e. task filter
   * @method clearFilter
   */
  clearFilter() {
    this.task = {} as FilterTask
    this.reloadSearch(this.task)
    this.modalRef.hide()
  }

  /**
   * This method is used to apply advance search, i.e. task filter and reload datatable
   * @method applyFilter
   */
  applyFilter() {
    if (this.task.assignedBy && this.task.assignedBy.length > 0) {
      let tempIdAssignedBy: any = '';
      let ctr = 0;
      for (let i = 0; i < this.task.assignedBy.length; i++) {
        if (tempIdAssignedBy) {
          tempIdAssignedBy += "-" + this.task.assignedBy[i].id;
        } else {
          tempIdAssignedBy += this.task.assignedBy[i].id;
        }
        ctr++;
      }
      if (ctr == this.task.assignedBy.length) {
        this.task.idAssignedBy = tempIdAssignedBy;
      }
    } else {
      delete this.task.idAssignedBy;
    }
    if (this.task.assignedTo && this.task.assignedTo.length > 0) {
      let tempIdAssignedTo: any = '';
      let ctr = 0;
      for (let i = 0; i < this.task.assignedTo.length; i++) {
        if (tempIdAssignedTo) {
          tempIdAssignedTo += "-" + this.task.assignedTo[i].id;
        } else {
          tempIdAssignedTo += this.task.assignedTo[i].id;
        }
        ctr++;
      }
      if (ctr == this.task.assignedTo.length) {
        this.task.idAssignedTo = tempIdAssignedTo;
      }
    } else {
      delete this.task.idAssignedTo;
    }
    delete this.task.assignedBy;
    delete this.task.assignedTo;
    this.reloadSearch(this.task)
    this.modalRef.hide()
  }

  /**
   * Get all records from database of task type
   * @method getTaskType
   */
  getTaskType() {
    this.taskServices.getTaskType().subscribe(r => {
      this.taskType = r
    }, e => {
      this.loading = false
    })
  }

  /**
   * Get all records from database of task status
   * @method getTaskSatus
   */
  getTaskSatus() {
    this.taskServices.getTaskStatus().subscribe(r => {
      this.taskStatus = r
      this.loading = false
    }, e => {
      this.loading = false
    })
  }

  /**
   *  Get all records from database of employee
   * @method getEmployees
   */
  getEmployees(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loading = true

      this.employeeServices.getEmpDropdown().subscribe(r => {
        if (r && r.length > 0) {
          this.loading = true;
          let ctr = 0;
          for (let i = 0; i < r.length; i++) {
            r[i].itemName = r[i].employeeName;
            this.employees.push(r[i]);
            console.log(this.employees)
            ctr++;
          }
          if (ctr == r.length) {
            resolve(null)
            this.loading = false;
          }
        }
      }, e => {
        this.loading = false
        reject();
      })
    })

  }


  /**
   *  Get all records from database of Boroughs
   * @method getBoroughs
   */
  private getBoroughs() {
    this.boroughServices.getDropdownData().subscribe(r => {
      this.boroughs = _.sortBy(r, "description")
    })
  }

  /**
   * This method is used when task type is change for displaying appointment field in task form
   * @method taskChange
   * @param {any} e obj of evnet
   * @param {any} type type is used to indicate whether task is from job or not
   */
  taskChange(e: any, type: any) {
    if (type == 'isJob') {
      if (this.task.isActiveJob) {
        this.task.isActiveJob = false
        this.filledFilter.isActiveJob = false
      } else {
        this.task.isActiveJob = true
        this.filledFilter.isActiveJob = true
      }

    }
    if (type == 'isHold') {
      if (this.task.isHoldJob) {
        this.task.isHoldJob = false
        this.filledFilter.isHoldJob = false
      } else {
        this.task.isHoldJob = true
        this.filledFilter.isHoldJob = true
      }

    }
    if (type == 'isCompleted') {
      if (this.task.isCompletedJob) {
        this.task.isCompletedJob = false
        this.filledFilter.isCompletedJob = false
      } else {
        this.task.isCompletedJob = true
        this.filledFilter.isCompletedJob = true
      }

    }
    if (type == 'isRfp') {
      if (this.task.isRfp) {
        this.task.isRfp = false
        this.filledFilter.isRfp = false
      } else {
        this.task.isRfp = true
        this.filledFilter.isRfp = true
      }
    }

    if (this.task.isRfp == false && this.task.isActiveJob == false) {
      this.task.idBorough = ""
      this.filledFilter.idBorough = ""
      this.filledFilter.houseNumber = ""
      this.filledFilter.street = ""
      this.task.houseNumber = ""
      this.task.street = ""
    }
  }

  /**
   *  Get selected item from dropdown, it will also increase count on selecting review
   * @method onItemSelect
   */
  onItemSelect(item: any) {

  }

  /**
   *  Deselect item from dropdown, it will also decrease count on deselecting review
   * @method OnItemDeSelect
   */
  OnItemDeSelect(item: any) {
    this.task.assignedBy = this.task.assignedBy.filter((x: any) => x.id != item.id);
  }
}