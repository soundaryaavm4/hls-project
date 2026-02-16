import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import SeverityBadge from "@/components/SeverityBadge";
import { getRemediation, generateIOCs } from "@/lib/logParser";
import { ShieldAlert, AlertTriangle, Activity, Info, ChevronRight } from "lucide-react";

const SEVERITY_TABS = ["ALL", "CRITICAL", "WARNING", "SUSPICIOUS", "INFO"] as const;

const tabIcons: Record<string, React.ReactNode> = {
  ALL: null,
  CRITICAL: <ShieldAlert className="w-3.5 h-3.5" />,
  WARNING: <AlertTriangle className="w-3.5 h-3.5" />,
  SUSPICIOUS: <Activity className="w-3.5 h-3.5" />,
  INFO: <Info className="w-3.5 h-3.5" />,
};

const tabColors: Record<string, string> = {
  ALL: "text-foreground",
  CRITICAL: "text-critical",
  WARNING: "text-warning",
  SUSPICIOUS: "text-suspicious",
  INFO: "text-info",
};

export default function Alerts() {
  const { logs, stats } = useApp();
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showIOCs, setShowIOCs] = useState(false);

  if (!stats || logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Upload a log file to see alerts</p>
      </div>
    );
  }

  const filtered = activeTab === "ALL" ? logs : logs.filter((l) => l.severity === activeTab);
  const sorted = [...filtered].sort((a, b) => b.priorityScore - a.priorityScore);
  const selected = selectedId ? logs.find((l) => l.id === selectedId) : null;
  const iocs = showIOCs ? generateIOCs(logs) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Alerts & Incidents</h1>
        <button
          onClick={() => setShowIOCs(!showIOCs)}
          className="text-xs px-3 py-1.5 bg-secondary border border-border rounded-md text-muted-foreground hover:text-foreground transition-colors"
        >
          {showIOCs ? "Hide IOCs" : "Show IOCs"}
        </button>
      </div>

      {/* IOC Panel */}
      {showIOCs && iocs.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Indicators of Compromise (IOCs)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {iocs.slice(0, 12).map((ioc, i) => (
              <div key={i} className="flex items-center justify-between bg-secondary/50 rounded-md px-3 py-2 text-xs">
                <span className="font-mono text-foreground">{ioc.value}</span>
                <span className="flex items-center gap-2">
                  <SeverityBadge severity={ioc.severity as any} />
                  <span className="text-muted-foreground">×{ioc.count}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
        {SEVERITY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === tab ? "bg-card shadow-sm " + tabColors[tab] : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tabIcons[tab]}
            {tab}
            <span className="text-[10px] opacity-60">
              ({tab === "ALL" ? logs.length : logs.filter((l) => l.severity === tab).length})
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alert List */}
        <div className="lg:col-span-2 space-y-1.5 max-h-[65vh] overflow-y-auto scrollbar-thin">
          {sorted.slice(0, 100).map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedId(log.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedId === log.id ? "border-primary/30 bg-primary/5" : "border-border bg-card hover:bg-secondary/30"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <SeverityBadge severity={log.severity} />
                  <span className="text-[10px] text-muted-foreground">{log.category}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{log.timestamp.toLocaleString()}</span>
                </div>
                <p className="text-xs font-mono truncate text-foreground">{log.message}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="bg-card border border-border rounded-lg p-4 h-fit sticky top-6">
          {selected ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Alert Details</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Severity</span><SeverityBadge severity={selected.severity} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="text-foreground">{selected.category}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span className="font-mono text-foreground">{selected.source}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><span className="text-foreground font-semibold">{selected.priorityScore}/100</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="text-foreground">{selected.timestamp.toLocaleString()}</span></div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Raw Log</p>
                <pre className="text-[11px] font-mono bg-secondary rounded-md p-2 whitespace-pre-wrap break-all text-foreground">{selected.raw}</pre>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Remediation</p>
                <p className="text-xs text-foreground bg-success/5 border border-success/20 rounded-md p-2">
                  {getRemediation(selected.severity, selected.category)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Select an alert to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}
