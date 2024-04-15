import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { cloneDeep } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

import { Router } from '@angular/router';
import { AppComponent } from '../../../../app.component';
import * as _ from 'underscore';
import { Observable } from 'rxjs';

import { Message } from '../../../../app.messages';
import { EmployeeServices } from '../../../employee/employee.services'
import { Employee } from '../../../../types/employee';
import { Review } from './review'
import { ReviewServices } from './review.services'
declare const $: any


/**
* This component contains all function that are used in ReviewComponent
* @class ReviewComponent
*/
@Component({
    selector: '[review-employee]',
    templateUrl: './review.component.html',
    styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
    @Input() modalRefFee: BsModalRef
    @Input() idRfp: number

    employee: any
    loading: boolean = false
    dropdownSettings: any = [];
    errorMsg: any
    count: number
    reviewTeam: any = []

    constructor(
        private toastr: ToastrService,
        private router: Router,
        private message: Message,
        private modalService: BsModalService,
        private employeeService: EmployeeServices,
        private reviewServices: ReviewServices
    ) {
        this.errorMsg = message.msg
    }

    /**
    * This method will be called once only when module is call for first time
    * @method ngOnInit
    */
    ngOnInit() {
        this.loading = true
        this.count = 0
        this.dropdownSettings = {
            singleSelection: false,
            text: "Reviewer",
            enableSearchFilter: true,
            enableCheckAll: false,
            classes: "myclass custom-class",
            badgeShowLimit: 1
        };

        this.employeeService.getEmpDropdown().subscribe(r => {
            this.employee = _.sortBy(r, "itemName");
            this.loading = false
        })
        if (this.idRfp) {
            this.reviewServices.getReviewTeam(this.idRfp).subscribe(r => {
                // this.reviewTeam = []
                this.count = 0

                r.forEach((element: any, index: number) => {
                    this.count = this.count + 1
                    this.reviewTeam.push({ id: element.idReviewer, 'itemName': element.itemName })
                });
                this.loading = false
            }, e => {
                this.loading = false
            })
        } else {
            this.reviewTeam = []
        }
    }

    /**
     *  Get selected item from dropdown, it will also increase count on selecting review
     * @method onItemSelect
     */
    onItemSelect(item: any) {
        this.count = this.count + 1
    }
    /**
     *  Deselect item from dropdown, it will also decrease count on deselecting review
     * @method OnItemDeSelect
     */
    OnItemDeSelect(item: any) {
        this.count = this.count - 1
    }

    /**
    * This method is used to save reviewer details in database
    * @method save
    */
    save() {
        let requestData: any = []
        if (this.reviewTeam) {
            this.loading = true
            this.reviewTeam.forEach((element: any) => {
                requestData.push({
                    id: 0,
                    idRfp: this.idRfp,
                    idReviewer: element.id
                })
            });
            this.reviewServices.updateReviewTeam(this.idRfp, requestData).subscribe(r => {
                this.modalRefFee.hide()
                this.toastr.success('Proposal reviewer added successfully')
                this.loading = false
            }, e => {
                this.loading = false
            })
        }
    }
}