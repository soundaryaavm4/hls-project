import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant: "default" | "critical" | "warning" | "suspicious" | "info" | "success";
  subtitle?: string;
}

const variantStyles: Record<string, string> = {
  default: "border-border bg-card",
  critical: "border-critical/30 bg-critical/5",
  warning: "border-warning/30 bg-warning/5",
  suspicious: "border-suspicious/30 bg-suspicious/5",
  info: "border-info/30 bg-info/5",
  success: "border-success/30 bg-success/5",
};

const iconStyles: Record<string, string> = {
  default: "text-primary",
  critical: "text-critical",
  warning: "text-warning",
  suspicious: "text-suspicious",
  info: "text-info",
  success: "text-success",
};

export default function MetricCard({ title, value, icon: Icon, variant, subtitle }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border p-4 ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-md bg-background/50 ${iconStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
