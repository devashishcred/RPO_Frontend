import {JobTypes,WorkType} from "./jobTypes";

/**
* This class is used as a ProjectDetails model
* @class ProjectDetails
* @constructor 
*/
export interface ProjectDetails {
  id: number,
  idJobType: number,
  jobType:JobTypes,
  workTypeNotes: WorkTypeNotes[],
  workDescription: string,
  arePlansNotPrepared: boolean,
  arePlansCompleted: boolean,
  isApproved: boolean,
  isDisaproved: boolean,
  isPermitted: boolean,
  idRfp: number
}


/**
* This class is used as a WorkTypeNotes model
* @class WorkTypeNotes
* @constructor 
*/
export interface WorkTypeNotes {
      id: number,
      idWorkTy: number,
      workType:WorkType,
      note: string, 
      idProjectDetail: number  
}
