import { supabase } from "../../lib/supabase";

/* =========================================================
   ROLLEN
   ========================================================= */

export type UserRole =
  | "developer"
  | "owner"
  | "admin"
  | "moderator"
  | "member";

/* =========================================================
   BERECHTIGUNGEN
   ========================================================= */

export type Permission =
  | "dashboard.view"

  | "orders.view"
  | "orders.view_all"
  | "orders.create"
  | "orders.edit"
  | "orders.delete"
  | "orders.complete"
  | "orders.change_price"
  | "orders.export"
  | "orders.import"

  | "items.view"
  | "items.create"
  | "items.edit"
  | "items.delete"
  | "items.change_price"
  | "items.manage_categories"

  | "settings.view"
  | "settings.edit"

  | "users.view"
  | "users.edit"
  | "users.manage_roles"
  | "users.ban"

  | "permissions.view"
  | "permissions.manage";

/* =========================================================
   PERMISSION RECORD
   ========================================================= */

export interface PermissionRecord {
  role: UserRole;
  permission: Permission;
  enabled: boolean;
}

/* =========================================================
   USER
   ========================================================= */

export interface ProfileUser {
  id: string;
  discord_username: string | null;
  role: UserRole;
  is_banned: boolean;
}

/* =========================================================
   ROLLEN-NAMEN
   ========================================================= */

export const ROLE_LABELS: Record<
  UserRole,
  string
> = {
  developer: "Developer",
  owner: "Owner",
  admin: "Admin",
  moderator: "Moderator",
  member: "Member",
};

/* =========================================================
   AKTUELLE USER-ID
   ========================================================= */

export async function getCurrentUserId(): Promise<
  string | null
> {
  const {
    data: {
      user,
    },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

/* =========================================================
   AKTUELLE ROLLE
   ========================================================= */

export async function getCurrentUserRole(): Promise<
  UserRole | null
> {
  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Rolle konnte nicht geladen werden:",
      profileError,
    );

    return null;
  }

  if (!profile?.role) {
    return null;
  }

  return profile.role as UserRole;
}

/* =========================================================
   AKTUELLE BERECHTIGUNGEN
   ========================================================= */

export async function getCurrentUserPermissions(): Promise<
  Set<Permission>
> {
  const role =
    await getCurrentUserRole();

  if (!role) {
    return new Set<Permission>();
  }

  const {
    data,
    error,
  } = await supabase
    .from("role_permissions")
    .select(
      "role, permission, enabled",
    )
    .eq("role", role)
    .eq("enabled", true);

  if (error) {
    console.error(
      "Berechtigungen konnten nicht geladen werden:",
      error,
    );

    return new Set<Permission>();
  }

  return new Set<Permission>(
    (data ?? []).map(
      (item) =>
        item.permission as Permission,
    ),
  );
}

/* =========================================================
   EINZELNE BERECHTIGUNG
   ========================================================= */

export async function hasPermission(
  permission: Permission,
): Promise<boolean> {
  const permissions =
    await getCurrentUserPermissions();

  return permissions.has(
    permission,
  );
}

/* =========================================================
   ALLE ROLLEN-BERECHTIGUNGEN
   ========================================================= */

export async function getAllRolePermissions(): Promise<
  PermissionRecord[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("role_permissions")
    .select(
      "role, permission, enabled",
    )
    .order("role")
    .order("permission");

  if (error) {
    console.error(
      "Rollen-Berechtigungen konnten nicht geladen werden:",
      error,
    );

    return [];
  }

  return (
    (data ?? []) as PermissionRecord[]
  );
}

/* =========================================================
   EINZELNE BERECHTIGUNG ÄNDERN
   ========================================================= */

export async function setPermission(
  role: UserRole,
  permission: Permission,
  enabled: boolean,
): Promise<boolean> {
  const {
    error,
  } = await supabase
    .from("role_permissions")
    .upsert(
      {
        role,
        permission,
        enabled,
      },
      {
        onConflict:
          "role,permission",
      },
    );

  if (error) {
    console.error(
      "Berechtigung konnte nicht gespeichert werden:",
      error,
    );

    return false;
  }

  return true;
}

