import { Injectable, ModuleWithProviders } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterModule, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { CompanyComponent } from './route/company/company.component';
import { ContactComponent } from './route/contact/contact.component';
import { TaskComponent } from './route/task/task.component';
import { EmployeeComponent } from './route/employee/employee.component';
import { HomeComponent } from './route/home/home.component';
import { JobComponent } from './route/job/job.component';
import { JobApplicationDobComponent } from './route/job/jobDetail/jobApplicationDob/jobApplicationDob.component';
import { JobContactComponent } from './route/job/jobDetail/jobContact/jobContact.component';
import { JobDocumentComponent } from './route/job/jobDetail/jobDocument/jobDocument.component';
import { JobTransmittalComponent } from './route/job/jobDetail/jobTransmittal/jobTransmittal.component';
import { JobTaskComponent } from './route/job/jobDetail/jobTask/jobTask.component';
import { JobCheckListComponent } from './route/job/jobDetail/jobCheckList/jobCheckList.component';
import { JobHistoryComponent } from './route/job/jobDetail/jobHistory/jobHistory.component';
import { RelatedJobComponent } from './route/job/jobDetail/relatedJob/relatedJob.component';
import { TimeNotesComponent } from './route/job/jobDetail/timeNotes/timeNotes.component';
import { JobScopeComponent } from './route/job/jobDetail/jobScope/jobScope.component';
import { JobMilestoneComponent } from './route/job/jobDetail/jobMilestone/jobMilestone.component';
import { DocumentComponent } from './route/reference/document/document.component';
import { RfpComponent } from './route/rfp/rfp.component';
import { projectDetailsComponent } from './route/addRfp/projectDetails/projectDetails.component';
import { SiteInformationComponent } from './route/addRfp/siteInformation/siteInformation.component';
import { scopeReviewComponent } from './route/addRfp/scopeReview/scopeReview.component';
import { rfpSubmitComponent } from './route/addRfp/rfpSubmit/rfpSubmit.component';
import { proposalReviewComponent } from './route/addRfp/proposalReview/proposalReview.component';
import { LoginComponent } from './route/login/login.component';
import { UserGroupComponent } from './route/userGroup/userGroup.component';
import { VerbiagesComponent } from './route/verbiages/verbiages.component';
import { CompanyDetailComponent } from './route/company/companyDetail/companyDetail.component';
import { ContactDetailComponent } from './route/contact/contactDetail/contactDetail.component';
import { JobDetailComponent } from './route/job/jobDetail/jobDetail.component';
import { EmailHistoryComponent } from './route/rfp/emailHistory/emailHistory.component';
import { PendingChangesGuard } from './components/appSaveLeave/guard';
import { AddresstypeComponent } from './route/addresstype/addresstype.component';
import { ContactTitleComponent } from './route/contacttitle/contacttitle.component';
import { SentviaComponent } from './route/sentvia/sentvia.component';
import { DwellingClassificationComponent } from './route/dwellingclassification/dwellingclassification.component';
import { OccupancyClassificationComponent } from './route/occupancyclassifications/occupancyclassifications.component';
import { CompanyTypesComponent } from './route/companytypes/companytypes.component';
import { LicenseTypesComponent } from './route/licensetypes/licensetypes.component';
import { DocumentTypesComponent } from './route/documenttypes/documenttypes.component';
import { EmailTypeComponent } from './route/emailtype/emailtype.component';
import { JobContactTypesComponent } from './route/jobcontacttypes/jobcontacttypes.component';
import { JobTimenoteCategoriesComponent } from './route/jobtimenotecategories/jobtimenotecategories.component';
import { SeismicDesignCategoriesComponent } from './route/seismicdesigncategories/seismicdesigncategories.component';
import { StructureOccupancyCategoriesComponent } from './route/structureoccupancycategories/structureoccupancycategories.component';
import { CompanyTaxTypesComponent } from './route/companytaxtypes/companytaxtypes.component';
import { ConstructionClassificationsComponent } from './route/constructionclassifications/constructionclassifications.component';
import { PrimaryStructuralSystemsComponent } from './route/primarystructuralsystems/primarystructuralsystems.component';
import { StatesComponent } from './route/states/states.component';
import { AddressMasterComponent } from './route/addressmaster/addressmaster.component';
import { WorkTypeComponent } from './route/worktype/workType.component';
import { JobTypeComponent } from './route/jobtype/jobType.component';
import { SubJobTypeCategoryComponent } from './route/subjobtypecategory/subjobtypecategory.component';
import { NotificationComponent } from './route/notification/notification.component';
import { RfpSubJobTypeComponent } from './route/rfpsubjobtype/rfpsubjobtype.component';
import { WorkTypeCategoryComponent } from './route/worktypecategory/worktypecategory.component';
import { TaskTypeComponent } from './route/taskType/taskType.component';
import { SystemSettingsComponent } from './route/systemSettings/systemsettings.component';

