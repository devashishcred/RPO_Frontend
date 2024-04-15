import { rfpAddress } from './rfpAddress';
import { borough } from './borough';
import { Company } from './company';
import { Contact } from './contact';
import { ProjectDetails } from './projectDetails';
import { ScopeReview } from './scopereview';
import { proposalReview } from './proposalReview';



export interface rfp {
  id: number,
  idRfpAddress: number,
  idBorough: number,
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
  idContact: number,
  address1: string,
  address2: string,
  city: string,
  idState: number,
  zipCode: string,
  phone: string,
  email: string,
  idReferredByCompany: number,
  idReferredByContact: number,
  status: number,
  rfpNumber: string,
  lastUpdatedStep: number,
  completedStep: number,
  idRfpStatus: any,
  projectDetails: ProjectDetails[],
  scopeReview: ScopeReview,
  proposalReview: proposalReview,
  createdBy:string,
  rfpAddress:rfpAddress,
  rfpDocuments:any,
  idClientAddress:any,
  projectDescription?:any,
  documentsToDelete:number[]
}

export interface rfpDTO {
  id: number,
  houseNumber: string,
  streetNumber: string,
  floorNumber: string,
  apartment: string,
  rfpNumber: string,
  lastModifiedDate: Date,
  company: String,
  cost: string,
  lastUpdatedStep: number,
  createdBy:string,
  specialPlace: string,
}