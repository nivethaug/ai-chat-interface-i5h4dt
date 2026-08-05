import { NavLink } from "react-router-dom";
import { MessageSquare, Settings, BarChart3, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Chat", icon: MessageSquare },
  { to: "/metrics", label: "Metrics", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  return (
    <aside className="flex h-full w-16 flex-col items-center border-r border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl md:w-60 md:items-stretch md:px-3">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center md:justify-start md:gap-3 md:px-3">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
          <Sparkles className="h-5 w-5 text-white" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 opacity-50 blur-md" aria-hidden="true" />
        </div>
        <span className="hidden font-bold tracking-tight text-white md:block md:text-lg">
          Nexus<span className="text-purple-400">AI</span>
        </span>
      </div>

      {/* Nav links */}
      <nav className="mt-4 flex flex-1 flex-col gap-1.5" aria-label="Main navigation">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "group relative flex h-11 items-center justify-center rounded-xl transition-all duration-300 md:h-10 md:justify-start md:px-3",
                isActive
                  ? "bg-white/5 text-white shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)]"
                  : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-500 md:hidden"
                    aria-hidden="true"
                  />
                )}
                <span className="flex items-center gap-3">
                  <Icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive && "text-purple-400")} />
                  <span className="hidden md:inline">{label}</span>
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User badge */}
      <div className="mb-4 hidden items-center gap-3 rounded-xl bg-white/[0.02] p-3 md:flex">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-white">
          AX
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-zinc-200">Alex Chen</span>
          <span className="text-[10px] text-zinc-500">Pro Plan</span>
        </div>
      </div>
    </aside>
  );
}
