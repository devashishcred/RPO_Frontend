import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Checklist } from '../checklist/checklist.module';
import { JobCheckListServices } from '../checklist/checklist.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

interface Floor {
  id: number,
  floorNumber: any,
  name: string,
}

interface userData {
  FloonNumber: any,
  FloorName: any,
}

@Component({
  selector: '[generte-checklist]',
  templateUrl: './generte-checklist.component.html',
  styleUrls: ['./generte-checklist.component.scss']
})
export class GenerteChecklistComponent implements OnInit {
  @Input() modalRef: BsModalRef
  @Input() idChecklist: any;
  @Input() checklistType: any = 'General';
  @Input() checkListSwitcherData;
  @Input() isEditGeneralFromCompositeChecklist;
  @Output() sendChildValue: EventEmitter<any> = new EventEmitter<any>();
  @Output() sendChildValueAfterChecklistUpdate: EventEmitter<any> = new EventEmitter<any>();
  loading: boolean = false
  applications: any
  checklistGroups: any = [];
  workPermit: any = []
  private floorData: Floor;
  private floors: any;
  private idJob: number;
  isFloor: boolean = false;
  numbersOfFloors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  floorDropdownValue = []
  userData: any
  private checklistData: any
  public checklistByIdData
  public checklistByIdFormatedData
  dropdownSettingsFroWorkPermits: any = {};
  dropdownSettingsForGroup: any = {};
  dropdownSettingsForFloors: any = {};
  selectGroups: any;
  generalChecklistFormData: FormGroup
  compositeChecklistFormData: FormGroup
  JobPlumbingCheckListFloors: FormArray;
  // checklistType: string = 'general';
  allInspections = [];
  lastDeSelectGroup;
  lastDeSelectWorkPermit;
  isWorkpermitDeselectAll: boolean = false;
  isGroupDeselectAll: boolean = false;
  plId;
  selectedPeople: any;
  compositeSingeData: any;
  modalRefOfFloorConfirmation: BsModalRef
  @ViewChild("removeAllFloorConfirmation", {static: true})
  private removeAllFloorConfirmation: TemplateRef<any>;
  mainChecklistArray: any[] = [];
  compositeParentCheckListName: string = '';

  constructor(
    private jobCheckListServices: JobCheckListServices,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    public fb: FormBuilder,
    private modalService: BsModalService
  ) {
  }

  ngOnInit(): void {
    console.log('checkListSwitcherData', this.checkListSwitcherData)
    if (this.isEditGeneralFromCompositeChecklist) {
      this.checklistType = 'General'
    }
    if (this.checklistType == 'General') {
      this.initializeGeneralChecklistForm()
    } else {
      this.initializeCompositeChecklistForm()
    }
    console.log('this.idChecklist', this.idChecklist);
    this.route.parent.params.subscribe(params => {
      this.idJob = +params['id']; // (+) converts string 'id' to a number
      console.log(this.idJob)
    });

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
    this.dropdownSettingsForGroup = {
      singleSelection: false,
      text: "Checklist Group",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: true,
      classes: "myclass custom-class",
      badgeShowLimit: 1,
      maxHeight: 160,
      tagToBody: false
    };
    this.dropdownSettingsForFloors = {
      singleSelection: false,
      text: "Inspection Type",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: true,
      classes: "w100",
      badgeShowLimit: 1,
      labelKey: 'Name',
      primaryKey: 'Id',
      tagToBody: false
    };
    this.floors = [];
    this.userData = {} as userData
    this.checklistData = {} as Checklist
    this.getApplications();
    if (this.idChecklist && this.checklistType == 'General') {
      this.getChecklistById();
    } else if (this.idChecklist && this.checklistType == 'Composite') {
      this.getCompositeById()
    }
  }

  initializeGeneralChecklistForm() {
    this.generalChecklistFormData = this.fb.group({
      'IdJobapplication': ['', [Validators.required]],
      'JobApplicationWorkPermitTypes': [null],
      'CheckListGroups': [null],
      'NumFloor': [null],
      'IdJob': [null],
      'JobPlumbingCheckListFloors': this.fb.array([]),
      'typedFloor': [],
      'selectedInspection': [],
    })
  }

  initializeCompositeChecklistForm() {
    this.compositeChecklistFormData = this.fb.group({
      'IsCOProject': [false],
      'ParentChecklistheaderId': ['', [Validators.required]],
      'headerIds': [''],
    })
  }

  // Getter general checklist form
  get JobApplicationWorkPermitTypes() {
    return this.generalChecklistFormData.get('JobApplicationWorkPermitTypes');
  }

