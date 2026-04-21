import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, CalendarRange, Shield } from 'lucide-react';
import { StatCard } from '@components/StatCard';
import { Table } from '@components/Table';
import { getMatches, getPlayerById, getSeasons } from '@utils/api';
import { formatDate, formatMinutes, getScoreLabel } from '@utils/helpers';
import { getPlayerMatchLog, getPlayerSeasonRows, getPlayerStats, positionLabel, resultLabel } from '@utils/statistics';
import type { Match } from '@models/match';
import type { Player } from '@models/player';
import type { Season } from '@models/season';

export const PlayerDetailPage = () => {
  const { playerId = '' } = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [nextPlayer, nextMatches, nextSeasons] = await Promise.all([
        getPlayerById(playerId),
        getMatches(),
        getSeasons(),
      ]);

      setPlayer(nextPlayer ?? null);
      setMatches(nextMatches);
      setSeasons(nextSeasons);
      setLoading(false);
    };

    void load();
  }, [playerId]);

  if (loading) {
    return <div className="panel-soft p-8 text-slate-300">Načítám detail hráče…</div>;
  }

  if (!player) {
    return (
      <div className="panel-soft space-y-4 p-8">
        <h1 className="text-2xl font-semibold text-white">Hráč nebyl nalezen</h1>
        <Link to="/players" className="inline-flex items-center gap-2 text-cyan-200 transition hover:text-cyan-100">
          <ArrowLeft className="h-4 w-4" />
          Zpět na seznam hráčů
        </Link>
      </div>
    );
  }

  const overallStats = getPlayerStats([player], matches)[0];
  const matchLog = getPlayerMatchLog(player.id, matches);
  const seasonRows = getPlayerSeasonRows(player.id, seasons, matches);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link to="/players" className="mb-4 inline-flex items-center gap-2 text-sm text-cyan-200 transition hover:text-cyan-100">
            <ArrowLeft className="h-4 w-4" />
            Zpět na soupisku
          </Link>
          <p className="eyebrow">Detail hráče</p>
          <h1 className="text-4xl font-bold text-white">{player.name}</h1>
          <p className="mt-2 text-slate-300">
            #{player.number} • {positionLabel[player.position]}
          </p>
        </div>
        <div className="panel-soft flex items-center gap-4 px-5 py-4">
          <Shield className="h-8 w-8 text-cyan-200" />
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Role v týmu</div>
            <div className="text-lg font-semibold text-white">{positionLabel[player.position]}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Zápasy" value={overallStats?.matches ?? 0} />
        <StatCard label="Body" value={overallStats?.points ?? 0} helper={`${overallStats?.goals ?? 0} G / ${overallStats?.assists ?? 0} A`} />
        <StatCard label="Trestné minuty" value={overallStats?.penaltyMinutes ?? 0} />
        <StatCard label="Brankářské minuty" value={formatMinutes(overallStats?.goalieMinutes ?? 0)} />
      </div>

      <section className="space-y-4">
        <div>
          <p className="eyebrow">Sezónní rozpad</p>
          <h2 className="section-title">Produktivita po sezónách</h2>
        </div>
        <Table
          columns={[
            { key: 'season', header: 'Sezóna', render: (row) => row.season.year },
            { key: 'matches', header: 'Z', render: (row) => row.matches },
            { key: 'goals', header: 'G', render: (row) => row.goals },
            { key: 'assists', header: 'A', render: (row) => row.assists },
            { key: 'points', header: 'B', render: (row) => row.points },
            { key: 'penalty', header: 'TM', render: (row) => row.penaltyMinutes },
          ]}
          data={seasonRows}
          rowKey={(row) => row.season.id}
          emptyState="Hráč zatím nemá odehranou sezónu v datech."
        />
      </section>

      <section className="space-y-4">
        <div>
          <p className="eyebrow">Match log</p>
          <h2 className="section-title">Příspěvek v jednotlivých zápasech</h2>
        </div>
        <Table
          columns={[
            {
              key: 'match',
              header: 'Zápas',
              render: (row) => (
                <div>
                  <Link to={`/matches/${row.match.id}`} className="font-semibold text-white transition hover:text-cyan-200">
                    Blue Horses vs. {row.match.opponent}
                  </Link>
                  <div className="text-xs text-slate-400">{formatDate(row.match.date)}</div>
                </div>
              ),
            },
            { key: 'score', header: 'Skóre', render: (row) => getScoreLabel(row.match.ourScore, row.match.opponentScore) },
            { key: 'result', header: 'Výsledek', render: (row) => resultLabel[row.match.result] },
            { key: 'goals', header: 'G', render: (row) => row.goals },
            { key: 'assists', header: 'A', render: (row) => row.assists },
            { key: 'points', header: 'B', render: (row) => row.points },
            { key: 'pim', header: 'TM', render: (row) => row.penaltyMinutes },
          ]}
          data={matchLog}
          rowKey={(row) => row.match.id}
          emptyState="Hráč zatím nemá žádný zápis v zápasech."
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {matchLog.slice(0, 3).map((row) => (
          <article key={row.match.id} className="panel-soft p-5">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <CalendarRange className="h-4 w-4 text-cyan-200" />
              {formatDate(row.match.date)}
            </div>
            <div className="mt-4 text-xl font-semibold text-white">vs. {row.match.opponent}</div>
            <div className="mt-2 text-sm text-slate-400">{resultLabel[row.match.result]} • {getScoreLabel(row.match.ourScore, row.match.opponentScore)}</div>
            <div className="mt-5 rounded-2xl bg-white/5 p-4 text-sm text-slate-200">
              {row.goals} gólů, {row.assists} asistencí, {row.penaltyMinutes} TM
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};
