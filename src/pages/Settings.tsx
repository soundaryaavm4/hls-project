import { useApp } from "@/contexts/AppContext";
import { Sun, Moon, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme, isOnline, toggleMode, clearLogs, fileName } = useApp();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Theme */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors ${
              theme === "dark" ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="w-4 h-4" /> Dark
          </button>
          <button
            onClick={() => setTheme("light")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors ${
              theme === "light" ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun className="w-4 h-4" /> Light
          </button>
        </div>
      </div>

      {/* Mode */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Operating Mode</h3>
        <p className="text-xs text-muted-foreground">Switch between offline (air-gapped) and online mode.</p>
        <button
          onClick={toggleMode}
          className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
            isOnline ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/10 text-warning"
          }`}
        >
          Currently: {isOnline ? "Online Mode" : "Offline Mode (Air-Gapped)"}
        </button>
      </div>

      {/* Data */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Data Management</h3>
        <p className="text-xs text-muted-foreground">
          {fileName ? `Current file: ${fileName}` : "No file loaded"}
        </p>
        <button
          onClick={clearLogs}
          disabled={!fileName}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" /> Clear All Data
        </button>
      </div>

      {/* About */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-2">
        <h3 className="text-sm font-semibold text-foreground">About LogSentinel</h3>
        <p className="text-xs text-muted-foreground">Version 1.0.0 — Portable Log Analysis for Isolated Systems</p>
        <p className="text-xs text-muted-foreground">All processing runs locally in your browser. No data is sent to external servers.</p>
      </div>
    </div>
  );
}
