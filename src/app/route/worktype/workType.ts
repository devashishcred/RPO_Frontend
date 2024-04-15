/**
* This class is used as a WorkTypeDTO model
* @class WorkTypeDTO
* @constructor 
*/
export interface WorkTypeDTO {
  id: number,
  name: string,
  idParent: number,
  idRfpJobType: number,
  rfpJobType: string,
  idRfpSubJobType: number,
  rfpSubJobType: string,
  idRfpSubJobTypeCategory: number,
  rfpSubJobTypeCategory: string,
  idRfpWorkTypeCategory: number,
  rfpServiceGroup: string,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date,
  level: number,
  serviceDescription: string,
  appendWorkDescription: boolean,
  customServiceDescription: boolean,
  additionalUnitPrice: number,
  cost: any,
  idCostType: number,
  costType: number,
  rfpJobTypeCostRanges: RfpJobTypeCostRanges[],
  rfpJobTypeCumulativeCosts: any
}

/**
* This class is used as a RfpJobTypeCostRanges model
* @class RfpJobTypeCostRanges
* @constructor 
*/
export interface RfpJobTypeCostRanges {
  id: number,
  idRfpJobType: number,
  minimumQuantity:number,
  maximumQuantity:number,
  rangeCost: number
}

/**
* This class is used as a RfpJobTypeCumulativeCosts model
* @class RfpJobTypeCumulativeCosts
* @constructor 
*/
export interface RfpJobTypeCumulativeCosts {
  id: number,
  idRfpJobType: number,
  quantity: number,
  cumulativeCost: number
}
