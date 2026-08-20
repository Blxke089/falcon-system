export interface ItemCatalogEntry {
  category: string;
  icon: string;
}

export const itemCatalog: Record<string, ItemCatalogEntry> = {
  // =========================
  // STEIN
  // =========================

  stone: {
    category: "Stein",
    icon: "🪨",
  },

  cobblestone: {
    category: "Stein",
    icon: "🪨",
  },

  andesite: {
    category: "Stein",
    icon: "🪨",
  },

  diorite: {
    category: "Stein",
    icon: "🪨",
  },

  granite: {
    category: "Stein",
    icon: "🪨",
  },

  deepslate: {
    category: "Stein",
    icon: "🪨",
  },

  // =========================
  // GLAS
  // =========================

  glass: {
    category: "Glas",
    icon: "🪟",
  },

  "glass pane": {
    category: "Glas",
    icon: "🪟",
  },

  // =========================
  // ERDE
  // =========================

  dirt: {
    category: "Erde",
    icon: "🟫",
  },

  coarse_dirt: {
    category: "Erde",
    icon: "🟫",
  },

  "coarse dirt": {
    category: "Erde",
    icon: "🟫",
  },

  grass: {
    category: "Erde",
    icon: "🌱",
  },

  sand: {
    category: "Erde",
    icon: "🟨",
  },

  gravel: {
    category: "Erde",
    icon: "🟫",
  },

  // =========================
  // HOLZ
  // =========================

  "oak log": {
    category: "Holz",
    icon: "🪵",
  },

  oak_log: {
    category: "Holz",
    icon: "🪵",
  },

  "spruce log": {
    category: "Holz",
    icon: "🪵",
  },

  spruce_log: {
    category: "Holz",
    icon: "🪵",
  },

  "birch log": {
    category: "Holz",
    icon: "🪵",
  },

  birch_log: {
    category: "Holz",
    icon: "🪵",
  },

  "jungle log": {
    category: "Holz",
    icon: "🪵",
  },

  jungle_log: {
    category: "Holz",
    icon: "🪵",
  },

  "acacia log": {
    category: "Holz",
    icon: "🪵",
  },

  acacia_log: {
    category: "Holz",
    icon: "🪵",
  },

  "dark oak log": {
    category: "Holz",
    icon: "🪵",
  },

  dark_oak_log: {
    category: "Holz",
    icon: "🪵",
  },

  // =========================
  // ERZE / MINERALIEN
  // =========================

  coal: {
    category: "Erze",
    icon: "⚫",
  },

  "coal ore": {
    category: "Erze",
    icon: "⚫",
  },

  iron: {
    category: "Erze",
    icon: "⛓️",
  },

  "iron ingot": {
    category: "Erze",
    icon: "⛓️",
  },

  "iron ore": {
    category: "Erze",
    icon: "⛏️",
  },

  gold: {
    category: "Erze",
    icon: "🟡",
  },

  "gold ingot": {
    category: "Erze",
    icon: "🟡",
  },

  "gold ore": {
    category: "Erze",
    icon: "⛏️",
  },

  diamond: {
    category: "Erze",
    icon: "💎",
  },

  "diamond ore": {
    category: "Erze",
    icon: "💎",
  },

  emerald: {
    category: "Erze",
    icon: "💚",
  },

  "emerald ore": {
    category: "Erze",
    icon: "💚",
  },

  redstone: {
    category: "Redstone",
    icon: "🔴",
  },

  // =========================
  // GLAS / BAU
  // =========================

  quartz: {
    category: "Baumaterial",
    icon: "⬜",
  },

  "quartz block": {
    category: "Baumaterial",
    icon: "⬜",
  },

  bricks: {
    category: "Baumaterial",
    icon: "🧱",
  },

  "brick block": {
    category: "Baumaterial",
    icon: "🧱",
  },

  // =========================
  // NETHER
  // =========================

  netherrack: {
    category: "Nether",
    icon: "🟥",
  },

  soul_sand: {
    category: "Nether",
    icon: "🟫",
  },

  "soul sand": {
    category: "Nether",
    icon: "🟫",
  },

  glowstone: {
    category: "Nether",
    icon: "✨",
  },

  obsidian: {
    category: "Nether",
    icon: "⬛",
  },

  // =========================
  // PFLANZEN
  // =========================

  oak_sapling: {
    category: "Pflanzen",
    icon: "🌱",
  },

  "oak sapling": {
    category: "Pflanzen",
    icon: "🌱",
  },

  wheat: {
    category: "Pflanzen",
    icon: "🌾",
  },

  cactus: {
    category: "Pflanzen",
    icon: "🌵",
  },

  sugar_cane: {
    category: "Pflanzen",
    icon: "🌿",
  },

  "sugar cane": {
    category: "Pflanzen",
    icon: "🌿",
  },

  // =========================
  // SONSTIGES
  // =========================

  chest: {
    category: "Lager",
    icon: "📦",
  },

  hopper: {
    category: "Redstone",
    icon: "🔧",
  },

  torch: {
    category: "Beleuchtung",
    icon: "🔥",
  },
};