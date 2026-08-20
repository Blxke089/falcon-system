import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import "./Dashboard.css";

import {
  Check,
  CheckCircle2,
  Copy,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import {
  parseMaterialList,
  type ParsedItem,
} from "../../services/ItemParser/ItemParser";

import {
  createOrderId,
  deleteOrder,
  getOrders,
  saveOrder,
  type SavedOrder,
} from "../../services/OrderStorage/OrderStorage";

const ORDER_DRAFT_STORAGE_KEY =
  "falcon-system-order-draft";

interface DashboardDraft {
  orderId: string;
  orderName: string;
  items: ParsedItem[];
  completedItems: number[];
  prices: Record<number, number>;
}

function loadDashboardDraft(): DashboardDraft | null {
  try {
    const raw = localStorage.getItem(
      ORDER_DRAFT_STORAGE_KEY,
    );

    if (!raw) {
      return null;
    }

    const draft = JSON.parse(raw) as DashboardDraft;

    if (
      !draft ||
      !Array.isArray(draft.items) ||
      !Array.isArray(draft.completedItems) ||
      typeof draft.prices !== "object"
    ) {
      return null;
    }

    return draft;
  } catch {
    return null;
  }
}

interface DashboardProps {
  selectedOrder?: SavedOrder | null;
  onOrderLoaded?: () => void;
  onOrderSaved?: () => void;
}

export default function Dashboard({
  selectedOrder = null,
  onOrderLoaded,
  onOrderSaved,
}: DashboardProps) {

  const [orderId, setOrderId] =
    useState<string>(() =>
      loadDashboardDraft()?.orderId ??
      createOrderId(),
    );

  const [orderName, setOrderName] =
    useState(() =>
      loadDashboardDraft()?.orderName ??
      "Neue Bestellung",
    );

  const [materialText, setMaterialText] =
    useState("");

  const materialTextareaRef =
    useRef<HTMLTextAreaElement | null>(null);

  const [items, setItems] =
    useState<ParsedItem[]>(() =>
      loadDashboardDraft()?.items ?? [],
    );

  const [completedItems, setCompletedItems] =
    useState<number[]>(() =>
      loadDashboardDraft()?.completedItems ?? [],
    );

  const [prices, setPrices] =
    useState<Record<number, number>>(() =>
      loadDashboardDraft()?.prices ?? {},
    );

  const [search, setSearch] =
    useState("");

  const [savedMessage, setSavedMessage] =
    useState("");

  const [showDuplicate, setShowDuplicate] =
    useState(false);

  const [duplicateName, setDuplicateName] =
    useState("");

  const [showDelete, setShowDelete] =
    useState(false);

  /* =====================================================
     BESTELLUNG LADEN
     ===================================================== */

  function loadOrder(order: SavedOrder) {
    setOrderId(order.id);
    setOrderName(order.name);
    setMaterialText(order.materialText);

    setItems(
      order.items.map((item) => ({
        ...item,
      })),
    );

    setCompletedItems([
      ...order.completedItems,
    ]);

    setPrices({
      ...order.prices,
    });
  }

  useEffect(() => {
    if (!selectedOrder) {
      return;
    }

    loadOrder(selectedOrder);
    onOrderLoaded?.();
  }, [selectedOrder, onOrderLoaded]);

  /* =====================================================
     BESTELLUNGSLISTE AUTOMATISCH PERSISTIEREN
     ===================================================== */

  useEffect(() => {
    try {
      const draft: DashboardDraft = {
        orderId,
        orderName,
        items,
        completedItems,
        prices,
      };

      localStorage.setItem(
        ORDER_DRAFT_STORAGE_KEY,
        JSON.stringify(draft),
      );
    } catch {
      // Die App läuft auch weiter, wenn localStorage blockiert ist.
    }
  }, [
    orderId,
    orderName,
    items,
    completedItems,
    prices,
  ]);

  /* =====================================================
     NEUE BESTELLUNG
     ===================================================== */

  function handleNewOrder() {
    setOrderId(createOrderId());
    setOrderName("Neue Bestellung");
    setMaterialText("");
    setItems([]);
    setCompletedItems([]);
    setPrices({});
    setSearch("");

    try {
      localStorage.removeItem(
        ORDER_DRAFT_STORAGE_KEY,
      );
    } catch {
      // Ignorieren, falls localStorage nicht verfügbar ist.
    }

    setSavedMessage("");
  }

  /* =====================================================
     MATERIAL VERARBEITEN
     ===================================================== */

  function handleProcess() {
    const parsed =
      parseMaterialList(materialText);

    const oldPrices =
      new Map<string, number>();

    for (const item of items) {
      oldPrices.set(
        item.name.trim().toLowerCase(),
        prices[item.id] ?? 0,
      );
    }

    const oldCompleted =
      new Set<string>();

    for (const item of items) {
      if (
        completedItems.includes(item.id)
      ) {
        oldCompleted.add(
          item.name.trim().toLowerCase(),
        );
      }
    }

    const nextPrices:
      Record<number, number> = {};

    const nextCompleted: number[] = [];

    for (const item of parsed) {
      const key =
        item.name.trim().toLowerCase();

      const oldPrice =
        oldPrices.get(key);

      if (oldPrice !== undefined) {
        nextPrices[item.id] = oldPrice;
      }

      if (oldCompleted.has(key)) {
        nextCompleted.push(item.id);
      }
    }

    setItems(parsed);
    setPrices(nextPrices);
    setCompletedItems(nextCompleted);

    if (parsed.length === 0) {
      setSavedMessage(
        "Keine gültigen Items gefunden.",
      );

      window.setTimeout(
        () => setSavedMessage(""),
        2500,
      );

      return;
    }

    setMaterialText("");

    setSavedMessage(
      `${parsed.length} Items verarbeitet`,
    );

    window.setTimeout(
      () => setSavedMessage(""),
      2500,
    );
  }

  /* =====================================================
     SPEICHERN
     ===================================================== */

  async function handleSave() {
    const now = new Date().toISOString();

    const orders: SavedOrder[] = await getOrders();

    const existing: SavedOrder | undefined =
      orders.find(
        (order: SavedOrder) =>
          order.id === orderId,
      );

    const order: SavedOrder = {
      id: orderId,
      name:
        orderName.trim() ||
        "Neue Bestellung",
      materialText,
      items: items.map((item) => ({
        ...item,
      })),
      completedItems: [
        ...completedItems,
      ],
      prices: {
        ...prices,
      },
      createdAt:
        existing?.createdAt ?? now,
      updatedAt: now,
    };

    await saveOrder(order);
    onOrderSaved?.();

    setSavedMessage(
      "Bestellung gespeichert",
    );

    window.setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  }

  /* =====================================================
     ITEM ABHAKEN
     ===================================================== */

  function toggleItem(id: number) {
    setCompletedItems(
      (current) =>
        current.includes(id)
          ? current.filter(
              (itemId) =>
                itemId !== id,
            )
          : [...current, id],
    );
  }

  /* =====================================================
     PREIS
     ===================================================== */

  function updatePrice(
    id: number,
    value: string,
  ) {
    const price = Number(
      value.replace(",", "."),
    );

    setPrices((current) => ({
      ...current,
      [id]:
        Number.isFinite(price) &&
        price >= 0
          ? price
          : 0,
    }));
  }

  /* =====================================================
     DUPLIZIEREN
     ===================================================== */

  function openDuplicate() {
    setDuplicateName(
      `${orderName} (Kopie)`,
    );

    setShowDuplicate(true);
  }

  function confirmDuplicate() {
    const name =
      duplicateName.trim();

    if (!name) {
      return;
    }

    const now =
      new Date().toISOString();

    const copied: SavedOrder = {
      id: createOrderId(),
      name,
      materialText,
      items: items.map((item) => ({
        ...item,
      })),
      completedItems: [
        ...completedItems,
      ],
      prices: {
        ...prices,
      },
      createdAt: now,
      updatedAt: now,
    };

    void saveOrder(copied);
    onOrderSaved?.();

    setOrderId(copied.id);
    setOrderName(copied.name);
    setShowDuplicate(false);

    setSavedMessage(
      "Kopie erstellt",
    );

    window.setTimeout(
      () => setSavedMessage(""),
      2500,
    );
  }

  /* =====================================================
     LÖSCHEN
     ===================================================== */

  function confirmDelete() {
    void deleteOrder(orderId);

    setShowDelete(false);

    handleNewOrder();

    onOrderSaved?.();
  }

  /* =====================================================
     STATISTIK
     ===================================================== */

  const completedCount =
    completedItems.filter((id) =>
      items.some(
        (item) => item.id === id,
      ),
    ).length;

  const progress =
    items.length > 0
      ? Math.round(
          (completedCount /
            items.length) *
            100,
        )
      : 0;

  const totalStacks =
    items.reduce(
      (sum, item) =>
        sum + item.stacks,
      0,
    );

  const totalValue =
    items.reduce(
      (sum, item) =>
        sum +
        item.stacks *
          (prices[item.id] ?? 0),
      0,
    );

  const filteredItems =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return items;
      }

      return items.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(query) ||
          item.category
            .toLowerCase()
            .includes(query),
      );
    }, [items, search]);

  /* =====================================================
     MATERIALTEXTAREA — AUTO GROW
     ===================================================== */

  useEffect(() => {
    const textarea =
      materialTextareaRef.current;

    if (!textarea) {
      return;
    }

    const minHeight = 90;
    const maxHeight = 320;

    textarea.style.height = "0px";

    const nextHeight = Math.min(
      Math.max(
        textarea.scrollHeight,
        minHeight,
      ),
      maxHeight,
    );

    textarea.style.height =
      `${nextHeight}px`;

    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight
        ? "auto"
        : "hidden";
  }, [materialText]);

  return (
    <main className="dashboard-shell relative min-h-full overflow-hidden bg-transparent p-4 xl:p-5">

      {/* =================================================
          GOLD GLOW
          ================================================= */}

      <div className="dashboard-glow dashboard-glow-top" />
      <div className="dashboard-glow dashboard-glow-bottom" />

      <style>{`
        /* =================================================
           FALCON HUB - ZURÜCK BUTTON
           Alles in dieser Datei, keine zusätzliche CSS-Datei nötig.
           ================================================= */

        .dashboard-header-actions {
          width: 100%;
        }

        .dashboard-back-to-hub {
          position: relative !important;
          margin-right: auto !important;
          flex-shrink: 0;
          overflow: hidden !important;

          height: 40px;
          padding: 0 16px !important;
          gap: 9px !important;

          border: 1px solid rgba(239, 68, 68, 0.42) !important;
          border-radius: 12px !important;

          background:
            linear-gradient(
              135deg,
              rgba(239, 68, 68, 0.16),
              rgba(127, 29, 29, 0.08)
            ) !important;

          color: #ffffff !important;

          box-shadow:
            0 0 18px rgba(239, 68, 68, 0.08),
            inset 0 0 14px rgba(239, 68, 68, 0.025);

          backdrop-filter: blur(10px);

          transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            background 0.25s ease,
            box-shadow 0.25s ease;
        }

        .dashboard-back-to-hub::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -80%;
          width: 55%;
          height: 200%;
          transform: rotate(18deg);

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.38),
              rgba(239, 68, 68, 0.28),
              transparent
            );

          filter: blur(5px);
          pointer-events: none;

          animation:
            falcon-back-sweep
            4s
            ease-in-out
            infinite;
        }

        .dashboard-back-to-hub::after {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;

          background:
            radial-gradient(
              circle at 18% 50%,
              rgba(239, 68, 68, 0.24),
              transparent 60%
            );

          opacity: 0.5;
          pointer-events: none;

          animation:
            falcon-back-pulse
            2.6s
            ease-in-out
            infinite;
        }

        .dashboard-back-to-hub > * {
          position: relative;
          z-index: 2;
        }

        .dashboard-back-to-hub:hover {
          transform: translateY(-1px) !important;

          border-color:
            rgba(248, 113, 113, 0.82) !important;

          background:
            linear-gradient(
              135deg,
              rgba(239, 68, 68, 0.25),
              rgba(127, 29, 29, 0.13)
            ) !important;

          box-shadow:
            0 0 18px rgba(239, 68, 68, 0.20),
            0 0 38px rgba(239, 68, 68, 0.09),
            inset 0 0 16px rgba(239, 68, 68, 0.06);
        }

        .dashboard-back-to-hub svg {
          transition:
            transform 0.25s ease,
            filter 0.25s ease;
        }

        .dashboard-back-to-hub:hover svg {
          transform: translateX(-4px);

          filter:
            drop-shadow(
              0 0 5px
              rgba(248, 113, 113, 0.95)
            );
        }

        .dashboard-back-to-hub-glow {
          position: absolute !important;
          left: 10px;
          top: 50%;

          width: 14px;
          height: 14px;

          transform: translateY(-50%);

          border-radius: 999px;

          background:
            rgba(239, 68, 68, 0.30);

          filter: blur(8px);
          pointer-events: none;

          animation:
            falcon-back-dot
            2.2s
            ease-in-out
            infinite;
        }

        .dashboard-back-to-hub:active {
          transform: scale(0.97) !important;
        }

        @keyframes falcon-back-sweep {
          0%,
          42% {
            left: -80%;
            opacity: 0;
          }

          50% {
            opacity: 0.85;
          }

          72%,
          100% {
            left: 145%;
            opacity: 0;
          }
        }

        @keyframes falcon-back-pulse {
          0%,
          100% {
            opacity: 0.25;
          }

          50% {
            opacity: 0.68;
          }
        }

        @keyframes falcon-back-dot {
          0%,
          100% {
            opacity: 0.30;
            transform: translateY(-50%) scale(0.85);
          }

          50% {
            opacity: 0.90;
            transform: translateY(-50%) scale(1.10);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dashboard-back-to-hub::before,
          .dashboard-back-to-hub::after,
          .dashboard-back-to-hub-glow {
            animation: none;
          }
        }
      `}</style>

      <div className="relative mx-auto w-full max-w-[1680px]">

        {/* =================================================
            HEADER
            ================================================= */}

        <header className="dashboard-header">

          <div className="dashboard-header-actions">

            <button
              type="button"
              onClick={handleNewOrder}
              className="dashboard-button dashboard-button-dark"
            >
              <Plus size={16} />
              Neue Bestellung
            </button>

            <button
              type="button"
              onClick={openDuplicate}
              disabled={
                items.length === 0
              }
              className="dashboard-button dashboard-button-dark disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Copy size={15} />
              Duplizieren
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="dashboard-button dashboard-button-gold"
            >
              <Save size={15} />
              Speichern
            </button>

          </div>
        </header>

        {/* =================================================
            PROJEKTFORTSCHRITT
            ================================================= */}

        <section className="dashboard-project-progress">

          <div className="dashboard-project-progress-header">

            <div>

              <p className="dashboard-project-progress-kicker">
                PROJEKTFORTSCHRITT
              </p>

              <div className="dashboard-project-progress-title">

                <strong>
                  {progress}%
                </strong>

                <span>
                  {completedCount} /{" "}
                  {items.length} Items erledigt
                </span>

              </div>

            </div>

            <div className="dashboard-project-progress-meta">

              <span>
                FORTSCHRITT
              </span>

              <strong>
                {completedCount} /{" "}
                {items.length}
              </strong>

            </div>

          </div>

          <div className="dashboard-project-progress-track">

            <div
              className="dashboard-project-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            >
              <span className="dashboard-project-progress-shine" />
            </div>

            <span className="dashboard-project-progress-glow" />
            <span className="dashboard-project-progress-scan" />

          </div>

          <div className="dashboard-project-progress-footer">
            <span>START</span>
            <span>PROJEKTSTATUS</span>
            <span>{progress}%</span>
          </div>

        </section>

        {/* =================================================
            MAIN GRID
            ================================================= */}

        <div className="dashboard-main-grid">

          {/* =================================================
              LINKES PANEL
              ================================================= */}

          <section className="dashboard-panel dashboard-order-panel">

            <div className="dashboard-order-header">

              <div className="flex min-w-0 items-center gap-3">

                <div className="dashboard-order-icon">
                  📦
                </div>

                <div className="min-w-0">

                  <p className="dashboard-section-label">
                    Aktuelle Bestellung
                  </p>

                  <div className="flex items-center gap-2">

                    <input
                      value={orderName}
                      onChange={(event) =>
                        setOrderName(
                          event.target.value,
                        )
                      }
                      className="dashboard-order-name"
                      aria-label="Bestellname"
                    />

                    <Pencil
                      size={14}
                      className="shrink-0 text-zinc-600"
                    />

                  </div>

                </div>

              </div>

              <div className="dashboard-progress-badge">

                <strong>
                  {progress}%
                </strong>

                <span>
                  Fortschritt
                </span>

              </div>

            </div>

            {/* Action Buttons */}

            <div className="dashboard-action-row">

              <button
                type="button"
                onClick={handleSave}
                className="dashboard-action dashboard-action-primary"
              >
                <Save size={15} />
                Speichern
              </button>

              <button
                type="button"
                onClick={openDuplicate}
                disabled={
                  items.length === 0
                }
                className="dashboard-action dashboard-action-secondary disabled:opacity-30"
              >
                <Copy size={15} />
                Kopieren
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowDelete(true)
                }
                disabled={
                  items.length === 0
                }
                className="dashboard-action dashboard-action-danger disabled:opacity-30"
              >
                <Trash2 size={15} />
                Löschen
              </button>

            </div>

            {/* Materialliste */}

            <div className="dashboard-material-section">

              <div className="dashboard-material-heading">

                <div>

                  <h2>
                    Materialliste
                  </h2>

                  <p>
                    Rohdaten für die Verarbeitung
                  </p>

                </div>

                {materialText && (
                  <span className="dashboard-line-count">
                    {
                      materialText
                        .split(/\r?\n/)
                        .filter(Boolean)
                        .length
                    }{" "}
                    Zeilen
                  </span>
                )}

              </div>

              <textarea
                ref={materialTextareaRef}
                value={materialText}
                onChange={(event) =>
                  setMaterialText(
                    event.target.value,
                  )
                }
                placeholder="Füge Materialliste ein"
                className="dashboard-material-input"
                style={{
                  minHeight: "90px",
                  resize: "none",
                }}
              />

              <div className="dashboard-process-row">

                <button
                  type="button"
                  onClick={handleProcess}
                  className="dashboard-process-button"
                >
                  <Zap size={16} />
                  Materialliste verarbeiten
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMaterialText("");
                    setItems([]);
                    setCompletedItems([]);
                    setPrices({});
                  }}
                  className="dashboard-clear-button"
                >
                  <Trash2 size={14} />
                  Leeren
                </button>

              </div>

              {savedMessage && (
                <div className="dashboard-message">
                  <CheckCircle2 size={14} />
                  {savedMessage}
                </div>
              )}

            </div>

          </section>

          {/* =================================================
              RECHTES ITEM PANEL
              ================================================= */}

          <section className="dashboard-panel dashboard-items-panel">

            <div className="dashboard-items-header">

              <div className="min-w-0">

                <div className="flex items-center gap-2">

                  <h2>
                    Bestellung Items
                  </h2>

                  <span className="dashboard-count">
                    {items.length}
                  </span>

                </div>

                <p>
                  Materialien, Mengen und Preise
                </p>

              </div>

              <div className="dashboard-items-header-right">

                <div className="dashboard-header-total">

                  <span>
                    GESAMTPREIS
                  </span>

                  <strong>
                    {totalValue.toLocaleString(
                      "de-DE",
                      {
                        minimumFractionDigits: 2,
                      },
                    )}{" "}
                    $
                  </strong>

                </div>

                <div className="dashboard-search">

                  <Search size={15} />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Items suchen..."
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearch("")
                      }
                      className="dashboard-search-clear"
                    >
                      <X size={13} />
                    </button>
                  )}

                </div>

              </div>

            </div>

            {/* Tabelle */}

            <div className="dashboard-table-wrap">

              {filteredItems.length === 0 ? (
                <div className="dashboard-empty">

                  <div className="dashboard-empty-icon">
                    📦
                  </div>

                  <h3>
                    Noch keine Items vorhanden.
                  </h3>

                  <p>
                    Füge links eine Materialliste
                    ein und klicke auf
                    <br />
                    „Materialliste verarbeiten“.
                  </p>

                </div>
              ) : (
                <table className="dashboard-table">

                  <thead>

                    <tr>

                      <th className="w-10">
                        ✓
                      </th>

                      <th>
                        Item
                      </th>

                      <th>
                        Benötigt
                      </th>

                      <th>
                        Stacks
                      </th>

                      <th>
                        Kisten
                      </th>

                      <th>
                        Preis / Stack
                      </th>

                      <th>
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

                        const itemTotal =
                          item.stacks * price;

                        return (
                          <tr
                            key={item.id}
                            className={
                              completed
                                ? "dashboard-item-completed"
                                : ""
                            }
                          >

                            <td>

                              <button
                                type="button"
                                onClick={() =>
                                  toggleItem(
                                    item.id,
                                  )
                                }
                                className={`dashboard-check ${
                                  completed
                                    ? "is-completed"
                                    : ""
                                }`}
                              >
                                {completed && (
                                  <Check
                                    size={13}
                                  />
                                )}
                              </button>

                            </td>

                            <td>

                              <div className="dashboard-item-name">

                                <div className="dashboard-item-image">

                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                    />
                                  ) : (
                                    <span>
                                      {item.icon}
                                    </span>
                                  )}

                                </div>

                                <div className="dashboard-item-name-text min-w-0">

                                  <strong>
                                    {item.name}
                                  </strong>

                                </div>

                              </div>

                            </td>

                            <td>

                              <strong>
                                {item.amount.toLocaleString(
                                  "de-DE",
                                )}
                              </strong>

                            </td>

                            <td>

                              <span className="dashboard-number-pill">
                                {item.stacks}
                              </span>

                            </td>

                            <td>

                              {item.singleChests > 0
                                ? `${item.singleChests.toLocaleString(
                                    "de-DE",
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    },
                                  )} DK`
                                : `${item.doubleChests} DK`}

                            </td>

                            <td>

                              <div className="dashboard-price">

                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={
                                    price === 0
                                      ? ""
                                      : price
                                  }
                                  onChange={(event) =>
                                    updatePrice(
                                      item.id,
                                      event.target.value,
                                    )
                                  }
                                />

                                <span>
                                  $
                                </span>

                              </div>

                            </td>

                            <td>

                              <strong className="dashboard-total">

                                {itemTotal > 0
                                  ? `${itemTotal.toLocaleString(
                                      "de-DE",
                                      {
                                        minimumFractionDigits: 2,
                                      },
                                    )} $`
                                  : "—"}

                              </strong>

                            </td>

                          </tr>
                        );
                      },
                    )}

                  </tbody>

                </table>
              )}

            </div>

            {/* Footer */}

            <div className="dashboard-items-footer">

              <div className="flex items-center gap-4">

                <span>
                  {items.length} Items
                </span>

                <span>
                  {completedCount}/
                  {items.length} abgehakt
                </span>

                <span>
                  {totalStacks} Stacks
                </span>

              </div>

            </div>

          </section>

        </div>

      </div>

      {/* =================================================
          DUPLIKAT MODAL
          ================================================= */}

      {showDuplicate && (
        <Modal
          title="Bestellung duplizieren"
          onClose={() =>
            setShowDuplicate(false)
          }
        >

          <p className="text-sm text-zinc-500">
            Erstelle eine Kopie dieser
            Bestellung mit einem neuen Namen.
          </p>

          <input
            autoFocus
            value={duplicateName}
            onChange={(event) =>
              setDuplicateName(
                event.target.value,
              )
            }
            onKeyDown={(event) => {

              if (event.key === "Enter") {
                confirmDuplicate();
              }

              if (event.key === "Escape") {
                setShowDuplicate(false);
              }

            }}
            placeholder="Name der Kopie"
            className="dashboard-modal-input"
          />

          <div className="mt-4 grid grid-cols-2 gap-2">

            <button
              type="button"
              onClick={() =>
                setShowDuplicate(false)
              }
              className="dashboard-modal-button dashboard-modal-cancel"
            >
              Abbrechen
            </button>

            <button
              type="button"
              disabled={
                !duplicateName.trim()
              }
              onClick={confirmDuplicate}
              className="dashboard-modal-button dashboard-modal-confirm disabled:opacity-30"
            >
              <Copy size={15} />
              Kopieren
            </button>

          </div>

        </Modal>
      )}

      {/* =================================================
          DELETE MODAL
          ================================================= */}

      {showDelete && (
        <Modal
          title="Bestellung löschen"
          onClose={() =>
            setShowDelete(false)
          }
        >

          <p className="text-sm leading-6 text-zinc-500">

            Möchtest du{" "}

            <strong className="text-white">
              „{orderName}“
            </strong>{" "}

            wirklich löschen?

            <br />

            Diese Aktion kann nicht
            rückgängig gemacht werden.

          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">

            <button
              type="button"
              onClick={() =>
                setShowDelete(false)
              }
              className="dashboard-modal-button dashboard-modal-cancel"
            >
              Abbrechen
            </button>

            <button
              type="button"
              onClick={confirmDelete}
              className="dashboard-modal-button dashboard-modal-delete"
            >
              <Trash2 size={15} />
              Löschen
            </button>

          </div>

        </Modal>
      )}

    </main>
  );
}

/* =========================================================
   MODAL
========================================================= */

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

function Modal({
  title,
  children,
  onClose,
}: ModalProps) {
  return (
    <div
      className="dashboard-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="dashboard-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="dashboard-modal-header">

          <h2>
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="dashboard-modal-close"
          >
            <X size={16} />
          </button>

        </div>

        <div className="dashboard-modal-body">
          {children}
        </div>

      </div>
    </div>
  );
}