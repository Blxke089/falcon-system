import { supabase } from "../../lib/supabase";

import type { ParsedItem } from "../ItemParser/ItemParser";

/* =========================================================
   TYPES
   ========================================================= */

export interface SavedOrder {
  id: string;
  name: string;
  materialText: string;
  items: ParsedItem[];
  completedItems: number[];
  prices: Record<number, number>;
  createdAt: string;
  updatedAt: string;
}

/* =========================================================
   DATABASE TYPE
   ========================================================= */

interface DatabaseOrder {
  id: string;
  user_id: string;
  name: string;
  total: number;
  progress: number;
  material_list: string | null;
  items: unknown;
  completed_items: unknown;
  prices: unknown;
  created_at: string;
  updated_at: string;
}

/* =========================================================
   LOCAL STORAGE
   ========================================================= */

const STORAGE_KEY =
  "material-order-manager-orders";

/* =========================================================
   HILFSFUNKTIONEN
   ========================================================= */

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function parseItems(
  value: unknown,
): ParsedItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as ParsedItem[];
}

function parseCompletedItems(
  value: unknown,
): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is number =>
      typeof item === "number",
  );
}

function parsePrices(
  value: unknown,
): Record<number, number> {
  if (!isObject(value)) {
    return {};
  }

  const result: Record<
    number,
    number
  > = {};

  for (const [
    key,
    rawValue,
  ] of Object.entries(value)) {
    const numberValue =
      Number(rawValue);

    if (
      Number.isFinite(
        numberValue,
      )
    ) {
      result[Number(key)] =
        numberValue;
    }
  }

  return result;
}

/* =========================================================
   DATABASE → APP
   ========================================================= */

function mapDatabaseOrder(
  order: DatabaseOrder,
): SavedOrder {
  return {
    id: order.id,

    name:
      order.name ||
      "Neue Bestellung",

    materialText:
      order.material_list ??
      "",

    items: parseItems(
      order.items,
    ),

    completedItems:
      parseCompletedItems(
        order.completed_items,
      ),

    prices: parsePrices(
      order.prices,
    ),

    createdAt:
      order.created_at,

    updatedAt:
      order.updated_at,
  };
}

/* =========================================================
   APP → DATABASE
   ========================================================= */

function mapOrderToDatabase(
  order: SavedOrder,
  userId: string,
) {
  const total =
    order.items.reduce(
      (sum, item) => {
        const price =
          order.prices[
            item.id
          ] ?? 0;

        // Der eingegebene Preis gilt für EINEN Stack.
        // Gesamt = Anzahl Stacks × Preis pro Stack.
        return (
          sum +
          item.stacks * price
        );
      },
      0,
    );

  const completedCount =
    order.items.filter(
      (item) =>
        order.completedItems.includes(
          item.id,
        ),
    ).length;

  const progress =
    order.items.length > 0
      ? Math.round(
          (completedCount /
            order.items.length) *
            100,
        )
      : 0;

  return {
    id: order.id,

    user_id: userId,

    name:
      order.name ||
      "Neue Bestellung",

    total,

    progress,

    material_list:
      order.materialText ?? "",

    items:
      order.items,

    completed_items:
      order.completedItems,

    prices:
      order.prices,

    created_at:
      order.createdAt,

    updated_at:
      order.updatedAt,
  };
}

/* =========================================================
   AKTUELLEN USER HOLEN
   ========================================================= */

async function getCurrentUserId(): Promise<
  string | null
> {
  const {
    data,
    error,
  } =
    await supabase.auth.getUser();

  if (
    error ||
    !data.user
  ) {
    console.error(
      "Aktueller Benutzer konnte nicht geladen werden:",
      error,
    );

    return null;
  }

  return data.user.id;
}

/* =========================================================
   DARF DER USER ALLE BESTELLUNGEN SEHEN?
   
   WICHTIG:
   Das ist nur für die UI.
   
   Die eigentliche Sicherheit kommt weiterhin
   aus der Supabase-RLS-Policy.
   ========================================================= */

export async function canViewAllOrders(): Promise<boolean> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "role_permissions",
      )
      .select(
        "enabled",
      )
      .eq(
        "permission",
        "orders.view_all",
      )
      .eq(
        "enabled",
        true,
      )
      .maybeSingle();

  /*
   * Diese Abfrage alleine darf nicht darüber
   * entscheiden, welche Orders sichtbar sind.
   *
   * Deshalb verwenden wir sie später nur für
   * UI-Anzeigen.
   *
   * Die Orders selbst werden immer über RLS
   * geschützt.
   */

  if (error) {
    console.error(
      "Berechtigung orders.view_all konnte nicht geprüft werden:",
      error,
    );

    return false;
  }

  /*
   * Die obige Abfrage ist rollenübergreifend
   * und daher nicht als Sicherheitsprüfung
   * geeignet.
   *
   * Deshalb wird hier absichtlich nicht einfach
   * data?.enabled zurückgegeben.
   */

  void data;

  /*
   * Die sichere UI-Prüfung erfolgt später über
   * getCurrentUserPermissions().
   *
   * Diese Funktion bleibt daher konservativ.
   */

  return false;
}

/* =========================================================
   ALLE BESTELLUNGEN LADEN

   WICHTIG:
   Hier wird NICHT clientseitig nach
   user_id gefiltert.

   Supabase RLS entscheidet:

   eigene Bestellung
   ODER
   orders.view_all
   ========================================================= */

export async function getOrders(): Promise<
  SavedOrder[]
