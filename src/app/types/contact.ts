import { Address } from "./address";
import { Prefix, Suffix } from "./prefix";
import { ContactLicense } from "./contactLicense";

export interface ContactDocument {
  id?: number;
  name: string;
  content: any;
}

export interface CompanyLicenseType {
  id: number;
  name: string;
}

export interface Contact {
  lastModifiedDate: any;
  lastModifiedByEmployeeName: string;
  id: number;
  image: any;
  isActive?: any;
  personalType: string;
  idPrefix: number;
  idSuffix: number;
  suffix: Suffix;
  prefix: Prefix;
  firstName: string;
  middleName: string;
  lastName: string;
  idCompany: number;
  company: string;
  idContactTitle: number;
  contactTitle: string;
  addresses: Address[];
  birthDate: string;
  workPhone: string;
  workPhoneExt: string;
  mobilePhone: string;
  otherPhone: string;
  email: string;
  contactLicenses: ContactLicense[];
  notes: string;
  imageAux: string;
  documents: ContactDocument[];
  documentsToDelete: number[];
  imageThumbUrl: string;
  isPrimaryCompanyAddress?: boolean;
  idPrimaryCompanyAddress?: boolean;
  cuI_Invitatuionstatus?: number;
  cuiInvitationStatus?: number;
}

export interface ContactDTO {
  id: number;
  firstName: string;
  lastName: string;
  idCompany: number;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  workPhone: string;
  mobilePhone: string;
  email: string;
  license: string;
  licenseNumber: string;
  notes: string;
}

export interface IInviteContactRequest {
  id: number;
  email: string;
  isActive: boolean;
  name: string;
  personalType: number;
  isCompany: number;
}
