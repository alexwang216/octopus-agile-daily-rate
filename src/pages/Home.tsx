import { useCallback, useEffect, useMemo, useState } from "react";
import { useRateStore } from "../store/useRateStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useNegativeNotifications } from "../hooks/useNegativeNotifications";
import RateChart from "../components/RateChart";
import type { AgileRate } from "../types";
import { getRateColor, NEGATIVE_COLOR } from "../utils/rateColor";

function getDateStr(d: Date): string {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function formatSlot(from: string, to: string): string {
  const d1 = new Date(from);
  const d2 = new Date(to);
  const t1 = `${String(d1.getHours()).padStart(2, "0")}:${String(d1.getMinutes()).padStart(2, "0")}`;
  const t2 = `${String(d2.getHours()).padStart(2, "0")}:${String(d2.getMinutes()).padStart(2, "0")}`;
  return `${t1} - ${t2}`;
}

function formatSlotShort(from: string): string {
  const d = new Date(from);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function findCurrentSlot(rates: AgileRate[]): AgileRate | null {
  const now = new Date();
  return (
    rates.find(
      (r) => new Date(r.valid_from) <= now && now < new Date(r.valid_to),
    ) ?? null
  );
}

function getTodayStr(): string {
  return getDateStr(new Date());
}

function getTomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return getDateStr(d);
}

/** Group consecutive negative-rate slots into time ranges */
function getNegativeRanges(
  rates: AgileRate[],
): { from: string; to: string }[] {
  const negative = rates
    .filter((r) => r.value_inc_vat < 0)
    .sort(
      (a, b) =>
        new Date(a.valid_from).getTime() - new Date(b.valid_from).getTime(),
    );
  if (negative.length === 0) return [];

  const ranges: { from: string; to: string }[] = [];
  let start = negative[0].valid_from;
  let end = negative[0].valid_to;

  for (let i = 1; i < negative.length; i++) {
    if (negative[i].valid_from === end) {
      // Consecutive — extend range
      end = negative[i].valid_to;
    } else {
      ranges.push({ from: start, to: end });
      start = negative[i].valid_from;
      end = negative[i].valid_to;
    }
  }
  ranges.push({ from: start, to: end });
  return ranges;
}

function Home() {
  const { rates, isLoading, error, fetchRates } = useRateStore();
  const { ofgemCapRate, notificationsEnabled } = useSettingsStore();
  useNegativeNotifications(rates, notificationsEnabled);
  const [tableOpen, setTableOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<"today" | "tomorrow">(
    "today",
  );
  const [toast, setToast] = useState<string | null>(null);
  const [slotTick, setSlotTick] = useState(0);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const todayStr = getTodayStr();
  const tomorrowStr = getTomorrowStr();

  const hasTodayRates = useMemo(
    () => rates.some((r) => getDateStr(new Date(r.valid_from)) === todayStr),
    [rates, todayStr],
  );

  const hasTomorrowRates = useMemo(
    () =>
      rates.some((r) => getDateStr(new Date(r.valid_from)) === tomorrowStr),
    [rates, tomorrowStr],
  );

  const filteredRates = useMemo(() => {
    const targetDate = selectedDay === "today" ? todayStr : tomorrowStr;
    return rates.filter(
      (r) => getDateStr(new Date(r.valid_from)) === targetDate,
    );
  }, [rates, selectedDay, todayStr, tomorrowStr]);

  const currentSlot = useMemo(
    () => findCurrentSlot(rates),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rates, slotTick],
  );

  // Auto-update current slot at the next boundary + on app resume
  useEffect(() => {
    const bump = () => setSlotTick((t) => t + 1);

    // Timer for the exact slot boundary
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (currentSlot) {
      const delay =
        new Date(currentSlot.valid_to).getTime() - Date.now() + 100;
      if (delay > 0) {
        timer = setTimeout(bump, delay);
      }
    }

    // Re-check when app returns from background
    const onVisible = () => {
      if (document.visibilityState === "visible") bump();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [currentSlot]);

  const { lowest, highest, min, max } = useMemo(() => {
    if (filteredRates.length === 0)
      return { lowest: null, highest: null, min: 0, max: 0 };
    let lo = filteredRates[0];
    let hi = filteredRates[0];
    for (const r of filteredRates) {
      if (r.value_inc_vat < lo.value_inc_vat) lo = r;
      if (r.value_inc_vat > hi.value_inc_vat) hi = r;
    }
    return {
      lowest: lo,
      highest: hi,
      min: lo.value_inc_vat,
      max: hi.value_inc_vat,
    };
  }, [filteredRates]);

  const averageRate = useMemo(() => {
    if (filteredRates.length === 0) return 0;
    const sum = filteredRates.reduce((s, r) => s + r.value_inc_vat, 0);
    return Number((sum / filteredRates.length).toFixed(2));
  }, [filteredRates]);

  // Negative price detection across both days
  const negativeLines = useMemo(() => {
    const todayRates = rates.filter(
      (r) => getDateStr(new Date(r.valid_from)) === todayStr,
    );
    const tomorrowRates = rates.filter(
      (r) => getDateStr(new Date(r.valid_from)) === tomorrowStr,
    );
    const todayRanges = getNegativeRanges(todayRates);
    const tomorrowRanges = getNegativeRanges(tomorrowRates);
    if (todayRanges.length === 0 && tomorrowRanges.length === 0) return null;

    const formatRange = (r: { from: string; to: string }) =>
      `${formatSlotShort(r.from)} - ${formatSlotShort(r.to)}`;

    const lines: string[] = [];
    for (const r of todayRanges) {
      lines.push(`Today ${formatRange(r)}`);
    }
    for (const r of tomorrowRanges) {
      lines.push(`Tomorrow ${formatRange(r)}`);
    }
    return lines;
  }, [rates, todayStr, tomorrowStr]);

  const handleRefresh = useCallback(() => {
    if (isLoading) return;

    const now = new Date();
    const isBefore4pm = now.getHours() < 16;

    if (hasTodayRates && isBefore4pm) {
      setToast("Rates are up to date. New rates available after 16:00.");
      return;
    }

    if (hasTodayRates && !isBefore4pm && hasTomorrowRates) {
      setToast("Rates are up to date.");
      return;
    }

    // Allow refresh: either no today rates, or after 4pm with no tomorrow rates
    fetchRates();
  }, [isLoading, hasTodayRates, hasTomorrowRates, fetchRates]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {selectedDay === "today" ? "Today's" : "Tomorrow's"} Agile Rates
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="rounded bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Negative price banner */}
      {negativeLines && (
        <div className="mb-4 rounded-lg border border-cyan-700 bg-cyan-900/30 px-4 py-2 text-sm text-cyan-200">
          <p className="font-semibold">Negative prices!</p>
          {negativeLines.map((line) => (
            <p key={line} className="mt-0.5 text-cyan-300">
              {line}
            </p>
          ))}
        </div>
      )}

      {/* Toast message */}
      {toast && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-700 bg-amber-900/50 px-4 py-2 text-sm text-amber-200">
          <span>{toast}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-3 text-amber-400 hover:text-amber-200"
          >
            ×
          </button>
        </div>
      )}

      {error && <p className="mb-4 text-red-400">{error}</p>}

      {!isLoading && !error && rates.length === 0 && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 text-center">
          <p className="text-slate-400">
            No rate data available yet. Check your Settings and try again.
          </p>
        </div>
      )}

      {rates.length > 0 && (
        <>
          {/* Day toggle */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setSelectedDay("today")}
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                selectedDay === "today"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDay("tomorrow")}
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                selectedDay === "tomorrow"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Tomorrow
            </button>
          </div>

          {filteredRates.length === 0 ? (
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 text-center">
              <p className="text-slate-400">
                Tomorrow&apos;s rates not yet available. Rates are usually
                published after 16:00.
              </p>
            </div>
          ) : (
            <>
              {/* Current rate */}
              {selectedDay === "today" && currentSlot && (
                <div className="mb-4 rounded-lg border border-purple-700 bg-slate-800 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-400">
                      Current Rate
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatSlot(currentSlot.valid_from, currentSlot.valid_to)}
                    </p>
                  </div>
                  <p
                    className="text-2xl font-bold"
                    style={{
                      color:
                        currentSlot.value_inc_vat < 0
                          ? NEGATIVE_COLOR
                          : getRateColor(currentSlot.value_inc_vat, min, max),
                    }}
                  >
                    {currentSlot.value_inc_vat.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Summary boxes */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                {lowest && (
                  <div
                    className={`rounded-lg border bg-slate-800 p-4 text-center ${lowest.value_inc_vat < 0 ? "border-cyan-700" : "border-green-800"}`}
                  >
                    <p
                      className={`text-sm font-medium ${lowest.value_inc_vat < 0 ? "text-cyan-400" : "text-green-400"}`}
                    >
                      Lowest Rate
                    </p>
                    <p
                      className={`mt-1 text-2xl font-bold ${lowest.value_inc_vat < 0 ? "text-cyan-300" : "text-green-300"}`}
                    >
                      {lowest.value_inc_vat.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatSlotShort(lowest.valid_from)}
                    </p>
                  </div>
                )}
                {highest && (
                  <div className="rounded-lg border border-red-800 bg-slate-800 p-4 text-center">
                    <p className="text-sm font-medium text-red-400">
                      Highest Rate
                    </p>
                    <p className="mt-1 text-2xl font-bold text-red-300">
                      {highest.value_inc_vat.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatSlotShort(highest.valid_from)}
                    </p>
                  </div>
                )}
              </div>

              {/* Chart */}
              <RateChart
                rates={filteredRates}
                currentSlotFrom={
                  selectedDay === "today"
                    ? (currentSlot?.valid_from ?? null)
                    : null
                }
                averageRate={averageRate}
                ofgemCapRate={ofgemCapRate}
              />

              {/* Collapsible table */}
              <div className="mt-4">
                <button
                  onClick={() => setTableOpen((o) => !o)}
                  className="flex w-full items-center justify-between rounded bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
                >
                  <span>Rate Table</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${tableOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {tableOpen && (
                  <div className="mt-1 space-y-1">
                    {filteredRates.map((rate) => {
                      const isCurrent =
                        currentSlot?.valid_from === rate.valid_from;
                      const isNegative = rate.value_inc_vat < 0;
                      return (
                        <div
                          key={rate.valid_from}
                          className={`flex items-center justify-between rounded px-4 py-2 ${
                            isCurrent
                              ? "border-l-4 border-purple-500 bg-slate-700"
                              : isNegative
                                ? "border-l-4 border-cyan-500 bg-cyan-900/20"
                                : "bg-slate-800"
                          }`}
                        >
                          <span className="text-sm text-slate-300">
                            {formatSlot(rate.valid_from, rate.valid_to)}
                            {isCurrent && (
                              <span className="ml-2 text-xs font-semibold text-purple-400">
                                NOW
                              </span>
                            )}
                          </span>
                          <span
                            className="font-mono font-bold"
                            style={{
                              color: isNegative
                                ? NEGATIVE_COLOR
                                : getRateColor(rate.value_inc_vat, min, max),
                            }}
                          >
                            {rate.value_inc_vat.toFixed(2)} p/kWh
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
