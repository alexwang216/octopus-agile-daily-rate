type NegativePriceBannerProps = {
  negativeLines: string[] | null;
};

export default function NegativePriceBanner({ negativeLines }: NegativePriceBannerProps) {
  if (!negativeLines || negativeLines.length == 0) return null;

  return (
    <div className="mb-4 rounded-lg border border-cyan-700 bg-cyan-900/30 px-4 py-2 text-sm text-cyan-200">
      <p className="font-semibold">Negative prices!</p>
      {negativeLines.map((line) => (
        <p key={line} className="mt-0.5 text-cyan-300">
          {line}
        </p>
      ))}
    </div>
  );
}