/**
*  This class is used as a Sentvia model
* @class Sentvia
*/
export interface Sentvia {
  id: number,
  name: string,
  defaultCC: any,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date,
  isSendEmail:boolean
}