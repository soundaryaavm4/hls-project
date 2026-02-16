interface SeverityBadgeProps {
  severity: "CRITICAL" | "WARNING" | "SUSPICIOUS" | "INFO";
}

const styles: Record<string, string> = {
  CRITICAL: "bg-critical/15 text-critical border-critical/30",
  WARNING: "bg-warning/15 text-warning border-warning/30",
  SUSPICIOUS: "bg-suspicious/15 text-suspicious border-suspicious/30",
  INFO: "bg-info/15 text-info border-info/30",
};

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${styles[severity]}`}>
      {severity}
    </span>
  );
}
