import { useApp } from "@/contexts/AppContext";
import MetricCard from "@/components/MetricCard";
import LogTable from "@/components/LogTable";
import { AlertTriangle, ShieldAlert, ShieldCheck, Info, Activity, Upload, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

const COLORS = {
  critical: "hsl(0, 72%, 51%)",
  warning: "hsl(38, 92%, 50%)",
  suspicious: "hsl(25, 95%, 53%)",
  info: "hsl(217, 70%, 50%)",
};

export default function Dashboard() {
  const { logs, stats, fileName } = useApp();

  if (!stats || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <Upload className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">No Logs Loaded</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Upload a .log or .txt file using the sidebar to begin analysis. All processing happens locally in your browser.
        </p>
      </div>
    );
  }

  const pieData = [
    { name: "Critical", value: stats.critical, color: COLORS.critical },
    { name: "Warning", value: stats.warning, color: COLORS.warning },
    { name: "Suspicious", value: stats.suspicious, color: COLORS.suspicious },
    { name: "Info", value: stats.info, color: COLORS.info },
  ].filter((d) => d.value > 0);

  const categoryData = Object.entries(stats.categories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Security Dashboard</h1>
          <p className="text-sm text-muted-foreground">Analyzing: {fileName}</p>
        </div>
        <div className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-md">
          {logs.length.toLocaleString()} events processed
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard title="Total Logs" value={stats.total.toLocaleString()} icon={BarChart3} variant="default" />
        <MetricCard title="Critical" value={stats.critical} icon={ShieldAlert} variant="critical" subtitle={`${((stats.critical / stats.total) * 100).toFixed(1)}%`} />
        <MetricCard title="Warning" value={stats.warning} icon={AlertTriangle} variant="warning" subtitle={`${((stats.warning / stats.total) * 100).toFixed(1)}%`} />
        <MetricCard title="Suspicious" value={stats.suspicious} icon={Activity} variant="suspicious" subtitle={`${((stats.suspicious / stats.total) * 100).toFixed(1)}%`} />
        <MetricCard title="System Health" value={`${stats.healthScore}%`} icon={stats.healthScore >= 70 ? ShieldCheck : ShieldAlert} variant={stats.healthScore >= 70 ? "success" : "critical"} subtitle={stats.healthScore >= 70 ? "Healthy" : "At Risk"} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timeline */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Event Timeline</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.timeline}>
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 44%, 8%)", border: "1px solid hsl(222, 30%, 16%)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="critical" stackId="1" stroke={COLORS.critical} fill={COLORS.critical} fillOpacity={0.3} />
              <Area type="monotone" dataKey="warning" stackId="1" stroke={COLORS.warning} fill={COLORS.warning} fillOpacity={0.3} />
              <Area type="monotone" dataKey="suspicious" stackId="1" stroke={COLORS.suspicious} fill={COLORS.suspicious} fillOpacity={0.3} />
              <Area type="monotone" dataKey="info" stackId="1" stroke={COLORS.info} fill={COLORS.info} fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 44%, 8%)", border: "1px solid hsl(222, 30%, 16%)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Category Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Events by Category</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryData} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} width={90} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(222, 44%, 8%)", border: "1px solid hsl(222, 30%, 16%)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="value" fill="hsl(187, 85%, 53%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Log Table */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Events</h3>
        <LogTable logs={logs} maxRows={50} />
      </div>
    </div>
  );
}
