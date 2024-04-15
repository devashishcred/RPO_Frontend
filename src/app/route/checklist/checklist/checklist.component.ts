import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, ElementRef, OnInit, Renderer2, TemplateRef, ViewChild } from "@angular/core";
import { MatExpansionPanel } from "@angular/material/expansion";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ToastrService } from "ngx-toastr";
import { any } from "underscore";
import { AppComponent } from "../../../app.component";
import { JobApplicationService } from "../../../services/JobApplicationService.services";
import { JobCheckListServices } from "./checklist.service";
import { constantValues } from "../../../app.constantValues";
import { Job } from "../../../types/job";
import { JobServices } from "../../job/job.services";
import { JobViolationServices } from "../../job/jobDetail/jobViolation/jobViolation.service";
import { UserRightServices } from "../../../services/userRight.services";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { LocalStorageService } from "../../../services/local-storage.service";
import { MatSelect } from "@angular/material/select";
import { JobSharedService } from "../../job/JobSharedService";
import { MatOption } from "@angular/material/core";
declare const $: any;

interface WorkOrder {
  number: any;
  IdJobPlumbingInspection: any;
}

@Component({
  selector: "checklist",
  templateUrl: "./checklist.component.html",
  styleUrls: ["./checklist.component.scss"],
})
export class ChecklistComponent implements OnInit {
  xpandStatus = true;
  isItemShow = true;
  isComposite = false;
  searchedTerm;
  model: any;
  selected = null;
  selctOption = null;
  responsibleSelect = "User";
  currentlyOpenedItemIndex = -1;
  idChecklist: any;
  toggle = [];
  value: any;
  compositeChecklist = [];
  workOrderData: any;
  checklistType: any = 'General';
  checklistTypeForModal: any = 'General';
  IsPlGroup: boolean;
  classes: any;
  jobContacts: any = [];
  @ViewChild("ckeditor", {static: true}) ckeditor: any;
  private configuration: any;
  toppingList: string[] = [
    "Extra cheese",
    "Mushroom",
    "Onion",
    "Pepperoni",
    "Sausage",
    "Tomato",
  ];
  @ViewChild("panel1") firstPanel: MatExpansionPanel;
  @ViewChild("panel2") firstPanel2: MatExpansionPanel;
  @ViewChild("tplDeleteChecklist", {static: true})
  private tpl: TemplateRef<any>;
  @ViewChild("tplDeleteChecklistItem", {static: true})
  private tplDeleteChecklistItem: TemplateRef<any>;
  @ViewChild("PlItemDelete", {static: true})
  private PlItemDelete: TemplateRef<any>;
  @ViewChild("formGenerateChecklist", {static: true})
  private formGenerateChecklist: TemplateRef<any>;
  public filteredList2 = this.toppingList.slice();
  @ViewChild('progressionnote', {static: true})
  private progressionNote: TemplateRef<any>
  @ViewChild('clientnotes', {static: true})
  private clientnotes: TemplateRef<any>
  @ViewChild('viewViolation', {static: true})
  private viewViolation: TemplateRef<any>
  @ViewChild('viewDobViolation', {static: true})
  public viewDobViolation: TemplateRef<any>

  @ViewChild("jobDocument", {static: true})
  private jobDocument: TemplateRef<any>
  /**
   * Add transmittal form
   * @property addtransmittal
   */
  @ViewChild("addtransmittal", {static: true})
  private addtransmittal: TemplateRef<any>;
  @ViewChild("formAddItemInChecklist", {static: true})
  private formAddItemInChecklist: TemplateRef<any>;
  @ViewChild("formAddInspectionInChecklist", {static: true})
  private formAddInspectionInChecklist: TemplateRef<any>;
  @ViewChild("formAddExternalChecklist", {static: true})
  private formAddExternalChecklist: TemplateRef<any>;
  @ViewChild("ViewReferenceNote", {static: true})
  private ViewReferenceNote: TemplateRef<any>;
  @ViewChild("formAddViolation", {static: true})
  private formAddViolation: TemplateRef<any>;
  @ViewChild("formEditViolation", {static: true})
  private formEditViolation: TemplateRef<any>;

  @ViewChild("rfpprogressionnote", {static: true})
  private rfpprogressionnote: TemplateRef<any>;
  @ViewChild("formAddComment", {static: true})
  private formAddComment: TemplateRef<any>;
  @ViewChild("formAddViolationComment", {static: true})
  private formAddViolationComment: TemplateRef<any>;
  @ViewChild("exportChecklist", {static: true})
  private exportChecklist: TemplateRef<any>;

  @ViewChild("updateJobDocument", {static: true})
  private updateDocument: TemplateRef<any>;

  //@ViewChild("addJobDocument", { static: true })

  @ViewChild("editWorkOrderNo", {static: true})
  private addDocument: TemplateRef<any>;
  mainChecklistArray: any[] = [];
  VoilationlistArray: any[] = [];
  VoilationDoblistArray: any[] = [];
  public VoilationDobSafetyListArray: any[] = [];
  panelOpenState = false;
  modalRef: BsModalRef;
  loading: boolean = false;
  private is_mail_sent: boolean = false;
  idJob: number;
  idViolation: number;
  public violationType: number;
  checkListSwitcherData: any[] = [];
  groupId: any;
  private selectedItemId: any;
  IdJobChecklistItemDetail: any;
  private checklistId: any;
  deleteChecklistId: any;
  deleteChecklistItemId: any;
  deleteChecklistItemStatus: any;
  jobDetail: Job;
  referenceNote: any;
  externalLink: any;
  selectedPeople = [];
  addOptions = [{
    id: 1,
    value: 'Generate Checklist'
  },
    {
      id: 2,
      value: 'Generate Composite Checklist'
    }
  ]
  ResponsibleData = [
    {
      id: 1,
      value: "Generate Checklist",
    },
    {
      id: 2,
      value: "Generate Composite Checklist",
    },
  ];

  workorderNumber: any;
  IdJobPlumbingInspection: any;
  IsPlGroupChecklist: any;
  public isDisabled = true;
  selectedDateId: any;
  violationDetails: any;
  dateEvent: any;
  showChecklistAddBtn: string = 'hide';
  showChecklistDeleteBtn: string = 'hide';
  showAddViolation: string = 'hide'
  showDeleteViolation: string = 'hide'
  dating = "2023-02-08T18:30:00.000Z";
  isHideCompleted: boolean = false;
  isShowTco: boolean = false;
  selectedCompositeChecklist: any = ''

  isChecklistTypeDropdownOpen: boolean = false;
  selectedChecklistKey: string = 'selectedChecklist';
  lastSelectedCompositeChecklistKey: string = 'lastSelectedCompositeChecklist';
  selectedChecklistTypeKey: string = 'selectedChecklistType';
  idJobPlumbingCheckListFloors: any;
  idWorkPermits: any;
  isEditGeneralFromCompositeChecklist: boolean = false;
  isFirstTimeLoading: boolean = true;
  isSearchNoDataFound: boolean = false;

  stages: any = [
    {title: 'Prior to Approval', value: '1'},
    {title: 'Prior to Permit', value: '2'},
    {title: 'Prior to Sign Off', value: '3'},
  ];
  partyResponsible: any = [
    {title: 'RPO', value: 'RPO User'},
    // { title: 'RPO User', value: 'RPO User' },
    {title: 'Contact', value: 'Contact'},
    {title: 'Other', value: 'Other'},
  ];
  plStatus: any = [
    {value: '1', title: 'Pass'},
    {value: '2', title: 'Failed'},
    {value: '3', title: 'Pending'},
    {value: '4', title: 'NA'},
  ];
  trStatus: any = [
    {value: 1, title: 'Open'},
    {value: 3, title: 'Completed'},
  ];
  statusDropdown: any = [
    {value: 1, title: 'Open'},
    {value: 2, title: 'In Process'},
    {value: 3, title: 'Completed'},
  ];
  statusDropdownOfViolation: any = [
    {value: 1, title: 'Open'},
    {value: 3, title: 'Completed'},
  ];
  exportFileType: string = '';
  isShowTcoItems: boolean = false;
  ecbViolationColumn: any = "";
  dobViolationColumn: any = "";
  dobSafetyViolationColumn: any = "";
  isEcbAscending: boolean = false;
  isDobAscending: boolean = false;
  isDobSafetyAscending: boolean = false;
  isCustomerLoggedIn: boolean = false;
  itemIdForClientNote: any;
  customerId: any;
  isShowClientNot: boolean = false;
  isShowExport: boolean = true;
  addCommentTitle: string = "Add Comments";
  isPl: boolean = false;
  selectedGroup: any;
  showJobViolation:string = 'hide';
  showDOBJobViolation:string = 'hide';
  showDOBSafetyJobViolation:string = 'hide';

  constructor(
    private modalService: BsModalService,
    private jobViolationServices: JobViolationServices,
    private route: ActivatedRoute,
    private jobServices: JobServices,
    private jobApplicationService: JobApplicationService,
    private constantValues: constantValues,
    private jobCheckListServices: JobCheckListServices,
    private appComponent: AppComponent,
    private userRight: UserRightServices,
    private toastr: ToastrService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private jobSharedService: JobSharedService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
  }

  movies = [
    "Item I - The Phantom Menace",
    "Item II - Attack of the Clones",
    "Item III - Revenge of the Sith",
    "Item IV - A New Hope",
    "Item V - The Empire Strikes Back",
  ];
  // @ViewChild('mat-select') matSelect: MatSelect;

