import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { JobCheckListServices } from '../checklist/checklist.service';
interface External {
  id: number,
  idJob: number,
  idJobApplicationType: number,
  idJobWorkType: number,
  applicationNumber: any,
  
}
@Component({
  selector: '[add-external-checklist]',
  templateUrl: './add-external-checklist.component.html',
  styleUrls: ['./add-external-checklist.component.css']
})
export class AddExternalChecklistComponent implements OnInit {
  @Input() modalRef: BsModalRef
  @Input() idJob: number
  @Input() idChecklistForApplication: number
  @Output() externalApplicationAdded: EventEmitter<any> = new EventEmitter<any>();
  externalApplicationData: any
  applicationTypes: any;
  workpermitTypes: any;
  loading: boolean = false
  id: any;
  constructor( private jobCheckListServices: JobCheckListServices,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.externalApplicationData = {} as External
    this.getJobApplicationTypes();
   
  }


  getJobApplicationTypes(){
   this.jobCheckListServices.getApplicationsForExrnalApplication(1).subscribe(r=>{
    this.applicationTypes = r
  console.log(r)
   })
  }
  selectApplication(e){
    if(e){
      this.getJobApplicationWorkTypes(e.id);
    }else{
      this.workpermitTypes = [];
    }
   
  }
  getJobApplicationWorkTypes(id){
    this.jobCheckListServices.getWorkPermitForExrnalApplication(id).subscribe(r=>{
     this.workpermitTypes = r;
       })
  }

  saveExternalApplication(){
    this.loading = true
    this.externalApplicationData.idJob = this.idJob;
    this.externalApplicationData.idJobWorkType = this.externalApplicationData.idJobWorkType.toString()
    console.log(this.externalApplicationData)
    this.jobCheckListServices.createExternalApplication(this.externalApplicationData, this.idChecklistForApplication).subscribe(r=>{
      this.toastr.success('Record created successfully')
      this.externalApplicationAdded.next(true);
      this.modalRef.hide();
      this.loading = false
    },e=>{
      this.loading = false
    })
  }

}
