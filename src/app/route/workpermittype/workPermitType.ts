/**
* This class is used as a WorkPermitType model
* @class WorkPermitType
* @constructor 
*/
export interface WorkPermitType {
    id: number,
    createdBy: number,
    createdByEmployeeName: string,
    createdDate: Date,
    lastModifiedBy: number,
    lastModifiedByEmployeeName: string,
    lastModifiedDate: Date,
    description: string,
    code: string,
    cost: string,
    idJobApplicationType: number,
    jobApplicationType: string,
    idJobType: number,
    jobType: string,
    content: string
}
