import type { ReactNode } from 'react';

export interface TableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T, index: number) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyState?: string;
  rowKey: (row: T) => string;
}

export function Table<T>({ columns, data, emptyState, rowKey }: TableProps<T>) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 shadow-[0_24px_60px_-30px_rgba(8,47,73,0.65)] backdrop-blur">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left">
        <thead>
          <tr className="bg-white/5 text-xs uppercase tracking-[0.22em] text-slate-300">
            {columns.map((column) => (
              <th key={column.key} className={`px-4 py-4 font-medium ${column.className ?? ''}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-sm text-slate-100">
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr key={rowKey(row)} className="transition hover:bg-cyan-400/6">
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-4 align-middle ${column.className ?? ''}`}>
                    {column.render(row, index)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400">
                {emptyState ?? 'Zatím není co zobrazit.'}
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
}
