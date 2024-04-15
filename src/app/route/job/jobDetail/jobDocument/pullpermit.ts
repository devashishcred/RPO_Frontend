/**
* This class is used as a Pullpermit model
* @class Pullpermit
* @constructor 
*/
export interface Pullpermit {
  numberDocType: any,
  detailUrl: any,
  history: any,
  seqNo: any,
  firstIssueDate: Date,
  lastIssueDate: Date,
  status: string,
  applicant: any
}


export interface PullPermitRequest {
  idJob: number,
  idJobDocument: number,
  detailUrl: any
}

export interface PW517Doc {
  id: number,
  idDocument: number,
  idJob: number,
  idJobDocumentType: string,
  IdJobchecklistItemDetails:number;
  code: string,
  documentName: string,
  forDescription: string,
  createSupportDocument: boolean,
  ahvReferenceNumber: string,
  applicant: number,
  application: number,
  idWorkPermit: number,
  efilingDates: any,
  for: string,
  fridayDates: string,
  fridayEndTime: any,
  fridayStartTime: any,
  isSameAsWeekday: true
  mainAHVWorkContact: number
  mondayDates: string
  mondayEndTime: any
  mondayStartTime: any
  numberOfDays: number
  opg200: boolean
  opgCrane: boolean
  opgDemo: boolean
  opgEnclosed: boolean
  reasonForVariance: string
  saturdayDates: string
  saturdayEndTime: any
  saturdayStartTime: any
  startDate: Date
  sundayDates: string
  sundayEndTime: any
  sundayStartTime: any
  thursdayDates: string
  thursdayEndTime: any
  thursdayStartTime: any
  tuesdayDates: string
  tuesdayEndTime: any
  tuesdayStartTime: any
  wednesdayDates: string
  wednesdayEndTime: any
  wednesdayStartTime: any
  weekdayDescription: string
  weekendDescription: string,
  idJobSiteContact: number,
  issuedDate: string,
  submittedDate: string

}