import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Message } from '../../app.messages';

import { AppComponent } from '../../app.component';
import { Group } from '../../types/group';
import { UserGroupServices } from '../../route/userGroup/userGroup.services';
import { UserGroup, Permissions, ModuleName, Groups } from '../../route/userGroup/userGroup';
import * as _ from 'underscore';
import { constantValues } from '../../app.constantValues';
import { EmployeeServices } from '../../route/employee/employee.services';

declare const $: any

@Component({
  selector: '[permission-user-group]',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss']
})
export class PermissionComponent implements OnInit, OnDestroy {
  @ViewChild('formUserGroup', { static: true })
  formUserGroup: TemplateRef<any>

  @Input() modalRef: BsModalRef
  @Input() empId: any
  @Input() customerId: any
  @Input() reloadEmployee: Function
  @Input() showUserGroup: boolean
  @Input() userGroupPermissionId: any
  @Output() reload = new EventEmitter<any>();

  private new: boolean = true

  private userGroupId: number

  empPermission: any = []
  jobPermission: any = []
  otherPermission: any = []
  userGroupName: string
  description: string
  public permission: any = []
  loading: boolean = false
  errorMsg: any
  header: string = ''
  allPermission: boolean = false
  private fromreports: boolean = false
  constructor(
    private zone: NgZone,
    private appComponent: AppComponent,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private message: Message,
    private constantValues: constantValues,
    private userGroupServices: UserGroupServices,
    private employeeServices: EmployeeServices,

  ) {
    this.errorMsg = this.message.msg
  }

  ngOnInit() {
    this.loading = true

    this.getAllPermissions();
    if (this.empId && this.empId > 0) {
      document.title = 'Edit Permissions'
      this.header = 'Edit Permissions'
      this.getEmployeePermissions()
    } else if (this.customerId) {
      document.title = 'Edit Permissions'
      this.header = 'Edit Permissions'
      this.showUserGroup = false
      this.getCustomerPermissions()
    } else {
      if (this.userGroupPermissionId == 0) {
        this.header = 'Add User Group'
      } else {
        this.header = 'Edit User Group'
      }

      this.getUserInfo()
    }

  }

  getUserInfo() {
    if (this.userGroupPermissionId) {
      this.empPermission = []
      this.jobPermission = []
      this.otherPermission = []
      this.userGroupServices.getById(this.userGroupPermissionId).subscribe((r: any) => {
        this.userGroupId = r.id
        this.description = r.description
        this.userGroupName = r.name
        this.permission = []
        this.permission = r.permissions
        r.allPermissions.forEach((element: any) => {
          if (element.moduleName == 'Employee') {
            this.empPermission = element.groups
          }
          if (element.moduleName == 'Project') {
            this.jobPermission = element.groups
          }
          if (element.moduleName == 'Other') {
            this.otherPermission = element.groups
          }
        });
        this.loading = false
      })
    }
  }

  getCustomerPermissions() {
    this.employeeServices.getCustomerById(this.customerId).subscribe((r: any) => {
      this.empPermission = []
      this.jobPermission = []
      this.otherPermission = []
      this.permission = r.permissions || []

      r.allPermissions.forEach((element: any) => {
        if (element.moduleName == 'Employee') {
          this.empPermission = element.groups
        }
        if (element.moduleName == 'Project') {
          let jobRights = element.groups;
          // DELETE UNWANTED RIGHTS
          let JobRights = jobRights.filter((x: any) => x.groupName == 'Project')[0];
          let TransmittalRights = jobRights.filter((x: any) => x.groupName == 'Transmittals')[0];

          let jobRightsIndex = jobRights.findIndex((x: any) => x.groupName == 'Project');
          let transmittalRightsIndex = jobRights.findIndex((x: any) => x.groupName == 'Transmittals');

          let deleteJobDeletePermission = JobRights['permissions'].filter((x: any) => x.name == 'DeleteJob')[0];
          let deleteTransmittalExportPermission = TransmittalRights['permissions'].filter((x: any) => x.name == 'PrintExportTransmittals')[0];
          if (typeof deleteJobDeletePermission != 'undefined' || typeof deleteTransmittalExportPermission != 'undefined') {
            let remIndex = JobRights['permissions'].indexOf(deleteJobDeletePermission)
            JobRights['permissions'].splice(remIndex, 1)
            let removeIndex = TransmittalRights['permissions'].indexOf(deleteTransmittalExportPermission)
            TransmittalRights['permissions'].splice(removeIndex, 1)

            jobRights[jobRightsIndex] = JobRights;
            jobRights[transmittalRightsIndex] = TransmittalRights;
            this.jobPermission = jobRights;
          }
        }
        if (element.moduleName == 'Other') {
          let otherRights = element.groups;

          // DELETE UNWANTED RIGHTS
          let ReportRights = otherRights.filter((x: any) => x.groupName == 'Report')[0];
          let RFPRights = otherRights.filter((x: any) => x.groupName == 'Proposal')[0];
          let ReportRightsIndex = otherRights.findIndex((x: any) => x.groupName == 'Report');
          let RFPRightsIndex = otherRights.findIndex((x: any) => x.groupName == 'Proposal');

          let deleteViewReportPermission = ReportRights['permissions'].filter((x: any) => x.name == 'ViewReport')[0];
          let deleteRFPdeletePermission = RFPRights['permissions'].filter((x: any) => x.name == 'DeleteRFP')[0];
          if (typeof deleteViewReportPermission != 'undefined' || typeof deleteRFPdeletePermission != 'undefined') {
            let remIndex = ReportRights['permissions'].indexOf(deleteViewReportPermission)
            ReportRights['permissions'].splice(remIndex, 1)
            let removeIndex = RFPRights['permissions'].indexOf(deleteRFPdeletePermission)
            RFPRights['permissions'].splice(removeIndex, 1)
            otherRights[RFPRightsIndex] = RFPRights;
            otherRights[ReportRightsIndex] = ReportRights;
            this.otherPermission = otherRights;

          };
        }
      });
      this.loading = false

    }, e => { this.loading = false })

  }

