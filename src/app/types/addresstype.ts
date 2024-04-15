/**
*  This class is used as a AddressType model
* @class AddressType
*/
export interface AddressType {
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

/**
*  This class is used as a data table model
* @class AddressTypeDTO
*/
export interface AddressTypeDTO{
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