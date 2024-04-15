/**
 * This class is used as a ApplicationType model
 * @class ApplicationType
 * @constructor
 */
export interface ApplicationType {
  code: string,
  documentName: string,

  id: number,
  createdBy: string,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: string,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date,
  description: string,
  idParent: number,
  parent: string,
  content: string
}
