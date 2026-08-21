import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import type { Session } from "@supabase/supabase-js";

import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

import Sidebar from "./components/layout/Sidebar/Sidebar";
import Header from "./components/layout/Header/Header";

import Dashboard from "./pages/Dashboard/Dashboard";
import Orders from "./pages/Orders/Orders";
import Items from "./pages/Items/Items";
import Settings from "./pages/Settings/Settings";
import PermissionsPanel from "./pages/Settings/PermissionsPanel";
import Users from "./pages/Users/Users";
import FalconHub from "./pages/FalconHub/FalconHub";

import type { SavedOrder } from "./services/OrderStorage/OrderStorage";

import {
  getCurrentUserPermissions,
} from "./services/PermissionService/PermissionService";

import type {
  Permission,
} from "./services/PermissionService/PermissionService";

import { supabase } from "./lib/supabase";

import "./App.css";

/* =========================================================
   TYPES
========================================================= */

type Page =
  | "hub"
  | "dashboard"
  | "orders"
  | "items"
  | "settings"
  | "permissions"
  | "users";

type Profile = {
  id: string;
  discord_id: string | null;
  discord_username: string | null;
  discord_avatar: string | null;
  role: string;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
};

/* =========================================================
   URL -> PAGE
========================================================= */

function getPageFromPath(
  pathname: string,
): Page {
  switch (pathname) {
    case "/":
    case "/falcon":
      return "hub";

    case "/dashboard":
      return "dashboard";

    case "/orders":
      return "orders";

    case "/items":
      return "items";

    case "/settings":
      return "settings";

    case "/permissions":
      return "permissions";

    case "/users":
      return "users";

    default:
      return "hub";
  }
}

/* =========================================================
   PAGE -> URL
========================================================= */

