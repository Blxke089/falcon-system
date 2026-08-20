import { useMemo, useState } from "react";
import type { ParsedItem } from "../../../services/ItemParser/ItemParser";

interface ItemTableProps {
  items: ParsedItem[];
  completedItems: number[];
  prices: Record<number, number>;
  orderName: string;
  onCompletedChange: (completed: number[]) => void;
  onPricesChange: (prices: Record<number, number>) => void;
}

type SortOption = "name" | "amount" | "stacks";

export default function ItemTable({
  items,
  completedItems,
  prices,
  orderName,
  onCompletedChange,
  onPricesChange,
}: ItemTableProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alle");
  const [sortBy, setSortBy] =
    useState<SortOption>("name");

  const [copied, setCopied] = useState(false);

  const categories = useMemo(() => {
    return [
      "Alle",
      ...Array.from(
        new Set(
          items.map((item) => item.category),
        ),
      ).sort(),
    ];
  }, [items]);

  const filteredItems = useMemo(() => {
    const searchText = search
      .toLowerCase()
      .trim();

    const result = items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchText);

      const matchesCategory =
        category === "Alle" ||
        item.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "amount") {
        return b.amount - a.amount;
      }

      return b.stacks - a.stacks;
    });
  }, [
    items,
    search,
    category,
    sortBy,
  ]);

  function toggleItem(id: number) {
    const updated =
      completedItems.includes(id)
        ? completedItems.filter(
            (itemId) => itemId !== id,
          )
        : [...completedItems, id];

    onCompletedChange(updated);
  }

  function updatePrice(
    id: number,
    value: string,
  ) {
    const price = Number(value);

    onPricesChange({
      ...prices,
      [id]:
        Number.isFinite(price) &&
        price >= 0
          ? price
          : 0,
    });
  }

  function completeAll() {
    onCompletedChange(
      items.map((item) => item.id),
    );
  }

  function resetCompleted() {
    onCompletedChange([]);
  }

  function createOrderText() {
    const orderItems = items.filter(
      (item) =>
        !completedItems.includes(item.id),
    );

    const lines = orderItems.map(
      (item) => {
        const price =
          prices[item.id] ?? 0;

        const total =
          item.amount * price;

        if (price > 0) {
          return `${item.amount.toLocaleString(
            "de-DE",
          )}x ${item.name} | ${price.toLocaleString(
            "de-DE",
          )} $/Item | ${total.toLocaleString(
            "de-DE",
          )} $`;
        }

        return `${item.amount.toLocaleString(
          "de-DE",
        )}x ${item.name}`;
      },
    );

    const totalValue =
      orderItems.reduce(
        (sum, item) => {
          const price =
            prices[item.id] ?? 0;

          return (
            sum +
            item.amount * price
          );
        },
        0,
      );

    return [
      "📋 BESTELLUNG",
      orderName ||
        "Unbenannte Bestellung",
      "",
      ...lines,
      "",
      `📦 Items: ${orderItems.length}`,
      `💰 Gesamtwert: ${totalValue.toLocaleString(
        "de-DE",
      )} $`,
    ].join("\n");
  }

  async function copyOrder() {
    const text = createOrderText();

    try {
      await navigator.clipboard.writeText(
        text,
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      console.error(
        "Bestellung konnte nicht kopiert werden.",
      );
    }
  }

  function downloadOrder() {
    const text = createOrderText();

    const safeFileName =
      (orderName || "Bestellung")
        .trim()
        .replace(
          /[<>:"/\\|?*]/g,
          "",
        )
        .replace(/\s+/g, "_");

    const blob = new Blob(
      [text],
      {
        type: "text/plain;charset=utf-8",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = `${safeFileName}.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  if (items.length === 0) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-xl border border-dashed border-zinc-800 text-center text-zinc-600">
        <div>
          <p>
            Noch keine Items vorhanden.
          </p>

          <p className="mt-2 text-xs">
            Füge links eine Materialliste
            ein und klicke auf
            „Verarbeiten“.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Suche / Filter */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          placeholder="🔎 Item suchen..."
          className="min-w-[220px] flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500"
        />

        <select
          value={category}
          onChange={(event) =>
            setCategory(
              event.target.value,
            )
          }
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
        >
          {categories.map(
            (itemCategory) => (
              <option
                key={itemCategory}
                value={itemCategory}
              >
                {itemCategory}
              </option>
            ),
          )}
        </select>

        <select
          value={sortBy}
          onChange={(event) =>
            setSortBy(
              event.target
                .value as SortOption,
            )
          }
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
        >
          <option value="name">
            Sortierung: Name
          </option>

          <option value="amount">
            Sortierung: Menge
          </option>

          <option value="stacks">
            Sortierung: Stacks
          </option>
        </select>
      </div>

      {/* Aktionen */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={copyOrder}
          className="rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black transition hover:bg-yellow-400"
        >
          {copied
            ? "✅ Kopiert!"
            : "📋 Bestellung kopieren"}
        </button>

        <button
          onClick={downloadOrder}
          className="rounded-xl bg-zinc-800 px-5 py-3 font-semibold text-white transition hover:bg-zinc-700"
        >
          💾 Datei
        </button>

        <button
          onClick={completeAll}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white transition hover:bg-zinc-800"
        >
          ☑️ Alle abhaken
        </button>

        <button
          onClick={resetCompleted}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white transition hover:bg-zinc-800"
        >
          ↩️ Zurücksetzen
        </button>
      </div>

      {/* Anzahl */}
      <div className="mb-3 text-xs text-zinc-500">
        {filteredItems.length} von{" "}
        {items.length} Items
      </div>

      {/* Tabelle */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-zinc-800 text-zinc-300">
            <tr>
              <th className="w-12 p-3 text-center">
                ✓
              </th>

              <th className="w-16 p-3">
                Icon
              </th>

              <th className="p-3">
                Item
              </th>

              <th className="p-3">
                Kategorie
              </th>

              <th className="p-3 text-right">
                Menge
              </th>

              <th className="p-3 text-right">
                Stacks
              </th>

              <th className="p-3 text-right">
                SK
              </th>

              <th className="p-3 text-right">
                DK
              </th>

              <th className="p-3 text-right">
                Preis / Item
              </th>

              <th className="p-3 text-right">
                Gesamt
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map(
              (item) => {
                const completed =
                  completedItems.includes(
                    item.id,
                  );

                const price =
                  prices[item.id] ?? 0;

                const total =
                  item.amount * price;

                return (
                  <tr
                    key={item.id}
                    className={`border-t border-zinc-800 transition ${
                      completed
                        ? "bg-zinc-950/70"
                        : "hover:bg-zinc-800/50"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={
                          completed
                        }
                        onChange={() =>
                          toggleItem(
                            item.id,
                          )
                        }
                        className="h-4 w-4 cursor-pointer accent-yellow-500"
                      />
                    </td>

                    {/* Icon */}
                    <td className="p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950">
                        {item.image ? (
                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.name
                            }
                            className={`h-8 w-8 object-contain ${
                              completed
                                ? "grayscale opacity-40"
                                : ""
                            }`}
                          />
                        ) : (
                          <span
                            className={
                              completed
                                ? "grayscale opacity-40"
                                : ""
                            }
                          >
                            {item.icon}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Item */}
                    <td
                      className={`p-3 font-medium ${
                        completed
                          ? "text-zinc-600 line-through"
                          : "text-white"
                      }`}
                    >
                      {item.name}
                    </td>

                    {/* Kategorie */}
                    <td
                      className={`p-3 ${
                        completed
                          ? "text-zinc-700 line-through"
                          : "text-zinc-400"
                      }`}
                    >
                      {item.category}
                    </td>

                    {/* Menge */}
                    <td
                      className={`p-3 text-right ${
                        completed
                          ? "text-zinc-700 line-through"
                          : "text-white"
                      }`}
                    >
                      {item.amount.toLocaleString(
                        "de-DE",
                      )}
                    </td>

                    {/* Stacks */}
                    <td className="p-3 text-right text-zinc-300">
                      {item.stacks}
                    </td>

                    {/* Singlekisten */}
                    <td className="p-3 text-right text-zinc-400">
                      {item.singleChests}
                    </td>

                    {/* Doppelkisten */}
                    <td className="p-3 text-right text-zinc-400">
                      {item.doubleChests}
                    </td>

                    {/* Preis */}
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={
                          price === 0
                            ? ""
                            : price
                        }
                        onChange={(
                          event,
                        ) =>
                          updatePrice(
                            item.id,
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="Preis"
                        className="w-28 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-right text-white outline-none transition focus:border-yellow-500"
                      />
                    </td>

                    {/* Gesamt */}
                    <td className="p-3 text-right font-semibold text-emerald-400">
                      {price > 0
                        ? `${total.toLocaleString(
                            "de-DE",
                          )} $`
                        : "—"}
                    </td>
                  </tr>
                );
              },
            )}

            {filteredItems.length ===
              0 && (
              <tr>
                <td
                  colSpan={10}
                  className="p-10 text-center text-zinc-600"
                >
                  Keine Items
                  gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}