import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CircleOff, GitBranch, Goal, Search, ShieldAlert } from 'lucide-react';
import { ScopeTabs, type TeamScope } from '@components/UI/ScopeTabs';
import { getSeries } from '@utils/api';
import type { SeriesCellState, SeriesMatrix } from '@utils/seriesMatrix';

const legend = [
  {
    key: 'absent',
    label: 'Nebyl v sestavě',
    shortLabel: 'X',
    className: 'border-white/10 bg-slate-950/80 text-slate-400',
  },
  {
    key: 'played',
    label: 'Hrál bez explicitního markeru v exportu',
    shortLabel: '',
    className: 'border-rose-300/20 bg-rose-400/14 text-rose-100',
  },
  {
    key: 'point',
    label: 'Bodoval bez gólu',
    shortLabel: '•',
    className: 'border-emerald-300/20 bg-emerald-400/14 text-emerald-100',
  },
  {
    key: 'goal',
    label: 'Bodoval gólem',
    shortLabel: 'G',
    className: 'border-emerald-200/25 bg-emerald-300/24 text-emerald-50',
  },
] as const;

const cellTone: Record<SeriesCellState, string> = {
  absent: 'border-white/10 bg-slate-950/80 text-slate-500',
  played: 'border-rose-300/20 bg-rose-400/14 text-rose-100',
  point: 'border-emerald-300/20 bg-emerald-400/14 text-emerald-100',
  goal: 'border-emerald-200/25 bg-emerald-300/24 text-emerald-50 font-bold',
};

const renderCellValue = (value: SeriesCellState) => {
  if (value === 'absent') {
    return 'X';
  }

  if (value === 'goal') {
    return 'G';
  }

  if (value === 'point') {
    return '•';
  }

  return '';
};

const scopeHeadline: Record<TeamScope, string> = {
  A: 'Série týmu A',
  B: 'Série týmu B',
  C: 'Série týmu C',
  ALL: 'Série všech týmů',
};

const getEmptyState = (scope: TeamScope) => {
  return `Nepovedlo se načíst data pro tým ${scope}.`;
};

const SummaryCards = ({ matrix }: { matrix: SeriesMatrix }) => (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <article className="rounded-[24px] border border-white/10 bg-slate-950/55 px-4 py-4 backdrop-blur">
      <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Sezóny</div>
      <div className="mt-2 text-3xl font-bold text-white">{matrix.seasons.length}</div>
      <div className="mt-1 text-sm text-slate-300">Rozpad podle hlaviček z Excel exportu</div>
    </article>
    <article className="rounded-[24px] border border-white/10 bg-slate-950/55 px-4 py-4 backdrop-blur">
      <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Zápasy v ose</div>
      <div className="mt-2 text-3xl font-bold text-white">{matrix.totalMatches}</div>
      <div className="mt-1 text-sm text-slate-300">Každý sloupec odpovídá jednomu zápasu</div>
    </article>
    <article className="rounded-[24px] border border-white/10 bg-slate-950/55 px-4 py-4 backdrop-blur">
      <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Hráči</div>
      <div className="mt-2 text-3xl font-bold text-white">{matrix.rows.length}</div>
      <div className="mt-1 text-sm text-slate-300">Počet řádků načtených z matice</div>
    </article>
    <article className="rounded-[24px] border border-white/10 bg-slate-950/55 px-4 py-4 backdrop-blur">
      <div className="text-xs uppercase tracking-[0.24em] text-slate-400">G markerů</div>
      <div className="mt-2 text-3xl font-bold text-white">{matrix.goalMarks}</div>
      <div className="mt-1 text-sm text-slate-300">
        {matrix.hasExplicitPointMarks ? 'Zdroj rozlišuje i body bez gólu.' : 'Aktuální export nese explicitně jen X a G.'}
      </div>
    </article>
  </div>
);

