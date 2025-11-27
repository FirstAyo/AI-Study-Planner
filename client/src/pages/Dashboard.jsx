import StatCard from "../components/StatCard.jsx";
export default function Dashboard({ todayCount = 0, backlogCount = 0 }) {
  return (
    <div className="p-4 grid gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Today's Tasks" value={todayCount} />
        <StatCard label="Backlog" value={backlogCount} />
        <StatCard
          label="Study Hours (est.)"
          value={(todayCount * 0.8).toFixed(1)}
        />
        <StatCard label="Subjects" value="—" />
      </div>
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <h3 className="font-semibold mb-2">Getting started</h3>
        <p className="text-sm text-zinc-500">
          Use “➕ Add Task” to create study sessions.
        </p>
      </div>
    </div>
  );
}
