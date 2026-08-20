import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Check,
  Loader2,
  Save,
  X,
} from "lucide-react";

import {
  getAllRolePermissions,
  getCurrentUserPermissions,
  getCurrentUserRole,
  saveRolePermissions,
  type Permission,
  type PermissionRecord,
  type UserRole,
} from "../../services/PermissionService/PermissionService";

/* =========================================================
   ROLLEN
   ========================================================= */

const ROLES: UserRole[] = [
  "member",
  "moderator",
  "admin",
  "owner",
  "developer",
];

const ROLE_LABELS: Record<UserRole, string> = {
  member: "Member",
  moderator: "Moderator",
  admin: "Admin",
  owner: "Owner",
  developer: "Developer",
};

/* =========================================================
   BERECHTIGUNGEN
   ========================================================= */

interface PermissionDefinition {
  key: Permission;
  label: string;
}

interface PermissionGroup {
  title: string;
  permissions: PermissionDefinition[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    title: "Dashboard",
    permissions: [
      {
        key: "dashboard.view",
        label: "Dashboard anzeigen",
      },
    ],
  },

  {
    title: "Bestellungen",
    permissions: [
      {
        key: "orders.view",
        label: "Bestellungen anzeigen",
      },
      {
        key: "orders.view_all",
        label: "Alle Bestellungen sehen",
      },
      {
        key: "orders.create",
        label: "Bestellungen erstellen",
      },
      {
        key: "orders.edit",
        label: "Bestellungen bearbeiten",
      },
      {
        key: "orders.delete",
        label: "Bestellungen löschen",
      },
      {
        key: "orders.complete",
        label: "Bestellungen abschließen",
      },
      {
        key: "orders.change_price",
        label: "Preise ändern",
      },
      {
        key: "orders.export",
        label: "Bestellungen exportieren",
      },
      {
        key: "orders.import",
        label: "Bestellungen importieren",
      },
    ],
  },

  {
    title: "Items",
    permissions: [
      {
        key: "items.view",
        label: "Items anzeigen",
      },
      {
        key: "items.create",
        label: "Items erstellen",
      },
      {
        key: "items.edit",
        label: "Items bearbeiten",
      },
      {
        key: "items.delete",
        label: "Items löschen",
      },
      {
        key: "items.change_price",
        label: "Item-Preise ändern",
      },
      {
        key: "items.manage_categories",
        label: "Kategorien verwalten",
      },
    ],
  },

  {
    title: "Einstellungen",
    permissions: [
      {
        key: "settings.view",
        label: "Einstellungen anzeigen",
      },
      {
        key: "settings.edit",
        label: "Einstellungen bearbeiten",
      },
    ],
  },

  {
    title: "Benutzer",
    permissions: [
      {
        key: "users.view",
        label: "Benutzer anzeigen",
      },
      {
        key: "users.edit",
        label: "Benutzer bearbeiten",
      },
      {
        key: "users.manage_roles",
        label: "Rollen verwalten",
      },
      {
        key: "users.ban",
        label: "Benutzer sperren",
      },
    ],
  },

  {
    title: "Berechtigungen",
    permissions: [
      {
        key: "permissions.view",
        label: "Berechtigungen anzeigen",
      },
      {
        key: "permissions.manage",
        label: "Berechtigungen verwalten",
      },
    ],
  },
];

const ALL_PERMISSIONS =
  PERMISSION_GROUPS.flatMap(
    (group) => group.permissions,
  );

/* =========================================================
   KOMPONENTE
   ========================================================= */

