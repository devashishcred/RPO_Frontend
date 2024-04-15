import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HomeServices } from './home.services';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponent } from '../../app.component';

declare const $: any

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  /**
   * To view specific task
   * @property viewtask
   */
  @ViewChild('viewtask', {static: true})
  private viewtask: TemplateRef<any>

  modalRef: BsModalRef
  idTask: number
  upcomingAppointment: any = []
  upcomingHearingDates: any = []
  taskAssignedToDue: any = []
  taskAssignedByDue: any = []
  overDueTasks: any = []
  url: string;
  loading: boolean;


  constructor(
    private homeServices: HomeServices,
    private modalService: BsModalService,
    private router: Router,
    private appComponent: AppComponent
  ) {

  }

  ngOnInit() {
    this.getUpcoming7DaysAppointment();
    this.getUpcomingHearingDates();
    this.getTaskAssignedToIn5DaysDue();
    this.getTaskAssignedByIn5DaysDue();
    this.getOverDueTasks();
  }

  getUpcoming7DaysAppointment() {
    this.homeServices.getUpcomingAppointments().subscribe(r => {
      this.upcomingAppointment = r.data;
    })
  }

  getUpcomingHearingDates() {
    this.homeServices.getUpcomingHearingDates().subscribe(r => {
      this.upcomingHearingDates = r.data;
    })
  }

  getTaskAssignedToIn5DaysDue() {
    this.homeServices.getTaskAssignedTo().subscribe(r => {
      this.taskAssignedToDue = r.data;
    })
  }

  getTaskAssignedByIn5DaysDue() {
    this.homeServices.getTaskAssignedBy().subscribe(r => {
      this.taskAssignedByDue = r.data;
    })
  }

  getOverDueTasks() {
    this.homeServices.getOverDueTasks().subscribe(r => {
      this.overDueTasks = r.data;
    })
  }

  setJobInLocalStorage(data: any, from?: string) {
    localStorage.setItem('isFromTask', 'true')
    if (data.taskFor) {
      if (data.taskFor.includes("Company")) {
        this.router.navigate(['./companydetail/', data.idCompany])
      } else if (data.taskFor.includes("Contact")) {
        this.router.navigate(['./contactdetail/', data.idContact])
      } else if (data.taskFor.includes("Job#")) {
        this.appComponent.setCommonJobObject(data.idJob);

      } else if (data.taskFor.includes("RFP#")) {
        this.router.navigate(['./editSiteInformation/', data.idRfp])
      }
    } else {
      if (from == 'heardates') {
        this.appComponent.setCommonJobObject(data.idJob);
      }

    }
  }

  setViolationTabLocalStorage(ev: any, data: any) {
    localStorage.setItem('isFromViolationReport', 'true')
    ev = ev || window.event;
    switch (ev.which) {
      case 1:
        this.router.navigate(['./job/', data.idJob, 'violation']);
        ;
        break;
      case 2:
        '';
        break;
      case 3:
        $('a.taskfor').attr('href', './job/' + data.idJob + 'violation');

        ;
        break;
    }
  }

  AllRedirectionsHere(ev: any, data: any, from?: string) {
    console.log(ev)
    ev = ev || window.event;
    switch (ev.which) {
      case 1:
        if (from) {
          this.setJobInLocalStorage(data, from);
        } else {
          this.setJobInLocalStorage(data);
        }


        ;
        break;
      case 2:
        '';
        break;
      case 3:
        if (data.taskFor) {
          if (data.taskFor.includes("Company")) {
            $('a.taskfor').attr('href', './companydetail/' + data.idCompany);
          } else if (data.taskFor.includes("Contact")) {
            $('a.taskfor').attr('href', './contactdetail/' + data.idContact);
          } else if (data.taskFor.includes("Job#")) {
            let jobtype = '';
            let jobtypeId = '';
            if (data.jobApplicationType) {
              let appType = data.jobApplicationType.split(',');
              if (appType && appType.length > 0) {
                let keepGoing = true;
                appType.forEach((idJobAppType: any) => {
                  if (keepGoing) {
                    if (idJobAppType == 3) {
                      keepGoing = false;
                      jobtype = 'violation';
                    } else if (idJobAppType == 2) {
                      keepGoing = false;
                      jobtype = 'dot';
                      jobtypeId = idJobAppType;
                    } else {
                      keepGoing = false;
                      jobtype = 'application';
                      jobtypeId = idJobAppType;
                    }
                  }
                })
              }
              if (jobtypeId != '') {
                let url = './job/' + data.idJob + '/' + jobtype + ';' + 'idJobAppType=' + jobtypeId;
                $('a.taskfor').attr('href', url)
              } else {
                let url = './job/' + data.idJob + '/' + jobtype;
                $('a.taskfor').attr('href', url)
              }
              ;
            }
          } else if (data.taskFor.includes("RFP#")) {
            $('a.taskfor').attr('href', './editSiteInformation/' + data.idRfp);
          }
        } else {
          if (from) {
            $('a.taskfor').attr('href', './job/' + data.idJob + '/violation');
          }
        }

        ;
        break;
    }
  }

  onOpenJobDetailOfHearingDate(data: any) {
    console.log(data)
    //this call is used to set data in shared service
    this.appComponent.setCommonJobObject(data.jobNumber);
  }

  onOpenViolationOfHearingDate(event, data: any) {
    event.preventDefault();
    console.log('event', event)
    console.log('data', data)
    if (event.target && event.target.href && event.target.tagName == 'A') {
      if (event.target.href) {
        const inputString = event.target.href;
        let jobId = this.getJobId(inputString)
        if (inputString.includes('isDob=true')) {
          this.router.navigateByUrl(`/job/${jobId}/violation?highlighted=${data?.summonsNumber}&isDob=true`)
        } else {
          this.router.navigateByUrl(`/job/${jobId}/violation?highlighted=${data?.summonsNumber}`)
        }
      }
    }
  }

  /**
   * This method is used to open modal popup for openModalFormView
   * @method openModalFormView
   * @param {any} template type which contains template of create/edit module
   * @param {number} id? it is optional which contains id if record is in edit mode
   */
  openModalFormView(template: TemplateRef<any>, id?: number) {
    if (id) {
      this.idTask = id;
    }
    this.modalRef = this.modalService.show(template, {class: 'modal-view-task', backdrop: 'static', 'keyboard': false})
  }

  getJobId(value: string): string {
    const url = value;
    // Using a simple regular expression
    const regex = /\/job\/(\d+)/;

    const match = url.match(regex);

    if (match && match[1]) {
      const value = match[1];
      return value; // This will print "3782"
    } else {
      return "-"
    }
  }

}