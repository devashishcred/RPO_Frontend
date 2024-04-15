import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { StateServices } from "../../../services/state.services";
import { State } from "../../../types/state";
import * as _ from "lodash";
import { Message } from "../../../app.messages";
import { CustomerService } from "../customer.service";
import { IChangePassword, ICustomer } from "../../../types/customer";
import { ToastrService } from "ngx-toastr";
import { arrayBufferToBase64 } from "../../../utils/utils";
import { Router } from "@angular/router";
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MessageSentSuccessModalComponent } from "../message-sent-success-modal/message-sent-success-modal.component";
import { LocalStorageService } from "../../../services/local-storage.service";
import { UserRightServices } from "../../../services/userRight.services";
import { constantValues } from "../../../app.constantValues";
import { AppComponent } from "../../../app.component";
import { CompanyItem } from "../../../types/company";
import { CompanyServices } from "../../company/company.services";

@Component({
  selector: "myaccount",
  templateUrl: "./myaccount.component.html",
  styleUrls: ["./myaccount.component.scss"],
})
export class MyaccountComponent implements OnInit {
  profileForm: FormGroup;
  changePasswordForm: FormGroup;

  isActive: string = "myProfile";
  isProfileSubmitted: boolean = false;
  isChangePasswordSubmitted: boolean = false;
  isCustomerSupportSubmitted: boolean = false;
  recievedNotification: boolean = false;

  stateList: State[] = [];
  errorMessage: {};
  customerSupportModal = {};

  url = null;
  isChangePwdSuccessfully = false;
  customerDetails: any;

  private modalRef: BsModalRef;
  loading: boolean = false;

  blankAvatar: string = "./assets/photo-upload.png";
  private profileImage: any
  myAccountData: any;
  updatedProfileImage: string;
  checkNotification: boolean = false;
  isCustomerLoggedIn: boolean = false;
  isAllowMyAccount: boolean = false;
  public companies: CompanyItem[] = []

  @ViewChild('message') message;

  constructor(
    private formBuilder: FormBuilder,
    private stateServices: StateServices,
    private translateServcie: Message,
    private customerService: CustomerService,
    private toastr: ToastrService,
    private router: Router,
    private modalService: BsModalService,
    private localStorageService: LocalStorageService,
    private userRight: UserRightServices,
    private constantValues: constantValues,
    private appComponent: AppComponent,
    private companyServices: CompanyServices
  ) {
    this.errorMessage = this.translateServcie.msg;
  }

  ngOnInit(): void {
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
    this.isAllowMyAccount = this.userRight.checkAllowButton(this.constantValues.VIEWCONTACT) == 'show' ? true : false;

    console.log('cus permis', this.isCustomerLoggedIn)
    if (this.isCustomerLoggedIn) {
      this.getCustomerDetails();
      this.getStateList();
      this.setProfileForm();
      this.setChangePasswordForm();
      this.getMyAccountDetails()
      this.getNotificationSetting()
      this.getCompanies()
    }

  }

  getCompanies() {
    this.companyServices.getCompanyDropdown().subscribe(r => {
      this.companies = _.sortBy(r, "itemName")
    });
  }

  getCustomerDetails() {
    this.customerDetails = this.localStorageService.getCustomerDetails()
    console.log('this.customerDetails', this.customerDetails)
  }

  getMyAccountDetails() {
    this.customerService.getMyAccountDetails(this.customerDetails.employeeId).subscribe(res => {
      console.log('getMyAccountDetails', res)
      this.myAccountData = res
      this.myAccountData['contactImageThumbPath'] = res['contactImageThumbPath'] || this.blankAvatar
      this.profileForm.patchValue(res)
      this.formatPhone()
    })
  }