  // ngAfterViewInit() {
  //   this.matSelect.trigger.nativeElement.querySelector('.mat-select-arrow').style.display = 'none';
  // }
  ngOnInit(): void {
    this.showJobViolation = this.userRight.checkAllowButton(this.constantValues.VIEWECBVIOLATION)
    this.showDOBJobViolation = this.userRight.checkAllowButton(this.constantValues.VIEWDOBVIOLATION)
    this.showDOBSafetyJobViolation = this.userRight.checkAllowButton(this.constantValues.VIEWDOBSAFETYVIOLATION)

    $('mat-select').each(function () {
      // Find the arrow element within each mat-select
      const arrowEl = $(this).find('.mat-select-arrow');

      // Hide the arrow using jQuery methods
      arrowEl.hide(); // Hides the element visually
      arrowEl.css('display', 'none'); // Sets the display property to "none"

      // Alternatively, you can remove the element entirely:
      // arrowEl.remove();
    });
    // console.log('mat-select',$('.mat-select-arrow-wrapper'))
    this.isCustomerLoggedIn = (this.localStorageService.getCustomerLoggedIn() && this.userRight.checkAllowButton(this.constantValues.VIEWCUSTOMER) == 'show')
    if (this.isCustomerLoggedIn) {
      this.addCommentTitle = ""
      this.customerId = this.localStorageService.getCustomerDetails().employeeId
      this.showChecklistAddBtn = 'hide'
      this.isShowClientNot = this.userRight.checkAllowButton(this.constantValues.CHECKLISTCLIENTNOTEID) == 'show' ? true : false
      this.isShowExport = this.userRight.checkAllowButton(this.constantValues.EXPORTCHECKLISTID) == 'show' ? true : false
      // $('mat-select').find('mat-select-arrow-wrapper').addClass('visibility-hidden')
    } else {
      this.showChecklistAddBtn = this.userRight.checkAllowButton(this.constantValues.ADDCHECKLIST)
      console.log("acc", this.showChecklistAddBtn)
    }
    this.workOrderData = {} as WorkOrder;

    this.showChecklistDeleteBtn = this.userRight.checkAllowButton(this.constantValues.DELETECHECKLIST)
    this.showAddViolation = this.userRight.checkAllowButton(this.constantValues.ADDEDITVIOLATION)
    this.showDeleteViolation = this.userRight.checkAllowButton(this.constantValues.DELETEVIOLATION)

    console.log("acc", this.showChecklistDeleteBtn)
    this.configuration = this.constantValues.CKEDITORCONFIGSETTING;
    this.route.parent.params.subscribe((params) => {
      console.log('params ', params);
      this.idJob = +params["id"]; // (+) converts string 'id' to a number
      if (this.isCustomerLoggedIn) {
        this.jobServices.getCustomerJobDetailById(this.idJob).subscribe(r => {
          this.jobDetail = r;
          document.title = 'Project -' + this.jobDetail.id
        })
      } else {
        this.jobServices.getJobById(this.idJob).subscribe((r) => {
          this.jobDetail = r;
          this.jobSharedService.setJobData(r);
          document.title = 'Project -' + this.jobDetail.id
          if (this.jobDetail.status > 1) {
            this.showChecklistAddBtn = 'hide'
            this.showChecklistDeleteBtn = 'hide'
            this.showAddViolation = 'hide'
            this.showDeleteViolation = 'hide'
          }
        });
      }
    });
    let selectedChecklistType = JSON.parse(localStorage.getItem(this.selectedChecklistTypeKey)) || [];
    if (selectedChecklistType.length > 0) {
      let index = selectedChecklistType.findIndex(el => el.jobId == this.idJob)
      if (index == -1) {
        this.checklistType = "General";
      } else {
        this.checklistTypeForModal = selectedChecklistType[index]['selectedChecklistType']
        this.checklistType = selectedChecklistType[index]['selectedChecklistType'];
      }
    } else {
      this.checklistType = "General";
    }
    this.route.queryParams.subscribe(
      params => {
        console.log('Got the JWT as: ', params['jwt']);

      }
    )

    if (this.checklistType === 'Composite') {
      this.getCompositeChecklistSwitcher(true)
    } else {
      this.getChecklistSwitcher();
    }
  }

