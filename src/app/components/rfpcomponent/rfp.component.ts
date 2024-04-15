import { Component, Input, NgZone, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import { assign, identity, pickBy } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RfpListService } from '../../route/rfp/rfp.services';
import { rfp, rfpDTO } from './../../types/rfp';
import { CurrencyPipe } from '@angular/common';
import { AppComponent } from '../../app.component';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues } from '../../app.constantValues';
declare const $: any

@Component({
    selector: 'rfp-data-table',
    templateUrl: './rfp.component.html',
    styleUrls: ['./rfp.component.scss']
})
export class RfpCommonComponent {
    @Input() companyId: number
    @Input() contactId: number
    @Input() srch: string;

    private isConsulting: boolean
    private filter: any = {}
    private table: any
    private rfpDTORecords: rfpDTO
    private rfpModel: rfp
    private specialColumn: any
    //Rfp show hide
    private showRfpAddBtn: string = 'hide'
    private showRfpViewBtn: string = 'hide'
    private showRfpDeleteBtn: string = 'hide'
    //Task show hide
    private showTaskAddBtn: string = 'hide'
    //Job show hide
    private showJobAddBtn: string = 'hide'
    private userAccessRight: any = {}


    constructor(
        private router: Router,
        private zone: NgZone,
        private rfpListService: RfpListService,
        private currencyPipe: CurrencyPipe,
        private constantValues: constantValues,
        private userRight: UserRightServices
    ) {


        this.showRfpAddBtn = this.userRight.checkAllowButton(constantValues.ADDRFP)
        this.showRfpViewBtn = this.userRight.checkAllowButton(constantValues.VIEWRFP)
        this.showRfpDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETERFP)


