import { NavLink } from "react-router-dom";
export default function Sidebar() {
  const cls = ({ isActive }) =>
    "block px-3 py-2 rounded-md " +
    (isActive
      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
      : "hover:bg-zinc-100 dark:hover:bg-zinc-800");
  return (
    <aside className="w-60 p-4 border-r border-zinc-200 dark:border-zinc-800">
      <h1 className="font-bold text-lg mb-4">AI Study Planner</h1>
      <nav className="space-y-2">
        <NavLink className={cls} to="/">
          Dashboard
        </NavLink>
        <NavLink to="/courses" className={cls}>
          Courses
        </NavLink>
        <NavLink className={cls} to="/schedule">
          Schedule
        </NavLink>
        <NavLink className={cls} to="/assistant">
          AI Assistant
        </NavLink>
        <NavLink className={cls} to="/analytics">
          Analytics
        </NavLink>
      </nav>
    </aside>
  );
}
