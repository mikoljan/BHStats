import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { Table } from '@components/Table';
import { ScopeTabs, type TeamScope } from '@components/UI/ScopeTabs';
import { getMatches, getPlayers, getSeasons } from '@utils/api';
import { formatMinutes } from '@utils/helpers';
import { filterMatchesByScope, filterPlayersByScope, getGoalieStats, getPlayerStats, positionLabel, scopeLabel } from '@utils/statistics';
import type { Match } from '@models/match';
import type { Player } from '@models/player';
import type { Season } from '@models/season';

type FilterMode = 'ALL' | 'SEASON' | 'LEAGUE';
type StatsView = 'PLAYERS' | 'GOALIES';

export const PlayersPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<TeamScope>('ALL');
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [statsView, setStatsView] = useState<StatsView>('PLAYERS');
  const [seasonId, setSeasonId] = useState('ALL');
  const [leagueName, setLeagueName] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const load = async () => {
      const [nextMatches, nextPlayers, nextSeasons] = await Promise.all([getMatches(), getPlayers(), getSeasons()]);
      setMatches(nextMatches);
      setPlayers(nextPlayers);
      setSeasons(nextSeasons);
      setLoading(false);
    };

    void load();
  }, []);

  const seasonOptions = useMemo(
    () => [...seasons].sort((left, right) => right.year.localeCompare(left.year, 'cs')),
    [seasons],
  );

  const seasonLookup = useMemo(
    () => new Map(seasons.map((season) => [season.id, season])),
    [seasons],
  );

  const leagueOptions = useMemo(
    () => Array.from(new Set(seasons.map((season) => season.leagueName))).sort((left, right) => left.localeCompare(right, 'cs')),
    [seasons],
  );

  const filteredMatches = useMemo(() => {
    const scopedMatches = filterMatchesByScope(matches, scope);
    return scopedMatches.filter((match) => {
      if (filterMode === 'SEASON') {
        return seasonId === 'ALL' ? true : match.seasonId === seasonId;
      }

      if (filterMode === 'LEAGUE') {
        if (leagueName === 'ALL') {
          return true;
        }

        return seasonLookup.get(match.seasonId)?.leagueName === leagueName;
      }

      return true;
    });
  }, [filterMode, leagueName, matches, scope, seasonId, seasonLookup]);

  const filteredPlayers = useMemo(() => filterPlayersByScope(players, scope), [players, scope]);

  const rows = useMemo(() => {
    const allRows = getPlayerStats(filteredPlayers, filteredMatches);
    const normalized = deferredQuery.trim().toLocaleLowerCase('cs');

    if (!normalized) {
      return allRows;
    }

    return allRows.filter((row) => row.player.name.toLocaleLowerCase('cs').includes(normalized));
  }, [deferredQuery, filteredMatches, filteredPlayers]);

  const goalieRows = useMemo(() => {
    const allRows = getGoalieStats(filteredPlayers, filteredMatches);
    const normalized = deferredQuery.trim().toLocaleLowerCase('cs');

    if (!normalized) {
      return allRows;
    }

    return allRows.filter((row) => row.player.name.toLocaleLowerCase('cs').includes(normalized));
  }, [deferredQuery, filteredMatches, filteredPlayers]);

  if (loading) {
    return <div className="panel-soft p-8 text-slate-300">Načítám hráčské statistiky…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Hráčské statistiky</p>
          <h1 className="section-title text-4xl">Statistiky ve stylu manuální tabulky</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Přehled je přizpůsobený starému excelu: all-time soupiska, zkratkové sloupce a důraz na produktivitu.
          </p>
          <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center">
            <ScopeTabs value={scope} onChange={setScope} />
            <div className="inline-flex flex-wrap gap-2 rounded-full border border-white/10 bg-slate-950/50 p-1.5">
              <button
                type="button"
                onClick={() => setStatsView('PLAYERS')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  statsView === 'PLAYERS'
                    ? 'bg-cyan-300 text-slate-950 shadow-[0_10px_24px_-16px_rgba(103,232,249,0.9)]'
                    : 'text-slate-300 hover:bg-white/6 hover:text-white'
                }`}
              >
                Hráči
              </button>
              <button
                type="button"
                onClick={() => setStatsView('GOALIES')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  statsView === 'GOALIES'
                    ? 'bg-cyan-300 text-slate-950 shadow-[0_10px_24px_-16px_rgba(103,232,249,0.9)]'
                    : 'text-slate-300 hover:bg-white/6 hover:text-white'
                }`}
              >
                Gólmani
              </button>
            </div>
            <label className="flex min-w-[120px] items-center gap-3 rounded-full border border-white/10 bg-slate-950/50 px-4 py-2.5 text-sm text-slate-300">
              <select
                value={filterMode}
                onChange={(event) => setFilterMode(event.target.value as FilterMode)}
                className="w-full bg-transparent text-sm font-semibold text-white outline-none"
              >
                <option value="ALL" className="bg-slate-900 text-white">Bez filtru</option>
                <option value="SEASON" className="bg-slate-900 text-white">Sezona</option>
                <option value="LEAGUE" className="bg-slate-900 text-white">Liga</option>
              </select>
            </label>
            {filterMode === 'SEASON' ? (
              <label className="flex min-w-[240px] items-center gap-3 rounded-full border border-white/10 bg-slate-950/50 px-4 py-2.5 text-sm text-slate-300">
                <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Sezóna</span>
                <select
                  value={seasonId}
                  onChange={(event) => setSeasonId(event.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-white outline-none"
                >
                  <option value="ALL" className="bg-slate-900 text-white">Všechny sezony</option>
                  {seasonOptions.map((season) => (
                    <option key={season.id} value={season.id} className="bg-slate-900 text-white">
                      {season.year}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {filterMode === 'LEAGUE' ? (
              <label className="flex min-w-[260px] items-center gap-3 rounded-full border border-white/10 bg-slate-950/50 px-4 py-2.5 text-sm text-slate-300">
                <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Liga</span>
                <select
                  value={leagueName}
                  onChange={(event) => setLeagueName(event.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-white outline-none"
                >
                  <option value="ALL" className="bg-slate-900 text-white">Všechny ligy</option>
                  {leagueOptions.map((league) => (
                    <option key={league} value={league} className="bg-slate-900 text-white">
                      {league}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        </div>
        <label className="flex w-full max-w-md items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-300 shadow-[0_16px_40px_-24px_rgba(8,47,73,0.9)] lg:w-80">
          <Search className="h-4 w-4 text-cyan-200" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filtrovat podle jména"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
          />
        </label>
      </div>

      {statsView === 'PLAYERS' ? (
        <section className="panel-soft p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">FBC Blue Horses {scopeLabel[scope]}</div>
              <div className="mt-1 text-lg font-semibold text-white">Historická produktivita hráčů</div>
            </div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Z = zápasy, B = body, TM = trestné minuty</div>
          </div>

          <Table
            columns={[
              {
                key: 'rank',
                header: '#',
                className: 'w-16 text-slate-400',
                render: (_, index) => index + 1,
              },
              {
                key: 'player',
                header: 'Hráč',
                render: (row) => (
                  <div>
                    <Link to={`/players/${row.player.id}`} className="font-semibold text-white transition hover:text-cyan-200">
                      {row.player.name}
                    </Link>
                    <div className="text-xs text-slate-400">#{row.player.number} • {positionLabel[row.player.position]}</div>
                  </div>
                ),
              },
              { key: 'matches', header: 'Z', render: (row) => row.matches },
              { key: 'goals', header: 'G', render: (row) => row.goals },
              { key: 'assists', header: 'A', render: (row) => row.assists },
              { key: 'points', header: 'B', render: (row) => row.points },
              { key: 'pim', header: 'TM', render: (row) => row.penaltyMinutes },
              { key: 'avg', header: 'Pr. B/Z', render: (row) => row.pointsPerGame.toFixed(2).replace('.', ',') },
              { key: 'ppg', header: 'PPG', render: (row) => row.powerPlayGoals },
              { key: 'shg', header: 'SHG', render: (row) => row.shorthandedGoals },
              { key: 'gwg', header: 'GWG', render: (row) => row.gameWinningGoals },
              { key: 'gtg', header: 'GTG', render: (row) => row.gameTyingGoals },
              { key: 'psg', header: 'PSG', render: (row) => row.penaltyShotGoals },
              { key: 'eng', header: 'ENG', render: (row) => row.emptyNetGoals },
            ]}
            data={rows}
            rowKey={(row) => row.player.id}
            emptyState="Žádný hráč neodpovídá filtru."
          />
        </section>
      ) : (
        <section className="panel-soft p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">FBC Blue Horses {scopeLabel[scope]}</div>
              <div className="mt-1 text-lg font-semibold text-white">Brankářské statistiky</div>
            </div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">ČK = čistá konta, OB = obdržené branky, A = asistence</div>
          </div>

          <Table
            columns={[
              {
                key: 'rank',
                header: '#',
                className: 'w-16 text-slate-400',
                render: (_, index) => index + 1,
              },
              {
                key: 'player',
                header: 'Jméno',
                render: (row) => (
                  <div>
                    <Link to={`/players/${row.player.id}`} className="font-semibold text-white transition hover:text-cyan-200">
                      {row.player.name}
                    </Link>
                    <div className="text-xs text-slate-400">#{row.player.number} • v brance</div>
                  </div>
                ),
              },
              { key: 'matches', header: 'Z', render: (row) => row.matches },
              { key: 'wins', header: 'V', render: (row) => row.wins },
              { key: 'cleanSheets', header: 'ČK', render: (row) => row.cleanSheets },
              { key: 'minutes', header: 'Min', render: (row) => formatMinutes(row.minutes) },
              { key: 'ga', header: 'OB', render: (row) => row.goalsAgainst.toFixed(2).replace('.', ',') },
              { key: 'gaa', header: 'B/Z', render: (row) => row.goalsAgainstPerGame.toFixed(2).replace('.', ',') },
              { key: 'assists', header: 'A', render: (row) => row.assists },
              { key: 'shootouts', header: 'Nájezdy', render: (row) => row.shootouts },
              { key: 'shootoutGoalsAgainst', header: 'Góly z náj.', render: (row) => row.shootoutGoalsAgainst },
              {
                key: 'shootoutSavePercentage',
                header: 'Úspěšnost (%)',
                render: (row) => (row.shootoutSavePercentage === null ? '—' : row.shootoutSavePercentage.toFixed(2).replace('.', ',')),
              },
            ]}
            data={goalieRows}
            rowKey={(row) => `${row.player.id}-goalie`}
            emptyState="Žádný brankář neodpovídá filtru."
          />
        </section>
      )}
    </div>
  );
};
