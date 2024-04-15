import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'underscore';

import { Message } from '../../../../app.messages';
import { constantValues } from '../../../../app.constantValues';
import { CheckListGroupServices } from '../../checklistMasterGruop';
import { checklistGroup } from '../../checklistMaterGruop.service';
import { UserRightServices } from '../../../../services/userRight.services';

declare const $: any

@Component({
  selector: '[checklist-master-group-form]',
  templateUrl: './checklist-master-group-form.component.html',
  styleUrls: ['./checklist-master-group-form.component.scss']
})
export class ChecklistMasterGroupFormComponent implements OnInit {

  @Input() isNew: boolean
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() groupId: number

  private errorMessage: any
  loading: boolean = false
  groupData: any
  groupTypes: any
  id: number
  private showCheckListGroupAddBtn: string = 'hide';
  private showCheckListGroupDeleteBtn: string = 'hide';
  constructor(
    private toastr: ToastrService,
    private message: Message,
    private constantValues: constantValues,
    private checkListGroupServices:CheckListGroupServices,
    private userRight: UserRightServices,
  ) {
    this.errorMessage = this.message.msg;
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    this.groupData = {} as checklistGroup
    this.showCheckListGroupAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDMASTERDATA)
    this.showCheckListGroupDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEMASTERDATA)
    this.loading = true
    this.id = this.groupId
    this.groupData.isActive = true;
    this.getGroupTypeDropdown()
    if (this.id && !this.isNew) {
      this.loading = true
      this.checkListGroupServices.getById(this.id).subscribe(r => {
        this.groupData = r
        this.groupData.displayorder = r.displayorder1;
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
     
    }

  }
  

 /**
    * This method is used to get job types
    * @method getGroupTypes
    */
  getGroupTypeDropdown() {
    this.checkListGroupServices.getGroupTypeDropdown().subscribe(r => {
      this.groupTypes = r
      this.loading = false

    }, e => {
      this.loading = false
    })
  }



  /**
  * This method is used to save record
  * @method saveGroup
  */
  saveGroup() {
    this.loading = true
    if (!this.id) {
      this.checkListGroupServices.create(this.groupData).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record created successfully')
        this.loading = false
      }, e => {
        this.loading = false
      })
    } else {
      this.checkListGroupServices.update(this.id, this.groupData).subscribe(r => {
        this.reload()
        this.modalRef.hide()
        this.toastr.success('Record updated successfully');
        this.loading = false
      }, e => {
        this.loading = false
      })
    }
  }
}
