import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistMasterGroupFormComponent } from './checklist-master-group-form.component';

describe('ChecklistMasterGroupFormComponent', () => {
  let component: ChecklistMasterGroupFormComponent;
  let fixture: ComponentFixture<ChecklistMasterGroupFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChecklistMasterGroupFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistMasterGroupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
