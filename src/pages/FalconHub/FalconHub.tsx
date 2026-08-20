import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

import {
  Calculator,
} from "lucide-react";

import "./FalconHub.css";

type FalconProject = {
  name: string;
  description: string;
  route: string;
  icon: LucideIcon;
  position: string;
};

const projects: FalconProject[] = [
  {
    name: "FALCON CALCULATOR",
    description: "BESTELLUNGEN · ITEMS · VERWALTUNG",
    route: "/dashboard",
    icon: Calculator,
    position: "hub-node-dashboard",
  },
];

export default function FalconHub() {
  const navigate = useNavigate();

  return (
    <div className="falcon-hub">

      {/* Hintergrund */}
      <div className="falcon-hub-background" />

      <div className="falcon-hub-stars" />

      <div className="falcon-hub-glow falcon-hub-glow-left" />
      <div className="falcon-hub-glow falcon-hub-glow-right" />

      {/* =========================================
          HEADBAR
      ========================================= */}

      <header className="falcon-hub-header">

        <div className="falcon-hub-header-brand">

          <div className="falcon-hub-small-logo">
            F
          </div>

          <div className="falcon-hub-brand-text">
            <strong>FALCON SYSTEM</strong>

            <span>
              ZENTRALE SYSTEMSTEUERUNG
            </span>
          </div>

        </div>

        <div className="falcon-hub-header-info">

          <span>
            ZENTRALE PROJEKTSTEUERUNG
          </span>

          <b>•</b>

          <span>
            DIREKTZUGRIFF
          </span>

          <b>•</b>

          <span>
            SECURE CONNECTION
          </span>

        </div>

        <div className="falcon-hub-online">

          <i />

          SYSTEM ONLINE

        </div>

      </header>

      {/* =========================================
          MAP TITLE
      ========================================= */}

      <div className="falcon-hub-title">

        <span>FALCON CONTROL</span>

        <h1>FALCON HUB</h1>

        <p>
          Alle Systeme zentral an einem Ort.
        </p>

      </div>

      {/* =========================================
          MINDMAP
      ========================================= */}

      <main className="falcon-hub-map">

        <div className="falcon-hub-connections">

          <div className="hub-connection connection-1" />

        </div>

        {/* =====================================
            ZENTRALES FALCON LOGO
            Nur Logo – keine Schrift
        ===================================== */}

        <div className="falcon-hub-core">

          <div className="falcon-core-outer" />
          <div className="falcon-core-middle" />
          <div className="falcon-core-inner" />

          <div className="falcon-core-logo">

            <svg
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <path
                d="M50 76
                   C42 67 35 57 35 46
                   C35 32 43 20 50 12
                   C57 20 65 32 65 46
                   C65 57 58 67 50 76Z"
              />

              <path
                d="M43 43
                   C34 38 25 34 13 35
                   C23 43 31 51 43 54"
              />

              <path
                d="M57 43
                   C66 38 75 34 87 35
                   C77 43 69 51 57 54"
              />

              <path
                d="M47 55
                   L42 73
                   L50 68
                   L58 73
                   L53 55"
              />

            </svg>

          </div>

          <div className="falcon-core-dot" />

        </div>

        {/* =====================================
            PROJEKTE
            Nur komplette Apps / Projekte.
            Unterseiten bleiben innerhalb des Projekts.
        ===================================== */}

        {projects.map((project) => {

          const Icon = project.icon;

          return (
            <button
              key={project.name}
              type="button"
              className={`falcon-hub-node ${project.position}`}
              onClick={() =>
                navigate(project.route)
              }
            >

              <div className="falcon-node-number">
                {String(
                  projects.indexOf(project) + 1,
                ).padStart(2, "0")}
              </div>

              <div className="falcon-node-icon">
                <Icon
                  size={23}
                  strokeWidth={1.7}
                />
              </div>

              <div className="falcon-node-content">

                <strong>
                  {project.name}
                </strong>

                <span>
                  {project.description}
                </span>

                <small>
                  <i />
                  SYSTEM BEREIT
                </small>

              </div>

              <div className="falcon-node-arrow">
                →
              </div>

              <div className="falcon-node-highlight" />

            </button>
          );
        })}

      </main>

    </div>
  );
}