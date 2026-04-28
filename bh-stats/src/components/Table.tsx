import { useEffect, useMemo, useState, type ReactNode } from 'react';

type SortDirection = 'asc' | 'desc';
type SortableValue = number | string | null | undefined;

export interface TableColumn<T> {
  key: string;
  header: string;
  headerTooltip?: string;
  className?: string;
  render: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: T, index: number) => SortableValue;
  compare?: (left: T, right: T) => number;
}

interface DefaultSort {
  columnKey: string;
  direction: SortDirection;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyState?: string;
  rowKey: (row: T) => string;
  defaultSort?: DefaultSort;
}

const compareValues = (left: SortableValue, right: SortableValue) => {
  if (left == null && right == null) {
    return 0;
  }

  if (left == null) {
    return 1;
  }

  if (right == null) {
    return -1;
  }

  if (typeof left === 'string' || typeof right === 'string') {
    return String(left).localeCompare(String(right), 'cs');
  }

  return left - right;
};

export function Table<T>({ columns, data, emptyState, rowKey, defaultSort }: TableProps<T>) {
  const [sortState, setSortState] = useState<DefaultSort | null>(defaultSort ?? null);

  useEffect(() => {
    if (!sortState) {
      if (defaultSort) {
        setSortState(defaultSort);
      }
      return;
    }

    const hasColumn = columns.some((column) => column.key === sortState.columnKey && column.sortable);

    if (!hasColumn) {
      setSortState(defaultSort ?? null);
    }
  }, [columns, defaultSort, sortState]);

  const sortedData = useMemo(() => {
    if (!sortState) {
      return data;
    }

    const column = columns.find((entry) => entry.key === sortState.columnKey && entry.sortable);

    if (!column) {
      return data;
    }

    const directionMultiplier = sortState.direction === 'asc' ? 1 : -1;

    return [...data].sort((left, right) => {
      const comparison = column.compare
        ? column.compare(left, right)
        : compareValues(
            column.sortValue?.(left, data.indexOf(left)),
            column.sortValue?.(right, data.indexOf(right)),
          );

      if (comparison !== 0) {
        return comparison * directionMultiplier;
      }

      return String(rowKey(left)).localeCompare(String(rowKey(right)), 'cs');
    });
  }, [columns, data, rowKey, sortState]);

  const toggleSort = (column: TableColumn<T>) => {
    if (!column.sortable) {
      return;
    }

    setSortState((current) => {
      if (!current || current.columnKey !== column.key) {
        return {
          columnKey: column.key,
          direction: 'desc',
        };
      }

      return {
        columnKey: column.key,
        direction: current.direction === 'desc' ? 'asc' : 'desc',
      };
    });
  };

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 shadow-[0_24px_60px_-30px_rgba(8,47,73,0.65)] backdrop-blur">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left">
        <thead>
          <tr className="bg-white/5 text-xs uppercase tracking-[0.22em] text-slate-300">
            {columns.map((column) => (
              <th key={column.key} className={`px-4 py-4 font-medium ${column.className ?? ''}`}>
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(column)}
                    title={column.headerTooltip}
                    className="inline-flex items-center gap-2 transition hover:text-white"
                  >
                    <span>{column.header}</span>
                    <span className="text-[10px] text-slate-500">
                      {sortState?.columnKey === column.key ? (sortState.direction === 'desc' ? '▼' : '▲') : '↕'}
                    </span>
                  </button>
                ) : (
                  <span title={column.headerTooltip}>{column.header}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-sm text-slate-100">
          {sortedData.length > 0 ? (
            sortedData.map((row, index) => (
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
