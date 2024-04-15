import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';

declare const process: any
import * as jstz from 'jstz';
import { Timezone } from '../app/utils/timezones';

let applicationTimezone = "India Standard Time"
let tz = jstz.determine().name()
//let code = new Date().toString().match(/\(([A-Za-z\s].*)\)/)[1];
//let gmt = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1];

let zone = new Timezone()
let header = zone.tz

//let timezoneHeader = header.filter(x => x.abbr == code && x.text == gmt)[0];
let timezoneHeader = header.filter(x => (x.GMT.filter(g => g == tz)[0]) == tz)[0];
if (timezoneHeader && timezoneHeader.value) {
  applicationTimezone = timezoneHeader.value
}

export class constantValues {
  CREATE = 'create'
  VIEW = 'view'
  DELETE = 'delete'

  JOBOBECT = 'jobObject'
  SELECTEDJOBTYPE = 'selectedJobType'
  JOBID = 'JobId'
  //Rights value
  COMPANY = 'company'
  CONTACTS = 'contacts'
  EMPLOYEEMODULE = 'Employee'
  OTHERMODULE = 'Other'
  JOBMODULE = 'Project'
  EMPLOYEE = 'employeeEmployeeInfo'
  DOCUMENT = 'referenceDocuments'
  RFP = 'Proposal'
  JOBS = 'jobs'
  TASKS = 'tasks'
  MASTERS = 'masters'
  JOB_IN_PROGRESS = 'Make the job in-progress to perform this action'
  JOB_RE_OPEN = 'Re-open the job to perform this action'
  maxEmailAttachmentSize = 23000000
  currentTimeZone = applicationTimezone//'India Standard Time'
  DATETIMEFORMAT = 'MM/DD/YYYY hh:mm A'
  DATETIMEFORMATWITHAMPM = 'MM/DD/YYYY hh:mm A'
  DATEFORMAT = 'MM/DD/YYYY'
  TIMEFORMAT = 'HH:mm'
  DOBPULLPERMITCODE = 'DOB-PERMIT'
  LOCPULLPERMITCODE = 'LOC'
  COOPULLPERMITCODE = 'COO'
  VARPMTPULLPERMITCODE = 'VARPMT'
  TIMEFORMATWITHMERIDIAN = 'hh:mm A'
  PW517DOCUMENTID = 144
  CKEDITORCONFIGSETTING: any = {
    font_defaultLabel: 'Times New Roman',
    fontSize_defaultLabel: '13px',
    autoParagraph: false,
    toolbarGroups: [
      {name: 'clipboard', groups: ['undo']},
      {name: 'basicstyles', groups: ['basicstyles', 'cleanup']},
      {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align']},
      {name: 'links'}, '/',
      {name: 'styles', groups: ['fontsize']},
      {name: 'colors'}
    ],// ,removePlugins:'font'

    'contentsCss': 'html, iframe, body {margin:15px; font-family: "Times New Roman", Times, serif; font-size: 13px;color: #333} p {margin:0; font-size: 13px;color: #333} li {margin:0;font-size: 13px;color: #333}'
  }

  //permission values
  TOTALPERMISSIONS = 69
  EMPLOYEEUSERGROUPINFO = 'User Group'
  COMPANYPERMISSION = 'Company'
  RFPPERMISSION = 'Proposal'
  REPORTPERMISSION = 'Report'
  ADDRESSPERMISSION = 'Address'
  CONTACTPERMISSION = 'Contact'
  FEESCHEDULEMASTERPERMISSION = 'Fee Schedule Master'
  MASTERDATAPERMISSION = 'Master Data'
  REFERENCEDOCUMENTPERMISSION = 'Reference Document'
  REFERENCELINKSPERMISSION = 'Reference Links'
  EMPLOYEEINFO = 'Employee Info'
  CONTACTINFO = 'Contact Info'
  EMERGENCYCONTACTINFO = 'Emergency contact info'
  PHONEINFO = 'Phone info'
  SYSTEMACCESSINFORMATION = 'System Access Information'
  AGENTCERTIFICATE = 'Agent Certificates'
  PERSONALINFORMATION = 'Personal Information'
  DOCUMENTSMODULE = 'Document(s)'
  STATUS = 'Status'
  APPLICATIONANDWORKPERMIT = 'Applications & Work permits'
  TRANSMITTALS = 'Transmittals'
  JOBSCOPEMODULE = 'Project scope'
  JOBMILESTONEMODULE = 'Billing Points'
  JOBTASKSMODULE = 'Project Tasks'
  JOBDOCUMENTSMODULE = 'Project Documents'
  JOBCONTACTSMODULE = 'Project Contacts'
  JOBDVIOLATION = 'Violation'
  JOBTIMENOTES = 'Project TimeNotes'
  CHECKLIST = 'Checklist'
  CUSTOMER = 'Customer'
  SENDEMAILCONTACT = 'Send Email to Contact'
  SENDEMAILRPO = 'Send Email to RPO'
  DASHBOARD = 'Dashboard'
  CHECKLISTCLIENTNOTE = 'Checklist-Client Note'

  EXPORTCHECKLIST = 'Export Checklist'
  EXPORTPROJECT = 'Export Project'

  VIEWALLVIOLATIONS = 'View All Violations'
  VIEWPERMITEXPIRYREPORT = 'View Permit Expiry Report'
  VIEWAHVPERMITEXPIRYREPORT = 'View AHV Permit Expiry Report'
  VIEWAPPLICATIONSTATUSREPORT = 'View Application Status Report'
  VIEWCONTRACTORINSURANCESEXPIRYREPORT = 'View Contractor Insurances Expiry Report'
  VIEWCONTACTLICENSEEXPIRYREPORT = 'View Contact License Expiry Report'
  VIEWCONSOLATEDSTATUSREPORT = 'View Consolidated Status Report'
  VIEWPROPOSALSREPORT = 'View Proposals (Open or not sent to Client) Report'
  VIEWUNSYNCTIMENOTEREPORT = 'View Unsync Timenote Report'


  /// <SUMMARY>
  /// THE VIEW ADDRESS
  /// </SUMMARY>
  VIEWADDRESS = 1;

  /// <SUMMARY>
  /// THE ADD ADDRESS
  /// </SUMMARY>
  ADDADDRESS = 2;


  /// <SUMMARY>
  /// THE DELETE ADDRESS
  /// </SUMMARY>
  DELETEADDRESS = 3;

  /// <SUMMARY>
  /// THE VIEW COMPANY
  /// </SUMMARY>
  VIEWCOMPANY = 4;

  /// <SUMMARY>
  /// THE ADD COMPANY
  /// </SUMMARY>
  ADDCOMPANY = 5;


  /// <SUMMARY>
  /// THE DELETE COMPANY
  /// </SUMMARY>
  DELETECOMPANY = 6;

  /// <SUMMARY>
  /// THE EXPORT COMPANY
  /// </SUMMARY>
  EXPORTCOMPANY = 7;

  /// <SUMMARY>
  /// THE VIEW CONTACT
  /// </SUMMARY>
  VIEWCONTACT = 8;
  /// <SUMMARY>
  /// THE ADD CONTACT
  /// </SUMMARY>
  ADDCONTACT = 9;

  /// <SUMMARY>
  /// THE DELETE CONTACT
  /// </SUMMARY>
  DELETECONTACT = 10;
  /// <SUMMARY>
  /// THE EXPORT CONTACT
  /// </SUMMARY>
  EXPORTCONTACT = 11;

  /// <SUMMARY>
  /// THE VIEW RFP
  /// </SUMMARY>
  VIEWRFP = 12;
  /// <SUMMARY>
  /// THE ADD RFP
  /// </SUMMARY>
  ADDRFP = 13;

  /// <SUMMARY>
  /// THE DELETE RFP
  /// </SUMMARY>
  DELETERFP = 14;

  /// <SUMMARY>
  /// THE VIEW JOB
  /// </SUMMARY>
  VIEWJOB = 15;
  /// <SUMMARY>
  /// THE ADD JOB
  /// </SUMMARY>
  ADDJOB = 16;
  /// <SUMMARY>
  /// THE DELETE JOB
  /// </SUMMARY>
  DELETEJOB = 17;

  /// <SUMMARY>
  /// THE ADD APPLICATIONS WORKPERMITS
  /// </SUMMARY>
  ADDAPPLICATIONSWORKPERMITS = 18;

  /// <SUMMARY>
  /// THE DELETE APPLICATIONS WORKPERMITS
  /// </SUMMARY>
  DELETEAPPLICATIONSWORKPERMITS = 19;

  /// <SUMMARY>
  /// THE ADD TRANSMITTALS
  /// </SUMMARY>
  VIEWTRANSMITTALS = 20;
  /// <SUMMARY>
  /// THE EDIT TRANSMITTALS
  /// </SUMMARY>
  ADDTRANSMITTALS = 21;
  /// <SUMMARY>
  /// THE DELETE TRANSMITTALS
  /// </SUMMARY>
  DELETETRANSMITTALS = 22;
  /// <SUMMARY>
  /// THE PS TRANSMITTALS
  /// </SUMMARY>
  PRINTEXPORTTRANSMITTALS = 23;
  /// <SUMMARY>
  /// THE ADD JOBSCOPE
  /// </SUMMARY>
  VIEWJOBSCOPE = 24;
  /// <SUMMARY>
  /// THE EDIT JOBSCOPE
  /// </SUMMARY>
  ADDJOBSCOPE = 25;
  /// <SUMMARY>
  /// THE DELETE JOBSCOPE
  /// </SUMMARY>
  DELETEJOBSCOPE = 26;
  /// <SUMMARY>
  /// THE VIEW JOBMILESTONE
  /// </SUMMARY>
  VIEWJOBMILESTONE = 27;
  /// <SUMMARY>
  /// THE ADD JOBMILESTONE
  /// </SUMMARY>
  ADDJOBMILESTONE = 28;
  /// <SUMMARY>
  /// THE EDIT JOBMILESTONE
  /// </SUMMARY>
  DELETEJOBMILESTONE = 29;

  /// <SUMMARY>
  /// THE ADD JOB TASKS
  /// </SUMMARY>
  ADDJOBTASKS = 30;

  /// <SUMMARY>
  /// THE DELETE JOB TASKS
  /// </SUMMARY>
  DELETEJOBTASKS = 31;
  /// <SUMMARY>
  /// THE VIEW REPORT
  /// </SUMMARY>
  VIEWREPORT = 32;
  /// <SUMMARY>
  /// THE EXPORT REPORT
  /// </SUMMARY>
  EXPORTREPORT = 33;

  /// <SUMMARY>
  /// THE VIEW REFERENCE LINKS
  /// </SUMMARY>
  VIEWREFERENCELINKS = 34;
  /// <SUMMARY>
  /// THE VIEW REFERENCE DOCUMENT
  /// </SUMMARY>
  VIEWREFERENCEDOCUMENT = 35;
  /// <SUMMARY>
  /// THE ADD REFERENCE DOCUMENT
  /// </SUMMARY>
  ADDREFERENCEDOCUMENT = 36;

  /// <SUMMARY>
  /// THE DELETE REFERENCE DOCUMENT
  /// </SUMMARY>
  DELETEREFERENCEDOCUMENT = 37;
  /// <SUMMARY>
  /// THE VIEW MASTER DATA
  /// </SUMMARY>
  VIEWMASTERDATA = 38;
  /// <SUMMARY>
  /// THE ADD MASTER DATA
  /// </SUMMARY>
  ADDMASTERDATA = 39;

  /// <SUMMARY>
  /// THE DELETE MASTER DATA
  /// </SUMMARY>
  DELETEMASTERDATA = 40;
  /// <SUMMARY>
  /// THE VIEW EMPLOYEE USER GROUP
  /// </SUMMARY>
  VIEWEMPLOYEEUSERGROUP = 41;
  /// <SUMMARY>
  /// THE ADD EMPLOYEE USER GROUP
  /// </SUMMARY>
  ADDEMPLOYEEUSERGROUP = 42;

  /// <SUMMARY>
  /// THE DELETE EMPLOYEE USER GROUP
  /// </SUMMARY>
  DELETEEMPLOYEEUSERGROUP = 43;
  /// <SUMMARY>
  /// THE VIEW EMPLOYEE
  /// </SUMMARY>
  VIEWEMPLOYEE = 44;
  /// <SUMMARY>
  /// THE ADD EMPLOYEE
  /// </SUMMARY>
  ADDEMPLOYEE = 45;

  /// <SUMMARY>
  /// THE DELETE EMPLOYEE
  /// </SUMMARY>
  DELETEEMPLOYEE = 46;
  /// <SUMMARY>
  /// THE VIEW EMPLOYEE INFORMATION
  /// </SUMMARY>
  VIEWEMPLOYEEINFO = 47;

  /// <SUMMARY>
  /// THE EDIT EMPLOYEE INFORMATION
  /// </SUMMARY>
  EDITEMPLOYEEINFO = 48;
  /// <SUMMARY>
  /// THE VIEW CONTACT INFORMATION
  /// </SUMMARY>
  VIEWCONTACTINFO = 49;
  /// <SUMMARY>
  /// THE EDIT CONTACT INFORMATION
  /// </SUMMARY>
  EDITCONTACTINFO = 50;
  /// <SUMMARY>
  /// THE VIEW PERSONAL INFORMATION
  /// </SUMMARY>
  VIEWPERSONALINFORMATION = 51;
  /// <SUMMARY>
  /// THE EDIT PERSONAL INFORMATION
  /// </SUMMARY>
  EDITPERSONALINFORMATION = 52;
  /// <SUMMARY>
  /// THE VIEW AGENT CERTIFICATES
  /// </SUMMARY>
  VIEWAGENTCERTIFICATES = 53;
  /// <SUMMARY>
  /// THE EDIT AGENT CERTIFICATES
  /// </SUMMARY>
  EDITAGENTCERTIFICATES = 54;
  /// <SUMMARY>
  /// THE VIEW SYSTEM ACCESS INFORMATION
  /// </SUMMARY>
  VIEWSYSTEMACCESSINFORMATION = 55;
  /// <SUMMARY>
  /// THE EDIT SYSTEM ACCESS INFORMATION
  /// </SUMMARY>
  EDITSYSTEMACCESSINFORMATION = 56;

  /// <SUMMARY>
  /// THE VIEW DOCUMENTS
  /// </SUMMARY>
  VIEWDOCUMENTS = 57;
  /// <SUMMARY>
  /// THE EDIT DOCUMENTS
  /// </SUMMARY>
  EDITDOCUMENTS = 58;
  /// <SUMMARY>
  /// THE VIEW STATUS
  /// </SUMMARY>
  VIEWSTATUS = 59;
  /// <SUMMARY>
  /// THE EDIT STATUS
  /// </SUMMARY>
  EDITSTATUS = 60;
  /// <SUMMARY>
  /// THE VIEW PHONEINFO
  /// </SUMMARY>
  VIEWPHONEINFO = 61;
  /// <SUMMARY>
  /// THE EDIT PHONEINFO
  /// </SUMMARY>
  EDITPHONEINFO = 62;
  /// <SUMMARY>
  /// THE VIEW EMERGENCYCONTACTINFO
  /// </SUMMARY>
  VIEWEMERGENCYCONTACTINFO = 63;
  /// <SUMMARY>
  /// THE EDIT EMERGENCYCONTACTINFO
  /// </SUMMARY>
  EDITEMERGENCYCONTACTINFO = 64;
  /// <SUMMARY>
  /// THE VIEW FEE SCHEDULE MASTER
  /// </SUMMARY>
  VIEWFEESCHEDULEMASTER = 65;
  /// <SUMMARY>
  /// THE CREATE FEE SCHEDULE MASTER
  /// </SUMMARY>
  ADDFEESCHEDULEMASTER = 66;

  /// <SUMMARY>
  /// THE DELETE FEE SCHEDULE MASTER
  /// </SUMMARY>
  DELETEFEESCHEDULEMASTER = 67;
  /// <SUMMARY>
  /// THE ADD JOB DOCUMENTS
  /// </SUMMARY>
  ADDJOBDOCUMENTS = 68;

  /// <SUMMARY>
  /// THE DELETE JOB DOCUMENTS
  /// </SUMMARY>
  DELETEJOBDOCUMENTS = 69;

  /// <SUMMARY>
  /// THE ADD JOB VIOLATIONS
  /// </SUMMARY>
  ADDEDITVIOLATION = 70

  /// <SUMMARY>
  /// THE DELETE JOB VIOLATIONS
  /// </SUMMARY>
  DELETEVIOLATION = 71;

  /// <SUMMARY>
  /// THE DELETE JOBSCOPE
  /// </SUMMARY>
  COSTJOBSCOPE = 72;


  /// <SUMMARY>
  /// THE ADD JOB VIOLATIONS
  /// </SUMMARY>
  EDITCOMPLETEDJOBTASKS = 73;

  /// <SUMMARY>
  /// VIEW COMPLETED SCOPE REPORT
  /// </SUMMARY>
  VIEWCOMPLETESCOPEREPORT = 74;
  /// <SUMMARY>
  /// VIEW CLOSED SCOPE REPORT
  /// </SUMMARY>
  VIEWCLOSEDSCOPEREPORT = 75;

  VIEWCHECKLIST = 76;

  // ADDEDITJOBTIMENOTES = 76;

  // ADDCHECKLIST = 83;
  // DELETECHECKLIST = 84;
  // VIEWCHECKLIST = 82;


  ADDCHECKLIST = 77;
  DELETECHECKLIST = 78;

  VIEWCUSTOMER = 79;

  ADDEDITCUSTOMER = 80;

  DELETECUSTOMER = 81;

  CHECKLISTCLIENTNOTEID = 82;

  DASHBOARDID = 83;

  SENDEMAILRPOID = 84;

  VIEWSENDEMAILCONTACT = 85;

  EXPORTCHECKLISTID = 86;


  /// <SUMMARY>
  /// THE ADD JOB CONTACT
  /// </SUMMARY>
  VIEWJOBCONTACT = 87;

  /// <SUMMARY>
  /// THE ADD JOB CONTACT
  /// </SUMMARY>
  ADDEDITJOBCONTACT = 88

  /// <SUMMARY>
  /// THE DELETE JOB CONTACT
  /// </SUMMARY>
  DELETEJOBCONTACT = 89;

  VIEWCOMPLETEDJOBTASKS = 90;

  VIEWECBVIOLATION = 91;

  VIEWDOBVIOLATION = 92;

  ADDEDITDOBVIOLATION = 93;

  DELETEDOBVIOLATION = 94;

  VIEWAPPLICATIONSWORKPERMITS = 95;

  EXPORTPROJECTID = 96;

  // VIEWAPPLICATIONSWORKPERMITS = 97;

  VIEWALLVIOLATIONID = 97;
  // VIEWALLVIOLATIONID = 99;
  VIEWPERMITEXPIRYREPORTID = 98;
  // VIEWPERMITEXPIRYREPORTID = 100;
  VIEWAHVPERMITEXPIRYREPORTID = 99;
  VIEWAPPLICATIONSTATUSREPORTID = 100;
  VIEWCONTRACTORINSURANCESEXPIRYREPORTID = 101;
  VIEWCONTACTLICENSEEXPIRYREPORTID = 102;
  VIEWCONSOLIDATEDSTATUSREPORTID = 103;
  VIEWPROPOSALSREPORTID = 104;
  VIEWUNSYNCTIMENOTEREPORTID = 105;

    VIEWDOBSAFETYVIOLATION = 106;
    ADDEDITDOBSAFETYVIOLATION = 107;
    DELETEDOBSAFETYVIOLATION = 108;

  // VIEWPROPOSALSREPORTID = 106;
  // VIEWAHVPERMITEXPIRYREPORTID = 101;
  // VIEWAPPLICATIONSTATUSREPORTID = 102;
  // VIEWCONTRACTORINSURANCESEXPIRYREPORTID = 103;
  // VIEWCONSOLIDATEDSTATUSREPORTID = 105;
  // VIEWUNSYNCTIMENOTEREPORTID = 107;

  ECBVIOLATION = "ECB Violations";
  // ADDEDITECBVIOLATION = 70;
  // VIEWECBVIOLATION = 93;
  DELETEECBVIOLATION = 71;

  DOBVIOLATION = "DOB Violations";
    
    DOBSAFETYVIOLATION = "DOB Safety Violations";

}


// Passing Data From  child compoent To Parent Component.

@Injectable()
export class SharedDataService {
  private _listners = new Subject<any>();

  listen(): Observable<any> {
    return this._listners.asObservable();
  }

  filter(filterBy: any) {
    this._listners.next(filterBy);
  }
}

// get selected job type based on selection of radio button of job type in job detail page

@Injectable()
export class SharedService {
  getSelectedJobAppType = new EventEmitter<any>();
  getJobEdit = new EventEmitter<any>();
  getJobStatus = new EventEmitter<any>();
  getJobTaskFromHeader = new EventEmitter<any>();
  getJobTimeNoteFromInfo = new EventEmitter<any>();
  getJobTransmittalFromHeader = new EventEmitter<any>();
  getApplicationCount = new EventEmitter<any>();
  getDotApplicationCount = new EventEmitter<any>();
  getrefreshJob = new EventEmitter<any>();
  clearGlobalSearch = new EventEmitter<any>();
  localFilter: any = {};
  companyLocalFilter: any = {};
  contactLocalFilter: any = {};
  rfpLocalFilter: any = {};
  taskLocalFilter: any = {};
  localJobFilter: any = {};
  getJob = new EventEmitter<any>();
}

@Injectable()
export class GetAppNoOnSelectRow {
  getAppNumber = new EventEmitter<any>();
} 