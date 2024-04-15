/**
*  This class is used as a AllViolationAdvanceSearch model
* @class AllViolationAdvanceSearch
*/
export interface AllViolationAdvanceSearch {
    idCompany: number,
    jobNumber: number,
    summonsNumber: string,
    createdDateFrom: Date,
    createdDateTo: Date,
    hearingDateFrom: Date,
    hearingDateTo: Date,
    violationStatus: string,
    isOpenCOC: boolean
}

/**
*  This class is used as a PermitsExpiry model
* @class PermitsExpiry
*/
export interface PermitsExpiry {
    jobNumber: string,
    idJobType: number,
    status: string,
    PermitCode: string,
    idCompany: number,
    idContact: number,
    expiresFromDate: Date,
    expiresToDate: Date
}