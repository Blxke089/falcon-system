import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Loader2,
  Search,
  Save,
  Shield,
  Users as UsersIcon,
  X,
} from "lucide-react";

import {
  getAllUsers,
  getCurrentUserPermissions,
  updateUserRole,
  setUserBanned,
  type Permission,
  type ProfileUser,
  type UserRole,
} from "../../services/PermissionService/PermissionService";

import "./Users.css";

const ROLE_LABELS: Record<UserRole, string> = {
  member: "Member",
  moderator: "Moderator",
  admin: "Admin",
  owner: "Owner",
  developer: "Developer",
};

const ROLES: UserRole[] = [
  "member",
  "moderator",
  "admin",
  "owner",
  "developer",
];

export default function Users() {
  const [users, setUsers] = useState<ProfileUser[]>([]);
  const [permissions, setPermissions] = useState<Set<Permission>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] =
    useState<ProfileUser | null>(null);
  const [selectedRole, setSelectedRole] =
    useState<UserRole>("member");
  const [selectedBanned, setSelectedBanned] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState("");
  const [savingSuccess, setSavingSuccess] = useState("");

  const canViewUsers = permissions.has("users.view");
  const canManageRoles = permissions.has("users.manage_roles");
  const canBanUsers = permissions.has("users.ban");

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const loadedPermissions = await getCurrentUserPermissions();
      setPermissions(loadedPermissions);

      if (!loadedPermissions.has("users.view")) {
        setUsers([]);
        return;
      }

      const loadedUsers = await getAllUsers();
      setUsers(loadedUsers);
    } catch (loadError) {
      console.error("Benutzer konnten nicht geladen werden:", loadError);
      setError("Die Benutzer konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const username = user.discord_username?.toLowerCase() ?? "";
      const role = ROLE_LABELS[user.role]?.toLowerCase() ?? "";
      const status = user.is_banned ? "gesperrt gebannt" : "aktiv";

      return (
        username.includes(query) ||
        role.includes(query) ||
        status.includes(query)
      );
    });
  }, [users, search]);

  const activeUsers = users.filter((user) => !user.is_banned).length;
  const bannedUsers = users.filter((user) => user.is_banned).length;

  function openUser(user: ProfileUser) {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setSelectedBanned(user.is_banned);
    setSavingError("");
    setSavingSuccess("");
  }

  function closeUser() {
    if (saving) return;

    setSelectedUser(null);
    setSavingError("");
    setSavingSuccess("");
  }

  async function saveUserChanges() {
    if (!selectedUser || saving) return;

    const roleChanged = selectedRole !== selectedUser.role;
    const banChanged = selectedBanned !== selectedUser.is_banned;

    if (!roleChanged && !banChanged) {
      setSavingError("Es wurden keine Änderungen vorgenommen.");
      return;
    }

    if (roleChanged && !canManageRoles) {
      setSavingError("Du hast keine Berechtigung, Rollen zu ändern.");
      return;
    }

    if (banChanged && !canBanUsers) {
      setSavingError(
        "Du hast keine Berechtigung, Benutzer zu sperren oder zu entsperren.",
      );
      return;
    }

    setSaving(true);
    setSavingError("");
    setSavingSuccess("");

    try {
      if (roleChanged) {
        const success = await updateUserRole(
          selectedUser.id,
          selectedRole,
        );

        if (!success) {
          setSavingError("Die Rolle konnte nicht geändert werden.");
          return;
        }
      }

      if (banChanged) {
        const success = await setUserBanned(
          selectedUser.id,
          selectedBanned,
        );

        if (!success) {
          setSavingError("Der Benutzerstatus konnte nicht geändert werden.");
          return;
        }
      }

      const updatedUser: ProfileUser = {
        ...selectedUser,
        role: selectedRole,
        is_banned: selectedBanned,
      };

      setUsers((current) =>
        current.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        ),
      );

      setSelectedUser(updatedUser);
      setSavingSuccess("Änderungen gespeichert.");
    } catch (saveError) {
      console.error("Benutzer konnte nicht aktualisiert werden:", saveError);
      setSavingError("Die Änderungen konnten nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  if (!canViewUsers && !loading) {
    return (
      <main className="users-page">
        <div className="users-background-glow users-background-glow-one" />
        <div className="users-background-glow users-background-glow-two" />

        <div className="users-access-card">
          <div className="users-access-icon">
            <Shield size={24} />
          </div>
          <p className="users-eyebrow">FALCON CONTROL</p>
          <h1>Kein Zugriff</h1>
          <p>Du besitzt keine Berechtigung, die Benutzerverwaltung zu öffnen.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="users-page">
      <div className="users-background-glow users-background-glow-one" />
      <div className="users-background-glow users-background-glow-two" />

      <div className="users-shell">
        <header className="users-hero">
          <div className="users-hero-badge">
            <span className="users-live-dot" />
            FALCON CONTROL
            <span className="users-divider" />
            BENUTZER
          </div>

          <h1>BENUTZER</h1>
          <p>Benutzer, Rollen und Zugriffsstatus verwalten.</p>
        </header>

        <section className="users-stats">
          <StatCard
            icon={<UsersIcon size={18} />}
            label="Benutzer"
            value={users.length}
          />
          <StatCard
            icon={<CheckCircle2 size={18} />}
            label="Aktiv"
            value={activeUsers}
            tone="success"
          />
          <StatCard
            icon={<Ban size={18} />}
            label="Gesperrt"
            value={bannedUsers}
            tone="danger"
          />
        </section>

        <section className="users-directory">
          <div className="users-edge-glow" />

          <div className="users-directory-head">
            <div className="users-directory-title">
              <div className="users-section-icon">
                <UsersIcon size={18} />
              </div>

              <div>
                <div className="users-kicker">BENUTZERVERWALTUNG</div>
                <h2>{filteredUsers.length} Benutzer</h2>
                <span>Verfügbare Benutzerkonten</span>
              </div>
            </div>

            <div className="users-search">
              <Search size={17} aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Benutzer suchen..."
                aria-label="Benutzer suchen"
              />

              {search && (
                <button
                  type="button"
                  className="users-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Suche löschen"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="users-message users-message-error">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="users-empty">
              <div className="users-loader">
                <Loader2 size={23} />
              </div>
              <strong>Benutzer werden geladen</strong>
              <span>Daten werden aus der Datenbank abgerufen.</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="users-empty">
              <div className="users-empty-icon">
                <UsersIcon size={23} />
              </div>
              <strong>Keine Benutzer gefunden</strong>
              <span>Versuche einen anderen Suchbegriff.</span>
            </div>
          ) : (
            <div className="users-list">
              {filteredUsers.map((user, index) => {
                const username =
                  user.discord_username || "Unbekannter Benutzer";
                const initial = username.charAt(0).toUpperCase();

                return (
                  <button
                    key={user.id}
                    type="button"
                    className="users-row"
                    style={{
                      animationDelay: `${index * 45}ms`,
                    }}
                    onClick={() => openUser(user)}
                  >
                    <span className="users-row-line" />

                    <span className="users-avatar">{initial}</span>

                    <span className="users-row-main">
                      <strong>{username}</strong>
                      <small>{user.id}</small>
                    </span>

                    <span className="users-role">
                      <Shield size={13} />
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>

                    <span
                      className={[
                        "users-status",
                        user.is_banned
                          ? "users-status-danger"
                          : "users-status-success",
                      ].join(" ")}
                    >
                      <i />
                      {user.is_banned ? "Gesperrt" : "Aktiv"}
                    </span>

                    <span className="users-row-arrow">→</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {selectedUser && (
        <div
          className="users-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeUser();
            }
          }}
        >
          <section className="users-modal">
            <div className="users-modal-shimmer" />

            <header className="users-modal-head">
              <div className="users-modal-user">
                <div className="users-modal-avatar">
                  {(selectedUser.discord_username || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <span className="users-kicker">BENUTZER</span>
                  <h2>
                    {selectedUser.discord_username ||
                      "Unbekannter Benutzer"}
                  </h2>
                  <p>{selectedUser.id}</p>
                </div>
              </div>

              <button
                type="button"
                className="users-modal-close"
                onClick={closeUser}
                disabled={saving}
                aria-label="Schließen"
              >
                <X size={17} />
              </button>
            </header>

            <div className="users-modal-body">
              <div className="users-control">
                <div className="users-control-label">
                  <span>ROLLE</span>
                  <small>
                    {canManageRoles
                      ? "Rolle verwalten"
                      : "Keine Berechtigung"}
                  </small>
                </div>

                <div className="users-role-grid">
                  {ROLES.map((role) => {
                    const active = selectedRole === role;

                    return (
                      <button
                        key={role}
                        type="button"
                        disabled={!canManageRoles || saving}
                        className={[
                          "users-role-option",
                          active ? "is-active" : "",
                        ].join(" ")}
                        onClick={() => setSelectedRole(role)}
                      >
                        {ROLE_LABELS[role]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="users-control">
                <div className="users-control-label">
                  <span>STATUS</span>
                  <small>
                    {canBanUsers
                      ? "Sperrstatus verwalten"
                      : "Keine Berechtigung"}
                  </small>
                </div>

                <button
                  type="button"
                  disabled={!canBanUsers || saving}
                  className={[
                    "users-ban-control",
                    selectedBanned ? "is-banned" : "is-active",
                  ].join(" ")}
                  onClick={() =>
                    setSelectedBanned((current) => !current)
                  }
                >
                  <span className="users-ban-left">
                    <i />
                    {selectedBanned ? "Gesperrt" : "Aktiv"}
                  </span>

                  <span className="users-ban-action">
                    {selectedBanned ? "Entsperren" : "Sperren"}
                  </span>
                </button>
              </div>

              {savingError && (
                <div className="users-message users-message-error">
                  <AlertTriangle size={16} />
                  <span>{savingError}</span>
                </div>
              )}

              {savingSuccess && (
                <div className="users-message users-message-success">
                  <CheckCircle2 size={16} />
                  <span>{savingSuccess}</span>
                </div>
              )}
            </div>

            <footer className="users-modal-footer">
              <button
                type="button"
                className="users-button users-button-secondary"
                onClick={closeUser}
                disabled={saving}
              >
                Abbrechen
              </button>

              <button
                type="button"
                className="users-button users-button-primary"
                onClick={() => void saveUserChanges()}
                disabled={
                  saving ||
                  (!canManageRoles &&
                    selectedRole !== selectedUser.role) ||
                  (!canBanUsers &&
                    selectedBanned !== selectedUser.is_banned) ||
                  (selectedRole === selectedUser.role &&
                    selectedBanned === selectedUser.is_banned)
                }
              >
                {saving ? (
                  <Loader2 size={15} className="users-spin" />
                ) : (
                  <Save size={15} />
                )}
                {saving ? "Speichern..." : "Änderungen speichern"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  tone?: "default" | "success" | "danger";
}

function StatCard({
  icon,
  label,
  value,
  tone = "default",
}: StatCardProps) {
  return (
    <div className={`users-stat users-stat-${tone}`}>
      <div className="users-stat-icon">{icon}</div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}