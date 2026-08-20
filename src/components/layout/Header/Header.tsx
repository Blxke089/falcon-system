import {
  ArrowLeft,
  Settings,
  Upload,
  Download,
} from "lucide-react";

import type { ChangeEvent } from "react";

import { useNavigate } from "react-router-dom";

import "./Header.css";

import {
  getOrders,
  saveOrder,
  type SavedOrder,
} from "../../../services/OrderStorage/OrderStorage";

interface HeaderProps {
  onSettings: () => void;
  userName?: string;
  userRole?: string;
  userAvatar?: string | null;
}

interface ExportData {
  app: string;
  version: string;
  exportedAt: string;
  orders: SavedOrder[];
}

export default function Header({
  onSettings,
}: HeaderProps) {
  const navigate = useNavigate();

  /* =========================================================
     EXPORT
     ========================================================= */

  async function handleExport() {
    try {
      const orders = await getOrders();

      if (orders.length === 0) {
        window.alert(
          "Es sind noch keine Bestellungen zum Exportieren vorhanden.",
        );

        return;
      }

      const exportData: ExportData = {
        app: "089 Calculator",
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        orders,
      };

      const json = JSON.stringify(
        exportData,
        null,
        2,
      );

      const blob = new Blob(
        [json],
        {
          type: "application/json",
        },
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;

      link.download = `089-calculator-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Export-Fehler:",
        error,
      );

      window.alert(
        "Die Bestellungen konnten nicht exportiert werden.",
      );
    }
  }

  /* =========================================================
     IMPORT
     ========================================================= */

  function handleImport(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const result = reader.result;

        if (typeof result !== "string") {
          throw new Error(
            "Datei konnte nicht gelesen werden.",
          );
        }

        const data = JSON.parse(
          result,
        ) as Partial<ExportData>;

        if (
          data.app !== "089 Calculator" ||
          !Array.isArray(data.orders)
        ) {
          throw new Error(
            "Ungültige 089-Calculator-Datei.",
          );
        }

        let imported = 0;

        for (const order of data.orders) {
          if (
            !order ||
            typeof order.id !== "string" ||
            typeof order.name !== "string" ||
            !Array.isArray(order.items)
          ) {
            continue;
          }

          const success = await saveOrder(order);

          if (success !== false) {
            imported++;
          }
        }

        if (imported === 0) {
          throw new Error(
            "Es wurden keine gültigen Bestellungen gefunden.",
          );
        }

        window.alert(
          `${imported} Bestellung${
            imported === 1 ? "" : "en"
          } erfolgreich importiert.`,
        );

        window.location.reload();
      } catch (error) {
        console.error(
          "Import-Fehler:",
          error,
        );

        window.alert(
          error instanceof Error
            ? error.message
            : "Die Datei konnte nicht importiert werden.",
        );
      }
    };

    reader.onerror = () => {
      window.alert(
        "Die Datei konnte nicht gelesen werden.",
      );
    };

    reader.readAsText(file);

    event.target.value = "";
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      <style>{`
        /* =====================================================
           FALCON HUB BUTTON
           Exakt derselbe Look wie der bisherige Dashboard-Button.
        ===================================================== */

        .header-falcon-hub-button {
          position: relative;
          flex-shrink: 0;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;

          height: 40px;
          padding: 0 16px;

          overflow: hidden;

          border: 1px solid rgba(239, 68, 68, 0.42);
          border-radius: 12px;

          background:
            linear-gradient(
              135deg,
              rgba(239, 68, 68, 0.16),
              rgba(127, 29, 29, 0.08)
            );

          color: #ffffff;

          font-size: 13px;
          font-weight: 600;
          line-height: 1;

          white-space: nowrap;

          cursor: pointer;

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

        .header-falcon-hub-button::before {
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
            falcon-header-back-sweep
            4s
            ease-in-out
            infinite;
        }

        .header-falcon-hub-button::after {
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
            falcon-header-back-pulse
            2.6s
            ease-in-out
            infinite;
        }

        .header-falcon-hub-button > * {
          position: relative;
          z-index: 2;
        }

        .header-falcon-hub-button:hover {
          transform: translateY(-1px);

          border-color:
            rgba(248, 113, 113, 0.82);

          background:
            linear-gradient(
              135deg,
              rgba(239, 68, 68, 0.25),
              rgba(127, 29, 29, 0.13)
            );

          box-shadow:
            0 0 18px rgba(239, 68, 68, 0.20),
            0 0 38px rgba(239, 68, 68, 0.09),
            inset 0 0 16px rgba(239, 68, 68, 0.06);
        }

        .header-falcon-hub-button svg {
          flex-shrink: 0;

          transition:
            transform 0.25s ease,
            filter 0.25s ease;
        }

        .header-falcon-hub-button:hover svg {
          transform: translateX(-4px);

          filter:
            drop-shadow(
              0 0 5px
              rgba(248, 113, 113, 0.95)
            );
        }

        .header-falcon-hub-glow {
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
            falcon-header-back-dot
            2.2s
            ease-in-out
            infinite;
        }

        .header-falcon-hub-button:active {
          transform: scale(0.97);
        }

        @keyframes falcon-header-back-sweep {
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

        @keyframes falcon-header-back-pulse {
          0%,
          100% {
            opacity: 0.25;
          }

          50% {
            opacity: 0.68;
          }
        }

        @keyframes falcon-header-back-dot {
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
          .header-falcon-hub-button::before,
          .header-falcon-hub-button::after,
          .header-falcon-hub-glow {
            animation: none;
          }
        }
      `}</style>

      <header className="flex min-h-[64px] items-center justify-between gap-3 border-b border-white/[0.06] bg-black/20 px-4 backdrop-blur-xl xl:px-5">

        {/* LINKS: Falcon Hub */}
        <div className="flex min-w-0 items-center">
          <button
            type="button"
            onClick={() => navigate("/falcon")}
            className="header-falcon-hub-button"
            title="Zurück zum Falcon Hub"
          >
            <span className="header-falcon-hub-glow" />

            <ArrowLeft
              size={16}
              strokeWidth={2}
            />

            <span>
              Zurück zum Falcon Hub
            </span>
          </button>
        </div>

        {/* RECHTS: bestehende Header-Aktionen */}
        <div className="flex min-w-0 items-center justify-end gap-2">

          <button
            type="button"
            className="header-button"
            onClick={onSettings}
            title="Einstellungen"
          >
            <Settings size={16} />

            <span className="hidden lg:inline">
              Einstellungen
            </span>
          </button>

          <label
            className="header-button cursor-pointer"
            title="Bestellungen importieren"
          >
            <Download size={16} />

            <span className="hidden md:inline">
              Import
            </span>

            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            type="button"
            className="header-button header-button-primary"
            onClick={() => void handleExport()}
            title="Bestellungen exportieren"
          >
            <Upload size={16} />

            <span className="hidden md:inline">
              Export
            </span>
          </button>

        </div>
      </header>
    </>
  );
}