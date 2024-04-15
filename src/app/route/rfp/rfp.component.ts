import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { assign, identity, pickBy } from 'lodash';
import { cloneDeep } from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RfpListService } from './rfp.services';
import { rfp, rfpDTO } from './../../types/rfp';
import { Job } from './../../types/job';
import { CurrencyPipe } from '@angular/common';
import { AppComponent } from '../../app.component';
import { UserRightServices } from '../../services/userRight.services';
import { constantValues, SharedService } from '../../app.constantValues';
declare const $: any

/**
* This component contains all function that are used in RfpComponent
* @class RfpComponent
*/
@Component({
    templateUrl: './rfp.component.html',
    styleUrls: ['./rfp.component.scss']
})
export class RfpComponent {
    /**
     * Add Task Form
     * @property addtask
     */
    @ViewChild('addtask', { static: true })
    private addtask: TemplateRef<any>

    /**
     * Rfp Progression note form
     * @property rfpprogressionnote
     */
    @ViewChild('rfpprogressionnote', { static: true })
    private rfpprogressionnote: TemplateRef<any>

    /**
     * Send Email Form
     * @property sendemail
     */
    @ViewChild('sendemail', { static: true })
    private sendemail: TemplateRef<any>

    /**
     * Add/Edit Job Form
     * @property formJob
     */
    @ViewChild('formJob', { static: true })
    private formJob: TemplateRef<any>
    modalRefJob: BsModalRef
    modalRef: BsModalRef
    private isConsulting: boolean
    private table: any
    private rfpDTORecords: rfpDTO
    private rfpModel: rfp
    private specialColumn: any
    //Rfp show hide
    showRfpAddBtn: string = 'hide'
    private showRfpViewBtn: string = 'hide'
    private showRfpDeleteBtn: string = 'hide'
    //Task show hide
    private showTaskAddBtn: string = 'hide'
    from: string;
    //Job show hide
    private showJobAddBtn: string = 'hide'
    private userAccessRight: any = {}
    idRfp: number
    jobObj: Job
    rfpObj: rfp
    private filter: any = {}
    private alreadyRFPLinkedWithJob: boolean = false;
    idrfpConatct: any;
    localSearch: boolean;
    localSearchText: string;
    srch: any;

    /**
    * This method define all services that requires in whole class
    * @method constructor
    */
    constructor(
        private router: Router,
        private zone: NgZone,
        private rfpListService: RfpListService,
        private currencyPipe: CurrencyPipe,
        private constantValues: constantValues,
        private userRight: UserRightServices,
        private modalService: BsModalService,
        private route: ActivatedRoute,
        private appComponent: AppComponent,
        private sharedService: SharedService,
    ) {
        this.permission(constantValues)
    }

    /**
    * This method will be called once only when module is call for first time
    * @method ngOnInit
    */
    ngOnInit() {
        this.from = 'RFP';
        this.jobObj = {} as Job
        this.rfpObj = {} as rfp
        this.filter = []
        this.loadDataTable()

        /* clearing local filter on routing to other route */
        this.router.events.subscribe(rEvent => {
            if (rEvent instanceof NavigationStart && !(rEvent.url.includes('rfp')))
                this.sharedService.rfpLocalFilter = undefined;
        })
        /** Global search routing */
        this.route.params.subscribe(params => {
            let globalSearchType = +params['globalSearchType'];
            let globalSearchText = params['globalSearchText'];
            if (globalSearchType && globalSearchText) {
                this.sharedService.rfpLocalFilter = undefined;
                this.filter['globalSearchType'] = globalSearchType
                this.filter['globalSearchText'] = globalSearchText
                $('#dt-rfp').DataTable().destroy()
                $('#dt-rfp').empty()
                this.loadDataTable()
            }
        });

        if (this.sharedService.rfpLocalFilter && (this.sharedService.rfpLocalFilter.searchText || this.sharedService.rfpLocalFilter.filter)) {
            if (this.sharedService.rfpLocalFilter.searchText) {
                this.srch = this.sharedService.rfpLocalFilter.searchText;
                this.table.search(this.srch).draw()
            }
            this.sharedService.rfpLocalFilter = undefined;
        }
        //If your date format is mm/dd//yyyy.
        jQuery.extend($.fn.dataTableExt.oSort, {
            "date-uk-pre": function (a: any) {
                if (a == null || a == "") {
                    return 0;
                }
                var ukDatea = a.split('/');
                return (ukDatea[2] + ukDatea[0] + ukDatea[1]) * 1;
            },
            "date-uk-asc": function (a: any, b: any) {
                return ((a < b) ? -1 : ((a > b) ? 1 : 0));
            },
            "date-uk-desc": function (a: any, b: any) {
                return ((a < b) ? 1 : ((a > b) ? -1 : 0));
            }
        });
    }

