import type { TeamScope } from '@components/UI/ScopeTabs';
import statsSource from '@/assets/stats.txt?raw';

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

const sectionMarkers: Record<SeriesScope, string> = {
  A: '// ------------------- A-Série -------------------',
  B: '// ------------------- B-Série -------------------',
  C: '// ------------------- C-Série -------------------',
};

const otherBoundaries = [
  '// ------------------- Rekordy C -------------------',
  '// ------------------- Týmové rekordy A -------------------',
];

const toCellState = (value: string): SeriesCellState => {
  if (value === 'X') {
    return 'absent';
  }

  if (value === 'G') {
    return 'goal';
  }

  if (value) {
    return 'point';
  }

  return 'played';
};

const createRowId = (scope: SeriesScope, playerName: string) =>
  `${scope}-${playerName.toLocaleLowerCase('cs').replace(/\s+/g, '-')}`;

const getSectionBlock = (scope: SeriesScope) => {
  const marker = sectionMarkers[scope];
  const start = statsSource.indexOf(marker);

  if (start === -1) {
    return '';
  }

  const boundaries = [...Object.values(sectionMarkers), ...otherBoundaries]
    .map((candidate) => statsSource.indexOf(candidate, start + marker.length))
    .filter((index) => index !== -1);

  const end = boundaries.length > 0 ? Math.min(...boundaries) : statsSource.length;
  return statsSource.slice(start, end);
};

const getSeasonGroups = (cells: string[], columnCount: number) => {
  const seasonStarts = cells
    .map((cell, index) => ({ label: cell.trim(), index }))
    .filter((cell) => cell.label);

  return seasonStarts.map((season, index) => {
    const nextStart = seasonStarts[index + 1]?.index ?? columnCount + 1;

    return {
      label: season.label,
      startIndex: season.index - 1,
      span: nextStart - season.index,
    };
  });
};

export const parseSeriesMatrix = (scope: SeriesScope): SeriesMatrix | undefined => {
  const block = getSectionBlock(scope);
  const rawLines = block.split(/\r?\n/);
  const matrixEndIndex = rawLines.findIndex((line) => line.trim() === 'Série');
  const relevantLines = (matrixEndIndex === -1 ? rawLines : rawLines.slice(0, matrixEndIndex))
    .map((line) => line.replace(/\r/g, ''))
    .filter((line) => line.trim());

  if (relevantLines.length < 3) {
    return undefined;
  }

  const seasonLine = relevantLines[1].split('\t');
  const dateLine = relevantLines[2].split('\t');
  const columnCount = Math.max(dateLine.length - 1, 0);

  if (columnCount === 0) {
    return undefined;
  }

  const seasons = getSeasonGroups(seasonLine, columnCount);
  const columns = Array.from({ length: columnCount }, (_, index) => {
    const season = seasons.find(
      (group) => index >= group.startIndex && index < group.startIndex + group.span,
    )?.label;

    return {
      index,
      season: season ?? 'Neznámá sezóna',
      date: dateLine[index + 1]?.trim() || '—',
    };
  });

  const rows = relevantLines
    .slice(3)
    .map((line) => {
      const cells = line.split('\t').map((cell) => cell.trim());
      const playerName = cells.find((cell) => cell);

      if (!playerName) {
        return undefined;
      }

      const statuses = columns.map((_, index) => toCellState(cells[index + 1] ?? ''));
      const goals = statuses.filter((cell) => cell === 'goal').length;
      const absences = statuses.filter((cell) => cell === 'absent').length;

      return {
        id: createRowId(scope, playerName),
        playerName,
        cells: statuses,
        goals,
        absences,
      } satisfies SeriesPlayerRow;
    })
    .filter((row): row is SeriesPlayerRow => Boolean(row));

  const goalMarks = rows.reduce((total, row) => total + row.goals, 0);
  const absentMarks = rows.reduce((total, row) => total + row.absences, 0);
  const pointMarks = rows.reduce(
    (total, row) => total + row.cells.filter((cell) => cell === 'point').length,
    0,
  );

  return {
    scope,
    seasons,
    columns,
    rows,
    totalMatches: columns.length,
    goalMarks,
    pointMarks,
    absentMarks,
    hasExplicitPointMarks: pointMarks > 0,
  };
};

export const seriesMatrices: Partial<Record<SeriesScope, SeriesMatrix>> = {
  A: parseSeriesMatrix('A'),
  B: parseSeriesMatrix('B'),
  C: parseSeriesMatrix('C'),
};