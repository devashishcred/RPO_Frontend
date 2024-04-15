export interface JobApplication {
  id?: number,
  idJob: number,
  applicationNumber: string,
  idJobApplicationType: number,
  jobApplicationName: string,
  floorWorking: string,
  status: string,
  statusId: number,
  for: string,
  streetWorkingOn: string,
  streetFrom: string,
  streetTo: string
}


export interface JobApplicationStatus {
  id?: number,
  description: string
}


export interface applicationType {
  id: number,
  description: string,
  content: string,
  number: string,
  idParent: number
  jobWorkTypes: any[]

}

export interface workTypes {
  id: number,
  description: string,
  itemName: string,
  code: string
}

export interface Application {
  streetWorkingOn: any;
  streetFrom: any;
  streetTo: any;
  applicationNote: string;
  jobWorkPermitHistories: any[];
  id?: number
  signOff?: boolean
  idJob: number
  applicationNumber?: number
  applicationFor: string
  floorWorking: string
  idJobApplicationType: number
  idApplicationStatus: number
  lastModifiedDate: Date,
  jobApplicationStatus: string,
  idJobWorkType: string,
  idJobWorkTypes?: any
  jobApplicationTypeName: string
  isHighRise?: boolean
}

export interface DepApplication {
  id?: number
  idJob: number
  applicationNumber?: number
  applicationFor: string
  floorWorking: string
  idJobApplicationType: number
  jobApplicationTypeName: string
  idApplicationStatus: number,
  status: string,
  streetWorkingOn: string,
  streetFrom: string,
  streetTo: string,
  lastModifiedDate: Date,
  startDate: any,
  endDate: any,
  isIncludeSunday: boolean,
  isIncludeSaturday: boolean,
  isIncludeHoliday: boolean,
  totalDays: any,
  waterCost: any
  hydrantCost: any,
  totalCost: any,
  description: any,
  purpose: any,
  modelNumber: string,
  serialNumber: string,
  manufacturer: string
}

export interface Permit {
  id?: number
  appId: number
}
