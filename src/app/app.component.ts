//import './utils/dataTables.extensions';
import './utils/dataTables.moment';
//import 'bootstrap-loader';

import {
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
  Inject,
  TemplateRef
} from '@angular/core';
import { NavigationStart, Router, Event, NavigationEnd, NavigationError } from '@angular/router';
import { fromEvent, Observable, Subscription } from 'rxjs';


import { API_URL } from './app.constants';
import { DeleteConfirmation } from './components/DeleteConfirmation';
import { SaveConfirmation } from './components/SaveConfirmation';
import { Menu } from './types/menu';
import { User } from './types/user';
import { GlobalSearchServices } from "./services/globalSearch.services";
import { ToastrService } from 'ngx-toastr';
import { Message } from './app.messages';
//import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { constantValues, SharedService } from './app.constantValues';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { JobSharedService } from './route/job/JobSharedService';
import { NotificationServices } from './route/notification/notification.services';
import { RfpListService } from './route/rfp/rfp.services';
import { JobServices } from './route/job/job.services';
import { LocalStorageService } from './services/local-storage.service';
import { UserRightServices } from './services/userRight.services';
import { setTheme } from 'ngx-bootstrap/utils';

declare const objectFitImages: any
declare const $: any

@Component({
  selector: 'rpo-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  onlineEvent: Observable<any>;
  offlineEvent: Observable<any>;
  subscriptions: Subscription[] = [];
  connectionStatusMessage: string;
  connectionStatus: string;
  @ViewChild('deleteConfirmation', {read: ViewContainerRef, static: true}) private deleteConfirmationRef: any
  @ViewChild('saveConfirmation', {read: ViewContainerRef, static: true}) private saveConfirmationRef: any

  modalRef: BsModalRef
  @ViewChild('viewtask', {static: true})
  private viewtask: TemplateRef<any>
  private frommodeule: string
  private isNew: boolean = false
  idTask: number
  idJob: number
  redirectionURL: string
  private loginUserInitial;
  public groupHub: any
  public onRfpStatusChanged = new EventEmitter<any>();

  private deleteConfirmation: DeleteConfirmation
  private globalSearchType: number = 1
  private globalSearchText: string
  private showCross: boolean;
  private moreBtn: string = 'hide'

  public showDeleteConfirmation(fn: Function, args?: any) {
    this.deleteConfirmation.show(fn, args)
  }

  saveConfirmation: SaveConfirmation

  public showSaveConfirmation(fn: Function, args?: any) {
    this.saveConfirmation.show(fn, args)
  }

  public user: User = {name: 'User Name'}

  public setUser(user?: User) {
    this.user = user || {name: 'User Name'}
  }

  public login = false
  loading: boolean = false
  private routerSubscription: Subscription

  private errorMsg: any
  private currentRoute: string
  private badgeList: any
  private loggedInUserId: number
  public sessionStorage: any = []

  online: Observable<any>;
  name: string;
  placeholder: string = 'Project#';
  isSideMenuShow: boolean = false;
  isCustomerLoggedIn: boolean = false;
  storage = window.sessionStorage

  public constructor(
    private modalService: BsModalService,
    private router: Router,
    private globalSearchServices: GlobalSearchServices,
    private jobServices: JobServices,
    private rfpListService: RfpListService,
    private toastr: ToastrService,
    private message: Message,
    private notificationService: NotificationServices,
    //@Inject(SESSION_STORAGE) private storage: WebStorageService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private constantValues: constantValues,
    private jobSharedService: JobSharedService,
    private sharedService: SharedService,
    private localStorageService: LocalStorageService,
    private userRight: UserRightServices
  ) {
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
    setTheme('bs3');
    const userinfo = localStorage.getItem('userinfo')
    if (userinfo)
      this.user = JSON.parse(userinfo)
    this.loginUserInitial = (this.user.name).match(/\b(\w)/g).join('').substring(0, 2)
    this.errorMsg = this.message.msg

    /**
     * For the Network Connection checking
     */
    // const first = Observable.fromEvent(window, 'online');
    // const second = Observable.fromEvent(window, 'offline');
    // const access = Observable.of(navigator.onLine);
    // let onlineaccess = first.pipe(mapTo(true));
    // let offlineaccess = second.pipe(mapTo(false));
    // let result = Observable.merge(access, onlineaccess, offlineaccess)
    // this.online = result;
    // this.networkStatus();
  }


  ngOnInit() {
    this.sharedService.clearGlobalSearch.subscribe((path: any) => {
      this.globalSearchText = null;
      if (path) {
        this.router.navigate(["/" + path])
      }
    })
    /**
     * Get the online/offline status from browser window
     */
    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent = fromEvent(window, 'offline');

    this.subscriptions.push(this.onlineEvent.subscribe(e => {
      this.connectionStatusMessage = 'Back to online';
      this.connectionStatus = 'online';
      this.toastr.success('Back to online', '', {timeOut: 5000})
    }));

    this.subscriptions.push(this.offlineEvent.subscribe(e => {
      this.connectionStatusMessage = 'Connection lost! You are not connected to internet';
      this.connectionStatus = 'offline';
      this.toastr.error('Please check your Internet connection and try reloading the Page', '', {timeOut: 5000})
    }));


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
    }
    // objectFitImages()

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log(event)
        if (event.url === '/login') {
          this.login = true
        } else if (event.url.includes("/customer-signup")) {
          this.login = true
        } else if (event.url.includes("/terms-and-conditions")) {
          this.login = true
        } else if (event.url.includes("/trademark-guideline")) {
          this.login = true
        } else if (event.url.includes("/privacy-policy")) {
          this.login = true
        } else if (event.url.includes("/customer-login")) {
          this.login = true
        } else if (event.url.includes("/forgot-password")) {
          this.login = true
        } else if (event.url.includes("/set-password")) {
          this.login = true
        } else {
          this.login = false;
          this.setDocumentTitle(event.url)
        }
      }
      // hide dropdown on route change
      $("ul[class*='action'].dropdown-menu, ul[class*='special-column'].dropdown-menu, .export-dropdown, rpo-app ~ ul.dropdown-menu").remove();

      // show tooltip
      setTimeout(function () {
        $('[data-toggle="tooltip"]').tooltip();
      }, 500);

      // single navigation menu open at a time
      setTimeout(function () {
        $(".first-menu > a").click(function () {
          $(".first-menu").removeClass("open");
          $(this).parent().addClass("open");
        });
      }, 100);

      // hide autocomplete
      $(document).on('focus', ':input', function () {
        $(this).attr('autocomplete', 'off');
      });

      //It is used For the component Reuse For Global search ...
      this.router.routeReuseStrategy.shouldReuseRoute = function () {
        return false;
      };
    })

    this.deleteConfirmation = this.deleteConfirmationRef.createComponent(this.componentFactoryResolver.resolveComponentFactory(DeleteConfirmation)).instance
    this.saveConfirmation = this.saveConfirmationRef.createComponent(this.componentFactoryResolver.resolveComponentFactory(SaveConfirmation)).instance

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
    if (localStorage.getItem('userLoggedInId') && localStorage.getItem('userLoggedInId') != null) {
      this.groupHub.connection.start()
        .done(() => {
          this.groupHub.invoke('subscribe', localStorage.getItem('userLoggedInId').toString())
            .done(() => {
              this.groupHub.subscribed = true
            })
            .fail((e: any) => {
            })
        })
        .fail((e: any) => {
        });
    }
    //Global search placeholder changes
    $('.search-box-head li a').click(function () {
      var getPlaceholder = $('.search-box-head li.selectedGlobalType a').html();
      $(".search-box-head .search-area").attr("placeholder", getPlaceholder);
    });
  }

  /* dropdown should not close */
  private closeDropdown(event: any) {
    event.stopPropagation();
  }

  ngOnDestroy(): void {
    /**
     * Unsubscribe all subscriptions to avoid memory leak
     */
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.groupHub.subscribed && this.groupHub.invoke('unsubscribe', 'rfp-status')
    this.routerSubscription.unsubscribe()
  }

  goToMain() {
    setTimeout(() => {
      this.router.navigate(['home'])
    })
  }

  isActive(menuItem: Menu): boolean {
    return !menuItem.routerLink && menuItem.items.findIndex(i => this.router.isActive(i.routerLink, true)) !== -1
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

    this.router.navigate(['login'])
  }

  findRouterLink(url: string, item: any): boolean {
    if (item.routerLink === url)
      return true
    else if (item.items) {
      let result = false
      for (let i = 0, l = item.items.length; !result && i < l; i++)
        result = this.findRouterLink(url, item.items[i])

      return result
    }

    return false
  }

  setDocumentTitle(url: string) {
    if (this.user && this.user.menu && this.user.menu.length) {
      for (let i = 0, l = this.user.menu.length; i < l; i++) {
        const menu = this.user.menu[i]

        if (this.findRouterLink(url, menu)) {
          document.title = menu.text
          return
        }
      }
    }
    document.title = 'RPO Application'
    this.login = false;
    //  if (API_URL == 'https://snapcor.com:8091/') {
    //      document.title = 'Snapcor'
    //  } else {
    //      document.title = 'RPO Application'
    //  }

  }

  getBadgeList() {
    localStorage.setItem("notificationCount", "");
    localStorage.setItem("seenNotification", 'true');
    $(".badge").text(localStorage.getItem("notificationCount"));

    this.notificationService.getBadgeList(parseInt(localStorage.getItem("userLoggedInId"))).subscribe(r => {
      this.badgeList = r;
      if (this.badgeList.length > 0) {
        this.moreBtn = 'show';
      }
    })
  }

  deleteNotification(id: number, event: any) {
    this.notificationService.delete(id).subscribe(r => {
      if (r.id) {
        this.toastr.success(this.errorMsg.deleteNotificationMsg);
        this.getBadgeList();
      }
    });
    event.stopPropagation();
  }

  search(type: number, placeholderr: string) {

    if (type) {
      this.globalSearchType = type
      this.placeholder = placeholderr;
    }
  }

  globalSearch() {
    // this.showCross = true;
    if (!this.globalSearchType) {
      this.globalSearchType = 1
    }

    if (this.globalSearchType && this.globalSearchText) {
      this.loading = true
      this.globalSearchServices.search(this.globalSearchType, this.globalSearchText).subscribe(r => {
        this.loading = false
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

  // clearSearch(){
  //     this.globalSearchText = null;
  //     this.showCross = false;
  // }

  phoneFormat(phone?: any) {
    if (phone.length == 10) {
      let newPhone = ""
      newPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      return newPhone;
    } else {
      return phone
    }
  }

  /**
   * get all notification of logged in user
   */
  getAllNotification() {
    localStorage.setItem("notificationCount", "");
    $(".badge").text(localStorage.getItem("notificationCount"));
    this.router.navigate(['./notification'])
  }


  /**
   * redirect to specific module from notification
   */
  redirectFromNotification(notificationIndex: number, event: any) {
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
          this.router.navigate(['./' + tsturl[0], {idJobAppType: idJobAppType[1]}])
        } else {
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
            this.router.navigate(['./' + url]);
            // this.router.navigate(['./' + this.badgeList[notificationIndex].redirectionUrl]);
          }
        }
      }
    }

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

  setCommonJobObject(idJob: number, globalSearchType?: number) {
    this.loading = true
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')

    if (this.isCustomerLoggedIn) {
      this.jobServices.getCustomerJobDetailById(idJob).subscribe(jobDetail => {
        this.saveInSessionStorage(this.constantValues.JOBOBECT, jobDetail);
        this.jobSharedService.setJobData(jobDetail);
        let appType: any = [];
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
                  this.loading = false
                  this.router.navigate(['/job/' + jobDetail.id + '/violation']);

                } else if (idJobAppType == 2) {
                  this.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, idJobAppType)
                  keepGoing = false;
                  this.loading = false
                  this.router.navigate(['/job/' + jobDetail.id + '/dot', {idJobAppType: idJobAppType}]);
                } else {
                  this.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, idJobAppType)
                  keepGoing = false;
                  this.loading = false
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
        this.loading = false;
      });
    } else {
      this.jobServices.getJobById(idJob).subscribe(jobDetail => {
        this.saveInSessionStorage(this.constantValues.JOBOBECT, jobDetail);
        this.jobSharedService.setJobData(jobDetail);
        let appType: any = [];
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
                  this.loading = false
                  this.router.navigate(['/job/' + jobDetail.id + '/violation']);

                } else if (idJobAppType == 2) {
                  this.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, idJobAppType)
                  keepGoing = false;
                  this.loading = false
                  this.router.navigate(['/job/' + jobDetail.id + '/dot', {idJobAppType: idJobAppType}]);
                } else {
                  this.saveInSessionStorage(this.constantValues.SELECTEDJOBTYPE, idJobAppType)
                  keepGoing = false;
                  this.loading = false
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
        this.loading = false;
      });
    }
  }


  saveInSessionStorage(key: any, val: any): any {
    this.storage.setItem(key, JSON.stringify(val));
    this.sessionStorage[key] = JSON.parse(this.storage.getItem(key));
  }

  getFromSessionStorage(key: any): any {
    let data: any
    this.sessionStorage[key] = JSON.parse(this.storage.getItem(key));
    data = this.sessionStorage[key];
    return data
  }

  clearGlobalSearch() {
    this.sharedService.clearGlobalSearch.emit()
  }

}