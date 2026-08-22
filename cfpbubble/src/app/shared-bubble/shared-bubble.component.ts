import {
  ChangeDetectionStrategy,
  Component,
  Input
} from '@angular/core';

import { Team } from '../dtos/team';

@Component({
  selector: 'app-share-bubble',
  standalone: true,
  templateUrl: './shared-bubble.component.html',
  styleUrl: './shared-bubble.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SharedBubbleComponent {

  @Input({ required: true })
  teams: Team[] = [];

  @Input()
  bubbleName = '';

  teamLogo(team: Team): string {
  return `team-logos/${team.espnId}.png`;
}

  get teamCountLabel(): string {
    return this.teams.length === 1
      ? 'TEAM'
      : 'TEAMS';
  }
}