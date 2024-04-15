import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { AppComponent } from "../../app.component";
import { UserServices } from "../../services/user.services";
import { Login } from "../../types/login";
import { LoginServices } from "./login.services";
import { ToastrService } from "ngx-toastr";
import { CustomerService } from "../customer/customer.service";
declare const $: any;

/**
 * This component contains all function that are used in LoginComponent
 * @class LoginComponent
 */
@Component({
  selector: "rpo-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  model: Login = {
    username: null,
    password: null,
  };

  loading = false;
  public userRights: any;
  private allPermision: any = [];
  returnUrl: string;
  isCustomer: boolean = false;
  showPassword:boolean = false;

  /**
   * This method define all services that requires in whole class
   * @method constructor
   */
  constructor(
    private appComponent: AppComponent,
    private loginServices: LoginServices,
    private userServices: UserServices,
    private customerServices: CustomerService,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService
  ) {
    if (localStorage.getItem("auth")) this.router.navigate(["home"]);
  }

  ngOnInit() {
    document.title = 'Login'
    const urlSegment = this.route.snapshot.url.join('/');
    if (urlSegment === 'customer-login') {
      this.isCustomer = true;
    } else {
      this.isCustomer = false;
    }
  }

  /**
   * This method login to the System
   * @method login
   */

  login() {
    if (this.isCustomer) {
      this.customerLogin()
    } else {
      this.loginRpo()
    }
  }

  loginRpo() {
    this.loading = true;
    if (this.model.username && this.model.password) {
      this.loginServices.login(this.model, this.isCustomer).subscribe(
        (token) => {
          localStorage.setItem("auth", JSON.stringify(token));

          this.userServices.userinfo().subscribe((user: any) => {
            console.log("users", user);
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

            localStorage.setItem("isCustomerLoggedIn", `${false}`);

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
            // if (menu.length) {
            //     if (menu[0].routerLink)
            //         return this.router.navigateByUrl(menu[0].routerLink)
            //     else if (menu[0].items.length)
            //         return this.router.navigateByUrl(menu[0].items[0].routerLink)
            // }
            this.loading = false;
            return this.router.navigate(["home"]);
          });
        },
        (err) => {
          console.log("login error", err);
          this.loading = false;
        }
      );
    }
  }

  customerLogin() {
    if (this.model.username && this.model.password) {
      this.loading = true;
      this.loginServices.login(this.model, this.isCustomer).subscribe(token => {
        console.log('user login response', token)
        localStorage.setItem("auth", JSON.stringify(token));
        this.customerServices.customerInfo().subscribe((user: any) => {
          console.log('customer info',user)
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
          this.router.navigate(["/customer-dashboard"]);
        }, error => {
          console.log("customer get info error", error);
          this.loading = false;
          this.toastrService.error(error?.error?.exceptionMessage || error);
        })
      }, error => {
        this.loading = false;
        console.log("customer login error", error);
        this.toastrService.error(error?.error?.error_description || error);
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

  toggleShowPassword() {
    this.showPassword = !this.showPassword
  }
}
