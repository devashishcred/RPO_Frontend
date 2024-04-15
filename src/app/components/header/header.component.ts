import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
//import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { API_URL } from '../../app.constants';
import { constantValues, SharedService } from '../../app.constantValues';
import { JobServices } from '../../route/job/job.services';
import { JobSharedService } from '../../route/job/JobSharedService';
import { NotificationServices } from '../../route/notification/notification.services';
import { RfpListService } from '../../route/rfp/rfp.services';
import { GlobalSearchServices } from '../../services/globalSearch.services';
import { Menu } from '../../types/menu';
import { User } from '../../types/user';
import { Job } from '../../types/job';
import { AppComponent } from '../../app.component';
import { convertUTCDateToLocalDate } from '../../utils/utils';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { UserRightServices } from '../../services/userRight.services';
import { RfpSubmitServices } from '../../route/addRfp/rfpSubmit/rfpSubmit.services';
import { LocalStorageService } from '../../services/local-storage.service';


declare const $: any

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [DatePipe]
})
export class HeaderComponent implements OnInit {

  @Input() login

  // public _login: boolean = false;
  // @Input() set login(value: boolean) {
  //   this._login = value
  // };
  // get login(): boolean {
  //   return this._login;
  // }

  public _user: User;

  @Input() set user(value: any) {
    this._user = value
    console.log('this._user', this._user)
  };

  get user(): any {
    return this._user;
  }

  @Input() menus: any = [];
  @Input() globalSearchText: string = '';

  /**
   * Job Progression note form
   * @property jobprogressionnote
   */
  @ViewChild('jobprogressionnote', {static: true})
  public jobprogressionnote: TemplateRef<any>

  isSideMenuShow: boolean = false;
  isJobHeaderShow: boolean = false;
  globalSearchType: number = 1
  placeholder: string = 'Project#';
  errorMsg: any
  badgeList: any
  moreBtn: string = 'hide'
  sessionStorage: any = []
  redirectionURL: string
  idJob: number
  idTask: number
  isNew: boolean = false
  @ViewChild('viewtask', {static: true})
  viewtask: TemplateRef<any>
  frommodeule: string
  modalRef: BsModalRef
  loggedInUserId: number
  groupHub: any
  public onRfpStatusChanged = new EventEmitter<any>();
  public jobDetail: any;
  public selectedTab: string = '';
  public isShowLogout: boolean = false;
  public teamInitials: any[] = []
  public pm: string;
  public pc: string;
  public sc: string;
  public showAddTimeNote: boolean = false;
  public statusData: any = {
    job_on_hold: 'hide',
    job_in_progress: 'hide',
    job_completed: 'hide',
    job_re_open: 'hide',
    jobStatus: 'In-Progress',
    statusColor: 'status1'
  }
  public isSent: boolean = false
  public statusToSet: string = ''
  public changeStatusFromReason: any
  @ViewChild('addreason', {static: true})
  public addreason: TemplateRef<any>
  public serviceSubscription: any;
  public serviceSubscriptionAppType: any;
  public showProjectInfoPover: boolean = false;
  @ViewChild('addtimenotes', {static: true})
  private filterhistory: TemplateRef<any>
  public isAddressDisabled: boolean = false
  public isReAssigned: boolean = false
  public selectedJobType: any = []
  public redIcon: boolean = false
  public insuranceWorkCompenstaionExpired: boolean = false
  public insuranceDisabilityExpired: boolean = false
  public insuranceGeneralLiabilityExpired: boolean = false
  public insuranceObstructionBondExpired: boolean = false
  public dotInsuranceWorkCompensationExpired: boolean = false
  public dotInsuranceGeneralLiabilityExpired: boolean = false
  public btnShowHide: string
  public companyType: string
  public today: any
  //Job show hide
  showJobAddBtn: string = 'hide'
  showJobViewBtn: string = 'hide'
  showJobDeleteBtn: string = 'hide'
  showGenerateLabelBtn: string = 'hide'
  //task
  showTaskAddBtn: string = 'hide'
  //RFP
  private showRfpViewBtn: string = 'hide'
  private viewClick: string = "hide"
  // scope
  private showJobScopeAddBtn: string = 'hide'
  private showJobScopeViewBtn: string = 'hide'
  private showJobScopeDeleteBtn: string = 'hide'

  //Milestone
  private showJobMilestoneAddBtn: string = 'hide'
  private showJobMilestoneViewBtn: string = 'hide'
  private showJobMilestoneDeleteBtn: string = 'hide'
  //Transmittal
  showJobTransmittalBtn: string = 'hide'
  isCustomerLoggedIn: boolean = false;
  isAllowMyAccount: boolean = false;

  //customer project name
  customerProjectName: string = '';

