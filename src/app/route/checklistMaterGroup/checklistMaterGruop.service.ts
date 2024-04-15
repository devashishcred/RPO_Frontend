/**
* This class is used as a checklistGroup model
* @class checklistGroup
* @constructor 
*/
export interface checklistGroup {
    id: number,
    name: string,
    type: string,
    displayOrder:number,
    isActive: boolean,
    createdBy: number,
    createdByEmployeeName: string,
    createdDate: Date,
    lastModifiedBy: number,
    lastModifiedByEmployeeName: string,
    lastModifiedDate: Date
  }