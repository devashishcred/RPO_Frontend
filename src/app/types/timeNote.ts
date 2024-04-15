export interface TimeNote {
    id?: number,
    idJob:number,
    jobBillingType: number,
    idJobFeeSchedule: number,
    idRfpJobType:number,
    progressNotes: string,
    timeNoteDate: string,
    timeHours: string,
    timeMinutes:string,
    fromProgressionNote:boolean
}