import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Bubble } from '../dtos/bubble';
import { BubbleVisualizerComponent } from '../bubble-visualizer/bubble-visualizer.component';
import { AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-bubble-popup',
  standalone: true,
  imports: [
    MatIconModule,
    BubbleVisualizerComponent,
    DecimalPipe
  ],
  templateUrl: './bubble-popup.component.html',
  styleUrl: './bubble-popup.component.css'
})
export class BubblePopupComponent {

  @Input() bubble: Bubble | null = null;

  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }
}