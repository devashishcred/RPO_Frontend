import { State } from './state';

export interface AddressType {
  id: number,
  name: string
}

export interface ResponsibilityType {
  id: number,
  name: string
}

export interface Address {
  streetLegalWidth: string;
  faxNumber: string;
  idMultipleDwellingClassification: boolean;
  isOcupancyClassification20082014: boolean;
  idBorough: boolean;
  freshwaterWetlandsMapCheck: boolean;
  specialFloodHazardAreaCheck: boolean;
  coastalErosionHazardAreaMapCheck: boolean;
  isLandmark: boolean;
  isLittleE: boolean;
  tidalWetlandsMapCheck: any;
  houseNumber: string;
  street: string;
  lot: string;

  id: number,
  idAddressType: number,
  addressType: AddressType,
  address1: string,
  address2: string,
  idCity: number,
  city: string,
  zipCode: string,
  phone: string,
  idState: number,
  state: string,
  isMainAddress: boolean
  binNumber: string;
}


export interface AddressDTO {
  id: number,
  idBorough: number,
  borough: string,
  houseNumber: string,
  street: string,
  zipCode: number,
  block: string,
  lot: string,
  binNumber: string,
  comunityBoardNumber: string,
  zoneDistrict: string,
  overlay: string,
  specialDistrict: string,
  map: string,
  idAddressType: number,
  addressType: string,
  idCompany: number,
  company: string,
  nonProfit: false,
  idOwnerContact: string,
  ownerContact: string,
  title: string,
  idOccupancyClassification: string,
  occupancyClassification: string,
  isOcupancyClassification20082014: false,
  idConstructionClassification: string,
  constructionClassification: string,
  isConstructionClassification20082014: false,
  idMultipleDwellingClassification: string,
  multipleDwellingClassification: string,
  idPrimaryStructuralSystem: string,
  primaryStructuralSystem: string,
  idStructureOccupancyCategory: string,
  structureOccupancyCategory: string,
  idSeismicDesignCategory: string,
  seismicDesignCategory: string,
  stories: string,
  height: string,
  feet: string,
  dwellingUnits: string,
  grossArea: string,
  streetLegalWidth: string,
  isLandmark: boolean,
  isLittleE: boolean,
  tidalWetlandsMapCheck: boolean,
  freshwaterWetlandsMapCheck: boolean,
  coastalErosionHazardAreaMapCheck: boolean,
  specialFloodHazardAreaCheck: boolean,
  createdBy: number,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedDate: Date,
  createdByEmployeeName: string,
  lastModifiedByEmployeeName: string
}