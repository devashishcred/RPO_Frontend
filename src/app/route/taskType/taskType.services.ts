import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { API_URL } from '../../app.constants';
import { TaskType } from './taskType';

declare const $: any

/**
*  Class contains all services related to TaskTypeServices
* @class TaskTypeServices
*/
@Injectable()
export class TaskTypeServices {
  private taskTypeUrl = API_URL + 'api/tasktypes'
  private taskTypeStatusUrl = API_URL + 'api/TaskTypes/IsActive'

  constructor(private http: HttpClient) { }

  /**
  *  Get all records from database in datatable format
  * @method getRecords
  */
  getRecords(cfg: any = {}): TaskType[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.taskTypeUrl
    }, cfg));
  }

  /**
  * This method is used to create a new record in database
  * @method create
  * @param {any} data type request Object
  */
  create(data: TaskType): Observable<TaskType> {
    const d = cloneDeep(data)
    return this.http.post<TaskType>(this.taskTypeUrl, d)
  }

 /**
 * This method is used to update existing record in database
 * @method update
 * @param  {any} data type request Object
 * @param {number} id id of Task Type for updating specific record
 */
  toggleStatus(data: any): Observable<any> {
    return this.http.put<any>(this.taskTypeStatusUrl , data)
  }
 /**
 * This method is used to update existing record in database
 * @method update
 * @param  {any} data type request Object
 * @param {number} id id of Task Type for updating specific record
 */
  update(id: number, data: TaskType): Observable<any> {
    return this.http.put<any>(this.taskTypeUrl + '/' + id, data)
  }

 /**
 *  Get single record from database
 * @method getById
 * @param {number} id id of Task Type for getting specific record
 */
  getById(id: number): Observable<TaskType> {
    return this.http.get<TaskType>(this.taskTypeUrl + '/' + id)
  }

 /**
 * This method is used to delete records from database
 * @method delete
 * @param {number} id  of Task Type to delete 
 */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.taskTypeUrl + '/' + id)
  }
}