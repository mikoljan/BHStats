import { useEffect, useState } from 'react';
import { Table } from '@components/Table';
import { ScopeTabs, type TeamScope } from '@components/UI/ScopeTabs';
import { getOverview } from '@utils/api';
import { formatDate } from '@utils/helpers';
import { scopeLabel, type PlayerStatLine } from '@utils/statistics';
import type { OverviewResponse } from '@utils/api';

const movementLabel = {
  promotion: 'Postup',
  relegation: 'Sestup',
} as const;

export const MainPage = () => {
  const [overviewData, setOverviewData] = useState<OverviewResponse | null>(null);
  const [scope, setScope] = useState<TeamScope>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const nextOverview = await getOverview(scope, 'ALL');
      setOverviewData(nextOverview);
      setLoading(false);
    };

    void load();
  }, [scope]);

  const overview = overviewData?.teamRecordSummary ?? overviewData?.summary;
  const seasonHistory = overviewData?.seasonHistory ?? [];
  const milestones = overviewData?.milestones ?? [];
  const topPlayers = overviewData?.topPlayers ?? [];
  const topScorer = overviewData?.topPlayers?.[0];

  if (loading) {
    return <div className="panel-soft p-8 text-slate-300">Načítám historii týmu…</div>;
  }

  return (
    <div className="space-y-8">
      <section className="panel-soft p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">Historie týmu</div>
            <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">Digitální podoba původního excelu</h1>
            <p className="mt-4 max-w-3xl text-slate-300">
              Místo marketingového dashboardu je přehled stavěný jako klubová kronika: sezónní bloky, souhrnná bilance,
              zkratkové sloupce a milníky vstřelených gólů podobně jako v původním ručním vedení statistik.
            </p>
            <div className="mt-5">
              <ScopeTabs value={scope} onChange={setScope} />
            </div>
          </div>
          <div className="grid min-w-[280px] gap-3 sm:grid-cols-2 xl:w-[360px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Celek {scopeLabel[scope]}</div>
              <div className="mt-2 text-2xl font-bold text-white">{overview?.matches ?? 0} Z</div>
              <div className="mt-1 text-sm text-slate-300">{overview?.wins ?? 0}-{overview?.draws ?? 0}-{overview?.losses ?? 0} • skóre {overview?.goalsFor ?? 0}:{overview?.goalsAgainst ?? 0}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Lídr kanadského bodování</div>
              <div className="mt-2 text-lg font-bold text-white">{topScorer?.player.name ?? 'Bez dat'}</div>
              <div className="mt-1 text-sm text-slate-300">{topScorer?.points ?? 0} bodů • {topScorer?.pointsPerGame.toFixed(2).replace('.', ',') ?? '0,00'} B/Z</div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="eyebrow">Ligy a sezóny</p>
            <h2 className="section-title">Sezónní přehled po blocích {scopeLabel[scope]}</h2>
        </div>
        <div className="panel-soft p-4 sm:p-5">
          <Table
            columns={[
              {
                key: 'season',
                header: 'Sezóna',
                render: (row) => (
                  <div>
                    <div className="font-semibold text-white">{row.season.year}</div>
                    <div className="text-xs text-slate-400">{row.season.leagueName} • {row.season.team}</div>
                  </div>
                ),
              },
              { key: 'matches', header: 'Z', render: (row) => row.matches },
              { key: 'wins', header: 'V', render: (row) => row.wins },
              { key: 'draws', header: 'R', render: (row) => row.draws },
              { key: 'losses', header: 'P', render: (row) => row.losses },
              { key: 'points', header: 'B', render: (row) => row.points },
              { key: 'gf', header: 'BV', render: (row) => row.goalsFor },
              { key: 'ga', header: 'BO', render: (row) => row.goalsAgainst },
              { key: 'diff', header: 'BR', render: (row) => row.goalsFor - row.goalsAgainst },
              { key: 'score', header: 'Skóre', render: (row) => `${row.goalsFor}:${row.goalsAgainst}` },
              {
                key: 'position',
                header: 'Umístění',
                render: (row) => {
                  const baseLabel = row.season.position ? `${row.season.position}. místo` : row.season.covidInterrupted ? 'COVID' : 'n/a';
                  return row.season.movement ? `${baseLabel} • ${movementLabel[row.season.movement]}` : baseLabel;
                },
              },
            ]}
            data={seasonHistory}
            rowKey={(row) => row.season.id}
          />
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div>
            <p className="eyebrow">Milníky</p>
            <h2 className="section-title">Střelecké hranice klubu</h2>
          </div>
          <div className="panel-soft divide-y divide-white/10 overflow-hidden">
            {milestones.length > 0 ? milestones.map((milestone) => (
              <div key={milestone.milestone} className="flex items-start justify-between gap-4 px-5 py-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">{milestone.milestone}. vstřelený gól</div>
                  <div className="mt-1 text-lg font-semibold text-white">{milestone.scorerName}</div>
                  <div className="text-sm text-slate-300">proti {milestone.opponent}</div>
                </div>
                <div className="text-right text-sm text-slate-300">
                  <div>{formatDate(milestone.date)}</div>
                </div>
              </div>
            )) : <div className="px-5 py-6 text-sm text-slate-400">Pro vybranou kartu zatím nejsou milníky k dispozici.</div>}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="eyebrow">Klubová produktivita</p>
            <h2 className="section-title">Nejlepší hráči all-time</h2>
          </div>
          <div className="panel-soft p-4 sm:p-5">
            <Table<PlayerStatLine>
              columns={[
                { key: 'rank', header: '#', render: (_, index) => index + 1 },
                { key: 'player', header: 'Jméno', render: (row) => row.player.name },
                { key: 'z', header: 'Z', render: (row) => row.matches },
                { key: 'g', header: 'G', render: (row) => row.goals },
                { key: 'a', header: 'A', render: (row) => row.assists },
                { key: 'b', header: 'B', render: (row) => row.points },
                { key: 'tm', header: 'TM', render: (row) => row.penaltyMinutes },
                { key: 'avg', header: 'Pr. B/Z', render: (row) => row.pointsPerGame.toFixed(2).replace('.', ',') },
              ]}
              data={topPlayers.slice(0, 8)}
              rowKey={(row) => row.player.id}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
