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
  selector: '[add-item-in-job]',
  templateUrl: './add-item-in-job.component.html',
  styleUrls: ['./add-item-in-job.component.scss']
})

export class AddItemInJobComponent implements OnInit {
  @Input() modalRef: BsModalRef
  @Input() id: any;
  @Output() sendChildValue: EventEmitter<any> = new EventEmitter<any>();
  loading: boolean = false;
  masterItems: any = [];
  dropdownSettingsFroWorkPermits: any = {};
  itemType = 'All';
  ItemsValue: any

  constructor(private checkListItemMaterServices: CheckListItemMaterServices,
              private jobCheckListServices: JobCheckListServices, private toastr: ToastrService) {
    console.log(this.id)
  }

  ngOnInit(): void {
    console.log(this.id)
    this.ItemsValue = {} as ItemData
    this.getAllItems();
    this.dropdownSettingsFroWorkPermits = {
      singleSelection: false,
      text: "Select Items",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: true,
      classes: "myclass custom-class",
      badgeShowLimit: 1,
      tagToBody: false
    };
  }

  selectItemType(evt) {
    if (evt == 'Manually') {
      this.ItemsValue.itmes = null;
    } else {
      this.ItemsValue.name = '';
    }
    this.itemType = evt;
  }

  getAllItems() {
    this.loading = true;
    this.checkListItemMaterServices.getCheckLisiItems(this.id).subscribe(r => {
      console.log(r);
      this.masterItems = r.map(v => ({...v, itemName: v.name}));
      this.loading = false;
    }, e => {
      this.loading = false;
    })
  }

  saveItem() {
    this.loading = true;
    this.ItemsValue.id = this.id;
    this.id = this.id + '/0'
    if (this.itemType == 'All') {
      this.jobCheckListServices.saveItemInChecklist(this.ItemsValue, this.id).subscribe(r => {
        this.modalRef.hide()
        this.sendChildValue.emit(true);
        this.toastr.success('Record created successfully')
        this.loading = false;
      }, e => {
        this.loading = false;
      })

    } else {

      this.jobCheckListServices.saveItemInChecklistManual(this.ItemsValue).subscribe(r => {
        this.modalRef.hide()
        this.sendChildValue.emit(true);
        this.toastr.success('Record created successfully')
        this.loading = false;
      }, e => {
        this.loading = false;
      })
    }

  }

  close(e) {
    this.modalRef.hide()
    this.sendChildValue.emit(false);
  }
}
