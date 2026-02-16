export interface LogEntry {
  id: string;
  timestamp: Date;
  severity: "CRITICAL" | "WARNING" | "SUSPICIOUS" | "INFO";
  category: string;
  source: string;
  message: string;
  raw: string;
  priorityScore: number;
}

export interface LogStats {
  total: number;
  critical: number;
  warning: number;
  suspicious: number;
  info: number;
  healthScore: number;
  categories: Record<string, number>;
  sources: Record<string, number>;
  timeline: { time: string; critical: number; warning: number; suspicious: number; info: number }[];
  burstDetection: { time: string; count: number; isBurst: boolean }[];
}

const SEVERITY_PATTERNS: [RegExp, LogEntry["severity"]][] = [
  [/\b(CRITICAL|CRIT|FATAL|EMERGENCY|EMERG)\b/i, "CRITICAL"],
  [/\b(WARNING|WARN)\b/i, "WARNING"],
  [/\b(SUSPICIOUS|SUSPECT|ALERT|THREAT)\b/i, "SUSPICIOUS"],
  [/\b(INFO|INFORMATION|NOTICE|DEBUG|TRACE)\b/i, "INFO"],
];

const CATEGORY_PATTERNS: [RegExp, string][] = [
  [/\b(auth|login|logout|password|credential|access denied|unauthorized)\b/i, "Authentication"],
  [/\b(firewall|blocked|denied|drop|reject|iptables)\b/i, "Firewall"],
  [/\b(network|connection|socket|tcp|udp|dns|http|https)\b/i, "Network"],
  [/\b(file|disk|storage|write|read|permission|chmod)\b/i, "File System"],
  [/\b(process|service|daemon|systemd|cron|pid)\b/i, "System"],
  [/\b(database|sql|query|table|insert|update|delete)\b/i, "Database"],
  [/\b(memory|cpu|load|performance|swap|oom)\b/i, "Performance"],
  [/\b(malware|virus|trojan|ransomware|exploit|vulnerability)\b/i, "Malware"],
  [/\b(error|exception|fail|crash|panic|abort)\b/i, "Error"],
];

const TIMESTAMP_PATTERNS = [
  /(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/,
  /(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})/,
  /(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/,
  /(\d{10,13})/,
];

const SOURCE_PATTERN = /\b(?:from|src|source|host|server|client)[=: ]+([^\s,;]+)/i;
const BRACKET_SOURCE = /\[([a-zA-Z0-9._-]+)\]/;

let idCounter = 0;

function extractTimestamp(line: string): Date {
  for (const pattern of TIMESTAMP_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      const d = new Date(match[1]);
      if (!isNaN(d.getTime())) return d;
      // Try epoch
      const num = parseInt(match[1]);
      if (num > 1e9 && num < 1e13) return new Date(num * 1000);
      if (num > 1e12) return new Date(num);
    }
  }
  return new Date();
}

function extractSeverity(line: string): LogEntry["severity"] {
  for (const [pattern, severity] of SEVERITY_PATTERNS) {
    if (pattern.test(line)) return severity;
  }
  // Heuristic
  if (/error|fail|crash/i.test(line)) return "WARNING";
  return "INFO";
}

function extractCategory(line: string): string {
  for (const [pattern, category] of CATEGORY_PATTERNS) {
    if (pattern.test(line)) return category;
  }
  return "General";
}

function extractSource(line: string): string {
  const srcMatch = line.match(SOURCE_PATTERN);
  if (srcMatch) return srcMatch[1];
  const bracketMatch = line.match(BRACKET_SOURCE);
  if (bracketMatch) return bracketMatch[1];
  return "Unknown";
}

function calculatePriority(severity: LogEntry["severity"], category: string): number {
  const severityScores: Record<string, number> = { CRITICAL: 90, WARNING: 60, SUSPICIOUS: 75, INFO: 20 };
  const categoryBonus: Record<string, number> = { Authentication: 10, Malware: 15, Firewall: 5 };
  return (severityScores[severity] || 20) + (categoryBonus[category] || 0);
}

export function parseLogs(content: string): LogEntry[] {
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  return lines.map((line) => {
    const severity = extractSeverity(line);
    const category = extractCategory(line);
    return {
      id: `log-${++idCounter}`,
      timestamp: extractTimestamp(line),
      severity,
      category,
      source: extractSource(line),
      message: line.trim(),
      raw: line,
      priorityScore: calculatePriority(severity, category),
    };
  });
}

