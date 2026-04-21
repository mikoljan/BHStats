export type PlayerPosition = 'goalie' | 'defender' | 'forward' | 'utility';

export interface Player {
  id: string;
  name: string;
  number: string;
  position: PlayerPosition;
}
