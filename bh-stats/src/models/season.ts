export interface Season {
  id: string;
  year: string;
  team: string;
  leagueLevel: number;
  leagueName: string;
  position: number | null;
  covidInterrupted: boolean;
}
