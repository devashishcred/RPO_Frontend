import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { API_URL } from '../../app.constants';
import { Task, TaskJobDTO } from '../../types/task';
import { constantValues } from '../../app.constantValues';

declare const $: any
/**
* Class contains all services related to Task
* @class TaskServices
*/
@Injectable()
export class TaskServices {

  constructor(private http: HttpClient, private constantValues: constantValues) { }

  private taskUrl = API_URL + 'api/tasks'
  private taskMaterUrl = API_URL + 'api/Tasks/MasterTask'
  private taskStatusUrl = API_URL + 'api/taskStatus'
  private taskTypeUrl = API_URL + 'api/tasktypes'
  private progressionNoteUrl = API_URL + 'api/tasks'
  private taskNoteUrl = API_URL + 'api/taskNotes'
  private reminderUrl = API_URL + 'api/taskReminders'
  private taskAttachmentUrl = API_URL + 'api/taskDocuments/document'

  /**
  *  Get all records from database in datatable format
  * @method get
  * @param {string} search it is a string type which is used for filter data from data table
  */
  get(search: any = {}): TaskJobDTO[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.taskUrl
    }, search));
  }


  dateFromUTC (date: string, onlydate?: boolean) {
    // Check correct time format and split into components
    let ddate = date.split('T');
    let formateddate =  moment(ddate[0]).format(this.constantValues.DATEFORMAT);
    if(!onlydate){
      let formattime = ddate[1].split('Z')
      let formattimes = this.tConvert(formattime[0]);
      return formateddate+ ' '+ formattimes;
    } else{
      return formateddate;
    }

  }
  tConvert (time: any) {
    // Check correct time format and split into components
    time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
  
    if (time.length > 1) { // If time format correct
      time = time.slice (1);  // Remove full string match value
      delete time[3];
      time[4] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join (''); // return adjusted time or original string
  }
  /**
  *  Get all records from database in datatable format
  * @method getJobTasks
  * @param {string} search it is a string type which is used for filter data from data table
  */
  getJobTasks(search: any = {}): TaskJobDTO[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.taskUrl
    }, search));
  }

    /**
  *  Get all records from database in datatable format
  * @method getJobTasks
  * @param {string} search it is a string type which is used for filter data from data table
  */
     getMasterTasks(search: any = {}): TaskJobDTO[] {
      return $.fn.dataTable.pipeline($.extend(true, {
        url: this.taskMaterUrl
      }, search));
    }
  

  /**
  * This method is used to delete records from database
  * @method delete
  * @param {number} id  of Task Type  to delete 
  */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.taskUrl + '/' + id)
  }

  /**
  *  Get all dropdown data from TaskType
  * @method getTaskType
  */
  getTaskType(): Observable<any> {
    return this.http.get<any>(this.taskTypeUrl + '/dropdown')
  }
  /**
  *  Get all dropdown data from TaskType
  * @method getTaskType
  */
  getTaskTypeS(idTasktype: number): Observable<any> {
    return this.http.get<any>(this.taskTypeUrl +'/'+idTasktype + '/dropdown')
  }

  /**
  *  Get all dropdown data from TaskStatus
  * @method getTaskStatus
  */
  getTaskStatus(): Observable<any> {
    return this.http.get<any>(this.taskStatusUrl)
  }

  /**
  * This method is used to create/update existing record in database
  * @method addorEditTask
  * @param  {any} data type request Object
  * @param {boolean} isNew it is used to indicate whether record is new or old
  */
  addorEditTask(data: any, isNew: boolean): Observable<any> {
    const d = cloneDeep(data)
    if (isNew) {
      return this.http.post<any>(this.taskUrl, d)
    } else {
      return this.http.put<any>(this.taskUrl + "/" + d.id, d)
    }
  }

    /**
  * This method is used to create existing record in database
  * @method addGeneralTask
  * @param  {any} data type request Object
  * @param {boolean} isNew it is used to indicate whether record is new or old
  */
     addGeneralTask(data: any, isNew: boolean): Observable<any> {
      const d = cloneDeep(data)
      if (isNew) {
        return this.http.post<any>(this.taskUrl, d)
      } else {
        return this.http.put<any>(this.taskUrl + "/" + d.id, d)
      }
      // const url = API_URL + 'api/Tasks'
      //   return this.http.post<any>(url, d)
    }

  /**
  *  Get single record from database
  * @method getTaskById
  * @param {number} id id of Task Type  for getting specific record
  */
  getTaskById(idTask: number): Observable<any> {
    return this.http.get<any>(this.taskUrl + "/" + idTask)
  }

  /**
  * This method is used to get progression note for specific task
  * @method getProgressionNotes
  * @param {number} idTask task id which is used to get progression note for specific task
  */
  getProgressionNotes(idTask: number): Observable<any> {
    return this.http.get<any>(this.progressionNoteUrl + "/" + idTask + "/taskNotes")
  }

  /**
  * This method is used to create a new progression note record in database
  * @method createProgressionNote
  * @param {any} data type request Object
  */
  createProgressionNote(data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.post<any>(this.taskNoteUrl, d)
  }

  /**
  * This method is used to get all reminders for specific task
  * @method getReminders
  * @param {number} idTask task id which is used to get reminder for specific task
  * @param {boolean} IsMyReminder it is used to indicate whether reminder is for specific task or all reminders
  */
  getReminders(idTask: number, IsMyReminder: boolean): Observable<any> {
    return this.http.get<any>(this.reminderUrl + "?dataTableParameters.idTask=" + idTask + "&dataTableParameters.IsMyReminder=" + IsMyReminder)
  }

  /**
  * This method is used to create a new reminder record in database
  * @method setReminder
  * @param {any} data type request Object
  */
  setReminder(data: any): Observable<any> {
    const d = cloneDeep(data)
    return this.http.post<any>(this.reminderUrl, d)
  }

  /**
  * This method is used to get fee schedule master data in dropdown
  * @method getFeeScheduleOptions
  * @param {number} idJob job id is passed for specific job
  */
  getFeeScheduleOptions(idJob: number, idTask: number): Observable<any> {
    return this.http.get<any>(API_URL + "api/jobfeeschedules/" + idJob + "/dropdown/" + idTask);
  }

  /**
  * This method is used to get list of additional servies that are not in scope in dropdown format
  * @method getAdditionalServices
  */
  getAdditionalServices(): Observable<any> {
    return this.http.get<any>(API_URL + "api/rfpserviceitems/dropdown");
  }
  getEditAdditionalServices(itemId: number): Observable<any> {
    return this.http.get<any>(API_URL + 'api/rfpserviceitems/'+ itemId + '/dropdown');
  }
  updateTaskInGrid(id: number, data: any, type: string, jobid?: number): Observable<any> {
    if (type == 'dueDate') {
      let req: any = {
        id: id,
        dueDate: data
      }
      return this.http.put<any>(this.taskUrl + '/dueDate', req);
    } else if (type == 'status') {
      let req: any = {
        id: id,
        idTaskStatus: data,
        idJob: jobid
      }
      return this.http.put<any>(this.taskUrl + '/status', req);
    } else {
      let req: any = {
        id: id,
        idAssignedTo: data,
        idJob: jobid
      }
      return this.http.put<any>(this.taskUrl + '/assignedto', req);
    }
  }

  saveAttachments(data: any): Observable<any> {
    return this.http.put<any>(this.taskAttachmentUrl, data)
  }

}