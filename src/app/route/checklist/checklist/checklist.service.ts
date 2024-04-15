
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';
import { API_URL } from '../../../app.constants';
import { constantValues } from '../../../app.constantValues';
import { UserRightServices } from '../../../services/userRight.services';
import { LocalStorageService } from '../../../services/local-storage.service';



declare const $: any
/**
* Class contains all services related to CheckListGroupServices
* @class CheckListGroupServices
*/
@Injectable()
export class JobCheckListServices {

  isCustomerLoggedIn: boolean = false;

  constructor(private http: HttpClient,
    private constantValues: constantValues,
    private userRight: UserRightServices,
    private localStorageService: LocalStorageService
  ) {
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
  }

  private rfpCheckListGroupUrl = API_URL + "api";

  /**
   *  Get all dropdown data from JobTypes
   * @method getApplications
   */
  getApplications(id: number): Observable<any> {
    return this.http.get<any>(
      API_URL +
      "api/CheckListApplicationDropDown/CheckListApplicationDropDown/" +
      id
    );
  }

  getApplicationsComposite(id: number): Observable<any> {
    return this.http.get<any>(
      API_URL +
      "api/CompositeCheckListApplicationDropDown/" +
      id
    );
  }



  getChecklistWithJob(id: number, parentchecklistheaderid: number): Observable<any> {
    return this.http.get<any>(
      API_URL +
      "api/CompositeChecklist/ListOfChecklist/" +
      id + '/' + parentchecklistheaderid
    );
  }

  checkIsParentChecklistAlreadyExist(parentchecklistheaderid: number): Observable<any> {
    return this.http.get<any>(
      API_URL +
      "api/Checklist/GetParentCompositeChecklistExists/" + parentchecklistheaderid
    );
  }

  getChecklistById(id: number): Observable<any> {
    return this.http.get<any>(
      API_URL +
      "api/Checklist/GetCompositeChecklist/" +
      id
    );
  }
  /**
   *  Get all dropdown data from JobTypes
   * @method getChecklistAll
   */
  getChecklistAll(id: number, value: any, text?: any): Observable<any> {
    const data = {
      ChecklistIds: id.toString(),
      OrderFlag: value,
      SearchText: text
    }
    return this.http.post<any>(
      API_URL + "api/Checklist/ViewCheckList", data);
  }

  getChecklistAllCustomer(id: number, value: any, text?: any): Observable<any> {
    const data = {
      ChecklistIds: id.toString(),
      OrderFlag: value,
      SearchText: text
    }
    return this.http.post<any>(
      API_URL + "api/Checklist/customerViewCheckList", data);
  }


  getApplicationsForExrnalApplication(id: number): Observable<any> {
    return this.http.get<any>(
      API_URL +
      "api/jobApplicationTypes/dropdown/" +
      id
    );
  }


  getWorkPermitForExrnalApplication(id: number): Observable<any> {
    return this.http.get<any>(
      API_URL +
      "api/jobApplicationTypes/" + id + '/workTypes'
    );
  }
  /**
  *  Get all dropdown data from JobTypes
  * @method getChecklistAll
  */
  getCompositeChecklistAll(id: any, value: any, text?: any): Observable<any> {
    const data = {
      IdCompositeChecklist: id.toString(),
      OrderFlag: value,
      SearchText: text
    }
    return this.http.post<any>(
      API_URL + "api/CompositeCheckList/ViewCompositeCheckList", data);
  }
  getCompositeChecklistAllCustomer(id: any, value: any, text?: any): Observable<any> {
    const data = {
      IdCompositeChecklist: id.toString(),
      OrderFlag: value,
      SearchText: text
    }
    return this.http.post<any>(
      API_URL + "api/CompositeCheckList/ViewCustomerCompositeCheckList", data);
  }

  /**
 *  Get all dropdown data from JobTypes
 * @method getChecklistAll
 */
  getCompositeChecklistAllFOrTco(id: any, value: any, isTco: any): Observable<any> {
    return this.http.get<any>(
      API_URL + "api/CompositeCheckList/TCOViewCompositeCheckList/" + id + "/" + value + "/" + isTco
    );
  }

