import { ToastrService } from 'ngx-toastr';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, Input, OnInit, } from '@angular/core';
import * as _ from 'underscore';
import { JobServices } from '../job/job.services';

/**
* This component contains all function that are used in ViewTaskComponent
* @class ViewTaskComponent
*/
@Component({
  selector: '[view-dob]',
  templateUrl: './dobView.component.html',
  styleUrls: ['./dobView.component.scss']
})
export class DobViewComponent implements OnInit {
  @Input() jobId: any
  @Input() modalRef: BsModalRef

  loading: boolean = false
  PropertyDetails:any ;
  /**
    * This method define all services that requires in whole class
    * @method constructor
  */
  constructor(
    private jobServices: JobServices,
    private toster: ToastrService
  ) { }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {
    this.loading = true
   if(this.jobId){
     this.jobServices.getDOBNOWJobDetail(this.jobId).subscribe(r => {
      console.log(r)
      this.PropertyDetails = r;
      this.loading = false
    },
    err =>{
      this.loading = false
      this.toster.error('Something went wrong! Please try again');
      this.modalRef.hide()
    });
   }
  }

 

  /**
   * This method is used to close popup
   * @method closePopup
   */
  private closePopup() {
    this.modalRef.hide()
  }

 
}