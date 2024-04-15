import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../app.constants';
import { DocumentType } from '../types/employee';

/**
*  Class contains all services related to DocumentTypeServices
* @class DocumentTypeServices
*/
@Injectable()
export class DocumentTypeServices {

  constructor(private http: HttpClient) { }

  private documentTypeUrl = API_URL + 'api/documentTypes'

  /**
  *  Get all dropdown data
  * @method getDropdownData
  */
  get(): Observable<DocumentType[]> {
    return this.http.get<DocumentType[]>(this.documentTypeUrl)
  }
}