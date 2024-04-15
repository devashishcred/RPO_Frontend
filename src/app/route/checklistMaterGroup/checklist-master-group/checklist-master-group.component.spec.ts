import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistMasterGroupComponent } from './checklist-master-group.component';

describe('ChecklistMasterGroupComponent', () => {
  let component: ChecklistMasterGroupComponent;
  let fixture: ComponentFixture<ChecklistMasterGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChecklistMasterGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistMasterGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
