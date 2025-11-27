export default function StatCard({ label, value }) {
  return (
    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