export default function PermissionsPanel() {
  const [
    selectedRole,
    setSelectedRole,
  ] = useState<UserRole>("member");

  const [
    records,
    setRecords,
  ] = useState<PermissionRecord[]>([]);

  const [
    userPermissions,
    setUserPermissions,
  ] = useState<Set<Permission>>(
    new Set(),
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    confirmOpen,
    setConfirmOpen,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  /* =======================================================
     LADEN
     ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [
          role,
          permissions,
          data,
        ] = await Promise.all([
          getCurrentUserRole(),
          getCurrentUserPermissions(),
          getAllRolePermissions(),
        ]);

        if (!mounted) {
          return;
        }

        setUserPermissions(
          permissions,
        );

        setRecords(data);

        if (role) {
          setSelectedRole(role);
        }
      } catch (loadError) {
        console.error(
          "Berechtigungen konnten nicht geladen werden:",
          loadError,
        );

        if (mounted) {
          setError(
            "Die Berechtigungen konnten nicht geladen werden.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     AUSGEWÄHLTE BERECHTIGUNGEN
     ======================================================= */

  const selectedPermissions =
    useMemo(() => {
      const result =
        {} as Record<
          Permission,
          boolean
        >;

      for (
        const permission of ALL_PERMISSIONS
      ) {
        const record =
          records.find(
            (item) =>
              item.role ===
                selectedRole &&
              item.permission ===
                permission.key,
          );

        result[
          permission.key
        ] =
          record?.enabled ??
          false;
      }

      return result;
    }, [
      records,
      selectedRole,
    ]);

  /* =======================================================
     BERECHTIGUNG
     ======================================================= */

  const canManage =
    userPermissions.has(
      "permissions.manage",
    );

  /* =======================================================
     STATISTIK
     ======================================================= */

  const enabledCount =
    ALL_PERMISSIONS.filter(
      (permission) =>
        selectedPermissions[
          permission.key
        ],
    ).length;

  const totalCount =
    ALL_PERMISSIONS.length;

  /* =======================================================
     ROLLE WECHSELN
     ======================================================= */

  function selectRole(
    role: UserRole,
  ) {
    setSelectedRole(role);
    setMessage("");
    setError("");
  }

  /* =======================================================
     BERECHTIGUNG UMSCHALTEN
     ======================================================= */

  function togglePermission(
    permission: Permission,
  ) {
    if (!canManage) {
      return;
    }

    const currentValue =
      selectedPermissions[
        permission
      ];

    setRecords((current) => {
      const existingIndex =
        current.findIndex(
          (record) =>
            record.role ===
              selectedRole &&
            record.permission ===
              permission,
        );

      if (
        existingIndex !== -1
      ) {
        return current.map(
          (record, index) =>
            index ===
            existingIndex
              ? {
                  ...record,
                  enabled:
                    !currentValue,
                }
              : record,
        );
      }

      return [
        ...current,
        {
          role: selectedRole,
          permission,
          enabled:
            !currentValue,
        },
      ];
    });

    setMessage("");
    setError("");
  }

  /* =======================================================
     SPEICHERN ÖFFNEN
     ======================================================= */

  function requestSave() {
    if (!canManage) {
      setError(
        "Du hast keine Berechtigung, diese Einstellungen zu ändern.",
      );

      return;
    }

    if (saving) {
      return;
    }

    setConfirmOpen(true);
  }

  /* =======================================================
     SPEICHERN
     ======================================================= */

  async function handleSave() {
    if (!canManage) {
      setError(
        "Du hast keine Berechtigung, diese Einstellungen zu ändern.",
      );

      return;
    }

    setConfirmOpen(false);
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const success =
        await saveRolePermissions(
          selectedRole,
          selectedPermissions,
        );

      if (!success) {
        setError(
          "Die Berechtigungen konnten nicht gespeichert werden.",
        );

        return;
      }

      const refreshed =
        await getAllRolePermissions();

      setRecords(refreshed);

      setMessage(
        `Berechtigungen für ${ROLE_LABELS[selectedRole]} wurden gespeichert.`,
      );
    } catch (saveError) {
      console.error(
        "Speichern fehlgeschlagen:",
        saveError,
      );

      setError(
        "Beim Speichern ist ein Fehler aufgetreten.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030305]">

        <div className="flex flex-col items-center gap-3">

          <Loader2
            size={24}
            className="animate-spin text-purple-400"
          />

          <p className="text-xs text-zinc-600">
            Berechtigungen werden geladen...
          </p>

        </div>

      </div>
    );
  }

  /* =======================================================
     KEIN ZUGRIFF
     ======================================================= */

  if (
    !userPermissions.has(
      "permissions.view",
    )
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030305] p-6">

        <div className="w-full max-w-md rounded-2xl border border-purple-500/10 bg-[#08070b] p-8 text-center shadow-[0_0_70px_rgba(168,85,247,0.05)]">

          <h2 className="text-sm font-black text-white">
            Kein Zugriff
          </h2>

          <p className="mt-2 text-xs text-zinc-600">
            Du besitzt keine Berechtigung,
            diese Seite zu öffnen.
          </p>

        </div>

      </div>
    );
  }

  /* =======================================================
     HAUPTANSICHT
     ======================================================= */

  return (
    <div className="relative min-h-full overflow-hidden bg-[#030305] text-white">

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />

      {/* GLOWS */}

      <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-purple-600/[0.055] blur-[140px]" />

      <div className="pointer-events-none absolute -bottom-48 -left-40 h-[520px] w-[520px] rounded-full bg-purple-500/[0.035] blur-[130px]" />

      <div className="relative z-10 w-full px-3 pb-8 pt-6 sm:px-5 sm:pt-8 lg:px-8">

        {/* =================================================
            ROLLEN
            ================================================= */}

        <div className="mb-5 overflow-hidden rounded-2xl border border-purple-500/[0.14] bg-[#08070b]/95 shadow-[0_0_50px_rgba(168,85,247,0.06)] backdrop-blur-xl transition-all duration-300">

          <div className="flex w-full" role="tablist" aria-label="Rolle auswählen">

            {ROLES.map(
              (role, index) => {
                const active =
                  selectedRole ===
                  role;

                return (
                  <div
                    key={role}
                    className="relative flex min-w-0 flex-1"
                  >

                    <button
                      type="button"
                      onClick={() =>
                        selectRole(
                          role,
                        )
                      }
                      className={[
                        "relative flex min-h-[56px] w-full items-center justify-center px-2 transition-all duration-200 sm:px-3",
                        active
                          ? "bg-purple-500/[0.08] text-purple-300"
                          : "text-zinc-600 hover:bg-purple-500/[0.025] hover:text-zinc-300",
                      ].join(
                        " ",
                      )}
                    >

                      <span
                        className={[
                          "text-[8px] font-black uppercase tracking-[0.13em] sm:text-[9px] sm:tracking-[0.18em]",
                          active
                            ? "text-purple-300"
                            : "text-zinc-600",
                        ].join(
                          " ",
                        )}
                      >
                        {
                          ROLE_LABELS[
                            role
                          ]
                        }
                      </span>

                      {active && (
                        <span className="absolute bottom-0 left-4 right-4 h-px bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.9)]" />
                      )}

                    </button>

                    {index <
                      ROLES.length -
                        1 && (
                      <span className="pointer-events-none absolute right-0 top-1/2 h-7 w-px -translate-y-1/2 bg-white/[0.09]" />
                    )}

                  </div>
                );
              },
            )}

          </div>

        </div>

        {/* =================================================
            BERECHTIGUNGEN
            ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-purple-500/[0.12] bg-[#070609]/95 shadow-[0_20px_80px_rgba(0,0,0,0.22),0_0_35px_rgba(168,85,247,0.035)] backdrop-blur-xl transition-all duration-300">

          {/* KOPF */}

          <div className="flex items-center justify-between border-b border-purple-500/[0.08] px-5 py-4">

            <div>

              <div className="flex items-center gap-2">

                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/80">
                  Berechtigungen
                </p>

              </div>

              <p className="mt-1.5 text-[9px] text-zinc-700">
                {ROLE_LABELS[
                  selectedRole
                ]}{" "}
                · {enabledCount}/
                {totalCount} aktiviert
              </p>

            </div>

            <div className="rounded-lg border border-purple-500/[0.08] bg-purple-500/[0.025] px-3 py-2">

              <span className="text-[8px] font-black uppercase tracking-[0.12em] text-zinc-700">
                {ROLE_LABELS[
                  selectedRole
                ]}
              </span>

            </div>

          </div>

          {/* GRUPPEN */}

          {PERMISSION_GROUPS.map(
            (group) => (
              <div
                key={group.title}
              >

                <div className="border-b border-purple-500/[0.08] bg-purple-500/[0.018] px-5 py-2.5">

                  <span className="text-[8px] font-black uppercase tracking-[0.25em] text-purple-400/70">
                    {group.title}
                  </span>

                </div>

                {group.permissions.map(
                  (
                    permission,
                  ) => {
                    const enabled =
                      selectedPermissions[
                        permission.key
                      ];

                    return (
                      <button
                        key={
                          permission.key
                        }
                        type="button"
                        onClick={() =>
                          togglePermission(
                            permission.key,
                          )
                        }
                        disabled={
                          !canManage
                        }
                        className={[
                          "group relative flex w-full items-center justify-between border-b border-white/[0.035] px-5 py-3.5 text-left transition-all duration-200",
                          canManage
                            ? "cursor-pointer hover:bg-purple-500/[0.025]"
                            : "cursor-not-allowed opacity-60",
                        ].join(
                          " ",
                        )}
                      >

                        {/* LINKER GLOW */}

                        <span className="pointer-events-none absolute inset-y-0 left-0 w-px bg-transparent transition group-hover:bg-purple-400/70 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.5)]" />

                        {/* NAME */}

                        <div className="flex min-w-0 items-center gap-3">

                          <span
                            className={[
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                              enabled
                                ? "border-purple-400/70 bg-purple-500 text-white shadow-[0_0_14px_rgba(168,85,247,0.35)]"
                                : "border-white/[0.1] bg-transparent group-hover:border-purple-400/35",
                            ].join(
                              " ",
                            )}
                          >

                            {enabled && (
                              <Check
                                size={12}
                                strokeWidth={3}
                              />
                            )}

                          </span>

                          <div className="min-w-0">

                            <p className="truncate text-[11px] font-bold text-zinc-200">
                              {
                                permission.label
                              }
                            </p>

                            <p className="mt-0.5 font-mono text-[8px] text-zinc-800">
                              {
                                permission.key
                              }
                            </p>

                          </div>

                        </div>

                        {/* STATUS */}

                        <div className="flex shrink-0 items-center gap-2">

                          <span
                            className={[
                              "h-2 w-2 rounded-full",
                              enabled
                                ? "bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.45)]"
                                : "bg-zinc-800",
                            ].join(
                              " ",
                            )}
                          />

                          <span
                            className={[
                              "hidden text-[8px] font-black uppercase tracking-[0.12em] sm:block",
                              enabled
                                ? "text-emerald-400/75"
                                : "text-zinc-800",
                            ].join(
                              " ",
                            )}
                          >
                            {enabled
                              ? "Aktiv"
                              : "Inaktiv"}
                          </span>

                        </div>

                      </button>
                    );
                  },
                )}

              </div>
            ),
          )}

        </div>

        {/* =================================================
            MELDUNGEN
            ================================================= */}

        {message && (
          <div className="mt-4 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.035] px-4 py-3">

            <div className="flex items-center gap-2">

              <Check
                size={14}
                className="text-emerald-400"
              />

              <span className="text-[10px] font-semibold text-emerald-300">
                {message}
              </span>

            </div>

          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/15 bg-red-500/[0.035] px-4 py-3">

            <span className="text-[10px] font-semibold text-red-300">
              {error}
            </span>

          </div>
        )}

        {/* =================================================
            SPEICHERN
            ================================================= */}

        <div className="mt-5 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2 px-1">

            <span className={[
              "h-1.5 w-1.5 rounded-full",
              canManage
                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                : "bg-zinc-700",
            ].join(" ")} />

            <span className="text-[9px] font-semibold text-zinc-700">
              {canManage
                ? "Änderungen können gespeichert werden"
                : "Nur Ansicht"}
            </span>

          </div>

          <button
            type="button"
            onClick={
              requestSave
            }
            disabled={
              saving ||
              !canManage
            }
            className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-purple-400/25 bg-[#0d0914] px-5 py-3 sm:min-w-[220px] text-[10px] font-black uppercase tracking-[0.1em] text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.08)] transition-all duration-200 hover:border-purple-400/60 hover:bg-purple-500/[0.12] hover:text-white hover:shadow-[0_0_35px_rgba(168,85,247,0.22)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
          >

            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-purple-400/[0.08] to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            <span className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-purple-400/20 bg-purple-500/[0.08] text-purple-300 transition-all group-hover:border-purple-400/40 group-hover:bg-purple-500/[0.16]">

              {saving ? (
                <Loader2
                  size={13}
                  className="animate-spin"
                />
              ) : (
                <Save size={13} />
              )}

            </span>

            <span className="relative">
              {saving
                ? "Speichern..."
                : "Änderungen speichern"}
            </span>

            <span className="relative ml-1 h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />

          </button>

        </div>

      </div>

      {/* ===================================================
          BESTÄTIGUNGSDIALOG
          =================================================== */}

      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-purple-400/20 bg-[#09080d] shadow-[0_30px_100px_rgba(0,0,0,0.8),0_0_50px_rgba(168,85,247,0.08)] transition-all duration-200">

            {/* GLOW */}

            <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-purple-500/[0.07] blur-[60px]" />

            {/* HEADER */}

            <div className="relative flex items-center justify-between border-b border-white/[0.05] px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/[0.08] text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.08)]">

                  <AlertTriangle
                    size={17}
                  />

                </div>

                <div>

                  <p className="text-xs font-black text-white">
                    Änderungen bestätigen
                  </p>

                  <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.15em] text-zinc-700">
                    Berechtigungen
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setConfirmOpen(
                    false,
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-white/[0.04] hover:text-zinc-300"
              >
                <X size={15} />
              </button>

            </div>

            {/* TEXT */}

            <div className="relative px-5 py-5">

              <p className="text-[11px] leading-relaxed text-zinc-500">

                Möchtest du die Änderungen
                für die Rolle{" "}

                <span className="font-black text-purple-300">
                  {ROLE_LABELS[
                    selectedRole
                  ]}
                </span>

                {" "}wirklich speichern?

              </p>

              <div className="mt-4 rounded-xl border border-purple-500/10 bg-purple-500/[0.035] px-4 py-3">

                <div className="flex items-center justify-between">

                  <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-600">
                    Aktiv
                  </span>

                  <span className="text-[10px] font-black text-emerald-300">
                    {enabledCount}
                  </span>

                </div>

                <div className="mt-2 flex items-center justify-between">

                  <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-600">
                    Gesamt
                  </span>

                  <span className="text-[10px] font-black text-zinc-400">
                    {totalCount}
                  </span>

                </div>

              </div>

            </div>

            {/* BUTTONS */}

            <div className="relative flex items-center gap-2 border-t border-white/[0.05] px-5 py-4">

              <button
                type="button"
                onClick={() =>
                  setConfirmOpen(
                    false,
                  )
                }
                className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.1em] text-zinc-600 transition hover:bg-white/[0.04] hover:text-zinc-300"
              >
                Abbrechen
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleSave()
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-purple-400/30 bg-purple-500/[0.12] px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.1em] text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.08)] transition hover:border-purple-400/60 hover:bg-purple-500/[0.18] hover:text-white"
              >

                <Save size={13} />

                Bestätigen

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}