export const SeriesPage = () => {
  const [scope, setScope] = useState<TeamScope>('A');
  const [search, setSearch] = useState('');
  const [matrix, setMatrix] = useState<SeriesMatrix | undefined>(undefined);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const load = async () => {
      if (scope === 'ALL') {
        setMatrix(undefined);
        return;
      }

      const nextMatrix = await getSeries(scope);
      setMatrix(nextMatrix);
    };

    void load();
  }, [scope]);

  const normalizedSearch = deferredSearch.trim().toLocaleLowerCase('cs');
  const visibleRows = useMemo(() => {
    if (!matrix) {
      return [];
    }

    if (!normalizedSearch) {
      return matrix.rows;
    }

    return matrix.rows.filter((row) => row.playerName.toLocaleLowerCase('cs').includes(normalizedSearch));
  }, [matrix, normalizedSearch]);

  return (
    <div className="space-y-8">
      <section className="hero-panel overflow-hidden rounded-[36px] p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.15),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(248,113,113,0.12),transparent_30%)]" />
        <div className="relative space-y-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="eyebrow">Série</p>
              <h1 className="section-title text-4xl sm:text-5xl">Matice přítomnosti, bodů a gólů</h1>
              <p className="mt-4 max-w-3xl text-slate-300">
                Stránka přebírá exportované série přímo ze stats.txt a převádí je do čitelné matice po zápasech. X znamená,
                že hráč chyběl, G značí gól a barevný podklad ukazuje stav buňky podle dostupného markeru.
              </p>
            </div>

            <div className="rounded-[28px] border border-amber-300/15 bg-amber-400/10 px-4 py-4 text-sm text-amber-50 xl:max-w-md">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  Aktuální textový export obsahuje explicitně jen značky X a G. Stav „bodoval bez gólu“ parser podporuje,
                  ale v dnešním zdroji zatím není samostatně odlišený.
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <ScopeTabs value={scope} onChange={setScope} hideAllOption />

            <label className="flex w-full max-w-md items-center gap-3 rounded-full border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-300">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filtrovat hráče podle jména"
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              />
            </label>
          </div>

          {matrix ? <SummaryCards matrix={matrix} /> : null}
        </div>
      </section>

      <section className="panel-soft p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="eyebrow">Legenda</p>
            <h2 className="text-3xl font-semibold text-white">{scopeHeadline[scope]}</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Červená buňka znamená účast bez explicitního markeru v textovém exportu. Zelené buňky jsou připravené jak pro body,
              tak pro góly; aktuální zdroj teď rozlišuje jen variantu s G.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {legend.map((item) => (
              <article key={item.key} className="rounded-[24px] border border-white/10 bg-slate-950/45 px-4 py-4">
                <div className={`inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border px-3 text-sm font-semibold ${item.className}`}>
                  {item.shortLabel || ' '}
                </div>
                <div className="mt-3 text-sm font-semibold text-white">{item.label}</div>
              </article>
            ))}
          </div>
        </div>

        {matrix ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <GitBranch className="h-4 w-4 text-cyan-200" />
                {visibleRows.length} / {matrix.rows.length} hráčů ve filtru
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <Goal className="h-4 w-4 text-emerald-200" />
                {matrix.goalMarks} gólových markerů
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <CircleOff className="h-4 w-4 text-slate-400" />
                {matrix.absentMarks} absencí
              </span>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/40">
              <div className="overflow-auto">
                <table className="min-w-max border-separate border-spacing-0 text-center text-xs text-slate-200">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-20 min-w-[220px] border-b border-r border-white/10 bg-slate-950 px-4 py-3 text-left text-sm font-semibold text-white">
                        Hráč
                      </th>
                      {matrix.seasons.map((season) => (
                        <th
                          key={`${season.label}-${season.startIndex}`}
                          colSpan={season.span}
                          className="border-b border-r border-white/10 bg-slate-900/95 px-2 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100/70"
                        >
                          {season.label}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      <th className="sticky left-0 z-20 border-b border-r border-white/10 bg-slate-950 px-4 py-2 text-left text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        G / X
                      </th>
                      {matrix.columns.map((column) => (
                        <th
                          key={`${column.season}-${column.index}`}
                          className="min-w-9 border-b border-r border-white/10 bg-slate-950/90 px-1 py-2 text-[10px] font-medium text-slate-400"
                        >
                          {column.date}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => (
                      <tr key={row.id}>
                        <th className="sticky left-0 z-10 border-b border-r border-white/10 bg-slate-950 px-4 py-2 text-left align-middle">
                          <div className="text-sm font-semibold text-white">{row.playerName}</div>
                          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                            G {row.goals} / X {row.absences}
                          </div>
                        </th>
                        {row.cells.map((cell, index) => (
                          <td
                            key={`${row.id}-${index}`}
                            title={`${row.playerName} • ${matrix.columns[index]?.date ?? '—'} • ${matrix.columns[index]?.season ?? '—'}`}
                            className={`h-9 min-w-9 border-b border-r px-1 py-1 text-[11px] ${cellTone[cell]}`}
                          >
                            {renderCellValue(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-white/12 bg-slate-950/35 p-8 text-slate-300">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
              <div>{getEmptyState(scope)}</div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};