import { JobViolationComponent } from './route/job/jobDetail/jobViolation/jobViolation.component';
import { PaneltycodeComponent } from './route/paneltycode/paneltycode.component';
import { SuffixComponent } from './route/suffix/suffix.component';
import { PrefixComponent } from './route/prefix/prefix.component';
import { JobApplicationDotComponent } from './route/job/jobDetail/jobApplicationDot/jobApplicationDot.component';
import { JobApplicationDepComponent } from './route/job/jobDetail/jobApplicationDep/jobApplicationDep.component';


// Holiday Calendar
import { HolidayCalendarComponent } from './route/holidaycalendar/holidayCalendar.component'

// DEP COST SETTING
import { DepCostSettingComponent } from './route/depcostsetting/depCostSetting.component'

import { ApplicationTypeComponent } from './route/applicationtype/applicationType.component'
import { DocumentMasterComponent } from './route/documentmaster/documentmaster.component'
import { WorkPermitTypeComponent } from './route/workpermittype/workPermitType.component'

//DOB PENALTY
import { DobPenaltyComponent } from './route/dobPenalty/dobPenalty.component';

//FDNY PENALTY
import { FdnyPenaltyComponent } from './route/fdnyPenalty/fdnyPenalty.component';

//DOT PENALTY
import { DotPenaltyComponent } from './route/dotPenalty/dotPenalty.component';

//DOHMH PENALTY
import { DohmhPenaltyComponent } from './route/dohmhPenalty/dohmhPenalty.component';

//DEP PENALTY
import { DepNoiseCodePenaltyComponent } from './route/depNoiseCodePenalty/depNoiseCodePenalty.component';

//OWNER TYPE
import { OwnertypeComponent } from './route/ownertype/ownertype.component';

