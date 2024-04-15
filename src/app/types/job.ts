import { Company, CompanyType } from '../types/company';
import { rfpAddress } from '../types/rfpAddress';
import { Contact } from '../types/contact';
import { Employee } from '../types/employee';
import { rfp } from '../types/rfp';
import { Address, AddressType } from './address';
import { borough } from './borough';
import { JobTypes } from '../types/jobTypes';

/**
* This class is used as a jobDTO model for datatable
* @class jobDTO
* @constructor 
*/
export interface jobDTO {
    id: number,
    jobNumber: string,
    status: number,
    idRfpAddress: number,
    rfpAddress: string,
    idBorough: number,
    borough: string,
    houseNumber: string,
    streetNumber: string,
    floorNumber: string,
    apartment: string,
    specialPlace: string,
    block: string,
    lot: string,
    hasLandMarkStatus: boolean,
    hasEnvironmentalRestriction: boolean,
    hasOpenWork: boolean,
    idCompany: number,
    company: string,
    idContact: number,
    contact: string,
    lastModiefiedDate: Date,
    applications: jobApplication,
    jobContactType: number,
    jobContactTypeDescription: string,
    idProjectManager: number,
    projectManager: string,
    idProjectCoordinator: number,
    projectCoordinator: string,
    idSignoffCoordinator: number,
    signoffCoordinator: string,
    startDate: Date,
    endDate: Date
    idJobContactType: number
}

/**
* This class is used as a Job model
* @class Job
* @constructor 
*/
export interface Job {
    jobsTypes: any[],
    jobApplicationTypes: any[]
    borough: borough,
    company: Company,
    contact: Contact,
    contacts: Contact[],
    documents: Document[],
    jobTypes: JobTypes[],
    milestones: JobMilestones[],
    projectCoordinator: teamMember,
    projectManager: teamMember,
    rfp: rfp,
    rfpAddress: rfpAddress
    scopes: JobScope[],
    signoffCoordinator: teamMember,
    tasks: any,
    transmittals: any,
    id: number,
    jobNumber: string,
    idRfpAddress: number,
    idRfp: number,
    idBorough: number,
    houseNumber: string,
    streetNumber: string,
    floorNumber: string,
    apartment: string,
    specialPlace?: string,
    block: string,
    lot: string,
    hasLandMarkStatus: boolean,
    hasEnvironmentalRestriction: boolean,
    hasOpenWork: boolean,
    idCompany: number,
    jobContactType: number,
    idContact: number,
    idProjectManager: number,
    idProjectCoordinator: number,
    idSignoffCoordinator: number,
    startDate: string,
    endDate: string,
    lastModiefiedDate: Date,
    status: number,
    scopeGeneralNotes: string,
    dob: any,
    dot: any,
    violation: any,
    dep: any,
    HasHolidayEmbargo: boolean,
    dobProjectTeam: any,
    dotProjectTeam: any,
    violationProjectTeam: any,
    depProjectTeam: any,
    poNumber: string,
    ocmcNumber: string,
    streetWorkingOn: string,
    streetWorkingFrom: string,
    streetWorkingTo: string,
    lastModifiedByEmployeeName:string,
    itemName?:string,
    projectDescription?:string,
    qbJobName?:string,
    idJobContactType?:any,
    idReferredByCompany: number,
    idReferredByContact: number,
    jobStatusNotes: string
    
}

/**
* This class is used as a JobMilestones model for JOB
* @class JobMilestones
* @constructor 
*/
export interface JobMilestones {
    id: number,
    milestone: Milestone[],
    idRfp: number,
}

/**
* This class is used as a Milestone model
* @class Milestone
* @constructor 
*/
export interface Milestone {
    id: number
    name: string,
    idJob: number,
    value: string,
    status: string,
    isInvoiced: boolean,
    invoicedDate: Date,
    invoiceNumber: number,
    poNumber: string,
    jobMilestoneServices: jobMilestoneServices[],
    lastModified: Date,
    lastModifiedBy: string,
    isVisible: boolean,
    showEditDeleteBtn: boolean,
    milestoneServiceList: any
}

/**
* This class is used as a jobMilestoneServices model
* @class jobMilestoneServices
* @constructor 
*/
export interface jobMilestoneServices {
    id: number,
    idMilestone: number,
    idJobFeeSchedule: number,
    itemName: string
}


/**
* This class is used as a JobScope model
* @class JobScope
* @constructor 
*/
export interface JobScope {
    idJobType: number,
    idJobTypeDesc: number,
    idjobSubType: number,
    serviceGroup: any[],
    tmpServiceItems: any[]
}

/**
* This class is used as a scope model
* @class scope
* @constructor 
*/
export interface scope {
    id: number
    content: string,
    idJob: number,
    lastModified: Date,
    lastModifiedBy: string
}

/**
* This class is used as a teamMember model
* @class teamMember
* @constructor 
*/
export interface teamMember {
    agentCertificates: string,
    city: string,
    documents: string,
    group: string,
    id: number,
    firstName: string,
    lastName: string,
    address1: string,
    address2: string,
    idCity: number,
    zipCode: string,
    workPhone: string,
    workPhoneExt: string,
    mobilePhone: string,
    homePhone: string,
    email: string,
    ssn: string,
    dob: Date,
    startDate: Date,
    finalDate: Date,
    notes: string,
    telephonePassword: string,
    computerPassword: string,
    efillingPassword: string,
    efillingUserName: string,
    idGroup: number,
    employeeEmployeeInfo: number,
    employeeContactInfo: number,
    employeePersonalInfo: number,
    employeeAgentCertificates: number,
    employeeSystemAccessInformation: number,
    employeeUserGroup: number,
    employeeDocuments: number,
    employeeStatus: number,
    jobs: number,
    contacts: number,
    company: number,
    rfp: number,
    tasks: number,
    reports: number,
    referenceLinks: number,
    referenceDocuments: number,
    userGroup: number,
    masters: number
}

/**
* This class is used as a jobContactType model
* @class jobContactType
* @constructor 
*/
export interface jobContactType {
    id: number,
    name: string
}

/**
* This class is used as a jobApplication model
* @class jobApplication
* @constructor 
*/
export interface jobApplication {
    id: number,
    name: string
}

/**
* This class is used as a unitType model
* @class unitType
* @constructor 
*/
export interface unitType {
    id: number,
    desc: string
}