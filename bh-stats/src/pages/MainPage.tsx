import { useEffect, useState } from 'react';
import { CalendarClock, Goal, ShieldCheck } from 'lucide-react';
import { IconCard } from '@components/IconCard';
import { StatCard } from '@components/StatCard';
import { Table } from '@components/Table';
import { getMatches, getPlayers, getSeasons } from '@utils/api';
import { formatDate, getScoreLabel } from '@utils/helpers';
import { getPlayerStats, getSeasonHistory, getTeamRecordSummary, resultLabel } from '@utils/statistics';
import type { Match } from '@models/match';
import type { Player } from '@models/player';
import type { Season } from '@models/season';

export const MainPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [nextMatches, nextPlayers, nextSeasons] = await Promise.all([
        getMatches(),
        getPlayers(),
        getSeasons(),
      ]);

      setMatches(nextMatches);
      setPlayers(nextPlayers);
      setSeasons(nextSeasons);
      setLoading(false);
    };

    void load();
  }, []);

  if (loading) {
    return <div className="panel-soft p-8 text-slate-300">Načítám historii týmu…</div>;
  }

  const overview = getTeamRecordSummary(matches);
  const playerStats = getPlayerStats(players, matches);
  const seasonHistory = getSeasonHistory(seasons, matches);
  const latestSeason = seasonHistory[0];
  const topScorer = playerStats[0];

  return (
    <div className="space-y-8">
      <section className="hero-panel overflow-hidden rounded-[32px] p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
              Historie Blue Horses
            </span>
            <div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Přehled sezón, týmového vývoje a klíčových statistik hráčů.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
                Frontend pracuje čistě nad lokálními mock daty. Máš tak připravený dashboard pro historii týmu,
                hráčské statistiky i návaznost na detail konkrétního zápasu.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <IconCard icon={<CalendarClock className="h-5 w-5" />} label="Sezóny" value={`${seasons.length}`} />
              <IconCard icon={<Goal className="h-5 w-5" />} label="Vstřelené góly" value={`${overview.goalsFor}`} />
              <IconCard icon={<ShieldCheck className="h-5 w-5" />} label="Bilance" value={`${overview.wins}-${overview.draws}-${overview.losses}`} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Odehrané zápasy" value={overview.matches} helper="Kompletní historie v mock datech" />
            <StatCard label="Body týmu" value={overview.points} helper="3 body za výhru, 1 za remízu" />
            <StatCard
              label="Aktuální sezóna"
              value={latestSeason?.season.year ?? 'N/A'}
              helper={latestSeason ? `${latestSeason.goalsFor}:${latestSeason.goalsAgainst} ve skóre` : 'Bez dat'}
            />
            <StatCard
              label="Produktivita lídra"
              value={topScorer ? `${topScorer.points} bodů` : '0'}
              helper={topScorer ? topScorer.player.name : 'Bez dat'}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Historie týmu</p>
              <h2 className="section-title">Sezóny a výkonnost</h2>
            </div>
          </div>
          <Table
            columns={[
              {
                key: 'season',
                header: 'Sezóna',
                render: (row) => (
                  <div>
                    <div className="font-semibold text-white">{row.season.year}</div>
                    <div className="text-xs text-slate-400">{row.season.leagueName}</div>
                  </div>
                ),
              },
              { key: 'matches', header: 'Z', render: (row) => row.matches },
              { key: 'record', header: 'V-R-P', render: (row) => `${row.wins}-${row.draws}-${row.losses}` },
              { key: 'score', header: 'Skóre', render: (row) => `${row.goalsFor}:${row.goalsAgainst}` },
              { key: 'points', header: 'Body', render: (row) => row.points },
              {
                key: 'position',
                header: 'Umístění',
                render: (row) => (row.season.position ? `${row.season.position}. místo` : 'n/a'),
              },
            ]}
            data={seasonHistory}
            rowKey={(row) => row.season.id}
          />
        </div>

        <div className="space-y-4">
          <div>
            <p className="eyebrow">Lídři týmu</p>
            <h2 className="section-title">Nejproduktivnější hráči</h2>
          </div>
          <div className="grid gap-4">
            {playerStats.slice(0, 4).map((entry, index) => (
              <div key={entry.player.id} className="panel-soft flex items-center justify-between gap-4 p-5">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">#{index + 1}</div>
                  <div className="mt-1 text-xl font-semibold text-white">{entry.player.name}</div>
                  <div className="text-sm text-slate-300">{entry.goals} G / {entry.assists} A / {entry.matches} Z</div>
                </div>
                <div className="rounded-2xl bg-cyan-300/10 px-4 py-3 text-right">
                  <div className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Body</div>
                  <div className="text-2xl font-bold text-cyan-100">{entry.points}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="eyebrow">Recent form</p>
          <h2 className="section-title">Poslední zápasy</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {matches
            .slice()
            .sort((left, right) => right.date.localeCompare(left.date))
            .slice(0, 3)
            .map((match) => (
              <article key={match.id} className="panel-soft p-5">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{formatDate(match.date)}</span>
                  <span>{resultLabel[match.result]}</span>
                </div>
                <div className="mt-4 text-2xl font-semibold text-white">Blue Horses vs. {match.opponent}</div>
                <div className="mt-2 text-sm text-slate-300">{match.homeGame ? 'Domácí zápas' : 'Venku'}</div>
                <div className="mt-6 flex items-end justify-between">
                  <div className="text-4xl font-bold text-cyan-100">{getScoreLabel(match.ourScore, match.opponentScore)}</div>
                  <div className="text-sm text-slate-400">{match.presentPlayerIds.length} hráčů v sestavě</div>
                </div>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
};