  get CheckListGroups() {
    return this.generalChecklistFormData.get('CheckListGroups');
  }

  get jobId() {
    return this.generalChecklistFormData.get('IdJob');
  }

  get typedFloor() {
    return this.generalChecklistFormData.get('typedFloor');
  }

  get selectedInspection() {
    return this.generalChecklistFormData.get('selectedInspection');
  }

  get allJobPlumbingCheckListFloors() {
    return this.generalChecklistFormData.get('JobPlumbingCheckListFloors') as FormArray;
  }

  // Getter composite checklist form
  get ParentChecklistheaderId() {
    return this.compositeChecklistFormData.get('ParentChecklistheaderId');
  }

  // JobPlumbingCheckListFloor functions start
  onAddJobPlumbingCheckListFloor() {
    this.JobPlumbingCheckListFloors = this.generalChecklistFormData.get('JobPlumbingCheckListFloors') as FormArray;
    this.JobPlumbingCheckListFloors.push(this.createJobPlumbingCheckListFloor());
    this.typedFloor.reset()
    this.selectedInspection.reset()
  }

  createJobPlumbingCheckListFloor(): FormGroup {
    if (this.typedFloor.value || this.selectedInspection.value) {
      if (this.idChecklist) {
        return this.fb.group({
          Id: [0],
          FloonNumber: [this.typedFloor.value, Validators.required],
          FloorDisplayOrder: [null],
          InspectionType: [this.selectedInspection.value],
          // InspectionType: [this.selectedInspection.value, Validators.required],
        });
      } else {
        return this.fb.group({
          FloonNumber: [this.typedFloor.value, Validators.required],
          FloorDisplayOrder: [null],
          InspectionType: [this.selectedInspection.value],
          // InspectionType: [this.selectedInspection.value, Validators.required],
        });
      }
      // InspectionType: [null], {"Id":2209,"Name":"Plumbing Inspection Item 1"}
    } else {
      if (this.idChecklist) {
        return this.fb.group({
          Id: [0],
          FloonNumber: [null, Validators.required],
          FloorDisplayOrder: [null],
          InspectionType: [null],
          // InspectionType: [null, Validators.required],
        });
      } else {
        return this.fb.group({
          FloonNumber: [null, Validators.required],
          FloorDisplayOrder: [null],
          InspectionType: [null],
          // InspectionType: [null, Validators.required],
        });
      }
    }
  }

  onDeleteJobPlumbingCheckListFloor(index: any) {
    this.JobPlumbingCheckListFloors?.removeAt(index);
  }

  // JobPlumbingCheckListFloor functions end


  /**
   * This method is used to get job types
   * @method getGroupTypes
   */
  getApplications() {
    this.loading = true;
    this.jobCheckListServices.getApplications(this.idJob).subscribe(r => {
      this.applications = r
      this.loading = false

    }, e => {
      this.loading = false
    })
  }

  /**
   * This method is used to get job types
   * @method getWorkPermit
   */
  getWorkPermit(id) {
    console.log('getWorkPermits', id)
    this.loading = true;
    this.jobCheckListServices.getWorkPermits(id).subscribe(r => {
      const map1 = r.map(v => ({...v, itemName: v.worktypedescription}));
      this.workPermit = map1
      console.log('this.workPermit', this.workPermit)
      if (this.idChecklist && this.checklistType == 'General') {
        const ids = this.checklistByIdData.strJobApplicationWorkPermitTypes.split(',');
        this.getChecklistGroupInEdit(ids)
      }
      this.loading = false
    }, e => {
      this.loading = false
    })
  }


  getFloorValue(evt) {
    console.log(evt.target.value);
    this.floorDropdownValue = [];
    for (var i = 1; i <= evt.target.value; i++) {
      this.floorDropdownValue.push({FloonNumber: i, isActive: false, id: i});
    }

    console.log(this.floorDropdownValue);
    // if(evt.target.value){
    //   this.floorDropdownValue.length = evt.target.value;
    // }else{
    //   this.floorDropdownValue.length = 0;
    // }
  }