    /**
     * This method set permission for rfp listing buttons
     * @method permission
     * @param {any} constantValues set of permissions 
     */
    permission(constantValues: any) {
        this.showRfpAddBtn = this.userRight.checkAllowButton(constantValues.ADDRFP)
        this.showRfpViewBtn = this.userRight.checkAllowButton(constantValues.VIEWRFP)
        this.showRfpDeleteBtn = this.userRight.checkAllowButton(constantValues.DELETERFP)
        this.showJobAddBtn = this.userRight.checkAllowButton(constantValues.ADDJOB)
        this.showTaskAddBtn = 'show'
        this.isConsulting = true
        let specialColumnsArray = [
            {
                id: 'CREATE_TASK',
                title: 'Create Task',
                customClass: 'show'
            },
            {
                id: 'SEND_EMAIL',
                title: 'Send Email'
            },
            {
                id: 'EMAIL_HISTORY',
                title: 'View Email History'
            },
            {
                id: 'RFP_CLONE',
                title: 'Proposal Clone',
                customClass: this.showRfpAddBtn
            },
        ];
        this.specialColumn = new $.fn.dataTable.SpecialColumn(specialColumnsArray, false)
    }

    /**
     * This method will load datatable for RFP
     * @method loadDataTable
     */
    loadDataTable() {
        console.log('specialColumn', this.specialColumn)
        var vm = this;
        vm.table = $('#dt-rfp').DataTable({
            ajax: this.rfpListService.getRecordsWithSearch({
                onData: (data: any) => {
                    assign(data, pickBy(this.filter, identity))
                }
            }),
            paging: true,
            dom: "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-12 col-md-2'l><'col-sm-12 col-md-3'i><'col-sm-12 col-md-7'p>>",
            pageLength: 25,
            "bFilter": true,
            lengthChange: true,
            lengthMenu: [25, 50, 75, 100],
            "bInfo": true,
            "aaSorting": [],
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
            columnDefs: [
                { type: 'date-uk', targets: 7 }, //specify your date column number,starting from 0
            ],
            columns: [
                {
                    title: 'Proposal #',
                    data: 'rfpNumber',
                    visible: true,
                    width: 130,
                    class: 'clickable',
                },
                {
                    title: 'Property',
                    data: 'rfpAddress',
                    visible: true,
                    class: 'clickable',
                    width: 200,
                    render: function (data: any, type: any, dataToSet: any) {
                        let address = ""
                        if (dataToSet.houseNumber) {
                            address = address + dataToSet.houseNumber
                        }
                        if (dataToSet.rfpAddress) {
                            address = address + " " + dataToSet.rfpAddress
                        }
                        if (dataToSet.borough) {
                            address = address + ", " + dataToSet.borough
                        }
                        if (dataToSet.zipCode) {
                            address = address + ", " + dataToSet.zipCode
                        }
                        return address;
                    }
                },
                {
                    title: 'Special Place',
                    data: 'specialPlace',
                    visible: true,
                    class: 'clickable',
                },
                {
                    title: 'COMPANY',
                    data: 'company',
                    visible: true,
                    class: 'clickable'
                },
                {
                    title: 'Cost ($)',
                    data: 'cost',
                    width: 100,
                    visible: true,
                    class: 'clickable text-right'
                },
                {
                    title: 'Project Description',
                    data: 'projectDescription',
                    visible: true,
                    class: 'clickable'
                },
                {
                    title: 'Created By',
                    data: 'createdBy',
                    visible: true,
                    class: 'clickable',
                    width: 120
                },
                {
                    title: 'DATE SENT',
                    data: 'lastModifiedDate',
                    visible: true,
                    class: 'clickable',
                },
                {
                    title: 'Status',
                    data: function (data: any) {
                        return '<div><label class="label label' + data.idRfpStatus + ' status-label" data-placement="center" title="Status">' + data.rfpStatusDisplayName + '</label></div>'
                    },
                    visible: true,
                    class: 'clickable',
                },
               
                this.specialColumn
            ],
            drawCallback: (setting: any) => {
                if (vm.showRfpAddBtn == "hide") {
                    $('.select-column').hide()
                } else {
                    $('.select-column').show()
                }
            },
            rowCallback: ((row: any, data: any, index: any) => {
                $(row).find('.note-icon').removeClass('hide');
                $(row).find('.delete-icon').hide();
            }),
            initComplete: () => {
                this.specialColumn
                    .ngZone(vm.zone)
                    .dataTable(vm.table)
                    .onActionClick((row: any, actionId: any) => {
                        const data = row.data()
                        console.log('rfp list', data)
                        if (actionId == 'VIEW_RFP') {
                            vm.onViewRFP(data);
                        }
                        if (actionId == 'EMAIL_HISTORY') {
                            vm.openMailHistory(data.id)
                        }
                        if (actionId == 'CREATE_TASK') {
                            this.idRfp = data.id
                            vm.openModalFormAddTask(vm.addtask, data.idContact)
                        }
                        if (actionId == 'SEND_EMAIL') {
                            this.idRfp = data.id
                            vm.openModalSendEmail(vm.sendemail)
                        }
                        if (actionId == 'ADD_NOTE') {
                            this.idRfp = data.id
                            vm.openModalSendEmail(vm.rfpprogressionnote)
                        }
                        if (actionId == 'CREATE_JOB') {
                            this.rfpListService.getById(data.id).subscribe(r => {
                                this.rfpObj = r
                                vm.openJobModal(vm.formJob)
                            })
                        }

                        if (actionId == 'RFP_CLONE') {
                            this.rfpListService.cloneRfp(data.id).subscribe(r => {
                                this.router.navigate(['./editSiteInformation/', r.id])
                            }, e => {

                            })
                        }
                    })
            }
        });
        console.log('vm.table', vm.table)
        $('#dt-rfp tbody').on('click', 'td.clickable', function (ev: any) {
            const row = vm.table.row($(this).parents('tr'))
            const data = row.data()
            if ($(this).hasClass('clickable')) {
                vm.onViewRFP(data);
            }
        });
        $('#dt-rfp tbody').on('click', 'span', function (ev: any) {
            const row = vm.table.row($(this).parents('tr'))
            const data = row.data()
            if ($(this).hasClass('note-icon')) {
                vm.idRfp = data.id
                vm.openModalSendEmail(vm.rfpprogressionnote)
            }
            if ($(this).hasClass('edit-icon')) {
                vm.onViewRFP(data);
            }
        })
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

    /**
     * This method get already linked job to display in step 5
     * @method alreadyGetLinkedJob
     * @param {number} idRfp ID of RFP 
     */
    private alreadyGetLinkedJob(idRfp: number) {
        this.rfpListService.alreadyGetLinkedJob(idRfp).subscribe(r => {
            if (r && r.jobNumber) {
                this.alreadyRFPLinkedWithJob = true;
            }
        })
    }

    /**
     * This method will open popup for add Job
     * @method openJobModal
     * @param {any} template TemplateRef Object 
     */
    private openJobModal(template: TemplateRef<any>) {
        this.modalRefJob = this.modalService.show(template, { class: 'modal-job', backdrop: 'static', 'keyboard': false })
    }

    /**
     * This method is used to redirect to first step
     * @method redirectToAddRfp
     */
    redirectToAddRfp() {
        this.router.navigate(['./SiteInformation']);
    }

    /**
     * This method decide step redirection based on last saved step
     * @method onViewRFP
     * @param {any} obj RFP Object 
     */
    private onViewRFP(obj: any) {
        if (obj.lastUpdatedStep == 1) {
            this.router.navigate(['./editSiteInformation/', obj.id])
        } else if (obj.lastUpdatedStep == 2) {
            this.router.navigate(['/projectDetails', obj.id])
        } else if (obj.lastUpdatedStep == 3) {
            this.router.navigate(['/scopeReview', obj.id])
        } else if (obj.lastUpdatedStep == 4) {
            this.router.navigate(['/proposalReview', obj.id])
        } else if (obj.lastUpdatedStep == 5) {
            this.router.navigate(['/rfpSubmit', obj.id])
        } else {
            this.router.navigate(['./editSiteInformation/', obj.id])
        }
    }

    /**
     * This method will search in datatable
     * @method search
     * @param {string} srch Search Criteria 
     */
    isSpanTagAdded = false;
    public search(srch: string) {
        this.localSearch = true;
        this.localSearchText = srch;
        this.sharedService.rfpLocalFilter = { filter: undefined, searchText: this.localSearchText }
        this.sharedService.clearGlobalSearch.emit('rfp');
        this.table.search(srch).draw()

    }

    /**
     * This method will open emailhistory page
     * @method openMailHistory
     * @param {number} idRfp ID of RFP 
     */
    openMailHistory(idRfp: number) {
        this.router.navigate(['/rfp', idRfp, 'emailhistory'])
    }

    /**
     * This method will open popup for add task
     * @method openModalFormAddTask
     * @param {any} template TemplateRedf Object 
     * @param {number} id ID of RFP 
     */
    private openModalFormAddTask(template: TemplateRef<any>, id?: number) {
        this.idrfpConatct = id;
        this.modalRef = this.modalService.show(template, { class: 'modal-add-task', backdrop: 'static', 'keyboard': false })
    }

    /**
     * This method will open popup for send email
     * @method openModalSendEmail
     * @param {any} template TemplateRedf Object 
     * @param {number} id ID of RFP 
     */
    private openModalSendEmail(template: TemplateRef<any>, id?: number) {
        this.modalRef = this.modalService.show(template, { class: 'modal-send-email', backdrop: 'static', 'keyboard': false })
    }
}