export type MatchResult = 'W' | 'L' | 'D';

export interface GoalieMinutes {
  playerId: string;
  minutesPlayed: number;
}

export interface Goal {
  id: string;
  type: string;
  time: number;
  scorerId: string | null;
  assistId: string | null;
  goalieId: string | null;
  matchId: string;
  ourTeam: boolean;
  winningGoal: boolean;
  equalizingGoal: boolean;
}

export interface Penalty {
  id: string;
  type: string;
  time: number;
  penaltyMinutes: number;
  playerId: string | null;
  matchId: string;
  ourTeam: boolean;
}

export interface Match {
  id: string;
  squad: 'A' | 'B' | 'C';
  stadiumId: string | null;
  date: string;
  opponent: string;
  seasonId: string;
  homeGame: boolean;
  matchLength: number;
  ourScore: number;
  opponentScore: number;
  result: MatchResult;
  presentPlayerIds: string[];
  goalieMinutes: GoalieMinutes[];
  goals: Goal[];
  penalties: Penalty[];
}
