
export interface JobPermit {
  id: number,
  idJobWorkType?: number,
  idJob: number,
  idJobApplication: number,
  applicationType: any,
  applicationNumber: any,
  code: string,
  estimatedCost: any,
  filed: Date,
  issued: Date,
  expires: Date,
  signedOff: Date,
  withdrawn: Date,
  idResponsiblity: number,
  isPersonResponsible: boolean,
  idContactResponsible: number,
  companyResponsible: string,
  workDescription: string,
  permitNumber: string,
  previousPermitNumber: string,
  renewalFee: any,
  streetWorkingOn: string,
  streetTo: string,
  streetFrom: string,
  permitType: string,
  forPurposeOf: String,
  equipmentType: String,
  plumbingSignedOff: Date,
  constructionSignedOff: Date
  finalElevator: Date,
  tempElevator: Date,
  permittee: string,
  isPGL: boolean
  hasSuperintendentofconstruction:boolean,
  hasSiteSafetyCoordinator:boolean,
  hasSiteSafetyManager:boolean
}


