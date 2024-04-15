import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDocInChecklistComponent } from './upload-doc-in-checklist.component';

describe('UploadDocInChecklistComponent', () => {
  let component: UploadDocInChecklistComponent;
  let fixture: ComponentFixture<UploadDocInChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadDocInChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadDocInChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
