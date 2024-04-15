import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { FeeScheduleServices } from './feeschedule.services';
import { assign, identity, pickBy } from 'lodash';
import { Router } from '@angular/router';

declare const $: any

/**
* This component contains all function that are used in FeeScheduleComponent
* @class FeeScheduleComponent
*/
@Component({
  selector: '[fee-schedule]',
  templateUrl: './feeschedule.component.html',
  styleUrls: ['./feeschedule.component.scss']
})
export class FeeScheduleComponent implements OnInit {
  @Input() modalRefFee: BsModalRef

  private table: any
  private filter: any
  totalSum: number
  private idRfp: number
  constructor(
    private modalService: BsModalService,
    private toastr: ToastrService,
    private router: Router,
    private feeScheduleServices: FeeScheduleServices,
  ) {
    let id: any = this.router.url.substr(this.router.url.lastIndexOf('/') + 1);
    if (id > 0) {
      this.idRfp = id
    }
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    const vm = this
    this.filter = {} as any;
    vm.totalSum = 0
    this.filter['idRfp'] = this.idRfp
    vm.table = $('#dt-fee-schedule').DataTable({
      "aaSorting": [],
      "bPaginate": false,
      "bInfo": false,
      "scrollY": "360px",
      "scrollCollapse": true,
      ajax: this.feeScheduleServices.getRecords({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }),
      columns: [
        {
          title: 'Job Type',
          data: 'rfpJobType',
          render: function (data: any, type: any, dataToSet: any) {
            return dataToSet.rfpJobType
          },
          class: ''
        }, {
          title: 'Job Type Description',
          data: 'rfpSubJobType',
          render: function (data: any, type: any, dataToSet: any) {
            return dataToSet.rfpSubJobTypeCategory
          },
          class: ''
        },
        // {
        //   title: 'Email Body',
        //   data: 'emailBody',
        //   class: ''
        // },
        {
          title: 'Job Sub Type',
          data: 'rfpSubJobTypeCategory',
          render: function (data: any, type: any, dataToSet: any) {
            return dataToSet.rfpSubJobType
          },
          class: ''
        }, {
          title: 'Service Group',
          data: 'rfpServiceGroup',
          class: '',
          render: function (data: any, type: any, dataToSet: any) {
            return dataToSet.rfpServiceGroup
          },
        },
        {
          title: 'Service Item',
          data: 'rfpServiceItem',
          class: '',
          render: function (data: any, type: any, dataToSet: any) {
            return dataToSet.rfpServiceItem
          },
        },
        {
          title: 'Cost ($)',
          data: 'cost',
          class: '',
          render: function (data: any, type: any, dataToSet: any) {
            return dataToSet.cost
          },
        },
        {
          title: 'Quantity',
          data: 'quantity',
          class: '',
          render: function (data: any, type: any, dataToSet: any) {
            return dataToSet.quantity
          },
        },
        {
          title: 'Total ($)',
          data: 'formatedTotalCost',
          class: 'text-right',
          render: function (data: any, type: any, dataToSet: any) {
            return dataToSet.formatedTotalCost
          },
        },
        {
          title: 'Totaldd ($)',
          data: 'totalCost',
          class: 'hide',
          render: function (data: any, type: any, dataToSet: any) {
            return dataToSet.totalCost
          },
        },
      ],
      rowCallback: ((row: any, data: any, index: any) => {
          // vm.totalSum = vm.totalSum + data.totalCost;
      }),
      footerCallback: function ( row: any, data: any, start: any, end: any, display: any ) {
        var api = this.api(), data;
        // Total over this page
        var pageTotal = api
            .column( 8, { page: 'current'} )
            .data()
            .reduce( function (a: any, b: any) {
              return a + b;
            }, 0 );
            vm.totalSum = pageTotal;
        // Update footer
        $( api.column( 8 ).footer() ).html(
            pageTotal
        );
    },
      initComplete: () => {
        var getFeeRowLength = $(".modal-fee-schedule tbody tr").length;
        if (getFeeRowLength > 10) {
          $(".fee-total").addClass("more");
        }
      },

    })
  }

  /**
  * This method is used for redirecting to project details screen for adding more service
  * @method addService
  */
  addService() {
    this.modalRefFee.hide()
    this.router.navigate(['/projectDetails/' + this.idRfp])
  }
}