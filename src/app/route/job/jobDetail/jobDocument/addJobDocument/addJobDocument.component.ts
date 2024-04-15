import { Component, Input, OnDestroy, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { RelatedJob } from '../../../../../types/relatedJob';
import { FieldValue, ModelTosent } from '../../../../../types/document';
import { JobApplicationService } from '../../../../../services/JobApplicationService.services';
import { JobDocumentServices } from '../jobDocument.service';
import * as _ from 'underscore';
import { Message } from '../../../../../app.messages';
import { DomSanitizer } from "@angular/platform-browser";
import { constantValues, SharedService } from '../../../../../app.constantValues';
import { PW517Doc } from '../pullpermit';

var moments = require('moment-business-days');


require('moment-weekday-calc');
declare const $: any

import * as moment from 'moment';

enum ControlType {
  Label = 0,
  Text = 1,
  TextArea = 2,
  DropDown = 3,
  Radio = 4,
  Grid = 5,
  MultiselectDropdown = 6, // Listbox
  CheckBox = 7,
  DatePicker = 8,
  FileType = 9
}

enum FieldDataType {
  Integer = 1,
  String = 2,
  DateTime = 3
}

@Component({
  selector: '[add-job-document]',
  templateUrl: './addJobDocument.component.html'
})
export class AddJobDocumentComponent {
  @Output() reload: EventEmitter<any> = new EventEmitter<any>();
  @Input() modalRef: BsModalRef
  @Input() idJob: number
  @Input() DocumentId: number
  @Input() DocumentObj: any
  @Input() isChecklist: any
  @Input() isClone: boolean
  private ControlTypes = ControlType;
  private FieldDataTypes = FieldDataType;
  ListOfDocuments: any[] = []
  ListOfFields: any[] = []
  private ListOfFieldsTosent: ModelTosent
  loading: boolean = false
  maxRecords: boolean = false
  errorMsg: any
  showFieldValues: boolean = false
  noSiaNumber: boolean = false
  private dropdownSettings: any = {};
  private application: any = {};
  private ListOfMultiSelect: any
  private itemsToshow: any[] = []
  selectedDocument: any
  private stringFields = ["10 Day Notice", "Salutation"];
  files: File[] = []
  dragAreaClass: string = 'dragarea';
  hydrantCost: any;
  waterCost: any;
  documents: any[] = [];

  private mondayArray: any[] = [];
  private HolidayList: any[] = [];
  private tuesdayArray: any[] = [];
  private wensdayArray: any[] = [];
  private thursdayArray: any[] = [];
  private fridayArray: any[] = [];
  private saturdayArray: any[] = [];
  private sundayArray: any[] = [];
  AllSelectedDays: any[] = [];
  private isDateExeed14Days: boolean = false;


  pwDoc: PW517Doc;
  pw517ApplicationList: any = [];
  pw517VarianceList: any = [];
  pw517ApplicantList: any = [];
  pw517FillingTypeList: any = [];

  private FinalArray: any[] = [];
  weekShowArray: any[] = [
    "sun",
    "mon",
    "tue",
    "wed",
    "thr",
    "fri",
    "sat"
  ];
  onCalender: any;
  private showCalender: boolean = false;
  private selectedCalenderView: any[] = [];
  private parentValues: any = []
  requireAHVRefForPW517: boolean = false
  workPermitForPW517App: any = []
  dropdownSettingsFields = {
    singleSelection: false,
    text: "select",
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableSearchFilter: true,
    enableCheckAll: true,
    classes: "myclass custom-class",
    badgeShowLimit: 1,
    tagToBody: false

  };

  @HostListener('dragover', ['$event']) onDragOver(event: any) {
    this.dragAreaClass = "droparea";
    event.preventDefault();
  }

  constructor(
    private toastr: ToastrService,
    private message: Message,
    private jobDocumentServices: JobDocumentServices,
    private jobApplicationService: JobApplicationService,
    private sanitizer: DomSanitizer,
    public constantValues: constantValues,
  ) {
    this.errorMsg = this.message.msg;
  }

  ngOnInit() {
    if (this.DocumentId) {
      this.selectedDocument = this.DocumentObj.idDocument
    }
    console.log(this.isChecklist);
    if (this.isChecklist) {
      this.getDocumentId();
    }
    this.loading = true
    this.ListOfFieldsTosent = {
      id: (this.DocumentId == null ? 0 : this.isClone == true ? 0 : this.DocumentId),
      idJob: this.idJob,
      idDocument: (this.DocumentId == null ? null : this.DocumentObj.idDocument),
      documentName: (this.DocumentId == null ? '' : this.DocumentObj.documentName),
      jobDocumentFields: [],
    } as ModelTosent;
    if (this.DocumentId && this.DocumentId != null) {
      this.getTheEditDocument()
    }
    this.getDocumentList();


    /**
     * PW517 Code Start
     */
    this.pwDoc = {} as PW517Doc;
    $(document).off('click', '.CalenderClass')
    $(document).on("click", ".CalenderClass", (eve: any) => {
      if (!$(eve)[0].target.classList.contains("dateSelected")) {
        $(eve).css("background-color", "##00B1D4 !important");
        $(eve)[0].target.classList.add("dateSelected");
        this.selectedCalenderView.push($(eve)[0].target.id);
        this.setPWDates($(eve)[0].target.id, 'select');
      } else {
        $(eve)[0].target.classList.remove("dateSelected");

        this.selectedCalenderView.splice(
          this.selectedCalenderView.indexOf($(eve)[0].target.id), 1
        );
        this.setPWDates($(eve)[0].target.id, 'deselect');
      }
    });
    /**
     * PW517 Code End
     */
  }


  /**
   * This method is used to get the list of the documents
   * @method documentsList
   */
  getDocumentList() {
    this.jobDocumentServices.getDocumentsList().subscribe(resOfDocuments => {
      if (!this.DocumentId) {
        this.ListOfFieldsTosent.documentName = resOfDocuments.documentName
      } else {
        this.selectedDocument = this.DocumentObj.idDocument
      }
      this.ListOfDocuments = resOfDocuments
      this.loading = false
    }, e => {
      this.loading = false
    })
  }


  getDocumentId() {
    this.jobDocumentServices.getChecklistDocId(this.isChecklist).subscribe(r => {
      if (r) {
        this.selectedDocument = r[0].idCreateFormDocument;
        this.getDocumentFields(this.selectedDocument);
      }

    })
  }

  /**
   * This method is used to Dependency value of the dropdowns
   * @method Dropdownvalues
   * @param {any} FieldObj FieldObj is the element to be search
   * @param {any} field field is the value to be search
   */
  getTheRelatedMutiDropDown(FieldObj: any, field: any, fieldName?: any) {

    if ((this.selectedDocument == 102 && FieldObj.displayFieldName == 'Application') || (this.selectedDocument == 204 && FieldObj.displayFieldName == 'Application')) {
      this.getParentJobDocForBINTAK(FieldObj, true);
    }
    if (this.selectedDocument == 10 && FieldObj.displayFieldName == 'Application') {
      this.ListOfFields.forEach((element: any, key: number) => {
        let workPermit = this.ListOfFields.filter((x: any) => x.displayFieldName == 'WorkPermit')[0];
        workPermit.value = null;
      });
    }
    if (this.selectedDocument == 111 && FieldObj.displayFieldName == 'Type' && FieldObj.value == '6122') {
      this.ListOfFields.forEach((element: any, key: number) => {
        let apllicant308 = this.ListOfFields.filter((x: any) => x.displayFieldName == 'Applicant')[0];
        apllicant308.isRequired = false;
      });
    } else if (this.selectedDocument == 111 && FieldObj.displayFieldName == 'Type' && (FieldObj.value != '6122' || FieldObj.value == null)) {
      this.ListOfFields.forEach((element: any, key: number) => {
        let apllicant308 = this.ListOfFields.filter((x: any) => x.displayFieldName == 'Applicant')[0];
        apllicant308.isRequired = true;
      });
    }
    if ((this.selectedDocument == 129 || this.selectedDocument == 130) && FieldObj.displayFieldName == "Applicant" && field != null) {
      let applicant = fieldName.filter((x: any) => x.id == field)[0].siaNumber;
      if (applicant == '') {
        if (this.selectedDocument == 130) {
          let selectedType = this.ListOfFields.filter((x: any) => x.displayFieldName == 'Type')[0];
          let typename = selectedType.dropDownValue.filter((x: any) => x.id == selectedType.value)[0];
          if (typename.itemName == 'Design Applicant Initial Identification' || typename.itemName == 'Design Applicant Reidentification') {
            this.noSiaNumber = false;
          } else {
            this.noSiaNumber = true;
          }
        } else if (this.selectedDocument == 129) {
          this.noSiaNumber = true;
        }

      } else {
        this.noSiaNumber = false;
      }
    }
    if (this.selectedDocument == 130 && FieldObj.displayFieldName == "Type" && field != null) {
      let typename = FieldObj.dropDownValue.filter((x: any) => x.id == FieldObj.value)[0];
      if (typename.itemName == 'Design Applicant Initial Identification' || typename.itemName == 'Design Applicant Reidentification') {
        this.noSiaNumber = false;
      } else {
        let selectedType = this.ListOfFields.filter((x: any) => x.displayFieldName == 'Applicant')[0];
        if (selectedType.value) {
          let typename = selectedType.dropDownValue.filter((x: any) => x.id == selectedType.value)[0];
          if (typename.siaNumber == '') {
            this.noSiaNumber = true;
          } else {
            this.noSiaNumber = false;
          }

        }
      }
    }
    this.ListOfFields.forEach((element: any, key: number) => {
      if (FieldObj.fieldName == 'Type' && element.fieldName == 'Application Type' && FieldObj.value == '3' && this.selectedDocument != 27) {
        element.isRequired = true;
      } else if (FieldObj.fieldName == 'Type' && element.fieldName == 'Application Type' && FieldObj.value != '3' && this.selectedDocument != 27) {
        element.isRequired = false;
      }
      // Show Hide Field Start
      if (element.idParentField && element.staticDescription && element.idParentField == FieldObj.id) {
        let descArray = element.staticDescription.split(',')
        if (descArray && descArray.length > 0) {
          if (descArray.indexOf(FieldObj.value) != -1) {
            element.showField = true;
            element.isRequired = element.isRequired;
            if (this.selectedDocument == 110 && FieldObj.displayFieldName == 'Consrtruction supt./Site Safety Mgr./Site Safety Coordinator') {
              let dropdownname = fieldName.filter((x: any) => x.id == field)[0];
              element.value = null;
              element.displayFieldName = dropdownname.itemName;
              if (field == 6130) {
                element.showField = false
                element.isRequired = false
                element.value = null;
              } else {
                element.showField = true
                element.field.isDisplayInFrontend = true
                element.isRequired = element.isRequired
              }
            }
          } else {
            element.value = null;
            element.showField = false
            element.isRequired = false
          }
        } else {
          element.showField = true
        }
      } else {
        // element.showField = false
      }
      // Show Hide Field End
      if ((element.controlType == 3 || element.controlType == 6) && element.apiUrl != null && element.field.isDisplayInFrontend && (element.id != FieldObj.id) && (element.idParentField == FieldObj.id)) {
        if (element.controlType == 6) {
          element.value = []
        }
        this.DependencyEdit(element, field).subscribe(resOfDrop => {
          if (field == null && element.displayFieldName == 'WorkPermit') {
            element.dropDownValue = []
          } else if (field == null && element.displayFieldName == 'Work Type(s)') {
            element.dropDownValue = []
          } else if (field == null && element.displayFieldName == 'Job Document Work Type(s)') {
            element.dropDownValue = []
          } else {
            element.dropDownValue = resOfDrop
          }

        })
      }
      // for field value fill
      if ((element.controlType == 14) && element.apiUrl != null && element.field.isDisplayInFrontend && (element.id != FieldObj.id) && (element.idParentField == FieldObj.id)) {
        element.value = '';
        this.DependencyEdit(element, field).subscribe(textBoxValue => {
          element.value = textBoxValue
        })
      }
    });
  }

  /**
   * This method is used to fileds of currently selected Doc(on creating)
   * @method GetFields
   * @param {any} idOfDoc idOfDoc is the id of the document
   */
  getParentJobDocForBINTAK(fieldValues: any, edit?: boolean) {
    let url = `api/jobdocumentdrodown/BINTAKdocumentTypeNyApplication/${this.idJob}/102/0/${fieldValues.value}`
    let ddVals = this.ListOfFields.filter((x: any) => x.field.displayFieldName == 'Parent Job Document')[0];
    ddVals.dropDownValue = [];
    if (edit) {
      ddVals.value = null;
    }
    this.jobDocumentServices.getDropdownValues(url).subscribe(resOfDrop => {
      ddVals.dropDownValue = resOfDrop;
    });
  }

  /**
   * This method is used to fileds of currently selected Doc(on creating)
   * @method GetFields
   * @param {any} idOfDoc idOfDoc is the id of the document
   */
  getDocumentFields(idOfDoc: number) {
    if (idOfDoc != null) {
      this.loading = true;
      if (idOfDoc == 29 || idOfDoc == 188) {
        this.jobApplicationService.getHolidayList().subscribe(list => {
          if (list.length > 0) {
            this.HolidayList = list.map((unq: any) => {
              return moment(unq.holidayDate).format("MM/DD/YYYY")
            })
            this.loading = false
          }
        }, e => {
          this.loading = false
        })
        this.jobApplicationService.getDepCostValues().subscribe(Cost => {
          this.hydrantCost = Cost.filter((val: any) => {
            return val.itemName == 'Hydrant Permit'
          })[0]
          this.waterCost = Cost.filter((val: any) => {
            return val.itemName == 'Hydrant Water Use'
          })[0]
          this.loading = false
        }, e => {
          this.loading = false
        })

      }


      if (idOfDoc == this.constantValues.PW517DOCUMENTID) {
        // For PW517
        this.jobDocumentServices.getTheFieldsOfDocument(idOfDoc).subscribe(docDetail => {
          this.pwDoc.idDocument = idOfDoc
          this.pwDoc.documentName = docDetail[0].documentName
          this.pwDoc.code = docDetail[0].code
        })
        this.getPW517ApplicationData()
        this.getPW517VarianceData()
        this.getPW517ApplicantData()
        this.getPW517FillingTypeData()
        this.loading = false
      } else {
        this.jobDocumentServices.getTheFieldsOfDocument(idOfDoc).subscribe(resOfDocumentFields => {
          this.ListOfFieldsTosent.idDocument = idOfDoc;
          this.ListOfFieldsTosent.documentName = resOfDocumentFields[0].documentName;
          this.ListOfFields = [];
          resOfDocumentFields = resOfDocumentFields.filter((x: any) => x.field.isDisplayInFrontend == true);
          resOfDocumentFields.forEach((element: any, key: string) => {
            // Show Hide Field Start

            if ((this.selectedDocument == 126 && element.controlType == 1) || (this.selectedDocument == 27 && element.controlType == 1)) {
              element.pattern = "^[0-9]*$"
            }
            if (element.idParentField && element.staticDescription && this.selectedDocument != 29 && this.selectedDocument != 188 && this.selectedDocument != 127) {

              element.showField = false
              element.isRequired = element.isRequired ? element.isRequired : false;
            } else {
              element.isRequired = element.isRequired ? element.isRequired : false;
              element.showField = true
            }
            // Show Hide Field End
            if (element.controlType == 3 && element.apiUrl != null) {
              this.DependencyEdit(element, 0).subscribe(resOfDrop => {
                element.dropDownValue = resOfDrop
              })
            }
            if (element.controlType == 6 && element.apiUrl != null) {
              element.dropDownValue = []
              element.dropdownSettingsFields = {
                singleSelection: false,
                text: "select",
                selectAllText: 'Select All',
                unSelectAllText: 'UnSelect All',
                enableSearchFilter: true,
                enableCheckAll: true,
                classes: "myclass custom-class",
                limitSelection: element.length,
                badgeShowLimit: 1,
              };
              this.DependencyEdit(element, 0).subscribe(resOfDrop => {
                element.dropDownValue = resOfDrop
              })
            }
            if (element.controlType == 1 && element.displayFieldName.toLowerCase() == 'violation #') {
              element.wordLength = 9
            } else {
              element.wordLength = null
            }
            // Not to Show Wotk Types Dropdown values by default
            if (element.controlType == 3 && element.displayFieldName == 'WorkPermit') {
              setTimeout(() => {
                element.dropDownValue = [];
              }, 1500)

            }
            if (element.controlType == 6 && element.displayFieldName == 'Work Type(s)') {
              setTimeout(() => {
                element.dropDownValue = [];
              }, 1500)

            }
            if (element.controlType == 3 && element.displayFieldName == 'Job Document Work Type(s)') {
              setTimeout(() => {
                element.dropDownValue = [];
              }, 1500)

            }
            if (element.controlType == 6 && element.displayFieldName == 'Job Document Work Type(s)') {
              setTimeout(() => {
                element.dropDownValue = [];
              }, 1500)

            }
            if (element.controlType == 3 && element.displayFieldName == 'Type' && this.selectedDocument == 129) {
              setTimeout(() => {
                element.value = element.dropDownValue.filter((x: any) => (x.itemName == 'Certification'))[0].id;
              }, 1500)
              element.disabled = true
            }
            if (element.controlType == 14 && element.fieldName == 'For') {
              element.disabled = true
            }
            if (element.controlType == 7) {
              element.value = JSON.parse(element.value)
              //  element.value = element.value
            }
            if (element.controlType == 1 && element.fieldName == "txtNo_Days" && element.idDocument == '113') {
              element.disabled = true
            }
            if (element.controlType == 1 && (element.fieldName == "*bad date*" || element.fieldName == "Through Day of Week") && (element.idDocument != 29 || element.idDocument != 127)) {
              element.disabled = true
            }
            if (element.controlType == 1 && element.fieldName == "Day Of Weeks" && (element.idDocument != 29 || element.idDocument != 188 || element.idDocument != 127)) {
              element.disabled = true
            }
            if (element.controlType == 7 && element.fieldName == "Ammendment" && element.idDocument == 27) {
              // element.disabled = true
            }
            if (element.controlType == 2 && element.fieldName == "Change Description" && element.idDocument == 27) {
              // element.disabled = true
            }
          });
          this.ListOfFields = resOfDocumentFields;
          if (this.selectedDocument == 29 || this.selectedDocument == 188) {
            this.application.startDate = this.ListOfFields.filter(x => (x.fieldName == 'Start Date'))[0].value
            this.application.endDate = this.ListOfFields.filter(x => (x.fieldName == 'End Date'))[0].value
            this.application.totalDays = this.ListOfFields.filter(x => (x.fieldName == 'Total Days'))[0].value
            this.application.isIncludeSaturday = this.ListOfFields.filter(x => (x.fieldName == 'Include Saturday'))[0].value
            this.application.isIncludeSunday = this.ListOfFields.filter(x => (x.fieldName == 'Include Sunday'))[0].value
            this.application.isIncludeHoliday = this.ListOfFields.filter(x => (x.fieldName == 'Include Holidays'))[0].value
            this.application.waterCost = this.ListOfFields.filter(x => (x.fieldName == 'WATER'))[0].value
            this.application.hydrantCost = this.ListOfFields.filter(x => (x.fieldName == 'HYDRANT'))[0].value
            this.application.total = this.ListOfFields.filter(x => (x.fieldName == 'TOTAL'))[0].value
          }
          this.showFieldValues = true;
          setTimeout(() => {
            this.loading = false;
          }, 2000)

        }, e => {
          this.loading = false
        })
      }

    } else {
      this.ListOfFields = [];
    }
  }

  onItemSelect(e: any, value: any, fieldName: string) {

    if (this.selectedDocument == 37 && value.length <= 10) {
      this.maxRecords = false;
    } else if (this.selectedDocument == 37 && value.length > 10) {
      this.maxRecords = true;
    }
    if (this.selectedDocument == 68 && value.length <= 5 && fieldName == 'Dot Location(Section G)') {
      this.maxRecords = false;
    } else if (this.selectedDocument == 68 && value.length > 5 && fieldName == 'Dot Location(Section G)') {
      this.maxRecords = true;
    }
  }


  /**
   * This method is used to get the Fields of document(after create)
   * @method documentFileds
   */
  getTheEditDocument() {
    if (this.selectedDocument == this.constantValues.PW517DOCUMENTID) {
      // For PW517
      this.getPW517ApplicantData()
      this.getPW517ApplicationData()
      this.getPW517FillingTypeData()
      this.getPW517VarianceData()
      this.jobDocumentServices.getPW517DocumentById(this.DocumentId).subscribe(docData => {
        this.pwDoc = docData
        if (this.pwDoc.application) {
          this.getPW517AppWorkPermit()
        }
        if (this.pwDoc.startDate) {
          this.showCalender = true
          this.setEfilligDateCalender().then(() => {
            setTimeout(() => {
              if (this.FinalArray && this.FinalArray.length > 0) {
                if (this.pwDoc.efilingDates) {
                  let tempDates = this.pwDoc.efilingDates.split(',');
                  this.pwDoc.numberOfDays = tempDates.length
                  $('#pwCustomCal').find('tr td').each((column: any, td: any) => {
                    let tdDate = $(td).attr('id')
                    if (tempDates.indexOf(tdDate) != -1) {
                      $(td).css("background-color", "##00B1D4 !important");
                      $(td).addClass("dateSelected");
                      this.selectedCalenderView.push(tdDate);
                      this.setPWDates(tdDate, 'select');
                    }
                  })
                }
              }
            }, 0)
          })
        }
      }, e => {
        this.loading = false
      })
    } else {

      this.jobDocumentServices.getDocumentById(this.DocumentId).subscribe(resOfDocument => {
        let onlyFrontEndFields = resOfDocument.jobDocumentField.filter((x: any) => x.field.isDisplayInFrontend == true);
        this.ListOfFields = [];
        this.ListOfFields = onlyFrontEndFields;
        onlyFrontEndFields.forEach((element: any, key: string) => {
          if (this.selectedDocument == 110 && element.displayFieldName == 'Applicant2') {
            if (element.value == null) {
              element.isRequired = false;
              element.field.isDisplayInFrontend = false;
            } else {
              let matchedParent = this.ListOfFields.filter((x: any) => x.id == element.idParentField)[0];
              if (matchedParent) {
                this.loading = true;
              }
              setTimeout(() => {
                element.displayFieldName = matchedParent.dropDownValue.filter((x: any) => x.id == matchedParent.value)[0].itemName;
                this.loading = false;
              }, 3000);

            }
          }

          if ((this.selectedDocument == 102 && element.displayFieldName == 'Application') || (this.selectedDocument == 204 && element.displayFieldName == 'Application')) {
            this.getParentJobDocForBINTAK(element, false);
          }

          element.showField = true // Show Hide Fields .. At Start we make set flag that all fields are showing
          let matchedParent = this.ListOfFields.filter((x: any) => x.id == element.idParentField);
          // Show Hide Field Start
          if (element.idParentField && element.staticDescription) {
            let descArray = element.staticDescription.split(',') || element.staticDescription;
            if (descArray && descArray.length > 0 || descArray) {
              if (matchedParent && matchedParent.length > 0) {
                if (descArray.indexOf(matchedParent[0].value) != -1) {
                  element.showField = true
                  element.isRequired = element.isRequired ? element.isRequired : false;
                  if (this.selectedDocument == 110 && matchedParent[0].displayFieldName == 'Consrtruction supt./Site Safety Mgr./Site Safety Coordinator') {
                    let dropdownname = this.ListOfFields.filter((x: any) => x.value == matchedParent[0].value)[0];
                    if (matchedParent[0].value == 6130) {
                      element.showField = false;
                      element.isRequired = false;
                    }

                    setTimeout(() => {    //<<<---    using ()=> syntax
                      let editdropdownname = dropdownname.dropDownValue.filter((x: any) => x.id == matchedParent[0].value)[0];
                      element.displayFieldName = editdropdownname.itemName;
                    }, 2000);
                  }
                } else if (descArray[0] == 'true') {
                  element.showField = element.isRequired;
                  element.isRequired = element.isRequired;
                } else {
                  element.showField = false
                  element.isRequired = false;
                }
              }
            } else {
              element.showField = true
              element.isRequired = false;
            }
          } else {
            element.showField = true
            element.isRequired = element.isRequired ? element.isRequired : false;
          }
          // Show Hide Field End
          if (element.controlType == 7) {
            //  element.value = element.value
            element.value = JSON.parse(element.value)
          }
          if ((element.controlType == 6 && element.idParentField != null) || (element.controlType == 6 && element.idParentField == null)) {
            let splitedValues = element.value.split(',')
            element.value = []
            element.dropDownValue = []
            if (element.controlType == 6 && element.idParentField == null) {
              this.DependencyEdit(element, 0).subscribe(resOfDependency => {
                element.dropDownValue = resOfDependency
                if (element.dropDownValue != '') {
                  element.value = _.filter(element.dropDownValue, function (obj: any) {
                    for (var i = 0; i < splitedValues.length; i++) {
                      if (splitedValues[i] === obj.id) {
                        return true;
                      }
                    }
                    return false;
                  });
                } else {
                  element.value = [];
                }
              })
            } else {
              onlyFrontEndFields.forEach((ele: any, key: string) => {
                if (element.idParentField == ele.id) {
                  this.DependencyEdit(element, ele.value).subscribe(resOfDependency => {
                    element.dropDownValue = resOfDependency
                    if (element.dropDownValue != '') {
                      element.value = _.filter(element.dropDownValue, function (obj: any) {
                        for (var i = 0; i < splitedValues.length; i++) {
                          if (splitedValues[i] === obj.id) {
                            return true;
                          }
                        }
                        return false;
                      });
                    } else {
                      element.value = [];
                    }
                  })
                }
              });
            }
          }
          if (element.controlType == 3 && element.apiUrl != null) {
            if (element.controlType == 3 && element.idParentField != null) {
              this.ListOfFields.forEach(subElement => {
                if (subElement.id == element.idParentField) {
                  this.DependencyEdit(element, subElement.value).subscribe(resOfSubDrop => {
                    element.dropDownValue = resOfSubDrop
                  })
                }
              });

            } else {
              this.DependencyEdit(element, 0).subscribe(resOfDrop => {
                element.dropDownValue = resOfDrop
              })
            }
          }
          if (element.controlType == 14 && element.fieldName == 'For') {
            element.disabled = true
          }
          if (element.controlType == 3 && element.fieldName == 'Type' && this.selectedDocument == 129) {
            element.disabled = true
            element.value = '4071'
          }
          if (element.controlType == 13) {
            //   this.resetDates(element.value, element.fieldName);
          }
          if (element.controlType == 1 && element.fieldName == "txtNo_Days" && element.idDocument == '113') {
            element.disabled = true
          }
          if (element.controlType == 1 && (element.fieldName == "*bad date*" || element.fieldName == "Through Day of Week") && (element.idDocument != 29 || element.idDocument != 188 || element.idDocument != 127)) {
            element.disabled = true
          }
          if (element.controlType == 1 && element.fieldName == "Day Of Weeks" && (element.idDocument != 29 || element.idDocument != 188 || element.idDocument != 127)) {
            element.disabled = true
          }
        });

        this.showFieldValues = true;

        if (this.selectedDocument == 29 || this.selectedDocument == 188) {
          this.jobApplicationService.getHolidayList().subscribe(list => {
            if (list.length > 0) {
              this.HolidayList = list.map((unq: any) => {
                return moment(unq.holidayDate).format("MM/DD/YYYY")
              })
              this.loading = false
            }
          }, e => {
            this.loading = false
          })
          this.jobApplicationService.getDepCostValues().subscribe(Cost => {
            this.hydrantCost = Cost.filter((val: any) => {
              return val.itemName == 'Hydrant Permit'
            })[0]
            this.waterCost = Cost.filter((val: any) => {
              return val.itemName == 'Hydrant Water Use'
            })[0]
            this.loading = false
          }, e => {
            this.loading = false
          });

          this.application.startDate = this.ListOfFields.filter(x => (x.fieldName == 'Start Date'))[0].value
          this.application.endDate = this.ListOfFields.filter(x => (x.fieldName == 'End Date'))[0].value
          this.application.totalDays = this.ListOfFields.filter(x => (x.fieldName == 'Total Days'))[0].value
          this.application.isIncludeSaturday = this.ListOfFields.filter(x => (x.fieldName == 'Include Saturday'))[0].value
          this.application.isIncludeSunday = this.ListOfFields.filter(x => (x.fieldName == 'Include Sunday'))[0].value
          this.application.isIncludeHoliday = this.ListOfFields.filter(x => (x.fieldName == 'Include Holidays'))[0].value
          this.application.waterCost = this.ListOfFields.filter(x => (x.fieldName == 'WATER'))[0].value
          this.application.hydrantCost = this.ListOfFields.filter(x => (x.fieldName == 'HYDRANT'))[0].value
          this.application.total = this.ListOfFields.filter(x => (x.fieldName == 'TOTAL'))[0].value
        }
      }, e => {
        this.loading = false
      });
    }

  }

  /**
   * This method is used to Dependency Feilds of the COO
   * @method enableAmmendmentsforCOO
   */
  enableAmmendmentsforCOO(AmmendmentValue: any, Control: number) {
    if (this.selectedDocument == 29 || this.selectedDocument == 188) {
      this.application.totalDays = AmmendmentValue;
      this.getCalculationDep('TotalDays')
    }
    if (this.selectedDocument == 27) {
      if (Control == 1 && (AmmendmentValue != '' && AmmendmentValue != null)) {
        const COOelement = this.ListOfFields.filter(element => element.fieldName === "Ammendment");
        COOelement[0].disabled = false;

      } else if (Control == 1 && AmmendmentValue == '') {
        const COOelement = this.ListOfFields.filter(element => element.fieldName === "Ammendment");
        COOelement[0].disabled = false;

      } else if (Control == 7 && AmmendmentValue) {
        const COOelement = this.ListOfFields.filter(element => element.fieldName === "Change Description");
        COOelement[0].disabled = false;


      } else if (Control == 7 && !AmmendmentValue) {
        const COOelement = this.ListOfFields.filter(element => element.fieldName === "Change Description");
        COOelement[0].disabled = false;

      } else {
        return false;
      }
    }


  }

  /**
   * This method is used to call Reuired functions When Checkbox is checked
   * @method callRequiredFunction
   * @param {any} FieldObj FieldObj is the element to be search
   * @param {any} field field is the value to be search
   */
  callRequiredFunction(field: any, value: boolean, control: number) {

    if (this.selectedDocument == 29 || this.selectedDocument == 188) {
      if (field.fieldName == 'Include Sunday') {
        this.application.isIncludeSunday = value;
        this.getCalculationDep('Checkboxes');
      }
      if (field.fieldName == 'Include Saturday') {
        this.application.isIncludeSaturday = value;
        this.getCalculationDep('Checkboxes');

      }
      if (field.fieldName == 'Include Holidays') {
        this.application.isIncludeHoliday = value;
        this.getCalculationDep('Checkboxes');
      }
      // this.selectedDocument == 29 ||
    }
    if (this.selectedDocument == 127) {
      this.getTheDEPHYDRAConditions(field, field.value);
    }
    if (this.selectedDocument == 27) {
      this.enableAmmendmentsforCOO(value, control);
    }

  }

  /**
   * This method is used to Dependency Feilds of the DEPHYDRA
   * @method getTheDEPHYDRAConditions
   * @param {any} FieldObj FieldObj is the element to be search
   * @param {any} field field is the value to be search
   */
  getTheDEPHYDRAConditions(FieldObj: any, field: any) {
    if (this.selectedDocument == 29 || this.selectedDocument == 127 || this.selectedDocument == 188) {
      this.ListOfFields.forEach((element: any, key: number) => {
        // Show Hide Field Start
        if (element.idParentField && element.staticDescription && element.idParentField == FieldObj.id) {
          let descArray = element.staticDescription.split(',')
          if (descArray && descArray.length > 0) {
            if (FieldObj.value == true) {
              element.showField = false
              element.isRequired = false

            } else {
              element.showField = true
              element.isRequired = true
            }
          } else {
            element.showField = true
          }
        } else {
          // element.showField = false
        }
      });
    }

  }

  is_weekend(your_date: any) {
    var dt = new Date(your_date);
    if (dt.getDay() == 6 || dt.getDay() == 0) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * This method is used to Save & update the job document
   * @method savechanges
   */
  saveDocument() {
    this.loading = true;
    this.isDateExeed14Days = false;
    let onlyFrontEndFields = this.ListOfFields.filter(x => x.field.isDisplayInFrontend == true);
    onlyFrontEndFields.forEach((element: any, key: number) => {
      if (element.field.isDisplayInFrontend && element.controlType != 9) {
        if (element.field.isDisplayInFrontend && element.controlType == 6) {
          let arayForMulti: any[] = []
          let workPermitTypeValue: string = ''
          if (element.value && element.value.length > 0) {
            element.value.map(function (value: any) {
              workPermitTypeValue = value.id + "," + workPermitTypeValue;
            })
            if (workPermitTypeValue) {
              workPermitTypeValue = workPermitTypeValue.slice(0, -1);
            }
          }
          this.ListOfFieldsTosent.jobDocumentFields.push({
            'idDocumentField': element.id, 'value': workPermitTypeValue
          })
        } else {
          this.ListOfFieldsTosent.jobDocumentFields.push({'idDocumentField': element.id, 'value': (element.controlType != 7 ? element.value : (element.value == '' ? false : true))})
        }
      } else {
        this.ListOfFieldsTosent.jobDocumentFields.push({'idDocumentField': element.id, 'value': (this.documents.length > 0 ? this.documents[0].name : element.value)})
      }

      //jobapplicationnumbertype
      if (typeof element.apiUrl != 'undefined' && element.apiUrl != null && element.apiUrl != '') {
        let splitTheurl = element.apiUrl
        splitTheurl = splitTheurl.split('/')
        splitTheurl.forEach((unique: any) => {
          let string = unique;
          string = string.toLowerCase()
          if (string == 'jobapplicationnumbertype') {
            this.ListOfFieldsTosent.idJobApplication = element.value;
          }
        });
      }
    });
    if (this.selectedDocument == "113" && this.AllSelectedDays && this.AllSelectedDays.length > 0) {
      let tempAllDates: any = [];
      this.AllSelectedDays.forEach(data => {
        tempAllDates.push(new Date(data));

      });

      if (tempAllDates.length == this.AllSelectedDays.length) {
        let max = tempAllDates[0]
        let min = tempAllDates[0]
        tempAllDates.forEach(function (v: any) {
          max = new Date(v) > new Date(max) ? v : max;
          min = new Date(v) < new Date(min) ? v : min;
        });
        let maxDateAfter14Days = moment(min, "HH").add(14, 'days').toDate();
        if (maxDateAfter14Days) {
          tempAllDates.forEach((v: any) => {
            if (new Date(v) > maxDateAfter14Days || this.AllSelectedDays.length > 14) {
              this.isDateExeed14Days = true;
              this.toastr.info("Based on your Current Date selection, The Last day you can apply for a permit on this application is " + moment(maxDateAfter14Days).format('MM/DD/YYYY'));
              this.loading = false;
            }
          });
        }
      }
    }
    if (!this.isDateExeed14Days) {
      this.ListOfFieldsTosent['IdJobchecklistItemDetails'] = this.isChecklist
      console.log('data', this.ListOfFieldsTosent)
      this.jobDocumentServices.createJobDocument(this.ListOfFieldsTosent).subscribe(resOfDocument => {
        if (this.documents && this.documents.length > 0) {
          let formData = new FormData();
          formData.append('idJobDocument', resOfDocument.idJobDocument.toString())
          for (var i = 0; i < this.documents.length; i++) {
            formData.append('documents_' + i, this.documents[i])
          }
          this.jobDocumentServices.addDocument(formData).subscribe(res => {
            this.loading = false;
            this.modalRef.hide();
            if (this.ListOfFieldsTosent.id == 0) {
              this.toastr.success("Job Document created successfully");
            } else {
              this.toastr.success("Job Document updated successfully");
            }
            this.reload.emit(true);
          }, e => {
            this.loading = false;
          });
        } else {
          this.loading = false;
          if (this.ListOfFieldsTosent.id == 0) {
            this.toastr.success("Job Document created successfully");
          } else {
            this.toastr.success("Job Document updated successfully");
          }
          this.ListOfFieldsTosent = {} as ModelTosent;
          if (resOfDocument.documentPath && this.documents.length == 0 && (this.ListOfFields.filter(function (e: any) {
            return e.controlType === 9;
          }).length) == 0) {
            window.open(resOfDocument.documentPath, "_blank")
          }
          this.modalRef.hide();
          this.reload.emit(true);
        }
      }, e => {
        this.loading = false
        this.ListOfFieldsTosent = {
          id: (this.DocumentId == null ? 0 : this.DocumentId),
          idJob: this.idJob,
          idDocument: (this.DocumentId == null ? this.ListOfFieldsTosent.idDocument : this.DocumentObj.idDocument),
          documentName: (this.DocumentId == null ? '' : this.DocumentObj.documentName),
          jobDocumentFields: []
        } as ModelTosent;
      });
    }
  }

  /**
   * This method is used to select the file
   * @method fileSelection
   * @param {any} file file contains the data of selected document
   */
  filesChange(file: any) {
    if (this.DocumentId) {
      let documentField = this.ListOfFields.filter((x: any) => x.controlType == 9)[0];
      if (documentField) {
        documentField.attachmentPath = '';
      }
    }
    if (file.length == 1) {
      this.documents = file;
    } else {
      this.documents = [file[file.length - 1]];
    }
    this.files = []
  }

  /**
   * This method is used to Delete the Selected document
   * @method document
   */
  deleteDocument() {
    this.documents = [];
  }

  /**
   * This method is used to check that data contains only number
   * @method isNumber
   * @param {any} evt evt is used to get event of that input
   */
  isNumber(evt: any) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  /**
   * This method is used to get Dependency Dropdownvalues
   * @method Dropdownvalues
   * @param {any} FieldObj FieldObj is the element to be search
   * @param {any} field field is the value to be search
   */
  DependencyEdit(FieldObj: any, field?: any, permit?: any) {
    if (FieldObj.fieldName == 'Contacts' && this.selectedDocument == 96) {
      if (field == 0 || field == null) {
        field = -1;
      }
    }
    if (FieldObj.fieldName == 'Application' && this.selectedDocument == 4) {
      field = 1
    }
    let urlForDependency = FieldObj.apiUrl;

    if (this.idJob) {
      urlForDependency += "/" + this.idJob;
    }
    if (this.selectedDocument) {
      urlForDependency += "/" + this.selectedDocument + '/' + field;
    }

    if (this.selectedDocument == 102 && FieldObj.fieldName == 'Parent Job Document') {
      urlForDependency = ''
      urlForDependency = `${FieldObj.apiUrl}/${this.idJob}/${this.selectedDocument}/0/0`
    }
    return this.jobDocumentServices.getDropdownValues(urlForDependency)
  }

  onDEPDatesChange(selecteddate: any, Field: any) {
    $('#TotalHide').hide()
    if (Field.fieldName == 'End Date') {
      this.application.endDate = Field.value;
      this.checkEndDateValidDays();
    }
    const regex = /^((0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](12|13|14|15|16|17|18|19|20)[0-9]{2})*$/;
    if (Field.fieldName == 'Start Date') {
      this.application.startDate = Field.value;
      if (typeof this.application.startDate != 'undefined' && this.application.startDate != null && this.application.startDate != '' && regex.test(this.application.startDate)) {
        this.getCalculationDep('StartDate');
      }


    } else {

      this.application.endDate = null
      this.application.waterCost = null
      this.application.hydrantCost = null
      this.application.totalCost = null
    }

    if (this.selectedDocument == 127) {
      let newdate = moment(selecteddate, "MM-DD-YYYY");
      var weekDayName = moment(newdate).format('dddd');
      if (Field.fieldName == 'Permit Date') {
        let ELEMENT = this.ListOfFields.filter(
          aaelememt => aaelememt.fieldName == 'Day Of Weeks');
        ELEMENT[0].value = weekDayName;
      }
      if (Field.fieldName == 'Through' && this.selectedDocument == 127) {

        let ELEMENT = this.ListOfFields.filter(
          aaelememt => aaelememt.fieldName == "Through Day of Week");
        ELEMENT[0].value = weekDayName;


      }
    }
  }

  /**
   * DEP HYDRANT CALCULATIONS
   */
  /**
   * This method calculate Dep end date based on start date and number of days
   * @method getCalculationDep
   */
  getCalculationDep(changetype?: string) {
    let finaldays: any;
    let weekDays = [1, 2, 3, 4, 5]
    let excludeHolidays: any = []
    excludeHolidays = this.HolidayList
    if (this.application.isIncludeSaturday && !this.application.isIncludeSunday) {
      weekDays = [1, 2, 3, 4, 5, 6]
    } else if (!this.application.isIncludeSaturday && this.application.isIncludeSunday) {
      weekDays = [0, 1, 2, 3, 4, 5]
    } else if (this.application.isIncludeSaturday && this.application.isIncludeSunday) {
      weekDays = [0, 1, 2, 3, 4, 5, 6]
    } else {
      weekDays = [1, 2, 3, 4, 5]
    }
    const days = this.application.totalDays
    if (changetype == 'TotalDays' || changetype == 'StartDate' || changetype == 'Checkboxes') {

      if (!this.application.isIncludeHoliday) {
        let newstartdate = moment(this.application.startDate).add(-1, 'days').format("MM/DD/YYYY");
        let cal = moments(newstartdate).addWeekdaysFromSet({
          'workdays': days,
          'weekdays': weekDays,
          'exclusions': excludeHolidays
        });
        this.application.endDate = moment(cal).format("MM/DD/YYYY")
        $('#endDates').val = moment(cal).format("MM/DD/YYYY")
        let end = this.ListOfFields.filter(x => (x.fieldName == 'End Date'))[0];
        end.value = this.application.endDate
      }
      if (this.application.isIncludeHoliday) {
        let newstartdate = moment(this.application.startDate).add(-1, 'days').format("MM/DD/YYYY");
        let cal = moments(newstartdate).addWeekdaysFromSet({
          'workdays': days,
          'weekdays': weekDays,
          'exclusions': [],
          'inclusions': excludeHolidays
        });
        this.application.endDate = moment(cal).format("MM/DD/YYYY")
        $('#endDates').val = moment(cal).format("MM/DD/YYYY")
        let end = this.ListOfFields.filter(x => (x.fieldName == 'End Date'))[0];
        end.value = this.application.endDate;
      }

    }
    var startdate = moment(this.application.startDate);
    var enddate = moment(this.application.endDate);
    finaldays = enddate.diff(startdate, 'days') + 1;
    let costFixed = Math.ceil(parseInt(finaldays) / this.hydrantCost.numberOfDays);
    this.application.hydrantCost = (costFixed * this.hydrantCost.price)
    this.application.waterCost = (this.application.totalDays * this.waterCost.price)
    this.application.totalCost = this.application.hydrantCost + this.application.waterCost
    let water = this.ListOfFields.filter(x => (x.fieldName == 'WATER'))[0]
    water.value = this.application.waterCost;
    let hydrant = this.ListOfFields.filter(x => (x.fieldName == 'HYDRANT'))[0]
    hydrant.value = this.application.hydrantCost;
    let total = this.ListOfFields.filter(x => (x.fieldName == 'TOTAL'))[0]
    total.value = this.application.totalCost;
    $('#TotalHide').show()
  }

  /**
   * This method calculate Dep end date based on start date and number of days
   * @method getCalculationDep
   */
  checkEndDateValidDays(e?: any) {
    let weekDays = [1, 2, 3, 4, 5]
    let excludeHolidays: any = []
    let endDate: any
    endDate = this.application.endDate
    if (!this.application.isIncludeHoliday) {
      excludeHolidays = this.HolidayList
    }
    if (this.application.isIncludeSaturday && !this.application.isIncludeSunday) {
      weekDays = [1, 2, 3, 4, 5, 6]
    } else if (!this.application.isIncludeSaturday && this.application.isIncludeSunday) {
      weekDays = [1, 2, 3, 4, 5, 7]
    } else if (this.application.isIncludeSaturday && this.application.isIncludeSunday) {
      weekDays = [1, 2, 3, 4, 5, 6, 7]
    } else {
      weekDays = [1, 2, 3, 4, 5]
    }

    let remainDays: any

    if (!this.application.isIncludeHoliday) {
      remainDays = moments().isoWeekdayCalc({
        rangeStart: this.application.startDate,
        rangeEnd: this.application.endDate,
        weekdays: weekDays,
        exclusions: excludeHolidays
      })
    } else {
      remainDays = moments().isoWeekdayCalc({
        rangeStart: this.application.startDate,
        rangeEnd: this.application.endDate,
        weekdays: weekDays,
        inclusions: excludeHolidays
      })
    }
    if (!this.application.isIncludeSaturday && !this.application.isIncludeSunday && !this.application.isIncludeHoliday) {
      this.application.totalDays = remainDays
      let xx = this.ListOfFields.filter(x => (x.fieldName == 'Total Days'))[0];
      xx.value = this.application.totalDays
      this.getCalculationDep('TotalDays');
    } else {
      this.application.totalDays = remainDays
      let xx = this.ListOfFields.filter(x => (x.fieldName == 'Total Days'))[0];
      xx.value = this.application.totalDays
      this.getCalculationDep('TotalDays');
    }

  }


  /**
   * PW517 Code Start
   */

  getPW517ApplicationData() {
    this.jobDocumentServices.getApplicationDDForPW517(this.idJob, this.selectedDocument, this.DocumentId).subscribe(r => {


      this.pw517ApplicationList = r
    })
  }

  getPW517VarianceData() {
    this.jobDocumentServices.getVarianceDDForPW517(this.idJob, this.selectedDocument, this.DocumentId).subscribe(r => {
      this.pw517VarianceList = r
    })
  }

  getPW517ApplicantData() {
    this.jobDocumentServices.getApplicantDDForPW517(this.idJob, this.selectedDocument, this.DocumentId).subscribe(r => {
      this.pw517ApplicantList = r
    })
  }

  getPW517FillingTypeData() {
    this.jobDocumentServices.getFillingTypeDDForPW517(this.idJob, this.selectedDocument, this.DocumentId).subscribe(r => {
      this.pw517FillingTypeList = r
    })
  }

  getForDescription() {
    this.jobDocumentServices.getForDescForPW517(this.idJob, this.selectedDocument, this.pwDoc.application).subscribe(r => {
      if (r && r.length > 0) {
        this.pwDoc.forDescription = r
      }
    })
  }

  getPW517AppWorkPermit() {

    if (this.pwDoc.application != null) {
      this.workPermitForPW517App = []
      this.jobDocumentServices.getWorkPermitsForPW517(this.idJob, this.selectedDocument, this.pwDoc.application).subscribe(r => {
        if (r && r.length > 0) {
          this.workPermitForPW517App = r
        } else {
          this.workPermitForPW517App = []
          this.pwDoc.idWorkPermit = null;
        }
      })
    } else {
      this.workPermitForPW517App = []
      this.pwDoc.idWorkPermit = null;
    }

  }

  getTheDiffernceDates() {
    const startOfWeek = moment(this.pwDoc.startDate);
    const endOfWeek = moment(startOfWeek).add(13, "days");
    var days = [];
    var day = startOfWeek;
    while (day <= endOfWeek) {
      days.push(day.toDate());
      day = day.clone().add(1, "d");
    }
    return days;
  }

  setCustomCalenderForPW517() {
    this.sundayArray = []
    this.mondayArray = []
    this.tuesdayArray = []
    this.wensdayArray = []
    this.thursdayArray = []
    this.fridayArray = []
    this.saturdayArray = []
    this.sundayArray = []
    this.pwDoc.mondayDates = ''
    this.pwDoc.tuesdayDates = ''
    this.pwDoc.wednesdayDates = ''
    this.pwDoc.thursdayDates = ''
    this.pwDoc.fridayDates = ''
    this.pwDoc.saturdayDates = ''
    this.pwDoc.sundayDates = ''
    this.selectedCalenderView = []
    this.pwDoc.efilingDates = ''
    this.setEfilligDateCalender()

  }

  setEfilligDateCalender() {
    if (this.validateDate(this.pwDoc.startDate)) {
      $("#calenderTable").show()
      return new Promise((resolve, reject) => {
        this.showCalender = true;
        $('#pwCustomCal').empty()
        this.FinalArray = []
        this.pwDoc.numberOfDays = 0
        this.onCalender = this.sanitizer.bypassSecurityTrustHtml(
          this.getTheCalenderView()
        );
        resolve(this.onCalender)
      })
    } else {
      $("#calenderTable").hide()
    }
  }

  getTheCalenderView() {
    var dates = this.getTheDiffernceDates();
    dates.forEach((data: any) => {
      this.FinalArray.push({
        dateobj: data,
        day: moment(data).day(),
        date: moment(data).format("MM/DD/YY"),
        isSelected: false
      });
    });

    let str = "";
    let isLastDate = true;
    let rowNumber = 1;
    for (let i = 0; i < this.FinalArray.length; i++) {
      const currentDate = this.FinalArray[i];
      if (isLastDate) {
        str = str + "<tr>";
        isLastDate = false;
        if (rowNumber == 1) {
          for (let j = 0; j < currentDate.day; j++) {
            str = str + "<td  style='border: 1px solid #ccc !important;'></td>";
          }
        }
      }
      str =
        str +
        "<td class='CalenderClass' id='" +
        currentDate.date +
        "' style='border: 1px solid #ccc !important;background-color: #ffffff; border: none;color: black;padding: 10px;text-align: center;text-decoration: none;font-size: 12px;margin: 4px 2px;cursor: pointer;'>" +
        moment(currentDate.date).date() +
        "</td>";
      if (currentDate.day == 6) {
        isLastDate = true;
      }
      if (rowNumber == 3 && i == this.FinalArray.length - 1) {
        let emptyTdForlastRow = 7 - (currentDate.day + 1)
        for (let j = 0; j < emptyTdForlastRow; j++) {
          str = str + "<td  style='border: 1px solid #ccc !important;'></td>";
        }
      }
      if (isLastDate) {
        str = str + "</tr>";
        rowNumber = rowNumber + 1;
      }
    }
    return str;
  }

  setPWDates(element: any, type: string) {
    /**
     * 0-Sunday
     * 6-Saturday
     */
    let dayOfDate = moment(element).day();
    if (this.selectedCalenderView) {
      this.setTimeValueInListObject('numberOfDays', this.selectedCalenderView.length);
    }

    if (dayOfDate == 0) {
      this.setDateValueInListObject('sundayDates', this.sundayArray, element, type);
    }
    if (dayOfDate == 1) {
      this.setDateValueInListObject('mondayDates', this.mondayArray, element, type);
    }
    if (dayOfDate == 2) {
      this.setDateValueInListObject('tuesdayDates', this.tuesdayArray, element, type);
    }
    if (dayOfDate == 3) {
      this.setDateValueInListObject('wednesdayDates', this.wensdayArray, element, type);
    }
    if (dayOfDate == 4) {
      this.setDateValueInListObject('thursdayDates', this.thursdayArray, element, type);
    }
    if (dayOfDate == 5) {
      this.setDateValueInListObject('fridayDates', this.fridayArray, element, type);
    }
    if (dayOfDate == 6) {
      this.setDateValueInListObject('saturdayDates', this.saturdayArray, element, type);
    }
    element = "";
  }

  setDateValueInListObject(modalName: string, value: any[], element: any, type: string) {
    if (type == 'select' && value.indexOf(value.filter(x => x == element)[0]) == -1) {
      value.push(element);
    } else if (type == 'deselect' && value.indexOf(value.filter(x => x == element)[0]) != -1) {
      value.splice(value.indexOf(value.filter(x => x == element)[0]), 1)
      if (value.length == 0) {
        if (modalName == 'mondayDates') {
          this.pwDoc.mondayStartTime = ''
          this.pwDoc.mondayEndTime = ''
        }
        if (modalName == 'tuesdayDates') {
          this.pwDoc.tuesdayStartTime = ''
          this.pwDoc.tuesdayEndTime = ''
        }
        if (modalName == 'wednesdayDates') {
          this.pwDoc.wednesdayStartTime = ''
          this.pwDoc.wednesdayEndTime = ''
        }
        if (modalName == 'thursdayDates') {
          this.pwDoc.thursdayStartTime = ''
          this.pwDoc.thursdayEndTime = ''
        }
        if (modalName == 'fridayDates') {
          this.pwDoc.fridayStartTime = ''
          this.pwDoc.fridayEndTime = ''
        }
        if (modalName == 'saturdayDates') {
          this.pwDoc.saturdayStartTime = ''
          this.pwDoc.saturdayEndTime = ''
        }
        if (modalName == 'sundayDates') {
          this.pwDoc.sundayStartTime = ''
          this.pwDoc.sundayEndTime = ''
        }

      }


    }
    this.pwDoc[modalName] = value.toString();
  }

  setTimeValueInListObject(modalName: string, value: any) {
    this.pwDoc[modalName] = value;
  }

  setSameTime(value: string) {
    if (value == "WeekendSame") {
      if (this.pwDoc.sundayDates) {
        this.setTimeValueInListObject('sundayStartTime', this.pwDoc.saturdayStartTime);
        this.setTimeValueInListObject('sundayEndTime', this.pwDoc.saturdayEndTime);
      }
    }
    if (value == "WeekdaySame") {
      if (this.pwDoc.tuesdayDates) {
        this.setTimeValueInListObject('tuesdayStartTime', this.pwDoc.mondayStartTime);
        this.setTimeValueInListObject('tuesdayEndTime', this.pwDoc.mondayEndTime);
      }
      if (this.pwDoc.wednesdayDates) {
        this.setTimeValueInListObject('wednesdayStartTime', this.pwDoc.mondayStartTime);
        this.setTimeValueInListObject('wednesdayEndTime', this.pwDoc.mondayEndTime);
      }
      if (this.pwDoc.thursdayDates) {
        this.setTimeValueInListObject('thursdayStartTime', this.pwDoc.mondayStartTime);
        this.setTimeValueInListObject('thursdayEndTime', this.pwDoc.mondayEndTime);
      }
      if (this.pwDoc.fridayDates) {
        this.setTimeValueInListObject('fridayStartTime', this.pwDoc.mondayStartTime);
        this.setTimeValueInListObject('fridayEndTime', this.pwDoc.mondayEndTime);
      }
    }
  }

  savePW517Document() {
    this.pwDoc.idJob = this.idJob
    if (this.selectedCalenderView && this.selectedCalenderView.length > 0) {
      this.pwDoc.efilingDates = this.selectedCalenderView.toString()
    }
    this.loading = true
    let isValidation = false
    if (!this.pwDoc.efilingDates) {
      this.toastr.error('Please select atleast one date')
      isValidation = true
      this.loading = false
    }
    if (this.pwDoc.mondayDates && (!this.pwDoc.mondayStartTime || !this.pwDoc.mondayEndTime)) {
      this.toastr.error('Please select monday start and end time')
      isValidation = true
      this.loading = false
    } else if (this.pwDoc.tuesdayDates && (!this.pwDoc.tuesdayStartTime || !this.pwDoc.tuesdayEndTime)) {
      this.toastr.error('Please select tuesday start and end time')
      isValidation = true
      this.loading = false
    } else if (this.pwDoc.wednesdayDates && (!this.pwDoc.wednesdayStartTime || !this.pwDoc.wednesdayEndTime)) {
      this.toastr.error('Please select wednesday start and end time')
      isValidation = true
      this.loading = false
    } else if (this.pwDoc.thursdayDates && (!this.pwDoc.thursdayStartTime || !this.pwDoc.thursdayEndTime)) {
      this.toastr.error('Please select thursday start and end time')
      isValidation = true
      this.loading = false
    } else if (this.pwDoc.fridayDates && (!this.pwDoc.fridayStartTime || !this.pwDoc.fridayEndTime)) {
      this.toastr.error('Please select friday start and end time')
      isValidation = true
      this.loading = false
    } else if (this.pwDoc.saturdayDates && (!this.pwDoc.saturdayStartTime || !this.pwDoc.saturdayEndTime)) {
      this.toastr.error('Please select saturday start and end time')
      isValidation = true
      this.loading = false
    } else if (this.pwDoc.sundayDates && (!this.pwDoc.sundayStartTime || !this.pwDoc.sundayEndTime)) {
      this.toastr.error('Please select sunday start and end time')
      isValidation = true
      this.loading = false
    } else if (!this.pwDoc.weekdayDescription && (this.pwDoc.mondayDates || this.pwDoc.tuesdayDates
      || this.pwDoc.wednesdayDates || this.pwDoc.thursdayDates || this.pwDoc.fridayDates || this.pwDoc.saturdayDates || this.pwDoc.sundayDates)) {
      this.toastr.error('Based on Current Date selection,Work Description is a required field')
      isValidation = true
      this.loading = false
    }

    if (!isValidation) {
      if (this.isClone) { // while clone PW517 remove id key so we can generate new record
        delete this.pwDoc.id
      }
      this.jobDocumentServices.savePW517Document(this.pwDoc).subscribe(r => {
        this.loading = false
        this.modalRef.hide();
        this.reload.emit(true);
        if (r && r.documentPath) {
          window.open(r.documentPath, "_blank")
        }
      }, e => {
        this.loading = false
      })
    } else {
      this.loading = false
    }
  }

  setAHVRefNoRequired() {
    if (this.pwDoc.idJobDocumentType && this.pw517FillingTypeList && this.pw517FillingTypeList.length > 0) {
      if (this.pw517FillingTypeList.filter((x: any) => x.id == this.pwDoc.idJobDocumentType)) {
        let matchedItem = this.pw517FillingTypeList.filter((x: any) => x.id == this.pwDoc.idJobDocumentType)[0]
        if (matchedItem.itemName == 'Renewal') {
          this.requireAHVRefForPW517 = true
        } else {
          this.requireAHVRefForPW517 = false
        }
      }
    }
  }

  validateDate(testdate: any) {
    var date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/\d{2}$/;
    return date_regex.test(testdate);
  }

}







