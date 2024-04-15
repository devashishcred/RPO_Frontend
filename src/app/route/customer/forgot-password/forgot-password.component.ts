import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Message } from "../../../app.messages";
import { CustomerService } from "../customer.service";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";

@Component({
  selector: "forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  isForgotPwdSubmitted: boolean = false;
  isShowSuccessDetail: boolean = false;
  errorMessage: {};
  loader: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private translateServcie: Message,
    private customerService: CustomerService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.errorMessage = this.translateServcie.msg;
  }

  ngOnInit(): void {
    this.setForgotPasswordForm();
  }

  setForgotPasswordForm(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: [
        "",
        [
          Validators.required,
          Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"),
        ],
      ],
    });
  }

  get forgotPwdForm() {
    return this.forgotPasswordForm.controls;
  }

  forgorPwdClickEvent(): void {
    this.loader = true;
    this.isForgotPwdSubmitted = true;
    if (this.forgotPasswordForm.invalid) {
      this.loader = false;
      return;
    }
    this.customerService
      .saveForgotPasswordDetail({email:this.forgotPasswordForm.value.email})
      .subscribe(
        (res) => {
          this.isForgotPwdSubmitted = false;
          this.forgotPasswordForm.reset();
          this.isShowSuccessDetail = true;
          this.toastr.success(res);
          this.loader = false;
          this.router.navigateByUrl("/customer-login")
          // localStorage.clear();
        },
        (error) => {
          console.log(error)
          this.loader = false;
          this.toastr.error(error);
        }
      );
  }

  emailValidator(control) {
    if (control.value) {
      const matches = control.value.match();
      return matches ? null : { invalidEmail: true };
    } else {
      return null;
    }
  }
}