  mainListDrop(event: CdkDragDrop<string[]>) {
    console.log(event);
    let tempData: any = JSON.parse(JSON.stringify(this.mainChecklistArray))
    const parentApplication = tempData.find(item => item.isParentCheckList == true);
    console.log('parentApplication', parentApplication)
    // if (parentApplication) {
    //   // Remove the completed item from the array
    //   tempData = tempData.filter(item => item !== parentApplication);

    //   // Create a new object with orderNumber 1
    //   const newCompletedItem = { ...parentApplication, compositeOrder: 1 };

    //   // Insert the new completed item at the beginning of the array
    //   tempData.unshift(newCompletedItem);
    // }
    const completedObjects = [];
    const pendingObjects = [];

    // Separate completed and pending objects
    for (const object of tempData) {
      if (object.isParentCheckList === true) {
        object.compositeOrder = tempData.length
        completedObjects.push(object);
      } else {
        pendingObjects.push(object);
      }
    }

    // Concatenate pending objects followed by completed objects
    const rearrangedArray = [...pendingObjects, ...completedObjects];


    console.log('this.mainChecklistArray', rearrangedArray)


    moveItemInArray(rearrangedArray, event.previousIndex, event.currentIndex);
    const data = rearrangedArray.map((v, index): any => ({
      ...v,
      compositeOrder: index + 1
    }));
    console.log(data);
    data.map(r => {
      delete r.groups, delete r.isExpanded, delete r.isCOProject, delete r.isParentCheckList
    })
    // data.map(r => { delete r.groups, delete r.isExpanded })
    const payload = {
      "Headers": data
    }
    console.log("payload", payload)
    console.log("this.value", this.value)
    this.loading = true
    this.jobCheckListServices.setCompositeCHecklistOrder(payload, this.value[0]).subscribe(r => {
      this.toastr.success("Record updated successfully");
      this.GetViewDataBaseOnSelection();
      this.loading = false
    }, e => {
      this.GetViewDataBaseOnSelection();
      this.loading = false
    })
  }

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    console.log(event.value);
    if (event.value) {
      const payload = {
        IdJobPlumbingInspection: this.selectedDateId,
        DueDate: event.value,
      };
      console.log(payload);
      this.loading = true;
      this.jobCheckListServices.saveChecklistDueDatePl(payload).subscribe(
        (r) => {
          console.log(r);
          this.toastr.success("Date updated successfully");
          this.GetViewDataBaseOnSelection();
          this.loading = false;
        },
        (err) => {
          this.loading = false;
          this.GetViewDataBaseOnSelection();
        }
      );
    } else {
      this.getCheckListData();
    }
  }

  private openViolationProgressionModalForm(template: TemplateRef<any>, id?: number) {
    this.idViolation = id
    if (!id) {

    }
    this.modalRef = this.modalService.show(template, {class: 'modal-add-task', backdrop: 'static', 'keyboard': false})
  }

  handler(e: any): void {
    alert(e.target.value);
  }

  getIdNumber(id) {
    this.selectedDateId = id;
  }

  getDateDta(e) {
  }

  public toggleFirstPanel(evt) {
    this.getVoilationList();
    this.GetViewDataBaseOnSelection();
  }

  openNewTab(url) {
    window.open("https://" + url, "_blank");
  }

  beforePanelOpened(application, groupId?, itemId?) {
    this.checklistId = application.jobChecklistHeaderId;
    this.groupId = groupId;
    this.selectedItemId = itemId;
    console.log('beforePanelOpened', application)
  }

  beforePanelClosed(application) {
    console.log('beforePanelClosed', application)
  }

  manageAccordianParentExpand(application, groupId?, groupIndex?, mapanel?, itemIndex?) {
    let key = this.checklistType == 'General' ? 'parentExpandedList' : 'compositeParentExpandedList'
    let expandedApplcations: any = JSON.parse(localStorage.getItem(key)) || []
    let index = expandedApplcations.findIndex(e => e.jobChecklistHeaderId == application.jobChecklistHeaderId)
    if (!groupId) {
      if (index == -1) {
        if (mapanel._expanded == true) {
          application.isExpanded = true
          expandedApplcations.push(application)
        }
      } else {
        if (expandedApplcations.length > 0) {
          if (mapanel._expanded == false) {
            expandedApplcations.splice(index, 1)
          }
        }
      }
    } else {
      if (expandedApplcations.length > 0) {
        // expandedApplcations[index].groups[groupIndex].isExpanded = mapanel._expanded
        if (expandedApplcations[index].groups[groupIndex].isExpanded) {
          if (itemIndex || itemIndex == 0) {
            if (expandedApplcations[index].groups[groupIndex].item?.length > 0) {
              expandedApplcations[index].groups[groupIndex].item[itemIndex].isExpanded = mapanel._expanded
            }
          } else {
            expandedApplcations[index].groups[groupIndex].isExpanded = mapanel._expanded
          }
        } else {
          expandedApplcations[index].groups[groupIndex].isExpanded = mapanel._expanded
        }
        // expandedApplcations[index].groups[groupIndex].isExpanded = !expandedApplcations[index].groups[groupIndex].isExpanded
      }
    }
    console.log('expandedApplcations', expandedApplcations)
    localStorage.setItem(key, JSON.stringify(expandedApplcations))
  }

  generateChecklist(Value) {
    // this.mainChecklistArray = [];
    this.checklistTypeForModal = Value;
    if (Value == "Composite") {
      console.log(this.addOptions);
      this.getCompositeChecklistSwitcher();
    } else {
      console.log('checklistType', this.checklistType)
      if (this.checklistType == 'Composite') {
        this.isFirstTimeLoading = false
      }
      this.getChecklistSwitcher();
    }
  }

  isOpen(groupId, checklistId) {
    this.groupId = groupId;
    this.checklistId = checklistId;
    this.xpandStatus = false;
    this.isItemShow = true;
    this.classes = 'w500'
    console.log(this.mainChecklistArray);
    this.openModalForm(this.formAddItemInChecklist);
  }

  addInspection(groupId, idJobPlumbingCheckListFloors, idWorkPermits) {
    this.groupId = groupId;
    this.idJobPlumbingCheckListFloors = idJobPlumbingCheckListFloors;
    this.idWorkPermits = idWorkPermits;
    this.openModalForm(this.formAddInspectionInChecklist);
  }

  openModalAddForm(
    template: TemplateRef<any>,
    action?: string,
    id?: number
  ) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-job-document",
      backdrop: "static",
      keyboard: false,
    });
  }

  private openModalAddFormWorkorder(
    template: TemplateRef<any>,
    id?: number,
    idJobPlumbingInspection?: any
  ) {
    this.workorderNumber = id;
    this.workOrderData.IdJobPlumbingInspection = idJobPlumbingInspection;
    this.modalRef = this.modalService.show(template, {
      class: "modal-md",
      backdrop: "static",
      keyboard: false,
    });
  }

  openModalReferenceNote(
    template: TemplateRef<any>,
    id?: number,
    isPlChecklist?: boolean
  ) {
    this.getRefrenceNote(id, isPlChecklist);
    this.modalRef = this.modalService.show(template, {
      class: "modal-job-document",
      backdrop: "static",
      keyboard: false,
    });
  }

  openModalProgressNote(
    template: TemplateRef<any>,
    id,
    isGroup,
    idJobPlumbingInspection?: any
  ) {
    this.IsPlGroup = isGroup;
    this.IdJobChecklistItemDetail = id;
    this.IdJobPlumbingInspection = idJobPlumbingInspection;
    this.modalRef = this.modalService.show(template, {
      class: "modal-job-document",
      backdrop: "static",
      keyboard: false,
    });
  }

  openModalAddDoc(template: TemplateRef<any>, id?: number) {
    this.IdJobChecklistItemDetail = id;
    this.modalRef = this.modalService.show(template, {
      class: "modal-job-document",
      backdrop: "static",
      keyboard: false,
    });
  }

  openModalAddDocUpload(
    template: TemplateRef<any>,
    id?: number,
    isPlChecklist?: boolean
  ) {
    this.IsPlGroupChecklist = isPlChecklist;
    this.IdJobChecklistItemDetail = id;
    this.modalRef = this.modalService.show(template, {
      class: "modal-job-document",
      backdrop: "static",
      keyboard: false,
    });

  }

  public openModalViewDocUpload(
    template: TemplateRef<any>,
    id?: number,
    isPlChecklist?: boolean
  ) {
    this.IsPlGroupChecklist = isPlChecklist;
    this.IdJobChecklistItemDetail = id;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-company',
      backdrop: "static",
      keyboard: false,
    });
  }

  getRefrenceNote(id, isPlChecklist) {
    this.loading = true;
    if (isPlChecklist) {
      this.jobCheckListServices.getChecklistReferenceNoteByPlId(id).subscribe(
        (r) => {
          if (
            r[0].externalLink == null &&
            r[0].referenceDoc.length == 0 &&
            r[0].referenceNote == ""
          ) {
            this.referenceNote = null;
            this.modalRef.hide();
            this.toastr.error("No reference is there for this checklist item");
          } else {
            this.referenceNote = r;
            if (r[0].externalLink != null) {
              this.externalLink = r[0].externalLink.split(",");
            }
          }

          this.loading = false;
        },
        (e) => {
          this.loading = false;
          this.modalRef.hide();
          this.toastr.error("No reference is there for this checklist item");
        }
      );
    } else {
      this.jobCheckListServices.getChecklistReferenceNoteById(id).subscribe(
        (r) => {
          if (
            r[0].externalLink == null &&
            r[0].referenceDoc.length == 0 &&
            r[0].referenceNote == ""
          ) {
            this.referenceNote = null;
            this.modalRef.hide();
            this.toastr.error("No reference is there for this checklist item");
          } else {
            this.referenceNote = r;
            if (r[0].externalLink != null) {
              this.externalLink = r[0].externalLink.split(",");
            }
          }

          this.loading = false;
        },
        (e) => {
          this.loading = false;
          this.modalRef.hide();
          this.toastr.error("No reference is there for this checklist item");
        }
      );
    }
  }

  /**
   * This method is used to get job types
   * @method getWorkPermit
   */
  getChecklistSwitcher(isChecklistGenerated?) {
    // this.loading = true;
    console.log('run 2', this.idJob)
    this.jobCheckListServices.getChecklistApplication(this.idJob).subscribe(
      (r) => {
        console.log(r)
        if (r.length > 0) {
          //  const map1 = r.map(v => ({...v, itemName: 'Application' + ' ' +  v.jobApplicationTypeName + ' ' + v.jobApplicationNumber + ' - ' + v.permitType + ' - ' + v.jobapplicationFilingstatus}));
          r.sort(
            (a, b) =>
              new Date(b.lastModifiedDate).getTime() -
              new Date(a.lastModifiedDate).getTime()
          );
          this.checkListSwitcherData = r;
          console.log('this.checkListSwitcherData', this.checkListSwitcherData)
          const id = localStorage.getItem('RedirectChecklistId');
          const isRedirect = localStorage.getItem('IsRedirectChecklistId');
          console.log('RedirectChecklistId', [+id])
          if (isChecklistGenerated) {
            console.log('isChecklistGenerated', isChecklistGenerated)
            this.selectedPeople = (isRedirect == "true") ? [+id] : [this.checkListSwitcherData[0].id]
            let selectedChecklist = localStorage.getItem(this.selectedChecklistKey) == null ? [] : JSON.parse(localStorage.getItem(this.selectedChecklistKey))?.filter(el => el.jobId == this.idJob)
            if (selectedChecklist?.length > 0) {
              if (selectedChecklist[0]?.jobId?.toString()) {
                this.selectedPeople = this.selectedPeople.concat(selectedChecklist[0].selectedChecklist)
              }
            }
            this.setSelectedChecklist()
          }
          // this.selectedPeople = (isRedirect == "true") ? [+id] : [this.checkListSwitcherData[0].id];
          console.log('selectedChecklistKey', localStorage.getItem(this.selectedChecklistKey))
          if (localStorage.getItem(this.selectedChecklistKey) == null) {
            this.selectedPeople = (isRedirect == "true") ? [+id] : [this.checkListSwitcherData[0].id]
          } else {
            let selectedChecklist = localStorage.getItem(this.selectedChecklistKey) == null ? [] : JSON.parse(localStorage.getItem(this.selectedChecklistKey))?.filter(el => el.jobId == this.idJob)
            console.log('selectedChecklist', selectedChecklist)
            if (selectedChecklist?.length > 0) {
              if (selectedChecklist[0]?.jobId?.toString()) {
                this.selectedPeople = (isRedirect == "true") ? [+id] : selectedChecklist[0].selectedChecklist;
                if (this.selectedPeople.length == 0) {
                  this.selectedPeople = (isRedirect == "true") ? [+id] : [this.checkListSwitcherData[0].id]
                }
              } else {
                this.selectedPeople = (isRedirect == "true") ? [+id] : [this.checkListSwitcherData[0].id]
              }
            } else {
              this.selectedPeople = (isRedirect == "true") ? [+id] : [this.checkListSwitcherData[0].id]
            }
          }
          if (this.isFirstTimeLoading) {
            this.getAllChecklistData(this.selectedPeople);
            this.isFirstTimeLoading = false
          }
        } else {
          if (this.checklistType == 'General') {
            this.checkListSwitcherData = []
            this.selectedPeople = []
            this.mainChecklistArray = []
          }
        }
        // this.loading = false;
      },
      (e) => {
        console.log(e)
        this.loading = false;
      }
    );
  }

  getVoilationList() {
    if (this.checklistType === "General") {
      return
    }
    this.loading = true
    let isCOProject = this.isShowTcoItems;
    if (!isCOProject || isCOProject == null || isCOProject == undefined) {
      isCOProject = false;
    }
    this.jobCheckListServices.getVoilationList(this.value[0], isCOProject, this.searchedTerm).subscribe((r) => {
      if (r.length > 0) {
        r.sort(
          (a, b) =>
            new Date(b.dateIssued).getTime() -
            new Date(a.dateIssued).getTime()
        );
        this.VoilationlistArray = r;
      } else {
        this.VoilationlistArray = [];
      }
      console.log('VoilationlistArray', this.VoilationlistArray)
      this.loading = false;
    }, err => {
      this.loading = false;
    });
    this.jobCheckListServices.getDobVoilationList(this.value[0], isCOProject, this.searchedTerm).subscribe((r) => {
      if (r.length > 0) {
        r.sort(
          (a, b) =>
            new Date(b.dateIssued).getTime() -
            new Date(a.dateIssued).getTime()
        );
        this.VoilationDoblistArray = r;
      } else {
        this.VoilationDoblistArray = [];
      }
      console.log('VoilationDoblistArray', this.VoilationDoblistArray)
      this.loading = false;
    }, err => {
      this.loading = false;
    });
    this.jobCheckListServices.getDobSafetyVoilationList(this.value[0], isCOProject, this.searchedTerm).subscribe((r) => {
      if (r.length > 0) {
        r.sort(
          (a, b) =>
            new Date(b.dateIssued).getTime() -
            new Date(a.dateIssued).getTime()
        );
        this.VoilationDobSafetyListArray = r;
      } else {
        this.VoilationDobSafetyListArray = [];
      }
      console.log('VoilationDobSafetyListArray', this.VoilationDobSafetyListArray)
      this.loading = false;
    }, err => {
      this.loading = false;
    });
  }

  changeTcoForPlumbing(e, IdJobchecklistitemdetail, isplumbingitem) {
    const payload = {
      IdJobchecklistitemdetail: IdJobchecklistitemdetail,
      IsRequiredForTCO: e.target.checked,
      isplumbingitem: isplumbingitem,
    };
    this.jobCheckListServices
      .saveChecklistTco(payload, IdJobchecklistitemdetail)
      .subscribe(
        (r) => {
          this.loading = false;
          this.toastr.success("Record updated successfully");
          this.getCompositeCheckListData();
        },
        (err) => {
          this.loading = false;
          this.getCompositeCheckListData();
        }
      );
  }

  changeTco(e, IdJobchecklistitemdetail, isplumbingitem) {
    const payload = {
      IdJobchecklistitemdetail: IdJobchecklistitemdetail,
      IsRequiredForTCO: e.target.checked,
      isplumbingitem: isplumbingitem,
    };
    this.jobCheckListServices
      .saveChecklistTco(payload, IdJobchecklistitemdetail)
      .subscribe(
        (r) => {
          this.loading = false;
          this.toastr.success("Record updated successfully");
          this.getCompositeCheckListData();
        },
        (err) => {
          this.loading = false;
          this.getCompositeCheckListData();
        }
      );
  }

  changeTcoForViolation(e, violationId) {
    const payload = {
      IdJobViolation: violationId,
      IsRequiredForTCO: e.target.checked,
    };
    this.jobCheckListServices
      .saveChecklistTcoForViolation(payload)
      .subscribe(
        (r) => {
          this.loading = false;
          this.toastr.success("Record updated successfully");
          this.getVoilationList()
        },
        (err) => {
          this.loading = false;
        }
      );
  }

  updateChecklistStatusForViolation(status, violationId) {
    const payload = {
      Status: status,
      IdJobViolation: violationId,
    };
    this.jobCheckListServices
      .updateChecklistStatusForViolation(payload)
      .subscribe(
        (r) => {
          this.loading = false;
          this.toastr.success("Record updated successfully");
          this.getVoilationList()
        },
        (err) => {
          this.loading = false;
        }
      );
  }

  /**
   * This method is used to get job types
   * @method getWorkPermit
   */
  getCompositeChecklistSwitcher(idUpdated?, isDeleted?, isCreated?) {
    // this.loading = true;
    // this.mainChecklistArray = [];
    // this.value = [];
    // this.compositeChecklist = []
    this.jobCheckListServices.getCompositeChecklist(this.idJob).subscribe(
      (r) => {
        console.log('getCompositeChecklistSwitcher', r)
        // this.compositeChecklist = r;
        // this.value = this.compositeChecklist[0].id;
        // console.log(this.compositeChecklist[0].id)
        if (r.length > 0) {
          r.sort(
            (a, b) =>
              new Date(b.lastModifiedDate).getTime() -
              new Date(a.lastModifiedDate).getTime()
          );
          this.compositeChecklist = r;
          console.log(this.selectedPeople);
          // this.mainChecklistArray = [];

          if (idUpdated) {
            if (isDeleted) {
              this.value = [this.compositeChecklist[0].id];
              this.setLastCompositeChecklist(this.idJob, this.value)
            }
            if (isCreated) {
              this.setLastCompositeChecklist(this.idJob, this.value)
            } else {
              let lastSelectedCompositeData = JSON.parse(localStorage.getItem(this.lastSelectedCompositeChecklistKey)) || []
              if (lastSelectedCompositeData.length > 0) {
                let selected = lastSelectedCompositeData.find(el => el.jobId === this.idJob)
                if (selected.selectedChecklist) {
                  let i = this.compositeChecklist.findIndex(el => el.id == selected.selectedChecklist[0])
                  if (i == -1) {
                    this.value = [this.compositeChecklist[0].id];
                    this.setLastCompositeChecklist(this.idJob, this.value)
                  } else {
                    this.value = selected.selectedChecklist
                  }
                } else {
                  this.value = [this.compositeChecklist[0].id];
                  this.setLastCompositeChecklist(this.idJob, this.value)
                }
              } else {
                this.value = [this.compositeChecklist[0].id];
                this.setLastCompositeChecklist(this.idJob, this.value)
              }
            }
            if (!this.value || this.value?.length == 0) {
              this.value = [this.compositeChecklist[0].id];
            }
            // this.value = [this.compositeChecklist[0].id];
            this.getAllCompositeChecklistData(this.value);
          } else {
            let lastSelectedCompositeData = JSON.parse(localStorage.getItem(this.lastSelectedCompositeChecklistKey)) || []
            if (lastSelectedCompositeData.length > 0) {
              let selected = lastSelectedCompositeData.find(el => el.jobId === this.idJob)
              if (selected.selectedChecklist) {
                this.value = selected.selectedChecklist
              } else {
                this.value = [this.compositeChecklist[0].id];
              }
            } else {
              this.value = [this.compositeChecklist[0].id];
            }
          }
        } else {
          if (this.checklistType == 'Composite') {
            this.compositeChecklist = []
            this.mainChecklistArray = [];
            this.value = [];
          }
        }

        // this.loading = false;
      },
      (e) => {
        this.loading = false;
      }
    );
  }

  switchCompositeChecklist(e) {
    this.value = [e];
    console.log('switchCompositeChecklist', this.value)
    // this.getAllCompositeChecklistData(e);
  }

  goToChecklist(id, jobid) {
    if (jobid == this.idJob) {
      this.checklistType = 'General'
      this.selectedPeople = [id];
      this.getAllChecklistData(this.selectedPeople[0]);
    } else {
      this.router.navigate(['/job/' + jobid + "/checklist"])
      localStorage.setItem("RedirectChecklistId", id);
      localStorage.setItem("IsRedirectChecklistId", "true");

    }
  }

  /**
   * This method get contacts list
   * @method contacts
   * @param {number} idJob ID of Job
   */
  contacts(idJob: number) {
    this.jobApplicationService.getJobContacts(idJob).subscribe(
      (r) => {
        if (r.data.length > 0) {
          let data = r.data;
          let contacts = _.sortBy(data, function (data: any) {
            return data.contactName.toLowerCase();
          });
          console.log('contacts', contacts)
          this.jobContacts = contacts;
        }
      },
      (e) => {
        this.loading = false;
      }
    );
  }

  getAllChecklistData(id) {
    this.loading = true;
    this.checklistType = 'General'
    localStorage.setItem("IsRedirectChecklistId", "false");
    id = id.filter(el => el != 'all')
    if (this.isCustomerLoggedIn) {
      this.jobCheckListServices.getChecklistAllCustomer(id, "GROUP", this.searchedTerm).subscribe(
        (r) => {
          const ids = this.selectedPeople.map((id) =>
            this.checkListSwitcherData.find((el) => el.id == id)
          );
          console.log(ids);
          r.forEach((r) => {
            console.log(r);
            r.isExpanded = false;
            r.groups.forEach((s) => {
              s.isExpanded = false;
              s.item.forEach((r) => (r.isExpanded = false, r.isChecked = false));
              if (s.checkListGroupType == 'PL') {
                s.item.sort((a, b) => a.floorDisplayOrder - b.floorDisplayOrder)
              }
            });
          });
          this.contacts(this.idJob);
          this.mainChecklistArray = r;
          this.setInspectionStatus()
          this.setExpandedInListing()
          this.loading = false;
        },
        (e) => {
          console.log(e);
          this.mainChecklistArray = [];
          this.loading = false;
        }
      );
    } else {
      this.jobCheckListServices.getChecklistAll(id, "GROUP", this.searchedTerm).subscribe(
        (r) => {
          const ids = this.selectedPeople.map((id) =>
            this.checkListSwitcherData.find((el) => el.id == id)
          );
          console.log(ids);
          r.forEach((r) => {
            console.log(r);
            r.isExpanded = false;
            r.groups.forEach((s) => {
              s.isExpanded = false;
              s.item.forEach((r) => (r.isExpanded = false, r.isChecked = false));
              if (s.checkListGroupType == 'PL') {
                s.item.sort((a, b) => a.floorDisplayOrder - b.floorDisplayOrder)
              }
            });
          });
          this.contacts(this.idJob);
          this.mainChecklistArray = r;
          this.setInspectionStatus()
          this.setExpandedInListing()
          this.loading = false;
        },
        (e) => {
          console.log(e);
          this.mainChecklistArray = [];
          this.loading = false;
        }
      );
    }
  }

  getAllCompositeChecklistData(id: any) {
    console.log(id);
    this.checklistType = 'Composite'
    if (id) {
      this.loading = true;
      if (this.isCustomerLoggedIn) {
        this.jobCheckListServices.getCompositeChecklistAllCustomer(id, "GROUP", this.searchedTerm).subscribe(
          (r) => {
            this.loading = false;
            //const ids = this.selectedPeople.map((id) => this.checkListSwitcherData.find((el) => el.id == id));
            //  console.log(ids)
            r.forEach((r) => {
              console.log(r.groups);
              r.isExpanded = false;
              // if (r?.isParentCheckList) {
              //   r.compositeOrder = 1
              // }
              r.groups.forEach((s) => {
                s.isExpanded = false;
                s.item.forEach((r) => (r.isExpanded = false, r.isChecked = false));
                if (s.checkListGroupType == 'PL') {
                  s.item.sort((a, b) => a.floorDisplayOrder - b.floorDisplayOrder)
                }
              });
            });
            r.sort((a, b) => a.compositeOrder - b.compositeOrder)
            this.contacts(this.idJob);
            this.mainChecklistArray = r;
            if (!this.searchedTerm) {
              this.isShowTcoItems = this.mainChecklistArray[0]?.isCOProject
            }
            this.setLastCompositeChecklist(this.idJob, id);
            this.setInspectionStatus();
            this.setExpandedInListing();
            this.getVoilationList();
            // if (this.mainChecklistArray.length > 0) {
            //   this.mainChecklistArray[0].isExpanded = true;
            //   this.mainChecklistArray[0].groups[0].isExpanded = true;
            //   console.log(r);
            // }
          },
          (e) => {
            console.log(e);
            this.mainChecklistArray = [];
            this.loading = false;
          }
        );
      } else {
        this.jobCheckListServices.getCompositeChecklistAll(id, "GROUP", this.searchedTerm).subscribe(
          (r) => {
            //const ids = this.selectedPeople.map((id) => this.checkListSwitcherData.find((el) => el.id == id));
            //  console.log(ids)
            r.forEach((r) => {
              console.log(r.groups);
              r.isExpanded = false;
              // if (r?.isParentCheckList) {
              //   r.compositeOrder = 1
              // }
              r.groups.forEach((s) => {
                s.isExpanded = false;
                s.item.forEach((r) => (r.isExpanded = false, r.isChecked = false));
                if (s.checkListGroupType == 'PL') {
                  s.item.sort((a, b) => a.floorDisplayOrder - b.floorDisplayOrder)
                }
              });
            });
            r.sort((a, b) => a.compositeOrder - b.compositeOrder)
            this.contacts(this.idJob);
            this.mainChecklistArray = r;
            if (!this.searchedTerm) {
              this.isShowTcoItems = this.mainChecklistArray[0]?.isCOProject
            }
            this.setLastCompositeChecklist(this.idJob, id);
            this.setInspectionStatus();
            this.setExpandedInListing();
            this.getVoilationList();
            // if (this.mainChecklistArray.length > 0) {
            //   this.mainChecklistArray[0].isExpanded = true;
            //   this.mainChecklistArray[0].groups[0].isExpanded = true;
            //   console.log(r);
            // }
            this.loading = false;
          },
          (e) => {
            console.log(e);
            this.mainChecklistArray = [];
            this.loading = false;
          }
        );
      }
    }
  }

  dateEventEmitter(date, id) {
    console.log(id);
    if (date) {
      const payload = {
        IdJobChecklistItemDetail: this.selectedDateId,
        DueDate: date,
      };
      console.log(payload);
      this.loading = true;
      this.jobCheckListServices.saveChecklistDueDate(payload).subscribe(
        (r) => {
          console.log(r);
          this.toastr.success("Date updated successfully");
          this.GetViewDataBaseOnSelection();
          this.loading = false;
        },
        (err) => {
          this.loading = false;
          this.GetViewDataBaseOnSelection();
        }
      );
    } else {
      this.GetViewDataBaseOnSelection();
    }
  }

  getAllChecklistDataAll(id) {
    this.loading = true;
    this.jobCheckListServices.getChecklistAll(id, "GROUP", this.searchedTerm).subscribe(
      (r) => {
        if (r?.length == 0) {
          if (this.searchedTerm) {
            this.isSearchNoDataFound = true
          } else {
            this.isSearchNoDataFound = false
          }
          // this.searchedTerm = ''
        }
        this.contacts(this.idJob);
        r.forEach((r) => {
          console.log(r.groups);
          r.isExpanded = false;
          r.groups.forEach((s) => {
            s.isExpanded = false
          });
        });
        //const map1 = r.map(v => ({...v, isExpanded: true}));
        r.forEach((r) => {
          r.jobChecklistHeaderId == this.checklistId
            ? (r.isExpanded = true)
            : (r.isExpanded = false);

          r.groups.forEach((s) => {
            s.jobChecklistGroupId == this.groupId
              ? (s.isExpanded = true)
              : (s.isExpanded = false);
            s.item.forEach((r) =>
              r.isChecked = false,
              r.idChecklistItem == this.selectedItemId
                ? (r.isExpanded = true)
                : (r.isExpanded = false)
            );
            if (s.checkListGroupType == 'PL') {
              s.item.sort((a, b) => a.floorDisplayOrder - b.floorDisplayOrder)
            }
          });
        });
        this.mainChecklistArray = r;
        this.setInspectionStatus()
        this.setExpandedInListing()
        console.log(r);
        this.loading = false;
      },
      (e) => {
        console.log(e);
        this.mainChecklistArray = [];
        this.loading = false;
      }
    );
  }

  getAllCompositeChecklistDataView(id) {
    if (id) {
      this.loading = true;
      if (this.isCustomerLoggedIn) {
        this.jobCheckListServices.getCompositeChecklistAllCustomer(id, "GROUP", this.searchedTerm).subscribe(
          (r) => {
            this.loading = false;
            if (r?.length == 0) {
              if (this.searchedTerm) {
                this.isSearchNoDataFound = true
              } else {
                this.isSearchNoDataFound = false
              }
              // this.searchedTerm = ''
            }
            this.contacts(this.idJob);
            r.forEach((r) => {
              // if (r?.isParentCheckList) {
              //   r.compositeOrder = 1
              // }
              console.log(r.groups);
              r.isExpanded = false;
              r.groups.forEach((s) => {
                s.isExpanded = false
              });
            });
            //const map1 = r.map(v => ({...v, isExpanded: true}));
            r.forEach((r) => {
              r.jobChecklistHeaderId == this.checklistId
                ? (r.isExpanded = true)
                : (r.isExpanded = false);

              r.groups.forEach((s) => {
                s.jobChecklistGroupId == this.groupId
                  ? (s.isExpanded = true)
                  : (s.isExpanded = false);
                s.item.forEach((r) =>
                  r.isChecked = false,
                  r.idChecklistItem == this.selectedItemId
                    ? (r.isExpanded = true)
                    : (r.isExpanded = false)
                );
                if (s.checkListGroupType == 'PL') {
                  s.item.sort((a, b) => a.floorDisplayOrder - b.floorDisplayOrder)
                }
              });
            });
            r.sort((a, b) => a.compositeOrder - b.compositeOrder)
            this.mainChecklistArray = r;
            this.setInspectionStatus()
            this.setExpandedInListing()
            console.log(r);
          },
          (e) => {
            console.log(e);
            this.mainChecklistArray = [];
            this.loading = false;
          }
        );
      } else {
        this.jobCheckListServices.getCompositeChecklistAll(id, "GROUP", this.searchedTerm).subscribe(
          (r) => {
            if (r?.length == 0) {
              if (this.searchedTerm) {
                this.isSearchNoDataFound = true
              } else {
                this.isSearchNoDataFound = false
              }
              // this.searchedTerm = ''
            }
            this.contacts(this.idJob);
            r.forEach((r) => {
              // if (r?.isParentCheckList) {
              //   r.compositeOrder = 1
              // }
              console.log(r.groups);
              r.isExpanded = false;
              r.groups.forEach((s) => {
                s.isExpanded = false,
                  s.isChecked = false
              });
            });
            //const map1 = r.map(v => ({...v, isExpanded: true}));
            r.forEach((r) => {
              r.jobChecklistHeaderId == this.checklistId
                ? (r.isExpanded = true)
                : (r.isExpanded = false);

              r.groups.forEach((s) => {
                s.jobChecklistGroupId == this.groupId
                  ? (s.isExpanded = true)
                  : (s.isExpanded = false);
                s.item.forEach((r) =>
                  r.isChecked = false,
                  r.idChecklistItem == this.selectedItemId
                    ? (r.isExpanded = true)
                    : (r.isExpanded = false)
                );
                if (s.checkListGroupType == 'PL') {
                  s.item.sort((a, b) => a.floorDisplayOrder - b.floorDisplayOrder)
                }
              });
            });
            r.sort((a, b) => a.compositeOrder - b.compositeOrder)
            this.mainChecklistArray = r;
            this.setInspectionStatus()
            this.setExpandedInListing()
            console.log(r);
            this.loading = false;
          },
          (e) => {
            console.log(e);
            this.mainChecklistArray = [];
            this.loading = false;
          }
        );
      }
    }
  }

  getAllChecklistDataAllForItems(id) {
    this.loading = true;
    this.jobCheckListServices.getChecklistAll(id, "ITEM", this.searchedTerm).subscribe(
      (r) => {
        r.forEach((r) => {
          console.log(r.groups);
          r.isExpanded = false;
          r.groups.forEach((s) => {
            s.isExpanded = false
          });
        });
        r.forEach((r) => {
          r.jobChecklistHeaderId == this.checklistId
            ? (r.isExpanded = true)
            : (r.isExpanded = false);

          r.groups.forEach((s) => {
            s.jobChecklistGroupId == this.groupId
              ? (s.isExpanded = true)
              : (s.isExpanded = false);
            if (s.checkListGroupType == 'PL') {
              s.item.sort((a, b) => a.floorDisplayOrder - b.floorDisplayOrder)
            }
          });
        });
        this.mainChecklistArray = r;
        this.setInspectionStatus()
        this.setExpandedInListing()
        console.log(r);
        this.loading = false;
      },
      (e) => {
        console.log(e);
        this.mainChecklistArray = [];
        this.loading = false;
      }
    );
  }

  afterGenartegetAllChecklistDataAll(id) {
    this.loading = true;
    this.jobCheckListServices.getChecklistAll(id, "GROUP", this.searchedTerm).subscribe(
      (r) => {
        r.forEach((r) => {
          console.log(r.groups);
          r.isExpanded = false;
          r.groups.forEach((s) => {
            s.isExpanded = false
            if (s.checkListGroupType == 'PL') {
              s.item.sort((a, b) => a.floorDisplayOrder - b.floorDisplayOrder)
            }
          });
        });
        this.mainChecklistArray = r;
        this.setInspectionStatus()
        this.setExpandedInListing()
        // this.mainChecklistArray[0].isExpanded = true;
        // this.mainChecklistArray[0].groups[0].isExpanded = true;
        this.loading = false;
      },
      (e) => {
        console.log(e);
        this.mainChecklistArray = [];
        this.loading = false;
      }
    );
  }

  /**
   * This method is used to open modal popup for openModalForm
   * @method openModalForm
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   * @param {boolean} isNew it is optional which contains true if it is new record and false when it is old record
   */
  openModalForm(
    template: TemplateRef<any>,
    id?: number,
    isNew?: boolean
  ) {
    // this.isNew = false
    if (isNew) {
      // this.isNew = true
      //this.groupId = null
    }
    this.modalRef = this.modalService.show(template, {
      class: "modal-md " + this.classes,
      backdrop: "static",
      keyboard: false,
    });
    this.classes = ''
    console.log(this.modalRef);
  }

  isChecklistGenerate(e) {
    console.log('isChecklistGenerate', e);
    this.isEditGeneralFromCompositeChecklist = false;
    if (e) {
      if (e == 'Composite created') {
        this.checklistType = 'Composite'
        this.checklistTypeForModal = 'Composite'
      } else if (e == 'General edit') {
        this.checklistType = 'General'
        this.checklistTypeForModal = 'General'
      } else {
        this.checklistType = e
        this.checklistTypeForModal = e
      }

      if (this.checklistType == "General") {
        this.isFirstTimeLoading = true
        if (e == 'General edit') {
          this.getChecklistSwitcher(false);
        } else {
          this.getChecklistSwitcher(true);
        }
      } else {
        if (e == 'Composite created') {
          this.getCompositeChecklistSwitcher(true, true, true)
        } else {
          this.getCompositeChecklistSwitcher(true)
        }
        // this.GetViewDataBaseOnSelection();
      }
      this.selctOption = null;
    } else {
      this.selctOption = null;
      this.mainChecklistArray.forEach((r) => {
        r.jobChecklistHeaderId == this.checklistId
          ? (r.isExpanded = true)
          : (r.isExpanded = false);

        r.groups.forEach((s) => {
          s.jobChecklistGroupId == this.groupId
            ? (s.isExpanded = true)
            : (s.isExpanded = false);
        });
      });
    }
    console.log(this.mainChecklistArray);
  }

  isChecklistGenerateComposite(e) {
    if (e) {
      if (this.checklistType == "General") {
        this.GetViewDataBaseOnSelection()
      } else {
        this.getCompositeChecklistSwitcher(true)
      }
      this.selctOption = null;
    } else {
      this.selctOption = null;
      this.mainChecklistArray.forEach((r) => {
        r.jobChecklistHeaderId == this.checklistId
          ? (r.isExpanded = true)
          : (r.isExpanded = false);

        r.groups.forEach((s) => {
          s.jobChecklistGroupId == this.groupId
            ? (s.isExpanded = true)
            : (s.isExpanded = false);
        });
      });
    }
    console.log(this.mainChecklistArray);
  }

  isChecklistUpdate(e) {
    console.log(e);
    if (e) {
      console.log(this.selectedPeople);
      //this.getAllChecklistData(this.selectedPeople);
      this.GetViewDataBaseOnSelection()
      this.selctOption = null;
    } else {
      this.selctOption = null;
      this.mainChecklistArray.forEach((r) => {
        r.jobChecklistHeaderId == this.checklistId
          ? (r.isExpanded = true)
          : (r.isExpanded = false);

        r.groups.forEach((s) => {
          s.jobChecklistGroupId == this.groupId
            ? (s.isExpanded = true)
            : (s.isExpanded = false);
        });
      });
    }
    console.log(this.mainChecklistArray);
  }

  isItemAdded(e) {
    console.log(e);
    if (e) {
      this.GetViewDataBaseOnSelection();
    } else {
      this.mainChecklistArray.forEach((r) => {
        r.jobChecklistHeaderId == this.checklistId
          ? (r.isExpanded = true)
          : (r.isExpanded = false);

        r.groups.forEach((s) => {
          s.jobChecklistGroupId == this.groupId
            ? (s.isExpanded = true)
            : (s.isExpanded = false);
        });
      });
    }
    console.log(this.mainChecklistArray);
  }

  isCommentCreated(e) {
    console.log(e);
    if (e) {
      this.checklistType == "General"
        ? this.getCheckListData()
        : this.getCompositeCheckListData();
    } else {
      if (this.checklistType == "General") {
        this.mainChecklistArray.forEach((r) => {
          r.jobChecklistHeaderId == this.checklistId
            ? (r.isExpanded = true)
            : (r.isExpanded = false);

          r.groups.forEach((s) => {
            s.jobChecklistGroupId == this.groupId
              ? (s.isExpanded = true)
              : (s.isExpanded = false);
          });
        });
      } else {
        this.mainChecklistArray.forEach((r) => {
          r.jobChecklistHeaderId == this.checklistId
            ? (r.isExpanded = true)
            : (r.isExpanded = false);

          r.groups.forEach((s) => {
            s.jobChecklistGroupId == this.groupId
              ? (s.isExpanded = true)
              : (s.isExpanded = false);
          });
        });
      }
    }

    console.log(this.mainChecklistArray);
  }

  isCommentOpen(
    e,
    id,
    groupId,
    checklistId,
    isGroup,
    idJobPlumbingInspection?: any
  ) {
    console.log(e);
    this.IsPlGroup = isGroup;
    this.IdJobChecklistItemDetail = id;
    this.IdJobPlumbingInspection = idJobPlumbingInspection;
    // this.groupId = groupId;
    // this.checklistId = checklistId;
    console.log(this.groupId);
    console.log(this.checklistId);
    this.openModalForm(this.formAddComment);
  }

  isViolationCommentCreated() {
    this.getVoilationList()
  }

  isViolationCommentOpen(id) {
    this.idViolation = id;
    this.openModalForm(this.formAddViolationComment);
  }

  /**
   * This method is used to open modal popup for openModalForm
   * @method openModalForm
   * @param {any} template type which contains template of create/edit module
   * @param {number} id?? it is optional which contains id if record is in edit mode
   * @param {boolean} isNew?? it is optional which contains true if it is new record and false when it is old record
   */
  openViolationModalForm(
    template: TemplateRef<any>,
    id?: number,
    isNew?: boolean
  ) {
    // this.isNew = false
    if (isNew) {
      // this.isNew = true
      //this.groupId = null
    }
    this.idViolation = id;
    this.modalRef = this.modalService.show(template, {
      class: "modal-company",
      backdrop: "static",
      keyboard: false,
    });
  }

  openAddViolationModal(
    template: TemplateRef<any>,
    violationType?: number,
  ) {
    // this.isNew = false
    this.violationType = violationType;
    this.modalRef = this.modalService.show(template, {
      class: "modal-company",
      backdrop: "static",
      keyboard: false,
    });
  }

  /**
   * This method is used to reload datatable
   * @method reload
   */
  reload() {
    this.getVoilationList();
    this.GetViewDataBaseOnSelection();
  }

  /**
   * This method is used to open modal popup for openModalForm
   * @method openModalForm
   * @param {any} template type which contains template of create/edit module
   * @param {number} id it is optional which contains id if record is in edit mode
   * @param {boolean} isNew it is optional which contains true if it is new record and false when it is old record
   */
  private openExternalChecklisModalForm(
    template: TemplateRef<any>,
    id?: number,
    isNew?: boolean
  ) {
    // this.isNew = false
    if (isNew) {
      // this.isNew = true
      //this.groupId = null
    }
    this.modalRef = this.modalService.show(template, {
      class: "modal-md",
      backdrop: "static",
      keyboard: false,
    });
  }

  /**
   * This method is used to open modal popup for openModalForm
   * @method openModalForm
   * @param {any} template type which contains template of create/edit module
   */
  openExportChecklistModalForm(
    template: TemplateRef<any>,
    exportFileType?: string
  ) {
    this.exportFileType = exportFileType
    this.modalRef = this.modalService.show(template, {
      class: "modal-md",
      backdrop: "static",
      keyboard: false,
    });
  }

  drop(event: CdkDragDrop<string[]>, i) {
    console.log('drag event', event)
    const data = this.mainChecklistArray.filter(
      (r) => r.jobChecklistHeaderId == i
    );
    moveItemInArray(data[0].groups, event.previousIndex, event.currentIndex);
    const newDragArray = this.mainChecklistArray.filter(
      (r) => r.jobChecklistHeaderId == i
    );
    const payload: any = {};
    payload.jobChecklistHeaderId = newDragArray[0].jobChecklistHeaderId;

    payload.groups = newDragArray[0].groups.map(
      ({items, displayOrder1, ...rest}) => ({...rest})
    );
    payload.groups = payload.groups.map((v, index): any => ({
      ...v,
      DisplayOrder1: index + 1,
    }));
    console.log(payload);
    this.loading = true;
    this.jobCheckListServices.setGroupOrder(payload).subscribe(
      (r) => {
        this.loading = false;
        this.getCheckListData();
      },
      (e) => {
        this.loading = false;
      }
    );
    console.log(this.mainChecklistArray);
  }

  dropItems(event: CdkDragDrop<string[]>, i, d) {
    this.loading = true;
    const data = this.mainChecklistArray.filter(
      (r) => r.jobChecklistHeaderId == d
    );
    console.log(data);
    const res = data[0].groups.filter((r) => r.jobChecklistGroupId == i);

    if (this.isHideCompleted) {
      const completedItem = res[0].item.find(item => item.status == 3);

      if (completedItem) {
        // Remove the completed item from the array
        res[0].item = res[0].item.filter(item => item !== completedItem);

        // Create a new object with orderNumber 1
        const newCompletedItem = {...completedItem, orderNumber: 1};

        // Insert the new completed item at the beginning of the array
        res[0].item.unshift(newCompletedItem);
      }
    }
    console.log(res);

    moveItemInArray(res[0].item, event.previousIndex, event.currentIndex);
    const payload: any = {};
    console.log(res[0].item);
    payload.Items = res[0].item.map((v, index) => ({
      jobChecklistItemsDetailsId: v.jocbChecklistItemDetailsId,
      DisplayOrder: index + 1,
      checklistItemName: v.checklistItemName,
    }));
    console.log('payload', payload);
    console.log(this.mainChecklistArray);
    this.jobCheckListServices.setItemsOrder(payload).subscribe(
      (r) => {
        this.loading = false;
        this.getCheckListDataForItems();
      },
      (e) => {
        this.loading = false;
      }
    );
  }

  dropCompositeGroup(event: CdkDragDrop<string[]>, i) {
    const data = this.mainChecklistArray.filter(
      (r) => r.jobChecklistHeaderId == i
    );
    moveItemInArray(data[0].groups, event.previousIndex, event.currentIndex);
    const newDragArray = this.mainChecklistArray.filter(
      (r) => r.jobChecklistHeaderId == i
    );
    const payload: any = {};
    payload.jobChecklistHeaderId = newDragArray[0].jobChecklistHeaderId;

    payload.groups = newDragArray[0].groups.map(
      ({items, displayOrder1, ...rest}) => ({...rest})
    );
    payload.groups = payload.groups.map((v, index): any => ({
      ...v,
      DisplayOrder1: index + 1,
    }));
    console.log(payload);
    this.loading = true;
    this.jobCheckListServices.setGroupOrder(payload).subscribe(
      (r) => {
        this.loading = false;
        this.getCompositeCheckListData();
      },
      (e) => {
        this.loading = false;
      }
    );
    console.log(this.mainChecklistArray);
  }

  dropItemsComposite(event: CdkDragDrop<string[]>, i, d) {
    this.loading = true;
    const data = this.mainChecklistArray.filter(
      (r) => r.jobChecklistHeaderId == d
    );
    console.log(data);
    const res = data[0].groups.filter((r) => r.jobChecklistGroupId == i);
    console.log(res);
    if (this.isHideCompleted) {
      const completedItem = res[0].item.find(item => item.status == 3);

      if (completedItem) {
        // Remove the completed item from the array
        res[0].item = res[0].item.filter(item => item !== completedItem);

        // Create a new object with orderNumber 1
        const newCompletedItem = {...completedItem, orderNumber: 1};

        // Insert the new completed item at the beginning of the array
        res[0].item.unshift(newCompletedItem);
      }
    }
    if (this.isShowTco) {
      const completedItem = res[0].item.find(item => item.isRequiredForTCO == false);

      if (completedItem) {
        // Remove the completed item from the array
        res[0].item = res[0].item.filter(item => item !== completedItem);

        // Create a new object with orderNumber 1
        const newCompletedItem = {...completedItem, orderNumber: 1};

        // Insert the new completed item at the beginning of the array
        res[0].item.unshift(newCompletedItem);
      }
    }

    // res[0].item = this.rearrangeArray(res[0].item);
    moveItemInArray(res[0].item, event.previousIndex, event.currentIndex);
    const payload: any = {};
    console.log(res[0].item);
    payload.Items = res[0].item.map((v, index) => ({
      jobChecklistItemsDetailsId: v.jocbChecklistItemDetailsId,
      DisplayOrder: index + 1,
      checklistItemName: v.checklistItemName,
    }));
    console.log(payload);
    console.log(this.mainChecklistArray);
    this.jobCheckListServices.setItemsOrder(payload).subscribe(
      (r) => {
        this.loading = false;
        this.GetViewDataBaseOnSelection();
      },
      (e) => {
        this.loading = false;
      }
    );
  }

  rearrangeArray(array) {
    const completedObjects = [];
    const pendingObjects = [];

    // Separate completed and pending objects
    for (const object of array) {
      if (object.isRequiredForTCO === false) {
        completedObjects.push(object);
      } else {
        pendingObjects.push(object);
      }
    }

    // Concatenate pending objects followed by completed objects
    const rearrangedArray = [...pendingObjects, ...completedObjects];

    return rearrangedArray;
  }

  selectChecklist(evt) {
    console.log('selectChecklist', evt)
    // if (evt.length > 0) {
    let index = this.selectedPeople.findIndex(el => el == 'all')
    if (evt[index] == 'all') {
      if (this.checkListSwitcherData.length == (this.selectedPeople.length - 1)) {
        this.selectedPeople = []
      } else {
        if (this.checkListSwitcherData.length == this.selectedPeople.length) {
          this.selectedPeople.splice(index, 1)
        } else {
          for (let index = 0; index < this.checkListSwitcherData.length; index++) {
            const element = this.checkListSwitcherData[index];
            this.selectedPeople.push(element.id)
          }
          this.selectedPeople = this.removeDuplicates(this.selectedPeople)
        }
      }
      console.log('selectChecklist 2', this.selectedPeople)
    }
    // if(index == -1) {
    //   if(this.checkListSwitcherData.length == this.selectedPeople.length) {
    //     this.selectedPeople.push('all')
    //   }
    // }
    if (index == -1 && (this.checkListSwitcherData.length == this.selectedPeople.length)) {
      this.selectedPeople = []
    }
    this.setSelectedChecklist(evt.length)
    // this.getAllChecklistData(evt);
    // } 
  }
  removeDuplicates(arr) {
    return Array.from(new Set(arr));
  }

  setSelectedChecklist(length?) {
    let selectedChecklist = localStorage.getItem(this.selectedChecklistKey) == null ? [] : JSON.parse(localStorage.getItem(this.selectedChecklistKey))
    let data = {
      jobId: this.idJob,
      selectedChecklist: this.selectedPeople
    }
    let index = selectedChecklist.findIndex(el => el.jobId == this.idJob)
    if (index == -1) {
      selectedChecklist.push(data)
    } else {
      if (length == 0) {
        selectedChecklist.splice(index, 1)
      } else {
        selectedChecklist[index] = data
      }
    }
    localStorage.setItem(this.selectedChecklistKey, JSON.stringify(selectedChecklist))
  }


  getCheckListData() {
    const ids = this.selectedPeople.toString();
    console.log('ids', ids);
    if (this.isCustomerLoggedIn) {
      this.getAllChecklistData(ids)
    } else {
      this.getAllChecklistDataAll(ids);
    }
  }

  getCompositeCheckListData() {
    this.getAllCompositeChecklistDataView(this.value);
  }

  getCheckListDataForItems() {
    const ids = this.selectedPeople.toString();
    console.log('ids', ids);
    this.getAllChecklistDataAllForItems(ids);
  }

  getGenearteCheckListData() {
    const ids = this.selectedPeople.toString();
    console.log('ids', ids);
    this.afterGenartegetAllChecklistDataAll(ids);
  }

  createChecklist() {
    this.idChecklist = null;
    this.classes = 'w1020'
    if (this.checkListSwitcherData.length === 0) {
      this.isFirstTimeLoading = false
      this.getChecklistSwitcher();
    }
    this.openModalForm(this.formGenerateChecklist);
    // if (this.checklistType == 'General') {
    //   this.openModalForm(this.formGenerateChecklist);
    // } else {
    //   this.openModalForm(this.formGenerateCompositeChecklist);
    // }
  }

  exportChecklistData() {
    this.openModalForm(this.exportChecklist);
  }

  editChecklist(id,) {
    this.idChecklist = id;
    this.classes = 'w1020';
    if (this.checkListSwitcherData.length == 0) {
      this.getChecklistSwitcher()
    }
    this.openModalForm(this.formGenerateChecklist);
  }


  editGeneralFromCompositeChecklist(id) {
    this.idChecklist = id;
    this.classes = 'w1020';
    this.isEditGeneralFromCompositeChecklist = true;
    this.openModalForm(this.formGenerateChecklist);
  }

  editCompositeChecklist() {
    this.idChecklist = this.value;
    this.classes = 'w1020';
    this.isEditGeneralFromCompositeChecklist = false;
    if (this.checkListSwitcherData.length === 0) {
      this.isFirstTimeLoading = false
      this.getChecklistSwitcher();
    }
    this.openModalForm(this.formGenerateChecklist);
  }

  resetCalculations() {
    this.selctOption = "";
  }

  setOpened(itemIndex) {
    this.currentlyOpenedItemIndex = itemIndex;
  }

  setClosed(itemIndex) {
    if (this.currentlyOpenedItemIndex === itemIndex) {
      this.currentlyOpenedItemIndex = -1;
    }
  }

  /**
   * This method update status
   * @method updateStatus
   * @param {string} status Status Value
   * @param {number} id ID of Scope
   * @param {boolean} isMileStone Flag to identify is it milestone or scope
   */
  updateStatus(status: string, id: any) {
    console.log(status);
    console.log(id);
    const payload = {
      Id: id,
      Status: status,
    };

    this.loading = true;
    this.jobCheckListServices.saveChecklistStatus(payload, id).subscribe(
      (r) => {
        this.loading = false;
        this.toastr.success("Status updated successfully");
        this.GetViewDataBaseOnSelection();
      },
      (err) => {
        this.loading = false;
        this.GetViewDataBaseOnSelection();
      }
    );
  }

  updatePlStatus(status: string, id: any) {
    console.log(status);
    console.log(id);
    const payload = {
      IdJobPlumbingInspection: id,
      result: status,
    };

    this.loading = true;
    this.jobCheckListServices.saveChecklistPlStatus(payload).subscribe(
      (r) => {
        this.loading = false;
        this.toastr.success("Status updated successfully");
        this.GetViewDataBaseOnSelection();
      },
      (err) => {
        this.loading = false;
        this.GetViewDataBaseOnSelection();
      }
    );
  }

  updatePartyResponcible(status: string, id: any) {
    console.log(status);
    console.log(id);
    var PartyResponsible1 = '1';
    if (status == 'RPO User') {
      PartyResponsible1 = '1';
    } else if (status == 'Contact') {
      PartyResponsible1 = '2';
    } else {
      PartyResponsible1 = '3';
    }
    const payload = {
      Id: id,
      PartyResponsible: status,
      PartyResponsible1: PartyResponsible1,
    };

    this.loading = true;
    this.jobCheckListServices.savePartyResponcible(payload, id).subscribe(
      (r) => {
        this.loading = false;
        this.toastr.success("record updated successfully");
        this.GetViewDataBaseOnSelection();
      },
      (err) => {
        this.loading = false;
        this.GetViewDataBaseOnSelection();
      }
    );
  }

  GetViewDataBaseOnSelection() {
    if (this.checklistType == "General") {
      this.getCheckListData();
    } else {
      this.getCompositeCheckListData();
    }
  }

  onEnter(e, id, groupId) {
    console.log(e.target.value);
    const payload = {
      Id: id,
      PartyResponsible1: 3,
      ManualPartyResponsible: e.target.value,
      IdJobChecklistGroup: groupId
    };
    this.loading = true;
    this.jobCheckListServices.textSave(payload, id).subscribe(
      (r) => {
        this.loading = false;
        this.toastr.success("record updated successfully");
        this.GetViewDataBaseOnSelection();
      },
      (err) => {
        this.loading = false;
        this.GetViewDataBaseOnSelection();
      }
    );
  }

  changeContact(e, id) {
    console.log(e);
    const payload = {
      Id: id,
      PartyResponsible1: 2,
      IdContact: e ? e.value : null,
    };

    this.loading = true;
    this.jobCheckListServices.changeContact(payload, id).subscribe(
      (r) => {
        this.loading = false;
        this.toastr.success("record updated successfully");
        this.GetViewDataBaseOnSelection();
      },
      (err) => {
        this.loading = false;
        this.GetViewDataBaseOnSelection();
      }
    );
  }

  changeApplicant(e, id) {
    console.log(e);
    const payload = {
      Id: id,
      IdDesignApplicant: e ? e.value : null,
    };

    this.loading = true;
    this.jobCheckListServices.saveApplicant(payload, id).subscribe(
      (r) => {
        this.loading = false;
        this.toastr.success("record updated successfully");
        this.GetViewDataBaseOnSelection();
      },
      (err) => {
        this.loading = false;
        this.GetViewDataBaseOnSelection();
      }
    );
  }

  changeInspector(e, id) {
    console.log(e);
    console.log(id);
    const payload = {
      Id: id,
      IdInspector: e ? e.value : null,
    };

    this.loading = true;
    this.jobCheckListServices.saveInspector(payload, id).subscribe(
      (r) => {
        this.loading = false;
        this.toastr.success("record updated successfully");
        this.GetViewDataBaseOnSelection();
      },
      (err) => {
        this.loading = false;
        this.GetViewDataBaseOnSelection();
      }
    );
  }

  changeStage(e, id) {
    console.log(e);
    const payload = {
      Id: id,
      Stage: e,
    };

    this.loading = true;
    this.jobCheckListServices.changeStage(payload, id).subscribe(
      (r) => {
        this.loading = false;
        this.toastr.success("record updated successfully");
        this.GetViewDataBaseOnSelection();
      },
      (err) => {
        this.loading = false;
        this.GetViewDataBaseOnSelection();
      }
    );
  }

  getDate(date, id) {
    console.log(date);
    if (date) {
      const payload = {
        IdJobChecklistItemDetail: id,
        DueDate: date,
      };
      console.log(payload);
      this.loading = true;
      this.jobCheckListServices.saveChecklistDueDate(payload).subscribe(
        (r) => {
          console.log(r);
          this.toastr.success("Date updated successfully");
          this.GetViewDataBaseOnSelection();
          this.loading = false;
        },
        (err) => {
          this.loading = false;
          this.GetViewDataBaseOnSelection();
        }
      );
    } else {
      this.GetViewDataBaseOnSelection();
    }
  }

  redirectWorkorder() {
    window.open(
      "https://a810-lmpaca.nyc.gov/CitizenAccessBuildings/",
      "_blank"
    );
  }

  inputFilter(e) {
    console.log('e', e)
    this.dateEvent = e;
  }

  onKeyPress(params: any) {
    if (params.key === 'Backspace') {
      return false;
    } else {
      return false;
    }
  }

  chnageDateforPl(date, id) {
    if (date) {
      const payload = {
        IdJobPlumbingInspection: this.selectedDateId,
        DueDate: date,
      };
      console.log(payload);
      this.loading = true;
      this.jobCheckListServices.saveChecklistDueDatePl(payload).subscribe(
        (r) => {
          console.log(r);
          this.toastr.success("Date updated successfully");
          this.GetViewDataBaseOnSelection();
          this.loading = false;
        },
        (err) => {
          this.loading = false;
          this.GetViewDataBaseOnSelection();
        }
      );
    } else {
      this.getCheckListData();
    }
  }

  saveWorkorder() {
    this.loading = true;
    const payload = {
      IdJobPlumbingInspection: this.workOrderData.IdJobPlumbingInspection,
      WorkOrder: this.workOrderData.number,
    };
    this.jobCheckListServices.saveWorkOrder(payload).subscribe(
      (r) => {
        console.log(r);
        this.loading = false;
        this.toastr.success("Record Updated successfully");
        this.workOrderData = {};
        this.modalRef.hide();
        this.GetViewDataBaseOnSelection();
      },
      (e) => {
        this.loading = false;
      }
    );
  }

  closeWorkOrderForm() {
    this.modalRef.hide();
    this.workOrderData = {};
  }

  onDelete(id) {
    this.appComponent.showDeleteConfirmation(this.delete, [
      id,
      " ",
      " ",
      " ",
      " ",
    ]);
  }

  /**
   * This method is used to delete record
   * @method delete
   */
  delete() {
    this.loading = true;
    this.jobCheckListServices.delete(this.deleteChecklistItemId).subscribe(
      (r) => {
        this.toastr.success("Record deleted successfully");
        this.GetViewDataBaseOnSelection();
        this.modalRef.hide();
        this.loading = false;
      },
      (e) => {
        this.loading = false;
      }
    );
  }

  deletePlItem() {
    this.loading = true;
    this.jobCheckListServices
      .deletePlItem(this.IdJobPlumbingInspection)
      .subscribe(
        (r) => {
          this.toastr.success("Record deleted successfully");
          this.GetViewDataBaseOnSelection();
          this.modalRef.hide();
          this.loading = false;
        },
        (e) => {
          this.loading = false;
        }
      );
  }

  /**
   * This method is used to delete existing milestone record in array/object
   * @method deleteMilestone
   * @param  {any} item item request Object
   * @param {number} milestoneId id of milestone
   * @param {number} index index of milestone which should be updated
   */
  deleteChecklist(template: TemplateRef<any>, id?: any) {
    this.deleteChecklistId = id;
    this.modalRef = this.modalService.show(template, {
      class: "modal-sm",
      backdrop: "static",
      keyboard: false,
    });
  }

  /**
   * This method is used to delete existing milestone record in array/object
   * @method deleteMilestone
   * @param  {any} item item request Object
   * @param {number} milestoneId id of milestone
   * @param {number} index index of milestone which should be updated
   */
  deleteChecklistItem(template: TemplateRef<any>, id: any, status: string) {
    this.deleteChecklistItemId = id;
    this.deleteChecklistItemStatus = status
    this.modalRef = this.modalService.show(template, {
      class: "modal-sm",
      backdrop: "static",
      keyboard: false,
    });
  }

  deleteChecklistItemPL(template: TemplateRef<any>, id: any, status: string) {
    this.IdJobPlumbingInspection = id;
    this.deleteChecklistItemStatus = status
    this.modalRef = this.modalService.show(template, {
      class: "modal-sm",
      backdrop: "static",
      keyboard: false,
    });
  }

  deleteVoilationPopup(template: TemplateRef<any>, id: any) {
    this.idViolation = id;
    this.modalRef = this.modalService.show(template, {
      class: "modal-sm",
      backdrop: "static",
      keyboard: false,
    });
  }

  deleteSlectedCheklist() {
    this.loading = true;
    this.jobCheckListServices.deleteChecklist(this.deleteChecklistId).subscribe(
      (r) => {
        console.log('run', r)
        this.loading = false;
        this.toastr.success("Record Deleted Successfully!");
        this.modalRef.hide();
        this.isFirstTimeLoading = true
        this.getChecklistSwitcher(true);
      },
      (e) => {
        console.log(e)
        this.loading = false;
      }
    );
  }

  deleteSlectedCompositeCheklist() {
    this.loading = true;
    this.jobCheckListServices
      .deleteCompositeChecklist(this.value)
      .subscribe(
        (r) => {
          this.loading = false;
          this.getCompositeChecklistSwitcher(true, true)
          this.toastr.success("Record Deleted successfully");
          this.modalRef.hide();
        },
        (e) => {
          this.loading = false;
        }
      );
  }

  /**
   * This method is used to delete existing milestone record in array/object
   * @method openReference
   * @param {number} milestoneId id of milestone
   */
  openReference(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-sm",
      backdrop: "static",
      keyboard: false,
    });
  }

  openOuth(summonsNumber) {
    window.open("http://a820-ecbticketfinder.nyc.gov/getViolationbyID.action?searchViolationObject.violationNo=0" + summonsNumber + "&searchViolationObject.searchOptions=All&submit=Search&searchViolationObject.searchType=violationNumber", '_blank');
  }

  openBis(data, violationType) {
    if (violationType === "AOTH Violation") {
      window.open(`https://a810-bisweb.nyc.gov/bisweb/ECBQueryByNumberServlet?requestid=2&ecbin=${data.summonsNumber}`, '_blank');
    } else {
      window.open(`https://a810-bisweb.nyc.gov/bisweb/ActionViolationDisplayServlet?requestid=5&allbin=${data.binNumber}&allinquirytype=BXS3OCV4&allboroughname=&allstrt=&allnumbhous=&allisn=${data.isnViolation}&ppremise60=${data.summonsNumber}`, '_blank');
    }
  }

  toggleCompleted() {
    this.isHideCompleted = !this.isHideCompleted
  }

  toggleTco() {
    this.isShowTco = !this.isShowTco
  }

  /**
   * This method will be destroy all elements and other values from whole module
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    this.isChecklistTypeDropdownOpen = false
  }

  onChecklistTypeApply() {
    // localStorage.setItem(this.selectedChecklistTypeKey, this.checklistTypeForModal);
    this.setChecklistType(this.checklistTypeForModal)
    if (this.checklistTypeForModal == 'General') {
      if (this.selectedPeople.length > 0) {
        this.getAllChecklistData(this.selectedPeople);
      }
    } else if (this.checklistTypeForModal == 'Composite') {
      this.getAllCompositeChecklistData(this.value);
    }
    this.isChecklistTypeDropdownOpen = false
  }

  cancelChecklistType() {
    this.isChecklistTypeDropdownOpen = false
    // this.ngOnInit()
  }

  onChecklistType() {
    this.isChecklistTypeDropdownOpen = true
  }

  setExpandedInListing() {
    let key = this.checklistType == 'General' ? 'parentExpandedList' : 'compositeParentExpandedList'
    let expandedApplcations: any = JSON.parse(localStorage.getItem(key)) || []
    let tempChecklist = []
    if (expandedApplcations.length > 0) {
      let checklistIds = this.mainChecklistArray.map(v => v.jobChecklistHeaderId)
      for (let index = 0; index < expandedApplcations.length; index++) {
        const expandedApplcation = expandedApplcations[index];
        console.log(checklistIds.includes(expandedApplcation.jobChecklistHeaderId))
        if (checklistIds.includes(expandedApplcation.jobChecklistHeaderId)) {
          tempChecklist.push(expandedApplcation)
        }
      }
      localStorage.setItem(key, JSON.stringify(tempChecklist))
    }
    expandedApplcations = JSON.parse(localStorage.getItem(key)) || []
    let tempMainChecklistArray = this.mainChecklistArray
    if (expandedApplcations.length > 0) {
      tempMainChecklistArray.forEach((application, i) => {
        let index = expandedApplcations.findIndex(el => el.jobChecklistHeaderId == application.jobChecklistHeaderId)
        if (index != -1) {
          application.isExpanded = true
        } else {
          application.isExpanded = false
        }
        tempMainChecklistArray[i]?.groups.forEach((group, ii) => {
          group.isExpanded = expandedApplcations[index]?.groups[ii]?.isExpanded ? true : false
          if (group.checkListGroupType == 'PL') {
            tempMainChecklistArray[i]?.groups[ii].item.forEach((item, iii) => {
              item.isExpanded = expandedApplcations[index]?.groups[ii]?.item[iii]?.isExpanded ? true : false
            })
          }
        })
      })
      this.mainChecklistArray = tempMainChecklistArray
    }
    if (this.checklistType == 'General') {
      if (!this.checkListSwitcherData[0]?.id) {
        this.getChecklistSwitcher()
        return
      }
      const index = this.mainChecklistArray.findIndex(obj => obj.jobChecklistHeaderId === this.checkListSwitcherData[0].id);
      if (index !== -1) {
        const obj = this.mainChecklistArray.splice(index, 1)[0];
        this.mainChecklistArray.unshift(obj);
      }
    }
  }

  isAllInspectionsCompleted(item) {
    let result = true
    for (let index = 0; index < item.details.length; index++) {
      const element = item.details[index];
      if (element.result != '1') {
        result = false
      }
    }
    return result
  }

  setInspectionStatus() {
    for (let index = 0; index < this.mainChecklistArray.length; index++) {
      const application = this.mainChecklistArray[index];
      for (let index2 = 0; index2 < application.groups.length; index2++) {
        const group = application.groups[index2];
        if (group.checkListGroupType == 'PL') {
          for (let index3 = 0; index3 < group.item.length; index3++) {
            const item = group.item[index3];
            this.mainChecklistArray[index].groups[index2].item[index3].status = this.isAllInspectionsCompleted(item)
          }
        }
      }
    }
  }

  unlinkChecklist(jobChecklistHeaderId) {
    this.loading = true
    console.log('this.value', this.value)
    let id = this.value[0] + '/' + jobChecklistHeaderId
    console.log(id)
    this.jobCheckListServices.unlinkChecklist(id).subscribe(r => {
      this.toastr.success("Unlink Successful!")
      this.GetViewDataBaseOnSelection();
      this.loading = false
    }, e => {
      this.toastr.error(e)
      this.loading = false
    })
  }

  redirectExternalWebsite(link) {
    const uselink = (link.indexOf('://') === -1) ? 'https://' + link : link;
    window.open(uselink, '_blank');
  }

  setLastCompositeChecklist(jobId, selectedChecklistId) {
    let data = JSON.parse(localStorage.getItem(this.lastSelectedCompositeChecklistKey)) || []
    let tempData = {
      jobId: jobId,
      selectedChecklist: selectedChecklistId
    }
    if (data.length == 0) {
      data.push(tempData)
    } else {
      let index = data.findIndex(el => el.jobId == jobId)
      if (index == -1) {
        data.push(tempData)
      } else {
        data[index]['selectedChecklist'] = selectedChecklistId
      }
    }
    localStorage.setItem(this.lastSelectedCompositeChecklistKey, JSON.stringify(data))
  }

  setChecklistType(checklistType) {
    let data = JSON.parse(localStorage.getItem(this.selectedChecklistTypeKey)) || []
    let tempData = {
      jobId: this.idJob,
      selectedChecklistType: checklistType
    }
    if (data.length == 0) {
      data.push(tempData)
    } else {
      let index = data.findIndex(el => el.jobId == this.idJob)
      if (index == -1) {
        data.push(tempData)
      } else {
        data[index]['selectedChecklistType'] = checklistType
      }
    }
    localStorage.setItem(this.selectedChecklistTypeKey, JSON.stringify(data))
  }

  delinkViolation() {
    this.loading = true
    this.jobCheckListServices.delinkViolation(this.value[0], this.idViolation).subscribe(r => {
      this.toastr.success("Deleted Successful!")
      this.loading = false
      this.modalRef.hide();
      this.getVoilationList();
    }, e => {
      this.toastr.error(e)
      this.loading = false
    })
  }

  public openDobViolationViewModal(template: TemplateRef<any>, violationId) {
    if (this.isCustomerLoggedIn) {
      return
    }
    this.idViolation = violationId
    this.modalRef = this.modalService.show(template, {class: 'modal-add-task', backdrop: 'static', 'keyboard': false})
  }

  public viewViolationDetails(template: TemplateRef<any>, violationId) {
    if (this.isCustomerLoggedIn) {
      return
    }
    this.idViolation = violationId
    this.modalRef = this.modalService.show(template, {class: 'modal-add-task', backdrop: 'static', 'keyboard': false})
  }

  onSortEcb(column: any) {
    if (column === this.ecbViolationColumn) {
      this.isEcbAscending = !this.isEcbAscending;
    } else {
      this.ecbViolationColumn = column;
      this.isEcbAscending = true;
    }

    this.VoilationlistArray.sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];
      return (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * (this.isEcbAscending ? 1 : -1);
    });
  }

  onSortDob(column: any) {
    if (column === this.dobViolationColumn) {
      this.isDobAscending = !this.isDobAscending;
    } else {
      this.dobViolationColumn = column;
      this.isDobAscending = true;
    }

    this.VoilationDoblistArray.sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];
      return (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * (this.isDobAscending ? 1 : -1);
    });
  }

  onSortDobSafety(column: any) {
    if (column === this.dobSafetyViolationColumn) {
      this.isDobSafetyAscending = !this.isDobSafetyAscending;
    } else {
      this.dobSafetyViolationColumn = column;
      this.isDobSafetyAscending = true;
    }

    this.VoilationDobSafetyListArray.sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];
      return (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * (this.isDobSafetyAscending ? 1 : -1);
    });
  }

  addClientNote(template: TemplateRef<any>, itemId, type?) {
    this.itemIdForClientNote = itemId
    if (type == 'PL') {
      this.isPl = true
    } else {
      this.isPl = false
    }
    this.modalRef = this.modalService.show(template, {class: 'modal-add-task', backdrop: 'static', 'keyboard': false})
  }

  async updateHeaderInfo(details, event) {
    try {
      console.log('event.key', event)
      if (event.key === 'Tab') {
        event.preventDefault();
        return
        // You can add additional logic here if needed
      }
      if (this.isCustomerLoggedIn) {
        return
      }
      if (details?.others === event.target.value) {
        return
      }
      this.loading = true;
      let data = {
        headerId: details.jobChecklistHeaderId,
        Others: event.target.value
      }
      console.log('Enter key pressed!', event.target.value);
      const res = await this.jobCheckListServices.infoDataUpdate(details.jobChecklistHeaderId, data)
      this.loading = false;
      this.toastr.success("Information Updated")
      console.log(res)
    } catch (err) {
      this.toastr.error(err)
      this.loading = false;
      console.log(err)
    }
  }

  hasActive(text: string): boolean {
    return text.toLowerCase().includes('active');
  }

  hasDismissedOrResolved(text: string): boolean {
    if(!text) {
      return false
    }
    const lowercasedText = text.toLowerCase();
    return lowercasedText.includes('dismissed') || lowercasedText.includes('resolved');
  }

  checkGreyedOutInEcb(certificationStatus) {
    if (!certificationStatus) {
      return false
    }
    let greyedOutData = [
      "N/A - DISMISSED",
      "CERTIFICATE ACCEPTED",
      "CURE ACCEPTED",
      "COMPLIANCE INSP/DOC",
    ];
    let index = greyedOutData.findIndex(el => el.toLocaleLowerCase() == certificationStatus.toLocaleLowerCase());
    if (index != -1) {
      return true
    } else {
      return false
    }
  }


  @ViewChild('select') select: MatSelect;
  allSelected = false;
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' }
  ];
  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
    console.log('this.selectedPeople', this.selectedPeople)
    this.setSelectedChecklist(this.selectedPeople)
  }
  optionClick() {
    let newStatus = true;
    this.select.options.forEach((item: MatOption) => {
      if (!item.selected) {
        newStatus = false;
      }
    });
    this.allSelected = newStatus;
    console.log('this.selectedPeople', this.selectedPeople)
    this.setSelectedChecklist(this.selectedPeople)
  }

  deleteMultipleSelectedItems(template: TemplateRef<any>, group) {
    this.selectedGroup = group;
    console.log('this.selectedGroup', this.selectedGroup)
    const isPl = this.selectedGroup?.details?.length > 0 ? (this.selectedGroup['details'][0].checklistGroupType == 'PL') : false;
    let selectedItems = []
    if (isPl) {
      selectedItems = this.selectedGroup['details'].filter(el => el.isChecked == true)
    } else {
      selectedItems = this.selectedGroup['item'].filter(el => el.isChecked == true)
    }
    if (selectedItems.length == 0) {
      this.toastr.warning("Please select items");
      return
    }
    this.modalRef = this.modalService.show(template, {
      class: "modal-sm",
      backdrop: "static",
      keyboard: false,
    });
  }

  async deleteSelectedItems() {
    this.loading = true;
    try {
      const isPl = this.selectedGroup?.details?.length > 0 ? (this.selectedGroup['details'][0].checklistGroupType == 'PL') : false;
      let selectedItems = []
      if (isPl) {
        selectedItems = this.selectedGroup['details'].filter(el => el.isChecked == true)
        const ids = selectedItems.map(obj => obj.idJobPlumbingInspection);
        const idString = ids.join(',');
        await this.jobCheckListServices.deleteMultiplePlItems(idString).toPromise()
      } else {
        selectedItems = this.selectedGroup['item'].filter(el => el.isChecked == true)
        const ids = selectedItems.map(obj => obj.jocbChecklistItemDetailsId);
        const idString = ids.join(',');
        await this.jobCheckListServices.deleteMultipleItems(idString).toPromise()
      }
      this.toastr.success("Selected items deleted successfully");
      this.modalRef.hide();
      this.GetViewDataBaseOnSelection()
    } catch (err) {
      this.toastr.error(err);
    }
    this.loading = false;
  }

}
