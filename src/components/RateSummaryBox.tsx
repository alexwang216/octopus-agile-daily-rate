import { AgileRate } from "../types"
import { formatSlotShort } from "../utils/slotUtils";

export enum RateSummaryType {
  Lowest,
  Highest,
};

type RateSummaryBoxProps = {
  rate: AgileRate | null;
  type: RateSummaryType;
};

type RateColors = {
  borderColor: string;
  rateTitleColor: string;
  rateColor: string;
};

const colorMap: Record<RateSummaryType, RateColors> = {
  [RateSummaryType.Highest]: {
    borderColor: "border-red-800",
    rateTitleColor: "text-red-400",
    rateColor: "text-red-300",
  },
  [RateSummaryType.Lowest]: {
    borderColor: "border-green-800",
    rateTitleColor: "text-green-400",
    rateColor: "text-green-300",
  },
};

const colorNegative: RateColors = {
  borderColor: "border-cyan-700",
  rateTitleColor: "text-cyan-400",
  rateColor: "text-cyan-300",
}

const getColors = (type: RateSummaryType): RateColors => {
  return colorMap[type];
};

export default function RateSummaryBox({ rate, type }: RateSummaryBoxProps) {
  if (!rate) return;

  const { borderColor, rateTitleColor, rateColor } = rate.value_inc_vat < 0 ? colorNegative : getColors(type);

  return (
    <div
      className={`rounded-lg border bg-slate-800 p-4 text-center ${borderColor}`}
    >
      <p
        className={`text-sm font-medium ${rateTitleColor}`}
      >
        <span className="uppercase">{RateSummaryType[type]}</span> Rate
      </p>
      <p
        className={`mt-1 text-2xl font-bold ${rateColor}`}
      >
        {rate.value_inc_vat.toFixed(2)}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        {formatSlotShort(rate.valid_from)}
      </p>
    </div>
  );
}