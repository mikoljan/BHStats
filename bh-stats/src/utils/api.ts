import type { Match } from '@models/match';
import type { Player } from '@models/player';
import type { Season } from '@models/season';
import type { Stadium } from '@models/stadium';
import type { Team } from '@models/team';
import type { TeamScope } from '@components/UI/ScopeTabs';
import type { GoalieStatLine, PlayerStatLine, SeasonHistoryRow } from '@utils/statistics';
import type { RecordBookSection } from '@utils/recordsBookData';
import type { TeamRecordSection } from '@utils/teamRecordsData';
import type { SeriesMatrix } from '@utils/seriesMatrix';

type QueryValue = string | number | boolean | null | undefined;

export interface GoalMilestone {
  milestone: number;
  date: string;
  opponent: string;
  scorerName: string;
}

export interface OverviewAggregate {
  matches: number;
  wins: number;
  overtimeWins: number;
  draws: number;
  overtimeLosses: number;
  losses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  powerPlayOpportunities: number;
  powerPlayGoals: number;
  powerPlayEfficiency: number;
  powerPlayGoalsAgainst: number;
  penaltyKillOpportunities: number;
  penaltyKillGoalsAgainst: number;
  penaltyKillEfficiency: number;
  shorthandedGoals: number;
}

export interface TeamRecordSummary {
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface OverviewResponse {
  scope: TeamScope;
  seasonId: string;
  summary: OverviewAggregate;
  teamRecordSummary?: TeamRecordSummary;
  seasonHistory: SeasonHistoryRow[];
  milestones: GoalMilestone[];
  topPlayers?: PlayerStatLine[];
}

export interface PlayerSeasonStatsRow {
  season: Season;
  matches: number;
  goals: number;
  assists: number;
  points: number;
  penaltyMinutes: number;
}

export interface PlayerMatchLogRow {
  match: Match;
  goals: number;
  assists: number;
  points: number;
  penaltyMinutes: number;
  scored: boolean;
}

export interface PlayerDetailResponse {
  player: Player;
  overallStats: PlayerStatLine;
  seasonRows: PlayerSeasonStatsRow[];
  matchLog: PlayerMatchLogRow[];
}

export interface RecordHeroStat {
  label: string;
  value: string;
  note: string;
}

export interface PlayerRecordBookResponse {
  scope: TeamScope;
  heroStats: RecordHeroStat[];
  sections: RecordBookSection[];
}

export interface TeamRecordBookResponse {
  scope: TeamScope;
  heroStats: RecordHeroStat[];
  sections: TeamRecordSection[];
}

export interface ImportMatchPayload {
  link: string;
  year: string;
  team: 'A' | 'B' | 'C';
}

export interface ImportMatchResponse {
  id: string;
}

export interface CreateSeasonPayload {
  year: string;
  team: 'A' | 'B' | 'C';
  leagueLevel: number;
  leagueName: string;
  position: number | null;
  movement: 'promotion' | 'relegation' | null;
  covidInterrupted: boolean;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:5000';

const normalizePath = (path: string) => (path.startsWith('/') ? path : `/${path}`);

const buildUrl = (path: string, query?: Record<string, QueryValue>) => {
  const normalizedPath = normalizePath(path);
  const basePath = API_BASE_URL.startsWith('http')
    ? `${API_BASE_URL}${normalizedPath}`
    : `${API_BASE_URL}${normalizedPath}`;
  const url = API_BASE_URL.startsWith('http')
    ? new URL(basePath)
    : new URL(basePath, window.location.origin);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
};

const fetchJson = async <T,>(path: string, init?: RequestInit, query?: Record<string, QueryValue>): Promise<T> => {
  const response = await fetch(buildUrl(path, query), {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
};

export const getPlayers = async (): Promise<Player[]> => {
  return fetchJson<Player[]>('/players');
};

export const getPlayerById = async (playerId: string): Promise<Player | undefined> => {
  try {
    return await fetchJson<Player>(`/players/${playerId}`);
  } catch {
    return undefined;
  }
};

export const getSeasons = async (): Promise<Season[]> => {
  return fetchJson<Season[]>('/seasons');
};

export const createSeason = async (payload: CreateSeasonPayload): Promise<Season> => {
  return fetchJson<Season>('/seasons', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getMatches = async (): Promise<Match[]> => {
  return fetchJson<Match[]>('/matches');
};

export const getMatchById = async (matchId: string): Promise<Match | undefined> => {
  try {
    return await fetchJson<Match>(`/matches/${matchId}`);
  } catch {
    return undefined;
  }
};

export const updateMatch = async (matchId: string, nextMatch: Match): Promise<Match> => {
  return fetchJson<Match>(`/matches/${matchId}`, {
    method: 'PUT',
    body: JSON.stringify(nextMatch),
  });
};

export const importMatchFromCeskyFlorbal = async (payload: ImportMatchPayload): Promise<ImportMatchResponse> => {
  return fetchJson<ImportMatchResponse>('/api/matches/import-cf', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getStadiums = async (): Promise<Stadium[]> => {
  return fetchJson<Stadium[]>('/stadiums');
};

export const getTeams = async (): Promise<Team[]> => {
  return fetchJson<Team[]>('/teams');
};

export const getOverview = async (scope: TeamScope, seasonId = 'ALL'): Promise<OverviewResponse> => {
  return fetchJson<OverviewResponse>('/overview', undefined, { scope, seasonId });
};

export const getPlayerStatistics = async (params: {
  scope: TeamScope;
  seasonId?: string;
  leagueName?: string;
  query?: string;
}): Promise<PlayerStatLine[]> => {
  return fetchJson<PlayerStatLine[]>('/statistics/players', undefined, params);
};

export const getGoalieStatistics = async (params: {
  scope: TeamScope;
  seasonId?: string;
  leagueName?: string;
  query?: string;
}): Promise<GoalieStatLine[]> => {
  return fetchJson<GoalieStatLine[]>('/statistics/goalies', undefined, params);
};

export const getPlayerDetailStats = async (playerId: string): Promise<PlayerDetailResponse | undefined> => {
  try {
    return await fetchJson<PlayerDetailResponse>(`/players/${playerId}/stats`);
  } catch {
    return undefined;
  }
};

export const getPlayerRecordBook = async (scope: TeamScope): Promise<PlayerRecordBookResponse> => {
  return fetchJson<PlayerRecordBookResponse>('/records/players', undefined, { scope });
};

export const getTeamRecordBook = async (scope: TeamScope): Promise<TeamRecordBookResponse> => {
  return fetchJson<TeamRecordBookResponse>('/records/teams', undefined, { scope });
};

export const getSeries = async (scope: 'A' | 'B' | 'C', query?: string): Promise<SeriesMatrix> => {
  return fetchJson<SeriesMatrix>('/series', undefined, { scope, query });
};