  getEmployeePermissions() {
    this.employeeServices.getById(this.empId).subscribe((r: any) => {
      this.empPermission = []
      this.jobPermission = []
      this.otherPermission = []
      this.permission = r.permissions
      console.log("employee res", r)
      r.allPermissions.forEach((element: any) => {
        if (element.moduleName == 'Employee') {
          this.empPermission = element.groups
        }
        if (element.moduleName == 'Project') {
          let jobRights = element.groups;
          // DELETE UNWANTED RIGHTS
          let JobRights = jobRights.filter((x: any) => x.groupName == 'Project')[0];
          let TransmittalRights = jobRights.filter((x: any) => x.groupName == 'Transmittals')[0];

          let jobRightsIndex = jobRights.findIndex((x: any) => x.groupName == 'Project');
          let transmittalRightsIndex = jobRights.findIndex((x: any) => x.groupName == 'Transmittals');

          let deleteJobDeletePermission = JobRights['permissions'].filter((x: any) => x.name == 'DeleteJob')[0];
          let deleteTransmittalExportPermission = TransmittalRights['permissions'].filter((x: any) => x.name == 'PrintExportTransmittals')[0];
          if (typeof deleteJobDeletePermission != 'undefined' || typeof deleteTransmittalExportPermission != 'undefined') {
            let remIndex = JobRights['permissions'].indexOf(deleteJobDeletePermission)
            JobRights['permissions'].splice(remIndex, 1)
            let removeIndex = TransmittalRights['permissions'].indexOf(deleteTransmittalExportPermission)
            TransmittalRights['permissions'].splice(removeIndex, 1)
            // jobRights[0] = JobRights;
            // jobRights[2] = TransmittalRights;
            jobRights[jobRightsIndex] = JobRights;
            jobRights[transmittalRightsIndex] = TransmittalRights;
            this.jobPermission = jobRights;
          }
        }
        if (element.moduleName == 'Other') {
          let otherRights = element.groups;

          // DELETE UNWANTED RIGHTS
          let ReportRights = otherRights.filter((x: any) => x.groupName == 'Report')[0];
          let RFPRights = otherRights.filter((x: any) => x.groupName == 'Proposal')[0];
          let ReportRightsIndex = otherRights.findIndex((x: any) => x.groupName == 'Report');
          let RFPRightsIndex = otherRights.findIndex((x: any) => x.groupName == 'Proposal');

          let deleteViewReportPermission = ReportRights['permissions'].filter((x: any) => x.name == 'ViewReport')[0];
          let deleteRFPdeletePermission = RFPRights['permissions'].filter((x: any) => x.name == 'DeleteRFP')[0];
          if (typeof deleteViewReportPermission != 'undefined' || typeof deleteRFPdeletePermission != 'undefined') {
            let remIndex = ReportRights['permissions'].indexOf(deleteViewReportPermission)
            ReportRights['permissions'].splice(remIndex, 1)
            let removeIndex = RFPRights['permissions'].indexOf(deleteRFPdeletePermission)
            RFPRights['permissions'].splice(removeIndex, 1)
            // otherRights[2] = RFPRights;
            // otherRights[3] = ReportRights;
            otherRights[RFPRightsIndex] = RFPRights;
            otherRights[ReportRightsIndex] = ReportRights;
            this.otherPermission = otherRights;

          };
        }
      });
      this.loading = false

    }, e => { this.loading = false })

  }

  ngOnDestroy() {
  }

  save() {
    this.loading = true
    if (this.empId && this.empId > 0) {
      if (this.permission.length > 0) {
        let request: any = {
          idEmployee: this.empId,
          permissions: this.permission
        }

        this.employeeServices.setGrants(this.empId, request).subscribe(r => {
          // this.reloadEmployee()
          this.loading = false
          this.toastr.success(this.errorMsg.permissionChanged)
          this.modalRef.hide()
          document.title = 'Employee'
        }, e => {
          this.loading = false
        })
      } else {
        this.loading = false
        this.toastr.error(this.errorMsg.selectAtLeastOnePermission)
      }
    } else if (this.customerId) {
      if (this.permission.length > 0) {
        let request: any = {
          idCustomer: this.customerId,
          permissions: this.permission
        }
        this.employeeServices.setCustomerGrants(this.customerId, request).subscribe(res => {
          this.loading = false
          this.toastr.success(this.errorMsg.permissionChanged)
          this.modalRef.hide()
          document.title = 'Customer'
        }, e => {
          this.toastr.error(e)
          this.loading = false
        })
      }
    } else {
      let request: any = {
        id: 0,
        name: this.userGroupName,
        description: this.description,
        permissions: this.permission
      }
      if (this.permission.length > 0) {
        if (this.userGroupId > 0) {
          request.id = this.userGroupId
          this.userGroupServices.update(this.userGroupId, request).subscribe(r => {
            this.reload.emit();
            this.loading = false
            this.toastr.success(this.errorMsg.recordUpdatedSuccessfully)
            this.modalRef.hide()
            document.title = 'Employee'
          }, e => {
            this.loading = false
          })

        } else {
          this.userGroupServices.create(request).subscribe(r => {
            this.reload.emit();
            this.loading = false
            this.toastr.success(this.errorMsg.recordCreatedSuccessfully)
            this.modalRef.hide()
            document.title = 'Employee'
          }, e => {
            this.loading = false
          })
        }
      } else {
        this.loading = false
        this.toastr.error(this.errorMsg.selectAtLeastOnePermission)
      }
    }
  }

