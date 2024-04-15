/**
 *  This class is used as a StructureOccupancyCategories model
 * @class StructureOccupancyCategories
 */
export interface StructureOccupancyCategories {

  id: number,
  name: string,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date,
  code: string
  description: string;
}