> {
  const {
    data,
    error,
  } =
    await supabase
      .from("orders")
      .select(
        "id,user_id,name,total,progress,material_list,items,completed_items,prices,created_at,updated_at",
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      );

  if (error) {
    console.error(
      "Bestellungen konnten nicht geladen werden:",
      error,
    );

    return [];
  }

  return (
    (data ?? []) as DatabaseOrder[]
  ).map(
    mapDatabaseOrder,
  );
}

/* =========================================================
   EINE BESTELLUNG LADEN

   Auch hier entscheidet RLS, ob der Benutzer
   die Bestellung überhaupt sehen darf.
   ========================================================= */

export async function getOrder(
  id: string,
): Promise<
  SavedOrder | undefined
> {
  const {
    data,
    error,
  } =
    await supabase
      .from("orders")
      .select(
        "id,user_id,name,total,progress,material_list,items,completed_items,prices,created_at,updated_at",
      )
      .eq(
        "id",
        id,
      )
      .maybeSingle();

  if (error) {
    console.error(
      "Bestellung konnte nicht geladen werden:",
      error,
    );

    return undefined;
  }

  if (!data) {
    return undefined;
  }

  return mapDatabaseOrder(
    data as DatabaseOrder,
  );
}

/* =========================================================
   BESTELLUNG SPEICHERN

   RLS entscheidet, ob INSERT/UPDATE erlaubt ist.
   ========================================================= */

export async function saveOrder(
  order: SavedOrder,
): Promise<boolean> {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    console.error(
      "Bestellung konnte nicht gespeichert werden: kein Benutzer.",
    );

    return false;
  }

  // Alte Dashboard-/LocalStorage-IDs können noch im Zustand liegen.
  // Supabase erwartet für orders.id eine echte UUID.
  const safeOrder: SavedOrder = {
    ...order,
    id: isUuid(order.id)
      ? order.id
      : createOrderId(),
  };

  const databaseOrder =
    mapOrderToDatabase(
      safeOrder,
      userId,
    );

  const {
    error,
  } =
    await supabase
      .from("orders")
      .upsert(
        databaseOrder,
        {
          onConflict: "id",
        },
      );

  if (error) {
    console.error(
      "Bestellung konnte nicht gespeichert werden:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
      databaseOrder,
    );

    window.alert(
      `Die Bestellung konnte nicht gespeichert werden.\\n\\n${error.message}`,
    );

    return false;
  }

  return true;
}

/* =========================================================
   BESTELLUNG LÖSCHEN

   RLS entscheidet, ob DELETE erlaubt ist.
   ========================================================= */

export async function deleteOrder(
  id: string,
): Promise<boolean> {
  const {
    error,
  } =
    await supabase
      .from("orders")
      .delete()
      .eq(
        "id",
        id,
      );

  if (error) {
    console.error(
      "Bestellung konnte nicht gelöscht werden:",
      error,
    );

    window.alert(
      "Die Bestellung konnte nicht gelöscht werden.",
    );

    return false;
  }

  return true;
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

/* =========================================================
   NEUE ID
   ========================================================= */

export function createOrderId(): string {
  // Supabase/Postgres erwartet hier eine UUID.
  // Date.now()-IDs sind keine gültigen UUIDs und können
  // beim Upsert einen HTTP-400-Fehler verursachen.
  return crypto.randomUUID();
}

/* =========================================================
   ALTE LOCALSTORAGE-BESTELLUNGEN MIGRIEREN
   ========================================================= */

export async function migrateLocalOrdersToSupabase(): Promise<void> {
  const stored =
    localStorage.getItem(
      STORAGE_KEY,
    );

  if (!stored) {
    return;
  }

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(stored);
  } catch {
    console.error(
      "Alte Bestellungen konnten nicht gelesen werden.",
    );

    return;
  }

  if (
    !Array.isArray(parsed) ||
    parsed.length === 0
  ) {
    return;
  }

  const userId =
    await getCurrentUserId();

  if (!userId) {
    return;
  }

  let migrated = 0;

  for (
    const rawOrder of parsed
  ) {
    if (
      !isObject(
        rawOrder,
      )
    ) {
      continue;
    }

    if (
      typeof rawOrder.id !==
        "string" ||
      typeof rawOrder.name !==
        "string" ||
      !Array.isArray(
        rawOrder.items,
      )
    ) {
      continue;
    }

    const order: SavedOrder =
      {
        id:
          isUuid(rawOrder.id)
            ? rawOrder.id
            : createOrderId(),

        name:
          rawOrder.name,

        materialText:
          typeof rawOrder.materialText ===
          "string"
            ? rawOrder.materialText
            : "",

        items:
          rawOrder.items as ParsedItem[],

        completedItems:
          Array.isArray(
            rawOrder.completedItems,
          )
            ? rawOrder.completedItems.filter(
                (
                  item,
                ): item is number =>
                  typeof item ===
                  "number",
              )
            : [],

        prices:
          isObject(
            rawOrder.prices,
          )
            ? parsePrices(
                rawOrder.prices,
              )
            : {},

        createdAt:
          typeof rawOrder.createdAt ===
          "string"
            ? rawOrder.createdAt
            : new Date().toISOString(),

        updatedAt:
          typeof rawOrder.updatedAt ===
          "string"
            ? rawOrder.updatedAt
            : new Date().toISOString(),
      };

    const success =
      await saveOrder(
        order,
      );

    if (success) {
      migrated++;
    }
  }

  if (
    migrated > 0
  ) {
    console.log(
      `${migrated} alte Bestellung(en) nach Supabase übertragen.`,
    );

    localStorage.removeItem(
      STORAGE_KEY,
    );
  }
}