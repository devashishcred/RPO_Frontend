import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { JobCheckListServices } from "../checklist/checklist.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: '[export-checklist]',
  templateUrl: './export-checklist.component.html',
  styleUrls: ['./export-checklist.component.css']
})
export class ExportChecklistComponent implements OnInit {
  @Input() modalRef: BsModalRef
  @Input() checklistType: any = 'General';
  @Input() mainChecklistArray: any = [];
  @Input() idCompositeChecklist: any;
  @Input() exportFileType: any = 'xls';
  listOfchecklistType = [
    { label: 'General Checklist', value: 'General' },
    { label: 'Composite Checklist', value: 'Composite' },
    { label: 'Plumbing Checklist', value: 'Plumbing' },
  ];
  selectedData: any = [];
  onlyTCOItems: boolean = false;
  isViolation: boolean = true;
  loading: boolean = false;

  constructor(
    public jobCheckListServices: JobCheckListServices,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    console.log(this.idCompositeChecklist)
    this.mainChecklistArray = this.mainChecklistArray.map(el => ({ checked: false, displayOrder: null, ...el }))
    for (let index = 0; index < this.mainChecklistArray.length; index++) {
      this.mainChecklistArray[index].displayOrder = index + 1
      this.mainChecklistArray[index].groups = this.mainChecklistArray[index].groups.map(el => ({ checked: false, displayOrder1: null, ...el }))
      for (let index2 = 0; index2 < this.mainChecklistArray[index].groups.length; index2++) {
        this.mainChecklistArray[index].groups[index2].displayOrder1 = index2
      }
    }

    if (this.checklistType === 'Composite') {
      let index = this.mainChecklistArray.findIndex(el => el.isParentCheckList === true)
      if (index !== -1) {
        this.onSelectCompositeChechlist(this.mainChecklistArray[index], index)
      }
    }
    console.log(this.mainChecklistArray)
  }

  getDocumentFields() {
    console.log(this.checklistType)
  }

  mainGeneralChecklistDrop(event: CdkDragDrop<string[]>) {
    let tempData: any = this.mainChecklistArray
    moveItemInArray(tempData, event.previousIndex, event.currentIndex);
    const data = tempData.map((v, index): any => ({
      ...v,
      displayOrder: index + 1
    }));
    console.log("payload", data)
    this.mainChecklistArray = data
    console.log("this.mainChecklistArray", this.mainChecklistArray)
    for (let index2 = 0; index2 < this.selectedData.length; index2++) {
      const checklist = this.selectedData[index2];
      let data = this.mainChecklistArray.find(el => el.jobChecklistHeaderId == checklist.jobChecklistHeaderId)
      this.selectedData[index2].displayOrder = data.displayOrder
    }
  }

  // mainCompositeChecklistDrop(event: CdkDragDrop<string[]>) {
  //   let tempData: any = this.mainChecklistArray
  //   moveItemInArray(tempData, event.previousIndex, event.currentIndex);
  //   const data = tempData.map((v, index): any => ({
  //     ...v,
  //     displayOrder: index + 1
  //   }));
  //   console.log("payload", data)
  //   this.mainChecklistArray = data
  //   console.log("this.mainChecklistArray", this.mainChecklistArray)
  //   for (let index2 = 0; index2 < this.selectedData.length; index2++) {
  //     const checklist = this.selectedData[index2];
  //     let data = this.mainChecklistArray.find(el => el.jobChecklistHeaderId == checklist.jobChecklistHeaderId)
  //     this.selectedData[index2].displayOrder = data.displayOrder
  //   }
  // }


  mainCompositeChecklistDrop(event: CdkDragDrop<string[]>) {
    console.log(event);
    const parentApplication = this.mainChecklistArray.find(item => item.isParentCheckList == true);
    console.log('parentApplication', parentApplication)
    const completedObjects = [];
    const pendingObjects = [];
    // Separate completed and pending objects
    for (const object of this.mainChecklistArray) {
      if (object.isParentCheckList === true) {
        object.displayOrder = this.mainChecklistArray.length
        completedObjects.push(object);
      } else {
        pendingObjects.push(object);
      }
    }
    // Concatenate pending objects followed by completed objects
    const rearrangedArray = [...pendingObjects, ...completedObjects];
    console.log('rearrangedArray', rearrangedArray)
    moveItemInArray(rearrangedArray, event.previousIndex, event.currentIndex);
    const data = rearrangedArray.map((v, index): any => ({
      ...v,
      displayOrder: index + 1
    }));
    this.mainChecklistArray = data
    console.log('mainChecklistArray', this.mainChecklistArray)
    for (let index2 = 0; index2 < this.selectedData.length; index2++) {
      const checklist = this.selectedData[index2];
      let data = this.mainChecklistArray.find(el => el.jobChecklistHeaderId == checklist.jobChecklistHeaderId)
      this.selectedData[index2].displayOrder = data.displayOrder
    }
  }

