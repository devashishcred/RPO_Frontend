import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerteChecklistComponent } from './generte-checklist.component';

describe('GenerteChecklistComponent', () => {
  let component: GenerteChecklistComponent;
  let fixture: ComponentFixture<GenerteChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerteChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerteChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
