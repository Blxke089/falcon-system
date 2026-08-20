import {
  ClipboardList,
  Copy,
  FolderOpen,
  Plus,
  Search,
  Trash2,
  X,
  Package,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import "./Orders.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createOrderId,
  deleteOrder,
  getOrders,
  saveOrder,
  type SavedOrder,
} from "../../services/OrderStorage/OrderStorage";

import {
  getCurrentUserPermissions,
  type Permission,
} from "../../services/PermissionService/PermissionService";

interface OrdersProps {
  onOpenOrder: (order: SavedOrder) => void;
  onNewOrder: () => void;
}

export default function Orders({
  onOpenOrder,
  onNewOrder,
}: OrdersProps) {
  const [orders, setOrders] =
    useState<SavedOrder[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [copyOrder, setCopyOrder] =
    useState<SavedOrder | null>(null);

  const [copyName, setCopyName] =
    useState("");

  const [permissions, setPermissions] =
    useState<Set<Permission>>(new Set());

  const [
    permissionsLoading,
    setPermissionsLoading,
  ] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadPermissions() {
      const loaded =
        await getCurrentUserPermissions();

      if (!mounted) {
        return;
      }

      setPermissions(loaded);
      setPermissionsLoading(false);
    }

    void loadPermissions();

    return () => {
      mounted = false;
    };
  }, []);

  function can(
    permission: Permission,
  ): boolean {
    return permissions.has(permission);
  }

  async function refreshOrders() {
    setLoading(true);

    try {
      const loadedOrders =
        await getOrders();

      setOrders(loadedOrders);
    } catch (error) {
      console.error(
        "Bestellungen konnten nicht geladen werden:",
        error,
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshOrders();
  }, []);

  useEffect(() => {
    function handleFocus() {
      void refreshOrders();
    }

    window.addEventListener(
      "focus",
      handleFocus,
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus,
      );
    };
  }, []);

  const filteredOrders =
    useMemo(() => {
      const text =
        search.trim().toLowerCase();

      if (!text) {
        return orders;
      }

      return orders.filter((order) =>
        order.name
          .toLowerCase()
          .includes(text),
      );
    }, [orders, search]);

  function getProgress(
    order: SavedOrder,
  ) {
    if (order.items.length === 0) {
      return 0;
    }

    const completed =
      order.completedItems.filter(
        (id) =>
          order.items.some(
            (item) => item.id === id,
          ),
      ).length;

    return Math.round(
      (completed / order.items.length) * 100,
    );
  }

  function getTotalValue(
    order: SavedOrder,
  ) {
    return order.items.reduce(
      (total, item) => {
        const price =
          order.prices[item.id] ?? 0;

        return (
          total +
          item.stacks * price
        );
      },
      0,
    );
  }

  function getTotalStacks(
    order: SavedOrder,
  ) {
    return order.items.reduce(
      (total, item) =>
        total + item.stacks,
      0,
    );
  }

  function getTotalChests(
    order: SavedOrder,
  ) {
    return order.items.reduce(
      (total, item) =>
        total +
        item.singleChests +
        item.doubleChests,
      0,
    );
  }

  function handleStartCopy(
    order: SavedOrder,
  ) {
    if (!can("orders.create")) {
      return;
    }

    setCopyOrder(order);
    setCopyName(
      `${order.name} (Kopie)`,
    );
  }

  function handleCancelCopy() {
    setCopyOrder(null);
    setCopyName("");
  }

  async function handleConfirmCopy() {
    if (
      !copyOrder ||
      !can("orders.create")
    ) {
      return;
    }

    const name = copyName.trim();

    if (!name) {
      return;
    }

    const now =
      new Date().toISOString();

    const copiedOrder: SavedOrder = {
      id: createOrderId(),
      name,
      materialText:
        copyOrder.materialText,
      items: copyOrder.items.map(
        (item) => ({ ...item }),
      ),
      completedItems: [
        ...copyOrder.completedItems,
      ],
      prices: {
        ...copyOrder.prices,
      },
      createdAt: now,
      updatedAt: now,
    };

    try {
      const success =
        await saveOrder(copiedOrder);

      if (!success) {
        return;
      }

      await refreshOrders();
      handleCancelCopy();
    } catch (error) {
      console.error(
        "Bestellung konnte nicht kopiert werden:",
        error,
      );

      window.alert(
        "Die Bestellung konnte nicht kopiert werden.",
      );
    }
  }

  async function handleDelete(
    id: string,
  ) {
    if (!can("orders.delete")) {
      return;
    }

    const order =
      orders.find(
        (item) => item.id === id,
      );

    if (!order) {
      return;
    }

    const confirmed =
      window.confirm(
        `"${order.name}" wirklich löschen?`,
      );

    if (!confirmed) {
      return;
    }

    const success =
      await deleteOrder(id);

    if (!success) {
      return;
    }

    await refreshOrders();
  }

  function formatDate(
    date: string,
  ) {
    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return "Unbekannt";
    }

    return parsed.toLocaleDateString(
      "de-DE",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    );
  }

  const totalItems =
    orders.reduce(
      (total, order) =>
        total + order.items.length,
      0,
    );

  const averageProgress =
    orders.length > 0
      ? Math.round(
          orders.reduce(
            (total, order) =>
              total + getProgress(order),
            0,
          ) / orders.length,
        )
      : 0;

  if (permissionsLoading) {
    return (
      <main className="orders-shell min-h-full p-5 xl:p-7">
        <div className="flex min-h-[300px] items-center justify-center text-sm text-zinc-600">
          Berechtigungen werden geladen...
        </div>
      </main>
    );
  }

  if (!can("orders.view")) {
    return (
      <main className="orders-shell min-h-full p-5 xl:p-7">
        <section className="orders-glass-panel rounded-2xl border p-12 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/15 bg-red-500/5 text-red-400">
            <ClipboardList size={28} />
          </div>

          <h2 className="text-xl font-bold text-white">
            Kein Zugriff
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
            Du hast keine Berechtigung,
            Bestellungen anzuzeigen.
          </p>
        </section>
      </main>
    );
  }

  const viewingAll =
    can("orders.view_all");

  return (
    <main className="orders-shell min-h-full p-4 xl:p-6">
      <div className="orders-page-orb orders-page-orb-one" />
      <div className="orders-page-orb orders-page-orb-two" />

      <div className="orders-content mx-auto w-full max-w-[1680px]">
        {/* =====================================================
            HEADER
            ===================================================== */}
        <header className="orders-page-actions">
          {can("orders.create") && (
            <button
              type="button"
              onClick={onNewOrder}
              className="orders-primary-button orders-top-button inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
            >
              <Plus size={17} />
              Neue Bestellung
            </button>
          )}
        </header>

        {/* =====================================================
            STATS — bewusst nur 3 Karten, Gesamtwert bleibt in Tabelle
            ===================================================== */}
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <OrderStat
            icon={<ClipboardList size={18} />}
            label="BESTELLUNGEN"
            value={orders.length.toString()}
            description={
              viewingAll
                ? "Alle sichtbaren Bestellungen"
                : "Eigene gespeicherte Projekte"
            }
          />

          <OrderStat
            icon={<Package size={18} />}
            label="ITEMS"
            value={totalItems.toString()}
            description="Verschiedene Materialien"
          />

          <OrderStat
            icon={<CheckCircle2 size={18} />}
            label="FORTSCHRITT"
            value={`${averageProgress}%`}
            description="Durchschnittlicher Fortschritt"
          />
        </div>

        {/* =====================================================
            EIN GROSSER GEMEINSAMER PREMIUM-RAHMEN
            ===================================================== */}
        <section className="orders-main-frame">
          <div className="orders-frame-beam" />
          <div className="orders-frame-glow" />

          <div className="orders-main-frame-inner">
            {/* Toolbar */}
            <div className="orders-toolbar">
              <div className="orders-toolbar-title">
                <div className="orders-toolbar-icon">
                  <ClipboardList size={17} />
                </div>

                <div>
                  <p>BESTELLUNGSÜBERSICHT</p>
                  <span>
                    {filteredOrders.length} von {orders.length} Bestellungen
                  </span>
                </div>
              </div>

              <div className="orders-toolbar-search">
                <span className="orders-search-icon" aria-hidden="true">
                  <Search size={16} />
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Bestellung suchen..."
                  className="orders-search-input w-full rounded-xl border px-11 py-3 text-sm text-white outline-none"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-600 transition hover:bg-white/5 hover:text-white"
                    title="Suche zurücksetzen"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="orders-state">
                <div className="orders-loader">
                  <span />
                  <span />
                  <span />
                </div>
                <p>Bestellungen werden geladen...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="orders-state orders-empty-state">
                <div className="orders-empty-icon">
                  <ClipboardList size={28} />
                </div>

                <h2>
                  {orders.length === 0
                    ? "Noch keine Bestellungen"
                    : "Keine Bestellung gefunden"}
                </h2>

                <p>
                  {orders.length === 0
                    ? "Erstelle deine erste Bestellung über den Button oben."
                    : "Versuche einen anderen Suchbegriff."}
                </p>

                {/* Der große Empty-State bleibt bewusst ohne zusätzlichen Button. */}
              </div>
            ) : (
              <div className="orders-table-wrap">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th className="orders-col-order">BESTELLUNG</th>
                      <th>ITEMS</th>
                      <th>STACKS</th>
                      <th>KISTEN</th>
                      <th>FORTSCHRITT</th>
                      <th>GESAMTWERT</th>
                      <th className="orders-col-actions">AKTIONEN</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map((order) => {
                      const progress = getProgress(order);
                      const totalValue = getTotalValue(order);
                      const totalStacks = getTotalStacks(order);
                      const totalChests = getTotalChests(order);

                      const completedCount =
                        order.completedItems.filter((id) =>
                          order.items.some((item) => item.id === id),
                        ).length;

                      return (
                        <tr key={order.id} className="orders-table-row">
                          <td>
                            <div className="orders-order-cell">
                              <div className="orders-order-icon">
                                <Package size={18} />
                              </div>

                              <div className="min-w-0">
                                <div className="orders-order-kicker">
                                  AKTUELLE BESTELLUNG
                                </div>

                                <div className="orders-order-name" title={order.name}>
                                  {order.name}
                                </div>

                                <div className="orders-order-date">
                                  <Clock3 size={11} />
                                  {formatDate(order.createdAt)}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="orders-number">
                              {order.items.length}
                            </span>
                          </td>

                          <td>
                            <span className="orders-number orders-number-badge">
                              {totalStacks.toLocaleString("de-DE")}
                            </span>
                          </td>

                          <td>
                            <span className="orders-muted-value">
                              {totalChests.toLocaleString("de-DE")} SK
                            </span>
                          </td>

                          <td>
                            <div className="orders-progress-cell">
                              <div className="orders-progress-head">
                                <strong>{progress}%</strong>
                                <span>
                                  {completedCount}/{order.items.length}
                                </span>
                              </div>

                              <div className="orders-progress-track">
                                <div
                                  className="orders-progress-fill"
                                  style={{ width: `${progress}%` }}
                                />
                                <div className="orders-progress-shine" />
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="orders-value-cell">
                              <span className="orders-value-label">
                                GESAMT
                              </span>
                              <strong>
                                {totalValue > 0
                                  ? `${totalValue.toLocaleString("de-DE", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })} $`
                                  : "—"}
                              </strong>
                            </div>
                          </td>

                          <td>
                            <div className="orders-actions">
                              {can("orders.view") && (
                                <button
                                  type="button"
                                  onClick={() => onOpenOrder(order)}
                                  className="orders-open-button"
                                  title="Bestellung öffnen"
                                >
                                  <FolderOpen size={15} />
                                </button>
                              )}

                              {can("orders.create") && (
                                <button
                                  type="button"
                                  onClick={() => handleStartCopy(order)}
                                  className="orders-copy-button"
                                  title="Bestellung kopieren"
                                >
                                  <Copy size={15} />
                                </button>
                              )}

                              {can("orders.delete") && (
                                <button
                                  type="button"
                                  onClick={() => void handleDelete(order.id)}
                                  className="orders-delete-button"
                                  title="Bestellung löschen"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="orders-table-footer">
                  <span>{filteredOrders.length} Bestellungen angezeigt</span>
                  <span>Falcon System • Bestellverwaltung</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {copyOrder &&
        can("orders.create") && (
          <div
            className="orders-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-5"
            onClick={handleCancelCopy}
          >
            <div
              className="orders-copy-modal w-full max-w-md rounded-2xl border p-6"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-yellow-500">
                    Bestellung kopieren
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-white">
                    Neue Kopie erstellen
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Die Items, Preise und
                    der Fortschritt werden
                    übernommen.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCancelCopy}
                  className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Name der Kopie
                </label>

                <input
                  type="text"
                  value={copyName}
                  onChange={(event) =>
                    setCopyName(
                      event.target.value,
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      void handleConfirmCopy();
                    }

                    if (
                      event.key === "Escape"
                    ) {
                      handleCancelCopy();
                    }
                  }}
                  autoFocus
                  className="orders-modal-input w-full rounded-xl border px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCancelCopy}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 font-semibold text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Abbrechen
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleConfirmCopy()
                  }
                  disabled={!copyName.trim()}
                  className="orders-primary-button rounded-xl px-4 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Copy
                    size={16}
                    className="mr-2 inline"
                  />
                  Kopie erstellen
                </button>
              </div>
            </div>
          </div>
        )}
    </main>
  );
}

interface OrderStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}

function OrderStat({
  icon,
  label,
  value,
  description,
}: OrderStatProps) {
  return (
    <div className="orders-stat-card rounded-2xl border p-4">
      <div className="flex items-center gap-3">
        <div className="orders-stat-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-yellow-500">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-bold tracking-[0.18em] text-zinc-600">
            {label}
          </p>

          <p className="mt-0.5 truncate text-xl font-black text-white">
            {value}
          </p>

          <p className="mt-0.5 truncate text-[10px] text-zinc-600">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}