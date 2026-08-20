import { itemCatalog } from "../../data/itemCatalog";
import minecraftItems from "../../data/minecraftItems1214.json";
import minecraftGerman from "../../data/minecraftGerman1214.json";

export interface ParsedItem {
  id: number;
  name: string;
  category: string;
  amount: number;
  stacks: number;
  singleChests: number;
  doubleChests: number;
  icon: string;
  image?: string;
}

interface MinecraftItemData {
  id: number;
  name: string;
  displayName: string;
  stackSize: number;
}

/* =========================================================
   MINECRAFT 1.21.4
   ========================================================= */

const minecraftData =
  minecraftItems as MinecraftItemData[];

const minecraftById =
  new Map<string, MinecraftItemData>();

const minecraftByDisplayName =
  new Map<string, MinecraftItemData>();

for (const item of minecraftData) {
  if (!item?.name) continue;

  minecraftById.set(
    item.name.trim().toLowerCase(),
    item,
  );

  if (item.displayName) {
    minecraftByDisplayName.set(
      normalizeForLookup(item.displayName),
      item,
    );
  }
}

/*
 * minecraftGerman1214.json:
 *
 * {
 *   "Stein": "stone",
 *   "Eichenholzbretter": "oak_planks"
 * }
 *
 * Die Datei kann entweder "deutscher Name -> ID"
 * oder "ID -> deutscher Name" enthalten.
 */
const minecraftGermanNameToId =
  new Map<string, string>();

/*
 * Die deutsche 1.21.4-Datei kann Strings UND Arrays enthalten.
 * Deshalb werden die Werte als unknown behandelt.
 */
const germanData =
  minecraftGerman as unknown;

if (
  germanData &&
  typeof germanData === "object" &&
  !Array.isArray(germanData)
) {
  for (const [key, rawValue] of Object.entries(
    germanData as Record<string, unknown>,
  )) {
    const keyNormalized =
      normalizeForLookup(key);

    const values =
      Array.isArray(rawValue)
        ? rawValue
        : [rawValue];

    for (const rawEntry of values) {
      if (typeof rawEntry !== "string") {
        continue;
      }

      const valueNormalized =
        normalizeForLookup(rawEntry);

      const keyId =
        keyNormalized.replace(/ /g, "_");

      const valueId =
        valueNormalized.replace(/ /g, "_");

      // Deutscher Name -> Minecraft-ID
      if (minecraftById.has(valueId)) {
        if (
          !minecraftGermanNameToId.has(
            keyNormalized,
          )
        ) {
          minecraftGermanNameToId.set(
            keyNormalized,
            valueId,
          );
        }

        continue;
      }

      // Minecraft-ID -> deutscher Name
      if (minecraftById.has(keyId)) {
        minecraftGermanNameToId.set(
          valueNormalized,
          keyId,
        );
      }
    }
  }
}

/* =========================================================
   KONSTANTEN
   ========================================================= */

const SINGLE_CHEST_SLOTS = 27;
const DOUBLE_CHEST_SLOTS = 54;

/* =========================================================
   ITEM-BILDER
   ========================================================= */

