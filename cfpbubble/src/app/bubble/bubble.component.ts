import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';

import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { TeamService } from '../services/team.service';
import { Team } from '../dtos/team';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BubbleService } from '../services/bubble.service';
import { BubbleRequest } from '../dtos/bubble-request';
import { FormsModule } from '@angular/forms';
import { BubbleVisualizerComponent } from '../bubble-visualizer/bubble-visualizer.component';

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
    FormsModule,
    BubbleVisualizerComponent
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

  submitSuccess = false;
  submitError = false;
  submitMessage = '';

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

    return this.teams
      .filter(team =>
        team.schoolName.toLowerCase().includes(filterValue) ||
        team.abbreviation.toLowerCase().includes(filterValue)
      )
      .slice(0, 3);
  }

  displayTeam(team: Team | null): string {
    return team ? team.schoolName : '';
  }

  onTeamSelected(event: MatAutocompleteSelectedEvent): void {
    const team = event.option.value as Team;

    if (
      this.selectedTeams.length < 20 &&
      !this.selectedTeams.some(t => t.espnId === team.espnId)
    ) {
      this.selectedTeams.unshift(team);
    }

    this.myControl.setValue(null);

    this.updateSearchState();
  }

  private updateSearchState(): void {
    if (this.selectedTeams.length >= 20) {
      this.myControl.disable();
    } else {
      this.myControl.enable();
    }
  }

  clear(): void {
    this.selectedTeams = [];
    this.updateSearchState();
  }

  submit(): void {
    this.submitSuccess = false;
    this.submitError = false;
    this.submitMessage = '';

    const request: BubbleRequest = {
      name: this.name.trim(),
      email: this.email.trim(),
      teams: this.selectedTeams.map(team => team.espnId)
    };

    this.bubbleService.createBubble(request)
      .subscribe({
        next: response => {
          console.log('Bubble created:', response);

          localStorage.setItem(
            'cfpBubbleEmail',
            this.email.trim()
          );

          this.submitSuccess = true;
          this.submitMessage = 'Your bubble was successfully locked in. Bubble ID: '+ response.publicId;
        },

        error: err => {
          console.log(err)
          console.error('Failed to create bubble:', err);

          this.submitError = true;
          if (err.status == 409) {
            this.submitMessage = 'You have reached the maximum number of bubbles.'
          }else{
            this.submitMessage = 'We could not save your bubble. Invalid field: ' + err.error[0].field;
          }

        }
      });
  }

  removeTeam(team: Team): void {
    this.selectedTeams = this.selectedTeams.filter(
      t => t.espnId !== team.espnId
    );

    this.updateSearchState();
  }
}