/**
* This class is used as a model for DEP cost setting
* @class DepCostSetting
* @constructor 
*/
export interface DepCostSetting {
  id: number,
  name: string,
  description: string,
  price: number,
  numberOfDays: number,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date,
}

