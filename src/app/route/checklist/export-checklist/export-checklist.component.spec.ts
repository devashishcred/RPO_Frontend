import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportChecklistComponent } from './export-checklist.component';

describe('ExportChecklistComponent', () => {
  let component: ExportChecklistComponent;
  let fixture: ComponentFixture<ExportChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExportChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
