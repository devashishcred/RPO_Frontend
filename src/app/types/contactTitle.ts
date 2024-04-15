/**
*  This class is used as a ContactTitle model
* @class ContactTitle
*/
export interface ContactTitle {
  id: number,
  name: string,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date
}

/**
*  This class is used as a data-table model
* @class ContactTitleDTO
*/
export interface ContactTitleDTO {
  id: number,
  name: string,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date
}