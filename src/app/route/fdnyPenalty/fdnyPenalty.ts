/**
*  This class is used as a DobPenalty model
* @class DobPenalty
*/
export interface FdnyPenalty {
  id:number,
  category_RCNY:string,
  descriptionOfViolation:string,
  oathViolationCode:string,
  firstViolationPenalty:number,
  firstViolationMaximumPenalty:number,
  firstViolationMitigatedPenalty:number,  
  secondSubsequentViolationPenalty:number,
  secondSubsequentViolationMitigatedPenalty:number,
  secondSubsequentViolationMaximumPenalty:number,
  createdBy:number,
  createdByEmployeeName:string,
  createdDate:Date,
  lastModifiedBy:number,
  lastModifiedByEmployeeName:string
  lastModifiedDate:Date
}

/**
*  This class is used as a data-table model
* @class DobPenaltyDTO
*/
export interface FdnyPenaltyDTO {
  id:number,
  category_RCNY:string,
  descriptionOfViolation:string,
  oathViolationCode:string,
  firstViolationPenalty:number,
  formattedFirstViolationPenalty:string,
  firstViolationMitigatedPenalty:number,
  formattedFirstViolationMitigatedPenalty:string,
  firstViolationMaximumPenalty:number,
  formattedFirstViolationMaximumPenalty:string,
  secondSubsequentViolationPenalty:number,
  formattedSecondSubsequentViolationPenalty:string,
  secondSubsequentViolationMitigatedPenalty:number,
  formattedSecondSubsequentViolationMitigatedPenalty:string,
  secondSubsequentViolationMaximumPenalty:number,
  formattedSecondSubsequentViolationMaximumPenalty:string,
  createdBy:number,
  createdByEmployeeName:string,
  createdDate:any,
  lastModifiedBy:number,
  lastModifiedByEmployeeName:string
  lastModifiedDate:any
}