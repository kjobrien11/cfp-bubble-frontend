import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';

import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { TeamService } from '../services/team.service';
import { Team } from '../dtos/Team';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BubbleService } from '../services/bubble.service';
import { BubbleRequest } from '../dtos/bubble-request';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bubble',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatButtonModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './bubble.component.html',
  styleUrl: './bubble.component.css'
})
export class BubbleComponent implements OnInit {

  teams: Team[] = [];
  filteredTeams!: Observable<Team[]>;
  selectedTeams: Team[] = [];
  name = '';
  email = '';

  myControl = new FormControl<Team | null>(null);

  constructor(private teamService: TeamService, private bubbleService: BubbleService) { }

  ngOnInit(): void {
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams;

        this.filteredTeams = this.myControl.valueChanges.pipe(
          startWith(null),
          map(value => {
            const search =
              typeof value === 'string'
                ? value
                : value?.schoolName ?? '';

            return this.filterTeams(search);
          })
        );
      },
      error: err => console.error(err)
    });
  }

  private filterTeams(value: string): Team[] {
    const filterValue = value.toLowerCase();

    return this.teams.filter(team =>
      team.schoolName.toLowerCase().includes(filterValue) ||
      team.abbreviation.toLowerCase().includes(filterValue)
    );
  }

  displayTeam(team: Team | null): string {
    return team ? team.schoolName : '';
  }

  onTeamSelected(event: MatAutocompleteSelectedEvent): void {
    const team = event.option.value as Team;

    // Prevent duplicates
    if (!this.selectedTeams.some(t => t.espnId === team.espnId)) {
      this.selectedTeams.push(team);
    }

    console.log(this.selectedTeams);

    // Clear the search box
    this.myControl.setValue(null);
  }

  clear(): void{
    this.selectedTeams = [];
  }

  submit() {
    const request: BubbleRequest = {
      name: this.name,
      email: this.email,
      teams: this.selectedTeams.map(team => team.espnId)
    };

    this.bubbleService.createBubble(request)
      .subscribe({
        next: response => {
          console.log(response);
        },
        error: err => {
          console.error(err);
        }
      });
  }

  removeTeam(team: Team) {
  this.selectedTeams = this.selectedTeams.filter(
    t => t.espnId !== team.espnId
  );
}
}