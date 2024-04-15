/**
* This class is used as a JobTypeDTO model
* @class JobTypeDTO
* @constructor 
*/
export interface JobTypeDTO {
  id: number,
  name: string,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date,
  level: number,
  idParent: number
}