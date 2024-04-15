import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestNewProjectComponent } from './request-new-project.component';

describe('RequestNewProjectComponent', () => {
  let component: RequestNewProjectComponent;
  let fixture: ComponentFixture<RequestNewProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestNewProjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestNewProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
