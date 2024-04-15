import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExternalChecklistComponent } from './add-external-checklist.component';

describe('AddExternalChecklistComponent', () => {
  let component: AddExternalChecklistComponent;
  let fixture: ComponentFixture<AddExternalChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddExternalChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddExternalChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
