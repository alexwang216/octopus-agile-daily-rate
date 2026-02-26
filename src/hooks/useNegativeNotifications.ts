import { useEffect, useRef } from "react";
import type { AgileRate } from "../types";

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getDateStr(d: Date): string {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

async function showNotification(rate: AgileRate): Promise<void> {
  const title = "Negative Price Alert";
  const body = `${rate.value_inc_vat.toFixed(2)}p/kWh from ${formatTime(rate.valid_from)} to ${formatTime(rate.valid_to)}`;
  const options: NotificationOptions = {
    body,
    icon: "/pwa-192x192.png",
    tag: `negative-${rate.valid_from}`,
  };

  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg) {
      await reg.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
  } catch {
    new Notification(title, options);
  }
}

/**
 * Schedules browser notifications for negative-price timeslots.
 * Only schedules for today's future slots. Cleans up on unmount or rate change.
 */
export function useNegativeNotifications(
  rates: AgileRate[],
  enabled: boolean,
): void {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Clear previous timers
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];

    if (!enabled || Notification.permission !== "granted") return;

    const now = Date.now();
    const todayStr = getDateStr(new Date());

    const negativeSlots = rates.filter(
      (r) =>
        r.value_inc_vat < 0 &&
        getDateStr(new Date(r.valid_from)) === todayStr &&
        new Date(r.valid_from).getTime() > now &&
        !notifiedRef.current.has(r.valid_from),
    );

    for (const slot of negativeSlots) {
      const delay = new Date(slot.valid_from).getTime() - now;
      const timer = setTimeout(() => {
        notifiedRef.current.add(slot.valid_from);
        showNotification(slot);
      }, delay);
      timersRef.current.push(timer);
    }

    return () => {
      for (const t of timersRef.current) clearTimeout(t);
      timersRef.current = [];
    };
  }, [rates, enabled]);
}
