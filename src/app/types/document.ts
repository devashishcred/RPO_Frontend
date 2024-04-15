
export interface Document {
  id?: number,
  name: string,
  keywords: string,
  description: string,
  file: any,
  fileName: string,
  content: any
}
export interface FieldValue{
  [key: string]: any
}



export interface ModelTosent {
  id:number;
  idJob: number;
  idDocument: number;
  documentName: string;
  jobDocumentFields: jobDocumentFields[];
  idJobApplication?:number
  IdJobchecklistItemDetails?:number

}
export interface jobDocumentFields {
  idDocumentField: number;
  value: any;
}





