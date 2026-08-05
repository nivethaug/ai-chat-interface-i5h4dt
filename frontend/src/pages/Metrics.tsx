import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Clock,
  Zap,
  DollarSign,
  Activity,
  Cpu,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  Types & mock data                                                 */
/* ------------------------------------------------------------------ */

interface MetricCard {
  label: string;
  value: string;
  change: number;
  icon: typeof MessageSquare;
  gradient: string;
  glow: string;
}

interface DailyUsage {
  day: string;
  messages: number;
  tokens: number;
  cost: number;
}

interface ModelBreakdown {
  name: string;
  value: number;
  color: string;
}

interface LatencyPoint {
  hour: string;
  p50: number;
  p95: number;
  p99: number;
}

interface RecentQuery {
  id: string;
  prompt: string;
  model: string;
  tokens: number;
  latency: number;
  status: "success" | "timeout" | "error";
  timestamp: string;
}

const METRICS: MetricCard[] = [
  {
    label: "Total Messages",
    value: "48,927",
    change: 12.5,
    icon: MessageSquare,
    gradient: "from-indigo-500 to-blue-500",
    glow: "shadow-indigo-500/20",
  },
  {
    label: "Avg Response Time",
    value: "1.24s",
    change: -8.3,
    icon: Clock,
    gradient: "from-emerald-500 to-cyan-500",
    glow: "shadow-cyan-500/20",
  },
  {
    label: "Tokens Consumed",
    value: "12.4M",
    change: 22.1,
    icon: Zap,
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/20",
  },
  {
    label: "Monthly Cost",
    value: "$486.20",
    change: 5.7,
    icon: DollarSign,
    gradient: "from-purple-500 to-pink-500",
    glow: "shadow-purple-500/20",
  },
];

const DAILY_USAGE: DailyUsage[] = [
  { day: "Mon", messages: 3200, tokens: 890000, cost: 42 },
  { day: "Tue", messages: 4100, tokens: 1100000, cost: 55 },
  { day: "Wed", messages: 3800, tokens: 950000, cost: 48 },
  { day: "Thu", messages: 5200, tokens: 1400000, cost: 72 },
  { day: "Fri", messages: 6100, tokens: 1650000, cost: 85 },
  { day: "Sat", messages: 2800, tokens: 620000, cost: 31 },
  { day: "Sun", messages: 2400, tokens: 540000, cost: 27 },
];

const MODEL_BREAKDOWN: ModelBreakdown[] = [
  { name: "Nexus 4 Turbo", value: 48, color: "#8b5cf6" },
  { name: "Nexus 4 Mini", value: 28, color: "#6366f1" },
  { name: "Nexus 3 Opus", value: 16, color: "#a855f7" },
  { name: "CodeForge v2", value: 8, color: "#ec4899" },
];

const LATENCY: LatencyPoint[] = [
  { hour: "00", p50: 0.8, p95: 2.1, p99: 3.4 },
  { hour: "04", p50: 0.6, p95: 1.5, p99: 2.8 },
  { hour: "08", p50: 1.1, p95: 2.8, p99: 4.5 },
  { hour: "12", p50: 1.4, p95: 3.2, p99: 5.1 },
  { hour: "16", p50: 1.3, p95: 3.0, p99: 4.8 },
  { hour: "20", p50: 0.9, p95: 2.3, p99: 3.9 },
];

const RECENT_QUERIES: RecentQuery[] = [
  { id: "q1", prompt: "Explain React Server Components data fetching", model: "Nexus 4 Turbo", tokens: 3420, latency: 1.2, status: "success", timestamp: "2m ago" },
  { id: "q2", prompt: "Optimize Postgres query with 2M rows", model: "Nexus 4 Turbo", tokens: 5680, latency: 2.4, status: "success", timestamp: "8m ago" },
  { id: "q3", prompt: "Debug Kubernetes deployment YAML", model: "CodeForge v2", tokens: 2100, latency: 0.8, status: "success", timestamp: "15m ago" },
  { id: "q4", prompt: "Generate unit tests for debounce function", model: "Nexus 4 Mini", tokens: 1850, latency: 0.6, status: "success", timestamp: "23m ago" },
  { id: "q5", prompt: "Summarize 50-page PDF research paper", model: "Nexus 3 Opus", tokens: 12400, latency: 8.9, status: "timeout", timestamp: "31m ago" },
  { id: "q6", prompt: "Convert Python script to TypeScript", model: "CodeForge v2", tokens: 4200, latency: 1.5, status: "success", timestamp: "44m ago" },
];

const TIME_RANGES = ["24h", "7d", "30d", "90d"];

