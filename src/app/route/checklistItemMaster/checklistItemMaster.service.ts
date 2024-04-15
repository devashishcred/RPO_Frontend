import { Company } from "../../types/company";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { cloneDeep } from "lodash";
import { Observable } from "rxjs";

import { API_URL } from "../../app.constants";

declare const $: any;





/**
 * Class contains all services related to CheckListGroupServices
 * @class CheckListGroupServices
 */
@Injectable()
export class CheckListItemMaterServices {
  constructor(private http: HttpClient) { }

  private rfpCheckListItemUrl = API_URL + "api/ChecklistItems";


  /**
*  Get all records from database in datatable format
* @method getCheckListItem
* @param {string} cfg it is a string type which is used for filter data from data table
*/
  getCheckListItem(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.rfpCheckListItemUrl
    }, cfg))
  }


  /**
   *  Get all records from database in datatable format
   * @method getCheckListGroup
   * @param {string}  it is a string type which is used for filter data from data table
   */
  getCheckListGroupDropdown(): Observable<any> {
    return this.http.get<any>(API_URL + "api/CheckListGroup");
  }


  /**
/**
 *  Get all records from database in datatable format
 * @method getCheckListGroup
 * @param {string}  it is a string type which is used for filter data from data table
 */
  getCheckLisiItems(id): Observable<any> {
    return this.http.get<any>(API_URL + "api/CheckList/GetChecklistItemdropdownGroupTypewise/" + id);
  }

  getCheckListItemsByPermitType(jobChecklistGroupId,id): Observable<any> {
    return this.http.get<any>(API_URL + "api/CheckList/GetChecklistItemdropdownPrmitTypewise/" + jobChecklistGroupId + '/' + id);
  }

  getSpecialDistrictDropdown(): Observable<any> {
    return this.http.get<any>(API_URL + "api/Checklist/GetSpecialDistrictDropdown");
  }

  /**
   *  Get all records from database in datatable format
   * @method getCreateDocuments
   * @param {string}  it is a string type which is used for filter data from data table
   */
  getCreateDocuments(): Observable<any> {
    return this.http.get<any>(API_URL + "api/document/dropdown");
  }

  /**
   *  Get all records from database in datatable format
   * @method getUploadDocuments
   * @param {string}  it is a string type which is used for filter data from data table
   */
  getUploadDocuments(): Observable<any> {
    return this.http.get<any>(
      API_URL + "api/document/DocumentDropdownUploadForm"
    );
  }

  /**
   *  Get all dropdown data from
   * @method getApplicationTypeDropdown
   */
  getApplicationTypeDropdown(): Observable<any> {
    return this.http.get<any>(API_URL + "api/jobapplicationtypes/Alldropdown");
  }


  /**
   *  Get all dropdown data from
   * @method getApplicationTypeDropdown
   */
  getWorkpermitDropdownAll(): Observable<any> {
    return this.http.get<any>(API_URL + "api/Checklist/AllWorkpermitTypeDropdown");
  }

  /**
   *  Get all dropdown data from
   * @method getWorkpermitDropdown
   */
  getWorkpermitDropdown(payload): Observable<any> {
    return this.http.post<any>(
      API_URL + "api/Checklist/WorkpermitTypeDropdown",
      payload
    );
  }

  /**
   *  Get all dropdown data from
   * @method getInternalDocumentDropdown
   */
  getInternalDocumentDropdown(payload?): Observable<any> {
    return this.http.post<any>(
      API_URL + "api/Checklist/InternalReferenceDocumentDropdown",
      payload
    );
  }

  /**
   * This method is used to create a new record in database
   * @method create
   * @param {any} data type request Object
   */
  create(data: any): Observable<any> {
    const d = cloneDeep(data);
    d.jobWorkTypes ? d.jobWorkTypes.map(r => { r.Description = r.itemName, delete r.itemName }) : '';
    d.jobapplicationtypes ? d.jobapplicationtypes.forEach((object) => { delete object["itemName"]; }) : '';
    const payload = {
      name: d.name,
      jobapplicationtypes: (d.jobapplicationtypes) ? d.jobapplicationtypes : '',
      jobWorkTypes: (d.jobWorkTypes) ? d.jobWorkTypes : '',
      IsUserfillable: false,
      ReferenceNote: (d.referenceNote) ? d.referenceNote : '',
      IdReferenceDocument: (d.referenceDocuments) ? d.referenceDocuments.map((r) => r.id).toString() : "",
      IdCheckListGroup: d.idCheckListGroup,
      ExternalReferencelink: (d.externalReferenceLink) ? d.externalReferenceLink : null,
      IsActive: (d.isActive) ? true : false,
      ReferenceDocuments: (d.referenceDocuments) ? d.referenceDocuments : '',
      IdCreateFormDocument: (d.IdCreateFormDocument) ? d.IdCreateFormDocument : '',
      IdUploadFormDocument: (d.idUploadFormDocument) ? d.idUploadFormDocument : '',
      idJobApplicationTypes: d.jobapplicationtypes ? d.jobapplicationtypes.map((r) => r.id).toString() : "",
      idJobWorkTypes: d.jobWorkTypes ? d.jobWorkTypes.map((r) => r.id).toString() : "",
    };

    return this.http.post<any>(API_URL + "api/ChecklistItems", payload);
  }

  /**
* This method is used to update existing record in database
* @method update
* @param  {any} data type request Object
* @param {number} id id of job type for updating specific record
*/
  update(id: number, data: any): Observable<any> {
    const d = cloneDeep(data);
    d.jobWorkTypes ? d.jobWorkTypes.map(r => { r.Description = r.itemName, delete r.itemName }) : '';
    d.jobapplicationtypes ? d.jobapplicationtypes.forEach((object) => { delete object["itemName"]; }) : '';
    const payload = {
      id: id,
      name: d.name,
      jobapplicationtypes: (d.jobapplicationtypes) ? d.jobapplicationtypes : '',
      jobWorkTypes: (d.jobWorkTypes) ? d.jobWorkTypes : '',
      IsUserfillable: false,
      ReferenceNote: (d.referenceNote) ? d.referenceNote : '',
      IdReferenceDocument: (d.referenceDocuments) ? d.referenceDocuments.map((r) => r.id).toString() : "",
      IdCheckListGroup: d.idCheckListGroup,
      ExternalReferencelink: (d.externalReferenceLink) ? d.externalReferenceLink : null,
      IsActive: (d.isActive) ? true : false,
      ReferenceDocuments: (d.referenceDocuments) ? d.referenceDocuments : '',
      IdCreateFormDocument: (d.IdCreateFormDocument) ? d.IdCreateFormDocument : '',
      IdUploadFormDocument: (d.idUploadFormDocument) ? d.idUploadFormDocument : '',
      idJobApplicationTypes: d.jobapplicationtypes ? d.jobapplicationtypes.map((r) => r.id).toString() : "",
      idJobWorkTypes: d.jobWorkTypes ? d.jobWorkTypes.map((r) => r.id).toString() : "",
    };
    return this.http.put<any>(API_URL + "api/ChecklistItems/" + id, payload)
  }

  /**
   * This method is used to create a new record in database
   * @method createChecklistAddressPropertyMaping
   * @param {any} data type request Object
   */
  createChecklistAddressPropertyMaping(data: any): Observable<any> {
    const d = cloneDeep(data);
    d.map(r => {
      if (r.idChecklistAddressProperty == 4) {
        r.value = (r.value) ? r.value.toString() : "false"
        r.IsActive = ((r.value == 'false') || (!r.value)) ? false : true
      } else if (r.idChecklistAddressProperty == 3) {
        r.value = (r.value) ? r.value : "false"
        r.IsActive = ((r.value == 'false') || (!r.value)) ? false : true
      } else {
        r.value = (r.IsActive) ? "true" : "false"
      }
      delete r.description
    });
    if (d.length > 0) {
      d.map(r => delete r.fieldName)
    }
    const res = d.filter(r => r.IsActive == true);
    return this.http.post<any>(
      API_URL + "api/Checklist/PostChecklistAddressPropertyMaping",
      res
    );
  }

  checklistItemInactive(id: number, data: any): Observable<any> {
    return this.http.put<any>(
      API_URL + "api/Checklist/PutChecklistItemIsActive/" + id + "/" + data.isActive, '');
  }

  /**
  * This method is used to create a new record in database
  * @method updateChecklistAddressPropertyMaping
  * @param {any} data type request Object
  */
  updateChecklistAddressPropertyMaping(data: any, id: any): Observable<any> {
    const d = cloneDeep(data);
    d.map(r => {
      if (r.idChecklistAddressProperty == 4) {
        r.value = (r.value) ? r.value.toString() : "false"
        r.IsActive = ((r.value == 'false') || (!r.value)) ? false : true
      } else if (r.idChecklistAddressProperty == 3) {
        r.value = (r.value) ? r.value : "false"
        r.IsActive = ((r.value == 'false') || (!r.value)) ? false : true
      } else {
        r.value = (r.IsActive) ? "true" : "false"
      }
      delete r.description
    });
    if (d.length > 0) {
      d.map(r => delete r.fieldName)
    }
    const res = d.filter(r => r.IsActive == true);
    return this.http.put<any>(
      API_URL + "api/Checklist/PutChecklistAddressPropertyMaping/" + id,
      res
    );
  }

  /**
 *  Get all dropdown data from
 * @method getAddressProperty
 */
  getAddressProperty(): Observable<any> {
    return this.http.get<any>(API_URL + "api/Checklist/GetChecklistAddressProperty");
  }

  /**
 *  Get single record from database
 * @method getById
 * @param {number} id id of {{name}} for getting specific record
 */
  getByItemMasterId(id: number): Observable<any> {
    return this.http.get<any>(API_URL + "api/ChecklistItems/" + id);
  }

  /**
   *  Get single record from database
   * @method getById
   * @param {number} id id of {{name}} for getting specific record
   */
  getByItemChecklistAddressPropertyMaping(id: number): Observable<any> {
    return this.http.get<any>(
      API_URL + "api/Checklist/GetChecklistAddressPropertyMaping/" + id
    );
  }

  /**
 * This method will delete company record
 * @method delete
 * @param {number} id ID of company 
 */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(API_URL + "api/Checklist/DeleteCheckListItem/" + id)
  }
}
