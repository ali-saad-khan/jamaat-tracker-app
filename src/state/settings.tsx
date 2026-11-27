import { useSQLiteContext } from "expo-sqlite";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { DEFAULT_SETTINGS, loadSettings, saveSettings, type AppSettings } from "@/data/settings";

interface SettingsValue {
  settings: AppSettings;
  /** False until the saved settings have been read, so screens do not flash the defaults. */
  ready: boolean;
  update(patch: Partial<AppSettings>): Promise<void>;
}

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void loadSettings(db).then((s) => {
      setSettings(s);
      setReady(true);
    });
  }, [db]);

  const update = useCallback(
    async (patch: Partial<AppSettings>) => {
      await saveSettings(db, patch);
      setSettings((current) => ({ ...current, ...patch }));
    },
    [db],
  );

  return (
    <SettingsContext.Provider value={{ settings, ready, update }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error("useSettings must be used inside SettingsProvider");
  return value;
}
