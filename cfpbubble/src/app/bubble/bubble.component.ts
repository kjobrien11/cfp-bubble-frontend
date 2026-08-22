import {
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';

import { AsyncPipe } from '@angular/common';

import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

import {
  Observable,
  map,
  startWith
} from 'rxjs';

import { toPng } from 'html-to-image';

import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TeamService } from '../services/team.service';
import { Team } from '../dtos/team';

import { BubbleService } from '../services/bubble.service';
import { BubbleRequest } from '../dtos/bubble-request';

import { FormsModule } from '@angular/forms';
import { BubbleVisualizerComponent } from '../bubble-visualizer/bubble-visualizer.component';
import { SharedBubbleComponent } from '../shared-bubble/shared-bubble.component';
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
    BubbleVisualizerComponent,
    SharedBubbleComponent
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

  showSharePopup = false;

  submitSuccess = false;
  submitError = false;
  submitMessage = '';

  myControl = new FormControl<Team | null>(null);

  @ViewChild('shareCard')
  shareCard!: ElementRef<HTMLElement>;

  submittedBubbleId: string | null = null;

  shareMessage = '';

  constructor(
    private teamService: TeamService,
    private bubbleService: BubbleService
  ) {}

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

      error: err => {
        console.error('Failed to load teams:', err);
      }
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
      !this.selectedTeams.some(
        t => t.espnId === team.espnId
      )
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
    this.shareMessage = '';
    this.submittedBubbleId = null;

    const request: BubbleRequest = {
      name: this.name.trim(),
      email: this.email.trim(),
      teams: this.selectedTeams.map(team => team.espnId)
    };

    this.bubbleService.createBubble(request).subscribe({

      next: response => {
  console.log('Bubble created:', response);

  this.submittedBubbleId = response.publicId;

  localStorage.setItem(
    'cfpBubbleEmail',
    this.email.trim()
  );

  this.submitSuccess = true;

  this.submitMessage =
    'Your bubble was successfully locked in. Bubble ID: ' +
    response.publicId;

  this.showSharePopup = true;
},

      error: err => {
        console.error('Failed to create bubble:', err);

        this.submitError = true;

        if (err.status === 429) {

          this.submitMessage =
            'Too many attempts. Please wait a while and try again.';

        } else if (err.status === 409) {

          this.submitMessage =
            'You have reached the maximum number of bubbles.';

        } else {

          this.submitMessage =
            err.error?.[0]?.field
              ? 'We could not save your bubble. Invalid field: ' +
                err.error[0].field
              : 'We could not save your bubble. Please try again.';
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

  openSharePopup(): void {
    this.showSharePopup = true;
  }

  async shareBubble(): Promise<void> {

    try {

      const element = document.querySelector(
        '.share-preview'
      ) as HTMLElement;

      if (!element) {
        console.error('Share preview not found.');
        return;
      }

      const dataUrl = await toPng(
        element,
        {
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: 'transparent'
        }
      );

      const response = await fetch(dataUrl);

      const blob = await response.blob();

      const file = new File(
        [blob],
        'cfp-bubble.png',
        {
          type: 'image/png'
        }
      );

      const shareText =
        `Think you can build a better one?\n\n` +
        `Create your bubble: https://cfpbubble.com/create`;

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [file]
        })
      ) {

        await navigator.share({
          title: 'I just created my CFP Bubble!\n',
          text: shareText,
          files: [file]
        });

        return;
      }

      const downloadUrl =
        URL.createObjectURL(blob);

      const link =
        document.createElement('a');

      link.href = downloadUrl;

      link.download =
        'cfp-bubble.png';

      link.click();

      URL.revokeObjectURL(downloadUrl);

      this.shareMessage =
        'Image downloaded.';

    } catch (error) {

      console.error(
        'Failed to share bubble:',
        error
      );

      this.shareMessage =
        'Unable to share bubble.';
    }
  }

  async copyBubbleLink(): Promise<void> {

    if (!this.submittedBubbleId) {
      return;
    }

    const bubbleUrl =
      `https://cfpbubble.com/bubble/${this.submittedBubbleId}`;

    try {

      await navigator.clipboard.writeText(
        bubbleUrl
      );

      this.shareMessage =
        'Bubble link copied to clipboard.';

    } catch (error) {

      console.error(
        'Failed to copy bubble link:',
        error
      );

      this.shareMessage =
        'Unable to copy the bubble link.';
    }
  }

  closeSharePopup(): void {
  this.showSharePopup = false;
}
  makeAnotherBubble(): void {
  this.showSharePopup = false;

  this.selectedTeams = [];
  this.name = '';

  this.myControl.setValue(null);

  this.updateSearchState();

  this.submitSuccess = false;
  this.submitError = false;
  this.submitMessage = '';
  this.shareMessage = '';
  this.submittedBubbleId = null;
}
}