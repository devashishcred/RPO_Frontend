/**
*  This class is used as a DotPenalty model
* @class DotPenalty
*/
export interface DotPenalty {
  id: number,
  section: string,
  description: string,
  penalty: number,
  defaultPenalty: number,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string
  lastModifiedDate: Date
}

/**
*  This class is used as a data-table model
* @class DotPenaltyDTO
*/
export interface DotPenaltyDTO {
  id: number,
  section: string,
  description: string,
  penalty: number,
  formattedPenalty: string,
  defaultPenalty: number,
  formattedDefaultPenalty: string,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: any,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string
  lastModifiedDate: any
}