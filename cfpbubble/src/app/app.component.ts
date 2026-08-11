import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BubbleComponent } from './bubble/bubble.component';
import { NavigationComponent } from './navigation/navigation.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BubbleComponent, NavigationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'cfpbubble';
}
