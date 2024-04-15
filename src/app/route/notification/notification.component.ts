import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { cloneDeep, intersectionBy, identity, pickBy, assign } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Notification } from './notification';
import { NotificationServices } from './notification.services';
import { TaskServices } from '../task/task.services';
import { API_URL } from '../../app.constants'
import { SharedService, constantValues } from '../../app.constantValues';
import { Message } from '../../app.messages';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import * as moment from 'moment';
import { LocalStorageService } from '../../services/local-storage.service';
import { UserRightServices } from '../../services/userRight.services';
import { JobServices } from '../job/job.services';
import { JobSharedService } from '../job/JobSharedService';
import { AppComponent } from '../../app.component';
declare const $: any
/**
* This component contains all function that are used in NotificationComponent
* @class NotificationComponent
*/
@Component({
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})

export class NotificationComponent {
  private notification = {} as Notification
  loading: boolean = false
  private table: any
  private filter: any
  srch: any
  private errorMessage: any
  modalRef: BsModalRef
  @ViewChild('viewtask', { static: true })
  private viewtask: TemplateRef<any>
  private frommodeule: string
  private isNew: boolean = false
  idTask: number
  idJob: number
  redirectionURL: string
  isCustomerLoggedIn: boolean = false;

  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(
    private modalService: BsModalService,
    private toastr: ToastrService,
    private notificationServices: NotificationServices,
    private taskServices: TaskServices,
    private message: Message,
    private router: Router,
    private constantValues: constantValues,
    private localStorageService: LocalStorageService,
    private userRight: UserRightServices,
    private jobServices: JobServices,
    private sharedService: SharedService,
    private jobSharedService: JobSharedService,
    private appComponent: AppComponent,

  ) {
    this.errorMessage = this.message.msg;
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')

    // Call again API  when user already on notification page and click more button
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    }
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        // trick the Router into believing it's last link wasn't previously loaded
        this.router.navigated = false;
        // if you need to scroll back to top, here is the right place
        window.scrollTo(0, 0);
      }
    });
  }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    document.title = 'Notifications';
    var vm = this;
    this.filter = {}
    let loggedInUserId;
    if (this.isCustomerLoggedIn) {
      loggedInUserId = this.localStorageService.getCustomerDetails().employeeId;
      this.filter.idCustomer = loggedInUserId
    } else {
      loggedInUserId = parseInt(localStorage.getItem("userLoggedInId"));
      this.filter.idEmployee = loggedInUserId
    }
    vm.table = $('#dt-notification-list').DataTable({
      "aaSorting": [],
      paging: true,
      dom: "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-12 col-md-2'l><'col-sm-12 col-md-3'i><'col-sm-12 col-md-7'p>>",
      pageLength: 25,
      "bFilter": true,
      lengthChange: true,
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
      lengthMenu: [25, 50, 75, 100],
      ajax: this.notificationServices.getAllNotificationByUser({
        onData: (data: any) => {
          assign(data, pickBy(this.filter, identity))
        }
      }, loggedInUserId),
      columnDefs: [
        { type: 'date-uk', targets: 0 } //specify your date column number,starting from 0

      ],
      columns: [
        {
          title: 'Date',
          data: 'notificationDate',
          visible: true,
          class: 'clickable message dt-medium',
          render: function (data: any, type: any, dataToSet: any,) {
            return moment(data).format('MM/DD/YYYY');
          }
        },
        {
          title: 'Time',
          data: 'notificationDate',
          visible: true,
          orderable: false,
          class: 'clickable message dt-medium',
          render: function (data: any, type: any, dataToSet: any) {
            return moment(data).format('h:mm a');
          }
        },
        {
          title: 'Message',
          data: 'notificationMessage',
          visible: true,
          type: 'html',
          class: 'clickable message',
        },
        {
          title: '',
          data: 'notificationMessage',
          visible: true,
          type: 'html',
          class: 'clickable delete',
          render: function (data: any, type: any, dataToSet: any) {
            return " <i class='remove'>&times;</i>";
          },
          // createdCell: function(cell) {
          //   // Find <a> tags with "violation" class within the cell
          //   var violationLinks = $(cell).find('a.violation');

          //   // Assign a unique identifier to each <a> tag
          //   violationLinks.each(function(index) {
          //     $(this).attr('data-index', index);
          //   });
          //   // Add click event to all <a> tags with "violation" class
          //   violationLinks.on('click', function() {
          //     // Retrieve the identifier of the clicked <a> tag
          //     var clickedIndex = $(this).attr('data-index');
          //     // Handle the click event based on the identifier
          //     console.log('Clicked on <a> tag with index:', clickedIndex);

          //     // Other custom logic...
          //   });
          // }
        }
      ],
      createdRow: function (row: any, data: any, index: any) {
        if (data.isRead == true) {
          $(row).addClass('read');
        } else {
          $(row).addClass('unread');
        }
      },
      initComplete: () => {

      }
    })

    $('#dt-notification-list tbody').on('click', 'td.clickable', function (ev: any) {
      const row = vm.table.row($(this).parents('tr'))
      const appData = row.data()
      if ($(this).hasClass('clickable message')) {
        appData.isRead = true
        if (appData?.notificationMessage) {
          let violationInformation = appData?.notificationMessage.substring(0, 29);
          console.log('violationInformation', violationInformation)
          if (violationInformation === 'Violation Information Updated' || violationInformation === "New Violation issued: Violati") {
            let isDob = appData?.notificationMessage.includes('dob-job-id');
            let isDobSafety = appData?.notificationMessage.includes('dob-safety-job-id');
            const regex = /<b class='violation-number'>([^<]+)<\/b>/
            const match = regex.exec(appData?.notificationMessage)
            const violationNumber = match ? match[1] : null;
            console.log('violationNumber', violationNumber)
            console.log('ev.target', ev)
            if (ev.target && ev.target.href && ev.target.tagName == 'A') {
              console.log('run inside')
              ev.preventDefault();
              vm.redirectionURL = ev.target.href
              console.log('redirectionURL', vm.redirectionURL)
              // const parts = vm.redirectionURL.split("/");
              const isValueNull = vm.extractJobIdFromUrl(vm.redirectionURL);
              if (isValueNull == null) {
                const parts = vm.redirectionURL.split("/");
                const redirectionJobId = parts[parts.length - 1];
                let newUrl = `/job/${redirectionJobId}/violation?highlighted=${violationNumber}`
                if (isDob) {
                  newUrl = `/job/${redirectionJobId}/violation?highlighted=${violationNumber}&isDob=true`
                }
                if (isDobSafety) {
                  newUrl = `/job/${redirectionJobId}/violation?highlighted=${violationNumber}&isSafety=true`
                }
                vm.setProjectDetails(+redirectionJobId)
                vm.notificationServices.notificationIsRead(appData).subscribe(r => {
                  vm.router.navigateByUrl(newUrl);
                  return
                })
              } else {
                const redirectionJobId = vm.extractJobIdFromUrl(vm.redirectionURL);
                let newUrl = `/job/${redirectionJobId}/violation?highlighted=${violationNumber}`
                if (isDob) {
                  newUrl = `/job/${redirectionJobId}/violation?highlighted=${violationNumber}&isDob=true`
                }
                if (isDobSafety) {
                  newUrl = `/job/${redirectionJobId}/violation?highlighted=${violationNumber}&isSafety=true`
                }
                vm.setProjectDetails(+redirectionJobId)
                vm.notificationServices.notificationIsRead(appData).subscribe(r => {
                  vm.router.navigateByUrl(newUrl);
                  return
                })
              }
              return
            } else {
              console.log("else")
              ev.preventDefault();
              return
            }
          }
        }
        console.log("run")
        if (ev.target && ev.target.href && ev.target.tagName == 'A') {
          ev.preventDefault();
          vm.redirectionURL = ev.target.href;
          if (ev.target.href.indexOf('jobtask') > 0) {
            vm.idJob = ev.target.href.split('/')[4];
            vm.idTask = ev.target.text;
            vm.openModalForm(vm.viewtask, vm.idTask)
            return false;
          }
          else {
            let tsturl = ev.target.href.split('/');
            vm.notificationServices.notificationIsRead(appData).subscribe(r => {
              if (tsturl.length > 6) {
                tsturl.splice(0, 4);
              }
              else {
                tsturl.splice(0, 3);
              }
              if (tsturl.length > 0) {
                tsturl = tsturl.join("/");
              }
              if (tsturl.indexOf(';') > 0) {
                // tsturl = tsturl.split(';')
                // var idJobAppType = tsturl[1].split('=');
                tsturl = tsturl.split(';')
                var idJobAppType = tsturl[1].split('=');
                console.log('notification redirection url 0', tsturl, '   ', tsturl[0], idJobAppType)
                const inputString: string = tsturl[0];
                const matchResult = inputString.match(/\d+/);
                const extractedNumber: number | null = matchResult ? parseInt(matchResult[0]) : null;
                if (extractedNumber !== null) {
                  vm.setProjectDetails(extractedNumber)
                }
                vm.router.navigate(['./' + tsturl[0], { idJobAppType: idJobAppType[1] }])
              }
              else {
                vm.router.navigate(['./' + tsturl]);
              }
            }, e => { })
          }
        }
        else {
          vm.notificationServices.notificationIsRead(appData).subscribe(r => {
            let match = appData.notificationMessage.match(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig);
            if (match != undefined && match.length > 0 && match[0].indexOf('jobtask') > 0) {
              vm.redirectionURL = match[0];
              let matchUrl = match[0].split('/');
              vm.idJob = match[0].split('/')[4];
              let data = appData.notificationMessage.match(/<a[^>]*>([^<]+)<\/a>/g);
              let vatr = data[0].match(/>[^<]*</g);
              vatr = vatr[0].match(/\d+/g);
              vm.idTask = vatr[0];
              vm.openModalForm(vm.viewtask, vm.idTask)
              return false;

            }
            else {
              if (appData.redirectionUrl) {
                let url = appData.redirectionUrl.split('/');
                url.splice(0, 3)
                if (url.length > 0) {
                  url = url.join("/");
                } else {

                }
                vm.router.navigate(['./' + url]);
              }
            }
          }, e => { })
        }
      }
      if ($(this).hasClass('clickable delete')) {
        vm.notificationServices.delete(appData.id).subscribe(r => {
          vm.toastr.success('Notification deleted successfully');
          vm.reload()
        }, e => { })
      }

    })


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
  openModalForm(template: TemplateRef<any>, id?: number, from?: string) {
    this.isNew = false
    if (!id) {
      this.isNew = true
    }
    if (from) {
      this.frommodeule = from;
    }
    this.modalRef = this.modalService.show(template, { class: 'modal-view-task', backdrop: 'static', 'keyboard': false })
  }
  /**
   * This method search notification from list
   * @method searchNotification
   */
  searchNotification() {
    this.table.search(this.srch).draw()
  }

  /**
   * This method reload datatable
   * @method reload
   */
  reload() {
    this.table.clearPipeline()
    this.table.ajax.reload()
  }

  extractJobIdFromUrl(url: string) {
    // Regular expression pattern to match the job ID in the URL
    const pattern = /\/job\/(\d+)\//;
    const matches = url.match(pattern);

    if (matches && matches.length >= 2) {
      // The first match group (index 1) contains the job ID
      return matches[1];
    } else {
      return null; // No match or insufficient matches
    }
  }

  setProjectDetails(jobId) {
    this.jobServices.getJobDetailById(jobId, true).subscribe(r => {
      if (r) {
        this.sharedService.getJobEdit.emit(r);
        this.jobSharedService.setJobData(r);
        this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, r)
        if (r.jobApplicationTypes && r.jobApplicationTypes.length > 0) {
          this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, r.jobApplicationTypes[0])
        }
      }
    }, e => {
      // this.loading = false;
    })
  }

}