const itemImages = import.meta.glob(
  "../../assets/items/*.png",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

/* =========================================================
   NORMALISIERUNG
   ========================================================= */

function normalizeForLookup(
  name: string,
): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/^minecraft:/, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeItemName(
  name: string,
): string {
  return normalizeForLookup(name);
}

function toMinecraftId(
  name: string,
): string {
  return normalizeForLookup(name)
    .replace(/ /g, "_");
}

/* =========================================================
   SCHEMATIC-NAMEN / ALIAS-AUFLÖSUNG
   ========================================================= */

/*
 * Schematic-Materiallisten benutzen teilweise andere deutsche
 * Namen als die Minecraft-Übersetzungsdatei. Beispiele:
 *
 *   Fichtenholztreppe   -> FichtenTreppe -> spruce_stairs
 *   Fichtenholzstufe    -> FichtenStufe  -> spruce_slab
 *   Entrindeter Fichtenstamm -> FichtenStamm -> spruce_log
 *   Steinziegel         -> stone_bricks
 *   Glatter Sandstein   -> smooth_sandstone
 *
 * Diese Ebene ist bewusst VOR itemCatalog angesiedelt.
 * itemCatalog liefert nur Kategorie/Icon und darf niemals
 * darüber entscheiden, ob ein Item erkannt wird.
 */

const schematicAliases: Record<string, string> = {
  // Steinziegel
  "steinziegel": "stone_bricks",
  "steinziegeltreppe": "stone_brick_stairs",
  "steinziegelstufe": "stone_brick_slab",
  "steinziegelmauer": "stone_brick_wall",

  // Glatter Sandstein
  "glatter sandstein": "smooth_sandstone",
  "glatter sandsteinstufe": "smooth_sandstone_slab",
  "glatter sandsteintreppe": "smooth_sandstone_stairs",

  // Polierter Andesit
  "polierter andesit": "polished_andesite",
  "polierte andesittreppe": "polished_andesite_stairs",
  "polierte andesitstufe": "polished_andesite_slab",

  // Polierter Diorit
  "polierter diorit": "polished_diorite",
  "polierte diorittreppe": "polished_diorite_stairs",
  "polierte dioritstufe": "polished_diorite_slab",

  // Polierter Granit
  "polierter granit": "polished_granite",
  "polierte granittreppe": "polished_granite_stairs",
  "polierte granitstufe": "polished_granite_slab",
};

function resolveGermanAliasId(
  name: string,
): string | undefined {
  const normalized =
    normalizeForLookup(name);

  /*
   * Nur eindeutige Zuordnungen verwenden.
   * Keine freie Fuzzy-Suche: Ein unbekannter Name darf niemals
   * versehentlich auf einen anderen Block zeigen.
   */

  const directAlias =
    schematicAliases[normalized];

  if (
    directAlias &&
    minecraftById.has(directAlias)
  ) {
    return directAlias;
  }

  /*
   * Typische Schematic-Holznamen:
   * Fichtenholztreppe -> spruce_stairs
   * Fichtenholzstufe  -> spruce_slab
   */
  const woodMatch =
    normalized.match(
      /^(fichten|eichen|birken|dschungel|tropen|akazien|schwarzeichen|kirsch|mangroven|pale oak|bambus)(?:holz)?(bretter|treppe|stufe|falltür|zaun|zauntor|druckplatte|knopf|schild|tür|laub|stamm|holz)$/i,
    );

  if (woodMatch) {
    const wood =
      woodMatch[1].toLowerCase();

    const part =
      woodMatch[2].toLowerCase();

    const woodIds:
      Record<string, string> = {
      fichten: "spruce",
      eichen: "oak",
      birken: "birch",
      dschungel: "jungle",
      tropen: "jungle",
      akazien: "acacia",
      schwarzeichen: "dark_oak",
      kirsch: "cherry",
      mangroven: "mangrove",
      "pale oak": "pale_oak",
      bambus: "bamboo",
    };

    const partIds:
      Record<string, string> = {
      bretter: "planks",
      treppe: "stairs",
      stufe: "slab",
      falltür: "trapdoor",
      zaun: "fence",
      zauntor: "fence_gate",
      druckplatte: "pressure_plate",
      knopf: "button",
      schild: "sign",
      tür: "door",
      laub: "leaves",
      stamm: "log",
      holz: "wood",
    };

    const woodId =
      woodIds[wood];

    const partId =
      partIds[part];

    if (woodId && partId) {
      const id =
        `${woodId}_${partId}`;

      if (minecraftById.has(id)) {
        return id;
      }
    }
  }

  /*
   * Entrindete Stämme/Hölzer explizit als stripped_* behandeln.
   * Niemals auf den normalen Stamm zurückfallen.
   */
  const strippedMatch =
    normalized.match(
      /^entrindeter\s+(fichten|eichen|birken|dschungel|tropen|akazien|schwarzeichen|kirsch|mangroven)(?:holz)?(stamm|holz)$/i,
    );

  if (strippedMatch) {
    const wood =
      strippedMatch[1].toLowerCase();

    const part =
      strippedMatch[2].toLowerCase();

    const woodIds:
      Record<string, string> = {
      fichten: "spruce",
      eichen: "oak",
      birken: "birch",
      dschungel: "jungle",
      tropen: "jungle",
      akazien: "acacia",
      schwarzeichen: "dark_oak",
      kirsch: "cherry",
      mangroven: "mangrove",
    };

    const woodId =
      woodIds[wood];

    if (woodId) {
      const id =
        part === "stamm"
          ? `stripped_${woodId}_log`
          : `stripped_${woodId}_wood`;

      if (minecraftById.has(id)) {
        return id;
      }
    }
  }

  return undefined;
}

/* =========================================================
   ITEM AUFLÖSEN
   ========================================================= */

function resolveMinecraftItem(
  name: string,
): MinecraftItemData | undefined {
  const normalized =
    normalizeForLookup(name);

  const minecraftId =
    normalized.replace(/ /g, "_");

  // 1. Direkte Minecraft-ID
  const byId =
    minecraftById.get(minecraftId);

  if (byId) {
    return byId;
  }

  // 2. Englischer Minecraft-Anzeigename
  const byEnglishDisplayName =
    minecraftByDisplayName.get(
      normalized,
    );

  if (byEnglishDisplayName) {
    return byEnglishDisplayName;
  }

  // 3. Exakter deutscher Name
  const germanId =
    minecraftGermanNameToId.get(
      normalized,
    );

  if (germanId) {
    const germanItem =
      minecraftById.get(germanId);

    if (germanItem) {
      return germanItem;
    }
  }

  // 4. Schematic-Alias / abweichende deutsche Schreibweise
  const aliasId =
    resolveGermanAliasId(name);

  if (aliasId) {
    const aliasItem =
      minecraftById.get(aliasId);

    if (aliasItem) {
      return aliasItem;
    }
  }

  return undefined;
}


/* =========================================================
   STACKGRÖSSE
   ========================================================= */

function getStackSize(
  name: string,
): number {
  const item =
    resolveMinecraftItem(name);

  if (
    item &&
    Number.isFinite(item.stackSize) &&
    item.stackSize > 0
  ) {
    return item.stackSize;
  }

  /*
   * Fallback für Namen, die nicht in der
   * Datenbank gefunden wurden.
   */
  return 64;
}

/* =========================================================
   KATALOG
   ========================================================= */

function getItemData(
  name: string,
) {
  const normalizedName =
    normalizeItemName(name);

  const directId =
    toMinecraftId(name);

  const idMatch =
    itemCatalog[directId];

  if (idMatch) {
    return idMatch;
  }

  const directMatch =
    itemCatalog[normalizedName];

  if (directMatch) {
    return directMatch;
  }

  const underscoreName =
    normalizedName.replace(
      / /g,
      "_",
    );

  const underscoreMatch =
    itemCatalog[underscoreName];

  if (underscoreMatch) {
    return underscoreMatch;
  }

  /*
   * Versuche den Minecraft-ID-Namen
   * ebenfalls im Katalog zu finden.
   */
  const minecraftItem =
    resolveMinecraftItem(name);

  if (minecraftItem) {
    const catalogById =
      itemCatalog[minecraftItem.name];

    if (catalogById) {
      return catalogById;
    }
  }

  /*
   * Ein unbekanntes Katalog-Item darf NICHT mit "❓" als
   * Bildersatz dargestellt werden. Die echte PNG-Zuordnung
   * läuft unabhängig über die Minecraft-ID.
   */
  return {
    category: "Sonstiges",
    icon: "📦",
  };
}

/* =========================================================
   BILD
   ========================================================= */

function getItemImage(
  name: string,
): string | undefined {
  const item =
    resolveMinecraftItem(name);

  const candidates = new Set<string>();

  // Echte Minecraft-ID bevorzugen.
  if (item?.name) {
    candidates.add(
      normalizeForLookup(item.name).replace(
        / /g,
        "_",
      ),
    );
  }

  // Fallback auf den übergebenen Namen.
  candidates.add(
    toMinecraftId(name),
  );

  /*
   * Tatsächliche PNG-Dateinamen aus dem Assets-Ordner
   * normalisiert vergleichen.
   */
  for (const [path, url] of Object.entries(
    itemImages,
  )) {
    const normalizedPath =
      path.replace(/\\/g, "/");

    const fileName =
      normalizedPath
        .split("/")
        .pop()
        ?.replace(/\.png$/i, "");

    if (!fileName) {
      continue;
    }

    const normalizedFileName =
      normalizeForLookup(fileName).replace(
        / /g,
        "_",
      );

    if (
      candidates.has(
        normalizedFileName,
      )
    ) {
      return url;
    }
  }

  return undefined;
}

/* =========================================================
   MENGE
   ========================================================= */

function parseAmount(
  value: string,
): number {
  let normalized =
    value
      .trim()
      .replace(/\s/g, "");

  if (!normalized) {
    return NaN;
  }

  /*
   * 1.234,56 -> 1234.56
   */
  if (
    normalized.includes(".") &&
    normalized.includes(",")
  ) {
    normalized =
      normalized
        .replace(/\./g, "")
        .replace(",", ".");

    return Number(normalized);
  }

  /*
   * Bei Minecraft-Materiallisten sind
   * Mengen normalerweise ganze Zahlen.
   *
   * 1.234 -> 1234
   * 1,234 -> 1234
   */
  if (
    /^\d{1,3}([.,]\d{3})+$/.test(
      normalized,
    )
  ) {
    return Number(
      normalized.replace(/[.,]/g, ""),
    );
  }

  /*
   * Ein einzelnes Komma/Punkt wird als
   * Zahl akzeptiert.
   */
  return Number(
    normalized.replace(",", "."),
  );
}

/* =========================================================
   TABELLENZEILE ERKENNEN
   ========================================================= */

function parseMaterialLine(
  line: string,
): {
  name: string;
  amount: number;
} | null {
  const original = line.trim();

  if (!original) {
    return null;
  }

  /* =======================================================
     TABELLEN / SCHEMATIC-MATERIALISTEN

     Beispiel:

     | Item                  | Total | Missing | Available |
     | Fichtenholzbretter    | 17418 | 17418   | 0         |

     Bei diesen Tabellen ist "Total" die benötigte Menge.
     Trennlinien und Kopfzeilen werden ignoriert.
     ======================================================= */
  if (original.includes("|")) {
    const cells = original
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);

    if (cells.length >= 2) {
      const firstCell =
        cells[0]
          .replace(/^[-+_=]+$/, "")
          .trim();

      const header = normalizeForLookup(firstCell);

      // Kopfzeilen / Trennlinien ignorieren.
      if (
        !firstCell ||
        header === "item" ||
        header === "items" ||
        header === "material" ||
        header === "materialien" ||
        header === "name" ||
        /^[-+_]+$/.test(firstCell)
      ) {
        return null;
      }

      // Eine Trennlinie wie +---------+---------+.
      if (
        cells.every((cell) =>
          /^[-+_=]+$/.test(cell),
        )
      ) {
        return null;
      }

      /*
       * Standard-Schematic-Tabelle:
       *
       * Item | Total | Missing | Available
       *
       * Total steht in cells[1].
       */
      const total =
        parseAmount(cells[1]);

      if (
        Number.isFinite(total) &&
        total > 0
      ) {
        return {
          name: cleanItemName(firstCell),
          amount: total,
        };
      }

      /*
       * Fallback für Tabellen, bei denen die Spalten etwas
       * anders angeordnet sind: Nimm die erste gültige Zahl
       * nach dem Itemnamen.
       */
      for (let i = 1; i < cells.length; i++) {
        const amount = parseAmount(cells[i]);

        if (
          Number.isFinite(amount) &&
          amount > 0
        ) {
          return {
            name: cleanItemName(firstCell),
            amount,
          };
        }
      }

      return null;
    }
  }

  /* =======================================================
     NORMALE MATERIALZEILEN
     ======================================================= */
  const cleaned = original
    .replace(/\t+/g, " ")
    .replace(/\s+/g, " ");

  /*
   * Kopfzeilen ohne Pipes ebenfalls ignorieren.
   */
  const normalizedLine =
    normalizeForLookup(cleaned);

  if (
    normalizedLine === "item" ||
    normalizedLine === "material" ||
    normalizedLine === "materialien"
  ) {
    return null;
  }

  /*
   * Menge zuerst:
   *
   * 1284 Stone
   * 1284 Stein
   * 1.284 Eichenholzbretter
   */
  let match =
    cleaned.match(
      /^([\d.,]+)\s+(.+)$/,
    );

  if (match) {
    const amount = parseAmount(match[1]);

    if (Number.isFinite(amount) && amount > 0) {
      return {
        amount,
        name: cleanItemName(match[2]),
      };
    }
  }

  /*
   * Name zuerst:
   *
   * Stone 1284
   * Stein 1284
   */
  match =
    cleaned.match(
      /^(.+?)\s+([\d.,]+)$/,
    );

  if (match) {
    const amount = parseAmount(match[2]);

    if (Number.isFinite(amount) && amount > 0) {
      return {
        name: cleanItemName(match[1]),
        amount,
      };
    }
  }

  /*
   * Manche Listen enthalten mehrere Spalten und die Menge
   * steht ganz rechts:
   *
   * Stein    Baublöcke    1284
   */
  const tokens = cleaned.split(" ");

  if (tokens.length >= 2) {
    const lastToken =
      tokens[tokens.length - 1];

    const amount =
      parseAmount(lastToken);

    if (
      Number.isFinite(amount) &&
      amount > 0
    ) {
      const possibleName =
        tokens
          .slice(0, -1)
          .join(" ");

      if (
        resolveMinecraftItem(possibleName)
      ) {
        return {
          name: cleanItemName(possibleName),
          amount,
        };
      }

      /*
       * Von rechts mögliche Kategorie-/Spaltennamen
       * entfernen, bis ein Minecraft-Item gefunden wird.
       */
      for (
        let i = 1;
        i < tokens.length - 1;
        i++
      ) {
        const candidate =
          tokens
            .slice(0, tokens.length - 1 - i)
            .join(" ");

        if (!candidate) {
          break;
        }

        if (
          resolveMinecraftItem(candidate)
        ) {
          return {
            name: cleanItemName(candidate),
            amount,
          };
        }
      }
    }
  }

  return null;
}

