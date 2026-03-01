import { AgileRate } from "../types";

export function getDateStr(d: Date): string {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function getTimeStr(t: string): string {
  const d = new Date(t);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatSlot(from: string, to: string): string {
  return `${getTimeStr(from)} - ${getTimeStr(to)}`;
}

export function formatSlotShort(from: string): string {
  return `${getTimeStr(from)}`;
}

export function getTodayStr(): string {
  return getDateStr(new Date());
}

export function getTomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return getDateStr(d);
}

/** Group consecutive negative-rate slots into time ranges */
export function getNegativeRanges(
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
