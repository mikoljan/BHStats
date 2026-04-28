import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Import, PenSquare, PlusCircle } from 'lucide-react';
import { StatCard } from '@components/StatCard';
import { Table } from '@components/Table';
import { getMatches, getSeasons, getStadiums } from '@utils/api';
import { formatDate, getScoreLabel, getResultTone } from '@utils/helpers';
import { getTeamRecordSummary, resultLabel } from '@utils/statistics';
import type { Match } from '@models/match';
import type { Season } from '@models/season';
import type { Stadium } from '@models/stadium';

export const MatchesPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [nextMatches, nextSeasons, nextStadiums] = await Promise.all([
        getMatches(),
        getSeasons(),
        getStadiums(),
      ]);

      setMatches(nextMatches.sort((left, right) => right.date.localeCompare(left.date)));
      setSeasons(nextSeasons);
      setStadiums(nextStadiums);
      setLoading(false);
    };

    void load();
  }, []);

  if (loading) {
    return <div className="panel-soft p-8 text-slate-300">Načítám zápasy…</div>;
  }

  const summary = getTeamRecordSummary(matches);
  const homeGames = matches.filter((match) => match.homeGame).length;
  const awayGames = matches.length - homeGames;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Zápasy</p>
          <h1 className="section-title text-4xl">Historie zápasů a odkaz do detailu</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Každý zápas má přímý link do detailu, kde je možné upravit skóre, sestavu, góly i tresty přes backend.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/seasons/create"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/6 hover:text-white"
          >
            <PlusCircle className="h-4 w-4" />
            Nová sezóna
          </Link>
          <Link
            to="/matches/import"
            className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            <Import className="h-4 w-4" />
            Import z linku
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Počet zápasů" value={summary.matches} />
        <StatCard label="Bilance" value={`${summary.wins}-${summary.draws}-${summary.losses}`} />
        <StatCard label="Domácí" value={homeGames} helper={`Venku ${awayGames}`} />
        <StatCard label="Skóre" value={`${summary.goalsFor}:${summary.goalsAgainst}`} />
      </div>

      <Table
        columns={[
          {
            key: 'date',
            header: 'Datum',
            render: (row) => (
              <div>
                <div className="font-semibold text-white">{formatDate(row.date)}</div>
                <div className="text-xs text-slate-400">{row.homeGame ? 'Domácí' : 'Venku'}</div>
              </div>
            ),
          },
          { key: 'opponent', header: 'Soupeř', render: (row) => row.opponent },
          {
            key: 'season',
            header: 'Sezóna',
            render: (row) => seasons.find((season) => season.id === row.seasonId)?.year ?? 'n/a',
          },
          {
            key: 'stadium',
            header: 'Stadion',
            render: (row) => stadiums.find((stadium) => stadium.id === row.stadiumId)?.name ?? 'Bez stadionu',
          },
          {
            key: 'score',
            header: 'Skóre',
            render: (row) => (
              <span className={`font-semibold ${getResultTone(row.result)}`}>
                {getScoreLabel(row.ourScore, row.opponentScore)}
              </span>
            ),
          },
          { key: 'result', header: 'Výsledek', render: (row) => resultLabel[row.result] },
          { key: 'roster', header: 'Sestava', render: (row) => `${row.presentPlayerIds.length} hráčů` },
          {
            key: 'action',
            header: 'Akce',
            render: (row) => (
              <Link
                to={`/matches/${row.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20"
              >
                <PenSquare className="h-4 w-4" />
                Detail zápasu
              </Link>
            ),
          },
        ]}
        data={matches}
        rowKey={(row) => row.id}
      />
    </div>
  );
};
