import { useState, useMemo } from "react";
import { LogEntry } from "@/lib/logParser";
import SeverityBadge from "./SeverityBadge";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

interface LogTableProps {
  logs: LogEntry[];
  maxRows?: number;
}

export default function LogTable({ logs, maxRows = 100 }: LogTableProps) {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"timestamp" | "priorityScore">("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(logs.map((l) => l.category));
    return ["ALL", ...Array.from(cats).sort()];
  }, [logs]);

  const filtered = useMemo(() => {
    return logs
      .filter((l) => {
        if (severityFilter !== "ALL" && l.severity !== severityFilter) return false;
        if (categoryFilter !== "ALL" && l.category !== categoryFilter) return false;
        if (search && !l.message.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        const mul = sortDir === "asc" ? 1 : -1;
        if (sortField === "timestamp") return mul * (a.timestamp.getTime() - b.timestamp.getTime());
        return mul * (a.priorityScore - b.priorityScore);
      })
      .slice(0, maxRows);
  }, [logs, search, severityFilter, categoryFilter, sortField, sortDir, maxRows]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field ? (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />) : null;

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-secondary border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 bg-secondary border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="ALL">All Severity</option>
          <option value="CRITICAL">Critical</option>
          <option value="WARNING">Warning</option>
          <option value="SUSPICIOUS">Suspicious</option>
          <option value="INFO">Info</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-secondary border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} of {logs.length} entries shown</p>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="px-3 py-2.5 text-left cursor-pointer hover:text-foreground" onClick={() => toggleSort("timestamp")}>
                  <span className="flex items-center gap-1">Time <SortIcon field="timestamp" /></span>
                </th>
                <th className="px-3 py-2.5 text-left">Severity</th>
                <th className="px-3 py-2.5 text-left">Category</th>
                <th className="px-3 py-2.5 text-left">Source</th>
                <th className="px-3 py-2.5 text-left cursor-pointer hover:text-foreground" onClick={() => toggleSort("priorityScore")}>
                  <span className="flex items-center gap-1">Priority <SortIcon field="priorityScore" /></span>
                </th>
                <th className="px-3 py-2.5 text-left">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-secondary/30 cursor-pointer transition-colors"
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                >
                  <td className="px-3 py-2 font-mono text-xs whitespace-nowrap text-muted-foreground">
                    {log.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="px-3 py-2"><SeverityBadge severity={log.severity} /></td>
                  <td className="px-3 py-2 text-xs">{log.category}</td>
                  <td className="px-3 py-2 text-xs font-mono">{log.source}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-8 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full ${log.priorityScore >= 80 ? "bg-critical" : log.priorityScore >= 60 ? "bg-warning" : "bg-info"}`}
                          style={{ width: `${log.priorityScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{log.priorityScore}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs font-mono max-w-[400px] truncate">{log.message}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground text-sm">No logs match your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
