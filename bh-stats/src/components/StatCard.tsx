interface StatCardProps {
  label: string;
  value: number | string;
  helper?: string;
}

export const StatCard = ({ label, value, helper }: StatCardProps) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.9)] backdrop-blur">
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">{label}</div>
      <div className="mt-3 text-3xl font-bold text-white">{value}</div>
      {helper ? <div className="mt-2 text-sm text-slate-300">{helper}</div> : null}
    </div>
  );
};
