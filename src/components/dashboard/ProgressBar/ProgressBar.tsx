interface ProgressBarProps {
  completed?: number;
  total?: number;
}

export default function ProgressBar({
  completed = 0,
  total = 0,
}: ProgressBarProps) {
  const percentage =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">Fortschritt</p>

          <p className="mt-1 text-xl font-bold text-white">
            {completed} / {total} Items erledigt
          </p>
        </div>

        <span className="text-lg font-bold text-yellow-500">
          {percentage}%
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-yellow-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}