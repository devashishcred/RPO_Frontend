/**
*  This class is used as a DepNoiseCodePenalty model
* @class DepNoiseCodePenalty
*/
export interface DepNoiseCodePenalty {
  id:number,
  sectionOfLaw:string,
  violationDescription:string,
  compliance:string,
  offense_1:boolean,
  penalty_1:number,
  defaultPenalty_1:number,
  stipulation_1:boolean,
  offense_2:string,
  penalty_2:number,
  defaultPenalty_2:number,
  stipulation_2:boolean,
  offense_3:string,
  penalty_3:number,
  defaultPenalty_3:number,
  stipulation_3:boolean,
  offense_4:string,
  penalty_4:number,
  defaultPenalty_4:number,
  stipulation_4:boolean,
  createdBy:number,
  createdByEmployeeName:string,
  createdDate:Date,
  lastModifiedBy:number,
  lastModifiedByEmployeeName:string
  lastModifiedDate:Date
}

/**
*  This class is used as a data-table model
* @class DepNoiseCodePenaltyDTO
*/
export interface DepNoiseCodePenaltyDTO {
  id:number,
  sectionOfLaw:string,
  violationDescription:string,
  compliance:string,
  offense_1:boolean,
  penalty_1:number,
  defaultPenalty_1:number,
  formattedPenalty_1:string,
  formattedDefaultPenalty_1:string,
  stipulation_1:boolean,
  offense_2:string,
  penalty_2:number,
  defaultPenalty_2:number,
  formattedPenalty_2:string,
  formattedDefaultPenalty_2:string,
  stipulation_2:boolean,
  offense_3:string,
  penalty_3:number,
  defaultPenalty_3:number,
  formattedPenalty_3:string,
  formattedDefaultPenalty_3:string,
  stipulation_3:boolean,
  offense_4:string,
  penalty_4:number,
  defaultPenalty_4:number,
  formattedPenalty_4:string,
  formattedDefaultPenalty_4:string,
  stipulation_4:boolean,
  createdBy:number,
  createdByEmployeeName:string,
  createdDate:any,
  lastModifiedBy:number,
  lastModifiedByEmployeeName:string
  lastModifiedDate:any
}