  getAllPermissions() {
    this.loading = true
    this.userGroupServices.getPermissions().subscribe(r => {
      let res: any = r
      this.empPermission = []
      this.otherPermission = []
      this.jobPermission = []
      res.forEach((element: any, index: number) => {
        if (element.moduleName == 'Employee') {
          this.empPermission = element.groups
        }
        if (element.moduleName == 'Project') {
          let jobRights = element.groups;
          // DELETE UNWANTED RIGHTS
          let JobRights = jobRights.filter((x: any) => x.groupName == 'Project')[0];
          let TransmittalRights = jobRights.filter((x: any) => x.groupName == 'Transmittals')[0];

          let jobRightsIndex = jobRights.findIndex((x: any) => x.groupName == 'Project');
          let transmittalRightsIndex = jobRights.findIndex((x: any) => x.groupName == 'Transmittals');

          let deleteJobDeletePermission = JobRights['permissions'].filter((x: any) => x.name == 'DeleteJob')[0];
          let deleteTransmittalExportPermission = TransmittalRights['permissions'].filter((x: any) => x.name == 'PrintExportTransmittals')[0];
          if (typeof deleteJobDeletePermission != 'undefined' || typeof deleteTransmittalExportPermission != 'undefined') {
            let remIndex = JobRights['permissions'].indexOf(deleteJobDeletePermission)
            JobRights['permissions'].splice(remIndex, 1)
            let removeIndex = TransmittalRights['permissions'].indexOf(deleteTransmittalExportPermission)
            TransmittalRights['permissions'].splice(removeIndex, 1)
            // jobRights[0] = JobRights;
            // jobRights[2] = TransmittalRights;
            jobRights[jobRightsIndex] = JobRights;
            jobRights[transmittalRightsIndex] = TransmittalRights;
            this.jobPermission = jobRights;
          }
        }
        if (element.moduleName == 'Other') {
          let otherRights = element.groups;

          // DELETE UNWANTED RIGHTS
          let ReportRights = otherRights.filter((x: any) => x.groupName == 'Report')[0];
          let RFPRights = otherRights.filter((x: any) => x.groupName == 'Proposal')[0];
          let ReportRightsIndex = otherRights.findIndex((x: any) => x.groupName == 'Report');
          let RFPRightsIndex = otherRights.findIndex((x: any) => x.groupName == 'Proposal');

          let deleteViewReportPermission = ReportRights['permissions'].filter((x: any) => x.name == 'ViewReport')[0];
          let deleteRFPdeletePermission = RFPRights['permissions'].filter((x: any) => x.name == 'DeleteRFP')[0];
          if (typeof deleteViewReportPermission != 'undefined' || typeof deleteRFPdeletePermission != 'undefined') {
            let remIndex = ReportRights['permissions'].indexOf(deleteViewReportPermission)
            ReportRights['permissions'].splice(remIndex, 1)
            let removeIndex = RFPRights['permissions'].indexOf(deleteRFPdeletePermission)
            RFPRights['permissions'].splice(removeIndex, 1)
            // otherRights[2] = RFPRights;
            // otherRights[3] = ReportRights;
            otherRights[RFPRightsIndex] = RFPRights;
            otherRights[ReportRightsIndex] = ReportRights;
            this.otherPermission = otherRights;

          };
        }
      });
      this.loading = false
    }, e => {

    })
  }


  checkPermissionValues(evt: any, mainPermission: any, permissionId: number, classType?: string) {
    // select all employe module view permission
    let tmpEmpPermissionArr: any = []
    let tmpJobPermissionArr: any = []
    if (classType != '' && (permissionId == this.constantValues.VIEWEMPLOYEE || permissionId == this.constantValues.ADDEMPLOYEE || permissionId == this.constantValues.DELETEEMPLOYEE)) {
      this.checkEmployeeModule(mainPermission, tmpEmpPermissionArr, permissionId);
    } else if (classType != '' && (permissionId == this.constantValues.VIEWJOB || permissionId == this.constantValues.ADDJOB || permissionId == this.constantValues.DELETEJOB || permissionId == this.constantValues.COSTJOBSCOPE || permissionId == this.constantValues.EDITCOMPLETEDJOBTASKS)) {
      this.checkJobModule(mainPermission, tmpJobPermissionArr, permissionId);
    } else {
      let Permissions: any = []
      if (mainPermission.moduleName == this.constantValues.EMPLOYEEMODULE) {
        Permissions = this.empPermission.filter((x: any) => x.groupName == mainPermission.groupName)[0]
      } else {
        Permissions = this.jobPermission.filter((x: any) => x.groupName == mainPermission.groupName)[0]
      }
      this.checkOtherPermissionValues(evt, mainPermission.groupName, Permissions.permissions, permissionId, mainPermission)

      if (this.permission.length == this.constantValues.TOTALPERMISSIONS) {
        this.allPermission = true
      } else {
        this.allPermission = false
      }

    }




  }



