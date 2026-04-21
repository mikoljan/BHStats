import { useEffect, useState } from 'react';
import { Crown, Flag, Flame, ShieldAlert } from 'lucide-react';
import { getMatches, getPlayers } from '@utils/api';
import { formatDate, getScoreLabel } from '@utils/helpers';
import { getBestResult, getPlayerStats } from '@utils/statistics';
import type { Match } from '@models/match';
import type { Player } from '@models/player';

export const RecordsPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [nextMatches, nextPlayers] = await Promise.all([getMatches(), getPlayers()]);
      setMatches(nextMatches);
      setPlayers(nextPlayers);
      setLoading(false);
    };

    void load();
  }, []);

  if (loading) {
    return <div className="panel-soft p-8 text-slate-300">Načítám rekordy…</div>;
  }

  const playerStats = getPlayerStats(players, matches);
  const bestResult = getBestResult(matches);
  const topScorer = playerStats[0];
  const topPlaymaker = [...playerStats].sort((left, right) => right.assists - left.assists)[0];
  const ironMan = [...playerStats].sort((left, right) => right.matches - left.matches)[0];
  const penaltyLeader = [...playerStats].sort((left, right) => right.penaltyMinutes - left.penaltyMinutes)[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Rekordy</p>
        <h1 className="section-title text-4xl">Klíčové týmové a hráčské milníky</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="panel-soft p-5">
          <Crown className="h-6 w-6 text-cyan-200" />
          <h2 className="mt-5 text-xl font-semibold text-white">Nejvíc bodů</h2>
          <p className="mt-2 text-3xl font-bold text-cyan-100">{topScorer?.points ?? 0}</p>
          <p className="mt-2 text-slate-300">{topScorer?.player.name ?? 'Bez dat'}</p>
        </article>
        <article className="panel-soft p-5">
          <Flame className="h-6 w-6 text-amber-200" />
          <h2 className="mt-5 text-xl font-semibold text-white">Nejvíc asistencí</h2>
          <p className="mt-2 text-3xl font-bold text-amber-100">{topPlaymaker?.assists ?? 0}</p>
          <p className="mt-2 text-slate-300">{topPlaymaker?.player.name ?? 'Bez dat'}</p>
        </article>
        <article className="panel-soft p-5">
          <Flag className="h-6 w-6 text-emerald-200" />
          <h2 className="mt-5 text-xl font-semibold text-white">Největší výhra</h2>
          <p className="mt-2 text-3xl font-bold text-emerald-100">
            {bestResult ? getScoreLabel(bestResult.ourScore, bestResult.opponentScore) : '0:0'}
          </p>
          <p className="mt-2 text-slate-300">{bestResult ? `${bestResult.opponent} • ${formatDate(bestResult.date)}` : 'Bez dat'}</p>
        </article>
        <article className="panel-soft p-5">
          <ShieldAlert className="h-6 w-6 text-rose-200" />
          <h2 className="mt-5 text-xl font-semibold text-white">Nejvíc TM</h2>
          <p className="mt-2 text-3xl font-bold text-rose-100">{penaltyLeader?.penaltyMinutes ?? 0}</p>
          <p className="mt-2 text-slate-300">{penaltyLeader?.player.name ?? 'Bez dat'}</p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="panel-soft p-6">
          <p className="eyebrow">Ironman</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Nejvíc odehraných zápasů</h2>
          <div className="mt-6 flex items-end justify-between">
            <div>
              <div className="text-4xl font-bold text-cyan-100">{ironMan?.matches ?? 0}</div>
              <div className="mt-2 text-slate-300">{ironMan?.player.name ?? 'Bez dat'}</div>
            </div>
            <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">
              {ironMan ? `${ironMan.goals} G / ${ironMan.assists} A` : 'n/a'}
            </div>
          </div>
        </article>

        <article className="panel-soft p-6">
          <p className="eyebrow">Top match</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Výsledek s nejlepším rozdílem</h2>
          {bestResult ? (
            <div className="mt-6 space-y-2 text-slate-300">
              <div className="text-4xl font-bold text-white">{getScoreLabel(bestResult.ourScore, bestResult.opponentScore)}</div>
              <div>Soupeř: {bestResult.opponent}</div>
              <div>Datum: {formatDate(bestResult.date)}</div>
              <div>{bestResult.homeGame ? 'Domácí zápas' : 'Venkovní zápas'}</div>
            </div>
          ) : (
            <div className="mt-6 text-slate-400">Bez dat</div>
          )}
        </article>
      </div>
    </div>
  );
};
