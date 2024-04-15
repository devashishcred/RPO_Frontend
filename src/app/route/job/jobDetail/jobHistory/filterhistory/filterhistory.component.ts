import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { TaskServices } from '../../../../task/task.services';
import { Task } from '../../../../../types/task';
import { JobApplicationService } from '../../../../../services/JobApplicationService.services';
import { Message } from "../../../../../app.messages";
import { JobHistoryServices } from '.././jobHistory.service';
import { EmployeeServices } from '../../../../employee/employee.services';
import * as _ from 'underscore';
import { Employee } from '../../../../../types/employee';

@Component({
  selector: '[filter-history]',
  templateUrl: './filterhistory.component.html'
})
export class FilterHistoryComponent implements OnInit {
  @Input() modalRef: BsModalRef
  @Input() reloadFilter: Function
  @Input() selectedEmp:any 
  @Input() selectedType:any 
  @Input() selectedStartDate:any 
  @Input() selectedEndDate:any 
  @Input() idJob:number 

  dropdownSettings: any = {};
  selectEmployee: any
  private employee: Employee[] = []
  employeedropdownList: any = [];
  selectType: any
  dropdownList: any[];
  filterStartDate: any
  filterEndDate: any
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private JobHistoryService: JobHistoryServices,
    private employeeServices: EmployeeServices,

  ) {
    
  }

  ngOnInit() {
    this.loading = true;
    this.dropdownSettings = {
      singleSelection: false,
      text: "Select Types",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 1,
      classes: "myclass custom-class"
    };
    this.getAllEmployee();
    this.getAllTypes();

    /*filled filter*/
    this.selectType = this.selectedType
    this.selectEmployee = this.selectedEmp
    this.filterStartDate = this.selectedStartDate
    this.filterEndDate = this.selectedEndDate
    
  }

  /* dropdown should not close */
  private closeDropdown(event:any){
    event.stopPropagation();
  }
  /**
   * get all Employee
   */
  private getAllEmployee() {
    this.employeeServices.getAllEmployee().subscribe(r => {
      this.employee =  _.sortBy(r['data'], 'firstName');
      this.loading = false;
      for (let j = 0; j < this.employee.length; j++) {
          this.employeedropdownList.push({ "id": this.employee[j].id, "itemName": this.employee[j].firstName+' '+ this.employee[j].lastName});
      }
    })
  }
  /**
   * get all Types
   */
  private getAllTypes() {
    this.dropdownList = [{ "id": 1, "itemName": 'Job'},
                          { "id": 2, "itemName": 'Applications'},
                          { "id": 3, "itemName": 'WorkPermits'},
                          { "id": 4, "itemName": 'Contacts'},
                          { "id": 6, "itemName": 'Transmittals_Memo'},
                          { "id": 7, "itemName": 'Scope'},
                          { "id": 8, "itemName": 'Billing Points'}
                        ];
  }
  onItemSelect(item: any) {

  }
  OnItemDeSelect(item: any) {
  }
  onSelectAll(items: any) {

  }
  onDeSelectAll(items: any) {

  }

  clearsearch() {
    this.selectEmployee = ''
    this.selectType = []
    this.filterStartDate = ''
    this.filterEndDate = ''
    this.searchHistory()
  }

  private closePopup() {
    this.modalRef.hide()
  }

  /* dropdown should not close */
  private dropdownPropagation(event: any) {
    event.stopPropagation();
  }

  searchHistory() {
    this.reloadFilter(this.idJob, this.selectType,this.selectEmployee,this.filterStartDate,this.filterEndDate)
    this.modalRef.hide()
  }
}