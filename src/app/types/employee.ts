/**
* This class is used as a DocumentType model for uploading documents
* @class DocumentType
* @constructor 
*/
export interface DocumentType {
  id?: number,
  name: string
}

/**
* This class is used as a AgentCertificate model
* @class class
* @constructor 
*/
export interface AgentCertificate {
  id: number,
  documentType: DocumentType,
  idDocumentType: number,
  numberId: number,
  expirationDate: string,
  pin: string
}

/**
* This class is used as a EmployeeDocument model
* @class EmployeeDocument
* @constructor 
*/
export interface EmployeeDocument {
  id?: number,
  name: string,
  content: any
}

/**
* This class is used as a Employee model
* @class Employee
* @constructor 
*/
export interface Employee {
  id?: number,
  firstName: string,
  lastName: string,
  address1: string,
  address2: string,
  city?: string,
  idCity?: number,
  state?: string,
  idState?: number,
  zipCode: string,
  workPhone: string,
  workPhoneExt: string,
  mobilePhone: string,
  homePhone: string,
  email: string,
  ssn: string,
  dob: string,
  startDate?: string,
  finalDate?: string,
  notes: string,
  telephonePassword: string,
  computerPassword: string,
  efillingPassword: string,
  efillingUserName: string,
  qbEmployeeName: string,
  group: string,
  idGroup: number,
  isActive: boolean,
  status: string,
  applicationPassword: string,
  agentCertificates: AgentCertificate[],
  documents: EmployeeDocument[],
  documentsToDelete: number[],
  loginPassword: string,
  emergencyContactName: string,
  emergencyContactNumber: number,
  lockScreenPassword: string,
  appleId: string,
  applePassword: string,
  allergyType: number,
  allergyDescription: string,
  permissions: any

}

/**
* This class is used as a EmployeeGrants model
* @class EmployeeGrants
* @constructor 
*/
export interface EmployeeGrants {
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