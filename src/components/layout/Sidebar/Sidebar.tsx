import {
  useEffect,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  BarChart3,
  ClipboardList,
  Package,
  Settings,
  Plus,
  Circle,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  getCurrentUserPermissions,
} from "../../../services/PermissionService/PermissionService";

import type {
  Permission,
} from "../../../services/PermissionService/PermissionService";

import "./Sidebar.css";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onNewOrder?: () => void;
  userName?: string;
  userRole?: string;
  userAvatar?: string | null;
}

export default function Sidebar({
  activePage,
  onNavigate,
  onNewOrder,
  userName = "blxke.py",
  userRole = "DEVELOPER",
  userAvatar = null,
}: SidebarProps) {
  const [permissions, setPermissions] =
    useState<Set<Permission>>(new Set());

  const [permissionsLoading, setPermissionsLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadPermissions() {
      setPermissionsLoading(true);

      const loadedPermissions =
        await getCurrentUserPermissions();

      if (!mounted) {
        return;
      }

      setPermissions(loadedPermissions);
      setPermissionsLoading(false);
    }

    void loadPermissions();

    return () => {
      mounted = false;
    };
  }, []);

  function can(permission: Permission) {
    return permissions.has(permission);
  }

  if (permissionsLoading) {
    return (
      <aside className="sidebar">
        <SidebarBrand />

        <div className="sidebar-navigation">
          <p className="sidebar-heading">Navigation</p>

          <div className="sidebar-nav-list">
            <div
              className="sidebar-item"
              style={{ opacity: 0.35 }}
            >
              <span>Wird geladen...</span>
            </div>
          </div>
        </div>

        <SidebarFooter
          userName={userName}
          userRole={userRole}
          userAvatar={userAvatar}
        />
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <SidebarBrand />

      {can("orders.create") && (
        <div className="sidebar-new-order">
          <button
            type="button"
            onClick={onNewOrder}
            className="sidebar-new-order-button"
          >
            <span className="sidebar-plus">
              <Plus size={16} />
            </span>

            <span>Neue Bestellung</span>
          </button>
        </div>
      )}

      <nav className="sidebar-navigation">
        <p className="sidebar-heading">Navigation</p>

        <div className="sidebar-nav-list">
          {can("dashboard.view") && (
            <SidebarItem
              icon={<BarChart3 size={17} />}
              label="Dashboard"
              active={activePage === "dashboard"}
              onClick={() => onNavigate("dashboard")}
            />
          )}

          {can("orders.view") && (
            <SidebarItem
              icon={<ClipboardList size={17} />}
              label="Bestellungen"
              active={activePage === "orders"}
              onClick={() => onNavigate("orders")}
            />
          )}

          {can("items.view") && (
            <SidebarItem
              icon={<Package size={17} />}
              label="Items"
              active={activePage === "items"}
              onClick={() => onNavigate("items")}
            />
          )}
        </div>

        {can("settings.view") && (
          <>
            <p className="sidebar-heading sidebar-heading-system">
              System
            </p>

            <div className="sidebar-nav-list">
              <SidebarItem
                icon={<Settings size={17} />}
                label="Einstellungen"
                active={activePage === "settings"}
                onClick={() => onNavigate("settings")}
              />
            </div>
          </>
        )}

        {(can("users.view") ||
          can("permissions.view")) && (
          <>
            <p className="sidebar-heading sidebar-heading-system">
              Verwaltung
            </p>

            <div className="sidebar-nav-list">
              {can("users.view") && (
                <SidebarItem
                  icon={<Users size={17} />}
                  label="Benutzer"
                  active={activePage === "users"}
                  onClick={() => onNavigate("users")}
                />
              )}

              {can("permissions.view") && (
                <SidebarItem
                  icon={<ShieldCheck size={17} />}
                  label="Berechtigungen"
                  active={activePage === "permissions"}
                  onClick={() => onNavigate("permissions")}
                />
              )}
            </div>
          </>
        )}
      </nav>

      <SidebarFooter
        userName={userName}
        userRole={userRole}
        userAvatar={userAvatar}
      />
    </aside>
  );
}

function SidebarBrand() {
  return (
    <div className="sidebar-brand">
      <div className="sidebar-logo">
        <svg
          viewBox="0 0 100 100"
          role="img"
          aria-label="Falcon System"
          className="sidebar-logo-image"
        >
          <defs>
            <linearGradient
              id="sidebarFalconGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="48%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>

            <filter
              id="sidebarFalconGlow"
              x="-80%"
              y="-80%"
              width="260%"
              height="260%"
            >
              <feGaussianBlur
                stdDeviation="3"
                result="blur"
              />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g
            fill="none"
            stroke="url(#sidebarFalconGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#sidebarFalconGlow)"
          >
            <path
              d="
                M50 76
                C42 67 35 57 35 46
                C35 32 43 20 50 12
                C57 20 65 32 65 46
                C65 57 58 67 50 76
                Z
              "
            />

            <path
              d="
                M43 43
                C34 38 25 34 13 35
                C23 43 31 51 43 54
              "
            />

            <path
              d="
                M57 43
                C66 38 75 34 87 35
                C77 43 69 51 57 54
              "
            />

            <path
              d="
                M47 55
                L42 73
                L50 68
                L58 73
                L53 55
              "
            />
          </g>

          <circle
            cx="50"
            cy="45"
            r="2.2"
            fill="#ffffff"
            opacity="0.9"
          />
        </svg>
      </div>

      <div className="sidebar-brand-text">
        <h1>
          FALCON
          <span> SYSTEM</span>
        </h1>
      </div>
    </div>
  );
}

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`sidebar-item ${
        active ? "sidebar-item-active" : ""
      }`}
    >
      <span className="sidebar-item-icon">
        {icon}
      </span>

      <span className="sidebar-item-label">
        {label}
      </span>

      {active && (
        <span className="sidebar-active-dot" />
      )}
    </button>
  );
}

interface SidebarFooterProps {
  userName: string;
  userRole: string;
  userAvatar: string | null;
}

function SidebarFooter({
  userName,
  userRole,
  userAvatar,
}: SidebarFooterProps) {
  return (
    <div className="sidebar-footer">
      <div className="sidebar-discord-card">
        <div className="sidebar-discord-topline">
          <span className="sidebar-discord-label">
            DISCORD PROFILE
          </span>

          <span className="sidebar-discord-live">
            <span className="sidebar-discord-live-dot" />
            ONLINE
          </span>
        </div>

        <div className="sidebar-discord-main">
          <div className="sidebar-discord-avatar-wrap">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt=""
                className="sidebar-discord-avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="sidebar-discord-avatar sidebar-discord-avatar-fallback">
                <Users size={18} />
              </div>
            )}

            <span className="sidebar-discord-online-dot" />
          </div>

          <div className="sidebar-discord-info">
            <p className="sidebar-discord-name">
              {userName}
            </p>

            <div className="sidebar-discord-meta">
              <span className="sidebar-discord-role">
                {userRole}
              </span>
            </div>
          </div>

          <div className="sidebar-discord-badge">
            <ShieldCheck size={11} />
          </div>
        </div>
      </div>

      <div className="sidebar-status">
        <div className="sidebar-status-icon">
          <Circle
            size={8}
            fill="currentColor"
          />
        </div>

        <div>
          <p>Falcon System</p>

          <span>Version 1.0.0</span>
        </div>

        <span className="sidebar-online">
          ONLINE
        </span>
      </div>
    </div>
  );
}