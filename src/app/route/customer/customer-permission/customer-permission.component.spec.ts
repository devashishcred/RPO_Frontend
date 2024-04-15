import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPermissionComponent } from './customer-permission.component';

describe('CustomerPermissionComponent', () => {
  let component: CustomerPermissionComponent;
  let fixture: ComponentFixture<CustomerPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerPermissionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
