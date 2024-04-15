/**
*  This class is used as a DohmhPenalty model
* @class DohmhPenalty
*/
export interface DohmhPenalty {
  id: number,
  sectionOfLaw: string,
  description: string,
  penaltyFirstViolation: number,
  penaltyRepeatViolation: number,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string
  lastModifiedDate: Date
}

/**
*  This class is used as a data-table model
* @class DohmhPenaltyDTO
*/
export interface DohmhPenaltyDTO {
  id: number,
  sectionOfLaw: string,
  description: string,
  penaltyFirstViolation: number,
  formattedPenaltyFirstViolation: string,
  penaltyRepeatViolation: number,
  formattedPenaltyRepeatViolation: string,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: any,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string
  lastModifiedDate: any
}