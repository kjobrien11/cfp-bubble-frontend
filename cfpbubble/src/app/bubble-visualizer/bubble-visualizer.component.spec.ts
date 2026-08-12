import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BubbleVisualizerComponent } from './bubble-visualizer.component';

describe('BubbleVisualizerComponent', () => {
  let component: BubbleVisualizerComponent;
  let fixture: ComponentFixture<BubbleVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BubbleVisualizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BubbleVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
