import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute, NavigationEnd, NavigationStart } from '@angular/router';
import { API_URL } from '../../app.constants';
//import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { constantValues } from './../../app.constantValues';

declare var $: any;

/**
 * ReportServices contains all services related to Reports
 * @class ReportServices
 */
@Injectable()
export class ReportServices {

  private reportAllViolationsUrl = API_URL + 'api/ReportAllViolations';
  private reportCustomerAllViolationsUrl = API_URL + 'api/GetReportAllViolationsForCustomer';
  private reportAfterHourVarianceUrl = API_URL + 'api/ReportAHVExpiry';
  private reportPermitExpirysUrl = API_URL + 'api/ReportPermitsExpiry';
  private reportCustomerPermitExpirysUrl = API_URL + 'api/GetCustomerReportPermitsExpiry';
  private gcInsuranceExpiryUrl = API_URL + 'api/ReportContractorInsurancesExpiry';
  private certificationStatusUrl = API_URL + 'api/ReportAllViolations/certificationstatusdropdown';
  private violationStatusDropdownUrl = API_URL + 'api/ReportAllViolations/statusdropdown';
  private jobListUrl = API_URL + 'api/Jobs/dropdown';
  private allEmpUrl = API_URL + 'api/employees/AllEmployeedropdown';
  private rfpReportUrl = API_URL + 'api/ReportRfps';
  private completedScopeReportUrl = API_URL + 'api/ReportCompletedScopeBillingPoints';
  private closedJobReportReportUrl = API_URL + 'api/ReportClosedJobsWithOpenBillings';
  private hearingResultDropdownUrl = API_URL + 'api/ReportAllViolations/hearingResultdropdown';
  private applicationStatusReportUrl = API_URL + 'api/ReportApplicationStatus';
  private downloadXlsViolationUrl = API_URL + 'api/ReportAllViolations/exporttoexcel';
  private downloadPdfViolationUrl = API_URL + 'api/ReportAllViolations/exporttopdf';
  private downloadXlsApplicationUrl = API_URL + 'api/ReportApplicationStatus/exporttoexcel';
  private downloadPdfApplicationUrl = API_URL + 'api/ReportApplicationStatus/exporttopdf';
  private downloadXlsAHVUrl = API_URL + 'api/ReportAHVExpiry/exporttoexcel';
  private downloadPdfAHVUrl = API_URL + 'api/ReportAHVExpiry/exporttopdf';
  private downloadXlsPermitExpiryUrl = API_URL + 'api/ReportPermitsExpiry/exporttoexcel';
  private downloadPdfPermitExpiryUrl = API_URL + 'api/ReportPermitsExpiry/exporttopdf';
  private downloadXlsRfpReportUrl = API_URL + 'api/ReportRfps/exporttoexcel';
  private downloadPdfRfpReportUrl = API_URL + 'api/ReportRfps/exporttopdf';
  private downloadXlsClosedJobReportUrl = API_URL + 'api/ReportClosedJobsWithOpenBillings/exporttoexcel';
  private downloadPdfClosedJobReportUrl = API_URL + 'api/ReportClosedJobsWithOpenBillings/exporttopdf';
  private downloadXlsCompletedScopeReportUrl = API_URL + 'api/ReportCompletedScopeBillingPoints/exporttoexcel';
  private downloadPdfCompletedScopeReportUrl = API_URL + 'api/ReportCompletedScopeBillingPoints/exporttopdf';
  private contactLicenceExpiryUrl = API_URL + 'api/ReportContactLicenceExpiry';
  private downloadXlsOverAllPermitUrl = API_URL + 'api/ReportOverallPermitExpiry/exporttoexcel';
  private downloadPdfOverAllPermitUrl = API_URL + 'api/ReportOverallPermitExpiry/exporttopdf';
  private unsynctimenotesUrl = API_URL + 'api/TimenoteUnsyncReport';
  private jobApptypeUrl = API_URL + 'api/JobApplicationType/';
  private emailXLSUrl = API_URL + 'api/ReportAllViolations/exporttoexcelemail';
  private emailPDFUrl = API_URL + 'api/ReportAllViolations/exporttopdfemail';
  private sessionStorage: any

  constructor(
    private http: HttpClient,
    private constantValues: constantValues,
    private router: Router,
    private route: ActivatedRoute,
  ) {

  }

