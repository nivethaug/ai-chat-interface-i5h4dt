import { useState, useMemo, useCallback } from "react";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  FileType,
  FileDown,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type ReportType = "usage" | "cost" | "performance" | "conversations";
type ExportFormat = "csv" | "pdf" | "excel";
type ReportStatus = "ready" | "generating" | "scheduled";

interface ReportRecord {
  id: string;
  name: string;
  type: ReportType;
  dateRange: string;
  createdAt: string;
  size: string;
  status: ReportStatus;
  rows: number;
}

interface ToastMsg {
  type: "success" | "info";
  message: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const REPORT_TYPES: { id: ReportType; label: string; desc: string; icon: typeof FileText }[] = [
  { id: "usage", label: "Usage Report", desc: "Message counts, token usage, and activity metrics", icon: BarChart3 },
  { id: "cost", label: "Cost Analysis", desc: "Breakdown of API costs by model and time period", icon: TrendingUp },
  { id: "performance", label: "Performance Report", desc: "Latency, throughput, and error rate analytics", icon: Clock },
  { id: "conversations", label: "Conversation Log", desc: "Full export of chat history with metadata", icon: FileText },
];

const EXISTING_REPORTS: ReportRecord[] = [
  { id: "r1", name: "Weekly Usage — Week 31", type: "usage", dateRange: "Jul 29 – Aug 4", createdAt: "Aug 5, 10:24 AM", size: "2.4 MB", status: "ready", rows: 48927 },
  { id: "r2", name: "Q3 Cost Breakdown", type: "cost", dateRange: "Jul 1 – Aug 4", createdAt: "Aug 4, 4:12 PM", size: "890 KB", status: "ready", rows: 1284 },
  { id: "r3", name: "Performance Audit — July", type: "performance", dateRange: "Jul 1 – Jul 31", createdAt: "Aug 1, 9:00 AM", size: "1.7 MB", status: "ready", rows: 31200 },
  { id: "r4", name: "Conversation Export — Engineering", type: "conversations", dateRange: "Jul 15 – Aug 5", createdAt: "Aug 5, 8:30 AM", size: "12.3 MB", status: "generating", rows: 0 },
  { id: "r5", name: "Monthly Usage — June", type: "usage", dateRange: "Jun 1 – Jun 30", createdAt: "Jul 1, 10:00 AM", size: "3.1 MB", status: "ready", rows: 52100 },
  { id: "r6", name: "Cost Forecast Q3", type: "cost", dateRange: "Aug 1 – Sep 30", createdAt: "Aug 3, 2:00 PM", size: "—", status: "scheduled", rows: 0 },
];

const TYPE_COLORS: Record<ReportType, string> = {
  usage: "from-indigo-500 to-blue-500",
  cost: "from-purple-500 to-pink-500",
  performance: "from-emerald-500 to-cyan-500",
  conversations: "from-amber-500 to-orange-500",
};

const STATUS_BADGES: Record<ReportStatus, { label: string; className: string }> = {
  ready: { label: "Ready", className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" },
  generating: { label: "Generating", className: "border-amber-500/20 bg-amber-500/10 text-amber-400" },
  scheduled: { label: "Scheduled", className: "border-indigo-500/20 bg-indigo-500/10 text-indigo-400" },
};

const EXPORT_FORMATS: { id: ExportFormat; label: string; icon: typeof FileDown; ext: string }[] = [
  { id: "csv", label: "CSV", icon: FileSpreadsheet, ext: ".csv" },
  { id: "pdf", label: "PDF", icon: FileType, ext: ".pdf" },
  { id: "excel", label: "Excel", icon: FileDown, ext: ".xlsx" },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function Reports() {
  const [selectedType, setSelectedType] = useState<ReportType>("usage");
  const [datePreset, setDatePreset] = useState("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv");
  const [reports, setReports] = useState<ReportRecord[]>(EXISTING_REPORTS);
  const [generating, setGenerating] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [toast, setToast] = useState<ToastMsg | null>(null);

  const showToast = useCallback((type: ToastMsg["type"], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    showToast("info", `Generating ${REPORT_TYPES.find((t) => t.id === selectedType)?.label}...`);

    const newReport: ReportRecord = {
      id: `r-${Date.now()}`,
      name: `${REPORT_TYPES.find((t) => t.id === selectedType)?.label} — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      type: selectedType,
      dateRange: customFrom && customTo ? `${customFrom} – ${customTo}` : datePreset === "7d" ? "Last 7 days" : datePreset === "30d" ? "Last 30 days" : datePreset === "90d" ? "Last 90 days" : "Custom",
      createdAt: "Just now",
      size: "—",
      status: "generating",
      rows: 0,
    };

    setTimeout(() => {
      setReports((prev) => [
        { ...newReport, status: "ready", size: "1.8 MB", rows: Math.floor(Math.random() * 50000) + 5000, createdAt: "Just now" },
        ...prev,
      ]);
      setGenerating(false);
      showToast("success", "Report generated successfully");
    }, 2000);
  }, [selectedType, datePreset, customFrom, customTo, showToast]);

  const handleDownload = useCallback(
    (report: ReportRecord) => {
      if (report.status !== "ready") return;
      showToast("success", `Downloading "${report.name}" as ${selectedFormat.toUpperCase()}`);
    },
    [selectedFormat, showToast]
  );

  const filteredReports = useMemo(() => {
    if (filterType === "all") return reports;
    return reports.filter((r) => r.type === filterType);
  }, [reports, filterType]);

  const readyCount = reports.filter((r) => r.status === "ready").length;
  const totalSize = reports
    .filter((r) => r.size !== "—")
    .reduce((acc, r) => {
      const num = parseFloat(r.size);
      return acc + (r.size.includes("MB") ? num * 1024 : num);
    }, 0);

  return (
    <div className="h-full overflow-y-auto bg-[#070710]">
      {/* Toast */}
      {toast && (
        <div
          aria-live="assertive"
          className={cn(
            "fixed right-6 top-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl",
            toast.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
          )}
        >
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <RefreshCw className="h-4 w-4 animate-spin" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/30">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Reports</h1>
            <p className="text-sm text-zinc-500">Generate, view, and export your AI activity reports</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-5">
            <div className="flex items-center gap-2 text-zinc-500">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Total Reports</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-white">{reports.length}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-5">
            <div className="flex items-center gap-2 text-zinc-500">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Ready to Download</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-emerald-400">{readyCount}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-5">
            <div className="flex items-center gap-2 text-zinc-500">
              <Download className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Total Size</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-white">{(totalSize / 1024).toFixed(1)} MB</p>
          </div>
        </div>

        {/* Report generator */}
        <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.015] p-6">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-zinc-200">Generate New Report</h2>
          </div>

          {/* Report type selector */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-medium text-zinc-500">Report Type</label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {REPORT_TYPES.map(({ id, label, desc, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedType(id)}
                  className={cn(
                    "group flex flex-col gap-2 rounded-xl border p-4 text-left transition-all duration-300",
                    selectedType === id
                      ? "border-purple-500/40 bg-purple-500/[0.06] shadow-[0_0_20px_-5px_rgba(139,92,246,0.4)]"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                  )}
                >
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br shadow-md", TYPE_COLORS[id])}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-zinc-200">{label}</span>
                  <span className="text-[10px] leading-relaxed text-zinc-500">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-medium text-zinc-500">Date Range</label>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={datePreset} onValueChange={setDatePreset}>
                <SelectTrigger className="w-[180px] border-white/10 bg-white/[0.03] text-zinc-100">
                  <Calendar className="mr-2 h-3.5 w-3.5 text-zinc-500" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="ytd">Year to date</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>

              {datePreset === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    aria-label="Start date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 focus:border-purple-500/50 focus:outline-none"
                  />
                  <span className="text-zinc-500">→</span>
                  <input
                    type="date"
                    aria-label="End date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Export format */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-medium text-zinc-500">Export Format</label>
            <div className="flex gap-3">
              {EXPORT_FORMATS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedFormat(id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                    selectedFormat === id
                      ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                      : "border-white/5 bg-white/[0.02] text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-purple-400/50 hover:brightness-110 disabled:opacity-60"
          >
            {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
            {generating ? "Generating..." : "Generate Report"}
          </button>
        </div>

        {/* Existing reports */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-zinc-200">Recent Reports</h2>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px] border-white/10 bg-white/[0.03] text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="usage">Usage</SelectItem>
                <SelectItem value="cost">Cost</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="conversations">Conversations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-zinc-500">
                  <th className="pb-3 pr-4 font-medium">Report Name</th>
                  <th className="pb-3 pr-4 font-medium">Date Range</th>
                  <th className="pb-3 pr-4 text-right font-medium">Rows</th>
                  <th className="pb-3 pr-4 font-medium">Size</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Created</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500">No reports match this filter</td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="group border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br", TYPE_COLORS[report.type])}>
                            {REPORT_TYPES.find((t) => t.id === report.type)?.icon && (
                              (() => {
                                const Icon = REPORT_TYPES.find((t) => t.id === report.type)!.icon;
                                return <Icon className="h-3.5 w-3.5 text-white" />;
                              })()
                            )}
                          </div>
                          <span className="font-medium text-zinc-200">{report.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-xs text-zinc-400">{report.dateRange}</td>
                      <td className="py-3 pr-4 text-right font-mono text-zinc-300">{report.rows > 0 ? report.rows.toLocaleString() : "—"}</td>
                      <td className="py-3 pr-4 text-xs text-zinc-400">{report.size}</td>
                      <td className="py-3 pr-4">
                        <span className={cn("inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium", STATUS_BADGES[report.status].className)}>
                          {STATUS_BADGES[report.status].label}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-zinc-500">{report.createdAt}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDownload(report)}
                          disabled={report.status !== "ready"}
                          aria-label={`Download ${report.name}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Download</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredReports.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
              <span>Showing {filteredReports.length} of {reports.length} reports</span>
              <button className="flex items-center gap-1 text-zinc-400 transition-colors hover:text-zinc-200">
                View all reports
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
