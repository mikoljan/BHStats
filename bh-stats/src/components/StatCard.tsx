interface StatCardProps {
  label: string;
  value: number | string;
}

export const StatCard = ({ label, value }: StatCardProps) => {
  return (
    <div className="rounded-xl bg-white shadow p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
};
