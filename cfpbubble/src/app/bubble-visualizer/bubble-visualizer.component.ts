import { Component, Input } from '@angular/core';
import { Team } from '../dtos/team';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-bubble-visualizer',
  imports: [MatIcon],
  templateUrl: './bubble-visualizer.component.html',
  styleUrl: './bubble-visualizer.component.css'
})
export class BubbleVisualizerComponent {

  @Input() teams: any[] = [];

}