  /**
   *  Get all dropdown data from JobTypes
   * @method getApplications
   */
  getWorkPermits(id: number): Observable<any> {
    return this.http.get<any>(
      API_URL + "api/CheckListApplicationDropDown/WorkPermitsDropdown/" + id
    );
  }

  /**
   *  Get all dropdown data from JobTypes
   * @method getApplications
   */
  getChecklistGroup(): Observable<any> {
    return this.http.get<any>(
      API_URL + "api/CheckListApplicationDropDown/ChecklistGroupdropdown"
    );
  }


  /**
 *  Get all dropdown data from
 * @method getWorkpermitDropdown
 */
  getChecklistGroupIdBase(payload): Observable<any> {
    return this.http.post<any>(
      API_URL + "api/CheckList/GetChecklistGroupdropdownPermitwise",
      payload
    );
  }
  /**
   *  Get all dropdown data from JobTypes
   * @method getApplications
   */
  getChecklistApplication(id: number): Observable<any> {
    return this.http.get<any>(
      API_URL +
      "api/CheckListApplicationDropDown/CheckListSwitcherApplicationDropDown/" +
      id
    );
  }

  /**
 *  Get ECB VoilationList data
 * @method getVoilationList
 */
  getVoilationList(checklistId: number, isCOProject: boolean, search?: any): Observable<any> {
    const data = {
      IdCompositeChecklist: checklistId,
      IsCOProject: isCOProject,
      SearchText: search || ""
    }
    return this.http.post<any>(
      API_URL + "api/CompositeCheckList/GetECBCompositeViolations", data);
  }

  /**
 *  Get DOB VoilationList data
 * @method getDobVoilationList
 */
  getDobVoilationList(checklistId: number, isCOProject: boolean, search?: any): Observable<any> {
    const data = {
      IdCompositeChecklist: checklistId,
      IsCOProject: isCOProject,
      SearchText: search || ""
    }
    return this.http.post<any>(
      API_URL + "api/CompositeCheckList/GetDOBCompositeViolations", data);
  }

  /**
 *  Get DOB Safety VoilationList data
 * @method getDobVoilationList
 */
  getDobSafetyVoilationList(checklistId: number, isCOProject: boolean, search?: any): Observable<any> {
    const data = {
      IdCompositeChecklist: checklistId,
      IsCOProject: isCOProject,
      SearchText: search || ""
    }
    return this.http.post<any>(
      API_URL + "api/CompositeCheckList/GetSafetyCompositeViolations", data);
  }

  getDobViolationsOnAddModal(idJob: number, idcompositechecklist: any) {
    return this.http.get<any>(
      API_URL +
      `api/CompositeCheckList/GetDOBViolationsNotAdded_Composite/${idJob}/${idcompositechecklist}`
    );
  }

  getDobSafetyViolationsOnAddModal(idJob: number, idcompositechecklist: any) {
    return this.http.get<any>(
      API_URL +
      `api/CompositeCheckList/GetSafetyViolationsNotAdded_Composite/${idJob}/${idcompositechecklist}`
    );
  }

  getEcbViolationsOnAddModal(idJob: number, idCompositeChecklist: any) {
    return this.http.get<any>(
      API_URL +
      `api/CompositeCheckList/GetECBViolationsNotAdded_Composite/${idJob}/${idCompositeChecklist}`
    );
  }

  addEcbAndDobViolationInChecklist(data: any): Observable<any> {
    const d = cloneDeep(data);
    return this.http.post<any>(
      API_URL + "api/composite/PostDOB_ECBViolation_CompositeChecklist",
      d
    );
  }

  /**
 *  Get all dropdown data from JobTypes
 * @method getApplications
 */
  getCompositeChecklist(id: number): Observable<any> {
    return this.http.get<any>(
      API_URL +
      "api/CheckListApplicationDropDown/CompositeCheckListSwitcherDropDown/" +
      id
    );
  }

  /**
   *  Get single record from database
   * @method getById
   * @param {number} id id of {{name}} for getting specific record
   */
  getById(id: number): Observable<any> {
    return this.http.get<any>(this.rfpCheckListGroupUrl + "/" + id);
  }


