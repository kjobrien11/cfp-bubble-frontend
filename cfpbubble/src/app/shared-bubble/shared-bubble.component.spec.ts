import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareBubbleComponent } from './shared-bubble.component';

describe('SharedBubbleComponent', () => {
  let component: SharedBubbleComponent;
  let fixture: ComponentFixture<SharedBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedBubbleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
