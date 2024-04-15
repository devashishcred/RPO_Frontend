import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewChecklistDocComponent } from './view-checklist-doc.component';

describe('ViewChecklistDocComponent', () => {
  let component: ViewChecklistDocComponent;
  let fixture: ComponentFixture<ViewChecklistDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewChecklistDocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewChecklistDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
