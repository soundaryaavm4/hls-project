import { Shield, Upload, Search, FileText, AlertTriangle, Settings } from "lucide-react";

const sections = [
  {
    icon: Upload,
    title: "Getting Started",
    content: "Upload a .log or .txt file using the sidebar upload button. LogSentinel will automatically parse and analyze the file, extracting timestamps, severity levels, categories, sources, and messages.",
  },
  {
    icon: Shield,
    title: "Dashboard",
    content: "The main dashboard provides an at-a-glance view of your system's security posture. Metric cards show total events, critical/warning/suspicious counts, and overall system health. Charts visualize event timelines and severity distribution.",
  },
  {
    icon: AlertTriangle,
    title: "Alerts & Incidents",
    content: "The alerts page shows all events sorted by priority score. Filter by severity level using tabs. Click any alert for detailed information including raw log data and remediation guidance. View IOCs (Indicators of Compromise) detected from your logs.",
  },
  {
    icon: Search,
    title: "Log Search & Filtering",
    content: "Use the search bar to find specific keywords. Filter by severity level, category, or date range. Sort by timestamp or priority score. Click on any log entry to expand details.",
  },
  {
    icon: FileText,
    title: "Reports",
    content: "Generate comprehensive reports in TXT or PDF format. Reports include an executive summary, category breakdown, top alerts, IOCs, and remediation guidance. Download and share reports with stakeholders.",
  },
  {
    icon: Settings,
    title: "Offline vs Online Mode",
    content: "LogSentinel supports two modes: Offline (Air-Gapped) for isolated networks where all processing runs locally, and Online mode for connected systems. Toggle between modes in Settings or the sidebar. Core functionality is identical in both modes.",
  },
];

const severityGuide = [
  { level: "CRITICAL", color: "text-critical", desc: "Requires immediate attention. Potential security breach, system failure, or data compromise." },
  { level: "WARNING", color: "text-warning", desc: "Notable events that may indicate issues. Should be investigated within a reasonable timeframe." },
  { level: "SUSPICIOUS", color: "text-suspicious", desc: "Anomalous activity that warrants monitoring. May indicate reconnaissance or early-stage attacks." },
  { level: "INFO", color: "text-info", desc: "Normal operational events. Retained for audit trails and correlation with other events." },
];

export default function Help() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground">Help & Documentation</h1>
      <p className="text-sm text-muted-foreground">
        LogSentinel is a portable log analysis system designed for cybersecurity teams operating in both connected and air-gapped environments.
      </p>

      <div className="space-y-4">
        {sections.map((s) => (
          <div key={s.title} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>

      {/* Severity Guide */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Severity Level Guide</h3>
        <div className="space-y-2">
          {severityGuide.map((s) => (
            <div key={s.level} className="flex items-start gap-3">
              <span className={`text-xs font-bold w-24 shrink-0 ${s.color}`}>{s.level}</span>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Supported Formats */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Supported Log Formats</h3>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Syslog (RFC 3164 / RFC 5424)</li>
          <li>Apache / Nginx access and error logs</li>
          <li>Windows Event Log exports</li>
          <li>Firewall logs (iptables, pfSense, etc.)</li>
          <li>Custom application logs with standard timestamp formats</li>
          <li>Any .txt or .log file with line-delimited entries</li>
        </ul>
      </div>
    </div>
  );
}
