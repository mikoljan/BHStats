import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { Table } from '@components/Table';
import { ScopeTabs, type TeamScope } from '@components/UI/ScopeTabs';
import { getGoalieStatistics, getPlayerStatistics, getSeasons } from '@utils/api';
import { formatMinutes } from '@utils/helpers';
import type { TableColumn } from '@components/Table';
import { positionLabel, scopeLabel, type GoalieStatLine, type PlayerStatLine } from '@utils/statistics';
import type { Season } from '@models/season';

type FilterMode = 'ALL' | 'SEASON' | 'LEAGUE';
type StatsView = 'PLAYERS' | 'GOALIES';

export const PlayersPage = () => {
  const [rows, setRows] = useState<PlayerStatLine[]>([]);
  const [goalieRows, setGoalieRows] = useState<GoalieStatLine[]>([]);
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
    const loadSeasons = async () => {
      const nextSeasons = await getSeasons();
      setSeasons(nextSeasons);
    };

    void loadSeasons();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const seasonFilter = filterMode === 'SEASON' && seasonId !== 'ALL' ? seasonId : undefined;
      const leagueFilter = filterMode === 'LEAGUE' && leagueName !== 'ALL' ? leagueName : undefined;

      const [nextRows, nextGoalieRows] = await Promise.all([
        getPlayerStatistics({
          scope,
          seasonId: seasonFilter,
          leagueName: leagueFilter,
          query: deferredQuery.trim() || undefined,
        }),
        getGoalieStatistics({
          scope,
          seasonId: seasonFilter,
          leagueName: leagueFilter,
          query: deferredQuery.trim() || undefined,
        }),
      ]);

      setRows(nextRows);
      setGoalieRows(nextGoalieRows);
      setLoading(false);
    };

    void loadStats();
  }, [deferredQuery, filterMode, leagueName, scope, seasonId]);

  const seasonOptions = useMemo(
    () => [...seasons].sort((left, right) => right.year.localeCompare(left.year, 'cs')),
    [seasons],
  );

  const leagueOptions = useMemo(
    () => Array.from(new Set(seasons.map((season) => season.leagueName))).sort((left, right) => left.localeCompare(right, 'cs')),
    [seasons],
  );

  const playerColumns = useMemo<TableColumn<PlayerStatLine>[]>(() => [
    {
      key: 'rank',
      header: '#',
      headerTooltip: 'Pořadí v aktuálním řazení',
      className: 'w-16 text-slate-400',
      render: (_, index) => index + 1,
      sortable: true,
      sortValue: (row) => row.points,
    },
    {
      key: 'player',
      header: 'Hráč',
      headerTooltip: 'Jméno hráče a jeho základní profil',
      render: (row) => (
        <div>
          <Link to={`/players/${row.player.id}`} className="font-semibold text-white transition hover:text-cyan-200">
            {row.player.name}
          </Link>
          <div className="text-xs text-slate-400">#{row.player.number} • {positionLabel[row.player.position]}</div>
        </div>
      ),
      sortable: true,
      sortValue: (row) => row.player.name,
    },
    { key: 'matches', header: 'Z', headerTooltip: 'Zápasy', render: (row) => row.matches, sortable: true, sortValue: (row) => row.matches },
    { key: 'goals', header: 'G', headerTooltip: 'Góly', render: (row) => row.goals, sortable: true, sortValue: (row) => row.goals },
    { key: 'assists', header: 'A', headerTooltip: 'Asistence', render: (row) => row.assists, sortable: true, sortValue: (row) => row.assists },
    { key: 'points', header: 'B', headerTooltip: 'Body', render: (row) => row.points, sortable: true, sortValue: (row) => row.points },
    { key: 'pim', header: 'TM', headerTooltip: 'Trestné minuty', render: (row) => row.penaltyMinutes, sortable: true, sortValue: (row) => row.penaltyMinutes },
    {
      key: 'avg',
      header: 'Pr. B/Z',
      headerTooltip: 'Průměr bodů na zápas',
      render: (row) => row.pointsPerGame.toFixed(2).replace('.', ','),
      sortable: true,
      sortValue: (row) => row.pointsPerGame,
    },
    { key: 'ppg', header: 'PPG', headerTooltip: 'Góly v přesilovce', render: (row) => row.powerPlayGoals, sortable: true, sortValue: (row) => row.powerPlayGoals },
    { key: 'shg', header: 'SHG', headerTooltip: 'Góly v oslabení', render: (row) => row.shorthandedGoals, sortable: true, sortValue: (row) => row.shorthandedGoals },
    { key: 'gwg', header: 'GWG', headerTooltip: 'Vítězné góly', render: (row) => row.gameWinningGoals, sortable: true, sortValue: (row) => row.gameWinningGoals },
    { key: 'gtg', header: 'GTG', headerTooltip: 'Vyrovnávací góly', render: (row) => row.gameTyingGoals, sortable: true, sortValue: (row) => row.gameTyingGoals },
    { key: 'psg', header: 'PSG', headerTooltip: 'Góly z trestného střílení', render: (row) => row.penaltyShotGoals, sortable: true, sortValue: (row) => row.penaltyShotGoals },
    { key: 'eng', header: 'ENG', headerTooltip: 'Góly do prázdné brány', render: (row) => row.emptyNetGoals, sortable: true, sortValue: (row) => row.emptyNetGoals },
  ], []);

  const goalieColumns = useMemo<TableColumn<GoalieStatLine>[]>(() => [
    {
      key: 'rank',
      header: '#',
      headerTooltip: 'Pořadí v aktuálním řazení',
      className: 'w-16 text-slate-400',
      render: (_, index) => index + 1,
      sortable: true,
      sortValue: (row) => row.wins,
    },
    {
      key: 'player',
      header: 'Jméno',
      headerTooltip: 'Jméno brankáře',
      render: (row) => (
        <div>
          <Link to={`/players/${row.player.id}`} className="font-semibold text-white transition hover:text-cyan-200">
            {row.player.name}
          </Link>
          <div className="text-xs text-slate-400">#{row.player.number} • v brance</div>
        </div>
      ),
      sortable: true,
      sortValue: (row) => row.player.name,
    },
    { key: 'matches', header: 'Z', headerTooltip: 'Zápasy', render: (row) => row.matches, sortable: true, sortValue: (row) => row.matches },
    { key: 'wins', header: 'V', headerTooltip: 'Výhry', render: (row) => row.wins, sortable: true, sortValue: (row) => row.wins },
    { key: 'cleanSheets', header: 'ČK', headerTooltip: 'Čistá konta', render: (row) => row.cleanSheets, sortable: true, sortValue: (row) => row.cleanSheets },
    { key: 'minutes', header: 'Min', headerTooltip: 'Odchytané minuty', render: (row) => formatMinutes(row.minutes), sortable: true, sortValue: (row) => row.minutes },
    {
      key: 'ga',
      header: 'OB',
      headerTooltip: 'Obdržené branky',
      render: (row) => row.goalsAgainst,
      sortable: true,
      sortValue: (row) => row.goalsAgainst,
    },
    {
      key: 'gaa',
      header: 'B/Z',
      headerTooltip: 'Průměr obdržených branek na zápas',
      render: (row) => row.goalsAgainstPerGame.toFixed(2).replace('.', ','),
      sortable: true,
      sortValue: (row) => row.goalsAgainstPerGame,
    },
    { key: 'assists', header: 'A', headerTooltip: 'Asistence', render: (row) => row.assists, sortable: true, sortValue: (row) => row.assists },
    { key: 'shootouts', header: 'Nájezdy', headerTooltip: 'Počet samostatných nájezdů', render: (row) => row.shootouts, sortable: true, sortValue: (row) => row.shootouts },
    {
      key: 'shootoutGoalsAgainst',
      header: 'Góly z náj.',
      headerTooltip: 'Obdržené góly ze samostatných nájezdů',
      render: (row) => row.shootoutGoalsAgainst,
      sortable: true,
      sortValue: (row) => row.shootoutGoalsAgainst,
    },
    {
      key: 'shootoutSavePercentage',
      header: 'Úspěšnost (%)',
      headerTooltip: 'Úspěšnost zákroků při samostatných nájezdech v procentech',
      render: (row) => (row.shootoutSavePercentage === null ? '—' : row.shootoutSavePercentage.toFixed(2).replace('.', ',')),
      sortable: true,
      sortValue: (row) => row.shootoutSavePercentage,
    },
  ], []);

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
            columns={playerColumns}
            data={rows}
            rowKey={(row) => row.player.id}
            emptyState="Žádný hráč neodpovídá filtru."
            defaultSort={{ columnKey: 'points', direction: 'desc' }}
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
            columns={goalieColumns}
            data={goalieRows}
            rowKey={(row) => `${row.player.id}-goalie`}
            emptyState="Žádný brankář neodpovídá filtru."
            defaultSort={{ columnKey: 'wins', direction: 'desc' }}
          />
        </section>
      )}
    </div>
  );
};
