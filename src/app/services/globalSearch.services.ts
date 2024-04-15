import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../app.constants';

declare const $: any

/**
*  Class contains all services related to GlobalSearchServices
* @class GlobalSearchServices
*/
@Injectable()
export class GlobalSearchServices {

  constructor(private http: HttpClient) { }
  globelSearchText = new Subject;
  private searchUrl = API_URL + 'api/globalSearch'
 
  /**
   * This method search in module as per criteria
   * @method search
   * @param {number} type Global search type 
   * @param {string} searchText Global Search Text
   */
  search(type:number,searchText:string): Observable<any> {
    let paramsString = ""
    if(type){
      paramsString = (paramsString == "") ? "?globalSearchType="+type : paramsString + "&globalSearchType="+type
    }
    if(searchText){
      paramsString = (paramsString == "") ? "?searchText="+searchText : paramsString + "&searchText="+searchText
    }
    return this.http.get<any>(this.searchUrl + paramsString)
  }

}