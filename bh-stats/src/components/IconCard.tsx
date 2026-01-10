interface IconCardProps {
  icon: any;
  label: string;
}

export const IconCard = ({ icon, label }: IconCardProps) => {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white shadow p-4">
      <div className="text-xl">{icon}</div>
      <span>{label}</span>
    </div>
  );
};