  createExternalApplication(data: any, id: any): Observable<any> {
    const d = cloneDeep(data);
    return this.http.post<any>(
      API_URL + "api/CompositeChecklist/AddExternalJobApplication/" + id,
      d
    );
  }
  /**
   * This method is used to create a new record in database
   * @method create
   * @param {any} data type request Object
   */
  create(data: any): Observable<any> {
    const d = cloneDeep(data);
    return this.http.post<any>(this.rfpCheckListGroupUrl, d);
  }

  createProgressNote(data: any): Observable<any> {
    const d = cloneDeep(data);
    return this.http.post<any>(
      API_URL + "api/checklist/PostchecklistProgressNote",
      d
    );
  }

  createProgressNotePl(data: any): Observable<any> {
    const d = cloneDeep(data);
    return this.http.post<any>(
      API_URL + "api/checklist/PostPlumbingInsceptionProgressNote",
      d
    );
  }

  getReferenceNoteById(id: number): Observable<any> {
    return this.http.get<any>(
      API_URL + "api/Checklist/ChecklistProgressNoteHistory/" + id
    );
  }


  getReferenceNoteByIdPl(id: number): Observable<any> {
    return this.http.get<any>(
      API_URL + "api/Checklist/PlumbingInspectionProgressNoteHistory/" + id
    );
  }
  /**
   * This method is used to update existing record in database
   * @method update
   * @param  {any} data type request Object
   * @param {number} id id of job type for updating specific record
   */
  update(id: number, data: any): Observable<any> {
    const d = cloneDeep(data);
    return this.http.put<any>(this.rfpCheckListGroupUrl + "/" + id, d);
  }


  /**
 * This method is used to update existing record in database
 * @method update
 * @param  {any} data type request Object
 * @param {number} id id of job type for updating specific record
 */
  saveWorkOrder(data: any): Observable<any> {
    const d = cloneDeep(data);
    return this.http.put<any>(API_URL + "api/Checklist/PutPLInspectionWorkOrder", d);
  }

  /**
   * This method is used to create a new record in database
   * @method create
   * @param {any} data type request Object
   */
  generateChecklist(data: any): Observable<any> {
    const d = cloneDeep(data);
    // d.JobPlumbingCheckListFloors
    //   ? d.JobPlumbingCheckListFloors.map(
    //       (r) => (r.FloonNumber = +r.FloonNumber.replace("Floor ", ""))
    //     )
    //   : [];
    d.CheckListGroups
      ? d.CheckListGroups.map((r) => {
        (r.Displayorder = r.order),
          delete r.groupName,
          delete r.itemName,
          delete r.order,
          delete r.type;
      })
      : "";
    d.JobApplicationWorkPermitTypes
      ? d.JobApplicationWorkPermitTypes.map((r) => {
        (r.Code = r.workTypecode),
          delete r.itemName,
          delete r.permitnumber,
          delete r.permittype,
          delete r.workTypecode,
          delete r.worktypedescription;
      })
      : "";
    console.log('final generate checklist data', d);
    return this.http.post<any>(API_URL + "api/JobChecklist", d);
  }



