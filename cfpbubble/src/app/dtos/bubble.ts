import { Team } from "./team";

export interface Bubble {
  publicId: string;
  name: string;
  season: number;
  submissionTime: string;
  teams: Team[];
  wins: number;
  losses: number;
}