import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CustomerPermissionService } from '../customer-permission.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: '[notification-settings]',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit {

  @Input() modalRef: BsModalRef;
  @Input() customerId: any;
  formData: FormGroup
  loading: boolean = false;
  notificationData: any;

  constructor(
    public customerPermissionService: CustomerPermissionService,
    public fb: FormBuilder,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.initializeForm()
    this.getNotificationSettings()
  }

  initializeForm() {
    this.formData = this.fb.group({
      'projectAccessEmail': [false],
      'projectAccessInApp': [false],
      'violationEmail': [false],
      'violationInapp': [false],
    })
  }

  async getNotificationSettings() {
    this.loading = true;
    try {
      const res = await this.customerPermissionService.getNotificationSettings(this.customerId)
      console.log('res', res)
      if (res == false) {
        this.notificationData = ""
      } else {
        this.notificationData = res
        this.formData.patchValue(res)
      }
      this.loading = false;
    } catch (err) {
      this.toastr.error(err);
      this.loading = false;
    }
  }

  close() {
    this.modalRef.hide()
  }

  async onSubmit() {
    console.log(this.formData.value)
    try {
      if (this.notificationData) {
        this.loading = true;
        let data = { id: this.notificationData.id, idCustomer: this.customerId, ...this.formData.value }
        const res = await this.customerPermissionService.updateNotificationSettings( this.customerId, data)
        this.toastr.success("Notification settings updated")
        this.loading = false;
        this.close()
      } else {
        this.loading = true;
        let data = { id: 0, idCustomer: this.customerId, ...this.formData.value }
        const res = await this.customerPermissionService.addNotificationSettings(data)
        this.toastr.success("Notification settings updated")
        this.loading = false;
        this.close()
      }
    } catch (err) {
      this.loading = false;
      console.log(err)
      this.toastr.error(err)
    }
  }

}
