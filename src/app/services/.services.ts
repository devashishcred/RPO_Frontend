import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { API_URL } from '../app.constants';
import { constructionClassifications } from '../types/classifications';

@Injectable()
export class ConstClasificationsServices {

  constructor(private http: HttpClient) { }

  private cityUrl = API_URL + 'api/MultipleDwellingClassifications'

  get(): Observable<constructionClassifications[]> {
    return this.http.get<constructionClassifications[]>(this.cityUrl)
  }
}