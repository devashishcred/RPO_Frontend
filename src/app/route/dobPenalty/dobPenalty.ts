/**
*  This class is used as a DobPenalty model
* @class DobPenalty
*/
export interface DobPenalty {
  id:number,
  sectionOfLaw:string,
  classification:string,
  infractionCode:string,
  violationDescription:string,
  cure:boolean,
  stipulation:boolean,
  standardPenalty:number,
  mitigatedPenalty:boolean,
  defaultPenalty:number,
  aggravatedPenalty_I:string,
  aggravatedDefaultPenalty_I:number,
  aggravatedPenalty_II:number,
  aggravatedDefaultMaxPenalty_II:number,
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
export interface DobPenaltyDTO {
  id:number,
  sectionOfLaw:string,
  classification:string,
  infractionCode:string,
  violationDescription:string,
  cure:boolean,
  stipulation:boolean,
  standardPenalty:number,
  formattedStandardPenalty:string,
  mitigatedPenalty:boolean,
  defaultPenalty:number,
  formattedDefaultPenalty:string,
  aggravatedPenalty_I:string,
  formattedAggravatedPenalty_I:string,
  aggravatedDefaultPenalty_I:number,
  formattedAggravatedDefaultPenalty_I:string,
  aggravatedPenalty_II:number,
  formattedAggravatedPenalty_II:string,
  aggravatedDefaultMaxPenalty_II:number,
  formattedAggravatedDefaultMaxPenalty_II:string,
  createdBy:number,
  createdByEmployeeName:string,
  createdDate:any,
  lastModifiedBy:number,
  lastModifiedByEmployeeName:string
  lastModifiedDate:any
}