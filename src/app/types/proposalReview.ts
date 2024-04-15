/**
* This class is used as a proposalReview model
* @class proposalReview
* @constructor 
*/
export interface proposalReview {
    id: number,
    idRpf: number,
    cost: number,
    idSignature:number
    milestones: Milestones[],
    rfpProposalReviewList: RfpProposalReviewList[]
    isSignatureNewPage:boolean
}

/**
* This class is used as a proposalReviewSections model
* @class proposalReviewSections
* @constructor 
*/
export interface proposalReviewSections {
    id: number,
    idProposalReview: number,
    type: number,
    content: string
}

/**
* This class is used as a RfpProposalReviewList model
* @class RfpProposalReviewList
* @constructor 
*/
export interface RfpProposalReviewList {
    id: number,
    idRfp: number,
    content: string,
    idVerbiage: number,
    verbiages: string,
    displayOrder: number
}

/**
* This class is used as a Milestones model
* @class Milestones
* @constructor 
*/
export interface Milestones {
    id: number,
    idRfp: number,
    name: string,
    value: number,
    milestoneService: milestoneServiceList
}

/**
* This class is used as a milestoneServiceList model
* @class milestoneServiceList
* @constructor 
*/
export interface milestoneServiceList {
    id: number,
    idMilestone: number,
    idRfpFeeSchedule: number,
    itemName: string
}