// reports
import { AllViolationReportComponent } from './route/report/allviolationreport/allViolationReport.component';
import { DobPermitExpiryReportComponent } from './route/report/dobpermitexpiryreport/dobPermitExpiryReport.component';
import { GCInsuranceReportComponent } from './route/report/gcInsuranceExpiry/gcInsurance.component';
import { RfpReportComponent } from './route/report/rfpReport/rfpReport.component';
import { CompletedScopeBillingPointReportComponent } from './route/report/completedScopeBillingPoint/completedScopeBillingPoint.component';
import { ClosedJobOpenBillingPointReportComponent } from './route/report/closedJobOpenBillingPoint/closedJobOpenBillingPointReport.component';
import { ApplicationStatusComponent } from './route/report/applicationStatus/applicationStatus.component';
import { AfterHourVarianceReportComponent } from './route/report/ahvReport/ahvReport.component';
import { ContactLicenseExpiryReportComponent } from './route/report/contactLicenseExpiry/contactLicenseExpiry.component';
import { OverAllPermitExpiryForJobsComponent } from './route/report/overAllPermitExpiryForJobs/overAllPermitExpiry.component';
import { unsyncTimenoteReportComponent } from './route/report/timenotesReport/unsyncTimenote.component';
import { CompanyLicenseTypesComponent } from './route/companyLicensetypes/companyLicensetypes.component';
import { ChecklistMasterGroupComponent } from './route/checklistMaterGroup/checklist-master-group/checklist-master-group.component';
import { ChecklistItemMasterComponent } from './route/checklistItemMaster/checklist-item-master/checklist-item-master.component';
import { ChecklistComponent } from './route/checklist/checklist/checklist.component';
import { DummyComponent } from './route/dummy/dummy.component';
import { DashboardComponent } from './route/customer/dashboard/dashboard.component';
import { MyaccountComponent } from './route/customer/myaccount/myaccount.component';
import { ForgotPasswordComponent } from './route/customer/forgot-password/forgot-password.component';
import { SetPasswordComponent } from './route/customer/set-password/set-password.component';
import { SignupComponent } from './route/customer/signup/signup.component';
import { CustomerPermissionComponent } from './route/customer/customer-permission/customer-permission.component';
import { NewsLetterComponent } from './route/news-letter/news-letter.component';
import { TermsAndConditionsComponent } from './route/terms-and-conditions/terms-and-conditions.component';
import { PrivacyPolicyComponent } from './route/privacy-policy/privacy-policy.component';
import { TrademarkGuidelineComponent } from './route/trademark-guideline/trademark-guideline.component';

@Injectable()
export class CanActivateAuth implements CanActivate {
    constructor(private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        const result = !!localStorage.getItem('auth')
        if (!result)
            this.router.navigate(['login'])
        return result
    }
}

@Injectable()
export class CanActivateNotCustomerAuth implements CanActivate {
    constructor(private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        const result = !!localStorage.getItem('auth')
        const resultCustomer = localStorage.getItem('isCustomerLoggedIn');
        if (!result){
            this.router.navigate(['login'])
        }
        else{
            console.log(resultCustomer)
            if (resultCustomer === 'true')
            this.router.navigate(['customer-dashboard'])
        }
        return result
    }
}

@Injectable()
export class CanActivateCustomerAuth implements CanActivate {
    constructor(private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        const result = !!localStorage.getItem('auth')
        const resultCustomer = localStorage.getItem('isCustomerLoggedIn');
        console.log(resultCustomer);
        if (resultCustomer === 'false'){
            this.router.navigate(['home'])
        }
        if (!result){
            this.router.navigate(['login'])
        }

        return true;
    }
}