/* =========================================================
   ITEMNAME BEREINIGEN
   ========================================================= */

function cleanItemName(
  name: string,
): string {
  return name
    .trim()
    .replace(/^minecraft:/i, "")
    .replace(/\s+/g, " ");
}

/* =========================================================
   STACKS
   ========================================================= */

function calculateStacks(
  amount: number,
  stackSize: number,
): number {
  return Math.ceil(
    amount / stackSize,
  );
}

/* =========================================================
   LAGER
   ========================================================= */

function calculateStorage(
  stacks: number,
) {
  if (
    stacks <=
    SINGLE_CHEST_SLOTS
  ) {
    return {
      singleChests: 1,
      doubleChests: 0,
    };
  }

  return {
    singleChests: 0,
    doubleChests:
      Math.ceil(
        stacks /
          DOUBLE_CHEST_SLOTS,
      ),
  };
}

/* =========================================================
   MATERIAL LISTE
   ========================================================= */

export function parseMaterialList(
  input: string,
): ParsedItem[] {
  const lines =
    input
      .split(/\r?\n/)
      .map((line) =>
        line.trim(),
      )
      .filter(Boolean);

  const groupedItems =
    new Map<
      string,
      {
        name: string;
        amount: number;
      }
    >();

  for (const line of lines) {
    const parsed =
      parseMaterialLine(line);

    if (!parsed) {
      continue;
    }

    const amount =
      parsed.amount;

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      continue;
    }

    const name =
      parsed.name;

    if (!name) {
      continue;
    }

    /*
     * Der echte Minecraft-Datensatz
     * entscheidet, ob der Name gültig ist.
     *
     * Falls er nicht gefunden wird,
     * behalten wir das Item trotzdem,
     * damit dein bisheriger Katalog
     * weiterhin funktionieren kann.
     */
    const resolved =
      resolveMinecraftItem(name);

    const normalizedName =
      resolved?.name ??
      toMinecraftId(name);

    const existing =
      groupedItems.get(
        normalizedName,
      );

    if (existing) {
      existing.amount +=
        amount;
    } else {
      groupedItems.set(
        normalizedName,
        {
          name,
          amount,
        },
      );
    }
  }

  return Array.from(
    groupedItems.entries(),
  ).map(
    (
      [normalizedName, item],
      index,
    ) => {
      const data =
        getItemData(
          normalizedName,
        );

      const stackSize =
        getStackSize(
          normalizedName,
        );

      const stacks =
        calculateStacks(
          item.amount,
          stackSize,
        );

      const storage =
        calculateStorage(
          stacks,
        );

      return {
        id:
          index + 1,

        name:
          item.name,

        category:
          data.category,

        amount:
          item.amount,

        stacks,

        singleChests:
          storage.singleChests,

        doubleChests:
          storage.doubleChests,

        icon:
          data.icon,

        image:
          getItemImage(
            normalizedName,
          ),
      };
    },
  );
}