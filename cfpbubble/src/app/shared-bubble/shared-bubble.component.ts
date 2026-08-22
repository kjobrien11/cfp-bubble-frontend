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

  readonly logoBaseUrl =
    'https://a.espncdn.com/i/teamlogos/ncaa/500/';

  get teamCountLabel(): string {
    return this.teams.length === 1
      ? 'TEAM'
      : 'TEAMS';
  }
}