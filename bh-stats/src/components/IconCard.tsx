interface IconCardProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
}

export const IconCard = ({ icon, label, value }: IconCardProps) => {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-cyan-400/15 bg-slate-900/65 p-4 shadow-[0_18px_50px_-24px_rgba(14,165,233,0.45)] backdrop-blur">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">{icon}</div>
      <div>
        <div className="text-sm text-slate-300">{label}</div>
        {value ? <div className="text-lg font-semibold text-white">{value}</div> : null}
      </div>
    </div>
  );
};