  loading: boolean = false;
  @ViewChild('viewViolation', {static: true})
  public viewViolation: TemplateRef<any>
  idViolation: any;
  private storage = window.sessionStorage;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private globalSearchServices: GlobalSearchServices,
    private notificationService: NotificationServices,
    private rfpListService: RfpListService,
    private jobServices: JobServices,
    //@Inject(SESSION_STORAGE) private storage: WebStorageService,
    private jobSharedService: JobSharedService,
    public constantValues: constantValues,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private appComponent: AppComponent,
    private datePipe: DatePipe,
    private userRight: UserRightServices,
    private rfpSubmitService: RfpSubmitServices,
    private localStorageService: LocalStorageService
  ) {
    this.checkIsCustomer()

    router.events.subscribe((val: any) => {
      // see also 
      console.log('job url', val)
      if (val?.url) {
        console.log('val', val)
        let splitUrl = val.url.split('/');
        console.log('splitUrl', splitUrl)
        if (splitUrl[1] == 'job') {
          console.log('run')
          console.log('splitUrl[3]')
          this.isJobHeaderShow = true;
          // this.getCustomerProjectName()
        } else {
          console.log('inside else')
          this.isJobHeaderShow = false;
        }
      }
    });
  }

  ngOnInit(): void {
    this.checkIsCustomer()

    console.log('ng user', this.user)
    this.sharedService.clearGlobalSearch.subscribe((path: any) => {
      this.globalSearchText = null;
      if (path) {
        this.router.navigate(["/" + path])
      }
    })
    this.today = this.datePipe.transform(new Date(), 'MM/dd/yyyy');

    $(".badge").text('')
    this.loggedInUserId = parseInt(localStorage.getItem("userLoggedInId"));
    let seenNotifications = localStorage.getItem("seenNotification");
    if (localStorage.getItem('userLoggedInId') != null && !seenNotifications) {
      this.notificationService.getNotificationCount(this.loggedInUserId).subscribe((r: any) => {
        if (r) {
          localStorage.setItem("notificationCount", r);
          if (parseInt(localStorage.getItem("notificationCount")) > 0) {
            $(".badge").text(localStorage.getItem("notificationCount"));
          }

        } else {
          localStorage.setItem("notificationCount", "");
          $(".badge").text(localStorage.getItem("notificationCount"));
        }

      }, e => {
      })

      this.groupHub = $.hubConnection(API_URL).createHubProxy('groupHub')

      this.groupHub.on('notificationcount', (id: any, notificationCount: any) => {
        this.onRfpStatusChanged.emit({userId: id, notificationCount: notificationCount})
        if (notificationCount > 0) {
          localStorage.setItem("notificationCount", notificationCount);
          if (parseInt(localStorage.getItem("notificationCount")) > 0) {
            $(".badge").text(localStorage.getItem("notificationCount"));
          }
        } else {
          localStorage.setItem("notificationCount", "");
          $(".badge").text(localStorage.getItem("notificationCount"));
        }
      })
    }
    this.getJobDetails()
  }

  getSelectedMenu() {
    console.log('this.user.menu', this.user.menu)
    if (!this.selectedTab) {
      this.user.menu.forEach(menu => {
        console.log('this.isActive(menu)', this.isActive(menu))
        if (this.isActive(menu)) {
          this.selectedTab = menu.text
          console.log('this.selectedTab', this.selectedTab)
        }
      })
    }
  }

  toggleSideMenu() {
    this.checkIsCustomer()
    this.isSideMenuShow = !this.isSideMenuShow
    this.getSelectedMenu()
  }

  isActive(menuItem: Menu): boolean {
    return !menuItem.routerLink && menuItem.items.findIndex(i => this.router.isActive(i.routerLink, true)) !== -1
  }

  search(type: number, placeholderr: string) {
    if (type) {
      this.globalSearchType = type
      this.placeholder = placeholderr;
    }
  }

  getCustomerProjectName() {
    console.log("run run", this.customerProjectName)
    if (this.jobDetail?.id && this.isCustomerLoggedIn) {
      this.jobServices.getCustomerProjectName(this.jobDetail.id).subscribe((res: any) => {
        console.log("getCustomerProjectName res", res)
        if (res) {
          if (res == 'null') {
            this.customerProjectName = ''
          } else {
            this.customerProjectName = res
          }
        } else {
          this.customerProjectName = ''
        }
      })
    }
  }

  onEnterProjectName() {
    console.log('the value in the input box is ', this.customerProjectName);
    this.loading = true
    this.jobServices.setCustomerProjectName(this.jobDetail.id, this.customerProjectName).subscribe((res: any) => {
      this.loading = false;
      this.toastr.success(res)
      console.log('setCustomerProjectName', res)
    }, error => {
      this.loading = false;
      this.toastr.error(error)
    })
  }

  globalSearch() {
    // this.showCross = true;
    if (!this.globalSearchType) {
      this.globalSearchType = 1
    }

    if (this.globalSearchType == 12) {
      this.idViolation = this.globalSearchText
      this.violationDetailModal(this.viewViolation, this.idViolation)
    }

    if (this.globalSearchType && this.globalSearchText) {
      // this.loading = true
      this.globalSearchServices.search(this.globalSearchType, this.globalSearchText).subscribe(r => {
        // this.loading = false
        if (r.searchResult.length > 0) {
          this.toggleSideMenu()
        }
        if (r.searchResult && r.searchResult.length == 0) {
          this.toastr.info("No search result found")
        }
        if (r.searchResult && r.searchResult.length == 1) {
          // job detail
          if (this.globalSearchType == 1 || this.globalSearchType == 2 || this.globalSearchType == 4 ||
            this.globalSearchType == 7 || this.globalSearchType == 8 || this.globalSearchType == 9 ||
            this.globalSearchType == 10 || this.globalSearchType == 11 || this.globalSearchType == 12) {
            this.setCommonJobObject(r.searchResult[0], this.globalSearchType);
            // this.reFreshPage('application')
          }
          // rfp detail
          if (this.globalSearchType == 3) {
            this.rfpListService.getById(r.searchResult[0]).subscribe(obj => {
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
            })
          }
          // contact detail
          if (this.globalSearchType == 5) {
            this.router.navigate(['/contactdetail', r.searchResult[0]])
            // this.reFreshPage(r.searchResult[0])
          }
          // company detail
          if (this.globalSearchType == 6) {
            this.router.navigate(['/companydetail', r.searchResult[0]])
            // this.reFreshPage(r.searchResult[0])
          }

          // Task list
          if (this.globalSearchType == 13) {
            this.router.navigate(['/tasks', this.globalSearchType, this.globalSearchText])
            // this.reFreshPage(this.globalSearchText);
          }
        } else if (r.searchResult && r.searchResult.length > 1) {
          let filter = {}
          // jobs list
          if (this.globalSearchType == 1 || this.globalSearchType == 2 || this.globalSearchType == 4 ||
            this.globalSearchType == 7 || this.globalSearchType == 8 || this.globalSearchType == 9 ||
            this.globalSearchType == 10 || this.globalSearchType == 11 || this.globalSearchType == 12) {

            let searchString = ""

            r.searchResult.forEach((data: any) => {
              if (searchString) {
                searchString += "," + data
              } else {
                searchString = data
              }
            })
            this.router.navigate(['/jobs', this.globalSearchType, this.globalSearchText]);
            // this.reFreshPage('application');
          }
          // ref list
          if (this.globalSearchType == 3) {
            this.router.navigate(['/rfps', this.globalSearchType, this.globalSearchText])
            // this.reFreshPage(this.globalSearchText, 'rfp');
          }
          // company list
          if (this.globalSearchType == 6) {
            this.router.navigate(['/company', this.globalSearchType, this.globalSearchText])
            // this.reFreshPage(this.globalSearchText);
            // $location.path("/thing/"+thing.id).replace().reload(false)
          }
          // contact list
          if (this.globalSearchType == 5) {
            this.router.navigate(['/contacts', this.globalSearchType, this.globalSearchText])
            // this.reFreshPage(this.globalSearchText);
          }

          // Task list
          if (this.globalSearchType == 13) {
            this.router.navigate(['/tasks', this.globalSearchType, this.globalSearchText])
            // this.reFreshPage(this.globalSearchText);
          }

        }

      });
    } else {

      this.toastr.error(this.errorMsg.requireGlobalText);
    }
  }

  getBadgeList() {
    localStorage.setItem("notificationCount", "");
    localStorage.setItem("seenNotification", 'true');
    $(".badge").text(localStorage.getItem("notificationCount"));

    this.notificationService.getBadgeList(parseInt(localStorage.getItem("userLoggedInId"))).subscribe(r => {
      this.badgeList = r;
      if (this.badgeList.length > 0) {
        this.moreBtn = 'show';
      } else {
        this.toastr.warning("No notifications are there")
      }
    })
  }

  setCommonJobObject(idJob: number, globalSearchType?: number) {
    // this.loading = true
    if (this.isCustomerLoggedIn) {
      this.jobServices.getCustomerJobDetailById(idJob).subscribe(jobDetail => {
        this.saveInSessionStorage(this.constantValues.JOBOBECT, jobDetail);
        this.jobSharedService.setJobData(jobDetail);
        let appType: any = [];
        // console.log('jobApplicationType',jobDetail.jobApplicationType)
        if (jobDetail.jobApplicationType) {
          let appType = jobDetail.jobApplicationType.split(',');
          if (appType && appType.length > 0) {
            let keepGoing = true;
            appType.forEach((idJobAppType: any) => {
              if (globalSearchType == 11) {
                idJobAppType = 2;
              }
              if (globalSearchType == 12) {
                idJobAppType = 3;
              }
              if (globalSearchType == 2) {
                idJobAppType = 1;
              }
              if (keepGoing) {
                this.jobSharedService.setJobAppType(idJobAppType);
                this.saveInSessionStorage(this.constantValues.JOBID, jobDetail.id)
                if (idJobAppType == 3) {
                  this.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, idJobAppType)
                  keepGoing = false;
                  // this.loading = false
                  this.router.navigate(['/job/' + jobDetail.id + '/violation']);

                } else if (idJobAppType == 2) {
                  this.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, idJobAppType)
                  keepGoing = false;
                  // this.loading = false
                  this.router.navigate(['/job/' + jobDetail.id + '/dot', {idJobAppType: idJobAppType}]);
                } else {
                  this.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, idJobAppType)
                  keepGoing = false;
                  // this.loading = false
                  if (idJobAppType == 1) {
                    if (globalSearchType == 8) {
                      this.router.navigate(['./job/' + jobDetail.id + '/transmittal'])
                    } else {
                      this.router.navigate(['./job/' + jobDetail.id + '/application', {idJobAppType: idJobAppType}])
                    }
                  } else {
                    this.router.navigate(['./job/' + jobDetail.id + '/dep', {idJobAppType: idJobAppType}])
                  }
                  // this.router.navigate(['/job/' + jobDetail.id + '/application', { idJobAppType: idJobAppType }]);
                }
              }
            })
          }
        }
        this.getCustomerProjectName()
      }, e => {
        // this.loading = false;
      });
    } else {
      this.jobServices.getJobById(idJob).subscribe(jobDetail => {
        this.saveInSessionStorage(this.constantValues.JOBOBECT, jobDetail);
        this.jobSharedService.setJobData(jobDetail);
        let appType: any = [];
        // console.log('jobApplicationType',jobDetail.jobApplicationType)
        if (jobDetail.jobApplicationType) {
          let appType = jobDetail.jobApplicationType.split(',');
          if (appType && appType.length > 0) {
            let keepGoing = true;
            appType.forEach((idJobAppType: any) => {
              if (globalSearchType == 11) {
                idJobAppType = 2;
              }
              if (globalSearchType == 12) {
                idJobAppType = 3;
              }
              if (globalSearchType == 2) {
                idJobAppType = 1;
              }
              if (keepGoing) {
                this.jobSharedService.setJobAppType(idJobAppType);
                this.saveInSessionStorage(this.constantValues.JOBID, jobDetail.id)
                if (idJobAppType == 3) {
                  this.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, idJobAppType)
                  keepGoing = false;
                  // this.loading = false
                  this.router.navigate(['/job/' + jobDetail.id + '/violation']);

                } else if (idJobAppType == 2) {
                  this.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, idJobAppType)
                  keepGoing = false;
                  // this.loading = false
                  this.router.navigate(['/job/' + jobDetail.id + '/dot', {idJobAppType: idJobAppType}]);
                } else {
                  this.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, idJobAppType)
                  keepGoing = false;
                  // this.loading = false
                  if (idJobAppType == 1) {
                    if (globalSearchType == 8) {
                      this.router.navigate(['./job/' + jobDetail.id + '/transmittal'])
                    } else {
                      this.router.navigate(['./job/' + jobDetail.id + '/application', {idJobAppType: idJobAppType}])
                    }
                  } else {
                    this.router.navigate(['./job/' + jobDetail.id + '/dep', {idJobAppType: idJobAppType}])
                  }
                  // this.router.navigate(['/job/' + jobDetail.id + '/application', { idJobAppType: idJobAppType }]);
                }
              }
            })
          }
        }
      }, e => {
        // this.loading = false;
      });
    }
  }

  saveInSessionStorage(key: any, val: any): any {
    this.storage.set(key, val);
    this.sessionStorage[key] = this.storage.get(key);
  }

  deleteNotification(id: number, event: any) {
    // $('li.notif-dropdown.dropdown').on('click', function (event: any) {
    //     $(this).toggleClass('open');
    // });

    this.notificationService.delete(id).subscribe(r => {
      if (r.id) {
        this.toastr.success("Notification Deleted Successful.");
        this.getBadgeList();
      }
    });
    event.stopPropagation();
  }

  /**
   * redirect to specific module from notification
   */
  redirectFromNotification(notificationIndex: number, event: any, notificationMessage: any) {
    this.checkIsCustomer()
    if (notificationMessage) {
      let violationInformation = notificationMessage.substring(0, 29);
      console.log('violationInformation', violationInformation)
      if (violationInformation === 'Violation Information Updated' || violationInformation === "New Violation issued: Violati") {
        let isDob = notificationMessage.includes('dob-job-id');
        let isDobSafety = notificationMessage.includes('dob-safety-job-id');
        const regex = /<b class='violation-number'>([^<]+)<\/b>/
        const match = regex.exec(notificationMessage)
        const violationNumber = match ? match[1] : null;
        console.log('violationNumber', violationNumber)
        if (event.target && event.target.href && event.target.tagName == 'A') {
          event.preventDefault();
          this.redirectionURL = event.target.href
          console.log('redirectionURL', this.redirectionURL)
          const isValueNull = this.extractJobIdFromUrl(this.redirectionURL);
          if (isValueNull == null) {
            const parts = this.redirectionURL.split("/");
            const redirectionJobId = parts[parts.length - 1];
            let newUrl = `/job/${redirectionJobId}/violation?highlighted=${violationNumber}`
            if (isDob) {
              newUrl = `/job/${redirectionJobId}/violation?highlighted=${violationNumber}&isDob=true`
            }
            if (isDobSafety) {
              newUrl = `/job/${redirectionJobId}/violation?highlighted=${violationNumber}&isSafety=true`
            }
            this.setProjectDetails(+redirectionJobId)
            this.router.navigateByUrl(newUrl);
          } else {
            const redirectionJobId = this.extractJobIdFromUrl(this.redirectionURL);
            let newUrl = `/job/${redirectionJobId}/violation?highlighted=${violationNumber}`
            if (isDob) {
              newUrl = `/job/${redirectionJobId}/violation?highlighted=${violationNumber}&isDob=true`
            }
            if (isDobSafety) {
              newUrl = `/job/${redirectionJobId}/violation?highlighted=${violationNumber}&isSafety=true`
            }
            this.setProjectDetails(+redirectionJobId)
            this.router.navigateByUrl(newUrl);
          }
          return
        } else {
          event.preventDefault();
          return
        }
      }
    }
    if (event.target && event.target.href && event.target.tagName == 'A') {
      event.preventDefault();
      if (event.target.href.indexOf('jobtask') > 0) {
        this.redirectionURL = event.target.href;
        this.idJob = event.target.href.split('/')[4];
        this.idTask = event.target.text;
        this.openModalForm(this.viewtask, this.idTask)
        return false;
      } else {
        let tsturl = event.target.href.split('/');
        if (tsturl.length > 6) {
          tsturl.splice(0, 4);
        } else {
          tsturl.splice(0, 3);
        }
        if (tsturl.length > 0) {
          tsturl = tsturl.join("/");
        }
        if (tsturl.indexOf(';') > 0) {
          tsturl = tsturl.split(';')
          var idJobAppType = tsturl[1].split('=');
          console.log('notification redirection url 0', tsturl, '   ', tsturl[0], idJobAppType)
          const inputString: string = tsturl[0];
          const matchResult = inputString.match(/\d+/);
          const extractedNumber: number | null = matchResult ? parseInt(matchResult[0]) : null;
          if (extractedNumber !== null) {
            this.setProjectDetails(extractedNumber)
          }
          this.router.navigate(['./' + tsturl[0], {idJobAppType: idJobAppType[1]}])
        } else {
          console.log('notification redirection url 1', tsturl)
          this.router.navigate(['./' + tsturl]);
        }
      }

    } else {
      if (this.badgeList.length > 0) {
        if (this.badgeList[notificationIndex].redirectionUrl != null) {
          let match = this.badgeList[notificationIndex].notificationMessage.match(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig);
          if (match != undefined && match.length > 0 && match[0].indexOf('jobtask') > 0) {
            this.redirectionURL = match[0];
            let matchUrl = match[0].split('/');
            this.idJob = match[0].split('/')[4];
            let data = this.badgeList[notificationIndex].notificationMessage.match(/<a[^>]*>([^<]+)<\/a>/g);
            let vatr = data[0].match(/>[^<]*</g);
            vatr = vatr[0].match(/\d+/g);
            this.idTask = vatr[0];
            this.openModalForm(this.viewtask, this.idTask)
            return false;
          } else {
            let url = this.badgeList[notificationIndex].redirectionUrl.split('/');
            url.splice(0, 3)
            if (url.length > 0) {

              url = url.join("/");
            } else {

            }
            console.log('notification redirection url 2', url)
            this.router.navigate(['./' + url]);
            // this.router.navigate(['./' + this.badgeList[notificationIndex].redirectionUrl]);
          }
        }
      }
    }

  }

  setProjectDetails(jobId) {
    this.jobServices.getJobDetailById(jobId, true).subscribe(r => {
      if (r) {
        this.jobDetail = r
        this.sharedService.getJobEdit.emit(r);
        this.jobSharedService.setJobData(r);
        this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, r)
        this.getCustomerProjectName()
        if (r.jobApplicationTypes && r.jobApplicationTypes.length > 0) {
          this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, r.jobApplicationTypes[0])
          this.selectedJobType = r.jobApplicationTypes[0]
        }
        if (r.status > 1) {
          this.btnShowHide = 'hide'
        } else {
          this.btnShowHide = 'show'
        }
      }
    }, e => {
      // this.loading = false;
    })
  }

  openModalForm(template: TemplateRef<any>, id?: number, from?: string) {
    this.isNew = false
    if (!id) {
      this.isNew = true
    }
    if (from) {
      this.frommodeule = from;
    }
    this.modalRef = this.modalService.show(template, {class: 'modal-view-task', backdrop: 'static', 'keyboard': false})
  }

  public openJobProgressionModal() {
    this.modalRef = this.modalService.show(this.jobprogressionnote, {
      class: 'modal-send-email',
      backdrop: 'static',
      'keyboard': false
    })
  }

  logout() {
    if (localStorage.getItem('auth'))
      localStorage.removeItem('auth')

    if (localStorage.getItem('userinfo'))
      localStorage.removeItem('userinfo')

    if (localStorage.getItem('userRights'))
      localStorage.removeItem('userRights')

    if (localStorage.getItem('notificationCount'))
      localStorage.removeItem('notificationCount')

    if (localStorage.getItem('userLoggedInId'))
      localStorage.removeItem('userLoggedInId')

    if (localStorage.getItem('allPermissions'))
      localStorage.removeItem('allPermissions')

    if (localStorage.getItem('selectedRow'))
      localStorage.removeItem('selectedRow')

    if (localStorage.getItem('selectedJobType'))
      localStorage.removeItem('selectedJobType')

    if (localStorage.getItem('selectedSubMenu'))
      localStorage.removeItem('selectedSubMenu')

    if (localStorage.getItem('parentExpandedList'))
      localStorage.removeItem('parentExpandedList')

    if (localStorage.getItem('selectedChecklist'))
      localStorage.removeItem('selectedChecklist')

    if (localStorage.getItem('lastSelectedCompositeChecklist'))
      localStorage.removeItem('lastSelectedCompositeChecklist')

    if (localStorage.getItem('selectedChecklistType'))
      localStorage.removeItem('selectedChecklistType')

    if (localStorage.getItem('isCustomerLoggedIn'))
      this.isCustomerLoggedIn = localStorage.getItem('isCustomerLoggedIn') == "true" ? true : false;

    if (localStorage.getItem('userLoggedInName'))
      localStorage.removeItem('userLoggedInName')

    this.toggleLogout()
    this.toggleSideMenu()
    if (this.isCustomerLoggedIn) {
      localStorage.removeItem('isCustomerLoggedIn')
      localStorage.clear()
      this.router.navigate(['customer-login'])
    } else {
      localStorage.clear()
      this.router.navigate(['login'])
    }
  }

  getUserEmail() {
    return JSON.parse(localStorage.getItem('auth')).userName
  }

  getJobDetails() {
    //JOB
    this.showJobAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDJOB)
    this.showJobViewBtn = this.userRight.checkAllowButton(this.constantValues.VIEWJOB)
    this.showGenerateLabelBtn = this.userRight.checkAllowButton(this.constantValues.VIEWJOB)
    if (this.showJobViewBtn == "show") {
      this.viewClick = "clickable"
    }
    this.showJobDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEJOB)
    //TASK

    this.showTaskAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDJOBTASKS)
    //RFP    
    this.showRfpViewBtn = this.userRight.checkAllowButton(this.constantValues.VIEWRFP)

    //scope
    this.showJobScopeAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDJOBSCOPE)
    this.showJobScopeViewBtn = this.userRight.checkAllowButton(this.constantValues.VIEWJOB)
    this.showJobScopeDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEJOBSCOPE)


    //Milestone
    this.showJobMilestoneAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDJOBMILESTONE)
    this.showJobMilestoneViewBtn = this.userRight.checkAllowButton(this.constantValues.VIEWJOBMILESTONE)
    this.showJobMilestoneDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETEJOBMILESTONE)

    //Transmittal
    this.showJobTransmittalBtn = this.userRight.checkAllowButton(this.constantValues.ADDTRANSMITTALS)

    this.jobSharedService.getJobData().subscribe(res => {
      console.log('getJobData', res)
      this.jobDetail = res
      this.checkIsCustomer()
      if (!this.jobDetail) {
        return
      }

      if (this.jobDetail != null) {
        this.teamInitials = [];
        if (this.jobDetail.dobProjectTeam && this.jobDetail.dobProjectTeam.length > 0) {
          this.jobDetail.dobProjectTeam.forEach((element: any) => {
            const found = this.teamInitials.some(el => el.id === element.id);
            if (!found && element.id) {
              this.teamInitials.push({
                id: element.id,
                itemName: element.itemName.match(/\b(\w)/g).join('').substring(0, 2),
                fullName: element.itemName,
                emailAddress: element.emailAddress || element.email,
              })
            }
          });
          // console.log(this.teamInitials)
        }
        if (this.jobDetail.dotProjectTeam && this.jobDetail.dotProjectTeam.length > 0) {
          this.jobDetail.dotProjectTeam.forEach((element: any) => {
            const found = this.teamInitials.some(el => el.id === element.id);
            if (!found && element.id) {
              this.teamInitials.push({
                id: element.id,
                itemName: element.itemName.match(/\b(\w)/g).join('').substring(0, 2),
                fullName: element.itemName,
                emailAddress: element.emailAddress || element.email,
              })
            }
          });
        }
        if (this.jobDetail.violationProjectTeam && this.jobDetail.violationProjectTeam.length > 0) {
          this.jobDetail.violationProjectTeam.forEach((element: any) => {
            const found = this.teamInitials.some(el => el.id === element.id);
            if (!found && element.id) {
              this.teamInitials.push({
                id: element.id,
                itemName: element.itemName.match(/\b(\w)/g).join('').substring(0, 2),
                fullName: element.itemName,
                emailAddress: element.emailAddress || element.email,
              })
            }
          });
          // console.log(this.teamInitials)

        }
        if (this.jobDetail.depProjectTeam && this.jobDetail.depProjectTeam.length > 0) {
          this.jobDetail.depProjectTeam.forEach((element: any) => {
            const found = this.teamInitials.some(el => el.id === element.id);
            if (!found && element.id) {
              this.teamInitials.push({
                id: element.id,
                itemName: element.itemName.match(/\b(\w)/g).join('').substring(0, 2),
                fullName: element.itemName,
                emailAddress: element.emailAddress || element.email,
              })
            }
          });
          // console.log(this.teamInitials)

        }
        if (this.jobDetail.projectManager && this.jobDetail.projectManager.id != null) {
          const found = this.teamInitials.some(el => el.id === this.jobDetail.projectManager.id);
          if (!found) {
            this.teamInitials.push({
              id: this.jobDetail.projectManager.id,
              itemName: (this.jobDetail.projectManager.firstName + " " + this.jobDetail.projectManager.lastName).match(/\b(\w)/g).join('').substring(0, 2),
              fullName: this.jobDetail.projectManager.firstName + " " + this.jobDetail.projectManager.lastName,
              emailAddress: this.jobDetail.projectManager?.emailAddress || this.jobDetail.projectManager.email,
            })
          }
        }
      }

      if (this.jobDetail?.idProjectManager && this.jobDetail?.projectManager) {
        if ((typeof this.jobDetail.projectManager.firstName != "undefined") ||
          (this.jobDetail.projectManager.lastName && typeof this.jobDetail.projectManager.lastName != "undefined")) {
          if (this.jobDetail.projectManager.firstName) {
            this.pm = this.jobDetail.projectManager.firstName
          }
          if (this.jobDetail.projectManager.lastName) {
            this.pm += " " + this.jobDetail.projectManager.lastName
          }
        }
      }
      if (this.jobDetail?.idProjectCoordinator &&
        this.jobDetail?.projectCoordinator?.firstName[0] && this.jobDetail?.projectCoordinator?.lastName[0]) {
        this.pc = this.jobDetail?.projectCoordinator.firstName[0].toUpperCase() + this.jobDetail?.projectCoordinator.lastName[0].toUpperCase()
      }
      if (this.jobDetail?.idSignoffCoordinator && this.jobDetail?.signoffCoordinator?.firstName[0] && this.jobDetail?.signoffCoordinator?.lastName[0]) {
        this.sc = this.jobDetail?.signoffCoordinator.firstName[0].toUpperCase() + this.jobDetail?.signoffCoordinator.lastName[0].toUpperCase()
      }
      if (this.jobDetail?.status > 1) {
        this.showAddTimeNote = false
      } else {
        this.showAddTimeNote = true
      }
      this.setStatus(this.jobDetail.status);
      console.log('getFromSessionStorage', this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE))
      if (this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE)) {
        this.selectedJobType = this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE)
        console.log('this.selectedJobType', this.selectedJobType)
        // this.selectedJobType123 = parseInt(this.selectedJobType);
        console.log(this.jobDetail)
        if (this.redIcon) {
          this.redIcon = false;
        }
        this.setJobData(this.jobDetail)
        this.getStatus(this.jobDetail)
        this.setInitials();
        if (!localStorage.getItem('selectedJobType')) {
          this.setApplicationJobType(this.jobDetail)
        }
      }
      this.getCustomerProjectName()
    })
  }

  setInitials() {
    if (this.jobDetail != null) {
      this.teamInitials = [];
      if (this.jobDetail.dobProjectTeam && this.jobDetail.dobProjectTeam.length > 0) {
        this.jobDetail.dobProjectTeam.forEach((element: any) => {
          const found = this.teamInitials.some(el => el.id === element.id);
          if (!found && element.id) {
            this.teamInitials.push({
              id: element.id,
              itemName: element.itemName.match(/\b(\w)/g).join('').substring(0, 2),
              fullName: element.itemName,
              emailAddress: element.emailAddress || element.email,
            })
          }
        });
        // console.log(this.teamInitials)
      }
      if (this.jobDetail.dotProjectTeam && this.jobDetail.dotProjectTeam.length > 0) {
        this.jobDetail.dotProjectTeam.forEach((element: any) => {
          const found = this.teamInitials.some(el => el.id === element.id);
          if (!found && element.id) {
            this.teamInitials.push({
              id: element.id,
              itemName: element.itemName.match(/\b(\w)/g).join('').substring(0, 2),
              fullName: element.itemName,
              emailAddress: element.emailAddress || element.email,
            })
          }
        });
        // console.log(this.teamInitials)

      }
      if (this.jobDetail.violationProjectTeam && this.jobDetail.violationProjectTeam.length > 0) {
        this.jobDetail.violationProjectTeam.forEach((element: any) => {
          const found = this.teamInitials.some(el => el.id === element.id);
          if (!found && element.id) {
            this.teamInitials.push({
              id: element.id,
              itemName: element.itemName.match(/\b(\w)/g).join('').substring(0, 2),
              fullName: element.itemName,
              emailAddress: element.emailAddress || element.email,
            })
          }
        });
        // console.log(this.teamInitials)

      }
      if (this.jobDetail.depProjectTeam && this.jobDetail.depProjectTeam.length > 0) {
        this.jobDetail.depProjectTeam.forEach((element: any) => {
          const found = this.teamInitials.some(el => el.id === element.id);
          if (!found && element.id) {
            this.teamInitials.push({
              id: element.id,
              itemName: element.itemName.match(/\b(\w)/g).join('').substring(0, 2),
              fullName: element.itemName,
              emailAddress: element.emailAddress || element.email,
            })
          }
        });
        // console.log(this.teamInitials)

      }
      if (this.jobDetail.projectManager && this.jobDetail.projectManager.id != null) {
        const found = this.teamInitials.some(el => el.id === this.jobDetail.projectManager.id);
        if (!found) {
          this.teamInitials.push({
            id: this.jobDetail.projectManager.id,
            itemName: (this.jobDetail.projectManager.firstName + " " + this.jobDetail.projectManager.lastName).match(/\b(\w)/g).join('').substring(0, 2),
            fullName: this.jobDetail.projectManager.firstName + " " + this.jobDetail.projectManager.lastName,
            emailAddress: this.jobDetail.projectManager?.emailAddress || this.jobDetail.projectManager.email,
          })
        }
      }
      // console.log(this.teamInitials)
    }
  }

  getAllNotification() {
    localStorage.setItem("notificationCount", "");
    $(".badge").text(localStorage.getItem("notificationCount"));
    this.router.navigate(['./notification'])
  }

  onSelectTab(tabName: string, subMenuLength: any) {
    if (subMenuLength || subMenuLength > 0) {
      if (this.selectedTab == tabName) {
        // console.log('if run')
        this.selectedTab = '';
      } else {
        this.selectedTab = tabName;
      }
    } else {
      this.selectedTab = '';
      this.toggleSideMenu()
    }
    this.clearGlobalSearch()
  }

  onSelectSubMenuTab(tabName: string, subMenuLength: any) {
    if (subMenuLength || subMenuLength > 0) {
      if (this.getSelectedSubMenu() == tabName) {
        this.setSelectedSubMenu('');
      } else {
        this.setSelectedSubMenu(tabName);
      }
    } else {
      this.setSelectedSubMenu('');
      this.toggleSideMenu()
    }
    this.clearGlobalSearch()
  }

  clearGlobalSearch() {
    this.sharedService.clearGlobalSearch.emit()
  }

  goToMain() {
    setTimeout(() => {
      this.router.navigate(['home'])
    })
  }

  toggleLogout() {
    this.checkIsCustomer()
    this.isShowLogout = !this.isShowLogout
  }

  checkIsCustomer() {
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
    this.isAllowMyAccount = this.userRight.checkAllowButton(this.constantValues.VIEWCONTACT) == 'show' ? true : false;
  }

  setSelectedSubMenu(selectedSubMenuTab: string) {
    localStorage.setItem('selectedSubMenu', selectedSubMenuTab)
  }

  getSelectedSubMenu() {
    return localStorage.getItem('selectedSubMenu')
  }

  setStatus(status: any) {
    switch (status) {
      case 1:
        this.statusData = {
          job_completed: 'show',
          job_re_open: 'hide',
          job_on_hold: 'show',
          job_in_progress: 'hide',
          jobStatus: 'In-Progress',
          statusColor: 'status1',
        }
        break;
      case 2:
        this.statusData = {
          job_on_hold: 'hide',
          job_in_progress: 'show',
          jobStatus: 'On Hold',
          statusColor: 'status2'
        }
        break;
      case 3:
        this.statusData = {
          job_completed: 'hide',
          job_re_open: 'show',
          job_on_hold: 'hide',
          job_in_progress: 'show',
          jobStatus: 'Completed',
          statusColor: 'status3'
        }
        break;
      default:
        break;
    }
  }

  changeInProgressToHold(status: number, isFromReason?: boolean) {
    if (status != 3) {
      if (this.jobDetail && this.jobDetail.status == 1) {
        this.statusData = {
          job_on_hold: 'hide',
          job_in_progress: 'show',
          jobStatus: 'On Hold',
          statusColor: 'status2'
        }
        if (!isFromReason) {
          this.jobDetail.status = 2
        }
      } else {
        this.statusData = {
          job_on_hold: 'show',
          job_in_progress: 'hide',
          jobStatus: 'In-Progress',
          statusColor: 'status1'
        }
        if (!isFromReason) {
          this.jobDetail.status = 1
        }
      }

      if (!isFromReason) {
        this.changeStatus(this.jobDetail)
      } else {
        this.changeStatusIsFromReason(this.jobDetail)
      }
    } else {
      this.toastr.info(this.constantValues.JOB_RE_OPEN, 'Info')
    }

  }

  changeInCompletedToReopen(status: number, isFromReason?: boolean) {
    if (status != 2) {
      if (status == 3) {
        this.statusData = {
          job_completed: 'show',
          job_re_open: 'hide',
          job_on_hold: 'show',
          job_in_progress: 'hide',
          jobStatus: 'In-Progress',
          statusColor: 'status1',
        }
        if (!isFromReason) {
          this.jobDetail.status = 1
        }

      } else {
        this.statusData = {
          job_completed: 'hide',
          job_re_open: 'show',
          job_on_hold: 'hide',
          job_in_progress: 'show',
          jobStatus: 'Completed',
          statusColor: 'status3'
        }
        if (!isFromReason) {
          this.jobDetail.status = 3
        }
      }
      if (!isFromReason) {
        this.changeStatus(this.jobDetail)
      } else {
        this.changeStatusIsFromReason(this.jobDetail)
      }
    } else {
      this.toastr.info(this.constantValues.JOB_IN_PROGRESS, 'Info')
    }
  }

  changeStatus(data: Job) {
    // this.loading = true
    let apibody = {
      jobStatus: data.status,
      statusReason: ""
    }
    this.jobServices.changeJobStatus(data.id, apibody).subscribe(r => {
      this.isSent = false;
      this.statusToSet = '';
      this.jobSharedService.setJobData(data)
      this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, data)
      this.sharedService.getJobStatus.emit('statuschanged')
      this.toastr.success('Job Status updated successfully.')
      this.showHideButtonOnStatus()
      // this.loading = false
    })
  }

  EventForChangingTheStatus(res?: any) {

    let isFromReason: boolean = false
    if (res.isFromReason) {
      isFromReason = true
      this.jobDetail = res.jobDetail
    }
    if (!this.isSent) {
      if (isFromReason) {
        this.changeInProgressToHold(this.jobDetail.status, isFromReason)
      } else {
        this.changeInProgressToHold(this.jobDetail.status)
      }
    } else {
      if (isFromReason) {
        this.changeInCompletedToReopen(this.jobDetail.status, isFromReason)
      } else {
        this.changeInCompletedToReopen(this.jobDetail.status)
      }
    }
  }

  showHideButtonOnStatus() {
    this.getStatus(this.jobDetail)
  }

  changeStatusIsFromReason(data: any, fromload?: boolean) {
    this.isSent = false;
    this.statusToSet = '';
    this.jobSharedService.setJobData(data)
    this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, data)
    this.sharedService.getJobStatus.emit('statuschanged')
    if (!fromload) {
      this.toastr.success('Job Status updated successfully.')
    }

    this.jobSharedService.isUserLoggedIn.next(true);
    this.showHideButtonOnStatus()
    // this.loading = false
  }

  changeTheStatusOnReason(status: number, type: string, eventToSent: string) {
    this.changeStatusFromReason = status
    if (typeof type != 'undefined' && type == 'swap') {
      if (status != 3) {
        this.isSent = false
        this.statusToSet = eventToSent;
        this.openAddReasonForm(this.addreason, this.jobDetail.id)
      } else {
        this.toastr.info(this.constantValues.JOB_RE_OPEN, 'Info')
      }
    } else {
      if (type != '') {
        if (status != 2) {
          this.isSent = true;
          this.statusToSet = eventToSent;
          this.openAddReasonForm(this.addreason, this.jobDetail.id)
        } else {
          this.toastr.info(this.constantValues.JOB_RE_OPEN, 'Info')
        }
      } else {
        this.changeInCompletedToReopen(this.jobDetail.status)
      }
    }
  }

   openAddReasonForm(template: TemplateRef<any>, id?: number) {
    this.modalRef = this.modalService.show(template, {class: 'modal-md', backdrop: 'static', 'keyboard': false})
  }

  /**
   * This method is used to get status of job and set labels accordingly
   * @method getStatus
   * @param {any} r r is used as an array of status and displayaccordingly
   */
  getStatus(r: any) {
    this.serviceSubscription = this.jobSharedService.getJobData().subscribe(_sharingJobObject => {
      r = _sharingJobObject;
    })
    this.statusData = {}

    if (r == null) {
      r = this.appComponent.getFromSessionStorage(this.constantValues.JOBOBECT)
    }

    if (r) {
      if (r.status == 1) {
        this.statusData = {
          jobStatus: 'In-Progress',
          job_on_hold: 'show',
          job_in_progress: 'hide',
          job_re_open: 'hide',
          job_completed: 'show',
          statusColor: 'status1'
        }
      } else if (r.status == 2) {
        this.statusData = {
          jobStatus: 'On Hold',
          job_on_hold: 'hide',
          job_in_progress: 'show',
          job_re_open: 'hide',
          job_completed: 'show',
          statusColor: 'status2'
        }
      } else if (r.status == 3) {
        this.statusData = {
          jobStatus: 'Completed',
          job_on_hold: 'hide',
          job_in_progress: 'show',
          job_re_open: 'show',
          job_completed: 'hide',
          statusColor: 'status3'
        }
      }
    }
  }

  toggleProjectInfoPover() {
    this.showProjectInfoPover = !this.showProjectInfoPover
  }

  public _openModalAddTimeNotes(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-add-time-notes',
      backdrop: 'static',
      'keyboard': false
    })
  }

  public openModalAddTimeNotes(template: TemplateRef<any>, id?: number) {
    this._openModalAddTimeNotes(template)
  }

  public openModalProjectAddress(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-new-project-address',
      backdrop: 'static',
      'keyboard': false
    })
  }

  openAddJobModal(template: TemplateRef<any>, actionId?: string) {
    if (this.jobDetail && this.jobDetail.status == 3) {
      this.toastr.info(this.constantValues.JOB_RE_OPEN, 'Info')
    } else if (this.jobDetail && this.jobDetail.status == 2) {
      this.toastr.info(this.constantValues.JOB_IN_PROGRESS, 'Info')
    } else {
      if (actionId == 'REASSIGN') {
        this.isAddressDisabled = false
        this.isReAssigned = true
      } else {
        this.isAddressDisabled = true
        this.isReAssigned = false
      }
      this.modalRef = this.modalService.show(template, {class: 'modal-job', backdrop: 'static', 'keyboard': false})
    }

  }

  onSave(ctt: Job, evt: any) {
    if (ctt.id) {
      this.jobServices.getJobDetailById(ctt.id, true).subscribe(r => {
        if (r) {
          this.jobDetail = r
          this.sharedService.getJobEdit.emit(r);
          this.jobSharedService.setJobData(r);
          this.appComponent.saveInSessionStorage(this.constantValues.JOBOBECT, r)

          if (r.jobApplicationTypes && r.jobApplicationTypes.length > 0) {
            this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, r.jobApplicationTypes[0])
            this.selectedJobType = r.jobApplicationTypes[0]
          }
          if (r.status > 1) {
            this.btnShowHide = 'hide'
          } else {
            this.btnShowHide = 'show'
          }
        }
      }, e => {
        // this.loading = false;
      })
    }
  }

  setJobData(data: any) {
    this.jobDetail = data
    this.jobDetail.company = null ? this.jobDetail.company = '' : this.jobDetail.company = this.jobDetail.company
    document.title = 'Project - ' + this.jobDetail.jobNumber;
    if (this.jobDetail.startDate) {
      this.jobDetail.startDate = moment(convertUTCDateToLocalDate(new Date(this.jobDetail.startDate))).format(this.constantValues.DATEFORMAT);
    }
    if (this.jobDetail.idProjectManager && this.jobDetail.projectManager) {
      if ((typeof this.jobDetail.projectManager.firstName != "undefined") ||
        (this.jobDetail.projectManager.lastName && typeof this.jobDetail.projectManager.lastName != "undefined")) {
        if (this.jobDetail.projectManager.firstName) {
          this.pm = this.jobDetail.projectManager.firstName
        }
        if (this.jobDetail.projectManager.lastName) {
          this.pm += " " + this.jobDetail.projectManager.lastName
        }
      }
    }


    if (this.jobDetail.idProjectCoordinator &&
      this.jobDetail.projectCoordinator.firstName[0] && this.jobDetail.projectCoordinator.lastName[0]) {
      this.pc = this.jobDetail.projectCoordinator.firstName[0].toUpperCase() + this.jobDetail.projectCoordinator.lastName[0].toUpperCase()
    }
    if (this.jobDetail.idSignoffCoordinator && this.jobDetail.signoffCoordinator.firstName[0] && this.jobDetail.signoffCoordinator.lastName[0]) {

      this.sc = this.jobDetail.signoffCoordinator.firstName[0].toUpperCase() + this.jobDetail.signoffCoordinator.lastName[0].toUpperCase()
    }
    if (this.jobDetail.company != null) {
      let typeofcompany = this.jobDetail.company.companyTypes.filter((type: any) => type.itemName == 'General Contractor');


      if (this.jobDetail.company && this.jobDetail.company.companyTypes.length > 0) {

        // GET DATES OF GC
        this.jobDetail.company.dotInsuranceGeneralLiability != null ? this.jobDetail.company.dotInsuranceGeneralLiability = moment(this.jobDetail.company.dotInsuranceGeneralLiability).format(this.constantValues.DATEFORMAT) : '';

        this.jobDetail.company.dotInsuranceWorkCompensation != null ? this.jobDetail.company.dotInsuranceWorkCompensation = moment(this.jobDetail.company.dotInsuranceWorkCompensation).format(this.constantValues.DATEFORMAT) : '';

        this.jobDetail.company.insuranceObstructionBond != null ? this.jobDetail.company.insuranceObstructionBond = moment(this.jobDetail.company.insuranceObstructionBond).format(this.constantValues.DATEFORMAT) : '';

        this.jobDetail.company.insuranceGeneralLiability != null ? this.jobDetail.company.insuranceGeneralLiability = moment(this.jobDetail.company.insuranceGeneralLiability).format(this.constantValues.DATEFORMAT) : '';

        this.jobDetail.company.insuranceWorkCompensation != null ? this.jobDetail.company.insuranceWorkCompensation = moment(this.jobDetail.company.insuranceWorkCompensation).format(this.constantValues.DATEFORMAT) : ''

        this.jobDetail.company.insuranceDisability != null ? this.jobDetail.company.insuranceDisability = moment(this.jobDetail.company.insuranceDisability).format(this.constantValues.DATEFORMAT) : '';


        // Dropdown dates expires logic
        if (this.jobDetail.company.insuranceWorkCompensation && new Date(this.jobDetail.company.insuranceWorkCompensation) < new Date(this.today)) {
          this.insuranceWorkCompenstaionExpired = true;
        }
        if (this.jobDetail.company.insuranceDisability && new Date(this.jobDetail.company.insuranceDisability) < new Date(this.today)) {
          this.insuranceDisabilityExpired = true;
        }
        if (this.jobDetail.company.insuranceGeneralLiability && new Date(this.jobDetail.company.insuranceGeneralLiability) < new Date(this.today)) {
          this.insuranceGeneralLiabilityExpired = true;
        }
        if (this.jobDetail.company.insuranceObstructionBond && new Date(this.jobDetail.company.insuranceObstructionBond) < new Date(this.today)) {
          this.insuranceObstructionBondExpired = true;
        }
        if (this.jobDetail.company.dotInsuranceWorkCompensation && new Date(this.jobDetail.company.dotInsuranceWorkCompensation) < new Date(this.today)) {
          this.dotInsuranceWorkCompensationExpired = true;
        }
        if (this.jobDetail.company.dotInsuranceGeneralLiability && new Date(this.jobDetail.company.dotInsuranceGeneralLiability) < new Date(this.today)) {
          this.dotInsuranceGeneralLiabilityExpired = true;
        }
        for (let ct of this.jobDetail.company.companyTypes) {
          if (ct.id == 11) {
            this.companyType = "SI"
            if (this.jobDetail.company.specialInspectionAgencyExpiry && new Date(this.jobDetail.company.specialInspectionAgencyExpiry) < new Date(this.today)) {
              this.redIcon = true
            }
          }
          if (ct.id == 13) {
            this.companyType = "GC"
            this.jobDetail.company.trackingExpiry != null ? this.jobDetail.company.trackingExpiry = moment(this.jobDetail.company.trackingExpiry).format(this.constantValues.DATEFORMAT) : '';
            if (this.jobDetail.company.trackingExpiry && new Date(this.jobDetail.company.trackingExpiry) < new Date(this.today)) {

              this.redIcon = true
            }
          }
          if (ct.id == 27) {
            this.companyType = "CTL"
            if (this.jobDetail.company.ctExpirationDate && new Date(this.jobDetail.company.ctExpirationDate) < new Date(this.today)) {
              this.redIcon = true
            }
          }
        }
      }
    }
    if (this.jobDetail != null) {
      this.teamInitials = [];
      if (this.jobDetail.dobProjectTeam && this.jobDetail.dobProjectTeam.length > 0) {
        this.jobDetail.dobProjectTeam.forEach((element: any) => {
          const found = this.teamInitials.some(el => el.id === element.id);
          if (!found && element.id) {
            this.teamInitials.push({
              id: element.id,
              itemName: element.itemName.match(/\b(\w)/g).join('').substring(0, 2),
              fullName: element.itemName,
              emailAddress: element.emailAddress || element.email,
            })
          }
        });
      }
      if (this.jobDetail.dotProjectTeam && this.jobDetail.dotProjectTeam.length > 0) {
        this.jobDetail.dotProjectTeam.forEach((element: any) => {
          const found = this.teamInitials.some(el => el.id === element.id);
          if (!found && element.id) {
            this.teamInitials.push({
              id: element.id,
              itemName: element.itemName.match(/\b(\w)/g).join('').substring(0, 2),
              fullName: element.itemName,
              emailAddress: element.emailAddress || element.email,
            })
          }
        });
      }
      if (this.jobDetail.violationProjectTeam && this.jobDetail.violationProjectTeam.length > 0) {
        this.jobDetail.violationProjectTeam.forEach((element: any) => {
          const found = this.teamInitials.some(el => el.id === element.id);
          if (!found && element.id) {
            this.teamInitials.push({
              id: element.id,
              itemName: element.itemName.match(/\b(\w)/g).join('').substring(0, 2),
              fullName: element.itemName,
              emailAddress: element.emailAddress || element.email,
            })
          }
        });

      }
      if (this.jobDetail.depProjectTeam && this.jobDetail.depProjectTeam.length > 0) {
        this.jobDetail.depProjectTeam.forEach((element: any) => {
          const found = this.teamInitials.some(el => el.id === element.id);
          if (!found && element.id) {
            this.teamInitials.push({
              id: element.id,
              itemName: element.itemName.match(/\b(\w)/g).join('').substring(0, 2),
              fullName: element.itemName,
              emailAddress: element.emailAddress || element.email,
            })
          }
        });
        // console.log(this.teamInitials)

      }
      if (this.jobDetail.projectManager && this.jobDetail.projectManager.id != null) {
        const found = this.teamInitials.some(el => el.id === this.jobDetail.projectManager.id);
        if (!found) {
          this.teamInitials.push({
            id: this.jobDetail.projectManager.id,
            itemName: (this.jobDetail.projectManager.firstName + " " + this.jobDetail.projectManager.lastName).match(/\b(\w)/g).join('').substring(0, 2),
            fullName: this.jobDetail.projectManager.firstName + " " + this.jobDetail.projectManager.lastName,
            emailAddress: this.jobDetail.projectManager?.emailAddress || this.jobDetail.projectManager.email,
          })
        }
      }

    }
  }

  /**
   * This method is used to set job application type
   * @method setApplicationJobType
   * @param {any} r r is an object of application type
   */
  setApplicationJobType(r: any) {
    console.log('setApplicationJobType run', r)
    let appType = r.jobApplicationType.split(',');
    console.log('appType', appType)
    if (appType && appType.length > 0) {
      let selectedJobType = this.appComponent.getFromSessionStorage(this.constantValues.SELECTEDJOBTYPE)
      if (selectedJobType) {
        this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, selectedJobType);
      } else {
        this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, appType[0]);
      }
      let keepGoing = true;
      appType.forEach((idJobAppType: any) => {
        if (keepGoing) {
          this.jobSharedService.setJobAppType(idJobAppType);
          keepGoing = false
        }
      })
      if (!keepGoing) {
        this.serviceSubscriptionAppType = this.jobSharedService.getJobAppType().subscribe(_sharingJobAppType => {
          this.selectedJobType = _sharingJobAppType
          // console.log(this.selectedJobType);
        });
      }
    } else if (appType.length == 1) {
      this.appComponent.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, appType[0]);
    }
  }

  openModalFormCreateTask(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-add-task'})
  }

  downloadPdf() {
    if (this.jobDetail.idRfp) {
      this.rfpSubmitService.downloadPdf(this.jobDetail.idRfp).subscribe(r => {
        if (r && r[0]['key'] == 'pdfFilePath') {
          window.open(r[0]['value'], '_blank');
        }
      })
    } else {
      this.toastr.info(this.errorMsg.noRfpRelatedWithJob)
    }
  }

  public openCreateTransmittalModal(template: TemplateRef<any>, action?: string, id?: number) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-add-transmittal',
      backdrop: 'static',
      'keyboard': false
    })
  }

  generateLabel(id: number) {
    this.jobServices.generateLabel(id).subscribe(r => {
      window.open(r, '_blank');
      this.toastr.success('Label generated successfully')
    }, e => {
    })
  }

  public viewOnBis(binNumber: string) {
    if (binNumber) {
      // window.open("http://a810-bisweb.nyc.gov/bisweb/JobsQueryByLocationServlet?requestid=1&allbin=" + binNumber, '_blank');
      window.open("http://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?bin=" + binNumber, '_blank');

    } else {
      this.toastr.info(this.errorMsg.binNumberNotExist);
    }
  }

  public viewOnDob() {
    window.open("https://a810-dobnow.nyc.gov/Publish/Index.html#!/", '_blank');
  }

  public onHistory() {
    this.router.navigate(['./job/' + this.jobDetail.id + '/jobHistory'])
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

  addTextToEmail(email) {
    const emailBody = `
    \nCustomer Name : ${this.user.name}, 
    \nProject #: ${this.jobDetail.id}
  `;
    //   const emailBody = `Customer Portal URL : ${window.location.origin}${this.router.url},
    //   \nCustomer Name : ${this.user.name},
    //   \nProject : ${this.jobDetail.id}
    // `;
    if(this.isCustomerLoggedIn) {
      window.location.href = `mailto:${email}?subject=Assistance Needed From Snapcor!&body=${encodeURIComponent(emailBody)}`;
    }
  }

  public violationDetailModal(template: TemplateRef<any>, violationId) {
    this.idViolation = violationId
    this.modalRef = this.modalService.show(template, {class: 'modal-add-task', backdrop: 'static', 'keyboard': false})
  }
}