  //checking permission for other modules
  checkOtherPermissionValues(evt: any, groupName: string, permissions: any, permissionId: number, mainPermission: any) {
    console.log('groupName', groupName);
    console.log('permissions', permissions);
    console.log('permissionId', permissionId);
    console.log('mainPermission', mainPermission);
    if (mainPermission.moduleName == this.constantValues.EMPLOYEEMODULE && mainPermission.id != this.constantValues.VIEWEMPLOYEE && (this.permission.indexOf(this.constantValues.VIEWEMPLOYEE) == -1)) {
      this.permission.push(this.constantValues.VIEWEMPLOYEE)
    }
    if (mainPermission.moduleName == this.constantValues.JOBMODULE && mainPermission.id != this.constantValues.VIEWJOB && (this.permission.indexOf(this.constantValues.VIEWJOB) == -1)) {
      this.permission.push(this.constantValues.VIEWJOB)
    }


    let idx = this.permission.filter((x: any) => x == permissionId)[0];
    let addOtherPermission: number
    let viewOtherPermission: number
    let deleteOtherPermission: number
    let exportOtherPermission: number
    let costJobScopePermission: number
    let viewOtherPermissionClosed: number
    let viewOtherPermissionCompleted: number
    let editCompletedPermission: number

    let viewAllViolationReport: number
    let viewPermitExpiryReport: number
    let viewAHVPermitExpiryReport: number
    let viewApplicationStatusReport: number
    let viewContractorInsurancesExpiryReport: number
    let viewContactLicenseExpiryReport:number
    let viewConsolidatedStatusReport: number
    let viewProposalsReport: number
    let viewUnsyncTimenoteReport: number

    if (groupName == this.constantValues.EMPLOYEEUSERGROUPINFO) {
      // user info
      addOtherPermission = this.constantValues.ADDEMPLOYEEUSERGROUP
      deleteOtherPermission = this.constantValues.DELETEEMPLOYEEUSERGROUP
      viewOtherPermission = this.constantValues.VIEWEMPLOYEEUSERGROUP
    }
    else if (groupName == this.constantValues.COMPANYPERMISSION) {
      //Company      
      this.fromreports = false;
      addOtherPermission = this.constantValues.ADDCOMPANY
      deleteOtherPermission = this.constantValues.DELETECOMPANY
      viewOtherPermission = this.constantValues.VIEWCOMPANY
      exportOtherPermission = this.constantValues.EXPORTCOMPANY
    }
    else if (groupName == this.constantValues.RFPPERMISSION) {
      //RFP      
      addOtherPermission = this.constantValues.ADDRFP
      deleteOtherPermission = this.constantValues.DELETERFP
      viewOtherPermission = this.constantValues.VIEWRFP
    }
    else if (groupName == this.constantValues.REPORTPERMISSION) {
      //Report    
      this.fromreports = true;
      viewOtherPermissionCompleted = this.constantValues.VIEWCOMPLETESCOPEREPORT
      viewOtherPermissionClosed = this.constantValues.VIEWCLOSEDSCOPEREPORT
      viewOtherPermission = this.constantValues.VIEWREPORT
      exportOtherPermission = this.constantValues.EXPORTREPORT
      viewAllViolationReport = this.constantValues.VIEWALLVIOLATIONID
      viewPermitExpiryReport = this.constantValues.VIEWPERMITEXPIRYREPORTID
      viewAHVPermitExpiryReport = this.constantValues.VIEWAHVPERMITEXPIRYREPORTID
      viewApplicationStatusReport = this.constantValues.VIEWAPPLICATIONSTATUSREPORTID
      viewContractorInsurancesExpiryReport = this.constantValues.VIEWCONTRACTORINSURANCESEXPIRYREPORTID
      viewContactLicenseExpiryReport = this.constantValues.VIEWCONTACTLICENSEEXPIRYREPORTID
      viewConsolidatedStatusReport = this.constantValues.VIEWCONSOLIDATEDSTATUSREPORTID
      viewProposalsReport = this.constantValues.VIEWPROPOSALSREPORTID
      viewUnsyncTimenoteReport = this.constantValues.VIEWUNSYNCTIMENOTEREPORTID
    }
    else if (groupName == this.constantValues.ADDRESSPERMISSION) {
      //Address      
      addOtherPermission = this.constantValues.ADDADDRESS
      deleteOtherPermission = this.constantValues.DELETEADDRESS
      viewOtherPermission = this.constantValues.VIEWADDRESS
    }
    else if (groupName == this.constantValues.CONTACTPERMISSION) {
      //Contact      
      this.fromreports = false;
      addOtherPermission = this.constantValues.ADDCONTACT
      deleteOtherPermission = this.constantValues.DELETECONTACT
      viewOtherPermission = this.constantValues.VIEWCONTACT
      exportOtherPermission = this.constantValues.EXPORTCONTACT
    }
    else if (groupName == this.constantValues.FEESCHEDULEMASTERPERMISSION) {
      //Fee Schedule Master
      addOtherPermission = this.constantValues.ADDFEESCHEDULEMASTER
      deleteOtherPermission = this.constantValues.DELETEFEESCHEDULEMASTER
      viewOtherPermission = this.constantValues.VIEWFEESCHEDULEMASTER
    }
    else if (groupName == this.constantValues.MASTERDATAPERMISSION) {
      //Master Data
      addOtherPermission = this.constantValues.ADDMASTERDATA
      deleteOtherPermission = this.constantValues.DELETEMASTERDATA
      viewOtherPermission = this.constantValues.VIEWMASTERDATA
    }
    else if (groupName == this.constantValues.REFERENCEDOCUMENTPERMISSION) {
      //Reference Document
      addOtherPermission = this.constantValues.ADDREFERENCEDOCUMENT
      deleteOtherPermission = this.constantValues.DELETEREFERENCEDOCUMENT
      viewOtherPermission = this.constantValues.VIEWREFERENCEDOCUMENT
    }
    else if (groupName == this.constantValues.REFERENCELINKSPERMISSION) {
      //Reference Links
      viewOtherPermission = this.constantValues.VIEWREFERENCELINKS
    }

    //Employee sub module starts
    else if (groupName == this.constantValues.EMPLOYEEINFO) {
      //Employee Info
      addOtherPermission = this.constantValues.EDITEMPLOYEEINFO
      viewOtherPermission = this.constantValues.VIEWEMPLOYEEINFO
    }
    else if (groupName == this.constantValues.CONTACTINFO) {
      //Contact Info
      addOtherPermission = this.constantValues.EDITCONTACTINFO
      viewOtherPermission = this.constantValues.VIEWCONTACTINFO
    }
    else if (groupName == this.constantValues.EMERGENCYCONTACTINFO) {
      //Employee Emergency contact Info
      addOtherPermission = this.constantValues.EDITEMERGENCYCONTACTINFO
      viewOtherPermission = this.constantValues.VIEWEMERGENCYCONTACTINFO
    }
    else if (groupName == this.constantValues.PHONEINFO) {
      //phone Info
      addOtherPermission = this.constantValues.EDITPHONEINFO
      viewOtherPermission = this.constantValues.VIEWPHONEINFO
    }
    else if (groupName == this.constantValues.SYSTEMACCESSINFORMATION) {
      //System Access Information
      addOtherPermission = this.constantValues.EDITSYSTEMACCESSINFORMATION
      viewOtherPermission = this.constantValues.VIEWSYSTEMACCESSINFORMATION
    }
    else if (groupName == this.constantValues.AGENTCERTIFICATE) {
      //Agent Certificates
      addOtherPermission = this.constantValues.EDITAGENTCERTIFICATES
      viewOtherPermission = this.constantValues.VIEWAGENTCERTIFICATES
    }
    else if (groupName == this.constantValues.PERSONALINFORMATION) {
      //Personal Information
      addOtherPermission = this.constantValues.EDITPERSONALINFORMATION
      viewOtherPermission = this.constantValues.VIEWPERSONALINFORMATION
    }
    else if (groupName == this.constantValues.DOCUMENTSMODULE) {
      //Employee Document
      addOtherPermission = this.constantValues.EDITDOCUMENTS
      viewOtherPermission = this.constantValues.VIEWDOCUMENTS
    }
    else if (groupName == this.constantValues.STATUS) {
      //Status
      addOtherPermission = this.constantValues.EDITSTATUS
      viewOtherPermission = this.constantValues.VIEWSTATUS
    }

    //job module other starts
    else if (groupName == this.constantValues.APPLICATIONANDWORKPERMIT) {
      //Applications & Work permits
      addOtherPermission = this.constantValues.ADDAPPLICATIONSWORKPERMITS
      deleteOtherPermission = this.constantValues.DELETEAPPLICATIONSWORKPERMITS
      viewOtherPermission = this.constantValues.VIEWAPPLICATIONSWORKPERMITS
    }
    else if (groupName == this.constantValues.TRANSMITTALS) {
      //Applications & Work permits
      this.fromreports = false;
      addOtherPermission = this.constantValues.ADDTRANSMITTALS
      deleteOtherPermission = this.constantValues.DELETETRANSMITTALS
      viewOtherPermission = this.constantValues.VIEWTRANSMITTALS
      exportOtherPermission = this.constantValues.PRINTEXPORTTRANSMITTALS
    }
    else if (groupName == this.constantValues.ECBVIOLATION) {
      //View ECB Violation
      viewOtherPermission = this.constantValues.VIEWECBVIOLATION
      addOtherPermission = this.constantValues.ADDEDITVIOLATION
      // addOtherPermission = this.constantValues.ADDEDITECBVIOLATION
      deleteOtherPermission = this.constantValues.DELETEECBVIOLATION
    }
    else if (groupName == this.constantValues.DOBVIOLATION) {
      //View DOB Violation
      viewOtherPermission = this.constantValues.VIEWDOBVIOLATION
      addOtherPermission = this.constantValues.ADDEDITDOBVIOLATION
      deleteOtherPermission = this.constantValues.DELETEDOBVIOLATION
    }
    else if (groupName == this.constantValues.DOBSAFETYVIOLATION) {
      //View DOB Safety Violation
      viewOtherPermission = this.constantValues.VIEWDOBSAFETYVIOLATION
      addOtherPermission = this.constantValues.ADDEDITDOBSAFETYVIOLATION
      deleteOtherPermission = this.constantValues.DELETEDOBSAFETYVIOLATION
    }
    else if (groupName.toLocaleLowerCase() == this.constantValues.JOBSCOPEMODULE.toLocaleLowerCase()) {
      //Job scope
      addOtherPermission = this.constantValues.ADDJOBSCOPE
      deleteOtherPermission = this.constantValues.DELETEJOBSCOPE
      viewOtherPermission = this.constantValues.VIEWJOBSCOPE
      costJobScopePermission = this.constantValues.COSTJOBSCOPE
    }
    else if (groupName == this.constantValues.JOBMILESTONEMODULE) {
      //Job milestone
      addOtherPermission = this.constantValues.ADDJOBMILESTONE
      deleteOtherPermission = this.constantValues.DELETEJOBMILESTONE
      viewOtherPermission = this.constantValues.VIEWJOBMILESTONE
      costJobScopePermission = this.constantValues.COSTJOBSCOPE
    }
    else if (groupName == this.constantValues.JOBTASKSMODULE) {
      //Job Tasks
      addOtherPermission = this.constantValues.ADDJOBTASKS
      deleteOtherPermission = this.constantValues.DELETEJOBTASKS
      editCompletedPermission = this.constantValues.EDITCOMPLETEDJOBTASKS
      viewOtherPermission = this.constantValues.VIEWCOMPLETEDJOBTASKS
    }
    else if (groupName == this.constantValues.JOBDOCUMENTSMODULE) {
      //Job Documents
      addOtherPermission = this.constantValues.ADDJOBDOCUMENTS
      deleteOtherPermission = this.constantValues.DELETEJOBDOCUMENTS
    }
    else if (groupName == this.constantValues.JOBCONTACTSMODULE) {
      //Job Documents
      addOtherPermission = this.constantValues.ADDEDITJOBCONTACT
      deleteOtherPermission = this.constantValues.DELETEJOBCONTACT
      viewOtherPermission = this.constantValues.VIEWJOBCONTACT
    }
    else if (groupName == this.constantValues.JOBDVIOLATION) {
      //Job Violations
      addOtherPermission = this.constantValues.ADDEDITVIOLATION
      deleteOtherPermission = this.constantValues.DELETEVIOLATION
    }
    else if (groupName == this.constantValues.JOBTIMENOTES) {
      //Job TimeNotes
      // addOtherPermission = this.constantValues.ADDEDITJOBTIMENOTES
    }
    else if (groupName == this.constantValues.SENDEMAILCONTACT) {
      //Send Email to Contact
      viewOtherPermission = this.constantValues.VIEWSENDEMAILCONTACT
    }
    else if (groupName == this.constantValues.SENDEMAILRPO) {
      //Send Email to RPO
      viewOtherPermission = this.constantValues.SENDEMAILRPOID
    }
    else if (groupName == this.constantValues.CHECKLISTCLIENTNOTE) {
      //Customer CHECKLIST CLIENT NOTEID
      viewOtherPermission = this.constantValues.CHECKLISTCLIENTNOTEID
    }
    else if (groupName == this.constantValues.DASHBOARD) {
      //Dashboard
      viewOtherPermission = this.constantValues.DASHBOARDID
    }
    else if (groupName == this.constantValues.EXPORTPROJECT) {
      //Export Project
      exportOtherPermission = this.constantValues.EXPORTPROJECTID
    }
    else if (groupName == this.constantValues.EXPORTCHECKLIST) {
      //Export Project
      exportOtherPermission = this.constantValues.EXPORTCHECKLISTID
    }


    else if (groupName.toLocaleLowerCase() == this.constantValues.CHECKLIST.toLocaleLowerCase()) {
      //Checklist    
      //this.fromreports = false;
      addOtherPermission = this.constantValues.ADDCHECKLIST
      deleteOtherPermission = this.constantValues.DELETECHECKLIST
      viewOtherPermission = this.constantValues.VIEWCHECKLIST
      //exportOtherPermission = this.constantValues.PRINTEXPORTTRANSMITTALS
    }

    else if (groupName.toLocaleLowerCase() == this.constantValues.CUSTOMER.toLocaleLowerCase()) {
      //CUSTOMER    
      //this.fromreports = false;
      addOtherPermission = this.constantValues.ADDEDITCUSTOMER
      deleteOtherPermission = this.constantValues.DELETECUSTOMER
      viewOtherPermission = this.constantValues.VIEWCUSTOMER
      //exportOtherPermission = this.constantValues.PRINTEXPORTTRANSMITTALS
    }

    let editPermit = this.permission.filter((x: any) => x == addOtherPermission)[0];
    let deletePermit = this.permission.filter((x: any) => x == deleteOtherPermission)[0];
    let exportPermit: any
    if (exportOtherPermission) {
      exportPermit = this.permission.filter((x: any) => x == exportOtherPermission)[0];
    }

    let tmpPermissionArr: any = []
    let viewArr: any = []

    if (permissions.length > 0) {
      for (let i = 0; i < permissions.length; i++) {
        if (permissions[i].permissionClass == 'visibility' && (
          permissionId == viewOtherPermission ||
          permissionId == viewOtherPermissionCompleted ||
          permissionId == viewOtherPermissionClosed ||
          permissionId == exportOtherPermission ||
          permissionId == viewAllViolationReport ||
          permissionId == viewPermitExpiryReport ||
          permissionId == viewAHVPermitExpiryReport ||
          permissionId == viewApplicationStatusReport ||
          permissionId == viewContractorInsurancesExpiryReport ||
          permissionId == viewContactLicenseExpiryReport ||
          permissionId == viewConsolidatedStatusReport ||
          permissionId == viewProposalsReport ||
          permissionId == viewUnsyncTimenoteReport
        )) {
          permissions[i].isChecked = true
          if (permissionId == viewOtherPermission) {
            tmpPermissionArr.push(permissions[i].id)
          }
          if (permissionId == viewOtherPermissionClosed && permissions[i].isChecked) {
            // const ViewPermission = permissions.filter((x: any) => x.displayName == 'View')[0]
            // tmpPermissionArr.push(ViewPermission.id)
            tmpPermissionArr.push(75)
          }
          if (permissionId == viewOtherPermissionCompleted && permissions[i].isChecked) {
            // const ViewPermission = permissions.filter((x: any) => x.displayName == 'View')[0]
            // tmpPermissionArr.push(ViewPermission.id)
            tmpPermissionArr.push(74)
          }
          if (permissionId == viewAllViolationReport && permissions[i].isChecked) {
            tmpPermissionArr.push(this.constantValues.VIEWALLVIOLATIONID)
          }
          if (permissionId == viewPermitExpiryReport && permissions[i].isChecked) {
            tmpPermissionArr.push(this.constantValues.VIEWPERMITEXPIRYREPORTID)
          }
          if (permissionId == viewAHVPermitExpiryReport && permissions[i].isChecked) {
            tmpPermissionArr.push(this.constantValues.VIEWAHVPERMITEXPIRYREPORTID)
          }
          if (permissionId == viewApplicationStatusReport && permissions[i].isChecked) {
            tmpPermissionArr.push(this.constantValues.VIEWAPPLICATIONSTATUSREPORTID)
          }
          if (permissionId == viewContractorInsurancesExpiryReport && permissions[i].isChecked) {
            tmpPermissionArr.push(this.constantValues.VIEWCONTRACTORINSURANCESEXPIRYREPORTID)
          }
          if (permissionId == viewContactLicenseExpiryReport && permissions[i].isChecked) {
            tmpPermissionArr.push(this.constantValues.VIEWCONTACTLICENSEEXPIRYREPORTID)
          }
          if (permissionId == viewConsolidatedStatusReport && permissions[i].isChecked) {
            tmpPermissionArr.push(this.constantValues.VIEWCONSOLIDATEDSTATUSREPORTID)
          }
          if (permissionId == viewProposalsReport && permissions[i].isChecked) {
            tmpPermissionArr.push(this.constantValues.VIEWPROPOSALSREPORTID)
          }
          if (permissionId == viewUnsyncTimenoteReport && permissions[i].isChecked) {
            tmpPermissionArr.push(this.constantValues.VIEWUNSYNCTIMENOTEREPORTID)
          }

          // viewArr.push(permissions[i].id)
        }
        if (permissions[i].permissionClass == 'edit_square' && (permissionId == addOtherPermission || permissionId == editCompletedPermission)) {
          permissions[i].isChecked = mainPermission.isChecked
          const ViewPermission = permissions.filter((x: any) => x.displayName == 'View')[0]
          if (ViewPermission) {
            tmpPermissionArr.push(ViewPermission.id)
          }

          tmpPermissionArr.push(permissions[i].id)
        }
        if (permissions[i].permissionClass == 'delete' && permissionId == deleteOtherPermission) {
          permissions[i].isChecked = mainPermission.isChecked
          const ViewPermission = permissions.filter((x: any) => x.displayName == 'View')[0]
          if (ViewPermission) {
            tmpPermissionArr.push(ViewPermission.id)
          }
          tmpPermissionArr.push(permissions[i].id)
        }
        if (permissions[i].permissionClass == 'download' && permissionId == exportOtherPermission) {
          permissions[i].isChecked = mainPermission.isChecked
          const ViewPermission = permissions.filter((x: any) => x.displayName == 'View')[0]
          const viewPermissionForExport = permissions.filter((x: any) => x.displayName == 'Export')[0]
          if (!this.fromreports) {
            if(ViewPermission) {
              tmpPermissionArr.push(ViewPermission.id)
            } else if(viewPermissionForExport) {
              tmpPermissionArr.push(viewPermissionForExport.id)
            }
          }
          tmpPermissionArr.push(permissions[i].id)
        }
        if (permissions[i].permissionClass == 'attach_money' && permissionId == costJobScopePermission) {
          permissions[i].isChecked = mainPermission.isChecked
          const ViewPermission = permissions.filter((x: any) => x.displayName == 'View')[0]
          tmpPermissionArr.push(ViewPermission.id)
          tmpPermissionArr.push(permissions[i].id)
        }
      }
    }

    if (typeof idx == "undefined") {
      tmpPermissionArr.forEach((e: any) => {
        let checkPermissionexsits = this.permission.filter((x: any) => x == e)[0];
        if (typeof checkPermissionexsits == 'undefined') {
          this.permission.push(e)
        }
      });

    } else {

      if ((
        (typeof editPermit == 'undefined' || permissionId == addOtherPermission) &&
        (typeof deletePermit == 'undefined' || permissionId == deleteOtherPermission) &&
        (typeof exportPermit == 'undefined' || permissionId == exportOtherPermission)
      ) || permissionId != viewOtherPermission) {
        tmpPermissionArr.forEach((remPermission: any) => {
          if (groupName != this.constantValues.REPORTPERMISSION) {
            let deletePermission = this.permission.filter((x: any) => x == permissionId)[0];
            if (typeof deletePermission != 'undefined') {
              let remIndex = this.permission.indexOf(deletePermission)
              this.permission.splice(remIndex, 1)
            }
          }
          if (groupName == this.constantValues.REPORTPERMISSION && permissionId != 32) {
            let deletePermission = this.permission.filter((x: any) => x == permissionId)[0];
            if (typeof deletePermission != 'undefined') {
              let remIndex = this.permission.indexOf(deletePermission)
              this.permission.splice(remIndex, 1)
            }
          }
          if (groupName == this.constantValues.REPORTPERMISSION && permissionId == 32) {
            let deletePermission = this.permission.filter((x: any) => x == remPermission)[0];
            if (typeof deletePermission != 'undefined') {
              let remIndex = this.permission.indexOf(deletePermission)
              this.permission.splice(remIndex, 1)
            }
          }

        });

        if (viewArr && viewArr.length > 0 && (permissionId != viewOtherPermission && permissionId != viewOtherPermissionClosed && permissionId != viewOtherPermissionCompleted)) {
          for (let i = 0; i < viewArr.length; i++) {
            this.permission.push(viewArr[i])
          }
        }
      } else {
        if (mainPermission.moduleName == this.constantValues.OTHERMODULE) {
          this.removeOtherRgiths(this.otherPermission, mainPermission)
        } else if (mainPermission.moduleName == this.constantValues.EMPLOYEEMODULE) {
          this.removeOtherRgiths(this.empPermission, mainPermission)
        } else if (mainPermission.moduleName == this.constantValues.JOBMODULE) {
          this.removeOtherRgiths(this.jobPermission, mainPermission)
        }

      }
    }
  }

