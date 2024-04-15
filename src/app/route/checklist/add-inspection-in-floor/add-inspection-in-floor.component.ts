import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { CheckListItemMaterServices } from '../../checklistItemMaster/checklistItemMaster.service';
import { JobCheckListServices } from '../checklist/checklist.service';

interface ItemData {
  itmes: any,
  name: any
  id: any,
}

@Component({
  selector: '[add-inspection-in-floor]',
  templateUrl: './add-inspection-in-floor.component.html',
  styleUrls: ['./add-inspection-in-floor.component.scss']
})

export class AddInspectionInFloorComponent implements OnInit {
  @Input() modalRef: BsModalRef
  @Input() id: any;
  @Input() idJobPlumbingCheckListFloors: any;
  @Input() idWorkPermits: any;
  @Output() sendChildValue: EventEmitter<any> = new EventEmitter<any>();
  loading: boolean = false;
  allInspections: any = [];
  dropdownSettingsForFloors: any = {};
  public inspections: any = [];

  constructor(private checkListItemMaterServices: CheckListItemMaterServices,
              private jobCheckListServices: JobCheckListServices, private toastr: ToastrService) {
    console.log(this.id)
  }

  ngOnInit(): void {
    console.log(this.id)
    this.getAllInspections();
    this.dropdownSettingsForFloors = {
      singleSelection: false,
      text: "Inspection Type",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: true,
      classes: "w100",
      badgeShowLimit: 1,
      labelKey: 'name',
      primaryKey: 'id',
      tagToBody: false
    };
  }

  getAllInspections() {
    this.loading = true;
    this.checkListItemMaterServices.getCheckListItemsByPermitType(this.id, this.idWorkPermits).subscribe(r => {
      console.log(r);
      this.allInspections = r.map(v => ({name: v.name, id: v.id}));
      this.loading = false;
    }, e => {
      this.toastr.error(e)
      this.loading = false;
    })
  }

  saveData() {
    this.loading = true;
    let ids = this.id + '/' + this.idJobPlumbingCheckListFloors
    this.jobCheckListServices.saveInspectionInFloor(this.inspections, ids).subscribe(r => {
      this.modalRef.hide()
      this.sendChildValue.emit(true);
      this.toastr.success('Record created successfully')
      this.loading = false;
    }, e => {
      this.toastr.error(e)
      this.loading = false;
    })
  }

  close(e) {
    this.modalRef.hide()
    this.sendChildValue.emit(false);
  }
}