/* =========================================================
   MEHRERE BERECHTIGUNGEN SPEICHERN
   ========================================================= */

export async function saveRolePermissions(
  role: UserRole,
  permissions: Record<
    Permission,
    boolean
  >,
): Promise<boolean> {
  const rows =
    Object.entries(
      permissions,
    ).map(
      ([
        permission,
        enabled,
      ]) => ({
        role,
        permission:
          permission as Permission,
        enabled:
          Boolean(enabled),
      }),
    );

  if (rows.length === 0) {
    return true;
  }

  const {
    error,
  } = await supabase
    .from("role_permissions")
    .upsert(
      rows,
      {
        onConflict:
          "role,permission",
      },
    );

  if (error) {
    console.error(
      "Berechtigungen konnten nicht gespeichert werden:",
      error,
    );

    return false;
  }

  return true;
}

/* =========================================================
   ALLE BENUTZER
   ========================================================= */

export async function getAllUsers(): Promise<
  ProfileUser[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select(
      "id, discord_username, role, is_banned",
    )
    .order(
      "discord_username",
      {
        ascending: true,
        nullsFirst: false,
      },
    );

  if (error) {
    console.error(
      "Benutzer konnten nicht geladen werden:",
      error,
    );

    return [];
  }

  return (
    (data ?? []) as ProfileUser[]
  ).map(
    (user) => ({
      id: user.id,

      discord_username:
        user.discord_username,

      role:
        user.role as UserRole,

      is_banned:
        Boolean(
          user.is_banned,
        ),
    }),
  );
}

/* =========================================================
   EINEN BENUTZER LADEN
   ========================================================= */

export async function getUserById(
  userId: string,
): Promise<
  ProfileUser | null
> {
  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select(
      "id, discord_username, role, is_banned",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "Benutzer konnte nicht geladen werden:",
      error,
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,

    discord_username:
      data.discord_username,

    role:
      data.role as UserRole,

    is_banned:
      Boolean(
        data.is_banned,
      ),
  };
}

/* =========================================================
   ROLLE SICHER ÄNDERN
   ========================================================= */

export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<boolean> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "change_user_role",
    {
      target_user_id:
        userId,

      new_role:
        role,
    },
  );

  console.log(
    "change_user_role Ergebnis:",
    {
      data,
      error,
      userId,
      role,
    },
  );

  if (error) {
    console.error(
      "Benutzerrolle konnte nicht geändert werden:",
      error,
    );

    return false;
  }

  /*
   * Supabase kann je nach SQL-Funktion
   * unterschiedliche Rückgabewerte liefern.
   */

  if (
    data === true ||
    data === "true"
  ) {
    return true;
  }

  /*
   * Falls die RPC-Funktion erfolgreich war,
   * aber keinen Boolean zurückliefert,
   * behandeln wir den Aufruf nicht automatisch
   * als erfolgreich. Der Console-Log zeigt dann
   * den tatsächlichen Rückgabewert.
   */

  console.warn(
    "change_user_role wurde ohne erwarteten Erfolgswert zurückgegeben:",
    data,
  );

  return false;
}

/* =========================================================
   BENUTZER BANNEN / ENTSPERREN
   ========================================================= */

export async function setUserBanned(
  userId: string,
  banned: boolean,
): Promise<boolean> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "set_user_banned",
    {
      target_user_id:
        userId,

      banned,
    },
  );

  console.log(
    "set_user_banned Ergebnis:",
    {
      data,
      error,
      userId,
      banned,
    },
  );

  if (error) {
    console.error(
      "Ban-Status konnte nicht geändert werden:",
      error,
    );

    return false;
  }

  if (
    data === true ||
    data === "true"
  ) {
    return true;
  }

  console.warn(
    "set_user_banned wurde ohne erwarteten Erfolgswert zurückgegeben:",
    data,
  );

  return false;
}

/* =========================================================
   BAN STATUS ABFRAGEN
   ========================================================= */

export async function getUserBanStatus(
  userId: string,
): Promise<boolean> {
  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select("is_banned")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return Boolean(
    data.is_banned,
  );
}