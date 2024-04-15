import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { SeismicDesignCategories } from './seismicdesigncategories';
import { seismicDesignCategories } from '../../types/classifications';

declare const $: any
/**
*  Class contains all services related to SeismicDesignCategoriesServices
* @class SeismicDesignCategoriesServices
*/
@Injectable()
export class SeismicDesignCategoriesServices {

  constructor(private http: HttpClient) { }

  private SeismicDesignCategoriesUrl = API_URL + 'api/SeismicDesignCategories'

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): SeismicDesignCategories[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.SeismicDesignCategoriesUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: SeismicDesignCategories): Observable<SeismicDesignCategories> {
    const d = cloneDeep(data)
    return this.http.post<SeismicDesignCategories>(this.SeismicDesignCategoriesUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Seismic Design Categories for updating specific record
  */
  update(id: number, data: SeismicDesignCategories): Observable<any> {
    return this.http.put<any>(this.SeismicDesignCategoriesUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Seismic Design Categories for getting specific record
  */
  getById(id: number): Observable<SeismicDesignCategories> {
    return this.http.get<SeismicDesignCategories>(this.SeismicDesignCategoriesUrl + '/' + id)
  }


  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Seismic Design Categories to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.SeismicDesignCategoriesUrl + '/' + id)
  }


  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<seismicDesignCategories[]> {
    return this.http.get<seismicDesignCategories[]>(this.SeismicDesignCategoriesUrl)
  }

  /**
  *  Get all dropdown data from Seismic Design Categories
  * @method getDropdown
  */
  getDropdown(): Observable<any> {
    return this.http.get<any>(this.SeismicDesignCategoriesUrl + "/dropdown")
  }
}