  removeOtherRgiths(userPermissions: any, mainPermission: any) {
    userPermissions.forEach((element: any) => {
      element.permissions.forEach((empView: any) => {
        if (empView.groupName == mainPermission.groupName) {
          empView.isChecked = false
          let deletePermission = this.permission.filter((x: any) => x == empView.id)[0];
          if (typeof deletePermission != 'undefined') {
            let remIndex = this.permission.indexOf(deletePermission)
            this.permission.splice(remIndex, 1)
          }
        }
      })
    })
  }

  //checking permission for job modules
  checkJobModule(mainPermission: any, tmpJobPermissionArr: any, permissionId: number) {
    let idx = this.permission.filter((x: any) => x == permissionId)[0];
    let editPermit = this.permission.filter((x: any) => x == this.constantValues.ADDJOB)[0];
    let deletePermit = this.permission.filter((x: any) => x == this.constantValues.DELETEJOB)[0];
    tmpJobPermissionArr = []
    let viewArr: any = []
    this.jobPermission.forEach((element: any) => {
      element.permissions.forEach((empView: any) => {
        if (permissionId == this.constantValues.VIEWJOB || permissionId == this.constantValues.ADDJOB || permissionId == this.constantValues.DELETEJOB || permissionId == this.constantValues.COSTJOBSCOPE || permissionId == this.constantValues.EDITCOMPLETEDJOBTASKS) {
          if (empView.permissionClass == 'visibility' && permissionId != this.constantValues.EDITCOMPLETEDJOBTASKS) {
            empView.isChecked = mainPermission.isChecked
            tmpJobPermissionArr.push(empView.id)
            // viewArr.push(empView.id)
          }
          if (empView.permissionClass == 'edit_square' && (permissionId == this.constantValues.ADDJOB || permissionId == this.constantValues.EDITCOMPLETEDJOBTASKS)) {
            empView.isChecked = mainPermission.isChecked
            tmpJobPermissionArr.push(empView.id)
          }
          if (empView.permissionClass == 'delete' && permissionId == this.constantValues.DELETEJOB) {
            empView.isChecked = mainPermission.isChecked
            tmpJobPermissionArr.push(empView.id)
          }
          if (empView.permissionClass == 'attach_money' && permissionId == this.constantValues.COSTJOBSCOPE) {
            empView.isChecked = mainPermission.isChecked
            tmpJobPermissionArr.push(empView.id)
          }

        }
      });
    });

    // give permission rights to all
    if (typeof idx == "undefined") {
      tmpJobPermissionArr.forEach((e: any) => {
        let checkPermissionexsits = this.permission.filter((x: any) => x == e)[0];
        if (typeof checkPermissionexsits == 'undefined') {
          this.permission.push(e)
        }
      });
    } else {
      if (((typeof editPermit == 'undefined' || permissionId == this.constantValues.ADDJOB) && (typeof deletePermit == 'undefined' || permissionId == this.constantValues.DELETEJOB)) || permissionId != this.constantValues.VIEWJOB) {
        tmpJobPermissionArr.forEach((remPermission: any) => {
          let deletePermission = this.permission.filter((x: any) => x == permissionId)[0];
          if (typeof deletePermission != 'undefined') {
            let remIndex = this.permission.indexOf(deletePermission)
            this.permission.splice(remIndex, 1)
          }
        });

        if (viewArr && viewArr.length > 0 && permissionId != this.constantValues.VIEWJOB) {
          for (let i = 0; i < viewArr.length; i++) {
            this.permission.push(viewArr[i])
          }
        } else {
          for (let j = 0; j < this.jobPermission.length; j++) {
            if (this.jobPermission[j].permissions.length > 0) {
              for (let k = 0; k < this.jobPermission[j].permissions.length; k++) {
                if (permissionId == this.constantValues.VIEWJOB && this.jobPermission[j].permissions[k].permissionClass == 'visibility') {
                  this.jobPermission[j].permissions[k].isChecked = false
                }
              }
            }
          }
        }
      } else {
        // remove all permission if user has clicked on remove ->view, than it will automatically remove all rights of add/edit/delete/export

        this.jobPermission.forEach((element: any) => {
          element.permissions.forEach((empView: any) => {
            empView.isChecked = false
            let deletePermission = this.permission.filter((x: any) => x == empView.id)[0];
            if (typeof deletePermission != 'undefined') {
              let remIndex = this.permission.indexOf(deletePermission)
              this.permission.splice(remIndex, 1)
            }
          })
        })
      }
    }
  }

