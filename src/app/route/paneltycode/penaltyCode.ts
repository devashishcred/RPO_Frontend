
/**
*  This class is used as a PenaltyCode model
* @class PenaltyCode
*/
export interface PenaltyCode {
  id: number,
  paneltyCode: string,
  codeSection: string,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: string,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date,
  description: string
}
