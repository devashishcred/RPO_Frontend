/**
* This class is used as a RfpSubJobType model
* @class RfpSubJobType
* @constructor 
*/
export interface RfpSubJobType {
  id: number,
  name: string,
  idRfpJobType: number, // first part (DOT,DEP)
  rfpJobType: string,
  idRfpSubJobTypeCategory: number,
  rfpSubJobTypeCategory: string,// second part (REGISTRATION)
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date,
  level: number,
  idParent: number
}