  //checking permission for employee modules
  checkEmployeeModule(mainPermission: any, tmpPermissionArr: any, permissionId: number) {
    let idx = this.permission.filter((x: any) => x == permissionId)[0];

    let editPermit = this.permission.filter((x: any) => x == this.constantValues.ADDEMPLOYEE)[0];
    let deletePermit = this.permission.filter((x: any) => x == this.constantValues.DELETEEMPLOYEE)[0];
    tmpPermissionArr = []
    let viewArr: any = []
    this.empPermission.forEach((element: any) => {
      element.permissions.forEach((empView: any) => {
        if (permissionId == this.constantValues.VIEWEMPLOYEE || permissionId == this.constantValues.ADDEMPLOYEE || permissionId == this.constantValues.DELETEEMPLOYEE) {
          if (empView.permissionClass == 'visibility') {
            empView.isChecked = true// mainPermission.isChecked
            tmpPermissionArr.push(empView.id)
            viewArr.push(empView.id)
          }
          if (empView.permissionClass == 'edit_square' && permissionId == this.constantValues.ADDEMPLOYEE) {
            empView.isChecked = mainPermission.isChecked
            tmpPermissionArr.push(empView.id)
          }
          if (empView.permissionClass == 'delete' && permissionId == this.constantValues.DELETEEMPLOYEE) {
            empView.isChecked = mainPermission.isChecked
            tmpPermissionArr.push(empView.id)
          }
        }
      });
    });

    // give permission rights to all
    if (typeof idx == "undefined") {
      tmpPermissionArr.forEach((e: any) => {
        let checkPermissionexsits = this.permission.filter((x: any) => x == e)[0];
        if (typeof checkPermissionexsits == 'undefined') {
          this.permission.push(e)
        }
      });
    } else {
      if (((typeof editPermit == 'undefined' || permissionId == this.constantValues.ADDEMPLOYEE) && (typeof deletePermit == 'undefined' || permissionId == this.constantValues.DELETEEMPLOYEE)) || permissionId != this.constantValues.VIEWEMPLOYEE) {

        tmpPermissionArr.forEach((remPermission: any) => {
          let deletePermission = this.permission.filter((x: any) => x == remPermission)[0];
          if (typeof deletePermission != 'undefined') {
            let remIndex = this.permission.indexOf(deletePermission)
            this.permission.splice(remIndex, 1)
          }
        });

        if (viewArr && viewArr.length > 0 && permissionId != this.constantValues.VIEWEMPLOYEE) {
          for (let i = 0; i < viewArr.length; i++) {
            this.permission.push(viewArr[i])
          }
        } else {
          for (let j = 0; j < this.empPermission.length; j++) {
            if (this.empPermission[j].permissions.length > 0) {
              for (let k = 0; k < this.empPermission[j].permissions.length; k++) {
                if (permissionId == this.constantValues.VIEWEMPLOYEE && this.empPermission[j].permissions[k].permissionClass == 'visibility') {
                  this.empPermission[j].permissions[k].isChecked = false
                }
              }
            }
          }
        }
      } else {
        this.empPermission.forEach((element: any) => {
          element.permissions.forEach((empView: any) => {
            empView.isChecked = false
            let deletePermission = this.permission.filter((x: any) => x == empView.id)[0];
            if (typeof deletePermission != 'undefined') {
              let remIndex = this.permission.indexOf(deletePermission)
              this.permission.splice(remIndex, 1)
            }
          })
        })
      }
    }
  }