export function computeStats(logs: LogEntry[]): LogStats {
  const critical = logs.filter((l) => l.severity === "CRITICAL").length;
  const warning = logs.filter((l) => l.severity === "WARNING").length;
  const suspicious = logs.filter((l) => l.severity === "SUSPICIOUS").length;
  const info = logs.filter((l) => l.severity === "INFO").length;
  const total = logs.length;

  const healthScore = total === 0 ? 100 : Math.max(0, Math.round(100 - (critical * 10 + warning * 3 + suspicious * 5) / Math.max(total, 1) * 100));

  const categories: Record<string, number> = {};
  const sources: Record<string, number> = {};
  logs.forEach((l) => {
    categories[l.category] = (categories[l.category] || 0) + 1;
    sources[l.source] = (sources[l.source] || 0) + 1;
  });

  // Timeline - group by hour
  const timeMap = new Map<string, { critical: number; warning: number; suspicious: number; info: number }>();
  logs.forEach((l) => {
    const key = `${l.timestamp.getMonth() + 1}/${l.timestamp.getDate()} ${String(l.timestamp.getHours()).padStart(2, "0")}:00`;
    if (!timeMap.has(key)) timeMap.set(key, { critical: 0, warning: 0, suspicious: 0, info: 0 });
    const entry = timeMap.get(key)!;
    if (l.severity === "CRITICAL") entry.critical++;
    else if (l.severity === "WARNING") entry.warning++;
    else if (l.severity === "SUSPICIOUS") entry.suspicious++;
    else entry.info++;
  });
  const timeline = Array.from(timeMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([time, counts]) => ({ time, ...counts }));

  // Burst detection - per minute
  const burstMap = new Map<string, number>();
  logs.forEach((l) => {
    const key = `${l.timestamp.getHours()}:${String(l.timestamp.getMinutes()).padStart(2, "0")}`;
    burstMap.set(key, (burstMap.get(key) || 0) + 1);
  });
  const avgPerMinute = total / Math.max(burstMap.size, 1);
  const burstDetection = Array.from(burstMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([time, count]) => ({ time, count, isBurst: count > avgPerMinute * 3 }));

  return { total, critical, warning, suspicious, info, healthScore, categories, sources, timeline, burstDetection };
}

export function getRemediation(severity: LogEntry["severity"], category: string): string {
  const remediations: Record<string, Record<string, string>> = {
    CRITICAL: {
      Authentication: "Immediately lock affected accounts, rotate credentials, and review access logs for lateral movement.",
      Malware: "Isolate affected systems, run full AV scan, check for persistence mechanisms, and notify incident response team.",
      Firewall: "Block source IPs immediately, review firewall rules, check for rule tampering.",
      default: "Escalate to senior security analyst. Isolate affected systems and begin incident response procedures.",
    },
    WARNING: {
      Authentication: "Review failed login patterns, consider temporary account lockout, notify user if legitimate.",
      Network: "Monitor connection patterns, verify source legitimacy, update network ACLs if needed.",
      default: "Monitor closely for escalation. Review related logs within the same time window.",
    },
    SUSPICIOUS: {
      default: "Investigate source and pattern. Correlate with other events. Consider adding to watchlist.",
    },
    INFO: {
      default: "No action required. Log retained for audit and correlation purposes.",
    },
  };
  return remediations[severity]?.[category] || remediations[severity]?.default || "Review and assess based on context.";
}

export function generateIOCs(logs: LogEntry[]): { type: string; value: string; severity: string; count: number }[] {
  const ipPattern = /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g;
  const iocs = new Map<string, { type: string; severity: string; count: number }>();

  logs.filter((l) => l.severity !== "INFO").forEach((l) => {
    const ips = l.message.match(ipPattern);
    if (ips) {
      ips.forEach((ip) => {
        const key = `IP:${ip}`;
        const existing = iocs.get(key);
        if (existing) existing.count++;
        else iocs.set(key, { type: "IP Address", severity: l.severity, count: 1 });
      });
    }
  });

  return Array.from(iocs.entries())
    .map(([key, data]) => ({ ...data, value: key.split(":")[1] }))
    .sort((a, b) => b.count - a.count);
}