        this.showJobAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOB)


        this.showTaskAddBtn = 'show'


        this.isConsulting = true
        this.specialColumn = new $.fn.dataTable.SpecialColumn([
            {
                id: 'CREATE_TASK',
                title: 'Create Task',
                customClass: this.showTaskAddBtn
            },
            {
                id: 'VIEW_RFP',
                title: 'View RFP',
                customClass: this.showRfpViewBtn
            },
            {
                id: 'SEND_EMAIL',
                title: 'Send Email'
            },
            {
                id: 'CREATE_JOB',
                title: 'Create Project',
                customClass: this.showJobAddBtn
            },
            {
                id: 'BIS',
                title: 'BIS'
            },
            {
                id: 'DELETE_RFP',
                title: 'Delete RFP',
                customClass: this.showRfpDeleteBtn
            },
        ], false)
    }
    ngOnInit() {
        var vm = this;

        if (this.companyId)
            this.filter.idCompany = this.companyId
        if (this.contactId)
            this.filter.idContact = this.contactId

        vm.table = $('#dt-rfp').DataTable({
            paging: true,
            dom: "<'row'<'col-sm-12'tr>>" +"<'row'<'col-sm-12 col-md-3'l><'col-sm-12 col-md-3'i><'col-sm-12 col-md-6'p>>",
            pageLength: 25,
            "bFilter": true,
            lengthChange: true,
            lengthMenu: [25, 50, 75, 100],
            language: {
                oPaginate: {
                    sNext: `<span class="material-symbols-outlined">arrow_forward</span>`,
                    sPrevious: `<span class="material-symbols-outlined">
            arrow_back
            </span>`,
                },
                lengthMenu: 'Rows per page _MENU_',
				infoFiltered: ""
            },
            "columnDefs": [
                { "type": "date", "targets": 2 }
            ],
            "aaSorting": [[2,'desc']],
            ajax: this.rfpListService.getRecordsWithSearch({
                onData: (data: any) => {
                    assign(data, pickBy(this.filter, identity))
                }
            }),

            //buttons: [this.pdfBtn, this.excelBtn],

            columns: [
                {
                    title: 'Proposal#',
                    data: 'rfpNumber',
                    visible: true,
                    class: "clickable",
                    width: 100,
                    render: function (data: any, type: any, dataToSet: any) {
                        if (dataToSet.lastUpdatedStep == 1) {
                            // return "<a  href='./editSiteInformation/" + dataToSet.id + "' rel='noreferrer' target='_blank'>" + dataToSet.rfpNumber + " </a>";
                            return "<a  href='javascript:void(0)' class='rfp-red' rel='noreferrer' >" + dataToSet.rfpNumber + " </a>";
                        } else if (dataToSet.lastUpdatedStep == 2) {
                            // return "<a  href='./projectDetails/" + dataToSet.id + "' rel='noreferrer' target='_blank'>" + dataToSet.rfpNumber + " </a>";
                            return "<a  href='javascript:void(0)' rel='noreferrer' class='rfp-red' >" + dataToSet.rfpNumber + " </a>";
                        } else if (dataToSet.lastUpdatedStep == 3) {
                            // return "<a  href='./scopeReview/" + dataToSet.id + "' rel='noreferrer' target='_blank'>" + dataToSet.rfpNumber + " </a>";
                            return "<a  href='javascript:void(0)' class='rfp-red' rel='noreferrer' >" + dataToSet.rfpNumber + " </a>";
                        } else if (dataToSet.lastUpdatedStep == 4) {
                            // return "<a  href='./proposalReview/" + dataToSet.id + "' rel='noreferrer' target='_blank'>" + dataToSet.rfpNumber + " </a>";
                            return "<a  href='javascript:void(0)' rel='noreferrer' class='rfp-red' >" + dataToSet.rfpNumber + " </a>";
                        } else if (dataToSet.lastUpdatedStep == 5) {
                            // return "<a  href='./rfpSubmit/" + dataToSet.id + "' rel='noreferrer' target='_blank'>" + dataToSet.rfpNumber + " </a>";
                            return "<a  href='javascript:void(0)' rel='noreferrer' class='rfp-red' >" + dataToSet.rfpNumber + " </a>";
                        } else {
                            // return "<a  href='./editSiteInformation/" + dataToSet.id + "' rel='noreferrer' target='_blank'>" + dataToSet.rfpNumber + " </a>";
                            return "<a  href='javascript:void(0)' rel='noreferrer' class='rfp-red' >" + dataToSet.rfpNumber + " </a>";
                        }
                    }
                },
                {
                    title: 'Property',
                    data: 'rfpAddress',
                    visible: true,
                    render: function (data: any, type: any, dataToSet: any) {
                        let address = ""
                        if (dataToSet.houseNumber) {
                            address = address + dataToSet.houseNumber
                        }
                        if (dataToSet.streetNumber) {
                            address = address + " " + dataToSet.streetNumber
                        }
                        if (dataToSet.borough) {
                            address = address + ", " + dataToSet.borough
                        }
                        if (dataToSet.zipCode) {
                            address = address + ", " + dataToSet.zipCode
                        }
                        return address;
                    },
                    class: "clickable"
                }, {
                    title: 'Modified Date',
                    data: 'lastModifiedDate',
                    visible: true,
                    width: 144,
                    class: "clickable"
                },
                {
                    title: 'Cost ($)',
                    data: 'cost',
                    width: 94,
                    class: "clickable text-right",
                    // render: function (data: any, type: any) {
                    //     return vm.currencyPipe.transform(data, 'USD', true);
                    // },
                    visible: true,
                }, {
                    title: 'Status',
                    data: function (data: any) {
                        return '<label class="label label' + data.idRfpStatus + ' status-label" data-placement="center" title="Status">' + data.rfpStatusDisplayName + '</label>'
                    },
                    visible: true,
                    width: 200,
                    class: 'text-center clickable maxWidth-300'
                },
                //   this.specialColumn
            ],
            rowCallback: ((row: any, data: any, index: any) => {
                // $(row).append("<a class='myanchor' id='' href='./editSiteInformation/" + data.id + "' rel='noreferrer' target='_blank'></a>")
            }),
            initComplete: () => {
                this.specialColumn
                    .ngZone(vm.zone)
                    .dataTable(vm.table)
                    .onActionClick((row: any, actionId: any) => {
                        const data = row.data()
                        if (actionId == 'VIEW_RFP') {
                            vm.onViewRFP(data);
                        }
                    })
            }
        });


        // $('#dt-rfp tbody').on('click', 'td.clickable', function (ev: any) {
        //     if ($(this).hasClass('clickable')) {
        //         $(this).parent('tr').find('.myanchor')[0].click()                
        //     }
        // });
        $('#dt-rfp tbody').on('click', 'td.clickable', function (ev: any) {
            const row = vm.table.row($(this).parents('tr'))
            const data = row.data()
            if ($(this).hasClass('clickable')) {
                vm.onViewRFP(data);
            }
        });
        $('#dt-rfp tbody').on('mousedown', 'a.rfp-red', function (ev: any) {
            const row = vm.table.row($(this).parents('tr'))
            const data = row.data()
            ev = ev || window.event;
            switch (ev.which) {
                case 1: vm.onViewRFP(data);
                    ; break;
                case 2: '';
                    break;
                case 3:
                    if (data.lastUpdatedStep == 1) {
                        $(this).attr('href', './editSiteInformation/' + data.id)
                    } else if (data.lastUpdatedStep == 2) {
                        $(this).attr('href', './projectDetails/' + data.id)
                    } else if (data.lastUpdatedStep == 3) {
                        $(this).attr('href', './scopeReview/' + data.id)
                    } else if (data.lastUpdatedStep == 4) {
                        $(this).attr('href', './proposalReview/' + data.id)
                    } else if (data.lastUpdatedStep == 5) {
                        $(this).attr('href', './rfpSubmit/' + data.id)
                    } else {
                        $(this).attr('href', './editSiteInformation/' + data.id)
                    }

                    ; break;
            }
 
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.srch) {
            this.search(this.srch)
        }
    }


    redirectToAddRfp() {
        this.router.navigate(['./SiteInformation']);
    }

    private onViewRFP(obj: any) {
        this.router.navigate(['./editSiteInformation/', obj.id])
    }

    public search(srch: string) {
        this.table.search(srch).draw()
    }
}