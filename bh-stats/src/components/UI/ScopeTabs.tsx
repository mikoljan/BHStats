import type { SquadId } from '@models/player';

export type TeamScope = SquadId | 'ALL';

export const scopeOptions: Array<{ value: TeamScope; label: string }> = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'ALL', label: 'A+B+C' },
];

interface ScopeTabsProps {
  value: TeamScope;
  onChange: (value: TeamScope) => void;
  hideAllOption?: boolean;
}

export const ScopeTabs = ({ value, onChange, hideAllOption }: ScopeTabsProps) => {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-full border border-white/10 bg-slate-950/50 p-1.5">
      {scopeOptions
        .filter((option) => !(hideAllOption && option.value === 'ALL'))
        .map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              value === option.value
                ? 'bg-cyan-300 text-slate-950 shadow-[0_10px_24px_-16px_rgba(103,232,249,0.9)]'
              : 'text-slate-300 hover:bg-white/6 hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};