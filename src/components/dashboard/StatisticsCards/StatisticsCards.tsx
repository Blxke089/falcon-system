interface StatisticsCardsProps {
  itemCount: number;
  completedCount?: number;
  stackCount: number;
  singleChestCount: number;
  doubleChestCount: number;
  totalValue?: number;
}

interface StatisticCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

function StatisticCard({
  title,
  value,
  subtitle,
}: StatisticCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-sm text-zinc-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>

      {subtitle && (
        <p className="mt-1 text-xs text-zinc-600">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function StatisticsCards({
  itemCount,
  completedCount = 0,
  stackCount,
  singleChestCount,
  doubleChestCount,
  totalValue = 0,
}: StatisticsCardsProps) {
  const openCount = Math.max(
    itemCount - completedCount,
    0,
  );

  const progress =
    itemCount > 0
      ? Math.round(
          (completedCount / itemCount) * 100,
        )
      : 0;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
      <StatisticCard
        title="📦 Items"
        value={itemCount}
        subtitle="Gesamt"
      />

      <StatisticCard
        title="✅ Erledigt"
        value={completedCount}
        subtitle={`${progress}% abgeschlossen`}
      />

      <StatisticCard
        title="⏳ Offen"
        value={openCount}
        subtitle="Noch zu erledigen"
      />

      <StatisticCard
        title="🧱 Stacks"
        value={stackCount}
        subtitle="Benötigte Stacks"
      />

      <StatisticCard
        title="📦 Kisten"
        value={
          singleChestCount +
          doubleChestCount
        }
        subtitle={`${singleChestCount} SK · ${doubleChestCount} DK`}
      />

      <StatisticCard
        title="💰 Gesamtwert"
        value={
          totalValue > 0
            ? `${totalValue.toLocaleString(
                "de-DE",
              )} $`
            : "—"
        }
        subtitle="Alle Preise"
      />
    </div>
  );
}