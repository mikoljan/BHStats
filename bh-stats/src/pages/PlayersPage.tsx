import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { Table } from '@components/Table';
import { getMatches, getPlayers } from '@utils/api';
import { formatMinutes } from '@utils/helpers';
import { getPlayerStats, positionLabel } from '@utils/statistics';
import type { Match } from '@models/match';
import type { Player } from '@models/player';

export const PlayersPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const load = async () => {
      const [nextMatches, nextPlayers] = await Promise.all([getMatches(), getPlayers()]);
      setMatches(nextMatches);
      setPlayers(nextPlayers);
      setLoading(false);
    };

    void load();
  }, []);

  const rows = useMemo(() => {
    const allRows = getPlayerStats(players, matches);
    const normalized = deferredQuery.trim().toLocaleLowerCase('cs');

    if (!normalized) {
      return allRows;
    }

    return allRows.filter((row) => row.player.name.toLocaleLowerCase('cs').includes(normalized));
  }, [deferredQuery, matches, players]);

  if (loading) {
    return <div className="panel-soft p-8 text-slate-300">Načítám hráčské statistiky…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Hráčské statistiky</p>
          <h1 className="section-title text-4xl">Soupiska a produktivita</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Přehled všech hráčů s průběžně spočítanými statistikami z lokálních zápasových dat.
          </p>
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
          { key: 'goalie', header: 'Brank. min', render: (row) => formatMinutes(row.goalieMinutes) },
        ]}
        data={rows}
        rowKey={(row) => row.player.id}
        emptyState="Žádný hráč neodpovídá filtru."
      />
    </div>
  );
};
