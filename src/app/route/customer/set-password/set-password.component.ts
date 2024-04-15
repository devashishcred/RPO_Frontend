import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CustomerService } from "../customer.service";
import { Message } from "../../../app.messages";
import { ToastrService } from "ngx-toastr";
import { IResetPassword } from "../../../types/customer";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "set-password",
  templateUrl: "./set-password.component.html",
  styleUrls: ["./set-password.component.scss"],
})
export class SetPasswordComponent implements OnInit {
  setPasswordForm: FormGroup;
  isSetPassword: boolean = false;
  errorMessage: {};
  loading: boolean = false;
  emailId:any;

  constructor(
    private formBuilder: FormBuilder,
    private translateServcie: Message,
    private customerService: CustomerService,
    private toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.errorMessage = this.translateServcie.msg;
  }

  ngOnInit(): void {
    this.setResetPasswordForm();
    this.activatedRoute.queryParams.subscribe((params) => {
      console.log('params',params)
      if(params['email']) {
        this.emailId = params['email'];
      }
    });
  }

  setResetPasswordForm() {
    this.setPasswordForm = this.formBuilder.group(
      {
        newPassword: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
        confirmPassword: ["", [Validators.required]],
        // termsAgree: ["", [Validators.requiredTrue]],
      },
      {
        validator: this.confirmPasswordValidator(
          "newPassword",
          "confirmPassword"
        ),
      }
    );
  }

  confirmPasswordValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      let control = formGroup.controls[controlName];
      let matchingControl = formGroup.controls[matchingControlName];
      if (
        matchingControl.errors &&
        !matchingControl.errors.confirmPasswordValidator
      ) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmPasswordValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  setPasswordClickEvent(): void {
    this.loading = true;
    this.isSetPassword = true;
    if (this.setPasswordForm.invalid) {
      this.loading = false;
      return;
    }
    const data: IResetPassword = {
      id: 0,
      // id: +this.idContact,
      // strId: "teena@credencys.com",
      strId: this.emailId,
      oldPassword: null,
      newPassword: this.setPasswordForm.value.newPassword,
      // termsAgree: this.setPasswordForm.value.termsAgree.value,
    };
    this.customerService.saveResetPasswordDetail(data).subscribe(
      (res) => {
        this.loading = false;
        if (res) {
          console.log(res)
          this.toastr.success("New password set successfully.");
          this.isSetPassword = false;
          this.setPasswordForm.reset();
          this.router.navigate(["/customer-login"]);
        }
      },
      (error) => {
        console.log(error)
        this.loading = false;
        this.toastr.error(error?.message || error);
      }
    );
  }

  get setPasswordFormControls() {
    console.log(this.setPasswordForm.controls)
    return this.setPasswordForm.controls;
  }
}
