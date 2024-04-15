/**
 * This class is used as a checklistGroup model
 * @class checklistGroup
 * @constructor
 */
export interface checklistItem {
  id: number;
  name: string;
  idCheckListGroup: number;
  idJobApplicationTypes: string;
  idJobWorkTypes: string;
  isActive: boolean;
  isUserfillable: boolean;
  referenceNote: string;
  externalReferenceLink: string;
  internalReferenceLink: string;
  idReferenceDocument: string;
  jobApplicationTypes: any;
  jobWorkTypes: any;
  createdBy: number;
  IdCreateFormDocument: string;
  IdUploadFormDocument: string;
  createdByEmployeeName: string;
  createdDate: Date;
  lastModifiedBy: number;
  lastModifiedByEmployeeName: string;
  lastModifiedDate: Date;
}
export interface checklistItemAdd{
  IdChecklistAddressProperty:any,
  Value: string,
    IsActive:boolean
}
export const ChecklistAddressProperty = [
  { IdChecklistAddressProperty: 1,  name: "Coastal erison Hazard Area Map check"},
  { IdChecklistAddressProperty: 2, name: "Fresh Wetlands Map check" },
  { IdChecklistAddressProperty: 3, name: "Owner Type" },
  { IdChecklistAddressProperty: 4, name: "Special District" },
  { IdChecklistAddressProperty: 5, name: "Special Flood Hazard Area check" },
  { IdChecklistAddressProperty: 6, name: "SRO Restricted" },
  { IdChecklistAddressProperty: 7, name: "Tidal Withlands mapcheck" },
  { IdChecklistAddressProperty: 8, name: "Environmental Restrictions" },
  { IdChecklistAddressProperty: 9, name: "LandMark" },
  { IdChecklistAddressProperty: 10, name: "Calendard" },
  { IdChecklistAddressProperty: 11, name: "Loft Law" },
];


export interface AddressProperty {
  Coastal_erison_Hazard_Area_Map_check: any;
  Fresh_Wetlands_Map_check: any;
  Owner_Type: any;
  Special_District: any;
  Special_Flood_Hazard_Area_check: any;
  SRO_Restricted: any;
  Tidal_Withlands_mapcheck: any
  Environmental_Restrictions: any;
  LandMark:any;
  Calendard:any
  Loft_Law: any;
}
