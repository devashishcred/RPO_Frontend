import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddViolationComponent } from './add-violation.component';

describe('AddViolationComponent', () => {
  let component: AddViolationComponent;
  let fixture: ComponentFixture<AddViolationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddViolationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddViolationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
