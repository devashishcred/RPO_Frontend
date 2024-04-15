export interface AddJobProgressionNote {
  id: number,
  idJob: number,
  notes: string,
  createdBy: number,
  createdByEmployee: string,
  createdDate: Date
  lastModifiedBy: number,
  lastModified: string,
  lastModifiedDate: Date,
}