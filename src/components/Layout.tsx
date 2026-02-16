import { useApp } from "@/contexts/AppContext";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, AlertTriangle, Clock, Settings, HelpCircle, LogOut, Shield, Wifi, WifiOff, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useCallback } from "react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/alerts", icon: AlertTriangle, label: "Alerts" },
  { to: "/timeline", icon: Clock, label: "Timeline" },
  { to: "/reports", icon: FileText, label: "Reports" },
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/help", icon: HelpCircle, label: "Help" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isOnline, toggleMode, userName, logout, uploadLogs, fileName } = useApp();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      uploadLogs(ev.target?.result as string, file.name);
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [uploadLogs]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <input
        ref={fileInputRef}
        type="file"
        accept=".log,.txt"
        className="hidden"
        onChange={handleFileUpload}
      />
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-border bg-sidebar shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            <div>
              <h1 className="font-bold text-sm text-foreground">LogSentinel</h1>
              <p className="text-[10px] text-muted-foreground">Portable Log Analysis</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.to === "/alerts" && (
                <span className="ml-auto text-[10px] bg-critical/20 text-critical px-1.5 py-0.5 rounded-full font-medium">!</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Upload button */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {fileName ? "Upload New File" : "Upload Log File"}
          </button>
          {fileName && (
            <p className="text-[10px] text-muted-foreground mt-1.5 truncate px-1">
              📄 {fileName}
            </p>
          )}
        </div>

        {/* Mode toggle + user */}
        <div className="p-3 border-t border-border space-y-3">
          <button
            onClick={toggleMode}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <span className="flex items-center gap-2">
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-success" /> : <WifiOff className="w-3.5 h-3.5 text-warning" />}
              {isOnline ? "Online" : "Offline"}
            </span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${isOnline ? "bg-success/30" : "bg-muted"}`}>
              <motion.div
                className={`w-3 h-3 rounded-full absolute top-0.5 ${isOnline ? "bg-success" : "bg-muted-foreground"}`}
                animate={{ left: isOnline ? 18 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          </button>

          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-muted-foreground truncate">{userName}</span>
            <button onClick={logout} className="text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto scrollbar-thin">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
