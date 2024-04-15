import {Contact} from './contact';

/**
* This class is used as a ScopeReview model
* @class ScopeReview
* @constructor 
*/
export interface ScopeReview{
	id:number
    description: string,
    contactsCc:any,
    contactsCcList:any
}