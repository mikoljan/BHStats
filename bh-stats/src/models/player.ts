export type PlayerPosition = 'goalie' | 'defender' | 'forward' | 'utility';
export type SquadId = 'A' | 'B' | 'C';

export interface Player {
  id: string;
  name: string;
  number: string;
  position: PlayerPosition;
  squads: SquadId[];
}
