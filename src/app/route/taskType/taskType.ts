/**
*  This class is used as a TaskType model
* @class TaskType
*/
export interface TaskType {
  id: number,
  name: string,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date,
  isDisplayTime: boolean,
  isDisplayContact: boolean,
  isDisplayDuration: boolean,
  isActive: boolean,
  idDefaultContact: number
}

