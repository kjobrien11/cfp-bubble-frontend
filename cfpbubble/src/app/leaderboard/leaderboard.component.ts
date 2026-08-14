import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Team } from '../dtos/team';



export interface LeaderboardBubble {

  id: string;

  name: string;

  teams: Team[];

  wins: number;

  losses: number;

}


@Component({
  selector: 'app-leaderboard',

  standalone: true,

  imports: [
    FormsModule,
    DecimalPipe,

    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],

  templateUrl: './leaderboard.component.html',

  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent
  implements OnInit {


  /* =====================================================
     DATA
     ===================================================== */

  bubbles: LeaderboardBubble[] = [];

  filteredBubbles: LeaderboardBubble[] = [];

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


  /* =====================================================
     FILTERS
     ===================================================== */

  searchTerm = '';

  selectedTeam: Team | null = null;

  selectedConference: string | null = null;

  selectedBubbleSize = 'all';

  sortBy = 'rank';


  /* =====================================================
     INIT
     ===================================================== */

  ngOnInit(): void {

    /*
     * Your API call will eventually go here.
     *
     * Example:
     *
     * this.leaderboardService
     *   .getLeaderboard()
     *   .subscribe(data => {
     *      this.setLeaderboardData(
     *        data.bubbles,
     *        data.teams
     *      );
     *   });
     */

    this.applyFilters();

  }


  /* =====================================================
     SET DATA
     ===================================================== */

  setLeaderboardData(
    bubbles: LeaderboardBubble[],
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
          .map(team => team.conferenceName)
          .filter(Boolean)
      )
    ].sort();

  }


  /* =====================================================
     STATISTICS
     ===================================================== */

  private calculateStatistics(): void {

    this.totalBubbles =
      this.bubbles.length;


    /*
     * Replace this with the value from your
     * backend once your endpoint provides it.
     */

    this.uniquePlayers = 0;


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


    for (const bubble of this.bubbles) {

      const uniqueTeamIds =
        new Set(
          bubble.teams.map(
            team => team.espnId
          )
        );


      for (const teamId of uniqueTeamIds) {

        counts.set(
          teamId,
          (counts.get(teamId) ?? 0) + 1
        );

      }

    }


    let mostPopularId: number | null = null;

    let highestCount = 0;


    for (const [teamId, count] of counts) {

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
      this.teams.find(
        team =>
          team.espnId === mostPopularId
      ) ?? null;


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


    /*
     * Since there is no pagination,
     * the entire filtered dataset is
     * displayed.
     */

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
    a: LeaderboardBubble,
    b: LeaderboardBubble
  ): number {

    switch (this.sortBy) {


      case 'winPercentage':

        return (
          this.getWinPercentage(b) -
          this.getWinPercentage(a)
        );


      case 'record':

        return (
          b.wins -
          a.wins
        );


      case 'size':

        /*
         * Smaller bubbles rank higher.
         */

        return (
          a.teams.length -
          b.teams.length
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

        /*
         * Preserve the ranking supplied
         * by the backend.
         */

        return 0;

    }

  }


  /* =====================================================
     WIN PERCENTAGE
     ===================================================== */

  getWinPercentage(
    bubble: LeaderboardBubble
  ): number {

    const totalGames =
      bubble.wins +
      bubble.losses;


    if (totalGames === 0) {

      return 0;

    }


    return (
      bubble.wins /
      totalGames
    ) * 100;

  }

}