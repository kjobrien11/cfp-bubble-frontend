import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HttpClient } from '@angular/common/http';
import { TeamService } from '../services/team.service';
import { Team } from '../dtos/Team';

@Component({
  selector: 'app-bubble',
  imports: [MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule],
  templateUrl: './bubble.component.html',
  styleUrl: './bubble.component.css'
})
export class BubbleComponent implements OnInit{

  teams!: Team[]

  constructor(private teamService: TeamService) {}
  ngOnInit(): void {
    this.teamService.getTeams()
      .subscribe({
        next: (teams) => {
          this.teams = teams;
          console.log(teams);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

}
