import type { Match, MatchResult } from '@models/match';
import type { Player, PlayerPosition, SquadId } from '@models/player';
import type { Season } from '@models/season';
import type { TeamScope } from '@components/UI/ScopeTabs';

export interface PlayerStatLine {
  player: Player;
  matches: number;
  goals: number;
  assists: number;
  points: number;
  penaltyMinutes: number;
  goalieMinutes: number;
  pointsPerGame: number;
  powerPlayGoals: number;
  shorthandedGoals: number;
  gameWinningGoals: number;
  gameTyingGoals: number;
  penaltyShotGoals: number;
  emptyNetGoals: number;
}

export interface GoalieStatLine {
  player: Player;
  matches: number;
  wins: number;
  cleanSheets: number;
  minutes: number;
  goalsAgainst: number;
  goalsAgainstPerGame: number;
  assists: number;
  shootouts: number;
  shootoutGoalsAgainst: number;
  shootoutSavePercentage: number | null;
}

export interface PlayerMatchLog {
  match: Match;
  goals: number;
  assists: number;
  points: number;
  penaltyMinutes: number;
  scored: boolean;
}

export interface RecordEntry {
  playerId: string;
  playerName: string;
  value: number;
  from: string;
  to: string;
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

export const scopeLabel: Record<TeamScope, string> = {
  A: 'A',
  B: 'B',
  C: 'C',
  ALL: 'A+B+C',
};

export const filterPlayersByScope = (players: Player[], scope: TeamScope) => {
  if (scope === 'ALL') {
    return players;
  }

  return players.filter((player) => player.squads.includes(scope as SquadId));
};

export const filterMatchesByScope = (matches: Match[], scope: TeamScope) => {
  if (scope === 'ALL') {
    return matches;
  }

  return matches.filter((match) => match.squad === scope);
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
        pointsPerGame: 0,
        powerPlayGoals: 0,
        shorthandedGoals: 0,
        gameWinningGoals: 0,
        gameTyingGoals: 0,
        penaltyShotGoals: 0,
        emptyNetGoals: 0,
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
          if (goal.type === 'power play') {
            scorer.powerPlayGoals += 1;
          }
          if (goal.type === 'shorthanded') {
            scorer.shorthandedGoals += 1;
          }
          if (goal.type === 'penalty shot') {
            scorer.penaltyShotGoals += 1;
          }
          if (goal.type === 'empty net') {
            scorer.emptyNetGoals += 1;
          }
          if (goal.winningGoal) {
            scorer.gameWinningGoals += 1;
          }
          if (goal.equalizingGoal) {
            scorer.gameTyingGoals += 1;
          }
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

  statMap.forEach((entry) => {
    entry.pointsPerGame = entry.matches > 0 ? Number((entry.points / entry.matches).toFixed(2)) : 0;
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
        scored: goals + assists > 0,
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

export const getGoalMilestones = (matches: Match[]) => {
  const sortedMatches = [...matches].sort((left, right) => left.date.localeCompare(right.date));
  const milestones = [1, 5, 10, 15, 20];
  const reached: Array<{ milestone: number; date: string; opponent: string; scorerName: string }> = [];
  let totalGoals = 0;

  sortedMatches.forEach((match) => {
    match.goals
      .filter((goal) => goal.ourTeam)
      .sort((left, right) => left.time - right.time)
      .forEach((goal) => {
        totalGoals += 1;
        if (milestones.includes(totalGoals)) {
          reached.push({
            milestone: totalGoals,
            date: match.date,
            opponent: match.opponent,
            scorerName: goal.scorerId ?? 'Neuvedený střelec',
          });
        }
      });
  });

  return reached;
};

export const getTopPointStreaks = (players: Player[], matches: Match[]): RecordEntry[] => {
  const logsByPlayer = players.map((player) => {
    const logs = getPlayerMatchLog(player.id, matches)
      .slice()
      .sort((left, right) => left.match.date.localeCompare(right.match.date));

    let bestLength = 0;
    let currentLength = 0;
    let bestFrom = '';
    let bestTo = '';
    let currentFrom = '';

    logs.forEach((entry) => {
      if (entry.scored) {
        currentLength += 1;
        if (!currentFrom) {
          currentFrom = entry.match.date;
        }
        if (currentLength > bestLength) {
          bestLength = currentLength;
          bestFrom = currentFrom;
          bestTo = entry.match.date;
        }
      } else {
        currentLength = 0;
        currentFrom = '';
      }
    });

    return {
      playerId: player.id,
      playerName: player.name,
      value: bestLength,
      from: bestFrom,
      to: bestTo,
    };
  });

  return logsByPlayer.filter((entry) => entry.value > 0).sort((left, right) => right.value - left.value).slice(0, 8);
};

export const getTopGoalStreaks = (players: Player[], matches: Match[]): RecordEntry[] => {
  const logsByPlayer = players.map((player) => {
    const logs = getPlayerMatchLog(player.id, matches)
      .slice()
      .sort((left, right) => left.match.date.localeCompare(right.match.date));

    let bestLength = 0;
    let currentLength = 0;
    let bestFrom = '';
    let bestTo = '';
    let currentFrom = '';

    logs.forEach((entry) => {
      if (entry.goals > 0) {
        currentLength += 1;
        if (!currentFrom) {
          currentFrom = entry.match.date;
        }
        if (currentLength > bestLength) {
          bestLength = currentLength;
          bestFrom = currentFrom;
          bestTo = entry.match.date;
        }
      } else {
        currentLength = 0;
        currentFrom = '';
      }
    });

    return {
      playerId: player.id,
      playerName: player.name,
      value: bestLength,
      from: bestFrom,
      to: bestTo,
    };
  });

  return logsByPlayer.filter((entry) => entry.value > 0).sort((left, right) => right.value - left.value).slice(0, 8);
};

export const getGoalieStats = (players: Player[], matches: Match[]): GoalieStatLine[] => {
  const statMap = new Map<string, GoalieStatLine>();

  const ensureEntry = (playerId: string) => {
    const existing = statMap.get(playerId);
    if (existing) {
      return existing;
    }

    const player = players.find((candidate) => candidate.id === playerId);
    if (!player) {
      return undefined;
    }

    const entry: GoalieStatLine = {
      player,
      matches: 0,
      wins: 0,
      cleanSheets: 0,
      minutes: 0,
      goalsAgainst: 0,
      goalsAgainstPerGame: 0,
      assists: 0,
      shootouts: 0,
      shootoutGoalsAgainst: 0,
      shootoutSavePercentage: null,
    };

    statMap.set(playerId, entry);
    return entry;
  };

  matches.forEach((match) => {
    const totalGoalieMinutes = match.goalieMinutes.reduce((total, goalieShift) => total + goalieShift.minutesPlayed, 0);

    match.goalieMinutes.forEach((goalieShift) => {
      const goalie = ensureEntry(goalieShift.playerId);
      if (!goalie) {
        return;
      }

      goalie.matches += 1;
      goalie.minutes += goalieShift.minutesPlayed;

      if (match.result === 'W') {
        goalie.wins += 1;
      }

      if (match.opponentScore === 0) {
        goalie.cleanSheets += 1;
      }

      const concededShare = totalGoalieMinutes > 0 ? (goalieShift.minutesPlayed / totalGoalieMinutes) * match.opponentScore : 0;
      goalie.goalsAgainst += concededShare;
    });

    match.goals.forEach((goal) => {
      if (!goal.ourTeam || !goal.assistId) {
        return;
      }

      const goalie = statMap.get(goal.assistId);
      if (goalie) {
        goalie.assists += 1;
      }
    });
  });

  statMap.forEach((entry) => {
    entry.goalsAgainst = Number(entry.goalsAgainst.toFixed(2));
    entry.goalsAgainstPerGame = entry.matches > 0 ? Number((entry.goalsAgainst / entry.matches).toFixed(2)) : 0;
  });

  return Array.from(statMap.values())
    .filter((entry) => entry.matches > 0)
    .sort((left, right) => {
      if (right.wins !== left.wins) {
        return right.wins - left.wins;
      }

      if (left.goalsAgainstPerGame !== right.goalsAgainstPerGame) {
        return left.goalsAgainstPerGame - right.goalsAgainstPerGame;
      }

      return left.player.name.localeCompare(right.player.name, 'cs');
    });
};