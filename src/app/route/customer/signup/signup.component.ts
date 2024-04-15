import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Message } from "../../../app.messages";
import { CustomerService } from "../customer.service";
import { ToastrService } from "ngx-toastr";
import { ISignUp } from "../../../types/customer";
import { LoginServices } from "../../login/login.services";
import { AppComponent } from "../../../app.component";
import { API_URL } from "../../../app.constants";

@Component({
  selector: "signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"],
})
export class SignupComponent implements OnInit {
  signUpForm: FormGroup;
  errorMessage: {};
  idContact: any;
  loading: boolean = false;
  private allPermision: any = [];
  public userRights: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private translateServcie: Message,
    private customerService: CustomerService,
    private toastr: ToastrService,
    private router: Router,
    private loginServices: LoginServices,
    private appComponent: AppComponent
  ) {
    this.errorMessage = this.translateServcie.msg;
  }

  ngOnInit(): void {
    this.setSignUpForm();
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params && params["email"]) {
        this.signUpFormControl.email.setValue(params.email);
      }
      if (params['IdContact']) {
        this.idContact = params['IdContact'];
      }
    });
    // if(this.idContact) {
    //   this.getEmail()
    // }
  }

  setSignUpForm(): void {
    this.signUpForm = this.formBuilder.group({
      email: [""],
      password: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      countinueAgree: [false, [Validators.requiredTrue]],
    });
    this.signUpFormControl.email.disable();
  }

  get signUpFormControl() {
    return this.signUpForm.controls;
  }

  signUpClickEvent() {
    this.loading = true;
    if (this.signUpForm.invalid) {
      this.loading = false;
      return;
    }

    const data: ISignUp = {
      email: this.signUpFormControl.email.value,
      loginPassword: this.signUpFormControl.password.value,
      IsActive: true,
      IdGroup: 7,
      // IdContact: 0
      IdContact: this.idContact
      // countinueAgree: this.signUpFormControl.countinueAgree.value,
    };
    this.customerService.saveSignUpDetail(data).subscribe(
      async (res: any) => {
        console.log('saveSignUpDetail res', res)
        if (!res?.error) {
          // localStorage.clear();
          let tempData = {
            email: this.signUpFormControl.email.value,
          }
          await this.customerService.sendWelcomeEmail(tempData);
          if (res.idJob) {
            console.log('if')
            await this.customerService.sendProjectAccessMail(res.idContact, res.idJob)
          }
          this.loading = false;
          this.customerLogin()
        } else {
          this.loading = false;
        }
      },
      (error) => {
        console.log(error)
        this.loading = false;
        this.toastr.error(error.message);
      }
    );
  }

  // getEmail() {
  //   this.customerService.getCustomerEmailByContactId(this.idContact).subscribe(res=>{
  //     console.log(res)
  //     this.signUpFormControl.email.setValue(res);
  //   })
  // }

  customerLogin() {
    if (this.signUpFormControl.email.value && this.signUpFormControl.password.value) {
      this.loading = true;
      let data = {
        username: this.signUpFormControl.email.value,
        password: this.signUpFormControl.password.value,
      }
      this.loginServices.login(data, true).subscribe(token => {
        console.log('user login response', token)
        localStorage.setItem("auth", JSON.stringify(token));
        this.customerService.customerInfo().subscribe((user: any) => {
          console.log('customer info', user)
          // this.loading = false;
          // return this.router.navigate(["/customer-dashboard"]);
          if (this.allPermision && this.allPermision.length == 0) {
            this.allPermision = [];
            this.allPermision = user.permissionDetails;
            let deleteJobDeletePermission = this.allPermision.filter(
              (x: any) => x.name == "DeleteJob"
            )[0];
            if (typeof deleteJobDeletePermission != "undefined") {
              let remIndex = this.allPermision.indexOf(
                deleteJobDeletePermission
              );
              this.allPermision.splice(remIndex, 1);
            }
            let deleteTransmittalExportPermission =
              this.allPermision.filter(
                (x: any) => x.name == "PrintExportTransmittals"
              )[0];
            if (typeof deleteTransmittalExportPermission != "undefined") {
              let remIndex = this.allPermision.indexOf(
                deleteTransmittalExportPermission
              );
              this.allPermision.splice(remIndex, 1);
            }

            let deleteViewReportPermission = this.allPermision.filter(
              (x: any) => x.name == "ViewReport"
            )[0];
            if (typeof deleteViewReportPermission != "undefined") {
              let remIndex = this.allPermision.indexOf(
                deleteViewReportPermission
              );
              this.allPermision.splice(remIndex, 1);
            }
            let deleteRFPdeletePermission = this.allPermision.filter(
              (x: any) => x.name == "DeleteRFP"
            )[0];
            if (typeof deleteRFPdeletePermission != "undefined") {
              let remIndex = this.allPermision.indexOf(
                deleteRFPdeletePermission
              );
              this.allPermision.splice(remIndex, 1);
            }
            localStorage.setItem(
              "allPermissions",
              JSON.stringify(this.allPermision)
            );
          }
          localStorage.setItem("userinfo", JSON.stringify(user));
          localStorage.setItem(
            "userLoggedInId",
            JSON.stringify(user.employeeId)
          );
          localStorage.setItem(
            "userLoggedInName",
            JSON.stringify(user.name)
          );

          localStorage.setItem(
            "notificationCount",
            JSON.stringify(user.notificationCount)
          );
          if (parseInt(localStorage.getItem("notificationCount")) > 0) {
            $(".badge").text(localStorage.getItem("notificationCount"));
          }
          this.userRights = JSON.stringify(user.permissionDetails);
          localStorage.setItem("userRights", this.userRights);
          this.appComponent.setUser(user);
          this.setConnection();
          const menu = user.menu;
          this.loading = false;
          localStorage.setItem("isCustomerLoggedIn", `${true}`);
          this.toastr.success("Sign up successfully.");
          this.signUpForm.reset();
          this.router.navigate(["/customer-dashboard"]);
        }, error => {
          console.log("customer get info error", error);
          this.loading = false;
          this.toastr.error(error?.error?.exceptionMessage || error);
        })
      }, error => {
        this.loading = false;
        console.log("customer login error", error);
        this.toastr.error(error?.error?.error_description || error);
      })
    }
  }

  /**
  * This method set connection for notification
  * @method setConnection
  */
  setConnection() {
    this.appComponent.groupHub.connection
      .start()
      .done(() => {
        this.appComponent.groupHub
          .invoke(
            "subscribe",
            localStorage.getItem("userLoggedInId").toString()
          )
          .done(() => {
            this.appComponent.groupHub.subscribed = true;
          })
          .fail((e: any) => { });
      })
      .fail((e: any) => { });
  }

  openUrlInNewTab(url) {
    window.open(url, '_blank')
  }

}
