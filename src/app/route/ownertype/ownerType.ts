/**
*  This class is used as a OwnerType model
* @class OwnerType
*/
export interface OwnerType {
    id: number,
    name: string,
    displayOrder: number,
    createdBy: number,
    createdByEmployeeName: string,
    createdDate: Date,
    lastModifiedBy: number,
    lastModifiedByEmployeeName: string,
    lastModifiedDate: Date,
    isSecondOfficerRequire:boolean
}


/**
*  This class is used as a data table model
* @class OwnerTypeDTO
*/
export interface OwnerTypeDTO{
    id: number,
    name: string,
    displayOrder: number,
    createdBy: number,
    createdByEmployeeName: string,
    createdDate: Date,
    lastModifiedBy: number,
    lastModifiedByEmployeeName: string,
    lastModifiedDate: Date
}