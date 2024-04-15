import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { API_URL } from '../../../app.constants'
import { ProjectDetails } from '../../../types/projectDetails';
import { ActivatedRoute } from '@angular/router';
declare var $: any;


/**
* Class contains all services related to ProjectDetailsServices
* @class ProjectDetailsServices
*/
@Injectable()
export class ProjectDetailsServices {
  private sub: any;
  idRfp: number

  /**
  * This method is used for getting params from header
  * @constructor
  * @param {HttpClient} http 
  * @param {ActivatedRoute} route 
  */
  constructor(private http: HttpClient, private route: ActivatedRoute) {
    this.sub = this.route.params.subscribe(params => {
      this.idRfp = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
  }

  private projectDetailUrl = API_URL + 'api/Rfps';

  /**
  * This method is used to create a new project detail record in database
  * @method addProjectdetail
  * @param {any} data type request Object
  * @param {number} idRfp idRfp is the id of RFP
  */
  addProjectdetail(data: any, idRfp: number): Observable<any> {
    const d = cloneDeep(data)
    return this.http.post<ProjectDetails>(this.projectDetailUrl + "/" + idRfp + "/ProjectDetails", d)
  }

  // updateProjectdetail(data: any,idRfp:number,idProjectDetail?:number): Observable<any> {
  //   const d = cloneDeep(data)
  //   return this.http.put<ProjectDetails>(this.projectDetailUrl + "/" + idRfp + "/ProjectDetails/" + idProjectDetail, d)
  // }

  /**
  * This method is used to get project details data
  * @method chkProjectdetail
  * @param {number} idRfp idRfp is the id of RFP
  */
  chkProjectdetail(idRfp: number): Observable<any> {
    return this.http.get<ProjectDetails>(this.projectDetailUrl + "/" + idRfp)
  }

  /**
  * This method is used to get existing info project details data
  * @method getSavedProjectDetail
  * @param {number} idRfp idRfp is the id of RFP
  */
  getSavedProjectDetail(idRfp: number): Observable<any> {
    return this.http.get<ProjectDetails>(this.projectDetailUrl + "/" + idRfp + "/ProjectDetails")
  }

  /**
  * This method is used to get existing info project details with specific service data
  * @method getProjectdetail
  * @param {number} idRfp idRfp is the id of RFP
  * @param {number} idProjectDetail id of project detail 
  */
  getProjectdetail(idRfp: number, idProjectDetail: number): Observable<ProjectDetails> {
    return this.http.get<ProjectDetails>(this.projectDetailUrl + "/" + idRfp + "/ProjectDetails" + "/" + idProjectDetail)
  }
  
  /**
  * This method is used to delete specific service records of project details from database
  * @method deleteProjectDetail
  * @param {number} idRfp idRfp is the id of RFP
  * @param {number} idProjectDetail id of project detail 
  */
  deleteProjectDetail(idRfp: number, idProjectDetail: number): Observable<any> {
    return this.http.delete<any>(this.projectDetailUrl + "/" + idRfp + "/ProjectDetails/" + idProjectDetail)
  }
}