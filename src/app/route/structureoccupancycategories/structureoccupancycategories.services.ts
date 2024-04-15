import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { StructureOccupancyCategories } from './structureoccupancycategories';
import { structureOccupancyCategories } from '../../types/classifications';

declare const $: any
/**
*  Class contains all services related to StructureOccupancyCategoriesServices
* @class StructureOccupancyCategoriesServices
*/
@Injectable()
export class StructureOccupancyCategoriesServices {

  constructor(private http: HttpClient) { }

  private StructureOccupancyCategoriesUrl = API_URL + 'api/StructureOccupancyCategories'

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): StructureOccupancyCategories[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.StructureOccupancyCategoriesUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: StructureOccupancyCategories): Observable<StructureOccupancyCategories> {
    const d = cloneDeep(data)
    return this.http.post<StructureOccupancyCategories>(this.StructureOccupancyCategoriesUrl, d)
  }

  /**
  * This method is used to update existing record in database
  * @method update
  * @param  {any} data type request Object
  * @param {number} id id of Structure Occupancy Categories for updating specific record
  */
  update(id: number, data: StructureOccupancyCategories): Observable<any> {
    return this.http.put<any>(this.StructureOccupancyCategoriesUrl + '/' + id, data)
  }

  /**
  *  Get single record from database
  * @method getById
  * @param {number} id id of Structure Occupancy Categories for getting specific record
  */
  getById(id: number): Observable<StructureOccupancyCategories> {
    return this.http.get<StructureOccupancyCategories>(this.StructureOccupancyCategoriesUrl + '/' + id)
  }


  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Structure Occupancy Categories to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.StructureOccupancyCategoriesUrl + '/' + id)
  }

  /**
  *  Get all records from database 
  * @method get
  */
  get(): Observable<structureOccupancyCategories[]> {
    return this.http.get<structureOccupancyCategories[]>(this.StructureOccupancyCategoriesUrl)
  }

  /**
  *  Get all dropdown data from Structure Occupancy Categories
  * @method getDropdown
  */
  getDropdown(): Observable<any> {
    return this.http.get<any>(this.StructureOccupancyCategoriesUrl + "/dropdown")
  }
}