import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OctopusSettings } from "../types";

const defaults: OctopusSettings = {
  apiKey: import.meta.env.VITE_OCTOPUS_API_KEY ?? "",
  mpan: import.meta.env.VITE_OCTOPUS_MPAN ?? "",
  serial: import.meta.env.VITE_OCTOPUS_SERIAL ?? "",
  agilePlanVersion:
    import.meta.env.VITE_OCTOPUS_AGILE_PLAN_VERSION ?? "AGILE-FLEX-22-11-25",
  region: import.meta.env.VITE_OCTOPUS_REGION ?? "H",
  ofgemCapRate: 24.5,
  notificationsEnabled: false,
};

interface SettingsState extends OctopusSettings {
  updateSettings: (partial: Partial<OctopusSettings>) => void;
  resetToDefaults: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      updateSettings: (partial) => set(partial),
      resetToDefaults: () => set(defaults),
    }),
    {
      name: "octopus-settings",
      partialize: (state) => ({
        apiKey: state.apiKey,
        mpan: state.mpan,
        serial: state.serial,
        agilePlanVersion: state.agilePlanVersion,
        region: state.region,
        ofgemCapRate: state.ofgemCapRate,
        notificationsEnabled: state.notificationsEnabled,
      }),
    },
  ),
);
