import { Component, OnInit } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';

import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Team } from '../dtos/team';
import { Bubble } from '../dtos/bubble';
import { TeamService } from '../services/team.service';
import { BubbleService } from '../services/bubble.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,

  imports: [
    FormsModule,
    ReactiveFormsModule,
    DecimalPipe,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    AsyncPipe
  ],

  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit {

  /* =====================================================
   DATA
  ===================================================== */

  bubbles: Bubble[] = [];
  filteredBubbles: Bubble[] = [];

  teams: Team[] = [];
  conferences: string[] = [];

  /* =====================================================
   STATISTICS
  ===================================================== */

  totalBubbles = 0;

  uniquePlayers = 0;

  mostPopularTeam: Team | null = null;

  mostPopularTeamPercentage = 0;

  averageBubbleSize = 0;

  maxVisibleTeams = 20;


  /* =====================================================
   FILTERS
  ===================================================== */

  searchTerm = '';

  selectedTeam: Team | null = null;

  selectedConference: string | null = null;

  selectedBubbleSize = 'all';

  sortBy = 'rank';

  /* =====================================================
   TEAM AUTOCOMPLETE
  ===================================================== */

  teamFilterControl =
    new FormControl<Team | null>(null);

  filteredTeams!: Observable<Team[]>;

  constructor(
    private teamService: TeamService,
    private bubbleService: BubbleService
  ) { }

  /* =====================================================
   INIT
  ===================================================== */

  ngOnInit(): void {

    this.loadTeams();

    this.loadBubbles();

    this.filteredTeams =
      this.teamFilterControl.valueChanges.pipe(
        startWith(null),
        map(value => {

          const search =
            typeof value === 'string'
              ? value
              : value?.schoolName ?? '';

          return this.filterTeams(search);
        })
      );

      this.updateVisibleTeamCount();

    window.addEventListener('resize', () => {
      this.updateVisibleTeamCount();
    });
  }

  /* =====================================================
   LOAD TEAMS
  ===================================================== */

  private loadTeams(): void {

    this.teamService.getTeams().subscribe({
      next: teams => {

        this.teams = teams;

        this.buildConferences();
      },

      error: err => {
        console.error(
          'Failed to load teams:',
          err
        );
      }
    });
  }

  /* =====================================================
   LOAD BUBBLES
  ===================================================== */

  private loadBubbles(): void {

    this.bubbleService.getBubbles().subscribe({
      next: bubbles => {

        this.bubbles = bubbles;

        console.log(
          'Bubbles:',
          this.bubbles
        );

        this.calculateStatistics();

        this.applyFilters();
      },

      error: err => {
        console.error(
          'Failed to load bubbles:',
          err
        );
      }
    });
  }

  /* =====================================================
   TEAM FILTERING
  ===================================================== */

  private filterTeams(
    value: string
  ): Team[] {

    const filterValue =
      value.toLowerCase();

    return this.teams.filter(team =>
      team.schoolName
        .toLowerCase()
        .includes(filterValue) ||

      team.abbreviation
        .toLowerCase()
        .includes(filterValue)
    );
  }

  displayTeam(
    team: Team | null
  ): string {

    return team
      ? team.schoolName
      : '';
  }

  onTeamFilterSelected(
    event: MatAutocompleteSelectedEvent
  ): void {

    this.selectedTeam =
      event.option.value as Team;

    this.applyFilters();
  }

  clearTeamFilter(): void {

    this.selectedTeam = null;

    this.teamFilterControl.setValue(null);

    this.applyFilters();
  }

  /* =====================================================
   SET DATA
  ===================================================== */

  setLeaderboardData(
    bubbles: Bubble[],
    teams: Team[]
  ): void {

    this.bubbles = bubbles;

    this.teams = teams;

    this.buildConferences();

    this.calculateStatistics();

    this.applyFilters();
  }

  /* =====================================================
   CONFERENCES
  ===================================================== */

  private buildConferences(): void {

    this.conferences = [
      ...new Set(
        this.teams
          .map(team =>
            team.conferenceName
          )
          .filter(Boolean)
      )
    ].sort();
  }

  isTeamInSelectedConference(team: Team): boolean {
    if (!this.selectedConference) {
      return true;
    }

    return team.conferenceName === this.selectedConference;
  }

  /* =====================================================
   STATISTICS
  ===================================================== */

  private calculateStatistics(): void {

    this.totalBubbles =
      this.bubbles.length;

    this.bubbleService
      .getUniqueUserCount()
      .subscribe({
        next: users => {
          this.uniquePlayers = users;
        },

        error: err => {
          console.error(
            'Failed to load unique user count:',
            err
          );
        }
      });

    /* Average bubble size */

    if (this.bubbles.length === 0) {

      this.averageBubbleSize = 0;

    } else {

      const totalTeams =
        this.bubbles.reduce(
          (total, bubble) =>
            total + bubble.teams.length,
          0
        );

      this.averageBubbleSize =
        totalTeams /
        this.bubbles.length;
    }

    this.calculateMostPopularTeam();
  }

  /* =====================================================
   MOST POPULAR TEAM
  ===================================================== */

  private calculateMostPopularTeam(): void {

    if (this.bubbles.length === 0) {

      this.mostPopularTeam = null;

      this.mostPopularTeamPercentage = 0;

      return;
    }

    const counts =
      new Map<number, number>();

    const teamMap =
      new Map<number, Team>();

    for (const bubble of this.bubbles) {

      const uniqueTeams =
        new Map<number, Team>();

      for (const team of bubble.teams) {

        uniqueTeams.set(
          team.espnId,
          team
        );
      }

      for (
        const [teamId, team]
        of uniqueTeams
      ) {

        counts.set(
          teamId,
          (counts.get(teamId) ?? 0) + 1
        );

        teamMap.set(
          teamId,
          team
        );
      }
    }

    let mostPopularId:
      number | null = null;

    let highestCount = 0;

    for (
      const [teamId, count]
      of counts
    ) {

      if (count > highestCount) {

        highestCount = count;

        mostPopularId = teamId;
      }
    }

    if (mostPopularId === null) {

      this.mostPopularTeam = null;

      this.mostPopularTeamPercentage = 0;

      return;
    }

    this.mostPopularTeam =
      teamMap.get(mostPopularId) ?? null;

    this.mostPopularTeamPercentage =
      Math.round(
        (
          highestCount /
          this.bubbles.length
        ) * 100
      );
  }

  /* =====================================================
   FILTERS
  ===================================================== */

  applyFilters(): void {

    let results =
      [...this.bubbles];

    /* Search */

    if (this.searchTerm.trim()) {

      const search =
        this.searchTerm
          .trim()
          .toLowerCase();

      results =
        results.filter(
          bubble =>
            bubble.name
              .toLowerCase()
              .includes(search)
        );
    }

    /* Team */

    if (this.selectedTeam) {

      results =
        results.filter(
          bubble =>
            bubble.teams.some(
              team =>
                team.espnId ===
                this.selectedTeam!.espnId
            )
        );
    }

    /* Conference */

    if (this.selectedConference) {

      results =
        results.filter(
          bubble =>
            bubble.teams.some(
              team =>
                team.conferenceName ===
                this.selectedConference
            )
        );
    }

    /* Bubble size */

    results =
      results.filter(
        bubble =>
          this.matchesBubbleSize(
            bubble.teams.length
          )
      );

    /* Sort */

    results.sort(
      (a, b) =>
        this.compareBubbles(a, b)
    );

    this.filteredBubbles =
      results;
  }

  /* =====================================================
   BUBBLE SIZE FILTER
  ===================================================== */

  private matchesBubbleSize(
    size: number
  ): boolean {

    switch (this.selectedBubbleSize) {

      case 'small':

        return (
          size >= 1 &&
          size <= 4
        );

      case 'medium':

        return (
          size >= 5 &&
          size <= 8
        );

      case 'large':

        return (
          size >= 9 &&
          size <= 12
        );

      case 'xlarge':

        return size >= 13;

      case 'all':

      default:

        return true;
    }
  }

  /* =====================================================
   SORT
  ===================================================== */

  private compareBubbles(
    a: Bubble,
    b: Bubble
  ): number {

    switch (this.sortBy) {

      case 'winPercentage':

        return (
          this.getWinPercentage(b) -
          this.getWinPercentage(a)
        );

      case 'record':

        return (
          this.getWinPercentage(b) - this.getWinPercentage(a) ||
          b.wins - a.wins ||
          b.teams.length - a.teams.length
        );

      case 'size':

        return (
          b.teams.length -
          a.teams.length
        );

      case 'alphabetical':

        return (
          a.name
            .toLowerCase()
            .localeCompare(
              b.name.toLowerCase()
            )
        );

      case 'rank':

      default:

        return 0;
    }
  }

  /* =====================================================
   WIN PERCENTAGE
  ===================================================== */

  getWinPercentage(bubble: Bubble): number {
    const totalGames = bubble.wins + bubble.losses;

    if (totalGames === 0) {
      return 0;
    }

    return (bubble.wins / totalGames) * 100;
  }

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedTeam = null;

    this.selectedConference = null;

    this.selectedBubbleSize = 'all';

    this.sortBy = 'rank';

    this.teamFilterControl.setValue(null);

    this.applyFilters();
  }

  private updateVisibleTeamCount(): void {
    const width = window.innerWidth;

    if (width >= 1400) {
      this.maxVisibleTeams = 20;
    } else if (width >= 1300) {
      this.maxVisibleTeams = 15;
    } else if (width >= 1100) {
      this.maxVisibleTeams = 10;
    } else if (width >= 1000) {
      this.maxVisibleTeams = 8;
    } else if (width >= 800) {
      this.maxVisibleTeams = 5;
    } else {
      this.maxVisibleTeams = 3;
    }
  }
}