import { useEffect, useState } from "react";
export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  return (
    <button
      className="px-3 py-2 rounded-md border text-sm hover:bg-black/5 dark:hover:bg-white/10"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? "🌙 Dark" : "🌞 Light"}
    </button>
  );
}
