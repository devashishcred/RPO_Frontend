import { IRequestNewProject } from "./../../../types/customer";
import { Component, OnInit } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { RequestNewProjectComponent } from "../request-new-project/request-new-project.component";
import { CustomerService } from "../customer.service";
import { ToastrService } from "ngx-toastr";
import { UserRightServices } from "../../../services/userRight.services";
import { constantValues } from "../../../app.constantValues";
import { LocalStorageService } from "../../../services/local-storage.service";
import { NewsLetterServices } from "../../../services/news-letter.services";

@Component({
  selector: "dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  private modalRef: BsModalRef;
  requestNewProjectObject: IRequestNewProject = {
    ProposalnName: "",
    ProposalAddress: "",
    ProposalDescription: "",
  };
  userInfo: any;
  loading:boolean = false;
  isCustomerLoggedIn: boolean = false;
  newsDetails:any;
  isCustomerAllowForProposal:boolean = false;

  constructor(
    private modalService: BsModalService,
    private customerService: CustomerService,
    private toastr: ToastrService,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private localStorageService: LocalStorageService,
    private newsLetterService:NewsLetterServices
  ) { }

  ngOnInit(): void {
    this.isCustomerLoggedIn = this.localStorageService.getCustomerLoggedIn() ? (this.userRight.checkAllowButton(this.constantValues.DASHBOARDID) == 'show') : (this.localStorageService.getCustomerLoggedIn() || this.userRight.checkAllowButton(this.constantValues.DASHBOARDID) == 'show')
    this.isCustomerAllowForProposal = this.userRight.checkAllowButton(this.constantValues.SENDEMAILRPOID) == 'show' ? true : false;
    console.log('cus permis',this.isCustomerLoggedIn)
    if(this.isCustomerLoggedIn) {
      const userinfo = localStorage.getItem('userinfo')
      if (userinfo) {
        this.userInfo = JSON.parse(userinfo)
        this.getLatestNews()
      }
    }
  }

  openNewProjectModal(): void {
    // if(!this.isCustomerAllowForProposal) {
    //   this.toastr.warning("Please contact RPO administration")
    //   return 
    // }

    this.modalRef = this.modalService.show(RequestNewProjectComponent, {
      class: "modal-md",
    });
    this.modalRef.content.modalRef = this.modalRef;
    const unsubscribe = this.modalService.onHidden.subscribe((reason: string) => {
      console.log('dashboard reason',reason,this.modalRef.content)
      if (this.modalRef.content) {
        this.requestNewProjectObject.ProposalnName = this.modalRef.content?.projectName;
        this.requestNewProjectObject.ProposalAddress = this.modalRef.content?.address;
        this.requestNewProjectObject.ProposalDescription = this.modalRef.content?.projectDesc;
        this.saveNewProjectDetail();
        unsubscribe.unsubscribe()
      }
    })
  }

  openNewsLink(): void {
    window.open(this.newsDetails.url || "https://www.rpoinc.com/news", "_blank");
  }

  saveNewProjectDetail() {
    if (
      this.requestNewProjectObject.ProposalnName &&
      this.requestNewProjectObject.ProposalAddress &&
      this.requestNewProjectObject.ProposalDescription
    ) {
      this.loading = true;
      this.customerService
      .saveNewProjectDetail(this.requestNewProjectObject)
      .subscribe(
        (res) => {
            this.loading = false;
            console.log('dashboard new projet req',res);
            if (res) {
              this.toastr.success("New proposal request sent successfully.");
            }
          },
          (error) => {
            this.loading = false;
            this.toastr.error(error.message);
          }
        )
    }
  }

  openUrlInNewTab(url) {
    window.open(url, "_blank");
  }

  async getLatestNews() {
    try {
      this.loading = true;
      const res = await this.newsLetterService.getUpdatedNews()
      console.log('latest news',res)
      this.newsDetails = res
      this.loading = false;
    } catch(err) {
      this.loading = false;
      this.toastr.error(err)
    }
  }
}