  decimalFilter(event: any) {
    const reg = /^-?\d*(\.\d{0,2})?$/;
    let input = event.target.value + String.fromCharCode(event.charCode);

    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  /**
   * This method is used to get job types
   * @method getGroupTypes
   */
  getChecklistGroup() {
    this.loading = true;
    this.jobCheckListServices.getChecklistGroup().subscribe(r => {
      const map1 = r.map(v => ({...v, itemName: v.groupName}));
      this.checklistGroups = map1
      console.log(this.checklistGroups)
      this.loading = false

    }, e => {
      this.loading = false
    })
  }


  getChecklistGroupIdBase(ids) {
    this.loading = true;
    console.log(ids)
    this.jobCheckListServices.getChecklistGroupIdBase(ids).subscribe(r => {
      const map1 = r.map(v => ({...v, itemName: v.groupName}));
      this.checklistGroups = map1
      this.checkPl()
      console.log('this.checklistGroups', this.checklistGroups)
      this.loading = false
    }, e => {
      this.loading = false
    })
  }


  /**
   * This method is used to get job types
   * @method getGroupTypes
   */
  getChecklistGroupInEdit(ids) {
    this.loading = true;
    console.log('getChecklistGroupInEdit', ids)
    this.jobCheckListServices.getChecklistGroupIdBase(ids).subscribe(r => {
      console.log(r);
      r.forEach(array1Ttem => {
        if (this.selectGroups.includes(array1Ttem.id)) {
          array1Ttem.disabled = true;
        } else {
          array1Ttem.disabled = false;
        }
      })
      const map1 = r.map(v => ({...v, itemName: v.groupName}));
      this.checklistGroups = map1
      this.checklistData.CheckListGroups = this.selectGroups;
      console.log(this.checklistGroups);
      this.loading = false
      this.patchGeneralChecklistFormData()
    }, e => {
      this.loading = false
    })
  }

  toModelClose() {
    this.modalRef.hide();
  }

  selectApplication(evt) {
    console.log('aaaa', evt, this.checklistByIdData)
    if (evt || this.checklistByIdData?.idJobApplication) {
      this.getWorkPermit(evt?.id || this.checklistByIdData?.idJobApplication);
      this.JobApplicationWorkPermitTypes.setValue(null)
      this.checklistGroups = [];
      this.CheckListGroups.setValue(null)
      this.isFloor = false
      this.plId = ''
    } else {
      this.JobApplicationWorkPermitTypes.setValue(null)
      this.CheckListGroups.setValue(null)
      this.workPermit = [];
      this.checklistGroups = [];
      this.isFloor = false
    }
  }

  selectGroup(evt) {
    console.log(evt)
    if (evt) {
      const flterType = evt.filter(r => r.disabled == false);
      console.log(flterType);
      if (flterType.length > 0) {
        flterType.find(r => (r.type == "PL") ? this.isFloor = true : this.isFloor = false);
      } else {
        this.isFloor = false
      }

    } else {
      this.isFloor = false
    }
  }

  onClear(evt) {
    if (evt) {
      evt.find(r => (r.type == "PL") ? this.isFloor = true : this.isFloor = false);
    } else {
      this.isFloor = false
    }
  }

  setFloor(flr) {
    this.floorDropdownValue.length = flr;
    console.log(this.floorDropdownValue);
  }

  onSubmit() {
    // console.log('submitted formdata',formData);  
    const res = this.userData;
    const floorNumber = res.FloonNumber.replace('Floor ', '');
    console.log(floorNumber);
    this.floors.push(res);
    console.log(this.floorDropdownValue);
    this.floorDropdownValue.map(r => (r.FloonNumber == floorNumber) ? r.isActive = true : '')
    console.log('floors', this.floors);
    // form.reset();

    console.log(res);
    console.log(this.floorDropdownValue);
    console.log(this.floorDropdownValue);
    this.userData = {FloonNumber: '', FloorName: ''};
  }

  deleteFloor(i, FloonNumber) {
    console.log(this.floorDropdownValue)
    console.log(i)
    console.log(FloonNumber)
    const floorNumber = FloonNumber.replace('Floor ', '');
    this.floorDropdownValue.map(r => (r.id == floorNumber) ? r.isActive = false : '')
    console.log(this.floorDropdownValue)
    console.log(this.floors)
    this.floors.splice(i, 1);
  }

  getChecklistById() {
    this.jobCheckListServices.getCheckListById(this.idChecklist).subscribe(r => {
      console.log('get data by id', r)
      this.checklistByIdData = JSON.parse(JSON.stringify(r))
      // console.log('checklistByIdFormatedData',this.checklistByIdFormatedData);
      this.selectApplication(this.checklistByIdData.idJobapplication)
      const map1 = r.checkListGroups.map(v => v.id);
      this.selectGroups = r.checkListGroups.map(v => v.id);
      // console.log(map1)
    })
  }

  getCompositeById() {
    this.jobCheckListServices.getCompositeCheckListById(this.idChecklist).subscribe(r => {
      console.log('composite single data', r)
      this.compositeSingeData = r
      this.patchCompositeChecklist()
    })
  }

  /**
   *  Get selected item from dropdown, it will also increase count on selecting review
   * @method onItemSelect
   */
  onItemSelect(item: any) {
    console.log(this.allJobPlumbingCheckListFloors.value)
    if (this.CheckListGroups.value.length > 0) {
      this.checkPl()
    } else {
      this.isFloor = false
      this.floors = [];
      this.floorDropdownValue = [];
    }
  }

  checkPl() {
    this.isFloor = false
    console.log('JobApplicationWorkPermitTypes', this.JobApplicationWorkPermitTypes.value)
    console.log('CheckListGroups', this.CheckListGroups.value)
    let isPlSpSd = false
    if (this.JobApplicationWorkPermitTypes.value) {
      this.JobApplicationWorkPermitTypes.value.find(r => {
        if (r.workTypecode == "PL" || r.workTypecode == "SP" || r.workTypecode == "SD") {
          isPlSpSd = true
        }
      });
    }
    if (!isPlSpSd) {
      if (this.allJobPlumbingCheckListFloors.length > 0) {
        this.modalRefOfFloorConfirmation = this.modalService.show(this.removeAllFloorConfirmation, {
          class: "modal-sm",
          backdrop: "static",
          keyboard: false,
        });
      } else {
        this.isFloor = false
        if (this.CheckListGroups.value) {
          let tempGroups = this.CheckListGroups.value
          let index = tempGroups.findIndex(v => v.type == 'PL')
          if (index != -1) {
            tempGroups.splice(index, 1)
          }
          this.CheckListGroups.setValue(tempGroups)
          console.log('this.CheckListGroups', this.CheckListGroups.value)
        }
        if (!this.JobApplicationWorkPermitTypes.value || this.JobApplicationWorkPermitTypes.value?.length == 0) {
          this.checklistGroups = [];
          this.CheckListGroups.setValue(null)
        }
        this.plId = ''
      }
    } else {
      if (this.CheckListGroups.value) {
        this.CheckListGroups.value.find(r => {
          if (r.type == "PL") {
            this.isFloor = true
            this.plId = r.id
          }
        });
      }
    }
    if (this.isFloor && isPlSpSd && this.plId) {
      this.getAllinspections(this.JobApplicationWorkPermitTypes.value)
    }
  }

  /**
   *  Deselect item from dropdown, it will also decrease count on deselecting review
   * @method OnItemDeSelect
   */
  OnItemDeSelect(item: any) {
    console.log(item)
    if (item.type == 'PL') {
      this.lastDeSelectGroup = item
      if (this.allJobPlumbingCheckListFloors.length > 0) {
        this.modalRefOfFloorConfirmation = this.modalService.show(this.removeAllFloorConfirmation, {
          class: "modal-sm",
          backdrop: "static",
          keyboard: false,
        });
      } else {
        this.isFloor = false
        if (this.CheckListGroups.value) {
          let tempGroups = this.CheckListGroups.value
          let index = tempGroups.findIndex(v => v.type == 'PL')
          if (index != -1) {
            tempGroups.splice(index, 1)
          }
          this.CheckListGroups.setValue(tempGroups)
        }
        this.plId = ''
      }
    } else {
      this.lastDeSelectGroup = null
    }
  }

  /**
   *  all items are selected from dropdown
   * @method onSelectAll
   */
  onSelectAll(items: any) {
    if (items.length > 0) {
      let data = items.find(r => (r.type == "PL"));
      this.isFloor = false
      if (data?.type == "PL") {
        this.isFloor = true
        this.plId = data.id
      }
      if (this.isFloor) {
        this.getAllinspections(this.JobApplicationWorkPermitTypes.value)
      }
    } else {
      this.isFloor = false
      this.floors = [];
      this.floorDropdownValue = [];
    }
  }

  /**
   *  all items are deselected from dropdown
   * @method onDeSelectAll
   */
  onDeSelectAll(items: any) {
    console.log(items)
    if (this.allJobPlumbingCheckListFloors.length > 0) {
      this.isGroupDeselectAll = true
      this.modalRefOfFloorConfirmation = this.modalService.show(this.removeAllFloorConfirmation, {
        class: "modal-sm",
        backdrop: "static",
        keyboard: false,
      });
    } else {
      this.checkPl()
    }
  }

  onItemSelectPermit() {
    console.log(this.JobApplicationWorkPermitTypes.value)
    if (this.JobApplicationWorkPermitTypes.value.length > 0) {
      const ids = this.JobApplicationWorkPermitTypes.value.map(r => r.workTypecode)
      this.getChecklistGroupIdBase(ids);
    }
    ;
  }

  /**
   *  Deselect item from dropdown, it will also decrease count on deselecting review
   * @method OnItemDeSelect
   */
  OnItemDeSelectPermit(item: any) {
    if (item.workTypecode == "PL" || item.workTypecode == "SP" || item.workTypecode == "SD") {
      this.lastDeSelectWorkPermit = item
    } else {
      this.lastDeSelectWorkPermit = null
    }
    if (this.JobApplicationWorkPermitTypes.value.length > 0) {
      const ids = this.JobApplicationWorkPermitTypes.value.map(r => r.workTypecode)
      console.log(ids);
      this.getChecklistGroupIdBase(ids);
    } else {
      if (!this.lastDeSelectWorkPermit) {
        this.checklistGroups = [];
        this.CheckListGroups.setValue(null)
        this.checkPl()
      } else {
        this.checkPl()
      }
    }
  }

  /**
   *  all items are selected from dropdown
   * @method onSelectAll
   */
  onSelectAllPermit(items: any) {
    console.log(items);
    if (items.length > 0) {
      const ids = this.JobApplicationWorkPermitTypes.value.map(r => r.workTypecode)
      console.log(ids);
      this.getChecklistGroupIdBase(ids);
    }

  }

  /**
   *  all items are deselected from dropdown
   * @method onDeSelectAll
   */
  onDeSelectAllPermit(items: any) {
    console.log(items);
    this.isWorkpermitDeselectAll = true
    if (this.JobApplicationWorkPermitTypes.value.length > 0) {
      const ids = this.JobApplicationWorkPermitTypes.value.map(r => r.workTypecode)
      this.getChecklistGroupIdBase(ids);
    } else {
      this.checkPl()
    }
  }

  onSelectChecklistType(type: string) {
    this.checklistType = type
    if (this.checklistType == 'General') {
      this.initializeGeneralChecklistForm()
    } else {
      this.initializeCompositeChecklistForm()
    }
  }

  onItemSelectInspection(event) {

  }

  OnItemDeSelectInspection(event) {

  }

  onDeSelectAllInspection(event) {

  }

  onSelectAllInspection(event) {

  }

  onSubmitGeneralChecklist() {
    this.loading = true
    this.jobId.setValue(this.idJob)
    console.log('formdata', this.generalChecklistFormData.value)
    let data = this.generalChecklistFormData.value
    data.NumFloor = data.JobPlumbingCheckListFloors.length
    delete data.selectedInspection
    delete data.typedFloor
    console.log('before submit data', data)
    if (!this.isFloor) {
      data.JobPlumbingCheckListFloors = null
    }
    if (data.JobPlumbingCheckListFloors?.length > 0 && data.JobPlumbingCheckListFloors[0] != null) {
      data.JobPlumbingCheckListFloors = this.allJobPlumbingCheckListFloors.value.map((v, index): any => ({
        ...v,
        FloorDisplayOrder: index + 1
      }));
      for (let index = 0; index < data.JobPlumbingCheckListFloors.length; index++) {
        const floor = data.JobPlumbingCheckListFloors[index];
        if (floor.InspectionType?.length == 0) {
          data.JobPlumbingCheckListFloors[index].InspectionType = null
        }
      }
    }
    console.log('data', data)
    if (!this.idChecklist) {
      this.jobCheckListServices.generateChecklist(data).subscribe(r => {
        console.log(r)
        this.modalRef.hide()
        this.toastr.success('Record Created Successfully!')
        if (this.isEditGeneralFromCompositeChecklist) {
          this.sendChildValue.emit('Composite');
        } else {
          this.sendChildValue.emit('General');
        }
        this.loading = false
      }, e => {
        console.log(e)
        if (this.isEditGeneralFromCompositeChecklist) {
          this.sendChildValue.emit('Composite');
        } else {
          this.sendChildValue.emit('General');
        }
        this.loading = false
      })
    } else {
      data.IdJobCheckListHeader = this.idChecklist
      console.log(data)
      this.jobCheckListServices.updateChecklist(data).subscribe(r => {
        this.toastr.success('Record Updated successfully')
        this.modalRef.hide()
        if (this.isEditGeneralFromCompositeChecklist) {
          this.sendChildValue.emit('Composite');
        } else {
          this.sendChildValue.emit('General edit');
        }
        // this.sendChildValueAfterChecklistUpdate.emit(true);
        this.loading = false;
      }, e => {
        console.log(e)
        this.loading = false;
      })
    }
  }

  patchGeneralChecklistFormData() {
    console.log('this.checklistByIdData', this.checklistByIdData)
    let tempWorkPermitTypes = []
    let selectedWorkPermitTypes: any = this.checklistByIdData.strIdJobApplicationWorkPermitTypes.split(',')
    selectedWorkPermitTypes.forEach(id => {
      let data = this.workPermit.filter(el => el.id == id)
      tempWorkPermitTypes.push(data[0])
    });
    let tempGroups = []
    let selectedGroups = this.checklistByIdData.checkListGroups
    console.log('this.checklistGroups', this.checklistGroups);
    selectedGroups.forEach(element => {
      let data = this.checklistGroups.filter(el => el.id == element.id)
      tempGroups.push(data[0])
    });
    console.log('selectedWorkPermitTypes', selectedWorkPermitTypes)
    console.log('tempWorkPermitTypes', tempWorkPermitTypes)
    console.log('tempGroups', tempGroups)
    if (this.idChecklist) {
      this.checklistByIdFormatedData = {
        IdJobapplication: this.checklistByIdData.idJobApplication,
        JobApplicationWorkPermitTypes: tempWorkPermitTypes,
        CheckListGroups: tempGroups,
        NumFloor: this.checklistByIdData.noOfFloors,
        IdJob: this.checklistByIdData.idJob,
        JobPlumbingCheckListFloors: this.checklistByIdData.jobPlumbingChecklistFloors,
      }
      this.isFloor = false
      this.checklistByIdFormatedData.CheckListGroups.find(r => {
        if (r.type == "PL") {
          this.isFloor = true
          this.plId = r.id
        }
      });
      // this.CheckListGroups.value.find(r => (r.type == "PL") ? this.isFloor = true : this.isFloor = false);
      if (this.isFloor) {
        this.getAllinspections(tempWorkPermitTypes)
      }

      // this.checklistByIdFormatedData.CheckListGroups.find(r => (r.type == "PL") ? this.isFloor = true : this.isFloor = false);

      if (this.checklistByIdFormatedData.JobPlumbingCheckListFloors?.length > 0) {
        for (let index = 0; index < this.checklistByIdFormatedData.JobPlumbingCheckListFloors.length; index++) {
          console.log(this.checklistByIdFormatedData.JobPlumbingCheckListFloors[index])
          this.checklistByIdFormatedData.JobPlumbingCheckListFloors[index].inspectionType = this.checklistByIdFormatedData.JobPlumbingCheckListFloors[index].inspectionType.map(v => ({Id: v.id, Name: v.name}));
          this.onAddJobPlumbingCheckListFloor()
        }
      }
      this.checklistByIdFormatedData.JobPlumbingCheckListFloors = this.checklistByIdFormatedData.JobPlumbingCheckListFloors.map(v => ({
        FloonNumber: v.floonNumber,
        FloorDisplayOrder: v.floorDisplayOrder,
        InspectionType: v.inspectionType,
        Id: v.id
      }));
      this.checklistByIdFormatedData.JobPlumbingCheckListFloors = this.checklistByIdFormatedData.JobPlumbingCheckListFloors.sort((a, b) => {
        return a.FloorDisplayOrder - b.FloorDisplayOrder;
      });
      this.generalChecklistFormData.patchValue(this.checklistByIdFormatedData)
      console.log('checklistByIdFormatedData', this.checklistByIdFormatedData)
      console.log('this.isFloor', this.isFloor)

    }
  }

  getAllinspections(workPermitTypes) {
    this.loading = true
    try {
      let selectedWorkPermitTypes = workPermitTypes
      console.log('selectedWorkPermitTypes', selectedWorkPermitTypes)
      let workPermitIds = '';
      for (let index = 0; index < selectedWorkPermitTypes?.length; index++) {
        const workPermit = selectedWorkPermitTypes[index];
        if (selectedWorkPermitTypes?.length == index + 1) {
          workPermitIds += workPermit.idJobWorkType.toString()
        } else {
          workPermitIds += workPermit.idJobWorkType.toString() + ','
        }
      }
      let url = this.plId + '/' + workPermitIds
      console.log('workPermitIds', url)
      this.jobCheckListServices.getInspections(url).toPromise().then(res => {
        this.allInspections = res.map(v => ({Name: v.name, Id: v.id}));
        this.checkSelectedInspectionType()
        this.loading = false
      })
    } catch (err) {
      this.toastr.error(err)
      this.loading = false
      console.log(err)
    }
  }

  dropFloor(event: CdkDragDrop<string[]>) {
    console.log('this.allJobPlumbingCheckListFloors', this.allJobPlumbingCheckListFloors.value)
    moveItemInArray(this.allJobPlumbingCheckListFloors.value, event.previousIndex, event.currentIndex);
    const data = this.allJobPlumbingCheckListFloors.value.map((v, index): any => ({
      ...v,
      FloorDisplayOrder: index + 1
    }));
    console.log('arranged data', data)
    this.allJobPlumbingCheckListFloors.setValue(data)
    console.log('setted value', this.allJobPlumbingCheckListFloors.value)
  }

  checkIsPlRemove() {
    if (this.allJobPlumbingCheckListFloors.value.length > 0) {
      if (confirm('Are you sure you want to remove all floors')) {
        this.isFloor = false
        this.floors = [];
        this.floorDropdownValue = [];
      } else {
        this.isFloor = true
        this.lastDeSelectGroup
      }
    }
  }

  removeAllFloors() {
    this.isFloor = false
    if (this.CheckListGroups.value) {
      let tempGroups = this.CheckListGroups.value
      let index = tempGroups.findIndex(v => v.type == 'PL')
      if (index != -1) {
        tempGroups.splice(index, 1)
      }
      this.CheckListGroups.setValue(tempGroups)
      console.log('this.CheckListGroups', this.CheckListGroups.value)
    }
    if (!this.JobApplicationWorkPermitTypes.value || this.JobApplicationWorkPermitTypes.value?.length == 0) {
      this.checklistGroups = [];
      this.CheckListGroups.setValue(null)
    }
    this.plId = ''
    this.allJobPlumbingCheckListFloors.clear()
    this.modalRefOfFloorConfirmation.hide()
  }

  deniedToDeleteFloors() {
    console.log(this.lastDeSelectGroup)
    if (this.lastDeSelectGroup) {
      let selectedGroups = this.CheckListGroups.value || []
      selectedGroups.push(this.lastDeSelectGroup)
      this.CheckListGroups.patchValue(selectedGroups)
    }
    if (this.lastDeSelectWorkPermit) {
      let selectedWorkPermit = this.JobApplicationWorkPermitTypes.value || []
      selectedWorkPermit.push(this.lastDeSelectWorkPermit)
      this.JobApplicationWorkPermitTypes.patchValue(selectedWorkPermit)
      this.onItemSelectPermit()
    }
    if (this.isGroupDeselectAll) {
      this.CheckListGroups.patchValue(this.checklistGroups)
      this.onSelectAll(this.checklistGroups)
      this.isGroupDeselectAll = false
    }
    if (this.isWorkpermitDeselectAll) {
      this.JobApplicationWorkPermitTypes.patchValue(this.workPermit)
      this.onSelectAllPermit(this.workPermit)
      this.isWorkpermitDeselectAll = false
    }
    this.modalRefOfFloorConfirmation.hide()
  }

  getChecklistJob() {
    this.loading = true;
    this.jobCheckListServices.getChecklistWithJob(this.idJob, this.ParentChecklistheaderId.value).subscribe(r => {
      this.loading = false
      r.forEach((r) => r.listofGeneralChecklist.map((r) => r.isSelected = false));
      this.mainChecklistArray = r;
      console.log('mainChecklistArray', this.mainChecklistArray);
      if (this.checklistType == 'Composite' && this.idChecklist) {
        let checklist = this.compositeSingeData.filter(el => el.isParentCheckList == false)
        checklist = checklist.map(v => (v.idJobchecklist))

        for (let jobIndex = 0; jobIndex < this.mainChecklistArray.length; jobIndex++) {
          const element = this.mainChecklistArray[jobIndex];
          for (let checklistIndex = 0; checklistIndex < element.listofGeneralChecklist.length; checklistIndex++) {
            const element2 = element.listofGeneralChecklist[checklistIndex];
            if (checklist.includes(element2.idJobCheckListHeader)) {
              this.onSelectCheckList(jobIndex, checklistIndex, true)
            }
          }
        }

      }
    }, e => {
      this.loading = false
    })
  }

  // For Composite
  checkIsParentChecklistAlreadyExist() {
    this.jobCheckListServices.checkIsParentChecklistAlreadyExist(this.ParentChecklistheaderId.value).subscribe(r => {
      console.log(r)
      if (r) {
        this.toastr.warning("It's already created!")
      }
    }, e => {
      console.log(e)
      this.loading = false
    })
  }

  selectParentChecklist(event) {
    if (event != null) {
      this.checkIsParentChecklistAlreadyExist()
      this.getChecklistJob()
    }
  }

  onSelectCheckList(jobIndex, checklistIndex, isEdit?) {
    if (!isEdit) {
      this.mainChecklistArray[jobIndex].listofGeneralChecklist[checklistIndex].isSelected = !this.mainChecklistArray[jobIndex].listofGeneralChecklist[checklistIndex].isSelected
    } else {
      this.mainChecklistArray[jobIndex].listofGeneralChecklist[checklistIndex].isSelected = true
    }
  }

  patchCompositeChecklist() {
    let parentCheckList = this.compositeSingeData.find(el => el.isParentCheckList == true)
    console.log('parentCheckList', parentCheckList)
    this.compositeParentCheckListName = this.checkListSwitcherData.find(el => el.id == parentCheckList.idJobchecklist).checklistName
    let data = {
      IsCOProject: this.compositeSingeData[0].isCOProject,
      ParentChecklistheaderId: parentCheckList.idJobchecklist,
    }
    this.compositeChecklistFormData.patchValue(data)
    this.getChecklistJob()

    console.log(data)
    // this.compositeChecklistFormData.patchValue(data)
    // this.compositeSingeData
    // this.getChecklistJob()
  }

  onSubmitCompositeChecklist() {
    this.loading = true;
    if (!this.idChecklist) {
      let findCheckListName = this.checkListSwitcherData.find(el => el.id == this.ParentChecklistheaderId.value)
      let ChecklistheaderIds = []
      for (let index = 0; index < this.mainChecklistArray.length; index++) {
        const jobs = this.mainChecklistArray[index];
        for (let index2 = 0; index2 < jobs.listofGeneralChecklist.length; index2++) {
          const checklist = jobs.listofGeneralChecklist[index2];
          if (checklist.isSelected) {
            ChecklistheaderIds.push(checklist.idJobCheckListHeader)
          }
        }
      }
      let data = {
        Name: findCheckListName.checklistName,
        ChecklistheaderIds: ChecklistheaderIds,
        ParentJobId: this.idJob,
        IsCOProject: this.compositeChecklistFormData.value.IsCOProject,
        ParentChecklistheaderId: this.ParentChecklistheaderId.value
      }
      console.log('final data', data)
      this.jobCheckListServices.generateCompositeChecklist(data).subscribe(r => {
        this.toastr.success("Composite Checklist Created!")
        this.loading = false;
        this.modalRef.hide()
        this.sendChildValue.emit('Composite created');
      }, e => {
        console.log(e)
        this.toastr.error(e)
        this.loading = false;
      })
    } else {
      let isCOProject = this.compositeChecklistFormData.value.IsCOProject
      let ChecklistheaderIds = []
      for (let index = 0; index < this.mainChecklistArray.length; index++) {
        const jobs = this.mainChecklistArray[index];
        for (let index2 = 0; index2 < jobs.listofGeneralChecklist.length; index2++) {
          const checklist = jobs.listofGeneralChecklist[index2];
          if (checklist.isSelected) {
            ChecklistheaderIds.push(checklist.idJobCheckListHeader.toString())
          }
        }
      }
      let id = this.idChecklist + '/' + isCOProject
      console.log(id)
      console.log(ChecklistheaderIds)
      this.jobCheckListServices.updateCompositeChecklist(ChecklistheaderIds, id).subscribe(r => {
        this.toastr.success("Composite Checklist Updated!")
        this.loading = false;
        this.modalRef.hide()
        this.sendChildValue.emit('Composite');
      }, e => {
        console.log(e)
        this.toastr.error(e)
        this.loading = false;
      })
    }
  }

  checkSelectedInspectionType() {
    if (this.idChecklist) {
      return
    }
    let updatedData = JSON.parse(JSON.stringify(this.allJobPlumbingCheckListFloors.value))
    if (updatedData.length > 0) {
      for (let index = 0; index < updatedData.length; index++) {
        const element = JSON.parse(JSON.stringify(updatedData[index]));
        console.log('element', element)
        console.log('element.InspectionType.length', element.InspectionType.length)
        for (let index2 = 0; index2 < element.InspectionType.length; index2++) {
          const element2 = element.InspectionType[index2];
          console.log('element2', element2)
          console.log('this.allInspections', this.allInspections)
          let i = this.allInspections.findIndex(el => el.Id === element2.Id)
          console.log('i', i)
          if (i === -1) {
            let tempIndex = updatedData[index].InspectionType.findIndex(el => el.Id === element2.Id)
            updatedData[index].InspectionType.splice(tempIndex, 1)
            console.log('removed')
            this.allJobPlumbingCheckListFloors.controls[index].value.InspectionType.splice(tempIndex, 1)
            console.log('updatedData', updatedData)
          }
        }
        // const element = this.allJobPlumbingCheckListFloors.controls[index];
      }
    }
  }

}
