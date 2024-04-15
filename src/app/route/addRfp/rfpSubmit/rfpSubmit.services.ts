import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';
import { API_URL } from '../../../app.constants'
import { ActivatedRoute } from '@angular/router';
import { rfp } from '../../../types/rfp';



declare var $: any;

@Injectable()
export class RfpSubmitServices {
  constructor(private http: HttpClient) {

  }

  private Url = API_URL + 'api/Rfps';
  private headers = new HttpHeaders().set('Content-Type', 'application/json');


  // private Url = "http://rpoback.azurewebsites.net/PDF/RFP-Pdf_1.pdf"
  downloadPdf(idRfp: number): Observable<any> {
    //  const d = cloneDeep(data)
    return this.http.get<any>(this.Url + "/" + idRfp + "/Download")
    //return this.http.get<any>(this.Url)
  }

  changeRfpStatus(data: rfp, idRfp: number, idRfpStatus: number): Observable<rfp> {
    return this.http.put<rfp>(this.Url + "/" + idRfp + "/status/" + idRfpStatus, { headers: this.headers }); 
  }

  sendmailRFP(data: any, idRfp: number): Observable<rfp> {
    const d = cloneDeep(data)
    return this.http.post<rfp>(this.Url + "/" + idRfp + "/email", d)
  }
  saveExtraRfpAttachment(data: any): Observable<any> {
    return this.http.post<any>(this.Url + "/Attachment", data)
  }
  getMailTypesData(): Observable<any> {
    return this.http.get<any>(API_URL + 'api/TransmissionTypes');
  }

  getMailTypesDD(module:string): Observable<any> {
    let urlstring = ""
    if(module == "RFP"){
      urlstring = (urlstring == "") ?  'isRfp=true' :  '&isRfp=true'
    }
    if(module == "Job"){
      urlstring = (urlstring == "") ?  'isJob=true' :  '&isJob=true'
    }
    if(module == "Company"){
      urlstring = (urlstring == "") ?  'isCompany=true' :  '&isCompany=true'
    }
    if(module == "Contacts"){
      urlstring = (urlstring == "") ?  'isContact=true' :  '&isContact=true'
    }
    return this.http.get<any>(API_URL + 'api/emailtypes/dropdown?' + urlstring);
  }

  getMailViaDataService(): Observable<any> {
    return this.http.get<any>(API_URL + 'api/EmailTypes');
  }

  getMailViaDD(): Observable<any> {
    return this.http.get<any>(API_URL + 'api/transmissionTypes/dropdown');
  }

  getStatus(): Observable<any> {
    return this.http.get<any>(API_URL + 'api/RfpStatus');
  }

  getByEmailType(emailTypeId?: any): Observable<any> {
    return this.http.get<any>(API_URL + 'api/EmailTypes/' + emailTypeId);
  }

  getTobeLinkJobslist(){
    return this.http.get<any>(this.Url + '/tobelinkjoblist');
  }

  linkRfpWithJob(data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.put<any>(this.Url + "/linkjob", d); 
  }


  DilinkRfpWithJob(data: any): Observable<void> {
    const d = cloneDeep(data)
    return this.http.put<void>(this.Url + "/Unlinkjob", d); 
  }

  
}