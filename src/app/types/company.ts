import { City } from './city';
import { Address, AddressType } from './address'
import { ContactLicense } from "./contactLicense";
import { CompanyLicense } from './companyType';

export interface CompanyType {
  id?: number,
  itemName: string,
  children: CompanyType[],
  idParent: number
}


export interface CompanyDocuments {
  id?: number,
  name: string,
  content: any
}

export interface CompanyDTO {
  id?: number,
  name: string,
  companyType: CompanyType,
  trackingNumber: number,
  ibmNumber: number,
  taxIdNumber: number,
  hicNumber: string,
  hicExpiry: number,
  specialInspectionAgencyNumber: number,
  specialInspectionAgencyExpiry: Date,
  insuranceWorkCompensation: Date,
  insuranceDisability: Date,
  insuranceGeneralLiability: Date,
  insuranceObstructionBond: Date,
  notes: string,
  addressType: AddressType,
  address1: string,
  address2: string,
  city: City,
  idCity: number,
  state: City,
  idState: number,
  zipCode: string,
  phone: string
}

export interface Company {
  lastModifiedByEmployeeName: string;
  lastModifiedDate: any;
  id?: number,
  name: string,
  idCompanyType: number,
  idCompanyTypes: any,
  companyTypes: any[],
  trackingNumber: number,
  trackingExpiry: string,
  ibmNumber: string,
  hicNumber: string,
  hicExpiry: string,
  specialInspectionAgencyNumber: number,
  specialInspectionAgencyExpiry: string,
  taxIdNumber: string,
  insuranceWorkCompensation: string,
  insuranceDisability: string,
  insuranceGeneralLiability: string,
  insuranceObstructionBond: string,
  notes: string,
  addresses: Address[],
  url: string,
  ctLicenseNumber: number,
  ctExpirationDate: string
  itemName?: string
  dotInsuranceGeneralLiability: string,
  dotInsuranceWorkCompensation: string,
  documents: CompanyDocuments[],
  documentsToDelete: number[],
  companyLicenses: CompanyLicense[]
  responsibility: any
  idResponsibility: number,
  responsibilityName: string,
  emailAddress: any,
  emailPassword: any
}

export interface CompanyItem {
  id: number,
  name: string
}