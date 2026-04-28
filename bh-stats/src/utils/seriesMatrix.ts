import type { TeamScope } from '@components/UI/ScopeTabs';

export type SeriesScope = Exclude<TeamScope, 'ALL'>;
export type SeriesCellState = 'absent' | 'played' | 'point' | 'goal';

export interface SeriesSeasonGroup {
  label: string;
  startIndex: number;
  span: number;
}

export interface SeriesColumn {
  index: number;
  season: string;
  date: string;
}

export interface SeriesPlayerRow {
  id: string;
  playerName: string;
  cells: SeriesCellState[];
  goals: number;
  absences: number;
}

export interface SeriesMatrix {
  scope: SeriesScope;
  seasons: SeriesSeasonGroup[];
  columns: SeriesColumn[];
  rows: SeriesPlayerRow[];
  totalMatches: number;
  goalMarks: number;
  pointMarks: number;
  absentMarks: number;
  hasExplicitPointMarks: boolean;
}