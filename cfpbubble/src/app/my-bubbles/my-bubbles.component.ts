import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BubbleService } from '../services/bubble.service';
import { TeamService } from '../services/team.service';
import { BubbleVisualizerComponent } from '../bubble-visualizer/bubble-visualizer.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-my-bubbles',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    RouterModule,
    BubbleVisualizerComponent,
    DatePipe
  ],
  templateUrl: './my-bubbles.component.html',
  styleUrl: './my-bubbles.component.css'
})
export class MyBubblesComponent implements OnInit {

  searchEmail = '';
  bubbles: any[] = []

  constructor(private teamService: TeamService, private bubbleService: BubbleService) { }

  ngOnInit(): void {
    const savedEmail = localStorage.getItem('cfpBubbleEmail');

    if (savedEmail) {
      this.searchEmail = savedEmail;
      this.searchBubbles();
    }
  }

  searchBubbles(): void {

    const email = this.searchEmail.trim();

    if (!email) {
      return;
    }
     this.bubbleService
     .getBubblesByEmail(email)
      .subscribe(bubbles => {this.bubbles = bubbles; console.log(this.bubbles)});

    console.log('Searching for bubbles:', email);
  }

}