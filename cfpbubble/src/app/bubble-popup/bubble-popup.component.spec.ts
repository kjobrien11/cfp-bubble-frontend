import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BubblePopupComponent } from './bubble-popup.component';

describe('BubblePopupComponent', () => {
  let component: BubblePopupComponent;
  let fixture: ComponentFixture<BubblePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BubblePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BubblePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
