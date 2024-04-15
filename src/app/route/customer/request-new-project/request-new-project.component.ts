import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Message } from "../../../app.messages";

@Component({
  selector: "request-new-project",
  templateUrl: "./request-new-project.component.html",
  styleUrls: ["./request-new-project.component.scss"],
})
export class RequestNewProjectComponent implements OnInit {
  requestNewProjectForm: FormGroup;
  isSubmittedNewProject: boolean = false;
  errorMessage: {};
  constructor(
    public bsModalRef: BsModalRef,
    private bsModalService : BsModalService,
    private formBuilder: FormBuilder,
    private translateService: Message
  ) {
    this.errorMessage = this.translateService.msg;
  }

  ngOnInit(): void {
    this.setRequestNewProject();
  }

  setRequestNewProject(): void {
    this.requestNewProjectForm = this.formBuilder.group({
      projectName: ["", Validators.required],
      address: ["", Validators.required],
      projectDesc: ["", Validators.required],
    });
  }

  get requestNewProjectFormControl() {
    return this.requestNewProjectForm.controls;
  }

  saveRequestNewProjectDetail() {
    this.isSubmittedNewProject = true;
    if (this.requestNewProjectForm.invalid) {
      return;
    }
    this.bsModalRef.content= this.requestNewProjectForm.value;
    this.bsModalRef.hide()
  }
}
