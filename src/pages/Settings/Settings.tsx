import {
  CheckCircle2,
  Database,
  RefreshCw,
  Shield,
  Sparkles,
  Wifi,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  getCurrentUserPermissions,
  type Permission,
} from "../../services/PermissionService/PermissionService";

export default function Settings() {
  const [permissions, setPermissions] = useState<Set<Permission>>(new Set());
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadPermissions() {
      const loaded = await getCurrentUserPermissions();

      if (!mounted) return;

      setPermissions(loaded);
      setPermissionsLoading(false);
    }

    void loadPermissions();

    return () => {
      mounted = false;
    };
  }, []);

  function can(permission: Permission): boolean {
    return permissions.has(permission);
  }

  function handleReload() {
    window.location.reload();
  }

  if (permissionsLoading) {
    return (
      <main className="settings-page relative min-h-full overflow-hidden bg-transparent px-4 py-7 sm:px-7 lg:px-10 xl:px-14">
        <div className="mx-auto flex min-h-[420px] max-w-[920px] items-center justify-center">
          <div className="settings-loading text-center">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-300/70">
              Falcon System
            </p>
            <p className="mt-2 text-sm text-zinc-600">Berechtigungen werden geladen...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!can("settings.view")) {
    return (
      <main className="settings-page relative min-h-full overflow-hidden bg-transparent px-5 py-6 xl:px-10 2xl:px-14">
        <div className="flex min-h-[520px] items-center justify-center">
          <section className="settings-card w-full max-w-md rounded-3xl p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/15 bg-red-500/[0.05] text-red-400">
              <Shield size={28} />
            </div>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.25em] text-red-400/70">
              Zugriff verweigert
            </p>
            <h1 className="mt-2 text-2xl font-black text-white">Falcon System</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Du hast keine Berechtigung, die Einstellungen zu öffnen.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const styles = `


    .settings-page .falcon-card,
    .settings-page .supabase-panel {
      width: 100%;
      max-width: 1040px;
      margin-left: auto;
      margin-right: auto;
      box-sizing: border-box;
    }

    .settings-page .falcon-card > *,
    .settings-page .supabase-panel > * {
      min-width: 0;
      max-width: 100%;
    }

    .settings-page h1,
    .settings-page h2,
    .settings-page h3,
    .settings-page p,
    .settings-page span {
      max-width: 100%;
    }


    .settings-page .settings-main-wrap {
      width: 100%;
      max-width: 1040px;
      margin-inline: auto;
    }

    .settings-page .settings-section {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }

    .settings-page .settings-section * {
      min-width: 0;
    }

    .settings-page .settings-section p,
    .settings-page .settings-section h1,
    .settings-page .settings-section h2,
    .settings-page .settings-section span {
      overflow-wrap: anywhere;
    }

    @media (max-width: 760px) {
      .settings-page {
        padding-left: 12px !important;
        padding-right: 12px !important;
      }

      .settings-page .settings-section {
        border-radius: 20px !important;
      }
    }


    .settings-page-centered {
      min-height: calc(100vh - 60px);
    }

    .settings-page-centered .settings-main-wrap {
      width: min(920px, calc(100vw - 48px));
      margin-left: auto !important;
      margin-right: auto !important;
    }

    .settings-page-centered .settings-card {
      width: 100%;
      max-width: 920px;
      margin-left: auto;
      margin-right: auto;
    }

    .settings-page-centered .settings-section {
      width: 100%;
    }

    .settings-page-centered .settings-mini-card-version {
      width: 100%;
    }

    @media (max-width: 760px) {
      .settings-page-centered {
        min-height: auto;
      }

      .settings-page-centered .settings-main-wrap {
        width: 100%;
        max-width: none;
        min-height: auto;
        padding-top: 18px;
      }
    }

    .settings-page .settings-mini-card {
      min-width: 0;
    }

    @media (max-width: 700px) {
      .settings-page {
        padding-left: 14px !important;
        padding-right: 14px !important;
      }

      .settings-page .falcon-card,
      .settings-page .supabase-panel {
        border-radius: 18px !important;
      }
    }

    .settings-page .settings-mini-card {
      position: relative;
      display: flex;
      min-width: 0;
      align-items: center;
      gap: 10px;
      overflow: hidden;
      border: 1px solid rgba(168,85,247,.10);
      border-radius: 14px;
      padding: 10px 12px;
      background: linear-gradient(135deg, rgba(168,85,247,.055), rgba(255,255,255,.012)), rgba(4,3,9,.62);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.025);
      transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease;
    }

    .settings-page .settings-mini-card::after {
      content: "";
      position: absolute;
      top: 0;
      left: -70%;
      width: 45%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(216,180,254,.10), transparent);
      transform: skewX(-18deg);
      transition: left .7s ease;
      pointer-events: none;
    }

    .settings-page .settings-mini-card:hover {
      transform: translateY(-1px);
      border-color: rgba(168,85,247,.25);
      box-shadow: 0 10px 28px rgba(91,33,182,.10), inset 0 1px 0 rgba(255,255,255,.035);
    }

    .settings-page .settings-mini-card:hover::after {
      left: 135%;
    }

    .settings-page .settings-mini-card-green {
      border-color: rgba(16,185,129,.10);
    }

    .settings-page .settings-mini-card-green:hover {
      border-color: rgba(16,185,129,.24);
      box-shadow: 0 10px 28px rgba(16,185,129,.07), inset 0 1px 0 rgba(255,255,255,.035);
    }

    .settings-page .settings-mini-icon {
      display: flex;
      width: 30px;
      height: 30px;
      flex: 0 0 30px;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(168,85,247,.15);
      border-radius: 9px;
      color: rgb(192 132 252);
      background: rgba(168,85,247,.055);
    }

    .settings-page .settings-mini-icon-green {
      border-color: rgba(16,185,129,.14);
      color: rgb(52 211 153);
      background: rgba(16,185,129,.045);
    }

    .settings-page .settings-mini-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 8px;
      font-weight: 900;
      letter-spacing: .16em;
      color: rgba(161,161,170,.62);
    }

    .settings-page .settings-mini-value {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 11px;
      font-weight: 800;
      color: rgb(228 228 231);
    }

    @keyframes falconBorder {
      0% { background-position: 0% 50%; opacity: .3; }
      50% { background-position: 100% 50%; opacity: .95; }
      100% { background-position: 0% 50%; opacity: .3; }
    }

    @keyframes falconSweep {
      0% { transform: translateX(-150%) skewX(-18deg); opacity: 0; }
      14% { opacity: .65; }
      50% { opacity: .16; }
      86% { opacity: .65; }
      100% { transform: translateX(520%) skewX(-18deg); opacity: 0; }
    }

    @keyframes falconGlow {
      0%, 100% { opacity: .45; transform: scale(.96); }
      50% { opacity: .9; transform: scale(1.04); }
    }

    @keyframes falconDot {
      0%, 100% { opacity: .45; box-shadow: 0 0 5px rgba(52,211,153,.35); }
      50% { opacity: 1; box-shadow: 0 0 14px rgba(52,211,153,.85); }
    }

    .settings-page {
      isolation: isolate;
      min-height: 100%;
    }

    .settings-page::before {
      content: "";
      position: fixed;
      inset: 0;
      z-index: -3;
      pointer-events: none;
      background:
        radial-gradient(circle at 72% 15%, rgba(168,85,247,.08), transparent 30%),
        radial-gradient(circle at 25% 85%, rgba(91,33,182,.055), transparent 32%);
    }

    .settings-page::after {
      content: "";
      position: fixed;
      width: 560px;
      height: 560px;
      right: -250px;
      top: 60px;
      z-index: -2;
      pointer-events: none;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(168,85,247,.12), transparent 68%);
      filter: blur(25px);
      animation: falconGlow 7s ease-in-out infinite;
    }


    .settings-page .settings-hero-centered {
      display: flex;
      width: 100%;
      min-height: 72px;
      align-items: center;
      justify-content: center;
    }

    .settings-page .settings-centered-status {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 11px;
      min-height: 40px;
      padding: 9px 20px;
      border: 1px solid rgba(168,85,247,.20);
      border-radius: 999px;
      background: rgba(8,5,16,.66);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.035),
        0 0 28px rgba(139,92,246,.08);
      overflow: hidden;
    }

    .settings-page .settings-centered-status::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(216,180,254,.12) 48%,
        transparent 100%
      );
      transform: translateX(-115%);
      animation: settingsHeaderShimmer 4.8s ease-in-out infinite;
      pointer-events: none;
    }

    .settings-page .settings-centered-status-dot {
      position: relative;
      z-index: 1;
      width: 7px;
      height: 7px;
      flex: 0 0 7px;
      border-radius: 999px;
      background: rgb(52 211 153);
      box-shadow: 0 0 11px rgba(52,211,153,.8);
      animation: settingsStatusPulse 2s ease-in-out infinite;
    }

    .settings-page .settings-centered-status-label,
    .settings-page .settings-centered-status-online {
      position: relative;
      z-index: 1;
      white-space: nowrap;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .16em;
    }

    .settings-page .settings-centered-status-label {
      color: rgb(196 181 253);
    }

    .settings-page .settings-centered-status-online {
      color: rgb(52 211 153);
    }

    .settings-page .settings-centered-status-divider {
      position: relative;
      z-index: 1;
      width: 1px;
      height: 15px;
      background: rgba(168,85,247,.28);
    }

    @keyframes settingsHeaderShimmer {
      0%, 65% { transform: translateX(-115%); }
      82%, 100% { transform: translateX(115%); }
    }

    @keyframes settingsStatusPulse {
      0%, 100% { opacity: .72; transform: scale(.9); }
      50% { opacity: 1; transform: scale(1.14); }
    }

    .settings-card {
      position: relative;
      isolation: isolate;
      overflow: hidden;
      border: 1px solid rgba(168,85,247,.16);
      background:
        radial-gradient(circle at 92% 0%, rgba(168,85,247,.10), transparent 28%),
        linear-gradient(145deg, rgba(12,8,20,.97), rgba(3,3,8,.96));
      box-shadow:
        0 30px 100px rgba(0,0,0,.38),
        inset 0 1px 0 rgba(255,255,255,.04);
    }

    .settings-card::before {
      content: "";
      position: absolute;
      inset: 0;
      padding: 1px;
      border-radius: inherit;
      background: linear-gradient(
        110deg,
        transparent 5%,
        rgba(168,85,247,.12) 25%,
        rgba(216,180,254,.9) 48%,
        rgba(168,85,247,.12) 68%,
        transparent 92%
      );
      background-size: 260% 100%;
      animation: falconBorder 6s ease-in-out infinite;
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
      z-index: 5;
    }

    .settings-card::after {
      content: "";
      position: absolute;
      left: -25%;
      top: -30%;
      width: 17%;
      height: 160%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.10), rgba(216,180,254,.18), transparent);
      filter: blur(7px);
      transform: skewX(-18deg);
      animation: falconSweep 8s ease-in-out infinite;
      pointer-events: none;
      z-index: 4;
    }

    .settings-card > * {
      position: relative;
      z-index: 6;
    }

    .settings-section {
      position: relative;
      border: 1px solid rgba(168,85,247,.10);
      background: linear-gradient(135deg, rgba(168,85,247,.045), rgba(255,255,255,.012) 55%, transparent);
      border-radius: 20px;
      overflow: hidden;
    }

    .settings-section::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(192,132,252,.6), transparent);
      opacity: .7;
    }

    .settings-row {
      border: 1px solid rgba(255,255,255,.045);
      background: rgba(255,255,255,.018);
      transition: border-color .22s ease, background .22s ease, transform .22s ease;
    }

    .settings-row:hover {
      transform: translateX(2px);
      border-color: rgba(168,85,247,.16);
      background: rgba(168,85,247,.028);
    }

    .settings-button {
      position: relative;
      isolation: isolate;
      overflow: hidden;
      transition: transform .2s ease, box-shadow .25s ease, filter .25s ease;
    }

    .settings-button::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -1;
      background: linear-gradient(105deg, transparent 20%, rgba(255,255,255,.23) 50%, transparent 80%);
      transform: translateX(-135%);
      transition: transform .65s ease;
    }

    .settings-button:hover::before { transform: translateX(135%); }
    .settings-button:hover { transform: translateY(-2px); filter: brightness(1.08); box-shadow: 0 12px 35px rgba(168,85,247,.20); }
    .settings-button:active { transform: scale(.985); }

    .settings-status-dot { animation: falconDot 2.5s ease-in-out infinite; }

    .settings-chip {
      border: 1px solid rgba(255,255,255,.06);
      background: rgba(255,255,255,.025);
    }

    @media (max-width: 720px) {
      .settings-page { padding-left: 14px !important; padding-right: 14px !important; }
    }
  `;

  return (
    <>
      <style>{styles}</style>

      <main className="settings-page settings-page-centered relative overflow-hidden bg-transparent px-4 py-6 sm:px-7 lg:px-10 xl:px-14">
        <div className="settings-main-wrap mx-auto flex w-full max-w-[920px] items-center justify-center pb-10 pt-8 lg:min-h-[calc(100vh-92px)] lg:pt-14">

          <section className="settings-card rounded-[26px] p-3 sm:p-4">
            {/* HERO */}
            <div className="settings-section settings-hero-centered p-5 sm:p-7">
              <div className="settings-centered-status">
                <span className="settings-centered-status-dot" />
                <span className="settings-centered-status-label">FALCON SYSTEM</span>
                <span className="settings-centered-status-divider" />
                <span className="settings-centered-status-online">ONLINE</span>
              </div>
            </div>

            {/* SYSTEM + SUPABASE */}
            <div className="mt-4 flex w-full flex-col gap-4">
              <div className="settings-section w-full min-w-0 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-500/15 bg-violet-500/[0.05] text-violet-300">
                    <Database size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400/70">System Status</p>
                        <h2 className="mt-1 text-xl font-black text-white">Falcon System</h2>
                      </div>
                      <span className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/[0.05] px-2.5 py-1.5 text-[9px] font-black text-emerald-400">
                        <span className="settings-status-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        AKTIV
                      </span>
                    </div>

                    <div className="mt-5">
                      <div className="settings-mini-card">
                        <div className="settings-mini-icon"><Database size={14} /></div>
                        <div className="min-w-0">
                          <p className="settings-mini-label">SYSTEM STATUS</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="settings-status-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span className="settings-mini-value">Aktiv</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/[0.05] bg-black/20 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/10 bg-violet-500/[0.04] text-violet-300">
                      <RefreshCw size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">Anwendung neu laden</p>
                      <p className="mt-1 text-[10px] leading-4 text-zinc-600">
                        Lädt die aktuelle Anwendung komplett neu.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReload}
                    className="settings-button flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-500/15 bg-violet-500/[0.08] px-4 py-2.5 text-[10px] font-black text-violet-200 hover:bg-violet-500/[0.14] sm:ml-auto"
                  >
                    <RefreshCw size={14} />
                    Neu laden
                  </button>
                </div>
              </div>

              <div className="settings-section w-full min-w-0 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.045] text-emerald-400">
                    <Shield size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black text-white">Supabase Storage</h2>
                      <span className="rounded-full border border-emerald-500/15 bg-emerald-500/[0.05] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.15em] text-emerald-400">
                        Sicher verbunden
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                      Zentrale Speicherung der Falcon-Daten.
                    </p>

                    <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-4">
                      <div className="settings-mini-card settings-mini-card-green">
                        <div className="settings-mini-icon settings-mini-icon-green"><Shield size={14} /></div>
                        <div className="min-w-0">
                          <p className="settings-mini-label">SUPABASE</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="settings-status-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span className="settings-mini-value">Verbunden</span>
                          </div>
                        </div>
                      </div>
                      <div className="settings-mini-card settings-mini-card-green">
                        <div className="settings-mini-icon settings-mini-icon-green"><Database size={14} /></div>
                        <div className="min-w-0">
                          <p className="settings-mini-label">DATENBANK</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="settings-status-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span className="settings-mini-value">Online</span>
                          </div>
                        </div>
                      </div>
                      <div className="settings-mini-card settings-mini-card-green">
                        <div className="settings-mini-icon settings-mini-icon-green"><Wifi size={14} /></div>
                        <div className="min-w-0">
                          <p className="settings-mini-label">VERBINDUNG</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="settings-status-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span className="settings-mini-value">Stabil</span>
                          </div>
                        </div>
                      </div>
                      <div className="settings-mini-card settings-mini-card-green">
                        <div className="settings-mini-icon settings-mini-icon-green"><CheckCircle2 size={14} /></div>
                        <div className="min-w-0">
                          <p className="settings-mini-label">STATUS</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="settings-status-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span className="settings-mini-value">Bereit</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="settings-mini-card settings-mini-card-version">
                        <div className="settings-mini-icon"><Sparkles size={14} /></div>
                        <div className="min-w-0">
                          <span className="settings-mini-label">VERSION</span>
                          <span className="mt-1 block settings-mini-value">1.0.0</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="settings-chip rounded-lg px-2.5 py-1.5 text-[9px] text-zinc-500">Items</span>
                      <span className="settings-chip rounded-lg px-2.5 py-1.5 text-[9px] text-zinc-500">Rollen</span>
                      <span className="settings-chip rounded-lg px-2.5 py-1.5 text-[9px] text-zinc-500">Berechtigungen</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
