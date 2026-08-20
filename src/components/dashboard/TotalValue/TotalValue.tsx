interface TotalValueProps {
  value?: number;
}

export default function TotalValue({
  value = 0,
}: TotalValueProps) {
  return (
    <div className="rounded-2xl border border-emerald-900/40 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-500">
        Gesamtwert
      </p>

      <p className="mt-2 text-3xl font-bold text-emerald-400">
        {value.toLocaleString("de-DE")} €
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        Preise sind optional
      </p>
    </div>
  );
}