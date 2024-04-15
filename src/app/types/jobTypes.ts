
export interface JobTypes{  
  id:number,
  description:string,
  number:number,
  idParent:number,
  children:JobSubType[],
  checked:string
}

export interface JobSubType{
  id:number,
  description:string,
  number:number,
  idParent:number,
  workTypes:WorkType[]
}

export interface WorkType{
  id:number,
  description:string,
  number:string
}
