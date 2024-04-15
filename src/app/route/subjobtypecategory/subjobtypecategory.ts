/**
* This class is used as a SubJobTypeCategoryDTO model
* @class SubJobTypeCategoryDTO
* @constructor 
*/
export interface SubJobTypeCategoryDTO {
  id: number,
  name: string,
  idRfpJobType: number,
  rfpJobType: string,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date,
  level: number,
  idParent: number,
  isCurrentStatusOfFiling: boolean
}