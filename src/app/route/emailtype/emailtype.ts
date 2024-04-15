/**
*  This class is used as a EmailType model
* @class EmailType
*/
export interface EmailType {
  id: number,
  name: string,
  subject: string,
  emailBody: string,
  description: string,
  selectedDefaultCC?: any
  defaultCC?:any
  isRfp: boolean,
  isCompany: boolean,
  isJob: boolean,
  isContact: boolean,
  createdBy: number,
  createdByEmployeeName:string ,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date
}