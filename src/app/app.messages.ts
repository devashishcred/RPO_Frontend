
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

declare var $: any;

@Injectable()
export class Message {
    public msg: {}

    constructor() {
        this.msg = {

            companyName: 'Company name is required ',
            companyType: 'Company type is required',
            requireTelephone: ' Telephone is required',
            phone: 'Enter 10-digits phone number',
            fax: 'Enter 10-digits fax number',
            workPhone: 'Enter 10-digits work phone',
            Ext: 'Ext is required',
            emergencyContact: 'Enter 10-digits Emergency Contact Number',
            homePhone: 'Enter 10-digits Home phone',
            mobilePhone: 'Enter 10-digits Mobile phone',
            otherNumber: 'Enter 10-digits Other number',
            requireFirstName: 'First name is required',
            requireLastName: 'Last name is required',
            requireEmail: 'Email is required',
            validEmail: "Enter valid email ID",
            validZip: "Enter valid zip code",
            requireUserGroup: "User group is required",
            requirePrefix: "Prefix is required",
            requireTitle: "Title is required",
            requireWorkPhone: "Work phone is required",
            requireCellNumber: "Cell number is required",
            requireBorough: "Borough is required",
            requireBoroughName:"Borough Name is required",
            requireHouseNumber: "House# is required",
            requireStreet: "Street Name is required",
            requireAddressType: "Address type is required",
            requireAddress: "Address is required",
            requireFloor: "Floor is required",
            requireApartment: "Apartment is required",
            requireSpecialPlace: "Special place name is required",
            requireContact: "Contact is required",
            requireAddress1: "Address 1 is required",
            requireJobType: "Job type is required",
            requireDocCode: "Document Code is required",
            requirePassword: "Password is required",
            requireDocName: "Document Name is required",
            requireDocKeywords: "Document Keyword is required",
            requireDocDescription: "Document Description is required",
            requireDocFileContent: "Document File is required",
            requireContactType: "Contact Type is required",
            requirePm: "Project Manager is required",
            requirePc: "Project Coordinator is required",
            requireSignOffCoordinator: "Sign-off Coordinator is required",
            requireStartDate: "Start Date is required",
            certificateType: "Certificate Type is required",
            certificateId: "Certificate ID is required",
            requireAddressState: "State is required",
            requireLicenceType: "License Type is required",
            requireLicenceDate: "License Exp. Date is required",
            applications: "Application type is required",
            projectType: "Project  type is required",
            requireminlengthPassword: "Password should be at least 6-characters long",
            companyZipCode: "Enter valid zip code",
            companyUrl: "Enter valid URL",
            companyPhone: "Enter valid Phone Number",
            applicationNumber: "Tracking# should be of 9 characters",
            requireSentVia: "Sent Via is required",
            requireMailType: "Transmittal type is required",
            requireMailAttention: "Contact is required",
            requireMailTo: "To is required",
            requireMailFrom: "From is required",
            requireJobApplicationType: "Application type is required",
            requireWokType:"Work Type is required",
            requireJobApplicationTypeForDob: "Type is required",
            requireDepStatus: "Status is required",
            requireJobWorkPermitType: "Work/Permit type is required",
            onlyAllowAlphaNumericAppNum: "Tracking# should be alphanumeric only",
            onlyNumericCost: "Estimated Cost should be numeric",
            onlyCostDEP: "Cost should be numeric",
            requiredApplicationNumber: "Tracking# is required",
            requiredApplicationDOBNumber: "Application# is required",
            requiredFloorsWorkOnFloors:"Work on Floor (s) is required",
            requiredAssignedDate: "Assigned On date is required",
            requiredTo: "Assigned To is required",
            requiredBy: "Assigned By is required",
            requiredTaskType: "Task Type is required",
            requiredComplete: "Due Date is required",
            requiredStatus: "Task status is required",
            requiredDaysToSetReminder: "Days is required",
            requireCompany: "Company is required",
            requiredProgressionNote: "Progression Notes is required",
            twoCompanyTypeSelected: "Select any one of General Contractor or Special Inspection Agency / Concrete Testing Lab",
            requiredDueDateSmaller: "Due date should be greater than Assigned on date",
            requiredExaminer: "Plan Examiner is required",
            saveDiscardMsg: "WARNING: You have unsaved changes. Press Cancel to go back and save the changes, or press OK to continue.",
            reminderDays: "Days should be numeric",
            noAddressFound: "Address details not found",
            requiredAppointment: "Appointment Date is required",
            requireMilestone: "Enter all Billing point details",
            requiredCompletedDateSmaller: "Completed date should be greater than Filed On date",
            requiredSignOffDateSmaller: "Signed-off date should be greater than Filed On date",
            requiredExpiryDateSmaller: "Expiry date should be greater than Issued On date",
            requiredWithdrawnDateSmaller: "Withdrawn date should be greater than Issued On date",
            requiredStartDate: "End Date should be greater than Start Date",
            noRfpRelatedWithJob: "No RFP related with this job",
            taxIdMinLength: "Enter 9-digit Tax ID",
            requireTimeNoteCategory: "Category is required",
            requireTimeNoteDate: "Date is required",
            requireTimeNoteTime: "Time hours is required",
            TimeNoteHoursTimeIsZero: "Time hours cannot be zero",
            requiredAddressTypeName: "Address type is required",
            requiredAddressTypePriorityOrder: "Priority order is required",
            addressTypePriorityOrderIsNumeric: "Priority order should be numeric",
            requiredContactTitleName: "Contact Title is required",
            requireSubject: "Subject is required",
            successDraft: "Transmittal saved successfully",
            successEmail: "Transmittal sent successfully",
            requiredSentViaName: "Sent Via name is required",
            requiredDefaultName: "Default CC is required",
            requireDescription: "Description is required",
            recordupdated: "Record updated",
            recordcreated: "Record added",
            requiredEmailName: "Name is required",
            requiredEmailSubject: "Subject is required",
            requiredEmailBody: "Email body is required",
            requiredEmailType: "Select module(s) to avail email types in, while sending email",
            requirename: "Name is required",
            requiredescription: "Description is required",
            labelSuccess: "Label generated successfully",
            birthDate: "Birth date cannot be greater than current date",
            requiredSelectedCC: "RPO employee(s) are required",
            updatebisInfo: "Do you want to update this company info in COR?",
            addressInfo: "Do you want to update this address info?",
            noResultForBis: "No information found from BIS",
            requireacronym: "Acronym is required",
            requireGlobalText: "Enter search criteria",
            deleteNotificationMsg: "Notification dismissed",
            requiredMinimum: "Minimum value must be greater than 0",
            requiredMaximum: "Maximum value is required",
            Minimun: "Minimum value must be greater than 0",
            MaxMinimun: "Maximum value must be greater than minimum value",
            requriredCost: "Cost must be greater than 0",
            MaximumTwoRequired: "Maximum 2 reviewers can be selected",
            requireReviewer: "Reviewer is required",
            requireAdditionalPrice: "Additional Price is required",
            requirServicename: "Service Item Name is required",
            mileStoneCost: "Billing point Total cost cannot be greater than proposal cost",
            requiredMilestoneCostNotZero: "Billing point cost cannot be blank or zero",
            requireJobTypeName: "Job Type Name is required",
            requireJobTypeDescriptionName: "Job Type Description Name is required",
            requireJobSubTypeName: "Job Sub-type Name is required",
            requireServiceGroup: "Service Group Name is required",
            requireServiceItemName: "Service Item Name is required",
            requiredMilestoneService: "Select at least one Billing point service", //REMOVE-REMOVE
            requiredMilestoneCostValue: "Billing point description/Service name cannot be blank and/or cost cannot be zero", //REMOVE-REMOVE
            requireDisplayOrder: "Display order is required",
            requireGenrealNote: "General note is required",
            successLinkRFPWithJob: "RFP successfully linked with job",
            successMileStonePOUpdate: "PO# updated successfully",
            successItemPOUpdate: "Service Item PO# updated successfully",
            successMileStoneInvoiceNumUpdate: "Invoice# updated successfully",
            successItemInvoiceNumUpdate: "Service Item Invoice# updated successfully",
            successMileStoneInvoiceDateUpdate: "Invoice date updated successfully",
            successItemInvoiceDateUpdate: "Service Item Invoice date updated successfully",
            successMileStoneStatusUpdate: "Billing point status updated successfully",
            successScopeSave: "Scope added sucessfully",
            milestoneName: "Billing point is required",
            milestoneCost: "Billing point cost is required",
            milestoneService: "Billing point services is required",
            milestoneStatus: "Billing point status is required",
            requireServiceQty: "Service Quantity must be greater than 0",
            Reason: "Reason is required",
            updatecompanyBisInfo: "Do you want to fill these details?",
            updateCompanyFromGetInfo: "Do you want to update these details in COR?",
            requireServiceItem: "Service item/Billing Point is required",
            noTaskForScope: "No task created for this scope",
            noTimeNoteForScope: "No time note created for this scope",
            deleteScopeSuccess: "Job scope deleted successfully",
            requireUserGroupName: "User group name cannot be blank",
            viewAddCannotRemove: "Add/edit permission is exsits, you cannot remove view rights directly", // REMOVE-REMOVE
            viewDeleteCannotRemove: "Add/Edit/Delete/Export permission is exsits, you cannot remove view rights directly",  //REMOVE-REMOVE
            invalidInvoiceDate: "Invoice date is in invalid format",
            selectAtLeastOnePermission: "At least one permission should be selected for the user group",
            recordCreatedSuccessfully: "Record created successfully",
            recordUpdatedSuccessfully: "Record updated successfully",
            permissionChanged: "Permission has been changed successfully",
            OnholdDelete: 'Please Change the status to In-progress to delete',
            costRequired: 'Cost is required',
            requireVerbiageType: 'Verbiage Type is required',
            requiredSummonsNumber: 'Summons/Notice# is required',
            violationCreated: 'Violation created successfully',
            violationUpdated: 'Violation updated successfully',
            addedMilestone: 'Billing point added successfully',
            requireJobMilestone: 'Please Add Billing point Details',
            updatedMilestone: 'Billing point updated successfully',
            deletedMilestone: 'Billing point deleted successfully',
            requiredPenaltyCodeSection: 'Code section is required',
            requiredPenaltyCode: 'Penalty code is required',
            requiredDescription: 'Description is required',
            requiredSuffixDescription: 'Description is required',
            requiredprefixDescription: 'Prefix name is required',
            requirePermitNumber: 'Permit number is required',
            successMultipleWorkPermit: 'Work Permits added successfully',
            costTypeRequired: 'Cost type is required',
            successUploadPermit: "Work permit imported successfully",
            requiredSummonsLength: "Summons/Notice# must be of 9 characters",
            updateJobSuccess: 'Job updated successfully',
            createJobSuccess: 'Job created successfully',
            status: 'Record updated successfully',
            hearingDate: 'Hearing date updated successfully',
            resolveDate: 'Resolve date updated successfully',
            fillyResolved: 'Record updated successfully',
            noExplainationCharges: 'No explaination charges are found',
            DueDate: 'Due date updated successfully',
            otherPhone: 'Enter 10-digits other phone',
            errorInDueDate: 'Due date should be greater than Assigned on date',
            noResultFoundCommon: 'No records found',
            assignTo: 'Assigned to updated successfully.',
            statusOftask: 'Status updated successfully.',
            requireHolidayDate: 'Holiday date is required',
            requireDays: 'Days is required',
            requirePrice: 'Price is required',
            requireApplicationTypeName: 'Application type name is required',
            requireApplicationType: 'Application type is required',
            requireWorkPermitTypeName: 'Work permit type is required',
            validMinutes: "Minutes allowed between 00 and 59",
            validHoursinTimeNote: "Hours should be greater than 0",
            requriredGroupName: "Group name is required",
            GroupAtTime: 'You can add 1 Group at a time',
            editTimeNote: 'Time Note edited successfully',
            addTimeNote: 'Time Note added successfully',
            GroupDeleted: 'Group Deleted successfully',
            GroupUpdated: 'Group updated successfully',
            GroupNoRecordFound: 'No groups found',
            GroupCreated: 'Group created successfully',
            binNumberOrApplication:'Either Application number or Bin number does not exist',
            applicationNoNotAvailable: 'Application number does not exist',
            permitNotExsits:'Permit document does not exist',
            binNumberNotExist: 'Bin number does not exist for this job',
            requireIinfractionCode: 'Iinfraction Code is required',
            requireOATHViolationCode: 'OATH Violation Code is required',
            requireSection: 'Section is required',
            requireSectionOfLaw: 'Section of Law is required',
            successLOCPullPermitMsg: 'Permit PDF has been attached',
            errorLOCPullPermitMsg: 'Permit PDF does not exist on BIS',
            blankExplanationCharges: 'All fields of explanation charges are required',
            successAddPageMsg: 'Page added successfully',
            errorAddPageMsg: 'Error occured while adding page',
            requireApplication: 'Application is required',
            requireApplicant: 'Applicant is required',
            requireMainAHVWorkContact: 'Main AHV Work Contact is required',
            requireReasonForVariance: 'Reason for Variance is required',
            nextDate:'Next Date Needed is reuired',
            requireNumberOfDays: 'Number of Days is required',
            requireAHVReferenceNumber: 'AHV Reference# is required',
            timenoteDescription: "Description cannot be more than 4065 characters",
            mailSubject: "Subject cannot be more than 200 characters",
            requireCityName: "City name is required",
            requiredOldPassword:"Old password is required",
            requiredNewPassword:"New password is required",
            minLengthNewPassword:"The password should have at least 8 characters",
            maxLengthNewPassword:"The password should have not more then 20 characters",
            requiredConfirmPassword:"Confirm Password is required",
            requiredMatchConfirmPassword:"New passsword and Confirm Password didn't match",
            requiredCustomerSupportMessage:"Customer support message is required",
            requiredProjectName: "Project name is required",
            requiredProjectDesc:" Project description is required",
            requiredNewsTitle:" News title required",
            requiredNewsImagePath:" News image path required",
            requiredNewsUrl:" News url required",
            requiredNewsDescription:" News description required",
        }
    }
}