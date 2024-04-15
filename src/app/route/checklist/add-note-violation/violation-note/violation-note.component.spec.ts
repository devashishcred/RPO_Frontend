import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationNoteComponent } from './violation-note.component';

describe('ViolationNoteComponent', () => {
  let component: ViolationNoteComponent;
  let fixture: ComponentFixture<ViolationNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViolationNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViolationNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
