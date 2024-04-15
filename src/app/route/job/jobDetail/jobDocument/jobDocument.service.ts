import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable ,  Observer } from 'rxjs';
import { API_URL } from '../../../../app.constants';
import { Job } from '../../../../types/job';
import { PW517Doc } from './pullpermit';
declare var $: any;

@Injectable()
export class JobDocumentServices {
    private dobPermitUrl = API_URL + 'api/jobdocument/GetDOBApplocationPermitDataFromBIS';
    private LocUrl = API_URL + 'api/jobdocument/LOCURL';
    private cocUrl = API_URL + 'api/jobdocument/PermitListFromBISForCOO';
    
    private updatePermitDates = API_URL + 'api/jobdocument/PutPermitDates';
    private savedobPermitDetailsUrl = API_URL + '/api/jobdocument/SaveDOBApplocationPermit';
    private jobDocumentsUrl = API_URL + 'api/document';
    private jobDocumentsFields = API_URL + 'api/DocumentFieldDetails' + '/' + '?DocumentId=';
    private jobDocumentsFieldsToSent = API_URL + 'api/JobDocument'         //http://192.168.1.73:8085/api/JobDocument?doc=1
    private newClone = API_URL + 'api/JobDocument/Clone/'         //http://192.168.1.73:8085/api/JobDocument?doc=1

    constructor(private http: HttpClient) {

    }
    private documentlistUrl = API_URL + '/api/JobDocument';
    private tabledocumentlistUrl = API_URL + '/api/JobDocumentsListTransmittal';
    private addDocumentUrl = API_URL + 'api/JobDocument/fileAttachment'
    private uploadDocumentUrl = API_URL + 'api/JobDocument/updateJobDocument'

    

    get(cfg: any = {}): any[] {
        return $.fn.dataTable.pipeline($.extend(true, {
            url: this.documentlistUrl
        }, cfg));
    }
    getDocs(cfg: any = {}): any[] {
        return $.fn.dataTable.pipeline($.extend(true, {
            url: this.tabledocumentlistUrl
        }, cfg));
    }
    getDocumentsList(): Observable<any> {
        return this.http.get<any>(this.jobDocumentsUrl + "/dropdown")
    }
    getChecklistDocId(id:any): Observable<any> {
        return this.http.get<any>(API_URL+ "api/Checklist/GetcreateformDocument/" + id)
    }
    getChecklistDocIdForUpload(id:any): Observable<any> {
        return this.http.get<any>(API_URL+ "api/Checklist/UploadDocumentChecklistItem/" + id)
    }
    getChecklistDocIdForUploadForPl(id:any): Observable<any> {
        return this.http.get<any>(API_URL+ "api/Checklist/UploadDocumentPlumbingInspections/" + id)
    }
    getTheFieldsOfDocument(id: number): Observable<any> {
        return this.http.get<any>(this.jobDocumentsFields + id)
    }
    getDropdownValues(url: string) {
        return this.http.get<any>(API_URL + url)
    }
    createJobDocument(data: any) {
        const d = cloneDeep(data)
        return this.http.post<any>(this.jobDocumentsFieldsToSent, d)
    }
    getDocumentById(id: number) {
        return this.http.get<any>(this.documentlistUrl + '/' + id)
    }
    cloneJobDOC(id: number) {
        return this.http.get<any>(this.newClone +  + id)
    }
    deleteDocument(id: number, type: boolean, data: any): Observable<any> {
        const d = cloneDeep(data)
        if (type) {
            return this.http.delete<any>(this.documentlistUrl + "/" + id)
        } else {
            return this.http.put<any>(this.documentlistUrl + "/" + id, d)
        }

    }
    addDocument(data: any) {
        return this.http.post<any>(this.addDocumentUrl, data)
    }
    uploadDocument(data: any) {
        return this.http.post<any>(this.uploadDocumentUrl, data)

    }

    getJobDocumentsList(idJob: number): Observable<any> {
        return this.http.get<any>(this.documentlistUrl + "?jobDocumentDataTableParameters.idJob=" + idJob)
    }

