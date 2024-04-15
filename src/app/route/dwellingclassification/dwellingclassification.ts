/**
 * This class is used as a DwellingClassification model
 * @class DwellingClassification
 * @constructor
 */
export interface DwellingClassification {
  code: string;
  id: number,
  description: string,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date,
}

