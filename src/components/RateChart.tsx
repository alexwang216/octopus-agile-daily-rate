import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import type { AgileRate } from "../types";
import { getRateColor } from "../utils/rateColor";

interface RateChartProps {
  rates: AgileRate[];
  currentSlotFrom: string | null;
  averageRate: number;
  ofgemCapRate: number;
}

/** Generate all 48 half-hour slot keys for a full day: "00:00", "00:30", ..., "23:30" */
function allSlotKeys(): string[] {
  const keys: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      keys.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      );
    }
  }
  return keys;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

interface ChartDataPoint {
  time: string;
  rate: number | null;
  fullLabel: string;
  isCurrent: boolean;
}

const SLOTS = allSlotKeys();

function RateChart({
  rates,
  currentSlotFrom,
  averageRate,
  ofgemCapRate,
}: RateChartProps) {
  // Build lookup from time key to rate data
  const rateMap = new Map<
    string,
    { rate: number; fullLabel: string; isCurrent: boolean }
  >();
  for (const r of rates) {
    const key = formatTime(r.valid_from);
    rateMap.set(key, {
      rate: Number(r.value_inc_vat.toFixed(2)),
      fullLabel: `${formatTime(r.valid_from)} - ${formatTime(r.valid_to)}`,
      isCurrent: r.valid_from === currentSlotFrom,
    });
  }

  // Build full 24h data array
  const data: ChartDataPoint[] = SLOTS.map((slot) => {
    const entry = rateMap.get(slot);
    return {
      time: slot,
      rate: entry?.rate ?? null,
      fullLabel: entry?.fullLabel ?? slot,
      isCurrent: entry?.isCurrent ?? false,
    };
  });

  const values = rates.map((r) => r.value_inc_vat);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <XAxis
          dataKey="time"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          interval={0}
          tickFormatter={(value: string) =>
            value.endsWith(":00") ? value.slice(0, 2) : ""
          }
          height={30}
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          tickFormatter={(v: number) => `${v}p`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "0.5rem",
          }}
          itemStyle={{ color: "#e2e8f0" }}
          labelStyle={{ color: "#94a3b8" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => {
            if (value == null) return ["No data", "Rate"];
            return [`${Number(value).toFixed(2)} p/kWh`, "Rate"];
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          labelFormatter={(_label: any, payload: readonly any[]) =>
            payload?.[0]?.payload?.fullLabel ?? String(_label)
          }
        />
        <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
        <ReferenceLine
          y={averageRate}
          stroke="#38bdf8"
          strokeDasharray="6 3"
          label={{
            value: `Avg ${averageRate.toFixed(1)}p`,
            position: "right",
            fill: "#38bdf8",
            fontSize: 11,
          }}
        />
        {ofgemCapRate > 0 && (
          <ReferenceLine
            y={ofgemCapRate}
            stroke="#f97316"
            strokeDasharray="6 3"
            label={{
              value: `Cap ${ofgemCapRate.toFixed(1)}p`,
              position: "right",
              fill: "#f97316",
              fontSize: 11,
            }}
          />
        )}
        <Bar
          dataKey="rate"
          radius={[2, 2, 0, 0]}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          background={(props: any) => {
            const point = data[props.index];
            if (!point?.isCurrent) {
              return (
                <rect
                  x={props.x}
                  y={props.y}
                  width={props.width}
                  height={props.height}
                  fill="transparent"
                />
              );
            }
            return (
              <rect
                x={props.x}
                y={props.y}
                width={props.width}
                height={props.height}
                fill="rgba(168, 85, 247, 0.15)"
                rx={2}
              />
            );
          }}
        >
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={
                entry.rate != null
                  ? getRateColor(entry.rate, min, max)
                  : "transparent"
              }
              stroke={entry.isCurrent ? "#c084fc" : "none"}
              strokeWidth={entry.isCurrent ? 2 : 0}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default RateChart;