    getJobDocumentsDDList(idJob: number): Observable<any> {
        return this.http.get<any>(API_URL + "api/jobdocuments/dropdown/" + idJob)
    }

    pullpermit(data: any): Observable<any> {
        return this.http.post<any>(this.documentlistUrl + "/PermitListFromBIS/", data)
    }

    pullPermitVARPMT(idApplicationNumber: number, ahvReferenceNumber: string): Observable<any> {
        let url = this.documentlistUrl + "/VARPMTPermitListFromBIS/" + idApplicationNumber
        if(ahvReferenceNumber || ahvReferenceNumber == null || ahvReferenceNumber == "" ){
            
            if(ahvReferenceNumber == ""){
                url += '/' + null
            } else{
                url += '/' + ahvReferenceNumber    
            }
            
        }
        return this.http.get<any>(url)
    }

    sendVARPMTSelectedPermit(data: any) {
        return this.http.post<any>(this.documentlistUrl + "/PullPermitVARPMT", data)
    }

    sendtoUpdateData(data: any) {
        return this.http.post<any>(this.documentlistUrl + "/PermitDates/", data)
    }
    sendSelectedPermit(data: any) {
        return this.http.post<any>(this.documentlistUrl + "/PullPermit", data)
    }
    sendDOBSelectedPermit(data: any) {
        return this.http.post<any>(this.dobPermitUrl, data)
    }
    savedobPermitDetails(data: any) {
        return this.http.post<any>(this.savedobPermitDetailsUrl, data)
    }
    savedates(data: any) {
        return this.http.put<any>(this.updatePermitDates, data)
    }

    regeneratePDF(id: number) {
        return this.http.put<any>(this.documentlistUrl + "/regenerate/" + id, {})
    }
    openDocumentinDropBox(id:number){
        return this.http.get<any>(API_URL + "api/Jobs/getdropbox/" + id,{})
    }

    locPullpermit(data: any) {
        return this.http.post<any>(this.documentlistUrl + "/LocUrl/", data)
    }
    cooPullpermit(data: any) {
        return this.http.post<any>(this.cocUrl, data)
    }

    addPage(id: number) {
        return this.http.get<any>(this.documentlistUrl + "/AddPage/" + id)
    }

    getApplicationDDForPW517(idJob: number, idDocumentMaster: number, idDocument: number) {
        return this.http.get<any>(API_URL + 'api/jobdocumentdrodown/JobApplicationNumberTypePW517/' + idJob + '/' + idDocumentMaster + '/' + idDocument)
    }

    getVarianceDDForPW517(idJob: number, idDocumentMaster: number, idDocument: number) {
        return this.http.get<any>(API_URL + 'api/jobdocumentdrodown/VarianceReason/' + idJob + '/' + idDocumentMaster + '/' + idDocument)
    }

    getApplicantDDForPW517(idJob: number, idDocumentMaster: number, idDocument: number) {
        return this.http.get<any>(API_URL + 'api/jobdocumentdrodown/JobContacts/' + idJob + '/' + idDocumentMaster + '/' + idDocument)
    }

    getFillingTypeDDForPW517(idJob: number, idDocumentMaster: number, idDocument: number) {
        return this.http.get<any>(API_URL + 'api/jobdocumentdrodown/JobDocumentType/' + idJob + '/' + idDocumentMaster + '/' + idDocument)
    }
    getForDescForPW517(idJob: number, idDocumentMaster: number, idApplication: number) {
        return this.http.get<any>(API_URL + 'api/jobdocumentdrodown/JobApplicationFor/' + idJob + '/' + idDocumentMaster + '/' + idApplication)
    }
    savePW517Document(pwDoc: PW517Doc) {
        return this.http.post<any>(this.documentlistUrl + "/SavePW517", pwDoc)
    }
    getPW517DocumentById(idDocument: number) {
        return this.http.get<any>(this.documentlistUrl + "/PW517/" + idDocument)
    }
    getWorkPermitsForPW517(idJob: number, idDocumentMaster: number, idApplication: number) {
        return this.http.get<any>(API_URL + 'api/jobdocumentdrodown/JobWorkPermit/' + idJob + '/' + idDocumentMaster + '/' + idApplication)
    }
}