function getPathFromPage(
  page: Page,
): string {
  switch (page) {
    case "hub":
      return "/falcon";

    case "dashboard":
      return "/dashboard";

    case "orders":
      return "/orders";

    case "items":
      return "/items";

    case "settings":
      return "/settings";

    case "permissions":
      return "/permissions";

    case "users":
      return "/users";

    default:
      return "/falcon";
  }
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const [
    activePage,
    setActivePage,
  ] = useState<Page>(
    () =>
      getPageFromPath(
        window.location.pathname,
      ),
  );

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState<SavedOrder | null>(
    null,
  );

  const [
    ordersVersion,
    setOrdersVersion,
  ] = useState(0);

  const [
    session,
    setSession,
  ] = useState<Session | null>(
    null,
  );

  const [
    profile,
    setProfile,
  ] = useState<Profile | null>(
    null,
  );

  const [
    authLoading,
    setAuthLoading,
  ] = useState(true);

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(false);

  const [
    loginLoading,
    setLoginLoading,
  ] = useState(false);

  const [
    authError,
    setAuthError,
  ] = useState("");

  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  const [
    updateInstalling,
    setUpdateInstalling,
  ] = useState(false);

  const [
    updateVersion,
    setUpdateVersion,
  ] = useState<string | null>(
    null,
  );

  /* =========================================================
     AUTO UPDATER
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function checkForUpdates() {
      try {
        const update =
          await check();

        if (!mounted || !update) {
          return;
        }

        setUpdateVersion(
          update.version,
        );

        setUpdateInstalling(
          true,
        );

        await update.downloadAndInstall();

        if (!mounted) {
          return;
        }

        /*
         * Tauri hat das Update installiert.
         * Danach wird Falcon System neu gestartet.
         */
        await relaunch();
      } catch (error) {
        console.error(
          "Auto-Updater Fehler:",
          error,
        );

        /*
         * Ein Update-Fehler darf die App
         * NICHT unbenutzbar machen.
         *
         * Die aktuelle Version läuft
         * einfach weiter.
         */
        if (mounted) {
          setUpdateInstalling(
            false,
          );
        }
      }
    }

    void checkForUpdates();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     PERMISSIONS
  ========================================================= */

  const [
    permissions,
    setPermissions,
  ] = useState<Set<Permission>>(
    new Set(),
  );

  const [
    permissionsLoading,
    setPermissionsLoading,
  ] = useState(true);

  /* =========================================================
     URL SYNCHRONISIEREN
  ========================================================= */

  useEffect(() => {
    setActivePage(
      getPageFromPath(
        location.pathname,
      ),
    );
  }, [
    location.pathname,
  ]);

  /* =========================================================
     BERECHTIGUNG PRÜFEN
  ========================================================= */

  function can(
    permission: Permission,
  ): boolean {
    return permissions.has(
      permission,
    );
  }

  /* =========================================================
     PERMISSIONS LADEN
  ========================================================= */

  async function loadPermissions() {
    setPermissionsLoading(
      true,
    );

    const loadedPermissions =
      await getCurrentUserPermissions();

    setPermissions(
      loadedPermissions,
    );

    setPermissionsLoading(
      false,
    );
  }

  /* =========================================================
     PROFIL LADEN
  ========================================================= */

  async function loadProfile(
    currentSession: Session | null,
  ) {
    if (!currentSession) {
      setProfile(null);

      setPermissions(
        new Set(),
      );

      setPermissionsLoading(
        false,
      );

      setProfileLoading(
        false,
      );

      return;
    }

    setProfileLoading(
      true,
    );

    setAuthError("");

    const {
      data,
      error,
    } = await supabase
      .from("profiles")
      .select(
        "id, discord_id, discord_username, discord_avatar, role, is_banned, created_at, updated_at",
      )
      .eq(
        "id",
        currentSession.user.id,
      )
      .maybeSingle();

    if (error) {
      console.error(
        "Profil konnte nicht geladen werden:",
        error,
      );

      setAuthError(
        "Dein Benutzerprofil konnte nicht geladen werden.",
      );

      setProfile(null);

      setProfileLoading(
        false,
      );

      return;
    }

    const loadedProfile =
      data as Profile | null;

    /* =======================================================
       GEBANNT
    ======================================================= */

    if (
      loadedProfile?.is_banned
    ) {
      setProfile(null);

      setPermissions(
        new Set(),
      );

      setAuthError(
        "Dein Account wurde für den Falcon System gesperrt.",
      );

      setProfileLoading(
        false,
      );

      setPermissionsLoading(
        false,
      );

      await supabase.auth.signOut();

      return;
    }

    /* =======================================================
       PROFIL SETZEN
    ======================================================= */

    setProfile(
      loadedProfile,
    );

    setProfileLoading(
      false,
    );

    /* =======================================================
       PERMISSIONS
    ======================================================= */

    await loadPermissions();
  }

  /* =========================================================
     AUTH INITIALISIEREN
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      const {
        data,
        error,
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(
          "Session konnte nicht geladen werden:",
          error,
        );

        setAuthError(
          "Die Anmeldung konnte nicht geprüft werden.",
        );
      }

      setSession(
        data.session,
      );

      setAuthLoading(
        false,
      );

      await loadProfile(
        data.session,
      );
    }

    void initializeAuth();

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          nextSession,
        ) => {
          if (!mounted) {
            return;
          }

          setSession(
            nextSession,
          );

          setAuthLoading(
            false,
          );

          void loadProfile(
            nextSession,
          );
        },
      );

    return () => {
      mounted = false;

      authListener.subscription.unsubscribe();
    };
  }, []);

  /* =========================================================
     DISCORD LOGIN
  ========================================================= */

  async function handleDiscordLogin() {
    setLoginLoading(
      true,
    );

    setAuthError("");

    const {
      error,
    } =
      await supabase.auth.signInWithOAuth(
        {
          provider: "discord",

          options: {
            redirectTo:
              window.location.origin,
          },
        },
      );

    if (error) {
      console.error(
        "Discord Login Fehler:",
        error,
      );

      setAuthError(
        error.message ||
          "Discord-Anmeldung fehlgeschlagen.",
      );

      setLoginLoading(
        false,
      );
    }
  }

  /* =========================================================
     NAVIGATION
  ========================================================= */

  function handleNavigate(
    page: string,
  ) {
    const nextPage =
      page as Page;

    setActivePage(
      nextPage,
    );

    navigate(
      getPathFromPage(
        nextPage,
      ),
    );
  }

  /* =========================================================
     BESTELLUNG ÖFFNEN
  ========================================================= */

  function handleOpenOrder(
    order: SavedOrder,
  ) {
    setSelectedOrder(
      order,
    );

    setActivePage(
      "dashboard",
    );

    navigate(
      "/dashboard",
    );
  }

  /* =========================================================
     NEUE BESTELLUNG
  ========================================================= */

  function handleNewOrder() {
    setSelectedOrder(
      null,
    );

    setActivePage(
      "dashboard",
    );

    navigate(
      "/dashboard",
    );
  }

  /* =========================================================
     EINSTELLUNGEN
  ========================================================= */

  function handleSettings() {
    setSelectedOrder(
      null,
    );

    setActivePage(
      "settings",
    );

    navigate(
      "/settings",
    );
  }

  /* =========================================================
     BESTELLUNG GESPEICHERT
  ========================================================= */

  function handleOrderSaved() {
    setOrdersVersion(
      (version) =>
        version + 1,
    );
  }

  /* =========================================================
     SEITE RENDERN
  ========================================================= */

  function renderPage() {
    switch (
      activePage
    ) {
      case "hub":
        return (
          <FalconHub />
        );

      case "dashboard": {
        if (
          !can(
            "dashboard.view",
          )
        ) {
          return (
            <AccessDenied />
          );
        }

        return (
          <Dashboard
            selectedOrder={
              selectedOrder
            }
            onOrderLoaded={() =>
              setSelectedOrder(
                null,
              )
            }
            onOrderSaved={
              handleOrderSaved
            }
          />
        );
      }

      case "orders": {
        if (
          !can(
            "orders.view",
          )
        ) {
          return (
            <AccessDenied />
          );
        }

        return (
          <Orders
            key={
              ordersVersion
            }
            onOpenOrder={
              handleOpenOrder
            }
            onNewOrder={
              handleNewOrder
            }
          />
        );
      }

      case "items": {
        if (
          !can(
            "items.view",
          )
        ) {
          return (
            <AccessDenied />
          );
        }

        return (
          <Items />
        );
      }

      case "settings": {
        if (
          !can(
            "settings.view",
          )
        ) {
          return (
            <AccessDenied />
          );
        }

        return (
          <Settings />
        );
      }

      case "users": {
        if (
          !can(
            "users.view",
          )
        ) {
          return (
            <AccessDenied />
          );
        }

        return (
          <main className="relative min-h-full overflow-auto bg-transparent">
            <Users />
          </main>
        );
      }

      case "permissions": {
        if (
          !can(
            "permissions.view",
          )
        ) {
          return (
            <AccessDenied />
          );
        }

        return (
          <main className="relative min-h-full overflow-auto bg-transparent">
            <PermissionsPanel />
          </main>
        );
      }

      default:
        return (
          <AccessDenied />
        );
    }
  }

  /* =========================================================
     AUTH LOADING
  ========================================================= */

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070707] text-white">
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-yellow-400" />

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
            Falcon System
          </p>

          <p className="mt-2 text-sm text-zinc-600">
            Anmeldung wird geprüft...
          </p>

        </div>
      </div>
    );
  }

  /* =========================================================
     NICHT EINGELOGGT
  ========================================================= */

  if (!session) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070707] px-5 text-white">

        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-yellow-500/[0.06] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-yellow-600/[0.035] blur-3xl" />

        <div className="relative w-full max-w-md">

          <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-black/50 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">

            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.07] text-3xl">
                🦅
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.35em] text-yellow-500/70">
                FALCON
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight">
                FALCON{" "}
                <span className="text-yellow-400">
                  SYSTEM
                </span>
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
                Melde dich mit deinem Discord-Account
                an, um das Falcon System zu verwenden.
              </p>

            </div>

            {authError && (
              <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-xs leading-5 text-red-300">
                {authError}
              </div>
            )}

            <button
              type="button"
              onClick={
                handleDiscordLogin
              }
              disabled={
                loginLoading
              }
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#6875f5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Discord wird geöffnet...
                </>
              ) : (
                <>
                  <span className="text-lg">
                    ◈
                  </span>

                  Mit Discord verbinden
                </>
              )}
            </button>

            <p className="mt-5 text-center text-[10px] leading-5 text-zinc-700">
              Deine Anmeldung wird über Discord und
              Supabase verarbeitet.
            </p>

          </div>

        </div>

      </div>
    );
  }

  /* =========================================================
     PROFIL / PERMISSIONS
  ========================================================= */

  if (
    profileLoading ||
    permissionsLoading ||
    !profile
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070707] text-white">

        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-yellow-400" />

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
            Falcon System
          </p>

          <p className="mt-2 text-sm text-zinc-600">
            Berechtigungen werden geladen...
          </p>

        </div>

      </div>
    );
  }

  /* =========================================================
     BENUTZER
  ========================================================= */

  const displayName =
    profile.discord_username ||
    session.user.user_metadata
      ?.full_name ||
    session.user.email ||
    "Benutzer";

  const displayRole =
    profile.role ||
    "member";

  /* =========================================================
     HUB OHNE SIDEBAR
  ========================================================= */

  if (
    activePage === "hub"
  ) {
    return (
      <FalconHub />
    );
  }

  /* =========================================================
     NORMALE APP
  ========================================================= */

  return (
    <div className="app-layout">

      {/* =====================================================
          UPDATE STATUS
      ===================================================== */}

      {updateInstalling && (
        <div className="fixed right-5 top-5 z-[9999] w-[320px] overflow-hidden rounded-2xl border border-yellow-500/20 bg-black/90 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/[0.08]">

              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-yellow-400" />

            </div>

            <div className="min-w-0">

              <p className="text-xs font-black uppercase tracking-[0.16em] text-yellow-400">
                Falcon System
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                Update wird installiert...
              </p>

              {updateVersion && (
                <p className="mt-1 text-[11px] text-zinc-500">
                  Neue Version {updateVersion}
                </p>
              )}

            </div>

          </div>

        </div>
      )}

      <Sidebar
        activePage={
          activePage
        }
        onNavigate={
          handleNavigate
        }
        onNewOrder={
          handleNewOrder
        }
        userName={
          displayName
        }
        userRole={
          displayRole
        }
        userAvatar={
          profile.discord_avatar
        }
      />

      <div className="app-content">

        <Header
          onSettings={
            handleSettings
          }
          userName={
            displayName
          }
          userRole={
            displayRole
          }
          userAvatar={
            profile.discord_avatar
          }
        />

        <main className="app-page">
          {renderPage()}
        </main>

      </div>

    </div>
  );
}

/* =========================================================
   ACCESS DENIED
========================================================= */

function AccessDenied() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5">

      <div className="w-full max-w-md rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-8 text-center">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/10 bg-red-500/[0.05] text-2xl">
          🔒
        </div>

        <h2 className="mt-5 text-lg font-black text-white">
          Keine Berechtigung
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Du hast keine Berechtigung,
          diesen Bereich aufzurufen.
        </p>

      </div>

    </div>
  );
}