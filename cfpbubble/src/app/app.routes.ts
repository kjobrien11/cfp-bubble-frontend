import { Routes } from '@angular/router';
import { BubbleComponent } from './bubble/bubble.component';
import { MyBubblesComponent } from './my-bubbles/my-bubbles.component';

export const routes: Routes = [
  { path: '', redirectTo: 'create', pathMatch: 'full' },
  { path: 'create', component: BubbleComponent },
//   { path: 'leaderboard', component: LeaderboardComponent },
//   { path: 'groups', component: GroupsComponent },
  { path: 'my-bubbles', component: MyBubblesComponent },
  { path: '**', redirectTo: 'create' }
];
