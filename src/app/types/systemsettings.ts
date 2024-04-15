/**
*  This class is used as a SystemField model
* @class SystemField
*/
export interface SystemField{
    id: number,
    name: string,
    createdBy: string,
    createdByEmployeeName: string,
    createdDate: Date,
    lastModifiedBy: string,
    lastModified: Date,
    lastModifiedDate: Date,
    value: any
}