import { create } from "zustand";
import type { AgileRate } from "../types";
import { useSettingsStore } from "./useSettingsStore";

interface RateState {
  rates: AgileRate[];
  isLoading: boolean;
  error: string | null;
  setRates: (rates: AgileRate[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchRates: () => Promise<void>;
}

export const useRateStore = create<RateState>((set) => ({
  rates: [],
  isLoading: false,
  error: null,
  setRates: (rates) => set({ rates }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  fetchRates: async () => {
    const { apiKey, mpan, serial, agilePlanVersion, region } =
      useSettingsStore.getState();

    if (!apiKey || !mpan || !serial) {
      set({ error: "Please configure API key, MPAN, and serial in Settings." });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const url =
        `https://api.octopus.energy/v1/products/${agilePlanVersion}` +
        `/electricity-tariffs/E-1R-${agilePlanVersion}-${region}/standard-unit-rates/`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${btoa(apiKey + ":")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Filter to today and tomorrow only, sort ascending
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const tomorrowEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 2,
      );

      const filtered = (data.results as AgileRate[])
        .filter((r) => {
          const from = new Date(r.valid_from);
          return from >= todayStart && from < tomorrowEnd;
        })
        .sort(
          (a, b) =>
            new Date(a.valid_from).getTime() - new Date(b.valid_from).getTime(),
        );

      set({ rates: filtered, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch rates",
        isLoading: false,
      });
    }
  },
}));
