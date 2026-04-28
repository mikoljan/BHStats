export type SeasonMovement = 'promotion' | 'relegation' | null;

export interface Season {
  id: string;
  year: string;
  team: string;
  leagueLevel: number;
  leagueName: string;
  position: number | null;
  movement: SeasonMovement;
  covidInterrupted: boolean;
}
