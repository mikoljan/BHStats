import type { Match, MatchResult } from '@models/match';
import type { Player, PlayerPosition } from '@models/player';
import type { Season } from '@models/season';

export interface PlayerStatLine {
  player: Player;
  matches: number;
  goals: number;
  assists: number;
  points: number;
  penaltyMinutes: number;
  goalieMinutes: number;
}

export interface PlayerMatchLog {
  match: Match;
  goals: number;
  assists: number;
  points: number;
  penaltyMinutes: number;
}

export interface SeasonHistoryRow {
  season: Season;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export const positionLabel: Record<PlayerPosition, string> = {
  goalie: 'Brankář',
  defender: 'Obránce',
  forward: 'Útočník',
  utility: 'Univerzál',
};

export const resultLabel: Record<MatchResult, string> = {
  W: 'Výhra',
  D: 'Remíza',
  L: 'Prohra',
};

export const getPlayerStats = (players: Player[], matches: Match[]): PlayerStatLine[] => {
  const statMap = new Map<string, PlayerStatLine>(
    players.map((player) => [
      player.id,
      {
        player,
        matches: 0,
        goals: 0,
        assists: 0,
        points: 0,
        penaltyMinutes: 0,
        goalieMinutes: 0,
      },
    ]),
  );

  matches.forEach((match) => {
    match.presentPlayerIds.forEach((playerId) => {
      const entry = statMap.get(playerId);
      if (entry) {
        entry.matches += 1;
      }
    });

    match.goals.forEach((goal) => {
      if (!goal.ourTeam) {
        return;
      }

      if (goal.scorerId) {
        const scorer = statMap.get(goal.scorerId);
        if (scorer) {
          scorer.goals += 1;
          scorer.points += 1;
        }
      }

      if (goal.assistId) {
        const assister = statMap.get(goal.assistId);
        if (assister) {
          assister.assists += 1;
          assister.points += 1;
        }
      }
    });

    match.penalties.forEach((penalty) => {
      if (!penalty.ourTeam || !penalty.playerId) {
        return;
      }

      const player = statMap.get(penalty.playerId);
      if (player) {
        player.penaltyMinutes += penalty.penaltyMinutes;
      }
    });

    match.goalieMinutes.forEach((goalieShift) => {
      const goalie = statMap.get(goalieShift.playerId);
      if (goalie) {
        goalie.goalieMinutes += goalieShift.minutesPlayed;
      }
    });
  });

  return Array.from(statMap.values()).sort((left, right) => {
    if (right.points !== left.points) {
      return right.points - left.points;
    }

    if (right.goals !== left.goals) {
      return right.goals - left.goals;
    }

    return left.player.name.localeCompare(right.player.name, 'cs');
  });
};

export const getSeasonHistory = (seasons: Season[], matches: Match[]): SeasonHistoryRow[] => {
  return seasons
    .map((season) => {
      const seasonMatches = matches.filter((match) => match.seasonId === season.id);
      const wins = seasonMatches.filter((match) => match.result === 'W').length;
      const draws = seasonMatches.filter((match) => match.result === 'D').length;
      const losses = seasonMatches.filter((match) => match.result === 'L').length;
      const goalsFor = seasonMatches.reduce((total, match) => total + match.ourScore, 0);
      const goalsAgainst = seasonMatches.reduce((total, match) => total + match.opponentScore, 0);

      return {
        season,
        matches: seasonMatches.length,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        points: wins * 3 + draws,
      };
    })
    .sort((left, right) => right.season.year.localeCompare(left.season.year, 'cs'));
};

export const getPlayerMatchLog = (playerId: string, matches: Match[]): PlayerMatchLog[] => {
  return matches
    .filter((match) => match.presentPlayerIds.includes(playerId))
    .map((match) => {
      const goals = match.goals.filter((goal) => goal.ourTeam && goal.scorerId === playerId).length;
      const assists = match.goals.filter((goal) => goal.ourTeam && goal.assistId === playerId).length;
      const penaltyMinutes = match.penalties
        .filter((penalty) => penalty.ourTeam && penalty.playerId === playerId)
        .reduce((total, penalty) => total + penalty.penaltyMinutes, 0);

      return {
        match,
        goals,
        assists,
        points: goals + assists,
        penaltyMinutes,
      };
    })
    .sort((left, right) => right.match.date.localeCompare(left.match.date));
};

export const getPlayerSeasonRows = (playerId: string, seasons: Season[], matches: Match[]) => {
  return seasons
    .map((season) => {
      const matchLog = getPlayerMatchLog(
        playerId,
        matches.filter((match) => match.seasonId === season.id),
      );

      return {
        season,
        matches: matchLog.length,
        goals: matchLog.reduce((total, row) => total + row.goals, 0),
        assists: matchLog.reduce((total, row) => total + row.assists, 0),
        points: matchLog.reduce((total, row) => total + row.points, 0),
        penaltyMinutes: matchLog.reduce((total, row) => total + row.penaltyMinutes, 0),
      };
    })
    .filter((row) => row.matches > 0)
    .sort((left, right) => right.season.year.localeCompare(left.season.year, 'cs'));
};

export const getTeamRecordSummary = (matches: Match[]) => {
  const goalsFor = matches.reduce((total, match) => total + match.ourScore, 0);
  const goalsAgainst = matches.reduce((total, match) => total + match.opponentScore, 0);
  const wins = matches.filter((match) => match.result === 'W').length;
  const draws = matches.filter((match) => match.result === 'D').length;
  const losses = matches.filter((match) => match.result === 'L').length;

  return {
    matches: matches.length,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    points: wins * 3 + draws,
  };
};

export const getBestResult = (matches: Match[]) => {
  return [...matches].sort((left, right) => {
    const leftDiff = left.ourScore - left.opponentScore;
    const rightDiff = right.ourScore - right.opponentScore;
    return rightDiff - leftDiff;
  })[0];
};