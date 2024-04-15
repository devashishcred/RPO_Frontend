import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkGuidelineComponent } from './trademark-guideline.component';

describe('TrademarkGuidelineComponent', () => {
  let component: TrademarkGuidelineComponent;
  let fixture: ComponentFixture<TrademarkGuidelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrademarkGuidelineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrademarkGuidelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
