import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageSentSuccessModalComponent } from './message-sent-success-modal.component';

describe('MessageSentSuccessModalComponent', () => {
  let component: MessageSentSuccessModalComponent;
  let fixture: ComponentFixture<MessageSentSuccessModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MessageSentSuccessModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageSentSuccessModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
