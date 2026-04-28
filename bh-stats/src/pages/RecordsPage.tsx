import { useEffect, useState } from 'react';
import { Clock3, Medal, Sparkles, Star, Zap } from 'lucide-react';
import { Table } from '@components/Table';
import { ScopeTabs, type TeamScope } from '@components/UI/ScopeTabs';
import { getPlayerRecordBook, type PlayerRecordBookResponse } from '@utils/api';
import type { RecordBookIconName, RecordBookRow } from '@utils/recordsBookData';

const iconMap: Record<RecordBookIconName, typeof Medal> = {
  zap: Zap,
  sparkles: Sparkles,
  medal: Medal,
  star: Star,
  clock: Clock3,
};

const readCell = (row: RecordBookRow, key: string) => row[key] ?? '—';

const getSectionGridClassName = (gridClassName: string, tableCount: number) => {
  if (tableCount <= 1) {
    return 'grid-cols-1';
  }

  if (gridClassName.includes('grid-cols-3')) {
    return 'grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3';
  }

  return 'grid-cols-1 xl:grid-cols-2';
};

const getTableCardClassName = (columnCount: number, rowCount: number) => {
  const isWide = columnCount >= 5 || rowCount >= 12;
  const isMedium = columnCount >= 4 || rowCount >= 8;

  if (isWide) {
    return 'xl:col-span-2';
  }

  if (isMedium) {
    return '2xl:col-span-2';
  }

  return '';
};

export const RecordsPage = () => {
  const [scope, setScope] = useState<TeamScope>('A');
  const [recordBook, setRecordBook] = useState<PlayerRecordBookResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      const nextRecordBook = await getPlayerRecordBook(scope);
      setRecordBook(nextRecordBook);
    };

    void load();
  }, [scope]);

  const heroStats = recordBook?.heroStats ?? [];
  const sections = recordBook?.sections ?? [];
  const hasDetailedData = sections.length > 0;

  return (
    <div className="space-y-8">
      <section className="hero-panel overflow-hidden rounded-[36px] p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.12),transparent_28%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="eyebrow">Rekordbook</p>
            <h1 className="section-title text-4xl sm:text-5xl">Hráčské rekordy v tabulkách</h1>
            <p className="mt-4 max-w-3xl text-slate-300">
              Přehled je navržený jako kronika hráčských rekordů. Místo jedné dlouhé tabulky dostaneš několik jasně oddělených
              bloků pro speciální týmy, hattricky a největší střelecké večery jednotlivců.
            </p>
            <div className="mt-5">
              <ScopeTabs value={scope} onChange={setScope} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[520px] xl:grid-cols-4">
            {heroStats.map((item) => (
              <article key={item.label} className="rounded-[28px] border border-white/10 bg-slate-950/55 px-4 py-4 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</div>
                <div className="mt-2 text-3xl font-bold text-white">{item.value}</div>
                <div className="mt-1 text-sm text-slate-300">{item.note}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {hasDetailedData ? (
        sections.map((section) => (
          <section key={section.key} className="panel-soft p-5 sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">{section.eyebrow}</p>
                <h2 className="text-3xl font-semibold text-white">{section.title}</h2>
              </div>
              <p className="max-w-3xl text-sm text-slate-300">{section.description}</p>
            </div>

            <div className={`grid gap-6 ${getSectionGridClassName(section.gridClassName, section.tables.length)}`}>
              {section.tables.map((table) => {
                const Icon = iconMap[table.iconName];
                const tableCardClassName = getTableCardClassName(table.columns.length, table.rows.length);

                return (
                  <article key={table.key} className={`overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/45 ${tableCardClassName}`}>
                    <div className={`bg-gradient-to-r ${table.accentClassName} px-5 py-4`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">{table.eyebrow}</div>
                          <h3 className="mt-1 text-xl font-semibold text-white">{table.title}</h3>
                          <p className="mt-2 text-sm text-slate-300">{table.caption}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                    <div className="px-4 pb-4 pt-4">
                      <Table
                        columns={[
                          { key: 'rank', header: '#', className: 'w-14 text-slate-400', render: (_, index) => index + 1 },
                          ...table.columns.map((column) => ({
                            key: String(column.key),
                            header: column.header,
                            className: column.className,
                            render: (row: RecordBookRow) => readCell(row, column.key),
                          })),
                        ]}
                        data={table.rows}
                        rowKey={(row) => row.id}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))
      ) : (
        <section className="panel-soft p-8 text-slate-300">
          Pro vybraný scope zatím backend nevrátil žádné hráčské rekordy.
        </section>
      )}
    </div>
  );
};
