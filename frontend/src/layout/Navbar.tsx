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
    <>
      {/* Desktop Sidebar — hidden on mobile */}
      <aside
        data-testid="navbar-desktop"
        className="hidden h-full w-60 flex-col border-r border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl md:flex md:items-stretch md:px-3"
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-start gap-3 px-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
            <Sparkles className="h-5 w-5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 opacity-50 blur-md" aria-hidden="true" />
          </div>
          <span className="font-bold tracking-tight text-white text-lg">
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
              data-testid={`navbar-link-${label.toLowerCase()}`}
              className={({ isActive }) =>
                cn(
                  "group relative flex h-10 items-center justify-start rounded-xl px-3 transition-all duration-300",
                  isActive
                    ? "bg-white/5 text-white shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)]"
                    : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                )
              }
            >
              {({ isActive }) => (
                <span className="flex items-center gap-3">
                  <Icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive && "text-purple-400")} />
                  <span className="inline">{label}</span>
                </span>
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

      {/* Mobile Bottom Navigation Bar */}
      <nav
        data-testid="navbar-mobile"
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around border-t border-white/10 bg-[#0a0a0f]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        style={{ height: "calc(3.75rem + env(safe-area-inset-bottom))" }}
      >
        {/* Brand mark on far left */}
        <div className="absolute left-0 top-0 -translate-y-full flex items-center gap-2 px-4 py-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold tracking-tight text-white text-sm">
            Nexus<span className="text-purple-400">AI</span>
          </span>
        </div>

        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            data-testid={`navbar-link-${label.toLowerCase()}-mobile`}
            className={({ isActive }) =>
              cn(
                "group relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-all duration-200",
                isActive ? "text-white" : "text-zinc-400"
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Top active indicator bar */}
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-gradient-to-r from-indigo-400 to-purple-500"
                    aria-hidden="true"
                  />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive ? "scale-110 text-purple-400" : "group-active:scale-90"
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "text-[10px] font-medium leading-tight transition-colors",
                    isActive && "text-purple-300"
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
