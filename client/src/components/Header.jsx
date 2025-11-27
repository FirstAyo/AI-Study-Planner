import ThemeToggle from "./ThemeToggle.jsx";
export default function Header({ onOpenModal, onLogout }) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
      <div className="text-sm text-zinc-500">Welcome back 👋</div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenModal}
          className="px-3 py-2 rounded-md bg-zinc-900 text-white hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
        >
          ➕ Add Task
        </button>
        <ThemeToggle />
        <button
          onClick={onLogout}
          className="px-3 py-2 rounded-md border text-sm"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
