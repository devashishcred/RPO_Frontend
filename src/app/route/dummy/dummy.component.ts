import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { API_URL } from '../../app.constants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'dummy',
  templateUrl: './dummy.component.html',
  styleUrls: ['./dummy.component.css']
})
export class DummyComponent implements OnInit {

  private apiUrl = API_URL;
  loading: boolean = false;
  binNumber: string = "";

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
  }

  updateBin() {
    if (!this.binNumber) {
      this.toastr.error("Please enter value in the field!")
      return
    }
    this.loading = true;
    this.apiUrl = API_URL + 'api/CronJobs/GetViolationCronJob/' + this.binNumber;
    this.http.get(this.apiUrl).subscribe(res => {
      console.log(res)
      this.loading = false;
      this.binNumber = "";
      this.toastr.success("Run Successfully!")
    }, error => {
      this.toastr.error(error)
      this.loading = false;
      console.log(error)
    })
  }

  send(type: string) {
    this.loading = true;
    this.apiUrl = API_URL
    if (type == 'ECB') {
      this.apiUrl = this.apiUrl + 'api/CronJobs/GetECBCronJob/' + this.binNumber;
    } else if (type == 'DOB') {
      this.apiUrl = this.apiUrl + 'api/CronJobs/GetDOBCronJob/' + this.binNumber;
    } else if (type == 'DOB Safety') {
      this.apiUrl = this.apiUrl + 'api/CronJobs/GetDOBSafetyCronJob/' + this.binNumber;
    }
    this.http.get(this.apiUrl).subscribe(res => {
      console.log(res)
      this.loading = false;
      this.binNumber = "";
      this.toastr.success("Run Successfully!")
    }, error => {
      this.toastr.error(error)
      this.loading = false;
      console.log(error)
    })
  }

}
