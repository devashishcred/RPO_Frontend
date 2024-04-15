import { CommonModule, CurrencyPipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from 'ngx-ckeditor';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {  BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
//import { SortablejsModule } from 'ngx-sortablejs';
import { AppComponent } from './app.component';
import { APP_ROUTING, CanActivateAuth, CanActivateCustomerAuth, CanActivateNotCustomerAuth } from './app.routing';
import { DeleteConfirmation } from './components/DeleteConfirmation';
import { SaveConfirmation } from './components/SaveConfirmation';
import { JobCommonComponent } from './components/jobcomponent/job.component';
import { RfpCommonComponent } from './components/rfpcomponent/rfp.component';
import { DropdownWidget } from './components/DropdownWidget';
import { ExportWidget } from './components/ExportWidget';
import { ExporXLSAndPDFtWidget } from './components/ExportXLSAndPDFWidget';
import { DatetimePickerDirective } from './directives/DatetimePickerDirective';
import { DisabledOnSelectorDirective } from './directives/ngxDisable';
import { projectDetailsComponent } from './route/addRfp/projectDetails/projectDetails.component';
import { ProjectDetailsServices } from './route/addRfp/projectDetails/projectDetails.services';
import { proposalReviewComponent } from './route/addRfp/proposalReview/proposalReview.component';
import { ProposalReviewServices } from './route/addRfp/proposalReview/proposalReview.services';
import { rfpSubmitComponent } from './route/addRfp/rfpSubmit/rfpSubmit.component';
import { RfpSubmitServices } from './route/addRfp/rfpSubmit/rfpSubmit.services';
import { scopeReviewComponent } from './route/addRfp/scopeReview/scopeReview.component';
import { ScopeReviewServices } from './route/addRfp/scopeReview/scopeReview.services';
import { SiteInformationComponent } from './route/addRfp/siteInformation/siteInformation.component';
import { SiteInformationServices } from './route/addRfp/siteInformation/siteInformation.services';
import { CompanyComponent } from './route/company/company.component';
import { CompanyServices } from './route/company/company.services';
import { CompanyDetailComponent } from './route/company/companyDetail/companyDetail.component';
import { FormCompanyComponent } from './route/company/formCompany/formCompany.component';
import { ContactComponent } from './route/contact/contact.component';
import { ContactServices } from './route/contact/contact.services';
import { ContactDetailComponent } from './route/contact/contactDetail/contactDetail.component';
import { FormContactComponent } from './route/contact/formContact/formContact.component';
import { EmployeeComponent } from './route/employee/employee.component';
import { EmployeeServices } from './route/employee/employee.services';
import { DocumentComponent } from './route/reference/document/document.component';
import { DocumentServices } from './route/reference/document/document.services';
import { HomeComponent } from './route/home/home.component';
import { HomeServices } from './route/home/home.services';
import { JobComponent } from './route/job/job.component';
import {
  FormAddApplication
} from './route/job/jobDetail/jobApplicationDob/formAddApplication/formAddApplication.component';
import { FormAddPermit } from './route/job/jobDetail/jobApplicationDob/formAddPermit/formAddPermit.component';

import { BasicInfoComponent } from './route/job/jobDetail/basicInfo/basicInfo.component';
import { BasicInfoHeaderComponent } from './route/job/jobDetail/basicInfoheader/basicInfoHeader.component';

import { JobApplicationDobComponent } from './route/job/jobDetail/jobApplicationDob/jobApplicationDob.component';
import { JobApplicationPermitComponent } from './route/job/jobDetail/jobApplicationDob/jobApplicationPermit.component';

import { JobContactComponent } from './route/job/jobDetail/jobContact/jobContact.component';
import { JobDocumentComponent } from './route/job/jobDetail/jobDocument/jobDocument.component';
import { JobTransmittalComponent } from './route/job/jobDetail/jobTransmittal/jobTransmittal.component';
import { JobTaskComponent } from './route/job/jobDetail/jobTask/jobTask.component';
import { JobCheckListComponent } from './route/job/jobDetail/jobCheckList/jobCheckList.component';
import { JobHistoryComponent } from './route/job/jobDetail/jobHistory/jobHistory.component';
import { RelatedJobComponent } from './route/job/jobDetail/relatedJob/relatedJob.component';
import { AddRelatedJobComponent } from './route/job/jobDetail/relatedJob/addRelatedJob/addRelatedJob.component';
import { FilterHistoryComponent } from './route/job/jobDetail/jobHistory/filterhistory/filterhistory.component';
import { AddJobContactComponent } from './route/job/jobDetail/jobContact/addJobContact/addJobContact.component';
import { EditJobContactComponent } from './route/job/jobDetail/jobContact/editJobContact/editJobContact.component';

import { DocumentMasterComponent } from './route/documentmaster/documentmaster.component'
import { DocumentMasterFormComponent } from './route/documentmaster/documentmasterform/documentmasterform.component'

import { TimeNotesComponent } from './route/job/jobDetail/timeNotes/timeNotes.component';
import { JobScopeComponent } from './route/job/jobDetail/jobScope/jobScope.component';
import { JobMilestoneComponent } from './route/job/jobDetail/jobMilestone/jobMilestone.component';

import { FormDocumentComponent } from './route/reference/document/formDocument/formDocument.component';
import { FormAdvanceSearchComponent } from './route/job/formAdvanceSearch/formAdvanceSearch.component';
import { FormJobComponent } from './route/job/formJob/formJob.component';
import { FormJobAddNewAddressComponent } from './route/job/formJobAddNewAddress/formJobAddNewAddress.component';
import { LoginComponent } from './route/login/login.component';
import { LoginServices } from './route/login/login.services';
import { RfpComponent } from './route/rfp/rfp.component';
import { RfpListService } from './route/rfp/rfp.services';
import { UserGroupComponent } from './route/userGroup/userGroup.component';
import { UserGroupServices } from './route/userGroup/userGroup.services';
import { VerbiagesComponent } from './route/verbiages/verbiages.component';
import { VerbiagesServices } from './route/verbiages/verbiages.services';
import { AddressTypeServices } from './services/addressType.services';
import { BoroughServices } from './services/borough.services';
import { CityServices } from './services/city.services';
import { ConstClasificationsServices } from './services/ConstClassification.services';
import { ContactLicenseTypeServices } from './services/contactLicenseType.services';
import { ContactTitleServices } from './services/contactTitle.services';
import { DocumentTypeServices } from './services/documentType.Services';
import { GroupServices } from './services/group.services';
import { JobTypesServices } from './services/jobTypes.services';
import { OccuClasificationsServices } from './services/OccuClassification.services';

import { StateServices } from './services/state.services';
import { UserServices } from './services/user.services';
import { HttpRequestInterceptor } from './utils/httpRequestInterceptor';
import { Message } from './app.messages';
import { UserRightServices } from './services/userRight.services';
import { constantValues } from './app.constantValues';
import { OrderModule } from 'ngx-order-pipe';
import { JobServices } from './route/job/job.services';
import { JobScopeServices } from './route/job/jobDetail/jobScope/jobScope.service';
import { JobMilestoneServices } from './route/job/jobDetail/jobMilestone/jobMilestone.service';
import { RelatedJobServices } from './route/job/jobDetail/relatedJob/relatedJob.service';
import { JobHistoryServices } from './route/job/jobDetail/jobHistory/jobHistory.service';
import { JobContactServices } from './route/job/jobDetail/jobContact/JobContact.service';
import { TimeNotesServices } from './route/job/jobDetail/timeNotes/TimeNotes.service';

import { FileUploadModule } from 'ng2-file-upload';
import { NgSelectModule } from '@ng-select/ng-select';
import { JobApplicationService } from './services/JobApplicationService.services';
import { JobDetailComponent } from '../app/route/job/jobDetail/jobDetail.component';
import { AddTaskComponent } from './route/addtask/addtask.component';
import { ViewTaskComponent } from './route/viewtask/viewtask.component';
import { notificationTaskComponent } from './route/notificationtask/notificationtask.component';
import { TaskComponent } from './route/task/task.component';
import { ViewAddressComponent } from '../app/route/viewAddress/viewAddress.component';
import { ViewAddressServices } from '../app/route/viewAddress/viewAddress.services';
import { ReminderComponent } from './route/reminder/addreminder.component';

import { ContactTypeServices } from '../app/services/contactType.services';
import { ProgressionNoteComponent } from './route/progressionnote/addprogressionnote.component';
import { TaskFilterComponent } from './route/task/taskfilter/taskfilter.component';
import { TaskServices } from './route/task/task.services';
import { EmailHistoryComponent } from './route/rfp/emailHistory/emailHistory.component';
import { SendEmailComponent } from './route/rfp/sendEmail/sendEmail.component';
import { ReadMoreComponent } from './components/readMore';
import { PendingChangesGuard } from './components/appSaveLeave/guard';
import { ClickOutsideModule } from 'ng-click-outside';
import { AddTimeNotesComponent } from './route/job/jobDetail/basicInfo/addtimenotes/addtimenotes.component';

import { AddresstypeComponent } from './route/addresstype/addresstype.component';
import { AddresstypeServices } from './route/addresstype/addresstype.services';
import { AddressformComponent } from './route/addresstype/addressform/addressform.component';
import { ContactTitleComponent } from './route/contacttitle/contacttitle.component';
import { ContactTitleformComponent } from './route/contacttitle/contacttitleform/contacttitleform.component';
import { SentviaComponent } from './route/sentvia/sentvia.component';
import { SentviaformComponent } from './route/sentvia/sentviaform/sentviaform.component';
import { SentviaServices } from './route/sentvia/sentvia.services';

import { multipleDwellingClassificationsServices } from './services/MultiDwellingClassifications.services';
import { DwellingClassificationComponent } from './route/dwellingclassification/dwellingclassification.component';
import {
  DwellingClassificationForm
} from './route/dwellingclassification/dwellingclassificationform/dwellingclassificationform.component';
import { DwellingClassificationServices } from './route/dwellingclassification/dwellingclassification.services';
//company type master
import { CompanyTypesServices } from './route/companytypes/companytypes.services';
import { CompanyTypesComponent } from './route/companytypes/companytypes.component';
import { CompanyTypesForm } from './route/companytypes/companytypesform/companytypesform.component';
//license type master
import { LicenseTypesServices } from './route/licensetypes/licensetypes.services';
import { LicenseTypesComponent } from './route/licensetypes/licensetypes.component';
import { LicenseTypesForm } from './route/licensetypes/licensetypesform/licensetypesform.component';
//document type master
import { DocumentTypesServices } from './route/documenttypes/documenttypes.services';
import { DocumentTypesComponent } from './route/documenttypes/documenttypes.component';
import { DocumentTypesForm } from './route/documenttypes/documenttypesform/documenttypesform.component';
//job contact type master
import { JobContactTypesServices } from './route/jobcontacttypes/jobcontacttypes.services';
import { JobContactTypesComponent } from './route/jobcontacttypes/jobcontacttypes.component';
import { JobContactTypesForm } from './route/jobcontacttypes/jobcontacttypesform/jobcontacttypesform.component';
//job timenote categories master
import { JobTimenoteCategoriesServices } from './route/jobtimenotecategories/jobtimenotecategories.services';
import { JobTimenoteCategoriesComponent } from './route/jobtimenotecategories/jobtimenotecategories.component';
import {
  JobTimenoteCategoriesForm
} from './route/jobtimenotecategories/jobtimenotecategoriesform/jobtimenotecategoriesform.component';
//seismic design categories master
import { SeismicDesignCategoriesServices } from './route/seismicdesigncategories/seismicdesigncategories.services';
import { SeismicDesignCategoriesComponent } from './route/seismicdesigncategories/seismicdesigncategories.component';
import {
  SeismicDesignCategoriesForm
} from './route/seismicdesigncategories/seismicdesigncategoriesform/seismicdesigncategoriesform.component';
//structure occupancy categories master
import {
  StructureOccupancyCategoriesServices
} from './route/structureoccupancycategories/structureoccupancycategories.services';
import {
  StructureOccupancyCategoriesComponent
} from './route/structureoccupancycategories/structureoccupancycategories.component';
import {
  StructureOccupancyCategoriesForm
} from './route/structureoccupancycategories/structureoccupancycategoriesform/structureoccupancycategoriesform.component';
//company tax types master
import { CompanyTaxTypesServices } from './route/companytaxtypes/companytaxtypes.services';
import { CompanyTaxTypesComponent } from './route/companytaxtypes/companytaxtypes.component';
import { CompanyTaxTypesForm } from './route/companytaxtypes/companytaxtypesform/companytaxtypesform.component';
//construction classification types master
import {
  ConstructionClassificationsServices
} from './route/constructionclassifications/constructionclassifications.services';
import {
  ConstructionClassificationsComponent
} from './route/constructionclassifications/constructionclassifications.component';
import {
  ConstructionClassificationsForm
} from './route/constructionclassifications/constructionclassificationsform/constructionclassificationsform.component';
//primary structural syatems master
import { PrimaryStructuralSystemsServices } from './route/primarystructuralsystems/primarystructuralsystems.services';
import { PrimaryStructuralSystemsComponent } from './route/primarystructuralsystems/primarystructuralsystems.component';
import {
  PrimaryStructuralSystemsForm
} from './route/primarystructuralsystems/primarystructuralsystemsform/primarystructuralsystemsform.component';
//states master
import { StatesServices } from './route/states/states.services';
import { StatesComponent } from './route/states/states.component';
import { StatesForm } from './route/states/statesform/statesform.component';

import { OccupancyClassificationComponent } from './route/occupancyclassifications/occupancyclassifications.component';
import {
  OccupancyClassificationsForm
} from './route/occupancyclassifications/occupancyclassificationsform/occupancyclassificationsform.component';
import {
  OccupancyClassificationsServices
} from './route/occupancyclassifications/occupancyclassifications.component.services';
import { GlobalSearchServices } from './services/globalSearch.services';
//Email type
import { EmailtypeServices } from './route/emailtype/emailtype.services';
import { EmailTypeComponent } from './route/emailtype/emailtype.component';
import { EmailtypeformComponent } from './route/emailtype/emailtypeform/emailtypeform.component';
import { TransmittalServices } from './route/job/jobDetail/jobTransmittal/jobTransmittal.service';
import { AddTransMittalComponent } from './route/job/jobDetail/jobTransmittal/addTransmittal/addTransmittal.component';

//Address
import { AddressMasterServices } from './route/addressmaster/addressmaster.services';
import { AddressMasterComponent } from './route/addressmaster/addressmaster.component';
import { MasterformComponent } from './route/addressmaster/masterform/masterform.component'

// conpany get info
import { GetInfoComponent } from './route/company/getinfo/getinfo.component';

// job scope add
import { AddScopeComponent } from './route/job/jobDetail/jobScope/addScope/addScope.component';

// job document
import { AddJobDocumentComponent } from './route/job/jobDetail/jobDocument/addJobDocument/addJobDocument.component';
import { UpdateJobDocumentComponent } from './route/job/jobDetail/jobDocument/updateDocument/updateDocument.component';
import { JobDocumentServices } from './route/job/jobDetail/jobDocument/jobDocument.service';
import {
  SelectJobDocumentComponent
} from './route/job/jobDetail/jobDocument/selectJobDocument/selectJobDocument.component';

/**
 * start of rfp master
 */


//Rfp Job Type (section 1)
import { JobTypeComponent } from './route/jobtype/jobType.component';
import { JobTypeServices } from './route/jobtype/jobType.services';
import { FormJobType } from './route/jobtype/formJobType/formJobType.component';

//Sub Job Type Category (section 2)
import { SubJobTypeCategoryComponent } from './route/subjobtypecategory/subjobtypecategory.component';
import { SubJobTypeCategoryServices } from './route/subjobtypecategory/subjobtypecategory.services';
import {
  FormSubJobTypeCategory
} from './route/subjobtypecategory/formSubJobTypeCategory/formSubJobTypeCategory.component';

//RFP Sub Job Type Category (section 3)
import { RfpSubJobTypeComponent } from './route/rfpsubjobtype/rfpsubjobtype.component';
import { RfpSubJobTypeServices } from './route/rfpsubjobtype/rfpsubjobtype.services';
import { FormRfpSubJobType } from './route/rfpsubjobtype/formRfpSubJobType/formRfpSubJobType.component';

//work type (section 4)
import { WorkTypeCategoryComponent } from './route/worktypecategory/worktypecategory.component';
import { WorkTypeCategoryServices } from './route/worktypecategory/worktypecategory.services';
import { FormWorkTypeCategory } from './route/worktypecategory/formWorkTypeCategory/formWorkTypeCategory.component';


//work type (section 5)
import { WorkTypeComponent } from './route/worktype/workType.component';
import { WorkTypeServices } from './route/worktype/workType.services';
import { FormWorkType } from './route/worktype/formWorkType/formWorkType.component';
/**
 * end of rfp master
 */

// Notification Module
import { NotificationServices } from './route/notification/notification.services';
import { NotificationComponent } from './route/notification/notification.component';

//Fee schedule 
import { FeeScheduleComponent } from './route/addRfp/rfpSubmit/feeschedule/feeschedule.component';
import { FeeScheduleServices } from './route/addRfp/rfpSubmit/feeschedule/feeschedule.services';

//Rfp progression Notes
import { AddRfpProgressionNoteComponent } from './route/rfpprogressionnote/addrfpprogressionnote.component';
import { AddRfpProgressionNoteServices } from './route/rfpprogressionnote/addrfpprogressionnote.services';

//JOB progression Notes
import { AddJobProgressionNoteComponent } from './route/jobprogressionnote/addjobprogressionnote.component';
import { AddJobProgressionNoteServices } from './route/jobprogressionnote/addjobprogressionnote.services';

//review for proposal
import { ReviewComponent } from './route/addRfp/proposalReview/review/review.component'
import { ReviewServices } from './route/addRfp/proposalReview/review/review.services'

// task type master
import { TaskTypeComponent } from './route/taskType/taskType.component';
import { TaskTypeServices } from './route/taskType/taskType.services';
import { TaskTypeForm } from './route/taskType/taskTypeForm/taskTypeForm.component';

//system settings
import { SystemSettingsComponent } from './route/systemSettings/systemsettings.component';
import { SystemSettingsServices } from './route/systemSettings/systemsettings.services';
import { SettingType } from './route/systemSettings/formOfSetting/systemsettingsForm.component';

//Job Status Reason Form
import { JobReasonForm } from './route/job/formJobReason/jobReason.component'
import { JobReasonServices } from './route/job/formJobReason/jobReason.services'
import { SharedDataService } from './app.constantValues'

// bis company list
import { BisCompanyListComponent } from './route/company/bisCompanyList/bisCompanyList.component';

// job scope history
import { ScopeHistoryComponent } from './route/job/jobDetail/jobScope/scopeHistory/scopeHistory.component';

//permission
import { PermissionComponent } from './components/permission/permission.component';

// get info address list
import { ViewAddressListComponent } from './route/job/viewAddressList/viewAddressList.component';


import { FilterPipe, SafeHtml } from './components/searchPipe'

// Violation
import { JobViolationComponent } from './route/job/jobDetail/jobViolation/jobViolation.component';
import { JobViolationServices } from './route/job/jobDetail/jobViolation/jobViolation.service';
import { FormAddViolation } from './route/job/jobDetail/jobViolation/formAddViolation/formAddViolation.component'
import {
  FormAddDobViolation
} from './route/job/jobDetail/jobViolation/formAddDobViolation/formAddDobViolation.component'


//penalty code master
import { PaneltycodeComponent } from './route/paneltycode/paneltycode.component';
import { PenaltyCodeServices } from './route/paneltycode/penaltycode.services';
import { PaneltyCodeformComponent } from './route/paneltycode/paneltycodeform/paneltycodeform.component'

//suffix master
import { SuffixComponent } from './route/suffix/suffix.component';
import { SuffixServices } from './services/suffix.services';
import { SuffixformComponent } from './route/suffix/suffixform/suffixform.component';

//prefix master
import { PrefixComponent } from './route/prefix/prefix.component';
import { PrefixServices } from './services/prefix.services';
import { PrefixformComponent } from './route/prefix/prefixform/prefixform.component';

import { SharedService } from './app.constantValues';
import { GetAppNoOnSelectRow } from './app.constantValues';

// Drag & Drop Module
//import { ngfModule } from "angular-file"

//shared service
import { JobSharedService } from './route/job/JobSharedService';
//import { StorageServiceModule } from 'angular-webstorage-service';

// DOT application
import { JobApplicationDotComponent } from './route/job/jobDetail/jobApplicationDot/jobApplicationDot.component';
import { FormAddDot } from './route/job/jobDetail/jobApplicationDot/formAddDot/formAddDot.component';
import { FormAddDotPermit } from './route/job/jobDetail/jobApplicationDot/formAddDotPermit/formAddDotPermit.component';
import {
  FormUploadDotPermit
} from './route/job/jobDetail/jobApplicationDot/formUploadDotPermit/formUploadDotPermit.component';
import { JobDotPermitComponent } from './route/job/jobDetail/jobApplicationDot/jobDotPermit.component';

//Explaination Charges
import {
  FormExplainationCharges
} from './route/job/jobDetail/jobViolation/explainationCharges/explainationCharges.component';

// Holiday Calendar
import { HolidayCalendarComponent } from './route/holidaycalendar/holidayCalendar.component'
import { HolidayCalendarServices } from './route/holidaycalendar/holidayCalendar.services'
import { HolidayCalendarForm } from './route/holidaycalendar/holidaycalendarform/holidayCalendarform.component'

// DEP COST SETTING
import { DepCostSettingComponent } from './route/depcostsetting/depCostSetting.component'
import { DepCostSettingServices } from './route/depcostsetting/depCostSetting.services'
import { DepCostSettingForm } from './route/depcostsetting/depcostsettingform/depCostSettingform.component'
import { JobApplicationDepComponent } from './route/job/jobDetail/jobApplicationDep/jobApplicationDep.component'
import {
  FormAddDepApplication
} from './route/job/jobDetail/jobApplicationDep/formAddDepApplication/formAddDepApplication.component';
import {
  JobApplicationPermitDEPComponent
} from './route/job/jobDetail/jobApplicationDep/jobApplicationPermitDEP.component'

//APPLICATION TYPE MASTER 
import { ApplicationTypeComponent } from './route/applicationtype/applicationType.component'
import { ApplicationTypeServices } from './route/applicationtype/applicationType.services'
import { ApplicationTypeFormComponent } from './route/applicationtype/applicationtypeform/applicationtypeform.component'

//WORK PERMIT TYPE MASTER 
import { WorkPermitTypeComponent } from './route/workpermittype/workPermitType.component'
import { WorkPermitTypeServices } from './route/workpermittype/workPermitType.services'
import { WorkPermitTypeFormComponent } from './route/workpermittype/workpermittypeform/workPermitTypeform.component'

import { FormAddDEPPermit } from './route/job/jobDetail/jobApplicationDep/formAddDEPPermit/FormAddDEPPermit.component'
import { TreeviewModule } from 'ngx-treeview';

//MANAGE GROUP
import { AddGroupComponent } from './route/addgroup/addgroup.component';
import { ManageGroupServices } from './route/addgroup/group.services';

//PULL PERMIT
import { PullPermitComponent } from './route/job/jobDetail/jobDocument/pullpermit/pullpermit.component';


//OWNER TYPE
import { OwnertypeComponent } from './route/ownertype/ownertype.component';
import { OwnerformComponent } from './route/ownertype/ownerform/ownerform.component';
import { OwnerTypeServices } from './route/ownertype/ownertype.services';

//DOB PENALTY
import { DobPenaltyComponent } from './route/dobPenalty/dobPenalty.component';
import { DobPenaltyFormComponent } from './route/dobPenalty/dobPenaltyForm/dobPenaltyForm.component';
import { DobPenaltyServices } from './route/dobPenalty/dobPenalty.services';

//FDNY PENALTY
import { FdnyPenaltyComponent } from './route/fdnyPenalty/fdnyPenalty.component';
import { FdnyPenaltyFormComponent } from './route/fdnyPenalty/fdnyPenaltyForm/fdnyPenaltyForm.component';
import { FdnyPenaltyServices } from './route/fdnyPenalty/fdnyPenalty.services';

//DOT PENALTY
import { DotPenaltyComponent } from './route/dotPenalty/dotPenalty.component';
import { DotPenaltyFormComponent } from './route/dotPenalty/dotPenaltyForm/dotPenaltyForm.component';
import { DotPenaltyServices } from './route/dotPenalty/dotPenalty.services';

//DOHMH Cooling Tower PENALTY
import { DohmhPenaltyComponent } from './route/dohmhPenalty/dohmhPenalty.component';
import { DohmhPenaltyFormComponent } from './route/dohmhPenalty/dohmhPenaltyForm/dohmhPenaltyForm.component';
import { DohmhPenaltyServices } from './route/dohmhPenalty/dohmhPenalty.services';

//DEP Noise Code PENALTY
import { DepNoiseCodePenaltyComponent } from './route/depNoiseCodePenalty/depNoiseCodePenalty.component';
import {
  DepNoiseCodePenaltyFormComponent
} from './route/depNoiseCodePenalty/depNoiseCodePenaltyForm/depNoiseCodePenaltyForm.component';
import { DepNoiseCodePenaltyServices } from './route/depNoiseCodePenalty/depNoiseCodePenalty.services';

//Reports
import { ReportServices } from './route/report/report.services';
import { AllViolationReportComponent } from './route/report/allviolationreport/allViolationReport.component';
import {
  ReportAdvanceSearchComponent
} from './route/report/allviolationreport/reportAdvanceSearch/reportAdvanceSearch.component';
import {
  PermitReportAdvanceSearchComponent
} from './route/report/dobpermitexpiryreport/reportAdvanceSearch/reportAdvanceSearch.component';
import { DobPermitExpiryReportComponent } from './route/report/dobpermitexpiryreport/dobPermitExpiryReport.component';
import { GCInsuranceReportComponent } from './route/report/gcInsuranceExpiry/gcInsurance.component';
import {
  ContractorInsuranceAdvanceSearchComponent
} from './route/report/gcInsuranceExpiry/reportAdvanceSearch/reportAdvanceSearch.component';
import { RfpReportComponent } from './route/report/rfpReport/rfpReport.component';
import {
  CompletedScopeBillingPointReportComponent
} from './route/report/completedScopeBillingPoint/completedScopeBillingPoint.component';
import {
  ClosedJobOpenBillingPointReportComponent
} from './route/report/closedJobOpenBillingPoint/closedJobOpenBillingPointReport.component';
import {
  ClosedJobReportAdvanceSearchComponent
} from './route/report/closedJobOpenBillingPoint/reportAdvanceSearch/reportAdvanceSearch.component';
import { ApplicationStatusComponent } from './route/report/applicationStatus/applicationStatus.component';
import {
  ApplicationStatusAdvanceSearchComponent
} from './route/report/applicationStatus/reportAdvanceSearch/reportAdvanceSearch.component';
import { AfterHourVarianceReportComponent } from './route/report/ahvReport/ahvReport.component';
import {
  AfterHourVarianceAdvanceSearchComponent
} from './route/report/ahvReport/reportAdvanceSearch/reportAdvanceSearch.component';
import {
  ContactLicenseExpiryReportComponent
} from './route/report/contactLicenseExpiry/contactLicenseExpiry.component';
import {
  ContactLicenseAdvanceSearchComponent
} from './route/report/contactLicenseExpiry/reportAdvanceSearch/reportAdvanceSearch.component';
import {
  OverAllPermitExpiryForJobsComponent
} from './route/report/overAllPermitExpiryForJobs/overAllPermitExpiry.component';
import { unsyncTimenoteReportComponent } from './route/report/timenotesReport/unsyncTimenote.component';

//JobList
import { JobListComponent } from './route/report/jobListModal/jobList.component';
import { AddTaskMasterComponent } from './route/task/addtaskMaster/addtaskMaster.component';
import { DobViewComponent } from './route/dobView/dobView.component';
import { CompanyLicenseTypesComponent } from './route/companyLicensetypes/companyLicensetypes.component';
import {
  CompanyLicenseTypesForm
} from './route/companyLicensetypes/companyLicensetypesform/companyLicensetypes.component';
import { CompanyLicenseTypesServices } from './route/companyLicensetypes/companyLicensetypes.services';
import {
  JobApplicationDobSecondComponent
} from './route/job/jobDetail/jobApplicationDob/jobApplicationSecond.component';
import {
  ChecklistMasterGroupComponent
} from './route/checklistMaterGroup/checklist-master-group/checklist-master-group.component';
import {
  ChecklistMasterGroupFormComponent
} from './route/checklistMaterGroup/checklist-master-group/checklist-master-group-form/checklist-master-group-form.component';
import { CheckListGroupServices } from './route/checklistMaterGroup/checklistMasterGruop';
import {
  ChecklistItemMasterComponent
} from './route/checklistItemMaster/checklist-item-master/checklist-item-master.component';
import {
  ChecklistItemMasterFormComponent
} from './route/checklistItemMaster/checklist-item-master-form/checklist-item-master-form.component';
import { CheckListItemMaterServices } from './route/checklistItemMaster/checklistItemMaster.service';
import { ChecklistComponent } from './route/checklist/checklist/checklist.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GenerteChecklistComponent } from './route/checklist/generte-checklist/generte-checklist.component';
import {
  AddExternalChecklistComponent
} from './route/checklist/add-external-checklist/add-external-checklist.component';
import { AddViolationComponent } from './route/checklist/add-violation/add-violation.component';
import { ExportChecklistComponent } from './route/checklist/export-checklist/export-checklist.component';
import { NumberDirective } from './directives/numbers-ony.directive';
import { JobCheckListServices } from './route/checklist/checklist/checklist.service';
import { HighlightPipe } from './directives/highlight.pipe';
import { SearchPipe } from './directives/search.pipe';
import { SearchCommentPipe } from './directives/search-comment.pipe';
import { HighlightDirective } from './directives/highlight.directive';
import { AddItemInJobComponent } from './route/checklist/add-item-in-job/add-item-in-job.component';
import {
  AddChecklistCommentComponent
} from './route/checklist/add-comment/add-checklist-comment/add-checklist-comment.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  AddChecklistProgressNoteComponent
} from './route/checklist/add-progress-note/add-checklist-progress-note/add-checklist-progress-note.component';
import { MatSelectModule } from '@angular/material/select';
import {
  UploadDocInChecklistComponent
} from './route/checklist/add-upload-doc/upload-doc-in-checklist/upload-doc-in-checklist.component';
import { DatepickerDirective } from './directives/date.directive';
import { ViolationNoteComponent } from './route/checklist/add-note-violation/violation-note/violation-note.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ViewChecklistDocComponent } from './route/checklist/view-doc/view-checklist-doc/view-checklist-doc.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import {
  AddInspectionInFloorComponent
} from './route/checklist/add-inspection-in-floor/add-inspection-in-floor.component';
import { ViewViolationComponent } from './route/viewViolation/viewViolation.component';
import { EditViolationComponent } from './route/checklist/edit-violation/edit-violation.component';
import {
  AddViolationCommentComponent
} from './route/checklist/add-comment/add-violation-comment/add-violation-comment.component';
import { DummyComponent } from './route/dummy/dummy.component';
import { DashboardComponent } from './route/customer/dashboard/dashboard.component';
import { MyaccountComponent } from './route/customer/myaccount/myaccount.component';
import { ForgotPasswordComponent } from './route/customer/forgot-password/forgot-password.component';
import { SetPasswordComponent } from './route/customer/set-password/set-password.component';
import { SignupComponent } from './route/customer/signup/signup.component';
import { RequestNewProjectComponent } from './route/customer/request-new-project/request-new-project.component';
import {
  MessageSentSuccessModalComponent
} from './route/customer/message-sent-success-modal/message-sent-success-modal.component';
import { CustomerPermissionComponent } from './route/customer/customer-permission/customer-permission.component';
import { NewsLetterComponent } from './route/news-letter/news-letter.component';
import { AddEditNewsLetterComponent } from './route/news-letter/add-edit-news-letter/add-edit-news-letter.component';
import { NewsLetterServices } from './services/news-letter.services';
import {
  NotificationSettingsComponent
} from './route/customer/customer-permission/notification-settings/notification-settings.component';
import { TermsAndConditionsComponent } from './route/terms-and-conditions/terms-and-conditions.component';
import { TrademarkGuidelineComponent } from './route/trademark-guideline/trademark-guideline.component';
import { PrivacyPolicyComponent } from './route/privacy-policy/privacy-policy.component';
import { AutocompleteOffDirective } from './directives/autocompleteOffDirective';
import { FormAddDobSafetyViolation } from './route/job/jobDetail/jobViolation/formAddDobSafetyViolation/formAddDobSafetyViolation.component';

import { Loader } from './components/loader';
import { ConfirmLeaveComponent } from "./components/appSaveLeave/confirm-leave.component";
import { DatePickerComponent } from "./route/checklist/date-picker.component";
import { FileValidator } from "./route/reference/document/file-input.validator";
import { DataTableExtensionsService } from "./services/data-table-extensions.service";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";

//import { ngfDrop } from "angular-file";


@NgModule({
  imports: [
    APP_ROUTING,
    HttpClientModule,
    HttpClientJsonpModule,
    BrowserModule,
    BrowserAnimationsModule, //required by ToastrModule | use this or the NoopAnimationsModule
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    ToastrModule.forRoot({
      closeButton: true,
      preventDuplicates: true,
      timeOut: 5000,
      enableHtml: true
    }),
    //SortablejsModule.forRoot({animation: 150}),
    CKEditorModule,
    OrderModule,
    //   Ng2FileRequiredModule,
    AngularMultiSelectModule,

    NgSelectModule,
    ClickOutsideModule,
    ReactiveFormsModule,
    //ngfModule,
    //StorageServiceModule,
    TreeviewModule.forRoot(),
    MatExpansionModule,
    MatMenuModule,
    DragDropModule,
    MatDatepickerModule,
    MatSelectModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatCardModule,
    MatCheckboxModule,
    FileUploadModule
  ],
  declarations: [
    DatetimePickerDirective,
    DisabledOnSelectorDirective,
    DatepickerDirective,
    //ClickOutsideDirective,
    NumberDirective,
    SearchCommentPipe,
    HighlightDirective,
    AutocompleteOffDirective,
    SearchPipe,
    HighlightPipe,
    DeleteConfirmation,
    SaveConfirmation,
    JobCommonComponent,
    RfpCommonComponent,
    DropdownWidget,
    ExportWidget,
    ExporXLSAndPDFtWidget,
    AppComponent,
    LoginComponent,
    HomeComponent,
    JobComponent,
    BasicInfoComponent,
    BasicInfoHeaderComponent,
    JobApplicationDobComponent,
    JobApplicationDobSecondComponent,
    JobApplicationPermitComponent,
    FormAddApplication,
    FormAddPermit,
    JobContactComponent,
    JobDocumentComponent,
    JobTransmittalComponent,
    JobTaskComponent,
    JobCheckListComponent,
    JobHistoryComponent,
    RelatedJobComponent,
    AddRelatedJobComponent,
    FilterHistoryComponent,
    AddJobContactComponent,
    EditJobContactComponent,
    TimeNotesComponent,
    JobScopeComponent,
    JobMilestoneComponent,
    DocumentComponent,
    FormDocumentComponent,
    FormAdvanceSearchComponent,
    FormJobComponent,
    FormJobAddNewAddressComponent,
    RfpComponent,
    projectDetailsComponent,
    SiteInformationComponent,
    scopeReviewComponent,
    rfpSubmitComponent,
    proposalReviewComponent,
    EmployeeComponent,
    UserGroupComponent,
    VerbiagesComponent,
    CompanyComponent,
    CompanyDetailComponent,
    FormCompanyComponent,
    ContactComponent,
    ContactDetailComponent,
    FormContactComponent,
    JobDetailComponent,
    AddTaskComponent,
    AddTaskMasterComponent,
    ViewTaskComponent,
    DobViewComponent,
    notificationTaskComponent,
    ProgressionNoteComponent,
    TaskFilterComponent,
    TaskComponent,
    ViewAddressComponent,
    ReminderComponent,
    EmailHistoryComponent,
    SendEmailComponent,
    ReadMoreComponent,
    AddresstypeComponent,
    AddressformComponent,
    AddTimeNotesComponent,
    ContactTitleComponent,
    ContactTitleformComponent,
    SentviaComponent,
    SentviaformComponent,
    DwellingClassificationComponent,
    DwellingClassificationForm,
    OccupancyClassificationComponent,
    OccupancyClassificationsForm,
    CompanyTypesComponent,
    CompanyTypesForm,
    LicenseTypesComponent,
    LicenseTypesForm,
    CompanyLicenseTypesComponent,
    CompanyLicenseTypesForm,
    DocumentTypesComponent,
    DocumentTypesForm,
    EmailTypeComponent,
    EmailtypeformComponent,
    JobContactTypesComponent,
    JobContactTypesForm,
    JobTimenoteCategoriesComponent,
    JobTimenoteCategoriesForm,
    SeismicDesignCategoriesComponent,
    SeismicDesignCategoriesForm,
    StructureOccupancyCategoriesComponent,
    StructureOccupancyCategoriesForm,
    CompanyTaxTypesComponent,
    CompanyTaxTypesForm,
    ConstructionClassificationsComponent,
    ConstructionClassificationsForm,
    PrimaryStructuralSystemsComponent,
    PrimaryStructuralSystemsForm,
    StatesComponent,
    StatesForm,
    AddTransMittalComponent,
    AddressMasterComponent,
    MasterformComponent,
    GetInfoComponent,
    JobTypeComponent,
    FormJobType,
    SubJobTypeCategoryComponent,
    FormSubJobTypeCategory,
    WorkTypeComponent,
    FormWorkType,
    NotificationComponent,
    FeeScheduleComponent,
    AddRfpProgressionNoteComponent,
    AddJobProgressionNoteComponent,
    RfpSubJobTypeComponent,
    FormRfpSubJobType,
    WorkTypeCategoryComponent,
    FormWorkTypeCategory,
    ReviewComponent,
    TaskTypeComponent,
    TaskTypeForm,
    AddScopeComponent,
    SystemSettingsComponent,
    SettingType,
    JobReasonForm,
    AddJobDocumentComponent,
    BisCompanyListComponent,
    ScopeHistoryComponent,
    PermissionComponent,
    ViewAddressListComponent,
    FilterPipe,
    SafeHtml,
    JobViolationComponent,
    FormAddViolation,
    FormAddDobViolation,
        FormAddDobSafetyViolation,
    UpdateJobDocumentComponent,
    SelectJobDocumentComponent,
    PaneltycodeComponent,
    PaneltyCodeformComponent,
    SuffixComponent,
    SuffixformComponent,
    PrefixComponent,
    PrefixformComponent,
    JobApplicationDotComponent,
    FormAddDot,
    FormUploadDotPermit,
    FormAddDotPermit,
    JobDotPermitComponent,
    FormExplainationCharges,
    HolidayCalendarComponent,
    HolidayCalendarForm,
    DepCostSettingComponent,
    DepCostSettingForm,
    JobApplicationDepComponent,
    FormAddDepApplication,
    ApplicationTypeComponent,
    ApplicationTypeFormComponent,
    WorkPermitTypeFormComponent,
    WorkPermitTypeComponent,
    JobApplicationPermitDEPComponent,
    FormAddDEPPermit,
    AddGroupComponent,
    PullPermitComponent,
    OwnertypeComponent,
    OwnerformComponent,
    DobPenaltyComponent,
    DobPenaltyFormComponent,
    FdnyPenaltyComponent,
    FdnyPenaltyFormComponent,
    DotPenaltyComponent,
    DotPenaltyFormComponent,
    DohmhPenaltyComponent,
    DohmhPenaltyFormComponent,
    DepNoiseCodePenaltyComponent,
    DepNoiseCodePenaltyFormComponent,
    AllViolationReportComponent,
    DobPermitExpiryReportComponent,
    ReportAdvanceSearchComponent,
    PermitReportAdvanceSearchComponent,
    GCInsuranceReportComponent,
    RfpReportComponent,
    CompletedScopeBillingPointReportComponent,
    ClosedJobOpenBillingPointReportComponent,
    ClosedJobReportAdvanceSearchComponent,
    ApplicationStatusComponent,
    AfterHourVarianceReportComponent,
    ApplicationStatusAdvanceSearchComponent,
    AfterHourVarianceAdvanceSearchComponent,
    ContactLicenseExpiryReportComponent,
    ContactLicenseAdvanceSearchComponent,
    OverAllPermitExpiryForJobsComponent,
    ContractorInsuranceAdvanceSearchComponent,
    unsyncTimenoteReportComponent,
    DocumentMasterComponent,
    DocumentMasterFormComponent,
    JobListComponent,
    ChecklistMasterGroupComponent,
    ChecklistMasterGroupFormComponent,
    ChecklistItemMasterComponent,
    ChecklistItemMasterFormComponent,
    ChecklistComponent,
    GenerteChecklistComponent,
    AddExternalChecklistComponent,
    AddViolationComponent,
    ExportChecklistComponent,
    AddItemInJobComponent,
    AddInspectionInFloorComponent,
    AddChecklistCommentComponent,
    AddChecklistProgressNoteComponent,
    UploadDocInChecklistComponent,
    ViolationNoteComponent,
    ViewChecklistDocComponent,
    SidebarComponent,
    HeaderComponent,
    ViewViolationComponent,
    EditViolationComponent,
    AddViolationCommentComponent,
    DummyComponent,
    DashboardComponent,
    MyaccountComponent,
    ForgotPasswordComponent,
    SetPasswordComponent,
    SignupComponent,
    RequestNewProjectComponent,
    MessageSentSuccessModalComponent,
    CustomerPermissionComponent,
    NewsLetterComponent,
    AddEditNewsLetterComponent,
    NotificationSettingsComponent,
    TermsAndConditionsComponent,
    TrademarkGuidelineComponent,
    PrivacyPolicyComponent,
    Loader,
    ConfirmLeaveComponent,
    DatePickerComponent,
    FileValidator,
    //ngfDrop,

  ],
  exports: [],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  bootstrap: [
    AppComponent, DeleteConfirmation, SaveConfirmation
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: HttpRequestInterceptor,
    multi: true,
  }, WorkTypeCategoryServices, RfpSubJobTypeServices,
    AddRfpProgressionNoteServices,
    AddJobProgressionNoteServices,
    FeeScheduleServices,
    WorkTypeServices,
    SubJobTypeCategoryServices,
    JobTypeServices,
    AddressMasterServices, EmailtypeServices, OccupancyClassificationsServices,
    DwellingClassificationServices,
    SentviaServices, AddresstypeServices,
    PendingChangesGuard, TaskServices,
    ContactTypeServices,
    ViewAddressServices,
    JobApplicationService,
    SuffixServices,
    JobMilestoneServices,
    RelatedJobServices,
    JobHistoryServices,
    JobContactServices,
    TimeNotesServices,
    JobScopeServices,
    JobServices,
    constantValues,
    UserRightServices,
    Message,
    RfpSubmitServices,
    CurrencyPipe,
    ProposalReviewServices,
    RfpListService,
    ScopeReviewServices,
    ProjectDetailsServices,
    JobTypesServices,
    BoroughServices,
    SiteInformationServices,
    OccuClasificationsServices,
    ConstClasificationsServices,
    multipleDwellingClassificationsServices,
    CanActivateAuth, LoginServices, CanActivateCustomerAuth, CanActivateNotCustomerAuth,
    UserServices,
    AddressTypeServices,
    ContactLicenseTypeServices,
    ContactTitleServices,
    PrefixServices,
    StateServices,
    CityServices,
    DocumentTypeServices,
    GroupServices,
    UserGroupServices,
    VerbiagesServices,
    EmployeeServices,
    CompanyServices,
    ContactServices,
    DocumentServices,
    CompanyTypesServices,
    LicenseTypesServices,
    CompanyLicenseTypesServices,
    DocumentTypesServices,
    JobContactTypesServices,
    JobTimenoteCategoriesServices,
    SeismicDesignCategoriesServices,
    StructureOccupancyCategoriesServices,
    CompanyTaxTypesServices,
    ConstructionClassificationsServices,
    PrimaryStructuralSystemsServices,
    StatesServices,
    JobComponent,
    GlobalSearchServices,
    TransmittalServices,
    NotificationServices,
    ReviewServices,
    TaskTypeServices,
    SystemSettingsServices,
    JobReasonServices,
    SharedDataService,
    JobDocumentServices,
    JobViolationServices,
    SharedService,
    GetAppNoOnSelectRow,
    PenaltyCodeServices,
    JobSharedService,
    HolidayCalendarServices,
    DepCostSettingServices,
    ApplicationTypeServices,
    WorkPermitTypeServices,
    ManageGroupServices,
    OwnerTypeServices,
    HomeServices,
    ReportServices,
    DobPenaltyServices,
    FdnyPenaltyServices,
    DotPenaltyServices,
    DohmhPenaltyServices,
    DepNoiseCodePenaltyServices,
    CheckListGroupServices,
    CheckListItemMaterServices,
    JobCheckListServices,
    NewsLetterServices,
    DataTableExtensionsService
  ],
  entryComponents: [
    RequestNewProjectComponent,
    MessageSentSuccessModalComponent
  ]
})
export class AppModule {
  constructor(private dataTableExtensionsService: DataTableExtensionsService) {
    dataTableExtensionsService.init();
    //AppModule.injector = injector;
  }
}