  /**
 * This method is used to create a new record in database
 * @method create
 * @param {any} data type request Object
 */
  generateCompositeChecklist(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "api/CompositeChecklist", data);
  }

  updateCompositeChecklist(data: any, id: any): Observable<any> {
    console.log(data);
    return this.http.post<any>(API_URL + "api/Checklist/PostEditCompositeChecklist/" + id, data);
  }

  /**
   * This method is used to create a new record in database
   * @method create
   * @param {any} data type request Object
   */
  updateChecklist(data: any): Observable<any> {
    const d = cloneDeep(data);
    // d.JobPlumbingCheckListFloors
    //   ? d.JobPlumbingCheckListFloors.map(
    //       (r) => (r.FloonNumber = +r.FloonNumber.replace("Floor ", ""))
    //     )
    //   : [];
    d.CheckListGroups
      ? d.CheckListGroups.map((r) => {
        (r.Displayorder = r.order),
          delete r.groupName,
          delete r.itemName,
          delete r.order,
          delete r.type;
      })
      : "";
    d.JobApplicationWorkPermitTypes
      ? d.JobApplicationWorkPermitTypes.map((r) => {
        (r.Code = r.workTypecode),
          delete r.itemName,
          delete r.permitnumber,
          delete r.permittype,
          delete r.workTypecode,
          delete r.worktypedescription;
      })
      : "";
    console.log('final generate checklist data', d)
    return this.http.post<any>(
      API_URL + "api/Checklist/PostJobChecklistgroups",
      d
    );
  }

  /**
   *  Get all setGroupOrder data from JobTypes
   * @method setGroupOrder
   */
  setGroupOrder(data: any): Observable<any> {
    return this.http.post<any>(
      API_URL + "api/Checklist/ManageChecklistGroupOrder/",
      data
    );
  }


  /**
  *  Get all setGroupOrder data from JobTypes
  * @method setGroupOrder
  */
  setCompositeCHecklistOrder(data: any, idCompositeChecklist: any): Observable<any> {
    return this.http.post<any>(
      API_URL + "api/CompositeChecklist/ManageCompositeChecklistOrder/" + idCompositeChecklist,
      data
    );
  }

  /**
   *  Get all setItemsOrder data from JobTypes
   * @method setItemsOrder
   */
  setItemsOrder(data: any): Observable<any> {
    return this.http.post<any>(
      API_URL + "api/Checklist/ManageChecklistItemOrder/",
      data
    );
  }

  /**
   * This method is used to create a new record in database
   * @method create
   * @param {any} data type request Object
   */
  saveItemInChecklist(data: any, id: any): Observable<any> {
    const d = cloneDeep(data);
    const res = d.itmes.map((v) => ({ id: v.id, name: v.name, }));
    console.log(res);
    console.log(d);
    return this.http.post<any>(
      API_URL + "api/checklist/PostJobChecklistItemFromOtherGroup/" + id,
      res
    );
  }

  /**
   * This method is used to create a new record in database
   * @method create
   * @param {any} data type request Object
   */
  saveItemInChecklistManual(data: any): Observable<any> {
    const d = cloneDeep(data);
    const payload = {
      IdJobChecklistGroup: d.id,
      ItemName: d.name,
    };
    console.log(payload);
    return this.http.post<any>(
      API_URL + "api/checklist/PostJobChecklistManualItem",
      payload
    );
  }

  /**
  * This method is used to add inspections in single floor
  * @method create
  * @param {any} data type request Object
  */
  saveInspectionInFloor(data: any, id): Observable<any> {
    return this.http.post<any>(
      API_URL + "api/checklist/PostJobChecklistItemFromOtherGroup/" + id,
      data
    );
  }

  // add comments api

  /**
   * This method is used to create a new record in database
   * @method create
   * @param {any} data type request Object
   */
  saveChecklistComment(data: any): Observable<any> {
    const d = cloneDeep(data);
    console.log(d);
    return this.http.post<any>(
      API_URL + "api/checklist/PostChecklistComment",
      d
    );
  }
  /**
   * This method is used to create a new record in database
   * @method create
   * @param {any} data type request Object
   */
  saveViolationComment(data: any): Observable<any> {
    const d = cloneDeep(data);
    console.log(d);
    return this.http.post<any>(
      API_URL + "api/checklist/PostChecklistViolationComment",
      d
    );
  }


  saveChecklistCommentPL(data: any): Observable<any> {
    const d = cloneDeep(data);

    console.log(d);
    return this.http.post<any>(
      API_URL + "api/checklist/PostPLInspectionComment",
      d
    );
  }

  /**
   * This method is used to create a new record in database
   * @method create
   * @param {any} data type request Object
   */
  saveChecklistStatus(data: any, id): Observable<any> {
    const d = cloneDeep(data);
    console.log(d);
    return this.http.put<any>(
      API_URL + "api/Checklist/PutJobCheckliststatus/" + id,
      d
    );
  }

  saveChecklistTco(data: any, id): Observable<any> {
    const d = cloneDeep(data);
    console.log(d);
    return this.http.put<any>(
      API_URL + "api/compositeChecklist/PutRequiredforTCO/" + id,
      d
    );
  }

  saveChecklistPlStatus(data: any): Observable<any> {
    const d = cloneDeep(data);
    console.log(d);
    return this.http.put<any>(
      API_URL + "api/ChecklistL/PutPlumbingInspectionResult",
      d
    );
  }

  saveChecklistTcoForViolation(data: any): Observable<any> {
    const d = cloneDeep(data);
    console.log(d);
    return this.http.put<any>(
      API_URL + "api/compositeChecklist/PutRequiredforViolationTCO",
      d
    );
  }

  updateChecklistStatusForViolation(data: any): Observable<any> {
    const d = cloneDeep(data);
    console.log(d);
    return this.http.put<any>(
      API_URL + "api/compositeChecklist/PutStatuForViolation",
      d
    );
  }

  /**
   * This method is used to create a new record in database
   * @method create
   * @param {any} data type request Object
   */
  savePartyResponcible(data: any, id): Observable<any> {
    const d = cloneDeep(data);

    console.log(d);
    return this.http.put<any>(
      API_URL + "api/Checklist/PutJobChecklistItemPartyResponsible/" + id,
      d
    );
  }

  textSave(data: any, id): Observable<any> {
    const d = cloneDeep(data);

    console.log(d);
    return this.http.put<any>(
      API_URL + "api/Checklist/PutJobChecklistItemManualPartyResponsible/" + id,
      d
    );
  }

  changeContact(data: any, id): Observable<any> {
    const d = cloneDeep(data);

    console.log(d);
    return this.http.put<any>(
      API_URL + "api/Checklist/PutJobChecklistItemManualIdContact/" + id,
      d
    );
  }

  changeStage(data: any, id): Observable<any> {
    const d = cloneDeep(data);

    console.log(d);
    return this.http.put<any>(
      API_URL + "api/Checklist/PutJobChecklistItemDetailsStage/" + id,
      d
    );
  }

  saveApplicant(data: any, id): Observable<any> {
    const d = cloneDeep(data);

    console.log(d);
    return this.http.put<any>(
      API_URL + "api/Checklist/PutJobChecklistItemDetailsDesignApplicant/" + id,
      d
    );
  }


  saveInspector(data: any, id): Observable<any> {
    const d = cloneDeep(data);

    console.log(d);
    return this.http.put<any>(
      API_URL + "api/Checklist/PutJobChecklistItemInspector/" + id,
      d
    );
  }

  /**
   * This method is used to create a new record in database
   * @method create
   * @param {any} data type request Object
   */
  saveChecklistDueDate(data: any): Observable<any> {
    const d = cloneDeep(data);
    console.log(d);
    return this.http.post<any>(
      API_URL + "api/checklist/PostChecklistDueDate",
      d
    );
  }


  /**
 * This method is used to create a new record in database
 * @method create
 * @param {any} data type request Object
 */
  saveChecklistDueDatePl(data: any): Observable<any> {
    const d = cloneDeep(data);
    console.log(d);
    return this.http.post<any>(
      API_URL + "api/Checklist/PostPLInspectionDueDate",
      d
    );
  }

  /**
   *  Get single record from database
   * @method getById
   * @param {number} id id of {{name}} for getting specific record
   */
  getChecklistCommentsById(id: number): Observable<any> {
    return this.http.get<any>(
      API_URL + "api/Checklist/" + id + "/ChecklistcommentHistory"
    );
  }

  /**
   *  Get single record from database
   * @method getById
   * @param {number} id id of {{name}} for getting specific record
   */
  getViolationCommentsById(id: number): Observable<any> {
    return this.http.get<any>(
      API_URL + "api/Checklist/GetChecklistViolationcommentHistory/" + id
    );
  }


  getChecklistCommentsPlById(id: number): Observable<any> {
    return this.http.get<any>(
      API_URL + "api/Checklist/GetPLcommentHistory/" + id
    );
  }
  /**
   * This method is used to delete records from database
   * @method delete
   * @param {number} id  of {{name}} to delete
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      API_URL + "api/Checklist/DeleteItemFromChecklist/" + id
    );
  }

  deletePlItem(id: number): Observable<void> {
    return this.http.delete<void>(
      API_URL + "api/Checklist/DeletePLInspection/" + id
    );
  }

  /**
   * This method is used to delete records from database
   * @method delete
   * @param {number} id  of {{name}} to delete
   */
  deleteChecklist(id: number): Observable<void> {
    return this.http.delete<void>(
      API_URL + "api/Checklist/DeleteCheckList/" + id
    );
  }

  deleteCompositeChecklist(id: number): Observable<void> {
    return this.http.delete<void>(
      API_URL + "api/DeleteCompositeCheckList/" + id
    );
  }
  /**
   *  Get all dropdown data from JobTypes
   * @method getCheckListById
   */
  getCheckListById(id: any): Observable<any> {
    return this.http.get<any>(API_URL + "api/Checklist/GetJobChecklist/" + id);
  }

  getCompositeCheckListById(id: any): Observable<any> {
    return this.http.get<any>(API_URL + "api/Checklist/GetCompositeChecklist/" + id);
  }

  getChecklistReferenceNoteById(id: number): Observable<any> {
    return this.http.get<any>(API_URL + "api/Checklist/ReferenceNote/" + id);
  }

  getChecklistReferenceNoteByPlId(id: number): Observable<any> {
    return this.http.get<any>(API_URL + "api/Checklist/PlumbingReferenceNote/" + id);
  }

  getInspections(workPermitIds): Observable<any> {
    return this.http.get<any>(API_URL + "api/CheckList/GetChecklistItemdropdown/" + workPermitIds);
  }

  unlinkChecklist(id) {
    return this.http.delete<void>(
      API_URL + "api/DelinkCompositeCheckList/" + id
    );
  }

  delinkViolation(idCompositechecklist, id) {
    return this.http.delete<void>(
      API_URL + "api/composite/DelinkViolation/" + idCompositechecklist + "/" + id
    );
  }

  /**
   *  General Export Api
   * @method exportGeneral
   */
  exportGeneralExcel(data) {
    if(this.isCustomerLoggedIn) {
      const d = cloneDeep(data);
      return this.http.post<any>(
        API_URL + "api/Checklist/ExportChecklistToExcelForCustomer",
        d
      );
    } else {
      const d = cloneDeep(data);
      return this.http.post<any>(
        API_URL + "api/Checklist/ExportChecklistToExcel",
        d
      );
    }
  }
  exportGeneralPdf(data) {
    if(this.isCustomerLoggedIn) {
      const d = cloneDeep(data);
      return this.http.post<any>(
        API_URL + "api/Checklist/ExportChecklistToPDFForCustomer",
        d
      );
    } else {
      const d = cloneDeep(data);
      return this.http.post<any>(
        API_URL + "api/Checklist/ExportChecklistToPDF",
        d
      );
    }
  }

  /**
   *  Composite Export Api
   * @method exportGeneral
   */
  exportCompositeExcel(data) {
    if(this.isCustomerLoggedIn) {
      const d = cloneDeep(data);
      return this.http.post<any>(
        API_URL + "api/Checklist/ExportCompositeChecklistToExcelForCustomer",
        d
      );
    } else {
      const d = cloneDeep(data);
      return this.http.post<any>(
        API_URL + "api/Checklist/ExportCompositeChecklistToExcel",
        d
      );
    }
  }
  exportCompositePdf(data) {
    if(this.isCustomerLoggedIn) {
      const d = cloneDeep(data);
      return this.http.post<any>(
        API_URL + "api/Checklist/ExportCompositeChecklistToPDFForCustomer",
        d
      );
    } else {
      const d = cloneDeep(data);
      return this.http.post<any>(
        API_URL + "api/Checklist/ExportCompositeChecklistToPDF",
        d
      );
    }
  }

  infoDataUpdate(id, data) {
    const d = cloneDeep(data);
    return this.http.put<any>(API_URL + 'api/Checklist/PutJobChecklistHeader/' + id, d).toPromise();
  }

  deleteMultipleItems(ids: string): Observable<void> {
    return this.http.delete<void>(
      API_URL + "api/Checklist/DeleteAllSelelctFromChecklist/" + ids
    );
  }

  deleteMultiplePlItems(ids: string): Observable<void> {
    return this.http.delete<void>(
      API_URL + "api/Checklist/DeleteAllSelectPLInspection/" + ids
    );
  }
}