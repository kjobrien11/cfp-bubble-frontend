import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BubbleComponent } from './bubble/bubble.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BubbleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'cfpbubble';
}
