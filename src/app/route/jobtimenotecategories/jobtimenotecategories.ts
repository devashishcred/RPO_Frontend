/**
* This class is used as a Job Timenote Categories model
* @class JobTimenoteCategories
* @constructor 
*/

export interface JobTimenoteCategories {
  id: number,
  name: string,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date,
}

