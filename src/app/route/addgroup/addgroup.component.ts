import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { Group } from './Group';
import { Message } from "../../app.messages";
import { constantValues, SharedService } from '../../app.constantValues';
import { ManageGroupServices } from './group.services';
import * as _ from 'underscore';

declare var $: any;

/**
  * AddGroupComponent class contains all function that are used in Add/Edit Group 
  * @class AddGroupComponent
  */
@Component({
  selector: '[add-group]',
  templateUrl: './addgroup.component.html',
  styleUrls: ['./addgroup.component.scss']
})
export class AddGroupComponent implements OnInit {
  @Input() modalRef: BsModalRef
  @Input() reload: Function
  @Input() idJob: number
  @Input() isNew: boolean

  // @Input() idGroup:number

  private sub: any

  group: any = []
  loading: boolean = false
  private newApplication: boolean = false
  errorMsg: any = {}
  private addNewRecord: boolean = false
  showMessage: boolean = false
  /**
    * This method define all services that requires in whole class
    * @method constructor
    */
  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private constantValues: constantValues,
    private groupServices: ManageGroupServices,
  ) {
    this.errorMsg = this.message.msg
  }

  /**
   * This method will call add/edit task form loads first time
   * @method ngOnInit
  */
  ngOnInit() {
    this.getGroupById()
  }

  /**
  * This method gets group detail of given group id
  * @method getGroupById
  */
  getGroupById() {
    this.loading = true;
    this.group = []
    this.groupServices.getById(this.idJob).subscribe((r: any) => {
      if (r.data && r.data.length > 0) {
        this.group = r.data
        this.showMessage = false
      } else {
        this.showMessage = true
      }
      this.loading = false
    }, e => { this.loading = false })
  }


  /**
   * This method will close popup
   * @method closePopup
   */
  private closePopup() {
    this.modalRef.hide()
  }

  /* dropdown should not close */
  private dropdownPropagation(event: any) {
    event.stopPropagation();
  }



  updateGroup(item: any, id: number) {
    this.loading = true
    if (item.id > 0) { // update scenario
      this.groupServices.update(id, item).subscribe(r => {
        this.getGroupById()
        this.reload();
        this.loading = false
        this.toastr.success(this.errorMsg.GroupUpdated)
      }, e => {
        this.loading = false
      })
    } else { //create scenario
      this.groupServices.create(item).subscribe(r => {
        this.loading = false
        this.getGroupById()
        this.addNewRecord = false
        this.toastr.success(this.errorMsg.GroupCreated)
      }, e => {
        this.loading = false
      })
    }

  }


  addGroup() {
    let gr: any = {
      id: 0,
      idJob: this.idJob,
      name: ''
    }
    if (!this.addNewRecord) {
      this.showMessage = false
      this.group.push(gr)
      this.addNewRecord = true
    } else {
      this.toastr.warning(this.errorMsg.GroupAtTime)
    }
  }

  deleteGroup(item: any, id: number) {
    this.groupServices.delete(item.id).subscribe(r => {
      this.getGroupById()
      this.reload();
      this.toastr.success(this.errorMsg.GroupDeleted)
      this.loading = false
    }, e => {
      this.loading = false
    })
  }
}