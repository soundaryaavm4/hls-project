import { useApp } from "@/contexts/AppContext";
import { useCallback } from "react";
import { Download, FileText } from "lucide-react";
import { getRemediation, generateIOCs } from "@/lib/logParser";
import jsPDF from "jspdf";

export default function Reports() {
  const { logs, stats, fileName } = useApp();

  const generateTextReport = useCallback(() => {
    if (!stats) return;
    const lines: string[] = [
      "═══════════════════════════════════════════",
      "  LOG ANALYSIS REPORT — LogSentinel",
      "═══════════════════════════════════════════",
      `Generated: ${new Date().toLocaleString()}`,
      `Source File: ${fileName}`,
      "",
      "── EXECUTIVE SUMMARY ──",
      `Total Events: ${stats.total}`,
      `Critical: ${stats.critical}  |  Warning: ${stats.warning}  |  Suspicious: ${stats.suspicious}  |  Info: ${stats.info}`,
      `System Health Score: ${stats.healthScore}%`,
      "",
      "── CATEGORY BREAKDOWN ──",
      ...Object.entries(stats.categories).sort((a, b) => b[1] - a[1]).map(([k, v]) => `  ${k}: ${v}`),
      "",
      "── TOP CRITICAL/WARNING EVENTS ──",
      ...logs.filter((l) => l.severity === "CRITICAL" || l.severity === "WARNING")
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, 20)
        .map((l) => `  [${l.severity}] ${l.timestamp.toLocaleString()} | ${l.category} | ${l.message}`),
      "",
      "── IOCs ──",
      ...generateIOCs(logs).slice(0, 10).map((ioc) => `  ${ioc.type}: ${ioc.value} (${ioc.severity}, seen ${ioc.count}x)`),
      "",
      "── REMEDIATION GUIDANCE ──",
      ...["CRITICAL", "WARNING", "SUSPICIOUS"].map((sev) => {
        const cats = new Set(logs.filter((l) => l.severity === sev).map((l) => l.category));
        return Array.from(cats).map((cat) => `  [${sev}/${cat}]: ${getRemediation(sev as any, cat)}`);
      }).flat(),
      "",
      "═══════════════════════════════════════════",
      "  End of Report",
      "═══════════════════════════════════════════",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `log-report-${Date.now()}.txt`;
    a.click();
  }, [logs, stats, fileName]);

  const generatePDFReport = useCallback(() => {
    if (!stats) return;
    const doc = new jsPDF();
    let y = 20;
    const addLine = (text: string, size = 10, bold = false) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.text(text, 15, y);
      y += size * 0.5 + 2;
    };

    addLine("LOG ANALYSIS REPORT", 18, true);
    addLine(`Generated: ${new Date().toLocaleString()}`);
    addLine(`Source: ${fileName}`);
    y += 5;
    addLine("EXECUTIVE SUMMARY", 14, true);
    addLine(`Total Events: ${stats.total}`);
    addLine(`Critical: ${stats.critical} | Warning: ${stats.warning} | Suspicious: ${stats.suspicious} | Info: ${stats.info}`);
    addLine(`System Health: ${stats.healthScore}%`);
    y += 5;
    addLine("CATEGORY BREAKDOWN", 14, true);
    Object.entries(stats.categories).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => addLine(`  ${k}: ${v}`));
    y += 5;
    addLine("TOP ALERTS", 14, true);
    logs.filter((l) => l.severity === "CRITICAL").sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 10)
      .forEach((l) => addLine(`  [${l.severity}] ${l.message.slice(0, 80)}`, 8));
    y += 5;
    addLine("IOCs", 14, true);
    generateIOCs(logs).slice(0, 10).forEach((ioc) => addLine(`  ${ioc.type}: ${ioc.value} (×${ioc.count})`, 8));

    doc.save(`log-report-${Date.now()}.pdf`);
  }, [logs, stats, fileName]);

  if (!stats || logs.length === 0) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Upload a log file to generate reports</p></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Reports & Export</h1>

      {/* Executive Summary */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Executive Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div><p className="text-2xl font-bold text-foreground">{stats.total}</p><p className="text-xs text-muted-foreground">Total Events</p></div>
          <div><p className="text-2xl font-bold text-critical">{stats.critical}</p><p className="text-xs text-muted-foreground">Critical</p></div>
          <div><p className="text-2xl font-bold text-warning">{stats.warning}</p><p className="text-xs text-muted-foreground">Warnings</p></div>
          <div><p className={`text-2xl font-bold ${stats.healthScore >= 70 ? "text-success" : "text-critical"}`}>{stats.healthScore}%</p><p className="text-xs text-muted-foreground">Health Score</p></div>
        </div>
        <p className="text-sm text-muted-foreground">
          Analysis of <strong className="text-foreground">{fileName}</strong> reveals {stats.critical} critical events
          across {Object.keys(stats.categories).length} categories.
          {stats.healthScore < 50 && " Immediate attention is required."}
          {stats.healthScore >= 70 && " The system appears to be in a healthy state."}
        </p>
      </div>

      {/* Download Buttons */}
      <div className="flex gap-3">
        <button onClick={generateTextReport} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <FileText className="w-4 h-4" /> Download TXT Report
        </button>
        <button onClick={generatePDFReport} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Download className="w-4 h-4" /> Download PDF Report
        </button>
      </div>

      {/* Top Alerts Table */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Priority Alert Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="px-3 py-2 text-left">Severity</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-left">Count</th>
                <th className="px-3 py-2 text-left">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(["CRITICAL", "WARNING", "SUSPICIOUS"] as const).map((sev) => {
                const cats = new Map<string, number>();
                logs.filter((l) => l.severity === sev).forEach((l) => cats.set(l.category, (cats.get(l.category) || 0) + 1));
                return Array.from(cats.entries()).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                  <tr key={`${sev}-${cat}`} className="hover:bg-secondary/30">
                    <td className="px-3 py-2"><span className={`text-${sev === "CRITICAL" ? "critical" : sev === "WARNING" ? "warning" : "suspicious"}`}>{sev}</span></td>
                    <td className="px-3 py-2 text-foreground">{cat}</td>
                    <td className="px-3 py-2 text-foreground font-mono">{count}</td>
                    <td className="px-3 py-2 text-muted-foreground max-w-[300px]">{getRemediation(sev, cat)}</td>
                  </tr>
                ));
              }).flat()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
