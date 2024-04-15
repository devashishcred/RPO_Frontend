export interface AddRfpProgressionNote {
  id: number,
  idRfpProgress: number,
  notes: string,
  createdBy: number,
  createdByEmployee: string,
  createdDate: Date
  lastModifiedBy: number,
  lastModified: string,
  lastModifiedDate: Date,
}