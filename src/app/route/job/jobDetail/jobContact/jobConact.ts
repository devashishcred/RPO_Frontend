/**
*  This class is used as a LicenseTypes model
* @class LicenseTypes
*/
export interface JobContact {
    id: number
    idJob: number
    idCompany: number
    idContact: number
    idJobContactType: number
    idAddress: number
    isBilling: boolean
    isMainCompany: boolean,
    hasJobAccess: boolean,
    isRegisteredCustomer: boolean,
    jobContactJobContactGroups:any
    
}

