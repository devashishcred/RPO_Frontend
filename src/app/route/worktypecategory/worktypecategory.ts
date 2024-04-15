/**
* This class is used as a WorkTypeCategory model
* @class WorkTypeCategory
* @constructor 
*/
export interface WorkTypeCategory {
  id: number,
  name: string,
  idRfpJobType: number, // first part (DOT,DEP)
  rfpJobType: string,
  idRfpSubJobTypeCategory: number,// second part (REGISTRATION)
  rfpSubJobTypeCategory: string,
  idRfpSubJobType: number,// third part (REGISTRATION)
  rfpSubJobType: string,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date,
  level: number,
  idParent: number,
  displayOrder:number
}