/**
* This class is used as a Review model
* @class Review
* @constructor 
*/

export interface Review {
    id: number,
    idReviewer: number,
    idRfp: number,
    reviewer: string
    createdBy: number,
    createdByEmployeeName: string,
    createdDate: Date,
    lastModifiedBy: number,
    lastModifiedByEmployeeName: string,
    lastModifiedDate: Date
}