  /**
   * This method is used to get all data related to All violation
   * @method allViolationReport
   * @param {number} id  of job to delete
   */
  allViolationReport(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.reportAllViolationsUrl
    }, cfg))
  }

  /**
   * This method is used to get all data related to All violation
   * @method allViolationReport
   * @param {number} id  of job to delete
   */
  allCustomerViolationReport(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.reportCustomerAllViolationsUrl
    }, cfg))
  }


  /**
   * This method is used to create a new record in database
   * @method create
   * @param {any} data type request Object
   */
  advanceReportSearch(data: any): Observable<any> {
    return this.http.post<any>(this.reportAllViolationsUrl, data)
  }


  /**
   * This method is used to get all data related to COC Violation
   * @method cocViolationReport
   * @param {any} cfg  object of parameters
   */
  cocViolationReport(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.reportAllViolationsUrl
    }, cfg))
  }

  /**
   * This method is used to get all data related to DOB permit expiry
   * @method dobPermitExpiryReport
   * @param {any} cfg  object of parameters
   */
  dobPermitExpiryReport(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.reportPermitExpirysUrl
    }, cfg))
  }

  dobCustomerPermitExpiryReport(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.reportCustomerPermitExpirysUrl
    }, cfg))
  }

  /**
   * This method is used to get all data related to Contractor Insurances Expiry Report
   * @method gcInsuranceReport
   * @param {any} cfg  object of parameters
   */
  gcInsuranceReport(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.gcInsuranceExpiryUrl
    }, cfg))
  }

  unsynctimenotes(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.unsynctimenotesUrl
    }, cfg))
  }

  /**
   * This method is used to get all data related to Contact License Expiry Report
   * @method contactLicenseReport
   * @param {any} cfg  object of parameters
   */
  contactLicenseReport(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.contactLicenceExpiryUrl
    }, cfg))
  }


  /**
   * This method is used to get all data related to RFP Report
   * @method rfpReport
   * @param {any} cfg  object of parameters
   */
  rfpReport(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.rfpReportUrl
    }, cfg))
  }

  /**
   * This method is used to get all data related to Application Status Report
   * @method applicationStatusReport
   * @param {any} cfg  object of parameters
   */
  applicationStatusReport(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.applicationStatusReportUrl
    }, cfg))
  }

  /**
   * This method is used to get all data related to All violation
   * @method ahvReport
   * @param {number} id  of job to delete
   */
  ahvReport(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.reportAfterHourVarianceUrl
    }, cfg))
  }

  /**
   * This method is used to get all data related to completed Scope, Billing Point Report
   * @method completedScopeReport
   * @param {any} cfg  object of parameters
   */
  completedScopeReport(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.completedScopeReportUrl
    }, cfg))
  }

  /**
   * This method is used to get all data related to Closed Job with Open Billing Point Report
   * @method closedJobReport
   * @param {any} cfg  object of parameters
   */
  closedJobReport(cfg: any = {}): any[] {
    return $.fn.dataTable.pipeline($.extend(true, {
      url: this.closedJobReportReportUrl
    }, cfg))
  }

  /**
   *  Get all dropdown data from
   * @method getCertificationstatusDropdown
   */
  getCertificationstatusDropdown() {
    return this.http.get<any>(this.certificationStatusUrl)
  }

  getjobApptype(idJob: any) {
    return this.http.get<any>(this.jobApptypeUrl + idJob)
  }

  /**
   *  Get all dropdown data from
   * @method getViolationtatusDropdown
   */
  getViolationtatusDropdown() {
    return this.http.get<any>(this.violationStatusDropdownUrl)
  }

  /**
   *  Get all dropdown data from
   * @method getHearingResultDropdown
   */
  getHearingResultDropdown() {
    return this.http.get<any>(this.hearingResultDropdownUrl)
  }


  /**
   *  Get all dropdown data from
   * @method getJobListDropdown
   */
  getJobListDropdown() {
    return this.http.get<any>(this.jobListUrl)
  }

  /**
   *  Get all dropdown data from Employees
   * @method getJobListDropdown
   */
  getEmployeeListDropdown() {
    return this.http.get<any>(this.allEmpUrl)
  }

  /**
   * This method download violation report
   * @method downloadViolationReport
   * @param {any} filter Filter Parameter
   * @param {string} type Xls or PDF Type
   */
  downloadViolationReport(filter: any, type: string) {
    if (type == 'xls') {
      return this.http.post<any>(this.downloadXlsViolationUrl, filter)
    } else if (type == 'pdf') {
      return this.http.post<any>(this.downloadPdfViolationUrl, filter)
    } else if (type == 'xlsEmail') {
      return this.http.post<any>(this.emailXLSUrl, filter)
    } else if (type == 'pdfEmail') {
      return this.http.post<any>(this.emailPDFUrl, filter)
    }
  }

  /**
   * This method download overall permit expiry for jobs report
   * @method downloadOverAllPermitExpiryReport
   * @param {any} filter Filter Parameter
   * @param {string} type Xls or PDF Type
   */
  downloadOverAllPermitExpiryReport(filter: any, type: string) {
    if (type == 'xls') {
      return this.http.post<any>(this.downloadXlsOverAllPermitUrl, filter)
    } else if (type == 'pdf') {
      return this.http.post<any>(this.downloadPdfOverAllPermitUrl, filter)
    } else if (type == 'xlsEmail') {
      return this.http.post<any>(this.downloadXlsOverAllPermitUrl + 'email', filter)
    } else if (type == 'pdfEmail') {
      return this.http.post<any>(this.downloadPdfOverAllPermitUrl + 'email', filter)
    }
  }

  /**
   * This method download application status report
   * @method downloadApplicationReport
   * @param {any} filter Filter Parameter
   * @param {string} type Xls or PDF Type
   */
  downloadApplicationReport(filter: any, type: string) {
    if (type == 'xls') {
      return this.http.post<any>(this.downloadXlsApplicationUrl, filter)
    } else if (type == 'pdf') {
      return this.http.post<any>(this.downloadPdfApplicationUrl, filter)
    } else if (type == 'xlsEmail') {
      return this.http.post<any>(this.downloadXlsApplicationUrl + 'email', filter)
    } else if (type == 'pdfEmail') {
      return this.http.post<any>(this.downloadPdfApplicationUrl + 'email', filter)
    }
  }

  /**
   * This method download application status report
   * @method downloadAHVReport
   * @param {any} filter Filter Parameter
   * @param {string} type Xls or PDF Type
   */
  downloadAHVReport(filter: any, type: string) {
    if (type == 'xls') {
      return this.http.post<any>(this.downloadXlsAHVUrl, filter)
    } else if (type == 'pdf') {
      return this.http.post<any>(this.downloadPdfAHVUrl, filter)
    } else if (type == 'xlsEmail') {
      return this.http.post<any>(this.downloadXlsAHVUrl + 'email', filter)
    } else if (type == 'pdfEmail') {
      return this.http.post<any>(this.downloadPdfAHVUrl + 'email', filter)
    }
  }

  /**
   * This method download permit expiry report
   * @method downloadPermitExpiryReport
   * @param {any} filter Filter Parameter
   * @param {string} type Xls or PDF Type
   */
  downloadPermitExpiryReport(filter: any, type: string) {
    if (type == 'xls') {
      return this.http.post<any>(this.downloadXlsPermitExpiryUrl, filter)
    } else if (type == 'pdf') {
      return this.http.post<any>(this.downloadPdfPermitExpiryUrl, filter)
    } else if (type == 'xlsEmail') {
      return this.http.post<any>(this.downloadXlsPermitExpiryUrl + 'email', filter)
    } else if (type == 'pdfEmail') {
      return this.http.post<any>(this.downloadPdfPermitExpiryUrl + 'email', filter)
    }
  }

  /**
   * This method download RFP report
   * @method downloadRfpReport
   * @param {any} filter Filter Parameter
   * @param {string} type Xls or PDF Type
   */
  downloadRfpReport(filter: any, type: string) {
    if (type == 'xls') {
      return this.http.post<any>(this.downloadXlsRfpReportUrl, filter)
    } else if (type == 'pdf') {
      return this.http.post<any>(this.downloadPdfRfpReportUrl, filter)
    }
  }

  /**
   * This method download closed job open billing point report
   * @method downloadClosedJobReport
   * @param {any} filter Filter Parameter
   * @param {string} type Xls or PDF Type
   */
  downloadClosedJobReport(filter: any, type: string) {
    if (type == 'xls') {
      return this.http.post<any>(this.downloadXlsClosedJobReportUrl, filter)
    } else if (type == 'pdf') {
      return this.http.post<any>(this.downloadPdfClosedJobReportUrl, filter)
    }
  }

  /**
   * This method download Completed scope billing point report
   * @method downloadCompletedScopeReport
   * @param {any} filter Filter Parameter
   * @param {string} type Xls or PDF Type
   */
  downloadCompletedScopeReport(filter: any, type: string) {
    if (type == 'xls') {
      return this.http.post<any>(this.downloadXlsCompletedScopeReportUrl, filter)
    } else if (type == 'pdf') {
      return this.http.post<any>(this.downloadPdfCompletedScopeReportUrl, filter)
    }
  }
}