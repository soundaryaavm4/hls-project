import { useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import SeverityBadge from "@/components/SeverityBadge";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Timeline() {
  const { logs, stats } = useApp();
  const [dateFilter, setDateFilter] = useState("");

  const filteredLogs = useMemo(() => {
    if (!dateFilter) return logs;
    return logs.filter((l) => l.timestamp.toISOString().startsWith(dateFilter));
  }, [logs, dateFilter]);

  const uniqueDates = useMemo(() => {
    const dates = new Set(logs.map((l) => l.timestamp.toISOString().split("T")[0]));
    return Array.from(dates).sort();
  }, [logs]);

  if (!stats || logs.length === 0) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Upload a log file to view timeline</p></div>;
  }

  const burstEvents = stats.burstDetection.filter((b) => b.isBurst);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Event Timeline</h1>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-1.5 bg-secondary border border-border rounded-md text-xs text-foreground focus:outline-none"
        >
          <option value="">All Dates</option>
          {uniqueDates.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Trend Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Activity Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={stats.timeline}>
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(222, 44%, 8%)", border: "1px solid hsl(222, 30%, 16%)", borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="critical" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%)" fillOpacity={0.2} />
            <Area type="monotone" dataKey="warning" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Burst Detection */}
      {burstEvents.length > 0 && (
        <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-warning mb-2">⚡ Burst Detection</h3>
          <div className="flex flex-wrap gap-2">
            {burstEvents.map((b, i) => (
              <span key={i} className="bg-warning/10 border border-warning/20 text-warning text-xs px-2 py-1 rounded-md font-mono">
                {b.time} — {b.count} events
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timeline List */}
      <div className="relative pl-6 space-y-0.5">
        <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />
        {filteredLogs.slice(0, 200).map((log) => (
          <div key={log.id} className="relative flex items-start gap-3 py-1.5">
            <div className={`absolute left-[-17px] top-2.5 w-2 h-2 rounded-full ${
              log.severity === "CRITICAL" ? "bg-critical" : log.severity === "WARNING" ? "bg-warning" : log.severity === "SUSPICIOUS" ? "bg-suspicious" : "bg-info"
            }`} />
            <span className="text-[10px] font-mono text-muted-foreground w-16 shrink-0 pt-0.5">{log.timestamp.toLocaleTimeString()}</span>
            <SeverityBadge severity={log.severity} />
            <span className="text-xs text-muted-foreground">{log.category}</span>
            <span className="text-xs font-mono truncate text-foreground">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