  giveAllPermissionValues(evt: any) {
    let isPermission = (evt) ? true : false
    this.permission = []
    if (!isPermission) {
      return
    }
    for (let j = 0; j < this.empPermission.length; j++) {
      if (this.empPermission[j].permissions.length > 0) {
        for (let k = 0; k < this.empPermission[j].permissions.length; k++) {
          this.empPermission[j].permissions[k].isChecked = isPermission
          if (isPermission) {
            this.permission.push(this.empPermission[j].permissions[k].id)
          }
        }
      }
    }
    for (let j = 0; j < this.jobPermission.length; j++) {
      if (this.jobPermission[j].permissions.length > 0) {
        for (let k = 0; k < this.jobPermission[j].permissions.length; k++) {
          this.jobPermission[j].permissions[k].isChecked = isPermission
          if (isPermission) {
            this.permission.push(this.jobPermission[j].permissions[k].id)
          }
        }
      }
    }
    for (let j = 0; j < this.otherPermission.length; j++) {
      if (this.otherPermission[j].permissions.length > 0) {
        for (let k = 0; k < this.otherPermission[j].permissions.length; k++) {
          this.otherPermission[j].permissions[k].isChecked = isPermission
          if (isPermission) {
            this.permission.push(this.otherPermission[j].permissions[k].id)
          }
        }
      }
    }
  }

  cancelBtn() {
    this.modalRef.hide();
    document.title = 'Employee'
  }
}