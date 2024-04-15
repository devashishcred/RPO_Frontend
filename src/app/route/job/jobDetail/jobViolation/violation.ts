/**
* This class is used as a Violation model
* @class Violation
* @constructor 
*/
export interface Violation {
  id: number,
  idJob: number,
  summonsNumber: string,
  dateIssued: Date,
  hearingDate: Date,
  hearingLocation: string,
  hearingResult: string,
  statusOfSummonsNotice: string,
  respondentAddress: string,
  inspectionLocation: string,
  balanceDue: string,
  respondentName: string,
  issuingAgency: string,
  complianceOn: string,
  certificationStatus: string,
  explanationOfCharges: ExplanationOfCharges,
  resolvedDate: Date,
  isFullyResolved: boolean,
  notesLastModifiedByEmployeeName: string,
  notesLastModifiedDate:Date,
  cureDate: Date,
  partyResponsible?:any,
  IdContact?:any,
  ManualPartyResponsible?:any,
  penalty_imposed?:any,
  violationType?:any,
  aggravatedLevel?:any,
  hearingTime?:any,
  violationDescription?: any,
}

/**
* This class is used as a Explanation Of Charges model
* @class ExplanationOfCharges
* @constructor 
*/
export interface ExplanationOfCharges {
  id: number,
  paneltyAmount: string,
  description: string,
  codeSection: string,
  code: string,
  IsFromAuth: boolean,
  rowCnt: number
}


