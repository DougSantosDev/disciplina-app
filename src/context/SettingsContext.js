import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '@/storage/settingsStorage';

// Contexto central para configuracoes do app.
const SettingsContext = createContext(null);

// Provider com carga inicial e persistencia das configuracoes.
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Recarrega configuracoes do storage.
  const refresh = useCallback(async () => {
    setLoading(true);
    const stored = await loadSettings();
    setSettings(stored);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Aplica patch e persiste em AsyncStorage.
  const updateSettings = useCallback((patch) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      void saveSettings(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ settings, loading, refresh, updateSettings }),
    [settings, loading, refresh, updateSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// Hook de consumo do contexto.
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
