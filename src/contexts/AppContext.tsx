import React, { createContext, useContext, useState, useCallback } from "react";
import { LogEntry, LogStats, parseLogs, computeStats } from "@/lib/logParser";

interface AppState {
  logs: LogEntry[];
  stats: LogStats | null;
  isOnline: boolean;
  theme: "dark" | "light";
  isAuthenticated: boolean;
  userName: string;
  fileName: string;
}

interface AppContextType extends AppState {
  uploadLogs: (content: string, fileName: string) => void;
  toggleMode: () => void;
  setTheme: (theme: "dark" | "light") => void;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  clearLogs: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    logs: [],
    stats: null,
    isOnline: false,
    theme: "dark",
    isAuthenticated: false,
    userName: "",
    fileName: "",
  });

  const uploadLogs = useCallback((content: string, fileName: string) => {
    const parsed = parseLogs(content);
    const stats = computeStats(parsed);
    setState((s) => ({ ...s, logs: parsed, stats, fileName }));
  }, []);

  const toggleMode = useCallback(() => {
    setState((s) => ({ ...s, isOnline: !s.isOnline }));
  }, []);

  const setTheme = useCallback((theme: "dark" | "light") => {
    setState((s) => ({ ...s, theme }));
    if (theme === "light") {
      document.documentElement.classList.add("theme-light");
    } else {
      document.documentElement.classList.remove("theme-light");
    }
  }, []);

  const login = useCallback((user: string, pass: string) => {
    // Simple demo auth - in production use proper auth
    if (user.trim() && pass.length >= 4) {
      setState((s) => ({ ...s, isAuthenticated: true, userName: user }));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, isAuthenticated: false, userName: "" }));
  }, []);

  const clearLogs = useCallback(() => {
    setState((s) => ({ ...s, logs: [], stats: null, fileName: "" }));
  }, []);

  return (
    <AppContext.Provider value={{ ...state, uploadLogs, toggleMode, setTheme, login, logout, clearLogs }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