/* ------------------------------------------------------------------ */
/*  Custom tooltip                                                    */
/* ------------------------------------------------------------------ */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0d0d18] px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium text-zinc-300">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color || entry.stroke }} className="font-mono">
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function Metrics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [timeRange]);

  const statusColors: Record<RecentQuery["status"], string> = {
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    timeout: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    error: "bg-red-500/15 text-red-400 border-red-500/20",
  };

  return (
    <div className="h-full overflow-y-auto bg-[#070710]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/30">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Metrics & Analytics</h1>
              <p className="text-sm text-zinc-500">Track your AI usage, performance, and costs</p>
            </div>
          </div>

          {/* Time range selector */}
          <div className="flex gap-1 rounded-xl border border-white/5 bg-white/[0.02] p-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  timeRange === range
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]" />
            ))}
          </div>
        ) : (
          <div className="aria-live-polite" aria-live="polite">
            {/* Metric cards */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {METRICS.map((m) => {
                const positive = m.change >= 0;
                const isGood = m.label.includes("Time") ? !positive : positive;
                return (
                  <div
                    key={m.label}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.015] p-5 shadow-lg transition-all duration-300 hover:border-white/10 hover:shadow-xl",
                      m.glow
                    )}
                  >
                    <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition-opacity group-hover:opacity-20", m.gradient)} aria-hidden="true" />
                    <div className="relative flex items-start justify-between">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg", m.gradient)}>
                        <m.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className={cn("flex items-center gap-1 text-xs font-semibold", isGood ? "text-emerald-400" : "text-red-400")}>
                        {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(m.change)}%
                      </div>
                    </div>
                    <div className="relative mt-4">
                      <p className="text-2xl font-bold text-white">{m.value}</p>
                      <p className="mt-1 text-xs text-zinc-500">{m.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts row */}
            <div className="mb-6 grid gap-4 lg:grid-cols-3">
              {/* Message volume area chart */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-5 lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-400" />
                    <h2 className="text-sm font-semibold text-zinc-200">Message Volume</h2>
                  </div>
                  <Badge variant="outline" className="border-purple-500/20 text-purple-300">Last 7 days</Badge>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={DAILY_USAGE}>
                    <defs>
                      <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="day" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                    <RTooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="messages"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#msgGrad)"
                      name="Messages"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Model usage pie chart */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-indigo-400" />
                  <h2 className="text-sm font-semibold text-zinc-200">Model Usage</h2>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={MODEL_BREAKDOWN}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {MODEL_BREAKDOWN.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <RTooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex flex-col gap-1.5">
                  {MODEL_BREAKDOWN.map((m) => (
                    <div key={m.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                        <span className="text-zinc-400">{m.name}</span>
                      </div>
                      <span className="font-mono text-zinc-300">{m.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Latency bar chart */}
            <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.015] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold text-zinc-200">Response Latency (seconds)</h2>
                </div>
                <div className="flex gap-3 text-[10px]">
                  <span className="flex items-center gap-1.5 text-zinc-400"><span className="h-2 w-2 rounded-full bg-indigo-500" />P50</span>
                  <span className="flex items-center gap-1.5 text-zinc-400"><span className="h-2 w-2 rounded-full bg-purple-500" />P95</span>
                  <span className="flex items-center gap-1.5 text-zinc-400"><span className="h-2 w-2 rounded-full bg-pink-500" />P99</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={LATENCY} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="hour" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} unit=":00" />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} unit="s" />
                  <RTooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="p50" fill="#6366f1" radius={[4, 4, 0, 0]} name="P50" />
                  <Bar dataKey="p95" fill="#a855f7" radius={[4, 4, 0, 0]} name="P95" />
                  <Bar dataKey="p99" fill="#ec4899" radius={[4, 4, 0, 0]} name="P99" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent queries table */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-zinc-200">Recent Queries</h2>
                </div>
                <span className="text-xs text-zinc-500">{RECENT_QUERIES.length} entries</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-zinc-500">
                      <th className="pb-3 pr-4 font-medium">Prompt</th>
                      <th className="pb-3 pr-4 font-medium">Model</th>
                      <th className="pb-3 pr-4 text-right font-medium">Tokens</th>
                      <th className="pb-3 pr-4 text-right font-medium">Latency</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_QUERIES.map((q) => (
                      <tr key={q.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                        <td className="max-w-xs truncate py-3 pr-4 text-zinc-200">{q.prompt}</td>
                        <td className="py-3 pr-4">
                          <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-zinc-400">{q.model}</span>
                        </td>
                        <td className="py-3 pr-4 text-right font-mono text-zinc-300">{q.tokens.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-right font-mono text-zinc-300">{q.latency}s</td>
                        <td className="py-3 pr-4">
                          <span className={cn("inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize", statusColors[q.status])}>
                            {q.status}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-zinc-500">{q.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