export const APP_ROUTING: ModuleWithProviders<any> = RouterModule.forRoot([
    { path: '', redirectTo: 'home', pathMatch: 'full', canActivate: [CanActivateNotCustomerAuth] },
    { path: 'login', component: LoginComponent },
    { path: 'customer-login', component: LoginComponent },
    { path: 'set-password', component: SetPasswordComponent},
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'customer-signup', component: SignupComponent },



    { path: 'home', component: HomeComponent, canActivate: [CanActivateNotCustomerAuth] },

    { path: 'jobs/:globalSearchType/:globalSearchText', component: JobComponent, canActivate: [CanActivateAuth] },
    {
        path: 'job/:id',
        component: JobDetailComponent,
        canActivate: [CanActivateAuth],
        data: {
            'pageName': 'Jobs'
        },
        children: [
            { path: 'dep', component: JobApplicationDepComponent, data: { 'pageName': 'dep' }, pathMatch: 'full' },
            { path: 'dot', component: JobApplicationDotComponent, data: { 'pageName': 'dot' }, pathMatch: 'full' },
            { path: 'violation', component: JobViolationComponent, data: { 'pageName': 'violation' }, pathMatch: 'full' },
            { path: 'scope', component: JobScopeComponent, data: { 'pageName': 'scope' }, pathMatch: 'full' },
            { path: 'milestone', component: JobMilestoneComponent, data: { 'pageName': 'milestone' } },
            { path: 'application', component: JobApplicationDobComponent, data: { 'pageName': 'application' } },
            { path: 'relatedJob', component: RelatedJobComponent, data: { 'pageName': 'relatedJob' } },
            { path: 'jobHistory', component: JobHistoryComponent, data: { 'pageName': 'jobHistory' } },
            { path: 'checklist', component: ChecklistComponent },
            { path: 'jobtask', component: JobTaskComponent, data: { 'pageName': 'jobtask' } },
            { path: 'jobcontact', component: JobContactComponent, data: { 'pageName': 'jobContact' } },
            { path: 'timenotes', component: TimeNotesComponent, data: { 'pageName': 'timeNotes' } },
            { path: 'transmittal', component: JobTransmittalComponent, data: { 'pageName': 'transmittal' } },
            { path: 'jobdocument', component: JobDocumentComponent, data: { 'pageName': 'jobdocument' } }
        ]
    },
    { path: 'job/:id', component: JobDetailComponent, canActivate: [CanActivateAuth] },
    { path: 'jobs', component: JobComponent, canActivate: [CanActivateAuth] },
    { path: 'jobContact/:id', component: JobContactComponent, canActivate: [CanActivateAuth] },
    { path: 'jobDocument/:id', component: JobDocumentComponent, canActivate: [CanActivateAuth] },
    { path: 'jobTask/:id', component: JobTaskComponent, canActivate: [CanActivateAuth] },
    { path: 'jobCheckList/:id', component: JobCheckListComponent, canActivate: [CanActivateAuth] },
    { path: 'timeNotes/:id', component: TimeNotesComponent, canActivate: [CanActivateAuth] },
    { path: 'documents', component: DocumentComponent, canActivate: [CanActivateAuth] },
    { path: 'rfp', component: RfpComponent, canActivate: [CanActivateAuth] },
    { path: 'rfps/:globalSearchType/:globalSearchText', component: RfpComponent, canActivate: [CanActivateAuth] },
    { path: 'tasks/:globalSearchType/:globalSearchText', component: TaskComponent , canActivate: [CanActivateAuth] },
    { path: 'rfp/:id/:page', component: EmailHistoryComponent, canActivate: [CanActivateAuth] },
    { path: 'SiteInformation', component: SiteInformationComponent, canActivate: [CanActivateAuth], canDeactivate: [PendingChangesGuard] },
    { path: 'editSiteInformation/:id', component: SiteInformationComponent, canActivate: [CanActivateAuth], canDeactivate: [PendingChangesGuard] },
    { path: 'projectDetails/:id', component: projectDetailsComponent, canActivate: [CanActivateAuth], canDeactivate: [PendingChangesGuard] },
    { path: 'scopeReview/:id', component: scopeReviewComponent, canActivate: [CanActivateAuth], canDeactivate: [PendingChangesGuard] },
    { path: 'proposalReview/:id', component: proposalReviewComponent, canActivate: [CanActivateAuth], canDeactivate: [PendingChangesGuard] },
    { path: 'rfpSubmit/:id', component: rfpSubmitComponent, canActivate: [CanActivateAuth] },
    { path: 'company', component: CompanyComponent, canActivate: [CanActivateAuth] },
    { path: 'cronjobfetch', component: DummyComponent, canActivate: [CanActivateAuth] },
    { path: 'company/:globalSearchType/:globalSearchText', component: CompanyComponent, canActivate: [CanActivateAuth] },
    { path: 'companydetail/:id', component: CompanyDetailComponent, canActivate: [CanActivateAuth] },
    { path: 'contacts', component: ContactComponent, canActivate: [CanActivateAuth] },
    { path: 'contacts/:globalSearchType/:globalSearchText', component: ContactComponent, canActivate: [CanActivateAuth] },
    { path: 'contactdetail/:id', component: ContactDetailComponent, canActivate: [CanActivateAuth] },
    { path: 'tasks', component: TaskComponent, canActivate: [CanActivateAuth] },
    { path: 'address', component: AddressMasterComponent, canActivate: [CanActivateAuth] },
    { path: 'employee', component: EmployeeComponent, canActivate: [CanActivateAuth] },
    { path: 'customer-permissions', component: CustomerPermissionComponent, canActivate: [CanActivateAuth] },
    { path: 'userGroup', component: UserGroupComponent, canActivate: [CanActivateAuth] },
    { path: 'verbiage', component: VerbiagesComponent, canActivate: [CanActivateAuth] },
    { path: 'addresstype', component: AddresstypeComponent, canActivate: [CanActivateAuth] },
    { path: 'contacttitle', component: ContactTitleComponent, canActivate: [CanActivateAuth] },
    { path: 'sentvia', component: SentviaComponent, canActivate: [CanActivateAuth] },
    { path: 'multipledwellingclassification', component: DwellingClassificationComponent, canActivate: [CanActivateAuth] },
    { path: 'occupancyclassification', component: OccupancyClassificationComponent, canActivate: [CanActivateAuth] },
    { path: 'companytype', component: CompanyTypesComponent, canActivate: [CanActivateAuth] },
    { path: 'licensetype', component: LicenseTypesComponent, canActivate: [CanActivateAuth] },
    { path: 'companylicensetype', component: CompanyLicenseTypesComponent, canActivate: [CanActivateAuth] },
    { path: 'documenttype', component: DocumentTypesComponent, canActivate: [CanActivateAuth] },
    { path: 'emailtype', component: EmailTypeComponent, canActivate: [CanActivateAuth] },
    { path: 'jobcontacttype', component: JobContactTypesComponent, canActivate: [CanActivateAuth] },
    { path: 'jobtimenotecategory', component: JobTimenoteCategoriesComponent, canActivate: [CanActivateAuth] },
    { path: 'seismicdesigncategory', component: SeismicDesignCategoriesComponent, canActivate: [CanActivateAuth] },
    { path: 'structureoccupancycategory', component: StructureOccupancyCategoriesComponent, canActivate: [CanActivateAuth] },
    { path: 'companytaxtype', component: CompanyTaxTypesComponent, canActivate: [CanActivateAuth] },
    { path: 'constructionclassification', component: ConstructionClassificationsComponent, canActivate: [CanActivateAuth] },
    { path: 'primarystructuralsystem', component: PrimaryStructuralSystemsComponent, canActivate: [CanActivateAuth] },
    { path: 'state', component: StatesComponent, canActivate: [CanActivateAuth] },
    { path: 'tasktype', component: TaskTypeComponent, canActivate: [CanActivateAuth] },
    { path: 'systemsetting', component: SystemSettingsComponent, canActivate: [CanActivateAuth] },
    { path: 'paneltycode', component: PaneltycodeComponent, canActivate: [CanActivateAuth] },
    { path: 'suffix', component: SuffixComponent, canActivate: [CanActivateAuth] },
    { path: 'prefix', component: PrefixComponent, canActivate: [CanActivateAuth] },
    { path: 'holidaycalender', component: HolidayCalendarComponent, canActivate: [CanActivateAuth] },
    { path: 'depcostsetting', component: DepCostSettingComponent, canActivate: [CanActivateAuth] },
    { path: 'jobapplicationtype', component: ApplicationTypeComponent, canActivate: [CanActivateAuth] },
    { path: 'documentmaster', component: DocumentMasterComponent, canActivate: [CanActivateAuth] },
    { path: 'workpermittype', component: WorkPermitTypeComponent, canActivate: [CanActivateAuth] },
    { path: 'ownertype', component: OwnertypeComponent, canActivate: [CanActivateAuth] },
    { path: 'newsletter', component: NewsLetterComponent, canActivate: [CanActivateAuth] },
    
    // { path: 'masters', component: MastersComponent, canActivate: [CanActivateAuth] },

    /**
     * Rfp masters
     */
    { path: 'worktype', component: WorkTypeComponent, canActivate: [CanActivateAuth] },
    { path: 'jobtype', component: JobTypeComponent, canActivate: [CanActivateAuth] },
    { path: 'subjobtypecategory', component: SubJobTypeCategoryComponent, canActivate: [CanActivateAuth] },
    { path: 'subjobtype', component: RfpSubJobTypeComponent, canActivate: [CanActivateAuth] },
    { path: 'worktypecategory', component: WorkTypeCategoryComponent, canActivate: [CanActivateAuth] },
    /**
     * notification
     */
    { path: 'notification', component: NotificationComponent, canActivate: [CanActivateAuth] },


    /**
     * Dob Penalty Master
     */
    { path: 'dobpenaltyschedule', component: DobPenaltyComponent, canActivate: [CanActivateAuth] },

    /**
    * Dob Penalty Master
    */
    { path: 'fdnypenaltyschedule', component: FdnyPenaltyComponent, canActivate: [CanActivateAuth] },

    /**
     * Dot Penalty Master
     */
    { path: 'dotpenaltyschedule', component: DotPenaltyComponent, canActivate: [CanActivateAuth] },

    /**
     * Dohmh Penalty Master
     */
    { path: 'dohmhcoolingtowerpenaltyschedule', component: DohmhPenaltyComponent, canActivate: [CanActivateAuth] },

    /**
     * Dohmh Penalty Master
     */
    { path: 'depnoisecodepenaltyschedule', component: DepNoiseCodePenaltyComponent, canActivate: [CanActivateAuth] },

       /**
     * cheklist group master
     */
        { path: 'checklistGroupMaster', component: ChecklistMasterGroupComponent, canActivate: [CanActivateAuth] },

        
       /**
     * cheklist item master
     */
        { path: 'checklistItemMaster', component: ChecklistItemMasterComponent, canActivate: [CanActivateAuth] },
    /**
     * 
       /**
     * cheklist item master
     */
       
    /** 


     * 
     * Reports
     */
    { path: 'allviolationreport', component: AllViolationReportComponent, canActivate: [CanActivateAuth] },
    { path: 'permitsexpiryreport', component: DobPermitExpiryReportComponent, canActivate: [CanActivateAuth] },
    { path: 'contractorinsurancesexpiryreport', component: GCInsuranceReportComponent, canActivate: [CanActivateAuth] },
    { path: 'rfpreport', component: RfpReportComponent, canActivate: [CanActivateAuth] },
    { path: 'completedscopebillingpointreport', component: CompletedScopeBillingPointReportComponent, canActivate: [CanActivateAuth] },
    { path: 'closedjobswithopenbillingreport', component: ClosedJobOpenBillingPointReportComponent, canActivate: [CanActivateAuth] },
    { path: 'applicationstatusreport', component: ApplicationStatusComponent, canActivate: [CanActivateAuth] },
    { path: 'ahvpermitsexpiryreport', component: AfterHourVarianceReportComponent, canActivate: [CanActivateAuth] },
    { path: 'contactlicenseexpiryreport', component: ContactLicenseExpiryReportComponent, canActivate: [CanActivateAuth] },
    { path: 'consolidatedstatusreport', component: OverAllPermitExpiryForJobsComponent, canActivate: [CanActivateAuth] },
    { path: 'unsynctimenotereport', component: unsyncTimenoteReportComponent, canActivate: [CanActivateAuth] },
    { path: 'customer-dashboard', component: DashboardComponent, canActivate: [CanActivateAuth] },
    // { path: 'customer-dashboard', component: DashboardComponent, canActivate: [CanActivateCustomerAuth] },
    { path: 'customer-my-account', component: MyaccountComponent, canActivate: [CanActivateCustomerAuth] },
    { path: 'terms-and-conditions', component: TermsAndConditionsComponent},
    { path: 'privacy-policy', component: PrivacyPolicyComponent},
    { path: 'trademark-guideline', component: TrademarkGuidelineComponent},
    
    { path: '**', component: HomeComponent, canActivate: [CanActivateAuth] },
]) 