  dropGeneralGroup(event: CdkDragDrop<string[]>, i) {
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
      ({ items, displayOrder1, ...rest }) => ({ ...rest })
    );
    payload.groups = payload.groups.map((v, index): any => ({
      ...v,
      displayOrder1: index + 1,
    }));
    console.log(payload)
    let index = this.mainChecklistArray.findIndex((r) => r.jobChecklistHeaderId == i);
    console.log(index)
    this.mainChecklistArray[index].groups = payload.groups
    let selectedChecklistIndex = this.selectedData.findIndex(el => (this.mainChecklistArray[index].jobChecklistHeaderId == el.jobChecklistHeaderId))
    if (selectedChecklistIndex != -1) {
      for (let index2 = 0; index2 < this.selectedData[selectedChecklistIndex].groups.length; index2++) {
        const group = this.selectedData[selectedChecklistIndex].groups[index2];
        let data = this.mainChecklistArray[index].groups.find(el => el.jobChecklistGroupId == group.jobChecklistGroupId)
        this.selectedData[selectedChecklistIndex].groups[index2].displayOrder1 = data.displayOrder1
      }
    }
    console.log(this.selectedData)
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
      ({ items, displayOrder1, ...rest }) => ({ ...rest })
    );
    payload.groups = payload.groups.map((v, index): any => ({
      ...v,
      displayOrder1: index + 1,
    }));
    console.log(payload)
    let index = this.mainChecklistArray.findIndex((r) => r.jobChecklistHeaderId == i);
    console.log(index)
    this.mainChecklistArray[index].groups = payload.groups
    let selectedChecklistIndex = this.selectedData.findIndex(el => (this.mainChecklistArray[index].jobChecklistHeaderId == el.jobChecklistHeaderId))
    if (selectedChecklistIndex != -1) {
      for (let index2 = 0; index2 < this.selectedData[selectedChecklistIndex].groups.length; index2++) {
        const group = this.selectedData[selectedChecklistIndex].groups[index2];
        let data = this.mainChecklistArray[index].groups.find(el => el.jobChecklistGroupId == group.jobChecklistGroupId)
        this.selectedData[selectedChecklistIndex].groups[index2].displayOrder1 = data.displayOrder1
      }
    }
    console.log(this.selectedData)
  }

  onSelectGeneralChechlist(data, checklistIndex, groupData?, groupIndex?) {
    let tempGroupData;
    let tempData = JSON.parse(JSON.stringify(data));
    if (groupData) {
      tempGroupData = JSON.parse(JSON.stringify(groupData))
    }
    if (this.selectedData.length == 0) {
      this.mainChecklistArray[checklistIndex]['checked'] = true
      if (groupData) {
        this.selectedData.push(tempData)
        this.selectedData[0].groups = []
        this.mainChecklistArray[checklistIndex].groups[groupIndex]['checked'] = true
        tempGroupData['checked'] = true
        this.selectedData[0].groups.push(tempGroupData)
      } else {
        for (let index = 0; index < this.mainChecklistArray[checklistIndex].groups.length; index++) {
          this.mainChecklistArray[checklistIndex].groups[index]['checked'] = true;
          tempData.groups[index]['checked'] = true;
        }
        this.selectedData.push(tempData)
      }
    } else {
      let selectedChecklistIndex = this.selectedData.findIndex(el => (tempData.jobChecklistHeaderId == el.jobChecklistHeaderId))
      if (!groupData) {
        if (selectedChecklistIndex == -1) {
          this.mainChecklistArray[checklistIndex].checked = true
          for (let index = 0; index < this.mainChecklistArray[checklistIndex].groups.length; index++) {
            this.mainChecklistArray[checklistIndex].groups[index]['checked'] = true;
            tempData.groups[index]['checked'] = true;
          }
          this.selectedData.push(tempData)
        } else {
          this.mainChecklistArray[checklistIndex].checked = false
          for (let gindex = 0; gindex < this.mainChecklistArray[checklistIndex].groups.length; gindex++) {
            this.mainChecklistArray[checklistIndex].groups[gindex]['checked'] = false
          }
          this.selectedData.splice(selectedChecklistIndex, 1)
        }
      } else {
        if (selectedChecklistIndex == -1) {
          this.selectedData.push(tempData)
          let length = this.selectedData.length
          this.selectedData[length - 1].groups = []
          this.mainChecklistArray[checklistIndex]['checked'] = true
          selectedChecklistIndex = this.selectedData.findIndex(el => (tempData.jobChecklistHeaderId == el.jobChecklistHeaderId))
        }
        let selectedGroupIndex = this.selectedData[selectedChecklistIndex].groups.findIndex(el => (tempGroupData.jobChecklistGroupId == el.jobChecklistGroupId))
        if (selectedGroupIndex == -1) {
          this.mainChecklistArray[checklistIndex].groups[groupIndex]['checked'] = true
          this.selectedData[selectedChecklistIndex].groups.push(tempGroupData)
        } else {
          this.mainChecklistArray[checklistIndex].groups[groupIndex]['checked'] = false
          console.log('selectedGroupIndex', selectedGroupIndex)
          this.selectedData[selectedChecklistIndex].groups.splice(selectedGroupIndex, 1)
          console.log('length of groups', this.selectedData[selectedChecklistIndex])
          if (this.selectedData[selectedChecklistIndex].groups.length == 0) {
            this.mainChecklistArray[checklistIndex]['checked'] = false;
            this.selectedData.splice(selectedChecklistIndex, 1)
          }
        }
      }
    }
    console.log(this.selectedData)
  }

  onSelectCompositeChechlist(data, checklistIndex, groupData?, groupIndex?) {
    let tempGroupData;
    let tempData = JSON.parse(JSON.stringify(data));
    if (groupData) {
      tempGroupData = JSON.parse(JSON.stringify(groupData))
    }
    if (this.selectedData.length == 0) {
      this.mainChecklistArray[checklistIndex]['checked'] = true
      if (groupData) {
        this.selectedData.push(tempData)
        this.selectedData[0].groups = []
        this.mainChecklistArray[checklistIndex].groups[groupIndex]['checked'] = true
        tempGroupData['checked'] = true
        this.selectedData[0].groups.push(tempGroupData)
      } else {
        for (let index = 0; index < this.mainChecklistArray[checklistIndex].groups.length; index++) {
          this.mainChecklistArray[checklistIndex].groups[index]['checked'] = true;
          tempData.groups[index]['checked'] = true;
        }
        this.selectedData.push(tempData)
      }
    } else {
      let selectedChecklistIndex = this.selectedData.findIndex(el => (tempData.jobChecklistHeaderId == el.jobChecklistHeaderId))
      if (!groupData) {
        if (selectedChecklistIndex == -1) {
          this.mainChecklistArray[checklistIndex].checked = true
          for (let index = 0; index < this.mainChecklistArray[checklistIndex].groups.length; index++) {
            this.mainChecklistArray[checklistIndex].groups[index]['checked'] = true;
            tempData.groups[index]['checked'] = true;
          }
          this.selectedData.push(tempData)
        } else {
          this.mainChecklistArray[checklistIndex].checked = false
          for (let gindex = 0; gindex < this.mainChecklistArray[checklistIndex].groups.length; gindex++) {
            this.mainChecklistArray[checklistIndex].groups[gindex]['checked'] = false
          }
          this.selectedData.splice(selectedChecklistIndex, 1)
        }
      } else {
        if (selectedChecklistIndex == -1) {
          this.selectedData.push(tempData)
          let length = this.selectedData.length
          this.selectedData[length - 1].groups = []
          this.mainChecklistArray[checklistIndex]['checked'] = true
          selectedChecklistIndex = this.selectedData.findIndex(el => (tempData.jobChecklistHeaderId == el.jobChecklistHeaderId))
        }
        let selectedGroupIndex = this.selectedData[selectedChecklistIndex].groups.findIndex(el => (tempGroupData.jobChecklistGroupId == el.jobChecklistGroupId))
        if (selectedGroupIndex == -1) {
          this.mainChecklistArray[checklistIndex].groups[groupIndex]['checked'] = true
          this.selectedData[selectedChecklistIndex].groups.push(tempGroupData)
        } else {
          this.mainChecklistArray[checklistIndex].groups[groupIndex]['checked'] = false
          console.log('selectedGroupIndex', selectedGroupIndex)
          this.selectedData[selectedChecklistIndex].groups.splice(selectedGroupIndex, 1)
          console.log('length of groups', this.selectedData[selectedChecklistIndex])
          if (this.selectedData[selectedChecklistIndex].groups.length == 0) {
            this.mainChecklistArray[checklistIndex]['checked'] = false;
            this.selectedData.splice(selectedChecklistIndex, 1)
          }
        }
      }
    }
    console.log(this.selectedData)
  }

  payloadOfGeneral() {
    let tempData = JSON.parse(JSON.stringify(this.selectedData))
    for (let index = 0; index < tempData.length; index++) {
      const groups = tempData[index].groups;
      tempData[index].groups = groups.map(object => ({
        displayOrder1: object.displayOrder1,
        jobChecklistGroupId: object.jobChecklistGroupId,
      }));
      tempData[index].groups.sort((a, b) => a.displayOrder1 - b.displayOrder1)
    }
    tempData = tempData.map(object => ({
      displayOrder: object.displayOrder,
      jobChecklistHeaderId: object.jobChecklistHeaderId,
      lstExportChecklistGroup: object.groups
    }));
    tempData.sort((a, b) => a.displayOrder - b.displayOrder)
    let newData = {
      lstexportChecklist: tempData,
      Displayorder: 0,
      OrderFlag: 'Group',
      IncludeViolations: this.isViolation,
    }
    return newData
  }

  payloadOfComposite() {
    let tempData = JSON.parse(JSON.stringify(this.selectedData))
    for (let index = 0; index < tempData.length; index++) {
      const groups = tempData[index].groups;
      tempData[index].groups = groups.map(object => ({
        displayOrder1: object.displayOrder1,
        jobChecklistGroupId: object.jobChecklistGroupId,
      }));
      tempData[index].groups.sort((a, b) => a.displayOrder1 - b.displayOrder1)
    }
    tempData = tempData.map(object => ({
      displayOrder: object.displayOrder,
      jobChecklistHeaderId: object.jobChecklistHeaderId,
      Isparent: object.isParentCheckList,
      lstExportChecklistGroup: object.groups,
    }));
    tempData.sort((a, b) => a.displayOrder - b.displayOrder)
    let newData = {
      Displayorder: 0,
      OnlyTCOItems: this.onlyTCOItems,
      OrderFlag: 'Group',
      IncludeViolations: this.isViolation,
      IdCompositeChecklist: this.idCompositeChecklist.length > 0 ? this.idCompositeChecklist[0] : this.idCompositeChecklist,
      lstexportChecklist: tempData,
    }
    return newData
  }

  onExport() {
    let data;
    this.loading = true;
    if (this.checklistType == 'General') {
      data = this.payloadOfGeneral()
      console.log('this.exportFileType', this.exportFileType)
      if (this.exportFileType == 'xls') {
        console.log('data', data)
        this.jobCheckListServices.exportGeneralExcel(data).subscribe(r => {
          this.loading = false
          window.open(r[0].value, "_blank");
          this.toastr.success("Exported Successfully!");
        }, e => {
          this.loading = false
          console.log(e)
        })
      } else {
        console.log('exportGeneralPdf data', data)
        this.jobCheckListServices.exportGeneralPdf(data).subscribe(r => {
          console.log('Exported pdf res', r)
          this.loading = false
          window.open(r[0].value, "_blank");
          this.toastr.success("Exported Successfully!");
        }, e => {
          this.loading = false
          console.log(e)
        })
        // this.loading = false;
        // this.toastr.error("For now we don't have PDF export functionality!");
      }
    } else {
      data = this.payloadOfComposite()
      if (this.exportFileType == 'xls') {
        console.log('data', data)
        this.jobCheckListServices.exportCompositeExcel(data).subscribe(r => {
          this.loading = false
          window.open(r[0].value, "_blank");
          this.toastr.success("Exported Successfully!");
        }, e => {
          this.loading = false
          console.log(e)
        })
      } else {
        this.jobCheckListServices.exportCompositePdf(data).subscribe(r => {
          console.log('Exported pdf res', r)
          this.loading = false
          window.open(r[0].value, "_blank");
          this.toastr.success("Exported Successfully!");
        }, e => {
          this.loading = false
          console.log(e)
        })
        // this.loading = false;
        // this.toastr.error("For now we don't have PDF export functionality!");
      }
    }
    console.log('export payload', data)
  }

}