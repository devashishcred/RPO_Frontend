import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChecklistProgressNoteComponent } from './add-checklist-progress-note.component';

describe('AddChecklistProgressNoteComponent', () => {
  let component: AddChecklistProgressNoteComponent;
  let fixture: ComponentFixture<AddChecklistProgressNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddChecklistProgressNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddChecklistProgressNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