  setProfileForm(): void {
    this.profileForm = this.formBuilder.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      companyName: [""],
      address1: ["", Validators.required],
      // street: ["", Validators.required],
      address2: [""],
      // floor: [""],
      city: ["", Validators.required],
      idState: ["", Validators.required],
      zipCode: ["", Validators.required],
      workPhone: ["", [Validators.minLength(14), Validators.maxLength(14)]],
      mobilePhone: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      id: [""]
    });
  }

  get workPhone() {
    return this.profileForm.get("workPhone") as FormGroup;
  }
  get mobilePhone() {
    return this.profileForm.get("mobilePhone") as FormGroup;
  }


  setChangePasswordForm(): void {
    this.changePasswordForm = this.formBuilder.group(
      {
        oldPwd: ["", Validators.required],
        newPwd: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
        confirmNewPwd: ["", [Validators.required]],
      },
      {
        validator: this.confirmPasswordValidator("newPwd", "confirmNewPwd"),
      }
    );
  }

  async profileBtnClick() {
    this.isProfileSubmitted = true;
    if (this.profileForm.invalid) {
      return;
    }
    this.loading = true;
    const profileData: ICustomer = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      companyName: this.profileForm.value.companyName,
      address1: this.profileForm.value.address1,
      address2: this.profileForm.value.address2,
      // street: this.profileForm.value.street,
      // floor: this.profileForm.value.floor,
      city: this.profileForm.value.city,
      idState: this.profileForm.value.idState,
      zipCode: this.profileForm.value.zipCode,
      workPhone: this.profileForm.value.workPhone,
      mobilePhone: this.profileForm.value.mobilePhone,
      email: this.profileForm.value.email,
      id: this.profileForm.value.id,
      // contactImagePath: this.myAccountData.contactImagePath || "",
      // contactImageThumbPath: "",
    };
    console.log(this.myAccountData)
    console.log(profileData)
    console.log(this.profileImage)
    if (!this.profileFormControl.idState.value) {
      this.toastr.warning("Please check all mandate fields")
      this.loading = false;
      return
    }
    if (!this.isAllowMyAccount) {
      this.toastr.warning("You don't have permission for update")
      this.loading = false;
      return
    }
    this.customerService.saveProfileDetail(profileData).subscribe(
      async (res: any) => {
        console.log('saveProfileDetail res', res)
        if (res) {
          if (this.profileImage) {
            const contactImagePath = await this.uploadProfileImage(res.idContact)
            console.log(contactImagePath)
          }
          this.isProfileSubmitted = false;
          console.log(res);
          this.getMyAccountDetails()
          this.toastr.success("Profile detail updated successfully.");
        }
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        this.toastr.error(error.message);
      }
    );
  }

  onConfirmPassword(): void {
    this.isChangePwdSuccessfully = false;
    this.isChangePasswordSubmitted = true;
    if (this.changePasswordForm.invalid) {
      return;
    }
    if (this.changePasswordForm.value.oldPwd == this.changePasswordForm.value.newPwd) {
      this.toastr.warning("The new password must not be the same as the old password.");
      return;
    }
    this.loading = true;

    const changePasswordObject: IChangePassword = {
      id: this.customerDetails.employeeId,
      oldPassword: this.changePasswordForm.value.oldPwd,
      newPassword: this.changePasswordForm.value.newPwd,
    };

    this.customerService
      .saveChangePasswordDetail(changePasswordObject)
      .subscribe(
        (res: any) => {
          this.loading = false;
          if (res == "Wrong Old Password") {
            this.toastr.error("Wrong Old Password.");
          } else {
            this.isChangePasswordSubmitted = false;
            this.changePasswordForm.reset();
            console.log('saveChangePasswordDetail', res);
            // this.toastr.success("Change password updated successfully.");
            this.logout()
          }
        },
        (error) => {
          console.log(error)
          this.loading = false;
          this.toastr.error(error?.error?.exceptionMessage || error);
        }
      );
  }

  onLogin() {
    this.router.navigate(['/login']);
    localStorage.clear();
  }

  getStateList(): void {
    this.stateList = [];
    this.stateServices.getDropdown().subscribe((r) => {
      this.stateList = _.sortBy(r, "name");
    });
  }

  get profileFormControl() {
    return this.profileForm.controls;
  }

  get changePasswordFormControl() {
    return this.changePasswordForm.controls;
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

  notificationChangeEvent(event: boolean): void {
    this.recievedNotification = event;
    this.saveAllRecievedNotificationDetail(this.recievedNotification);
  }

  async saveAllRecievedNotificationDetail(value: boolean) {
    try {
      this.loading = true;
      if (value) {
        await this.customerService.setNotification(value);
        this.toastr.success("Receive all notifications is enabled");
        this.getNotificationSetting()
      } else {
        await this.customerService.setNotification(value);
        this.toastr.success("Receive all notifications is disabled");
        this.getNotificationSetting()
      }
      this.loading = false;
    } catch (err) {
      this.loading = false;
      this.toastr.error(err)
    }
  }

  async getNotificationSetting() {
    this.loading = true;
    try {
      const res: any = await this.customerService.getNotification()
      console.log('notification res', res)
      this.checkNotification = (res == "True") ? true : false
      this.recievedNotification = (res == "True") ? true : false
      this.loading = false;
    } catch (err) {
      this.loading = false;
      this.toastr.error(err)
    }
  }

  customerSupportClick(): void {
    this.loading = true;
    this.isCustomerSupportSubmitted = true;
    if (this.customerSupportModal["message"]) {
      let data: any = {
        message: this.customerSupportModal["message"]
      }
      this.customerService
        .saveCustomerSupportDetail(data)
        .subscribe(
          (res) => {
            this.loading = false;
            if (res) {
              console.log(res);
              this.isCustomerSupportSubmitted = false;
              this.customerSupportModal["message"] = "";
              this.toastr.success(
                "Customer support message sent successfully."
              );
              this.modalRef = this.modalService.show(MessageSentSuccessModalComponent, {
                class: "modal-md",
              });
            }
          },
          (error) => {
            console.log(error)
            this.loading = false;
            this.toastr.error(error?.error?.exceptionMessage || error);
          }
        );
    }
  }

  resetTabChangeForm() {
    this.profileForm.reset();
    this.changePasswordForm.reset();

    this.isProfileSubmitted = false;
    this.isChangePasswordSubmitted = false;
    this.isCustomerSupportSubmitted = false;
    this.recievedNotification = true;
    this.customerSupportModal = {};

    this.url = "";
    this.isChangePwdSuccessfully = false;
  }

  // onSelectFile(event) {
  //   if (event.target.files && event.target.files[0]) {
  //     var reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       this.url = e.target.result as string;
  //       const binarystring = this.base64ToBinary(this.url);
  //       console.log(binarystring);
  //     };
  //     reader.readAsDataURL(event.target.files[0]);

  //     reader.onerror = (error: any) => {
  //       this.toastr.error(error, "Error");
  //     };
  //   }
  // }
  /**
  * This method is used for selecting file and handling images
  * @method handleFileSelect
  * @param {any} evt evt is an image object which contains image properties
  */
  handleFileSelect(evt: any) {
    console.log(evt)
    var files = evt.target.files;
    var file = files[0];
    console.log(file)
    if (file) {
      this.profileImage = file;
      this.readUrl(evt.target, this.myAccountData);
      this.base64(evt.target.files[0], this.myAccountData, 'image');
    } else {
      this.profileImage = null
      this.myAccountData.imageAux = this.blankAvatar
    }
  }
  /**
 * This method is used to read files from given URL
 * @method readUrl
 * @param {any} input type any which contains string that can be filtered from datatable
 * @param {Contact} rec rec is used as contact object
 */
  private readUrl(input: any, rec: any) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e: any) {
        rec.contactImageThumbPath = e.target.result;
      }

      reader.readAsDataURL(input.files[0]);
    }
  }
  /**
 * This method is used to convert image into base64 encode format
 * @method base64
 * @param {any} file file is an object of files which contains files various properties
 * @param {any} rec rec is an object of reader
 * @param {string} prop prop is used as string 
 */
  private base64(file: any, rec: any, prop: string) {
    let reader = new FileReader()

    reader.onload = () => {
      rec[prop] = arrayBufferToBase64(reader.result)
    }
    reader.onerror = (error: any) => {
      this.toastr.error(error, 'Error')
    }
  }

  private base64ToBinary(base64String: string): string {
    const binaryString = btoa(base64String);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    return String.fromCharCode.apply(null, uint8Array);
  }

  uploadProfileImage(id: number): Promise<{}> {
    return new Promise((resolve, reject) => {
      if (this.profileImage) {
        let formData = new FormData();
        formData.append('idContact', id.toString())
        formData.append('image', this.profileImage)
        this.customerService.saveCustomerImage(formData).subscribe(r => {
          console.log(r)
          resolve(r.contactImagePath)
        }, e => {
          this.loading = false
          console.log(e)
          reject()
        })
      }
    })
  }

  onTabChange(tab) {
    this.isActive = tab
    if (this.isActive == 'myProfile') {
      this.setProfileForm()
      setTimeout(() => {
        this.profileForm.patchValue(this.myAccountData)
      }, 1000);
    } else if (this.isActive == 'notificationSetting') {
      setTimeout(() => {
        this.recievedNotification = this.checkNotification
      }, 100);
    }
  }

  resetConfirmPassword() {
    this.changePasswordForm.reset()
    setTimeout(() => {
      this.setChangePasswordForm()
    }, 500);
  }

  logout() {
    localStorage.clear()
    this.router.navigate(['customer-login'])
    this.toastr.info('Your password is updated successfully! Please login with your new password', 'Info', { timeOut: 9500 })
  }

  isNumber(evt: any) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  formatPhone() {
    if (this.workPhone.value) {
      let workPhoneValue = this.appComponent.phoneFormat(this.workPhone.value)
      this.workPhone.patchValue(workPhoneValue)
    }
    if (this.mobilePhone.value) {
      let mobilePhoneValue = this.appComponent.phoneFormat(this.mobilePhone.value)
      this.mobilePhone.patchValue(mobilePhoneValue)
    }
  }

}
