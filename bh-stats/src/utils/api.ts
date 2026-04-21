import type { Match } from '@models/match';
import type { Player } from '@models/player';
import type { Season } from '@models/season';
import type { Stadium } from '@models/stadium';
import type { Team } from '@models/team';
import { matches, players, seasons, stadiums, teams } from '@utils/mockData';

const state: {
  matches: Match[];
  players: Player[];
  seasons: Season[];
  stadiums: Stadium[];
  teams: Team[];
} = {
  matches: structuredClone(matches),
  players: structuredClone(players),
  seasons: structuredClone(seasons),
  stadiums: structuredClone(stadiums),
  teams: structuredClone(teams),
};

const clone = <T,>(value: T): T => structuredClone(value);

const sleep = async () => new Promise((resolve) => window.setTimeout(resolve, 80));

export const getPlayers = async (): Promise<Player[]> => {
  await sleep();
  return clone(state.players);
};

export const getPlayerById = async (playerId: string): Promise<Player | undefined> => {
  await sleep();
  return clone(state.players.find((player) => player.id === playerId));
};

export const getSeasons = async (): Promise<Season[]> => {
  await sleep();
  return clone(state.seasons);
};

export const getMatches = async (): Promise<Match[]> => {
  await sleep();
  return clone(state.matches);
};

export const getMatchById = async (matchId: string): Promise<Match | undefined> => {
  await sleep();
  return clone(state.matches.find((match) => match.id === matchId));
};

export const updateMatch = async (matchId: string, nextMatch: Match): Promise<Match> => {
  await sleep();

  const index = state.matches.findIndex((match) => match.id === matchId);
  if (index === -1) {
    throw new Error('Match not found');
  }

  state.matches[index] = clone(nextMatch);
  return clone(state.matches[index]);
};

export const getStadiums = async (): Promise<Stadium[]> => {
  await sleep();
  return clone(state.stadiums);
};

export const getTeams = async (): Promise<Team[]> => {
  await sleep();
  return clone(state.teams);
};
