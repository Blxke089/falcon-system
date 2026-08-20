import { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  Package,
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  Save,
  Database,
  Boxes,
  ChevronRight,
} from "lucide-react";

import { itemCatalog } from "../../data/itemCatalog";
import {
  getOrders,
  type SavedOrder,
} from "../../services/OrderStorage/OrderStorage";
import {
  getCurrentUserPermissions,
} from "../../services/PermissionService/PermissionService";
import type {
  Permission,
} from "../../services/PermissionService/PermissionService";
import { supabase } from "../../lib/supabase";
import "./Items.css";

const itemImages = import.meta.glob(
  "../../assets/items/*.png",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

function normalizeItemName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/^minecraft:/, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeId(name: string): string {
  return normalizeItemName(name).replace(/ /g, "_");
}

function getCatalogData(name: string) {
  const normalized = normalizeItemName(name);
  const direct = itemCatalog[normalized];
  if (direct) return direct;

  const underscore = itemCatalog[normalized.replace(/ /g, "_")];
  if (underscore) return underscore;

  return { category: "Sonstiges", icon: "❓" };
}

const ALL_MINECRAFT_ITEM_IDS = [
  'acacia_boat',
  'acacia_button',
  'acacia_chest_boat',
  'acacia_door',
  'acacia_fence',
  'acacia_fence_gate',
  'acacia_hanging_sign',
  'acacia_leaves',
  'acacia_log',
  'acacia_planks',
  'acacia_pressure_plate',
  'acacia_sapling',
  'acacia_shelf',
  'acacia_sign',
  'acacia_slab',
  'acacia_stairs',
  'acacia_trapdoor',
  'acacia_wood',
  'activator_rail',
  'allay_spawn_egg',
  'allium',
  'amethyst_block',
  'amethyst_cluster',
  'amethyst_shard',
  'ancient_debris',
  'andesite',
  'andesite_slab',
  'andesite_stairs',
  'andesite_wall',
  'angler_pottery_sherd',
  'anvil',
  'apple',
  'archer_pottery_sherd',
  'armadillo_scute',
  'armadillo_spawn_egg',
  'armor_stand',
  'arms_up_pottery_sherd',
  'arrow',
  'axolotl_bucket',
  'axolotl_spawn_egg',
  'azalea',
  'azalea_leaves',
  'azure_bluet',
  'baked_potato',
  'bamboo',
  'bamboo_block',
  'bamboo_button',
  'bamboo_chest_raft',
  'bamboo_door',
  'bamboo_fence',
  'bamboo_fence_gate',
  'bamboo_hanging_sign',
  'bamboo_mosaic',
  'bamboo_mosaic_slab',
  'bamboo_mosaic_stairs',
  'bamboo_planks',
  'bamboo_pressure_plate',
  'bamboo_raft',
  'bamboo_shelf',
  'bamboo_sign',
  'bamboo_slab',
  'bamboo_stairs',
  'bamboo_trapdoor',
  'barrel',
  'barrier',
  'basalt',
  'bat_spawn_egg',
  'beacon',
  'bedrock',
  'bee_nest',
  'bee_spawn_egg',
  'beef',
  'beehive',
  'beetroot',
  'beetroot_seeds',
  'beetroot_soup',
  'bell',
  'big_dripleaf',
  'birch_boat',
  'birch_button',
  'birch_chest_boat',
  'birch_door',
  'birch_fence',
  'birch_fence_gate',
  'birch_hanging_sign',
  'birch_leaves',
  'birch_log',
  'birch_planks',
  'birch_pressure_plate',
  'birch_sapling',
  'birch_shelf',
  'birch_sign',
  'birch_slab',
  'birch_stairs',
  'birch_trapdoor',
  'birch_wood',
  'black_banner',
  'black_bed',
  'black_bundle',
  'black_candle',
  'black_carpet',
  'black_concrete',
  'black_concrete_powder',
  'black_dye',
  'black_glazed_terracotta',
  'black_harness',
  'black_shulker_box',
  'black_stained_glass',
  'black_stained_glass_pane',
  'black_terracotta',
  'black_wool',
  'blackstone',
  'blackstone_slab',
  'blackstone_stairs',
  'blackstone_wall',
  'blade_pottery_sherd',
  'blast_furnace',
  'blaze_powder',
  'blaze_rod',
  'blaze_spawn_egg',
  'blue_banner',
  'blue_bed',
  'blue_bundle',
  'blue_candle',
  'blue_carpet',
  'blue_concrete',
  'blue_concrete_powder',
  'blue_dye',
  'blue_egg',
  'blue_glazed_terracotta',
  'blue_harness',
  'blue_ice',
  'blue_orchid',
  'blue_shulker_box',
  'blue_stained_glass',
  'blue_stained_glass_pane',
  'blue_terracotta',
  'blue_wool',
  'bogged_spawn_egg',
  'bolt_armor_trim_smithing_template',
  'bone',
  'bone_block',
  'bone_meal',
  'book',
  'bookshelf',
  'bordure_indented_banner_pattern',
  'bow',
  'bowl',
  'brain_coral',
  'brain_coral_block',
  'brain_coral_fan',
  'bread',
  'breeze_rod',
  'breeze_spawn_egg',
  'brewer_pottery_sherd',
  'brewing_stand',
  'brick',
  'brick_slab',
  'brick_stairs',
  'brick_wall',
  'bricks',
  'brown_banner',
  'brown_bed',
  'brown_bundle',
  'brown_candle',
  'brown_carpet',
  'brown_concrete',
  'brown_concrete_powder',
  'brown_dye',
  'brown_egg',
  'brown_glazed_terracotta',
  'brown_harness',
  'brown_mushroom',
  'brown_mushroom_block',
  'brown_shulker_box',
  'brown_stained_glass',
  'brown_stained_glass_pane',
  'brown_terracotta',
  'brown_wool',
  'brush',
  'bubble_coral',
  'bubble_coral_block',
  'bubble_coral_fan',
  'bucket',
  'budding_amethyst',
  'bundle',
  'burn_pottery_sherd',
  'bush',
  'cactus',
  'cactus_flower',
  'cake',
  'calcite',
  'calibrated_sculk_sensor',
  'camel_spawn_egg',
  'campfire',
  'candle',
  'carrot',
  'carrot_on_a_stick',
  'cartography_table',
  'carved_pumpkin',
  'cat_spawn_egg',
  'cauldron',
  'cave_spider_spawn_egg',
  'chain',
  'chain_command_block',
  'chainmail_boots',
  'chainmail_chestplate',
  'chainmail_helmet',
  'chainmail_leggings',
  'charcoal',
  'cherry_boat',
  'cherry_button',
  'cherry_chest_boat',
  'cherry_door',
  'cherry_fence',
  'cherry_fence_gate',
  'cherry_hanging_sign',
  'cherry_leaves',
  'cherry_log',
  'cherry_planks',
  'cherry_pressure_plate',
  'cherry_sapling',
  'cherry_shelf',
  'cherry_sign',
  'cherry_slab',
  'cherry_stairs',
  'cherry_trapdoor',
  'cherry_wood',
  'chest',
  'chest_minecart',
  'chicken',
  'chicken_spawn_egg',
  'chipped_anvil',
  'chiseled_bookshelf',
  'chiseled_copper',
  'chiseled_deepslate',
  'chiseled_nether_bricks',
  'chiseled_polished_blackstone',
  'chiseled_quartz_block',
  'chiseled_red_sandstone',
  'chiseled_resin_bricks',
  'chiseled_sandstone',
  'chiseled_stone_bricks',
  'chiseled_tuff',
  'chiseled_tuff_bricks',
  'chorus_flower',
  'chorus_fruit',
  'chorus_plant',
  'clay',
  'clay_ball',
  'clock',
  'closed_eyeblossom',
  'coal',
  'coal_block',
  'coal_ore',
  'coarse_dirt',
  'coast_armor_trim_smithing_template',
  'cobbled_deepslate',
  'cobbled_deepslate_slab',
  'cobbled_deepslate_stairs',
  'cobbled_deepslate_wall',
  'cobblestone',
  'cobblestone_slab',
  'cobblestone_stairs',
  'cobblestone_wall',
  'cobweb',
  'cocoa_beans',
  'cod',
  'cod_bucket',
  'cod_spawn_egg',
  'command_block',
  'command_block_minecart',
  'comparator',
  'compass',
  'composter',
  'conduit',
  'cooked_beef',
  'cooked_chicken',
  'cooked_cod',
  'cooked_mutton',
  'cooked_porkchop',
  'cooked_rabbit',
  'cooked_salmon',
  'cookie',
  'copper_axe',
  'copper_bars',
  'copper_block',
  'copper_boots',
  'copper_bulb',
  'copper_chain',
  'copper_chest',
  'copper_chestplate',
  'copper_door',
  'copper_golem_spawn_egg',
  'copper_golem_statue',
  'copper_grate',
  'copper_helmet',
  'copper_hoe',
  'copper_horse_armor',
  'copper_ingot',
  'copper_lantern',
  'copper_leggings',
  'copper_nugget',
  'copper_ore',
  'copper_pickaxe',
  'copper_shovel',
  'copper_sword',
  'copper_torch',
  'copper_trapdoor',
  'cornflower',
  'cow_spawn_egg',
  'cracked_deepslate_bricks',
  'cracked_deepslate_tiles',
  'cracked_nether_bricks',
  'cracked_polished_blackstone_bricks',
  'cracked_stone_bricks',
  'crafter',
  'crafting_table',
  'creaking_heart',
  'creaking_spawn_egg',
  'creeper_banner_pattern',
  'creeper_head',
  'creeper_spawn_egg',
  'crimson_button',
  'crimson_door',
  'crimson_fence',
  'crimson_fence_gate',
  'crimson_fungus',
  'crimson_hanging_sign',
  'crimson_hyphae',
  'crimson_nylium',
  'crimson_planks',
  'crimson_pressure_plate',
  'crimson_roots',
  'crimson_shelf',
  'crimson_sign',
  'crimson_slab',
  'crimson_stairs',
  'crimson_stem',
  'crimson_trapdoor',
  'crossbow',
  'crying_obsidian',
  'cut_copper',
  'cut_copper_slab',
  'cut_copper_stairs',
  'cut_red_sandstone',
  'cut_red_sandstone_slab',
  'cut_sandstone',
  'cut_sandstone_slab',
  'cyan_banner',
  'cyan_bed',
  'cyan_bundle',
  'cyan_candle',
  'cyan_carpet',
  'cyan_concrete',
  'cyan_concrete_powder',
  'cyan_dye',
  'cyan_glazed_terracotta',
  'cyan_harness',
  'cyan_shulker_box',
  'cyan_stained_glass',
  'cyan_stained_glass_pane',
  'cyan_terracotta',
  'cyan_wool',
  'damaged_anvil',
  'dandelion',
  'danger_pottery_sherd',
  'dark_oak_boat',
  'dark_oak_button',
  'dark_oak_chest_boat',
  'dark_oak_door',
  'dark_oak_fence',
  'dark_oak_fence_gate',
  'dark_oak_hanging_sign',
  'dark_oak_leaves',
  'dark_oak_log',
  'dark_oak_planks',
  'dark_oak_pressure_plate',
  'dark_oak_sapling',
  'dark_oak_shelf',
  'dark_oak_sign',
  'dark_oak_slab',
  'dark_oak_stairs',
  'dark_oak_trapdoor',
  'dark_oak_wood',
  'dark_prismarine',
  'dark_prismarine_slab',
  'dark_prismarine_stairs',
  'daylight_detector',
  'dead_brain_coral',
  'dead_brain_coral_block',
  'dead_brain_coral_fan',
  'dead_bubble_coral',
  'dead_bubble_coral_block',
  'dead_bubble_coral_fan',
  'dead_bush',
  'dead_fire_coral',
  'dead_fire_coral_block',
  'dead_fire_coral_fan',
  'dead_horn_coral',
  'dead_horn_coral_block',
  'dead_horn_coral_fan',
  'dead_tube_coral',
  'dead_tube_coral_block',
  'dead_tube_coral_fan',
  'debug_stick',
  'decorated_pot',
  'deepslate',
  'deepslate_brick_slab',
  'deepslate_brick_stairs',
  'deepslate_brick_wall',
  'deepslate_bricks',
  'deepslate_coal_ore',
  'deepslate_copper_ore',
  'deepslate_diamond_ore',
  'deepslate_emerald_ore',
  'deepslate_gold_ore',
  'deepslate_iron_ore',
  'deepslate_lapis_ore',
  'deepslate_redstone_ore',
  'deepslate_tile_slab',
  'deepslate_tile_stairs',
  'deepslate_tile_wall',
  'deepslate_tiles',
  'detector_rail',
  'diamond',
  'diamond_axe',
  'diamond_block',
  'diamond_boots',
  'diamond_chestplate',
  'diamond_helmet',
  'diamond_hoe',
  'diamond_horse_armor',
  'diamond_leggings',
  'diamond_ore',
  'diamond_pickaxe',
  'diamond_shovel',
  'diamond_sword',
  'diorite',
  'diorite_slab',
  'diorite_stairs',
  'diorite_wall',
  'dirt',
  'dirt_path',
  'disc_fragment_5',
  'dispenser',
  'dolphin_spawn_egg',
  'donkey_spawn_egg',
  'dragon_breath',
  'dragon_egg',
  'dragon_head',
  'dried_ghast',
  'dried_kelp',
  'dried_kelp_block',
  'dripstone_block',
  'dropper',
  'drowned_spawn_egg',
  'dune_armor_trim_smithing_template',
  'echo_shard',
  'egg',
  'elder_guardian_spawn_egg',
  'elytra',
  'emerald',
  'emerald_block',
  'emerald_ore',
  'enchanted_book',
  'enchanted_golden_apple',
  'enchanting_table',
  'end_crystal',
  'end_portal_frame',
  'end_rod',
  'end_stone',
  'end_stone_brick_slab',
  'end_stone_brick_stairs',
  'end_stone_brick_wall',
  'end_stone_bricks',
  'ender_chest',
  'ender_dragon_spawn_egg',
  'ender_eye',
  'ender_pearl',
  'enderman_spawn_egg',
  'endermite_spawn_egg',
  'evoker_spawn_egg',
  'experience_bottle',
  'explorer_pottery_sherd',
  'exposed_chiseled_copper',
  'exposed_copper',
  'exposed_copper_bars',
  'exposed_copper_bulb',
  'exposed_copper_chain',
  'exposed_copper_chest',
  'exposed_copper_door',
  'exposed_copper_golem_statue',
  'exposed_copper_grate',
  'exposed_copper_lantern',
  'exposed_copper_trapdoor',
  'exposed_cut_copper',
  'exposed_cut_copper_slab',
  'exposed_cut_copper_stairs',
  'exposed_lightning_rod',
  'eye_armor_trim_smithing_template',
  'farmland',
  'feather',
  'fermented_spider_eye',
  'fern',
  'field_masoned_banner_pattern',
  'filled_map',
  'fire_charge',
  'fire_coral',
  'fire_coral_block',
  'fire_coral_fan',
  'firefly_bush',
  'firework_rocket',
  'firework_star',
  'fishing_rod',
  'fletching_table',
  'flint',
  'flint_and_steel',
  'flow_armor_trim_smithing_template',
  'flow_banner_pattern',
  'flow_pottery_sherd',
  'flower_banner_pattern',
  'flower_pot',
  'flowering_azalea',
  'flowering_azalea_leaves',
  'fox_spawn_egg',
  'friend_pottery_sherd',
  'frog_spawn_egg',
  'frogspawn',
  'furnace',
  'furnace_minecart',
  'ghast_spawn_egg',
  'ghast_tear',
  'gilded_blackstone',
  'glass',
  'glass_bottle',
  'glass_pane',
  'glistering_melon_slice',
  'globe_banner_pattern',
  'glow_berries',
  'glow_ink_sac',
  'glow_item_frame',
  'glow_lichen',
  'glow_squid_spawn_egg',
  'glowstone',
  'glowstone_dust',
  'goat_horn',
  'goat_spawn_egg',
  'gold_block',
  'gold_ingot',
  'gold_nugget',
  'gold_ore',
  'golden_apple',
  'golden_axe',
  'golden_boots',
  'golden_carrot',
  'golden_chestplate',
  'golden_helmet',
  'golden_hoe',
  'golden_horse_armor',
  'golden_leggings',
  'golden_pickaxe',
  'golden_shovel',
  'golden_sword',
  'granite',
  'granite_slab',
  'granite_stairs',
  'granite_wall',
  'grass_block',
  'gravel',
  'gray_banner',
  'gray_bed',
  'gray_bundle',
  'gray_candle',
  'gray_carpet',
  'gray_concrete',
  'gray_concrete_powder',
  'gray_dye',
  'gray_glazed_terracotta',
  'gray_harness',
  'gray_shulker_box',
  'gray_stained_glass',
  'gray_stained_glass_pane',
  'gray_terracotta',
  'gray_wool',
  'green_banner',
  'green_bed',
  'green_bundle',
  'green_candle',
  'green_carpet',
  'green_concrete',
  'green_concrete_powder',
  'green_dye',
  'green_glazed_terracotta',
  'green_harness',
  'green_shulker_box',
  'green_stained_glass',
  'green_stained_glass_pane',
  'green_terracotta',
  'green_wool',
  'grindstone',
  'guardian_spawn_egg',
  'gunpowder',
  'guster_banner_pattern',
  'guster_pottery_sherd',
  'hanging_roots',
  'happy_ghast_spawn_egg',
  'hay_block',
  'heart_of_the_sea',
  'heart_pottery_sherd',
  'heartbreak_pottery_sherd',
  'heavy_core',
  'heavy_weighted_pressure_plate',
  'hoglin_spawn_egg',
  'honey_block',
  'honey_bottle',
  'honeycomb',
  'honeycomb_block',
  'hopper',
  'hopper_minecart',
  'horn_coral',
  'horn_coral_block',
  'horn_coral_fan',
  'horse_spawn_egg',
  'host_armor_trim_smithing_template',
  'howl_pottery_sherd',
  'husk_spawn_egg',
  'ice',
  'infested_chiseled_stone_bricks',
  'infested_cobblestone',
  'infested_cracked_stone_bricks',
  'infested_deepslate',
  'infested_mossy_stone_bricks',
  'infested_stone',
  'infested_stone_bricks',
  'ink_sac',
  'iron_axe',
  'iron_bars',
  'iron_block',
  'iron_boots',
  'iron_chain',
  'iron_chestplate',
  'iron_door',
  'iron_golem_spawn_egg',
  'iron_helmet',
  'iron_hoe',
  'iron_horse_armor',
  'iron_ingot',
  'iron_leggings',
  'iron_nugget',
  'iron_ore',
  'iron_pickaxe',
  'iron_shovel',
  'iron_sword',
  'iron_trapdoor',
  'item_frame',
  'jack_o_lantern',
  'jigsaw',
  'jukebox',
  'jungle_boat',
  'jungle_button',
  'jungle_chest_boat',
  'jungle_door',
  'jungle_fence',
  'jungle_fence_gate',
  'jungle_hanging_sign',
  'jungle_leaves',
  'jungle_log',
  'jungle_planks',
  'jungle_pressure_plate',
  'jungle_sapling',
  'jungle_shelf',
  'jungle_sign',
  'jungle_slab',
  'jungle_stairs',
  'jungle_trapdoor',
  'jungle_wood',
  'kelp',
  'knowledge_book',
  'ladder',
  'lantern',
  'lapis_block',
  'lapis_lazuli',
  'lapis_ore',
  'large_amethyst_bud',
  'large_fern',
  'lava_bucket',
  'lead',
  'leaf_litter',
  'leather',
  'leather_boots',
  'leather_chestplate',
  'leather_helmet',
  'leather_horse_armor',
  'leather_leggings',
  'lectern',
  'lever',
  'light',
  'light_blue_banner',
  'light_blue_bed',
  'light_blue_bundle',
  'light_blue_candle',
  'light_blue_carpet',
  'light_blue_concrete',
  'light_blue_concrete_powder',
  'light_blue_dye',
  'light_blue_glazed_terracotta',
  'light_blue_harness',
  'light_blue_shulker_box',
  'light_blue_stained_glass',
  'light_blue_stained_glass_pane',
  'light_blue_terracotta',
  'light_blue_wool',
  'light_gray_banner',
  'light_gray_bed',
  'light_gray_bundle',
  'light_gray_candle',
  'light_gray_carpet',
  'light_gray_concrete',
  'light_gray_concrete_powder',
  'light_gray_dye',
  'light_gray_glazed_terracotta',
  'light_gray_harness',
  'light_gray_shulker_box',
  'light_gray_stained_glass',
  'light_gray_stained_glass_pane',
  'light_gray_terracotta',
  'light_gray_wool',
  'light_weighted_pressure_plate',
  'lightning_rod',
  'lilac',
  'lily_of_the_valley',
  'lily_pad',
  'lime_banner',
  'lime_bed',
  'lime_bundle',
  'lime_candle',
  'lime_carpet',
  'lime_concrete',
  'lime_concrete_powder',
  'lime_dye',
  'lime_glazed_terracotta',
  'lime_harness',
  'lime_shulker_box',
  'lime_stained_glass',
  'lime_stained_glass_pane',
  'lime_terracotta',
  'lime_wool',
  'lingering_potion',
  'llama_spawn_egg',
  'lodestone',
  'loom',
  'mace',
  'magenta_banner',
  'magenta_bed',
  'magenta_bundle',
  'magenta_candle',
  'magenta_carpet',
  'magenta_concrete',
  'magenta_concrete_powder',
  'magenta_dye',
  'magenta_glazed_terracotta',
  'magenta_harness',
  'magenta_shulker_box',
  'magenta_stained_glass',
  'magenta_stained_glass_pane',
  'magenta_terracotta',
  'magenta_wool',
  'magma_block',
  'magma_cream',
  'magma_cube_spawn_egg',
  'mangrove_boat',
  'mangrove_button',
  'mangrove_chest_boat',
  'mangrove_door',
  'mangrove_fence',
  'mangrove_fence_gate',
  'mangrove_hanging_sign',
  'mangrove_leaves',
  'mangrove_log',
  'mangrove_planks',
  'mangrove_pressure_plate',
  'mangrove_propagule',
  'mangrove_roots',
  'mangrove_shelf',
  'mangrove_sign',
  'mangrove_slab',
  'mangrove_stairs',
  'mangrove_trapdoor',
  'mangrove_wood',
  'map',
  'medium_amethyst_bud',
  'melon',
  'melon_seeds',
  'melon_slice',
  'milk_bucket',
  'minecart',
  'miner_pottery_sherd',
  'mojang_banner_pattern',
  'mooshroom_spawn_egg',
  'moss_block',
  'moss_carpet',
  'mossy_cobblestone',
  'mossy_cobblestone_slab',
  'mossy_cobblestone_stairs',
  'mossy_cobblestone_wall',
  'mossy_stone_brick_slab',
  'mossy_stone_brick_stairs',
  'mossy_stone_brick_wall',
  'mossy_stone_bricks',
  'mourner_pottery_sherd',
  'mud',
  'mud_brick_slab',
  'mud_brick_stairs',
  'mud_brick_wall',
  'mud_bricks',
  'muddy_mangrove_roots',
  'mule_spawn_egg',
  'mushroom_stem',
  'mushroom_stew',
  'music_disc_11',
  'music_disc_13',
  'music_disc_5',
  'music_disc_blocks',
  'music_disc_cat',
  'music_disc_chirp',
  'music_disc_creator',
  'music_disc_creator_music_box',
  'music_disc_far',
  'music_disc_lava_chicken',
  'music_disc_mall',
  'music_disc_mellohi',
  'music_disc_otherside',
  'music_disc_pigstep',
  'music_disc_precipice',
  'music_disc_relic',
  'music_disc_stal',
  'music_disc_strad',
  'music_disc_tears',
  'music_disc_wait',
  'music_disc_ward',
  'mutton',
  'mycelium',
  'name_tag',
  'nautilus_shell',
  'nether_brick',
  'nether_brick_fence',
  'nether_brick_slab',
  'nether_brick_stairs',
  'nether_brick_wall',
  'nether_bricks',
  'nether_gold_ore',
  'nether_quartz_ore',
  'nether_sprouts',
  'nether_star',
  'nether_wart',
  'nether_wart_block',
  'netherite_axe',
  'netherite_block',
  'netherite_boots',
  'netherite_chestplate',
  'netherite_helmet',
  'netherite_hoe',
  'netherite_ingot',
  'netherite_leggings',
  'netherite_pickaxe',
  'netherite_scrap',
  'netherite_shovel',
  'netherite_sword',
  'netherite_upgrade_smithing_template',
  'netherrack',
  'note_block',
  'oak_boat',
  'oak_button',
  'oak_chest_boat',
  'oak_door',
  'oak_fence',
  'oak_fence_gate',
  'oak_hanging_sign',
  'oak_leaves',
  'oak_log',
  'oak_planks',
  'oak_pressure_plate',
  'oak_sapling',
  'oak_shelf',
  'oak_sign',
  'oak_slab',
  'oak_stairs',
  'oak_trapdoor',
  'oak_wood',
  'observer',
  'obsidian',
  'ocelot_spawn_egg',
  'ochre_froglight',
  'ominous_bottle',
  'ominous_trial_key',
  'open_eyeblossom',
  'orange_banner',
  'orange_bed',
  'orange_bundle',
  'orange_candle',
  'orange_carpet',
  'orange_concrete',
  'orange_concrete_powder',
  'orange_dye',
  'orange_glazed_terracotta',
  'orange_harness',
  'orange_shulker_box',
  'orange_stained_glass',
  'orange_stained_glass_pane',
  'orange_terracotta',
  'orange_tulip',
  'orange_wool',
  'oxeye_daisy',
  'oxidized_chiseled_copper',
  'oxidized_copper',
  'oxidized_copper_bars',
  'oxidized_copper_bulb',
  'oxidized_copper_chain',
  'oxidized_copper_chest',
  'oxidized_copper_door',
  'oxidized_copper_golem_statue',
  'oxidized_copper_grate',
  'oxidized_copper_lantern',
  'oxidized_copper_trapdoor',
  'oxidized_cut_copper',
  'oxidized_cut_copper_slab',
  'oxidized_cut_copper_stairs',
  'oxidized_lightning_rod',
  'packed_ice',
  'packed_mud',
  'painting',
  'pale_hanging_moss',
  'pale_moss_block',
  'pale_moss_carpet',
  'pale_oak_boat',
  'pale_oak_button',
  'pale_oak_chest_boat',
  'pale_oak_door',
  'pale_oak_fence',
  'pale_oak_fence_gate',
  'pale_oak_hanging_sign',
  'pale_oak_leaves',
  'pale_oak_log',
  'pale_oak_planks',
  'pale_oak_pressure_plate',
  'pale_oak_sapling',
  'pale_oak_shelf',
  'pale_oak_sign',
  'pale_oak_slab',
  'pale_oak_stairs',
  'pale_oak_trapdoor',
  'pale_oak_wood',
  'panda_spawn_egg',
  'paper',
  'parrot_spawn_egg',
  'pearlescent_froglight',
  'peony',
  'petrified_oak_slab',
  'phantom_membrane',
  'phantom_spawn_egg',
  'pig_spawn_egg',
  'piglin_banner_pattern',
  'piglin_brute_spawn_egg',
  'piglin_head',
  'piglin_spawn_egg',
  'pillager_spawn_egg',
  'pink_banner',
  'pink_bed',
  'pink_bundle',
  'pink_candle',
  'pink_carpet',
  'pink_concrete',
  'pink_concrete_powder',
  'pink_dye',
  'pink_glazed_terracotta',
  'pink_harness',
  'pink_petals',
  'pink_shulker_box',
  'pink_stained_glass',
  'pink_stained_glass_pane',
  'pink_terracotta',
  'pink_tulip',
  'pink_wool',
  'piston',
  'pitcher_plant',
  'pitcher_pod',
  'player_head',
  'plenty_pottery_sherd',
  'podzol',
  'pointed_dripstone',
  'poisonous_potato',
  'polar_bear_spawn_egg',
  'polished_andesite',
  'polished_andesite_slab',
  'polished_andesite_stairs',
  'polished_basalt',
  'polished_blackstone',
  'polished_blackstone_brick_slab',
  'polished_blackstone_brick_stairs',
  'polished_blackstone_brick_wall',
  'polished_blackstone_bricks',
  'polished_blackstone_button',
  'polished_blackstone_pressure_plate',
  'polished_blackstone_slab',
  'polished_blackstone_stairs',
  'polished_blackstone_wall',
  'polished_deepslate',
  'polished_deepslate_slab',
  'polished_deepslate_stairs',
  'polished_deepslate_wall',
  'polished_diorite',
  'polished_diorite_slab',
  'polished_diorite_stairs',
  'polished_granite',
  'polished_granite_slab',
  'polished_granite_stairs',
  'polished_tuff',
  'polished_tuff_slab',
  'polished_tuff_stairs',
  'polished_tuff_wall',
  'popped_chorus_fruit',
  'poppy',
  'porkchop',
  'potato',
  'potion',
  'powder_snow_bucket',
  'powered_rail',
  'prismarine',
  'prismarine_brick_slab',
  'prismarine_brick_stairs',
  'prismarine_bricks',
  'prismarine_crystals',
  'prismarine_shard',
  'prismarine_slab',
  'prismarine_stairs',
  'prismarine_wall',
  'prize_pottery_sherd',
  'pufferfish',
  'pufferfish_bucket',
  'pufferfish_spawn_egg',
  'pumpkin',
  'pumpkin_pie',
  'pumpkin_seeds',
  'purple_banner',
  'purple_bed',
  'purple_bundle',
  'purple_candle',
  'purple_carpet',
  'purple_concrete',
  'purple_concrete_powder',
  'purple_dye',
  'purple_glazed_terracotta',
  'purple_harness',
  'purple_shulker_box',
  'purple_stained_glass',
  'purple_stained_glass_pane',
  'purple_terracotta',
  'purple_wool',
  'purpur_block',
  'purpur_pillar',
  'purpur_slab',
  'purpur_stairs',
  'quartz',
  'quartz_block',
  'quartz_bricks',
  'quartz_pillar',
  'quartz_slab',
  'quartz_stairs',
  'rabbit',
  'rabbit_foot',
  'rabbit_hide',
  'rabbit_spawn_egg',
  'rabbit_stew',
  'rail',
  'raiser_armor_trim_smithing_template',
  'ravager_spawn_egg',
  'raw_copper',
  'raw_copper_block',
  'raw_gold',
  'raw_gold_block',
  'raw_iron',
  'raw_iron_block',
  'recovery_compass',
  'red_banner',
  'red_bed',
  'red_bundle',
  'red_candle',
  'red_carpet',
  'red_concrete',
  'red_concrete_powder',
  'red_dye',
  'red_glazed_terracotta',
  'red_harness',
  'red_mushroom',
  'red_mushroom_block',
  'red_nether_brick_slab',
  'red_nether_brick_stairs',
  'red_nether_brick_wall',
  'red_nether_bricks',
  'red_sand',
  'red_sandstone',
  'red_sandstone_slab',
  'red_sandstone_stairs',
  'red_sandstone_wall',
  'red_shulker_box',
  'red_stained_glass',
  'red_stained_glass_pane',
  'red_terracotta',
  'red_tulip',
  'red_wool',
  'redstone',
  'redstone_block',
  'redstone_lamp',
  'redstone_ore',
  'redstone_torch',
  'reinforced_deepslate',
  'repeater',
  'repeating_command_block',
  'resin_block',
  'resin_brick',
  'resin_brick_slab',
  'resin_brick_stairs',
  'resin_brick_wall',
  'resin_bricks',
  'resin_clump',
  'respawn_anchor',
  'rib_armor_trim_smithing_template',
  'rooted_dirt',
  'rose_bush',
  'rotten_flesh',
  'saddle',
  'salmon',
  'salmon_bucket',
  'salmon_spawn_egg',
  'sand',
  'sandstone',
  'sandstone_slab',
  'sandstone_stairs',
  'sandstone_wall',
  'scaffolding',
  'scrape_pottery_sherd',
  'sculk',
  'sculk_catalyst',
  'sculk_sensor',
  'sculk_shrieker',
  'sculk_vein',
  'sea_lantern',
  'sea_pickle',
  'seagrass',
  'sentry_armor_trim_smithing_template',
  'shaper_armor_trim_smithing_template',
  'sheaf_pottery_sherd',
  'shears',
  'sheep_spawn_egg',
  'shelter_pottery_sherd',
  'shield',
  'short_dry_grass',
  'short_grass',
  'shroomlight',
  'shulker_box',
  'shulker_shell',
  'shulker_spawn_egg',
  'silence_armor_trim_smithing_template',
  'silverfish_spawn_egg',
  'skeleton_horse_spawn_egg',
  'skeleton_skull',
  'skeleton_spawn_egg',
  'skull_banner_pattern',
  'skull_pottery_sherd',
  'slime_ball',
  'slime_block',
  'slime_spawn_egg',
  'small_amethyst_bud',
  'small_dripleaf',
  'smithing_table',
  'smoker',
  'smooth_basalt',
  'smooth_quartz',
  'smooth_quartz_slab',
  'smooth_quartz_stairs',
  'smooth_red_sandstone',
  'smooth_red_sandstone_slab',
  'smooth_red_sandstone_stairs',
  'smooth_sandstone',
  'smooth_sandstone_slab',
  'smooth_sandstone_stairs',
  'smooth_stone',
  'smooth_stone_slab',
  'sniffer_egg',
  'sniffer_spawn_egg',
  'snort_pottery_sherd',
  'snout_armor_trim_smithing_template',
  'snow',
  'snow_block',
  'snow_golem_spawn_egg',
  'snowball',
  'soul_campfire',
  'soul_lantern',
  'soul_sand',
  'soul_soil',
  'soul_torch',
  'spawner',
  'spectral_arrow',
  'spider_eye',
  'spider_spawn_egg',
  'spire_armor_trim_smithing_template',
  'splash_potion',
  'sponge',
  'spore_blossom',
  'spruce_boat',
  'spruce_button',
  'spruce_chest_boat',
  'spruce_door',
  'spruce_fence',
  'spruce_fence_gate',
  'spruce_hanging_sign',
  'spruce_leaves',
  'spruce_log',
  'spruce_planks',
  'spruce_pressure_plate',
  'spruce_sapling',
  'spruce_shelf',
  'spruce_sign',
  'spruce_slab',
  'spruce_stairs',
  'spruce_trapdoor',
  'spruce_wood',
  'spyglass',
  'squid_spawn_egg',
  'stick',
  'sticky_piston',
  'stone',
  'stone_axe',
  'stone_brick_slab',
  'stone_brick_stairs',
  'stone_brick_wall',
  'stone_bricks',
  'stone_button',
  'stone_hoe',
  'stone_pickaxe',
  'stone_pressure_plate',
  'stone_shovel',
  'stone_slab',
  'stone_stairs',
  'stone_sword',
  'stonecutter',
  'stray_spawn_egg',
  'strider_spawn_egg',
  'string',
  'stripped_acacia_log',
  'stripped_acacia_wood',
  'stripped_bamboo_block',
  'stripped_birch_log',
  'stripped_birch_wood',
  'stripped_cherry_log',
  'stripped_cherry_wood',
  'stripped_crimson_hyphae',
  'stripped_crimson_stem',
  'stripped_dark_oak_log',
  'stripped_dark_oak_wood',
  'stripped_jungle_log',
  'stripped_jungle_wood',
  'stripped_mangrove_log',
  'stripped_mangrove_wood',
  'stripped_oak_log',
  'stripped_oak_wood',
  'stripped_pale_oak_log',
  'stripped_pale_oak_wood',
  'stripped_spruce_log',
  'stripped_spruce_wood',
  'stripped_warped_hyphae',
  'stripped_warped_stem',
  'structure_block',
  'structure_void',
  'sugar',
  'sugar_cane',
  'sunflower',
  'suspicious_gravel',
  'suspicious_sand',
  'suspicious_stew',
  'sweet_berries',
  'tadpole_bucket',
  'tadpole_spawn_egg',
  'tall_dry_grass',
  'tall_grass',
  'target',
  'terracotta',
  'test_block',
  'test_instance_block',
  'tide_armor_trim_smithing_template',
  'tinted_glass',
  'tipped_arrow',
  'tnt',
  'tnt_minecart',
  'torch',
  'torchflower',
  'torchflower_seeds',
  'totem_of_undying',
  'trader_llama_spawn_egg',
  'trapped_chest',
  'trial_key',
  'trial_spawner',
  'trident',
  'tripwire_hook',
  'tropical_fish',
  'tropical_fish_bucket',
  'tropical_fish_spawn_egg',
  'tube_coral',
  'tube_coral_block',
  'tube_coral_fan',
  'tuff',
  'tuff_brick_slab',
  'tuff_brick_stairs',
  'tuff_brick_wall',
  'tuff_bricks',
  'tuff_slab',
  'tuff_stairs',
  'tuff_wall',
  'turtle_egg',
  'turtle_helmet',
  'turtle_scute',
  'turtle_spawn_egg',
  'twisting_vines',
  'vault',
  'verdant_froglight',
  'vex_armor_trim_smithing_template',
  'vex_spawn_egg',
  'villager_spawn_egg',
  'vindicator_spawn_egg',
  'vine',
  'wandering_trader_spawn_egg',
  'ward_armor_trim_smithing_template',
  'warden_spawn_egg',
  'warped_button',
  'warped_door',
  'warped_fence',
  'warped_fence_gate',
  'warped_fungus',
  'warped_fungus_on_a_stick',
  'warped_hanging_sign',
  'warped_hyphae',
  'warped_nylium',
  'warped_planks',
  'warped_pressure_plate',
  'warped_roots',
  'warped_shelf',
  'warped_sign',
  'warped_slab',
  'warped_stairs',
  'warped_stem',
  'warped_trapdoor',
  'warped_wart_block',
  'water_bucket',
  'waxed_chiseled_copper',
  'waxed_copper_bars',
  'waxed_copper_block',
  'waxed_copper_bulb',
  'waxed_copper_chain',
  'waxed_copper_chest',
  'waxed_copper_door',
  'waxed_copper_golem_statue',
  'waxed_copper_grate',
  'waxed_copper_lantern',
  'waxed_copper_trapdoor',
  'waxed_cut_copper',
  'waxed_cut_copper_slab',
  'waxed_cut_copper_stairs',
  'waxed_exposed_chiseled_copper',
  'waxed_exposed_copper',
  'waxed_exposed_copper_bars',
  'waxed_exposed_copper_bulb',
  'waxed_exposed_copper_chain',
  'waxed_exposed_copper_chest',
  'waxed_exposed_copper_door',
  'waxed_exposed_copper_golem_statue',
  'waxed_exposed_copper_grate',
  'waxed_exposed_copper_lantern',
  'waxed_exposed_copper_trapdoor',
  'waxed_exposed_cut_copper',
  'waxed_exposed_cut_copper_slab',
  'waxed_exposed_cut_copper_stairs',
  'waxed_exposed_lightning_rod',
  'waxed_lightning_rod',
  'waxed_oxidized_chiseled_copper',
  'waxed_oxidized_copper',
  'waxed_oxidized_copper_bars',
  'waxed_oxidized_copper_bulb',
  'waxed_oxidized_copper_chain',
  'waxed_oxidized_copper_chest',
  'waxed_oxidized_copper_door',
  'waxed_oxidized_copper_golem_statue',
  'waxed_oxidized_copper_grate',
  'waxed_oxidized_copper_lantern',
  'waxed_oxidized_copper_trapdoor',
  'waxed_oxidized_cut_copper',
  'waxed_oxidized_cut_copper_slab',
  'waxed_oxidized_cut_copper_stairs',
  'waxed_oxidized_lightning_rod',
  'waxed_weathered_chiseled_copper',
  'waxed_weathered_copper',
  'waxed_weathered_copper_bars',
  'waxed_weathered_copper_bulb',
  'waxed_weathered_copper_chain',
  'waxed_weathered_copper_chest',
  'waxed_weathered_copper_door',
  'waxed_weathered_copper_golem_statue',
  'waxed_weathered_copper_grate',
  'waxed_weathered_copper_lantern',
  'waxed_weathered_copper_trapdoor',
  'waxed_weathered_cut_copper',
  'waxed_weathered_cut_copper_slab',
  'waxed_weathered_cut_copper_stairs',
  'waxed_weathered_lightning_rod',
  'wayfinder_armor_trim_smithing_template',
  'weathered_chiseled_copper',
  'weathered_copper',
  'weathered_copper_bars',
  'weathered_copper_bulb',
  'weathered_copper_chain',
  'weathered_copper_chest',
  'weathered_copper_door',
  'weathered_copper_golem_statue',
  'weathered_copper_grate',
  'weathered_copper_lantern',
  'weathered_copper_trapdoor',
  'weathered_cut_copper',
  'weathered_cut_copper_slab',
  'weathered_cut_copper_stairs',
  'weathered_lightning_rod',
  'weeping_vines',
  'wet_sponge',
  'wheat',
  'wheat_seeds',
  'white_banner',
  'white_bed',
  'white_bundle',
  'white_candle',
  'white_carpet',
  'white_concrete',
  'white_concrete_powder',
  'white_dye',
  'white_glazed_terracotta',
  'white_harness',
  'white_shulker_box',
  'white_stained_glass',
  'white_stained_glass_pane',
  'white_terracotta',
  'white_tulip',
  'white_wool',
  'wild_armor_trim_smithing_template',
  'wildflowers',
  'wind_charge',
  'witch_spawn_egg',
  'wither_rose',
  'wither_skeleton_skull',
  'wither_skeleton_spawn_egg',
  'wither_spawn_egg',
  'wolf_armor',
  'wolf_spawn_egg',
  'wooden_axe',
  'wooden_hoe',
  'wooden_pickaxe',
  'wooden_shovel',
  'wooden_sword',
  'writable_book',
  'written_book',
  'yellow_banner',
  'yellow_bed',
  'yellow_bundle',
  'yellow_candle',
  'yellow_carpet',
  'yellow_concrete',
  'yellow_concrete_powder',
  'yellow_dye',
  'yellow_glazed_terracotta',
  'yellow_harness',
  'yellow_shulker_box',
  'yellow_stained_glass',
  'yellow_stained_glass_pane',
  'yellow_terracotta',
  'yellow_wool',
  'zoglin_spawn_egg',
  'zombie_head',
  'zombie_horse_spawn_egg',
  'zombie_spawn_egg',
  'zombie_villager_spawn_egg',
  'zombified_piglin_spawn_egg'
] as const;

const MINECRAFT_GERMAN_NAMES: Record<string, string> = {
  'acacia_boat': 'Acacia boat',
  'acacia_button': 'AkazienKnopf',
  'acacia_chest_boat': 'Acacia chest boat',
  'acacia_door': 'AkazienTür',
  'acacia_fence': 'AkazienZaun',
  'acacia_fence_gate': 'AkazienZauntor',
  'acacia_hanging_sign': 'AkazienHängeschild',
  'acacia_leaves': 'AkazienLaub',
  'acacia_log': 'AkazienStamm',
  'acacia_planks': 'AkazienHolzbretter',
  'acacia_pressure_plate': 'AkazienDruckplatte',
  'acacia_sapling': 'AkazienSetzling',
  'acacia_shelf': 'AkazienRegal',
  'acacia_sign': 'AkazienSchild',
  'acacia_slab': 'AkazienStufe',
  'acacia_stairs': 'AkazienTreppe',
  'acacia_trapdoor': 'AkazienFalltür',
  'acacia_wood': 'AkazienHolz',
  'activator_rail': 'Aktivierungsschiene',
  'allay_spawn_egg': 'Hilfsgeist-Spawn-Ei',
  'allium': 'Allium',
  'amethyst_block': 'Amethystblock',
  'amethyst_cluster': 'Amethyst cluster',
  'amethyst_shard': 'Amethystscherbe',
  'ancient_debris': 'Antiker Schrott',
  'andesite': 'Andesit',
  'andesite_slab': 'Andesite stufe',
  'andesite_stairs': 'Andesite treppe',
  'andesite_wall': 'Andesite mauer',
  'angler_pottery_sherd': 'Angler pottery sherd',
  'anvil': 'Anvil',
  'apple': 'Apfel',
  'archer_pottery_sherd': 'Archer pottery sherd',
  'armadillo_scute': 'Armadillo scute',
  'armadillo_spawn_egg': 'Armadillo-Spawn-Ei',
  'armor_stand': 'Rüstungsständer',
  'arms_up_pottery_sherd': 'Arms up pottery sherd',
  'arrow': 'Pfeil',
  'axolotl_bucket': 'Axolotl bucket',
  'axolotl_spawn_egg': 'Axolotl-Spawn-Ei',
  'azalea': 'Azalea',
  'azalea_leaves': 'Azalea laub',
  'azure_bluet': 'Azure bluet',
  'baked_potato': 'Ofenkartoffel',
  'bamboo': 'Bamboo',
  'bamboo_block': 'BambusBlock',
  'bamboo_button': 'BambusKnopf',
  'bamboo_chest_raft': 'Bamboo chest raft',
  'bamboo_door': 'BambusTür',
  'bamboo_fence': 'BambusZaun',
  'bamboo_fence_gate': 'BambusZauntor',
  'bamboo_hanging_sign': 'BambusHängeschild',
  'bamboo_mosaic': 'Bamboo mosaic',
  'bamboo_mosaic_slab': 'Bamboo mosaic stufe',
  'bamboo_mosaic_stairs': 'Bamboo mosaic treppe',
  'bamboo_planks': 'BambusHolzbretter',
  'bamboo_pressure_plate': 'BambusDruckplatte',
  'bamboo_raft': 'Bamboo raft',
  'bamboo_shelf': 'BambusRegal',
  'bamboo_sign': 'BambusSchild',
  'bamboo_slab': 'BambusStufe',
  'bamboo_stairs': 'BambusTreppe',
  'bamboo_trapdoor': 'BambusFalltür',
  'barrel': 'Fass',
  'barrier': 'Barrier',
  'basalt': 'Basalt',
  'bat_spawn_egg': 'Fledermaus-Spawn-Ei',
  'beacon': 'Beacon',
  'bedrock': 'Grundgestein',
  'bee_nest': 'Bee nest',
  'bee_spawn_egg': 'Biene-Spawn-Ei',
  'beef': 'Rohes Rindfleisch',
  'beehive': 'Beehive',
  'beetroot': 'Rote Bete',
  'beetroot_seeds': 'Beetroot seeds',
  'beetroot_soup': 'Rote-Bete-Suppe',
  'bell': 'Glocke',
  'big_dripleaf': 'Big dripleaf',
  'birch_boat': 'Birch boat',
  'birch_button': 'BirkenKnopf',
  'birch_chest_boat': 'Birch chest boat',
  'birch_door': 'BirkenTür',
  'birch_fence': 'BirkenZaun',
  'birch_fence_gate': 'BirkenZauntor',
  'birch_hanging_sign': 'BirkenHängeschild',
  'birch_leaves': 'BirkenLaub',
  'birch_log': 'BirkenStamm',
  'birch_planks': 'BirkenHolzbretter',
  'birch_pressure_plate': 'BirkenDruckplatte',
  'birch_sapling': 'BirkenSetzling',
  'birch_shelf': 'BirkenRegal',
  'birch_sign': 'BirkenSchild',
  'birch_slab': 'BirkenStufe',
  'birch_stairs': 'BirkenTreppe',
  'birch_trapdoor': 'BirkenFalltür',
  'birch_wood': 'BirkenHolz',
  'black_banner': 'Schwarz banner',
  'black_bed': 'Schwarz bett',
  'black_bundle': 'Schwarz bundle',
  'black_candle': 'Schwarz kerze',
  'black_carpet': 'Schwarz teppich',
  'black_concrete': 'Schwarz beton',
  'black_concrete_powder': 'Schwarz beton powder',
  'black_dye': 'Schwarz farbstoff',
  'black_glazed_terracotta': 'Schwarz glazed keramik',
  'black_harness': 'Schwarz harness',
  'black_shulker_box': 'Schwarz shulker box',
  'black_stained_glass': 'Schwarz stained glas',
  'black_stained_glass_pane': 'Schwarz stained glas pane',
  'black_terracotta': 'Schwarz keramik',
  'black_wool': 'Schwarz wolle',
  'blackstone': 'Schwarzstein',
  'blackstone_slab': 'Schwarzstein stufe',
  'blackstone_stairs': 'Schwarzstein treppe',
  'blackstone_wall': 'Schwarzstein mauer',
  'blade_pottery_sherd': 'Blade pottery sherd',
  'blast_furnace': 'Schmelzofen',
  'blaze_powder': 'Lohenstaub',
  'blaze_rod': 'Lohenrute',
  'blaze_spawn_egg': 'Lohe-Spawn-Ei',
  'blue_banner': 'Blau banner',
  'blue_bed': 'Blau bett',
  'blue_bundle': 'Blau bundle',
  'blue_candle': 'Blau kerze',
  'blue_carpet': 'Blau teppich',
  'blue_concrete': 'Blau beton',
  'blue_concrete_powder': 'Blau beton powder',
  'blue_dye': 'Blau farbstoff',
  'blue_egg': 'Blau ei',
  'blue_glazed_terracotta': 'Blau glazed keramik',
  'blue_harness': 'Blau harness',
  'blue_ice': 'Blau ice',
  'blue_orchid': 'Blau orchid',
  'blue_shulker_box': 'Blau shulker box',
  'blue_stained_glass': 'Blau stained glas',
  'blue_stained_glass_pane': 'Blau stained glas pane',
  'blue_terracotta': 'Blau keramik',
  'blue_wool': 'Blau wolle',
  'bogged_spawn_egg': 'Bogged-Spawn-Ei',
  'bolt_armor_trim_smithing_template': 'Bolt armor trim smithing template',
  'bone': 'Knochen',
  'bone_block': 'Bone block',
  'bone_meal': 'Knochenmehl',
  'book': 'Buch',
  'bookshelf': 'Bookshelf',
  'bordure_indented_banner_pattern': 'Bordure indented banner pattern',
  'bow': 'Bogen',
  'bowl': 'Bowl',
  'brain_coral': 'Brain coral',
  'brain_coral_block': 'Brain coral block',
  'brain_coral_fan': 'Brain coral fan',
  'bread': 'Brot',
  'breeze_rod': 'Breeze rod',
  'breeze_spawn_egg': 'Breeze-Spawn-Ei',
  'brewer_pottery_sherd': 'Brewer pottery sherd',
  'brewing_stand': 'Braustand',
  'brick': 'Brick',
  'brick_slab': 'Ziegel stufe',
  'brick_stairs': 'Ziegel treppe',
  'brick_wall': 'Ziegel mauer',
  'bricks': 'Bricks',
  'brown_banner': 'Braun banner',
  'brown_bed': 'Braun bett',
  'brown_bundle': 'Braun bundle',
  'brown_candle': 'Braun kerze',
  'brown_carpet': 'Braun teppich',
  'brown_concrete': 'Braun beton',
  'brown_concrete_powder': 'Braun beton powder',
  'brown_dye': 'Braun farbstoff',
  'brown_egg': 'Braun ei',
  'brown_glazed_terracotta': 'Braun glazed keramik',
  'brown_harness': 'Braun harness',
  'brown_mushroom': 'Braun mushroom',
  'brown_mushroom_block': 'Braun mushroom block',
  'brown_shulker_box': 'Braun shulker box',
  'brown_stained_glass': 'Braun stained glas',
  'brown_stained_glass_pane': 'Braun stained glas pane',
  'brown_terracotta': 'Braun keramik',
  'brown_wool': 'Braun wolle',
  'brush': 'Brush',
  'bubble_coral': 'Bubble coral',
  'bubble_coral_block': 'Bubble coral block',
  'bubble_coral_fan': 'Bubble coral fan',
  'bucket': 'Bucket',
  'budding_amethyst': 'Knospender Amethyst',
  'bundle': 'Bundle',
  'burn_pottery_sherd': 'Burn pottery sherd',
  'bush': 'Bush',
  'cactus': 'Kaktus',
  'cactus_flower': 'Kaktus blume',
  'cake': 'Kuchen',
  'calcite': 'Kalzit',
  'calibrated_sculk_sensor': 'Calibrated sculk sensor',
  'camel_spawn_egg': 'Kamel-Spawn-Ei',
  'campfire': 'Lagerfeuer',
  'candle': 'Kerze',
  'carrot': 'Karotte',
  'carrot_on_a_stick': 'Carrot on a stick',
  'cartography_table': 'Kartentisch',
  'carved_pumpkin': 'Carved pumpkin',
  'cat_spawn_egg': 'Katze-Spawn-Ei',
  'cauldron': 'Cauldron',
  'cave_spider_spawn_egg': 'Cave Spider-Spawn-Ei',
  'chain': 'Kette',
  'chain_command_block': 'Kette command block',
  'chainmail_boots': 'Kettenstiefel',
  'chainmail_chestplate': 'Kettenharnisch',
  'chainmail_helmet': 'Kettenhelm',
  'chainmail_leggings': 'Kettenbeinschutz',
  'charcoal': 'Holzkohle',
  'cherry_boat': 'Cherry boat',
  'cherry_button': 'KirschKnopf',
  'cherry_chest_boat': 'Cherry chest boat',
  'cherry_door': 'KirschTür',
  'cherry_fence': 'KirschZaun',
  'cherry_fence_gate': 'KirschZauntor',
  'cherry_hanging_sign': 'KirschHängeschild',
  'cherry_leaves': 'KirschLaub',
  'cherry_log': 'KirschStamm',
  'cherry_planks': 'KirschHolzbretter',
  'cherry_pressure_plate': 'KirschDruckplatte',
  'cherry_sapling': 'KirschSetzling',
  'cherry_shelf': 'KirschRegal',
  'cherry_sign': 'KirschSchild',
  'cherry_slab': 'KirschStufe',
  'cherry_stairs': 'KirschTreppe',
  'cherry_trapdoor': 'KirschFalltür',
  'cherry_wood': 'KirschHolz',
  'chest': 'Truhe',
  'chest_minecart': 'Truhenlore',
  'chicken': 'Rohes Hühnchen',
  'chicken_spawn_egg': 'Huhn-Spawn-Ei',
  'chipped_anvil': 'Chipped anvil',
  'chiseled_bookshelf': 'Gemeißelt bookshelf',
  'chiseled_copper': 'Gemeißelt copper',
  'chiseled_deepslate': 'Gemeißelt deepslate',
  'chiseled_nether_bricks': 'Gemeißelt nether ziegel',
  'chiseled_polished_blackstone': 'Gemeißelt poliert schwarzstein',
  'chiseled_quartz_block': 'Gemeißelt quarz block',
  'chiseled_red_sandstone': 'Gemeißelt red sandstein',
  'chiseled_resin_bricks': 'Gemeißelt harz ziegel',
  'chiseled_sandstone': 'Gemeißelt sandstein',
  'chiseled_stone_bricks': 'Gemeißelt stein ziegel',
  'chiseled_tuff': 'Gemeißelt tuff',
  'chiseled_tuff_bricks': 'Gemeißelt tuff ziegel',
  'chorus_flower': 'Chorus blume',
  'chorus_fruit': 'Chorus fruit',
  'chorus_plant': 'Chorus plant',
  'clay': 'Clay',
  'clay_ball': 'Clay ball',
  'clock': 'Uhr',
  'closed_eyeblossom': 'Closed eyeblossom',
  'coal': 'Kohle',
  'coal_block': 'Kohleblock',
  'coal_ore': 'Steinkohleerz',
  'coarse_dirt': 'Grobe Erde',
  'coast_armor_trim_smithing_template': 'Coast armor trim smithing template',
  'cobbled_deepslate': 'Bruchtiefenschiefer',
  'cobbled_deepslate_slab': 'Cobbled deepslate stufe',
  'cobbled_deepslate_stairs': 'Cobbled deepslate treppe',
  'cobbled_deepslate_wall': 'Cobbled deepslate mauer',
  'cobblestone': 'Bruchstein',
  'cobblestone_slab': 'Cobblestone stufe',
  'cobblestone_stairs': 'Cobblestone treppe',
  'cobblestone_wall': 'Cobblestone mauer',
  'cobweb': 'Spinnennetz',
  'cocoa_beans': 'Kakaobohnen',
  'cod': 'Kabeljau',
  'cod_bucket': 'Cod bucket',
  'cod_spawn_egg': 'Cod-Spawn-Ei',
  'command_block': 'Command block',
  'command_block_minecart': 'Command block minecart',
  'comparator': 'Redstone-Komparator',
  'compass': 'Kompass',
  'composter': 'Composter',
  'conduit': 'Aquisator',
  'cooked_beef': 'Steak',
  'cooked_chicken': 'Gebratenes Hühnchen',
  'cooked_cod': 'Gebratener Kabeljau',
  'cooked_mutton': 'Gebratenes Hammelfleisch',
  'cooked_porkchop': 'Gebratenes Schweinefleisch',
  'cooked_rabbit': 'Gebratenes Kaninchenfleisch',
  'cooked_salmon': 'Gebratener Lachs',
  'cookie': 'Keks',
  'copper_axe': 'Copper axe',
  'copper_bars': 'Copper bars',
  'copper_block': 'Kupferblock',
  'copper_boots': 'Copper boots',
  'copper_bulb': 'Copper bulb',
  'copper_chain': 'Copper kette',
  'copper_chest': 'Copper chest',
  'copper_chestplate': 'Copper chestplate',
  'copper_door': 'Copper tür',
  'copper_golem_spawn_egg': 'Copper Golem-Spawn-Ei',
  'copper_golem_statue': 'Copper golem statue',
  'copper_grate': 'Copper grate',
  'copper_helmet': 'Copper helmet',
  'copper_hoe': 'Copper hoe',
  'copper_horse_armor': 'Copper horse armor',
  'copper_ingot': 'Kupferbarren',
  'copper_lantern': 'Copper laterne',
  'copper_leggings': 'Copper leiings',
  'copper_nugget': 'Copper nugget',
  'copper_ore': 'Kupfererz',
  'copper_pickaxe': 'Copper pickaxe',
  'copper_shovel': 'Copper shovel',
  'copper_sword': 'Copper sword',
  'copper_torch': 'Copper fackel',
  'copper_trapdoor': 'Copper falltür',
  'cornflower': 'Cornflower',
  'cow_spawn_egg': 'Kuh-Spawn-Ei',
  'cracked_deepslate_bricks': 'Rissig deepslate ziegel',
  'cracked_deepslate_tiles': 'Rissig deepslate tiles',
  'cracked_nether_bricks': 'Rissig nether ziegel',
  'cracked_polished_blackstone_bricks': 'Rissig poliert schwarzstein ziegel',
  'cracked_stone_bricks': 'Rissig stein ziegel',
  'crafter': 'Werker',
  'crafting_table': 'Werkbank',
  'creaking_heart': 'Creaking heart',
  'creaking_spawn_egg': 'Kreischer-Spawn-Ei',
  'creeper_banner_pattern': 'Creeper banner pattern',
  'creeper_head': 'Creeper head',
  'creeper_spawn_egg': 'Creeper-Spawn-Ei',
  'crimson_button': 'KarmesinKnopf',
  'crimson_door': 'KarmesinTür',
  'crimson_fence': 'KarmesinZaun',
  'crimson_fence_gate': 'KarmesinZauntor',
  'crimson_fungus': 'Crimson fungus',
  'crimson_hanging_sign': 'KarmesinHängeschild',
  'crimson_hyphae': 'Crimson hyphae',
  'crimson_nylium': 'Karmesin-Nylium',
  'crimson_planks': 'KarmesinHolzbretter',
  'crimson_pressure_plate': 'KarmesinDruckplatte',
  'crimson_roots': 'Crimson roots',
  'crimson_shelf': 'KarmesinRegal',
  'crimson_sign': 'KarmesinSchild',
  'crimson_slab': 'KarmesinStufe',
  'crimson_stairs': 'KarmesinTreppe',
  'crimson_stem': 'Crimson stem',
  'crimson_trapdoor': 'KarmesinFalltür',
  'crossbow': 'Armbrust',
  'crying_obsidian': 'Weinender Obsidian',
  'cut_copper': 'Geschnitten copper',
  'cut_copper_slab': 'Geschnitten copper stufe',
  'cut_copper_stairs': 'Geschnitten copper treppe',
  'cut_red_sandstone': 'Geschnitten red sandstein',
  'cut_red_sandstone_slab': 'Geschnitten red sandstein stufe',
  'cut_sandstone': 'Geschnitten sandstein',
  'cut_sandstone_slab': 'Geschnitten sandstein stufe',
  'cyan_banner': 'Türkis banner',
  'cyan_bed': 'Türkis bett',
  'cyan_bundle': 'Türkis bundle',
  'cyan_candle': 'Türkis kerze',
  'cyan_carpet': 'Türkis teppich',
  'cyan_concrete': 'Türkis beton',
  'cyan_concrete_powder': 'Türkis beton powder',
  'cyan_dye': 'Türkis farbstoff',
  'cyan_glazed_terracotta': 'Türkis glazed keramik',
  'cyan_harness': 'Türkis harness',
  'cyan_shulker_box': 'Türkis shulker box',
  'cyan_stained_glass': 'Türkis stained glas',
  'cyan_stained_glass_pane': 'Türkis stained glas pane',
  'cyan_terracotta': 'Türkis keramik',
  'cyan_wool': 'Türkis wolle',
  'damaged_anvil': 'Damaged anvil',
  'dandelion': 'Dandelion',
  'danger_pottery_sherd': 'Danger pottery sherd',
  'dark_oak_boat': 'Dark oak boat',
  'dark_oak_button': 'Dark oak knopf',
  'dark_oak_chest_boat': 'Dark oak chest boat',
  'dark_oak_door': 'Dark oak tür',
  'dark_oak_fence': 'Dark oak zaun',
  'dark_oak_fence_gate': 'Dark oak zaun gate',
  'dark_oak_hanging_sign': 'Dark oak hanging schild',
  'dark_oak_leaves': 'Dark oak laub',
  'dark_oak_log': 'Dark oak stamm',
  'dark_oak_planks': 'Dark oak holzbretter',
  'dark_oak_pressure_plate': 'Dark oak pressure plate',
  'dark_oak_sapling': 'Dark oak setzling',
  'dark_oak_shelf': 'Dark oak regal',
  'dark_oak_sign': 'Dark oak schild',
  'dark_oak_slab': 'Dark oak stufe',
  'dark_oak_stairs': 'Dark oak treppe',
  'dark_oak_trapdoor': 'Dark oak falltür',
  'dark_oak_wood': 'Dark oak holz',
  'dark_prismarine': 'Dark prismarin',
  'dark_prismarine_slab': 'Dark prismarin stufe',
  'dark_prismarine_stairs': 'Dark prismarin treppe',
  'daylight_detector': 'Daylight detector',
  'dead_brain_coral': 'Dead brain coral',
  'dead_brain_coral_block': 'Dead brain coral block',
  'dead_brain_coral_fan': 'Dead brain coral fan',
  'dead_bubble_coral': 'Dead bubble coral',
  'dead_bubble_coral_block': 'Dead bubble coral block',
  'dead_bubble_coral_fan': 'Dead bubble coral fan',
  'dead_bush': 'Dead bush',
  'dead_fire_coral': 'Dead fire coral',
  'dead_fire_coral_block': 'Dead fire coral block',
  'dead_fire_coral_fan': 'Dead fire coral fan',
  'dead_horn_coral': 'Dead horn coral',
  'dead_horn_coral_block': 'Dead horn coral block',
  'dead_horn_coral_fan': 'Dead horn coral fan',
  'dead_tube_coral': 'Dead tube coral',
  'dead_tube_coral_block': 'Dead tube coral block',
  'dead_tube_coral_fan': 'Dead tube coral fan',
  'debug_stick': 'Debug stick',
  'decorated_pot': 'Decorated pot',
  'deepslate': 'Tiefenschiefer',
  'deepslate_brick_slab': 'Deepslate ziegel stufe',
  'deepslate_brick_stairs': 'Deepslate ziegel treppe',
  'deepslate_brick_wall': 'Deepslate ziegel mauer',
  'deepslate_bricks': 'Deepslate ziegel',
  'deepslate_coal_ore': 'Deepslate coal erz',
  'deepslate_copper_ore': 'Deepslate copper erz',
  'deepslate_diamond_ore': 'Deepslate diamond erz',
  'deepslate_emerald_ore': 'Deepslate emerald erz',
  'deepslate_gold_ore': 'Deepslate gold erz',
  'deepslate_iron_ore': 'Deepslate iron erz',
  'deepslate_lapis_ore': 'Deepslate lapis erz',
  'deepslate_redstone_ore': 'Deepslate redstone erz',
  'deepslate_tile_slab': 'Deepslate tile stufe',
  'deepslate_tile_stairs': 'Deepslate tile treppe',
  'deepslate_tile_wall': 'Deepslate tile mauer',
  'deepslate_tiles': 'Deepslate tiles',
  'detector_rail': 'Sensorschiene',
  'diamond': 'Diamant',
  'diamond_axe': 'Diamantaxt',
  'diamond_block': 'Diamantblock',
  'diamond_boots': 'Diamantstiefel',
  'diamond_chestplate': 'Diamantharnisch',
  'diamond_helmet': 'Diamanthelm',
  'diamond_hoe': 'Diamanthacke',
  'diamond_horse_armor': 'Diamond horse armor',
  'diamond_leggings': 'Diamantbeinschutz',
  'diamond_ore': 'Diamanterz',
  'diamond_pickaxe': 'Diamantspitzhacke',
  'diamond_shovel': 'Diamantschaufel',
  'diamond_sword': 'Diamantschwert',
  'diorite': 'Diorit',
  'diorite_slab': 'Diorite stufe',
  'diorite_stairs': 'Diorite treppe',
  'diorite_wall': 'Diorite mauer',
  'dirt': 'Erde',
  'dirt_path': 'Dirt path',
  'disc_fragment_5': 'Plattenfragment',
  'dispenser': 'Werfer',
  'dolphin_spawn_egg': 'Delfin-Spawn-Ei',
  'donkey_spawn_egg': 'Esel-Spawn-Ei',
  'dragon_breath': 'Drachenatem',
  'dragon_egg': 'Dragon ei',
  'dragon_head': 'Dragon head',
  'dried_ghast': 'Dried ghast',
  'dried_kelp': 'Getrockneter Seetang',
  'dried_kelp_block': 'Dried seetang block',
  'dripstone_block': 'Tropfsteinblock',
  'dropper': 'Spender',
  'drowned_spawn_egg': 'Ertrunkener-Spawn-Ei',
  'dune_armor_trim_smithing_template': 'Dune armor trim smithing template',
  'echo_shard': 'Echopartikel',
  'egg': 'Ei',
  'elder_guardian_spawn_egg': 'Großer Wächter-Spawn-Ei',
  'elytra': 'Elytren',
  'emerald': 'Smaragd',
  'emerald_block': 'Emerald block',
  'emerald_ore': 'Smaragderz',
  'enchanted_book': 'Enchanted book',
  'enchanted_golden_apple': 'Verzauberter goldener Apfel',
  'enchanting_table': 'Enchanting table',
  'end_crystal': 'End crystal',
  'end_portal_frame': 'Endportalrahmen',
  'end_rod': 'Endstab',
  'end_stone': 'End stein',
  'end_stone_brick_slab': 'End stein ziegel stufe',
  'end_stone_brick_stairs': 'End stein ziegel treppe',
  'end_stone_brick_wall': 'End stein ziegel mauer',
  'end_stone_bricks': 'End stein ziegel',
  'ender_chest': 'Endertruhe',
  'ender_dragon_spawn_egg': 'Enderdrache-Spawn-Ei',
  'ender_eye': 'Enderauge',
  'ender_pearl': 'Enderperle',
  'enderman_spawn_egg': 'Enderman-Spawn-Ei',
  'endermite_spawn_egg': 'Endermite-Spawn-Ei',
  'evoker_spawn_egg': 'Magier-Spawn-Ei',
  'experience_bottle': 'Erfahrungsfläschchen',
  'explorer_pottery_sherd': 'Explorer pottery sherd',
  'exposed_chiseled_copper': 'Exposed gemeißelt copper',
  'exposed_copper': 'Exposed copper',
  'exposed_copper_bars': 'Exposed copper bars',
  'exposed_copper_bulb': 'Exposed copper bulb',
  'exposed_copper_chain': 'Exposed copper kette',
  'exposed_copper_chest': 'Exposed copper chest',
  'exposed_copper_door': 'Exposed copper tür',
  'exposed_copper_golem_statue': 'Exposed copper golem statue',
  'exposed_copper_grate': 'Exposed copper grate',
  'exposed_copper_lantern': 'Exposed copper laterne',
  'exposed_copper_trapdoor': 'Exposed copper falltür',
  'exposed_cut_copper': 'Exposed geschnitten copper',
  'exposed_cut_copper_slab': 'Exposed geschnitten copper stufe',
  'exposed_cut_copper_stairs': 'Exposed geschnitten copper treppe',
  'exposed_lightning_rod': 'Exposed lightning rod',
  'eye_armor_trim_smithing_template': 'Eye armor trim smithing template',
  'farmland': 'Farmland',
  'feather': 'Feder',
  'fermented_spider_eye': 'Fermented spider eye',
  'fern': 'Farn',
  'field_masoned_banner_pattern': 'Field masoned banner pattern',
  'filled_map': 'Filled map',
  'fire_charge': 'Fire charge',
  'fire_coral': 'Fire coral',
  'fire_coral_block': 'Fire coral block',
  'fire_coral_fan': 'Fire coral fan',
  'firefly_bush': 'Firefly bush',
  'firework_rocket': 'Feuerwerksrakete',
  'firework_star': 'Feuerwerksstern',
  'fishing_rod': 'Fishing rod',
  'fletching_table': 'Befiederungstisch',
  'flint': 'Feuerstein',
  'flint_and_steel': 'Feuerzeug',
  'flow_armor_trim_smithing_template': 'Flow armor trim smithing template',
  'flow_banner_pattern': 'Flow banner pattern',
  'flow_pottery_sherd': 'Flow pottery sherd',
  'flower_banner_pattern': 'Blume banner pattern',
  'flower_pot': 'Blumentopf',
  'flowering_azalea': 'Flowering azalea',
  'flowering_azalea_leaves': 'Flowering azalea laub',
  'fox_spawn_egg': 'Fuchs-Spawn-Ei',
  'friend_pottery_sherd': 'Friend pottery sherd',
  'frog_spawn_egg': 'Frosch-Spawn-Ei',
  'frogspawn': 'Frogspawn',
  'furnace': 'Furnace',
  'furnace_minecart': 'Ofenlore',
  'ghast_spawn_egg': 'Ghast-Spawn-Ei',
  'ghast_tear': 'Ghast-Träne',
  'gilded_blackstone': 'Gilded schwarzstein',
  'glass': 'Glas',
  'glass_bottle': 'Glas bottle',
  'glass_pane': 'Glasscheibe',
  'glistering_melon_slice': 'Glistering melon slice',
  'globe_banner_pattern': 'Globe banner pattern',
  'glow_berries': 'Leuchtbeeren',
  'glow_ink_sac': 'Leuchttintenbeutel',
  'glow_item_frame': 'Leuchtrahmen',
  'glow_lichen': 'Glow flechte',
  'glow_squid_spawn_egg': 'Leuchttintenfisch-Spawn-Ei',
  'glowstone': 'Glowstone',
  'glowstone_dust': 'Leuchtsteinstaub',
  'goat_horn': 'Goat horn',
  'goat_spawn_egg': 'Ziege-Spawn-Ei',
  'gold_block': 'Goldblock',
  'gold_ingot': 'Goldbarren',
  'gold_nugget': 'Goldklumpen',
  'gold_ore': 'Golderz',
  'golden_apple': 'Goldener Apfel',
  'golden_axe': 'Goldaxt',
  'golden_boots': 'Goldstiefel',
  'golden_carrot': 'Goldene Karotte',
  'golden_chestplate': 'Goldharnisch',
  'golden_helmet': 'Goldhelm',
  'golden_hoe': 'Goldhacke',
  'golden_horse_armor': 'Golden horse armor',
  'golden_leggings': 'Goldbeinschutz',
  'golden_pickaxe': 'Goldspitzhacke',
  'golden_shovel': 'Goldschaufel',
  'golden_sword': 'Goldschwert',
  'granite': 'Granit',
  'granite_slab': 'Granite stufe',
  'granite_stairs': 'Granite treppe',
  'granite_wall': 'Granite mauer',
  'grass_block': 'Grasblock',
  'gravel': 'Kies',
  'gray_banner': 'Grau banner',
  'gray_bed': 'Grau bett',
  'gray_bundle': 'Grau bundle',
  'gray_candle': 'Grau kerze',
  'gray_carpet': 'Grau teppich',
  'gray_concrete': 'Grau beton',
  'gray_concrete_powder': 'Grau beton powder',
  'gray_dye': 'Grau farbstoff',
  'gray_glazed_terracotta': 'Grau glazed keramik',
  'gray_harness': 'Grau harness',
  'gray_shulker_box': 'Grau shulker box',
  'gray_stained_glass': 'Grau stained glas',
  'gray_stained_glass_pane': 'Grau stained glas pane',
  'gray_terracotta': 'Grau keramik',
  'gray_wool': 'Grau wolle',
  'green_banner': 'Grün banner',
  'green_bed': 'Grün bett',
  'green_bundle': 'Grün bundle',
  'green_candle': 'Grün kerze',
  'green_carpet': 'Grün teppich',
  'green_concrete': 'Grün beton',
  'green_concrete_powder': 'Grün beton powder',
  'green_dye': 'Grün farbstoff',
  'green_glazed_terracotta': 'Grün glazed keramik',
  'green_harness': 'Grün harness',
  'green_shulker_box': 'Grün shulker box',
  'green_stained_glass': 'Grün stained glas',
  'green_stained_glass_pane': 'Grün stained glas pane',
  'green_terracotta': 'Grün keramik',
  'green_wool': 'Grün wolle',
  'grindstone': 'Schleifstein',
  'guardian_spawn_egg': 'Wächter-Spawn-Ei',
  'gunpowder': 'Schwarzpulver',
  'guster_banner_pattern': 'Guster banner pattern',
  'guster_pottery_sherd': 'Guster pottery sherd',
  'hanging_roots': 'Hanging roots',
  'happy_ghast_spawn_egg': 'Happy Ghast-Spawn-Ei',
  'hay_block': 'Hay block',
  'heart_of_the_sea': 'Herz des Meeres',
  'heart_pottery_sherd': 'Heart pottery sherd',
  'heartbreak_pottery_sherd': 'Heartbreak pottery sherd',
  'heavy_core': 'Schwerer Kern',
  'heavy_weighted_pressure_plate': 'Heavy weighted pressure plate',
  'hoglin_spawn_egg': 'Hoglin-Spawn-Ei',
  'honey_block': 'Honey block',
  'honey_bottle': 'Honigflasche',
  'honeycomb': 'Honigwabe',
  'honeycomb_block': 'Honeycomb block',
  'hopper': 'Trichter',
  'hopper_minecart': 'Trichterlore',
  'horn_coral': 'Horn coral',
  'horn_coral_block': 'Horn coral block',
  'horn_coral_fan': 'Horn coral fan',
  'horse_spawn_egg': 'Pferd-Spawn-Ei',
  'host_armor_trim_smithing_template': 'Host armor trim smithing template',
  'howl_pottery_sherd': 'Howl pottery sherd',
  'husk_spawn_egg': 'Wüstenzombie-Spawn-Ei',
  'ice': 'Ice',
  'infested_chiseled_stone_bricks': 'Infested gemeißelt stein ziegel',
  'infested_cobblestone': 'Infested cobblestone',
  'infested_cracked_stone_bricks': 'Infested rissig stein ziegel',
  'infested_deepslate': 'Infested deepslate',
  'infested_mossy_stone_bricks': 'Infested moosig stein ziegel',
  'infested_stone': 'Infested stein',
  'infested_stone_bricks': 'Infested stein ziegel',
  'ink_sac': 'Tintenbeutel',
  'iron_axe': 'Eisenaxt',
  'iron_bars': 'Iron bars',
  'iron_block': 'Eisenblock',
  'iron_boots': 'Eisenstiefel',
  'iron_chain': 'Iron kette',
  'iron_chestplate': 'Eisenharnisch',
  'iron_door': 'Iron tür',
  'iron_golem_spawn_egg': 'Eisengolem-Spawn-Ei',
  'iron_helmet': 'Eisenhelm',
  'iron_hoe': 'Eisenhacke',
  'iron_horse_armor': 'Iron horse armor',
  'iron_ingot': 'Eisenbarren',
  'iron_leggings': 'Eisenbeinschutz',
  'iron_nugget': 'Eisenklumpen',
  'iron_ore': 'Eisenerz',
  'iron_pickaxe': 'Eisenspitzhacke',
  'iron_shovel': 'Eisenschaufel',
  'iron_sword': 'Eisenschwert',
  'iron_trapdoor': 'Iron falltür',
  'item_frame': 'Rahmen',
  'jack_o_lantern': 'Jack o laterne',
  'jigsaw': 'Jigsaw',
  'jukebox': 'Plattenspieler',
  'jungle_boat': 'Jungle boat',
  'jungle_button': 'TropenholzKnopf',
  'jungle_chest_boat': 'Jungle chest boat',
  'jungle_door': 'TropenholzTür',
  'jungle_fence': 'TropenholzZaun',
  'jungle_fence_gate': 'TropenholzZauntor',
  'jungle_hanging_sign': 'TropenholzHängeschild',
  'jungle_leaves': 'TropenholzLaub',
  'jungle_log': 'TropenholzStamm',
  'jungle_planks': 'TropenholzHolzbretter',
  'jungle_pressure_plate': 'TropenholzDruckplatte',
  'jungle_sapling': 'TropenholzSetzling',
  'jungle_shelf': 'TropenholzRegal',
  'jungle_sign': 'TropenholzSchild',
  'jungle_slab': 'TropenholzStufe',
  'jungle_stairs': 'TropenholzTreppe',
  'jungle_trapdoor': 'TropenholzFalltür',
  'jungle_wood': 'TropenholzHolz',
  'kelp': 'Seetang',
  'knowledge_book': 'Knowledge book',
  'ladder': 'Ladder',
  'lantern': 'Laterne',
  'lapis_block': 'Lapis block',
  'lapis_lazuli': 'Lapislazuli',
  'lapis_ore': 'Lapislazulierz',
  'large_amethyst_bud': 'Large amethyst bud',
  'large_fern': 'Large farn',
  'lava_bucket': 'Lavaeimer',
  'lead': 'Leine',
  'leaf_litter': 'Leaf litter',
  'leather': 'Leder',
  'leather_boots': 'Lederstiefel',
  'leather_chestplate': 'Lederjacke',
  'leather_helmet': 'Lederkappe',
  'leather_horse_armor': 'Leather horse armor',
  'leather_leggings': 'Lederhose',
  'lectern': 'Lesepult',
  'lever': 'Lever',
  'light': 'Light',
  'light_blue_banner': 'Light blue banner',
  'light_blue_bed': 'Light blue bett',
  'light_blue_bundle': 'Light blue bundle',
  'light_blue_candle': 'Light blue kerze',
  'light_blue_carpet': 'Light blue teppich',
  'light_blue_concrete': 'Light blue beton',
  'light_blue_concrete_powder': 'Light blue beton powder',
  'light_blue_dye': 'Light blue farbstoff',
  'light_blue_glazed_terracotta': 'Light blue glazed keramik',
  'light_blue_harness': 'Light blue harness',
  'light_blue_shulker_box': 'Light blue shulker box',
  'light_blue_stained_glass': 'Light blue stained glas',
  'light_blue_stained_glass_pane': 'Light blue stained glas pane',
  'light_blue_terracotta': 'Light blue keramik',
  'light_blue_wool': 'Light blue wolle',
  'light_gray_banner': 'Light gray banner',
  'light_gray_bed': 'Light gray bett',
  'light_gray_bundle': 'Light gray bundle',
  'light_gray_candle': 'Light gray kerze',
  'light_gray_carpet': 'Light gray teppich',
  'light_gray_concrete': 'Light gray beton',
  'light_gray_concrete_powder': 'Light gray beton powder',
  'light_gray_dye': 'Light gray farbstoff',
  'light_gray_glazed_terracotta': 'Light gray glazed keramik',
  'light_gray_harness': 'Light gray harness',
  'light_gray_shulker_box': 'Light gray shulker box',
  'light_gray_stained_glass': 'Light gray stained glas',
  'light_gray_stained_glass_pane': 'Light gray stained glas pane',
  'light_gray_terracotta': 'Light gray keramik',
  'light_gray_wool': 'Light gray wolle',
  'light_weighted_pressure_plate': 'Light weighted pressure plate',
  'lightning_rod': 'Blitzableiter',
  'lilac': 'Lilac',
  'lily_of_the_valley': 'Lily of the valley',
  'lily_pad': 'Lily pad',
  'lime_banner': 'Hellgrün banner',
  'lime_bed': 'Hellgrün bett',
  'lime_bundle': 'Hellgrün bundle',
  'lime_candle': 'Hellgrün kerze',
  'lime_carpet': 'Hellgrün teppich',
  'lime_concrete': 'Hellgrün beton',
  'lime_concrete_powder': 'Hellgrün beton powder',
  'lime_dye': 'Hellgrün farbstoff',
  'lime_glazed_terracotta': 'Hellgrün glazed keramik',
  'lime_harness': 'Hellgrün harness',
  'lime_shulker_box': 'Hellgrün shulker box',
  'lime_stained_glass': 'Hellgrün stained glas',
  'lime_stained_glass_pane': 'Hellgrün stained glas pane',
  'lime_terracotta': 'Hellgrün keramik',
  'lime_wool': 'Hellgrün wolle',
  'lingering_potion': 'Lingering potion',
  'llama_spawn_egg': 'Lama-Spawn-Ei',
  'lodestone': 'Leitstein',
  'loom': 'Webstuhl',
  'mace': 'Streitkolben',
  'magenta_banner': 'Magenta banner',
  'magenta_bed': 'Magenta bett',
  'magenta_bundle': 'Magenta bundle',
  'magenta_candle': 'Magenta kerze',
  'magenta_carpet': 'Magenta teppich',
  'magenta_concrete': 'Magenta beton',
  'magenta_concrete_powder': 'Magenta beton powder',
  'magenta_dye': 'Magenta farbstoff',
  'magenta_glazed_terracotta': 'Magenta glazed keramik',
  'magenta_harness': 'Magenta harness',
  'magenta_shulker_box': 'Magenta shulker box',
  'magenta_stained_glass': 'Magenta stained glas',
  'magenta_stained_glass_pane': 'Magenta stained glas pane',
  'magenta_terracotta': 'Magenta keramik',
  'magenta_wool': 'Magenta wolle',
  'magma_block': 'Magma block',
  'magma_cream': 'Magmacreme',
  'magma_cube_spawn_egg': 'Magmawürfel-Spawn-Ei',
  'mangrove_boat': 'Mangrove boat',
  'mangrove_button': 'MangrovenKnopf',
  'mangrove_chest_boat': 'Mangrove chest boat',
  'mangrove_door': 'MangrovenTür',
  'mangrove_fence': 'MangrovenZaun',
  'mangrove_fence_gate': 'MangrovenZauntor',
  'mangrove_hanging_sign': 'MangrovenHängeschild',
  'mangrove_leaves': 'MangrovenLaub',
  'mangrove_log': 'MangrovenStamm',
  'mangrove_planks': 'MangrovenHolzbretter',
  'mangrove_pressure_plate': 'MangrovenDruckplatte',
  'mangrove_propagule': 'MangrovenKeimling',
  'mangrove_roots': 'Mangrove roots',
  'mangrove_shelf': 'MangrovenRegal',
  'mangrove_sign': 'MangrovenSchild',
  'mangrove_slab': 'MangrovenStufe',
  'mangrove_stairs': 'MangrovenTreppe',
  'mangrove_trapdoor': 'MangrovenFalltür',
  'mangrove_wood': 'MangrovenHolz',
  'map': 'Leere Karte',
  'medium_amethyst_bud': 'Medium amethyst bud',
  'melon': 'Melon',
  'melon_seeds': 'Melon seeds',
  'melon_slice': 'Melonenscheibe',
  'milk_bucket': 'Milcheimer',
  'minecart': 'Lore',
  'miner_pottery_sherd': 'Miner pottery sherd',
  'mojang_banner_pattern': 'Mojang banner pattern',
  'mooshroom_spawn_egg': 'Mooshroom-Spawn-Ei',
  'moss_block': 'Moos block',
  'moss_carpet': 'Moos teppich',
  'mossy_cobblestone': 'Moosig cobblestone',
  'mossy_cobblestone_slab': 'Moosig cobblestone stufe',
  'mossy_cobblestone_stairs': 'Moosig cobblestone treppe',
  'mossy_cobblestone_wall': 'Moosig cobblestone mauer',
  'mossy_stone_brick_slab': 'Moosig stein ziegel stufe',
  'mossy_stone_brick_stairs': 'Moosig stein ziegel treppe',
  'mossy_stone_brick_wall': 'Moosig stein ziegel mauer',
  'mossy_stone_bricks': 'Moosig stein ziegel',
  'mourner_pottery_sherd': 'Mourner pottery sherd',
  'mud': 'Schlamm',
  'mud_brick_slab': 'Schlamm ziegel stufe',
  'mud_brick_stairs': 'Schlamm ziegel treppe',
  'mud_brick_wall': 'Schlamm ziegel mauer',
  'mud_bricks': 'Schlamm ziegel',
  'muddy_mangrove_roots': 'Muddy mangrove roots',
  'mule_spawn_egg': 'Maultier-Spawn-Ei',
  'mushroom_stem': 'Mushroom stem',
  'mushroom_stew': 'Pilzsuppe',
  'music_disc_11': 'Music disc 11',
  'music_disc_13': 'Music disc 13',
  'music_disc_5': 'Music disc 5',
  'music_disc_blocks': 'Music disc blocks',
  'music_disc_cat': 'Music disc cat',
  'music_disc_chirp': 'Music disc chirp',
  'music_disc_creator': 'Music disc creator',
  'music_disc_creator_music_box': 'Music disc creator music box',
  'music_disc_far': 'Music disc far',
  'music_disc_lava_chicken': 'Music disc lava chicken',
  'music_disc_mall': 'Music disc mall',
  'music_disc_mellohi': 'Music disc mellohi',
  'music_disc_otherside': 'Music disc otherside',
  'music_disc_pigstep': 'Music disc pigstep',
  'music_disc_precipice': 'Music disc precipice',
  'music_disc_relic': 'Music disc relic',
  'music_disc_stal': 'Music disc stal',
  'music_disc_strad': 'Music disc strad',
  'music_disc_tears': 'Music disc tears',
  'music_disc_wait': 'Music disc wait',
  'music_disc_ward': 'Music disc ward',
  'mutton': 'Rohes Hammelfleisch',
  'mycelium': 'Mycelium',
  'name_tag': 'Namensschild',
  'nautilus_shell': 'Nautilusschale',
  'nether_brick': 'Nether Brick',
  'nether_brick_fence': 'Nether ziegel zaun',
  'nether_brick_slab': 'Nether ziegel stufe',
  'nether_brick_stairs': 'Nether ziegel treppe',
  'nether_brick_wall': 'Nether ziegel mauer',
  'nether_bricks': 'Nether Bricks',
  'nether_gold_ore': 'Nethergolderz',
  'nether_quartz_ore': 'Netherquarzerz',
  'nether_sprouts': 'Nether sprouts',
  'nether_star': 'Netherstern',
  'nether_wart': 'Nether wart',
  'nether_wart_block': 'Nether wart block',
  'netherite_axe': 'Netheritaxt',
  'netherite_block': 'Netheritblock',
  'netherite_boots': 'Netheritstiefel',
  'netherite_chestplate': 'Netheritharnisch',
  'netherite_helmet': 'Netherithelm',
  'netherite_hoe': 'Netherithacke',
  'netherite_ingot': 'Netheritbarren',
  'netherite_leggings': 'Netheritbeinschutz',
  'netherite_pickaxe': 'Netheritspitzhacke',
  'netherite_scrap': 'Netherite scrap',
  'netherite_shovel': 'Netheritschaufel',
  'netherite_sword': 'Netheritsschwert',
  'netherite_upgrade_smithing_template': 'Netherite upgrade smithing template',
  'netherrack': 'Netherrack',
  'note_block': 'Notenblock',
  'oak_boat': 'Oak boat',
  'oak_button': 'EichenKnopf',
  'oak_chest_boat': 'Oak chest boat',
  'oak_door': 'EichenTür',
  'oak_fence': 'EichenZaun',
  'oak_fence_gate': 'EichenZauntor',
  'oak_hanging_sign': 'EichenHängeschild',
  'oak_leaves': 'EichenLaub',
  'oak_log': 'EichenStamm',
  'oak_planks': 'EichenHolzbretter',
  'oak_pressure_plate': 'EichenDruckplatte',
  'oak_sapling': 'EichenSetzling',
  'oak_shelf': 'EichenRegal',
  'oak_sign': 'EichenSchild',
  'oak_slab': 'EichenStufe',
  'oak_stairs': 'EichenTreppe',
  'oak_trapdoor': 'EichenFalltür',
  'oak_wood': 'EichenHolz',
  'observer': 'Beobachter',
  'obsidian': 'Obsidian',
  'ocelot_spawn_egg': 'Ozelot-Spawn-Ei',
  'ochre_froglight': 'Ochre froglight',
  'ominous_bottle': 'Unheilvolle Flasche',
  'ominous_trial_key': 'Unheilvoller Prüfungsschlüssel',
  'open_eyeblossom': 'Open eyeblossom',
  'orange_banner': 'Orange banner',
  'orange_bed': 'Orange bett',
  'orange_bundle': 'Orange bundle',
  'orange_candle': 'Orange kerze',
  'orange_carpet': 'Orange teppich',
  'orange_concrete': 'Orange beton',
  'orange_concrete_powder': 'Orange beton powder',
  'orange_dye': 'Orange farbstoff',
  'orange_glazed_terracotta': 'Orange glazed keramik',
  'orange_harness': 'Orange harness',
  'orange_shulker_box': 'Orange shulker box',
  'orange_stained_glass': 'Orange stained glas',
  'orange_stained_glass_pane': 'Orange stained glas pane',
  'orange_terracotta': 'Orange keramik',
  'orange_tulip': 'Orange tulip',
  'orange_wool': 'Orange wolle',
  'oxeye_daisy': 'Oxeye daisy',
  'oxidized_chiseled_copper': 'Oxidized gemeißelt copper',
  'oxidized_copper': 'Oxidized copper',
  'oxidized_copper_bars': 'Oxidized copper bars',
  'oxidized_copper_bulb': 'Oxidized copper bulb',
  'oxidized_copper_chain': 'Oxidized copper kette',
  'oxidized_copper_chest': 'Oxidized copper chest',
  'oxidized_copper_door': 'Oxidized copper tür',
  'oxidized_copper_golem_statue': 'Oxidized copper golem statue',
  'oxidized_copper_grate': 'Oxidized copper grate',
  'oxidized_copper_lantern': 'Oxidized copper laterne',
  'oxidized_copper_trapdoor': 'Oxidized copper falltür',
  'oxidized_cut_copper': 'Oxidized geschnitten copper',
  'oxidized_cut_copper_slab': 'Oxidized geschnitten copper stufe',
  'oxidized_cut_copper_stairs': 'Oxidized geschnitten copper treppe',
  'oxidized_lightning_rod': 'Oxidized lightning rod',
  'packed_ice': 'Packed ice',
  'packed_mud': 'Packed schlamm',
  'painting': 'Gemälde',
  'pale_hanging_moss': 'Pale hanging moos',
  'pale_moss_block': 'Pale moos block',
  'pale_moss_carpet': 'Pale moos teppich',
  'pale_oak_boat': 'Pale oak boat',
  'pale_oak_button': 'Pale oak knopf',
  'pale_oak_chest_boat': 'Pale oak chest boat',
  'pale_oak_door': 'Pale oak tür',
  'pale_oak_fence': 'Pale oak zaun',
  'pale_oak_fence_gate': 'Pale oak zaun gate',
  'pale_oak_hanging_sign': 'Pale oak hanging schild',
  'pale_oak_leaves': 'Pale oak laub',
  'pale_oak_log': 'Pale oak stamm',
  'pale_oak_planks': 'Pale oak holzbretter',
  'pale_oak_pressure_plate': 'Pale oak pressure plate',
  'pale_oak_sapling': 'Pale oak setzling',
  'pale_oak_shelf': 'Pale oak regal',
  'pale_oak_sign': 'Pale oak schild',
  'pale_oak_slab': 'Pale oak stufe',
  'pale_oak_stairs': 'Pale oak treppe',
  'pale_oak_trapdoor': 'Pale oak falltür',
  'pale_oak_wood': 'Pale oak holz',
  'panda_spawn_egg': 'Panda-Spawn-Ei',
  'paper': 'Papier',
  'parrot_spawn_egg': 'Papagei-Spawn-Ei',
  'pearlescent_froglight': 'Pearlescent froglight',
  'peony': 'Peony',
  'petrified_oak_slab': 'Petrified oak stufe',
  'phantom_membrane': 'Phantomhaut',
  'phantom_spawn_egg': 'Phantom-Spawn-Ei',
  'pig_spawn_egg': 'Schwein-Spawn-Ei',
  'piglin_banner_pattern': 'Piglin banner pattern',
  'piglin_brute_spawn_egg': 'Piglin-Barbar-Spawn-Ei',
  'piglin_head': 'Piglin head',
  'piglin_spawn_egg': 'Piglin-Spawn-Ei',
  'pillager_spawn_egg': 'Plünderer-Spawn-Ei',
  'pink_banner': 'Rosa banner',
  'pink_bed': 'Rosa bett',
  'pink_bundle': 'Rosa bundle',
  'pink_candle': 'Rosa kerze',
  'pink_carpet': 'Rosa teppich',
  'pink_concrete': 'Rosa beton',
  'pink_concrete_powder': 'Rosa beton powder',
  'pink_dye': 'Rosa farbstoff',
  'pink_glazed_terracotta': 'Rosa glazed keramik',
  'pink_harness': 'Rosa harness',
  'pink_petals': 'Rosa petals',
  'pink_shulker_box': 'Rosa shulker box',
  'pink_stained_glass': 'Rosa stained glas',
  'pink_stained_glass_pane': 'Rosa stained glas pane',
  'pink_terracotta': 'Rosa keramik',
  'pink_tulip': 'Rosa tulip',
  'pink_wool': 'Rosa wolle',
  'piston': 'Kolben',
  'pitcher_plant': 'Pitcher plant',
  'pitcher_pod': 'Pitcher pod',
  'player_head': 'Player head',
  'plenty_pottery_sherd': 'Plenty pottery sherd',
  'podzol': 'Podsol',
  'pointed_dripstone': 'Pointed dripstone',
  'poisonous_potato': 'Giftige Kartoffel',
  'polar_bear_spawn_egg': 'Eisbär-Spawn-Ei',
  'polished_andesite': 'Polierter Andesit',
  'polished_andesite_slab': 'Poliert andesite stufe',
  'polished_andesite_stairs': 'Poliert andesite treppe',
  'polished_basalt': 'Poliert basalt',
  'polished_blackstone': 'Poliert schwarzstein',
  'polished_blackstone_brick_slab': 'Poliert schwarzstein ziegel stufe',
  'polished_blackstone_brick_stairs': 'Poliert schwarzstein ziegel treppe',
  'polished_blackstone_brick_wall': 'Poliert schwarzstein ziegel mauer',
  'polished_blackstone_bricks': 'Poliert schwarzstein ziegel',
  'polished_blackstone_button': 'Poliert schwarzstein knopf',
  'polished_blackstone_pressure_plate': 'Poliert schwarzstein pressure plate',
  'polished_blackstone_slab': 'Poliert schwarzstein stufe',
  'polished_blackstone_stairs': 'Poliert schwarzstein treppe',
  'polished_blackstone_wall': 'Poliert schwarzstein mauer',
  'polished_deepslate': 'Polierter Tiefenschiefer',
  'polished_deepslate_slab': 'Poliert deepslate stufe',
  'polished_deepslate_stairs': 'Poliert deepslate treppe',
  'polished_deepslate_wall': 'Poliert deepslate mauer',
  'polished_diorite': 'Polierter Diorit',
  'polished_diorite_slab': 'Poliert diorite stufe',
  'polished_diorite_stairs': 'Poliert diorite treppe',
  'polished_granite': 'Polierter Granit',
  'polished_granite_slab': 'Poliert granite stufe',
  'polished_granite_stairs': 'Poliert granite treppe',
  'polished_tuff': 'Poliert tuff',
  'polished_tuff_slab': 'Poliert tuff stufe',
  'polished_tuff_stairs': 'Poliert tuff treppe',
  'polished_tuff_wall': 'Poliert tuff mauer',
  'popped_chorus_fruit': 'Popped chorus fruit',
  'poppy': 'Poppy',
  'porkchop': 'Rohes Schweinefleisch',
  'potato': 'Kartoffel',
  'potion': 'Potion',
  'powder_snow_bucket': 'Pulverschnee-Eimer',
  'powered_rail': 'Antriebsschiene',
  'prismarine': 'Prismarin',
  'prismarine_brick_slab': 'Prismarin ziegel stufe',
  'prismarine_brick_stairs': 'Prismarin ziegel treppe',
  'prismarine_bricks': 'Prismarin ziegel',
  'prismarine_crystals': 'Prismarinkristalle',
  'prismarine_shard': 'Prismarinscherbe',
  'prismarine_slab': 'Prismarin stufe',
  'prismarine_stairs': 'Prismarin treppe',
  'prismarine_wall': 'Prismarin mauer',
  'prize_pottery_sherd': 'Prize pottery sherd',
  'pufferfish': 'Kugelfisch',
  'pufferfish_bucket': 'Pufferfish bucket',
  'pufferfish_spawn_egg': 'Kugelfisch-Spawn-Ei',
  'pumpkin': 'Pumpkin',
  'pumpkin_pie': 'Kürbiskuchen',
  'pumpkin_seeds': 'Pumpkin seeds',
  'purple_banner': 'Violett banner',
  'purple_bed': 'Violett bett',
  'purple_bundle': 'Violett bundle',
  'purple_candle': 'Violett kerze',
  'purple_carpet': 'Violett teppich',
  'purple_concrete': 'Violett beton',
  'purple_concrete_powder': 'Violett beton powder',
  'purple_dye': 'Violett farbstoff',
  'purple_glazed_terracotta': 'Violett glazed keramik',
  'purple_harness': 'Violett harness',
  'purple_shulker_box': 'Violett shulker box',
  'purple_stained_glass': 'Violett stained glas',
  'purple_stained_glass_pane': 'Violett stained glas pane',
  'purple_terracotta': 'Violett keramik',
  'purple_wool': 'Violett wolle',
  'purpur_block': 'Purpur block',
  'purpur_pillar': 'Purpur pillar',
  'purpur_slab': 'Purpur stufe',
  'purpur_stairs': 'Purpur treppe',
  'quartz': 'Netherquarz',
  'quartz_block': 'Quarz block',
  'quartz_bricks': 'Quarz ziegel',
  'quartz_pillar': 'Quarz pillar',
  'quartz_slab': 'Quarz stufe',
  'quartz_stairs': 'Quarz treppe',
  'rabbit': 'Rohes Kaninchenfleisch',
  'rabbit_foot': 'Hasenpfote',
  'rabbit_hide': 'Kaninchenfell',
  'rabbit_spawn_egg': 'Kaninchen-Spawn-Ei',
  'rabbit_stew': 'Kaninchenragout',
  'rail': 'Schiene',
  'raiser_armor_trim_smithing_template': 'Raiser armor trim smithing template',
  'ravager_spawn_egg': 'Plündererbestie-Spawn-Ei',
  'raw_copper': 'Raw copper',
  'raw_copper_block': 'Rohkupferblock',
  'raw_gold': 'Raw gold',
  'raw_gold_block': 'Rohgoldblock',
  'raw_iron': 'Raw iron',
  'raw_iron_block': 'Rohblock aus Eisen',
  'recovery_compass': 'Bergungskompass',
  'red_banner': 'Rot banner',
  'red_bed': 'Rot bett',
  'red_bundle': 'Rot bundle',
  'red_candle': 'Rot kerze',
  'red_carpet': 'Rot teppich',
  'red_concrete': 'Rot beton',
  'red_concrete_powder': 'Rot beton powder',
  'red_dye': 'Rot farbstoff',
  'red_glazed_terracotta': 'Rot glazed keramik',
  'red_harness': 'Rot harness',
  'red_mushroom': 'Rot mushroom',
  'red_mushroom_block': 'Rot mushroom block',
  'red_nether_brick_slab': 'Rot nether ziegel stufe',
  'red_nether_brick_stairs': 'Rot nether ziegel treppe',
  'red_nether_brick_wall': 'Rot nether ziegel mauer',
  'red_nether_bricks': 'Rot nether ziegel',
  'red_sand': 'Roter Sand',
  'red_sandstone': 'Rot sandstein',
  'red_sandstone_slab': 'Rot sandstein stufe',
  'red_sandstone_stairs': 'Rot sandstein treppe',
  'red_sandstone_wall': 'Rot sandstein mauer',
  'red_shulker_box': 'Rot shulker box',
  'red_stained_glass': 'Rot stained glas',
  'red_stained_glass_pane': 'Rot stained glas pane',
  'red_terracotta': 'Rot keramik',
  'red_tulip': 'Rot tulip',
  'red_wool': 'Rot wolle',
  'redstone': 'Redstone',
  'redstone_block': 'Redstone block',
  'redstone_lamp': 'Redstone-Lampe',
  'redstone_ore': 'Redstone-Erz',
  'redstone_torch': 'Redstone-Fackel',
  'reinforced_deepslate': 'Reinforced deepslate',
  'repeater': 'Redstone-Verstärker',
  'repeating_command_block': 'Repeating command block',
  'resin_block': 'Harz block',
  'resin_brick': 'Resin Brick',
  'resin_brick_slab': 'Harz ziegel stufe',
  'resin_brick_stairs': 'Harz ziegel treppe',
  'resin_brick_wall': 'Harz ziegel mauer',
  'resin_bricks': 'Resin Bricks',
  'resin_clump': 'Harz clump',
  'respawn_anchor': 'Seelenanker',
  'rib_armor_trim_smithing_template': 'Rib armor trim smithing template',
  'rooted_dirt': 'Wurzelerde',
  'rose_bush': 'Rose bush',
  'rotten_flesh': 'Verrottetes Fleisch',
  'saddle': 'Saddle',
  'salmon': 'Lachs',
  'salmon_bucket': 'Salmon bucket',
  'salmon_spawn_egg': 'Lachs-Spawn-Ei',
  'sand': 'Sand',
  'sandstone': 'Sandstein',
  'sandstone_slab': 'Sandstein stufe',
  'sandstone_stairs': 'Sandstein treppe',
  'sandstone_wall': 'Sandstein mauer',
  'scaffolding': 'Scaffolding',
  'scrape_pottery_sherd': 'Scrape pottery sherd',
  'sculk': 'Sculk',
  'sculk_catalyst': 'Sculk catalyst',
  'sculk_sensor': 'Sculk sensor',
  'sculk_shrieker': 'Sculk shrieker',
  'sculk_vein': 'Sculk vein',
  'sea_lantern': 'Sea laterne',
  'sea_pickle': 'Sea pickle',
  'seagrass': 'Seegras',
  'sentry_armor_trim_smithing_template': 'Sentry armor trim smithing template',
  'shaper_armor_trim_smithing_template': 'Shaper armor trim smithing template',
  'sheaf_pottery_sherd': 'Sheaf pottery sherd',
  'shears': 'Shears',
  'sheep_spawn_egg': 'Schaf-Spawn-Ei',
  'shelter_pottery_sherd': 'Shelter pottery sherd',
  'shield': 'Schild',
  'short_dry_grass': 'Short dry gras',
  'short_grass': 'Short gras',
  'shroomlight': 'Shroomlight',
  'shulker_box': 'Shulker box',
  'shulker_shell': 'Shulker shell',
  'shulker_spawn_egg': 'Shulker-Spawn-Ei',
  'silence_armor_trim_smithing_template': 'Silence armor trim smithing template',
  'silverfish_spawn_egg': 'Silberfischchen-Spawn-Ei',
  'skeleton_horse_spawn_egg': 'Skelettpferd-Spawn-Ei',
  'skeleton_skull': 'Skeleton skull',
  'skeleton_spawn_egg': 'Skelett-Spawn-Ei',
  'skull_banner_pattern': 'Skull banner pattern',
  'skull_pottery_sherd': 'Skull pottery sherd',
  'slime_ball': 'Schleimball',
  'slime_block': 'Slime block',
  'slime_spawn_egg': 'Schleim-Spawn-Ei',
  'small_amethyst_bud': 'Small amethyst bud',
  'small_dripleaf': 'Small dripleaf',
  'smithing_table': 'Schmiedetisch',
  'smoker': 'Räucherofen',
  'smooth_basalt': 'Glatt basalt',
  'smooth_quartz': 'Glatt quarz',
  'smooth_quartz_slab': 'Glatt quarz stufe',
  'smooth_quartz_stairs': 'Glatt quarz treppe',
  'smooth_red_sandstone': 'Glatt red sandstein',
  'smooth_red_sandstone_slab': 'Glatt red sandstein stufe',
  'smooth_red_sandstone_stairs': 'Glatt red sandstein treppe',
  'smooth_sandstone': 'Glatt sandstein',
  'smooth_sandstone_slab': 'Glatt sandstein stufe',
  'smooth_sandstone_stairs': 'Glatt sandstein treppe',
  'smooth_stone': 'Glatt stein',
  'smooth_stone_slab': 'Glatt stein stufe',
  'sniffer_egg': 'Sniffer ei',
  'sniffer_spawn_egg': 'Schnüffler-Spawn-Ei',
  'snort_pottery_sherd': 'Snort pottery sherd',
  'snout_armor_trim_smithing_template': 'Snout armor trim smithing template',
  'snow': 'Snow',
  'snow_block': 'Snow block',
  'snow_golem_spawn_egg': 'Schneegolem-Spawn-Ei',
  'snowball': 'Schneeball',
  'soul_campfire': 'Seelenlagerfeuer',
  'soul_lantern': 'Seelenlaterne',
  'soul_sand': 'Soul sand',
  'soul_soil': 'Soul soil',
  'soul_torch': 'Seelenfackel',
  'spawner': 'Spawner',
  'spectral_arrow': 'Spektralpfeil',
  'spider_eye': 'Spinnenauge',
  'spider_spawn_egg': 'Spinne-Spawn-Ei',
  'spire_armor_trim_smithing_template': 'Spire armor trim smithing template',
  'splash_potion': 'Splash potion',
  'sponge': 'Schwamm',
  'spore_blossom': 'Spore blossom',
  'spruce_boat': 'Spruce boat',
  'spruce_button': 'FichtenKnopf',
  'spruce_chest_boat': 'Spruce chest boat',
  'spruce_door': 'FichtenTür',
  'spruce_fence': 'FichtenZaun',
  'spruce_fence_gate': 'FichtenZauntor',
  'spruce_hanging_sign': 'FichtenHängeschild',
  'spruce_leaves': 'FichtenLaub',
  'spruce_log': 'FichtenStamm',
  'spruce_planks': 'FichtenHolzbretter',
  'spruce_pressure_plate': 'FichtenDruckplatte',
  'spruce_sapling': 'FichtenSetzling',
  'spruce_shelf': 'FichtenRegal',
  'spruce_sign': 'FichtenSchild',
  'spruce_slab': 'FichtenStufe',
  'spruce_stairs': 'FichtenTreppe',
  'spruce_trapdoor': 'FichtenFalltür',
  'spruce_wood': 'FichtenHolz',
  'spyglass': 'Fernrohr',
  'squid_spawn_egg': 'Tintenfisch-Spawn-Ei',
  'stick': 'Stock',
  'sticky_piston': 'Klebriger Kolben',
  'stone': 'Stein',
  'stone_axe': 'Steinaxt',
  'stone_brick_slab': 'Stein ziegel stufe',
  'stone_brick_stairs': 'Stein ziegel treppe',
  'stone_brick_wall': 'Stein ziegel mauer',
  'stone_bricks': 'Stein ziegel',
  'stone_button': 'Stein knopf',
  'stone_hoe': 'Steinhacke',
  'stone_pickaxe': 'Steinspitzhacke',
  'stone_pressure_plate': 'Stein pressure plate',
  'stone_shovel': 'Steinschaufel',
  'stone_slab': 'Stein stufe',
  'stone_stairs': 'Stein treppe',
  'stone_sword': 'Steinschwert',
  'stonecutter': 'Steinsäge',
  'stray_spawn_egg': 'Eiswanderer-Spawn-Ei',
  'strider_spawn_egg': 'Schreiter-Spawn-Ei',
  'string': 'Faden',
  'stripped_acacia_log': 'Stripped acacia stamm',
  'stripped_acacia_wood': 'Stripped acacia holz',
  'stripped_bamboo_block': 'Stripped bamboo block',
  'stripped_birch_log': 'Stripped birch stamm',
  'stripped_birch_wood': 'Stripped birch holz',
  'stripped_cherry_log': 'Stripped cherry stamm',
  'stripped_cherry_wood': 'Stripped cherry holz',
  'stripped_crimson_hyphae': 'Stripped crimson hyphae',
  'stripped_crimson_stem': 'Stripped crimson stem',
  'stripped_dark_oak_log': 'Stripped dark oak stamm',
  'stripped_dark_oak_wood': 'Stripped dark oak holz',
  'stripped_jungle_log': 'Stripped jungle stamm',
  'stripped_jungle_wood': 'Stripped jungle holz',
  'stripped_mangrove_log': 'Stripped mangrove stamm',
  'stripped_mangrove_wood': 'Stripped mangrove holz',
  'stripped_oak_log': 'Stripped oak stamm',
  'stripped_oak_wood': 'Stripped oak holz',
  'stripped_pale_oak_log': 'Stripped pale oak stamm',
  'stripped_pale_oak_wood': 'Stripped pale oak holz',
  'stripped_spruce_log': 'Stripped spruce stamm',
  'stripped_spruce_wood': 'Stripped spruce holz',
  'stripped_warped_hyphae': 'Stripped warped hyphae',
  'stripped_warped_stem': 'Stripped warped stem',
  'structure_block': 'Structure block',
  'structure_void': 'Structure void',
  'sugar': 'Zucker',
  'sugar_cane': 'Sugar cane',
  'sunflower': 'Sunflower',
  'suspicious_gravel': 'Verdächtiger Kies',
  'suspicious_sand': 'Verdächtiger Sand',
  'suspicious_stew': 'Seltsame Suppe',
  'sweet_berries': 'Süßbeeren',
  'tadpole_bucket': 'Tadpole bucket',
  'tadpole_spawn_egg': 'Kaulquappe-Spawn-Ei',
  'tall_dry_grass': 'Tall dry gras',
  'tall_grass': 'Tall gras',
  'target': 'Ziel',
  'terracotta': 'Keramik',
  'test_block': 'Test block',
  'test_instance_block': 'Test instance block',
  'tide_armor_trim_smithing_template': 'Tide armor trim smithing template',
  'tinted_glass': 'Tinted glas',
  'tipped_arrow': 'Getränkter Pfeil',
  'tnt': 'TNT',
  'tnt_minecart': 'Tnt minecart',
  'torch': 'Fackel',
  'torchflower': 'Torchflower',
  'torchflower_seeds': 'Torchflower seeds',
  'totem_of_undying': 'Totem of undying',
  'trader_llama_spawn_egg': 'Händlerlama-Spawn-Ei',
  'trapped_chest': 'Trapped chest',
  'trial_key': 'Prüfungsschlüssel',
  'trial_spawner': 'Prüfungsspawner',
  'trident': 'Dreizack',
  'tripwire_hook': 'Tripwire hook',
  'tropical_fish': 'Tropenfisch',
  'tropical_fish_bucket': 'Tropical fish bucket',
  'tropical_fish_spawn_egg': 'Tropenfisch-Spawn-Ei',
  'tube_coral': 'Tube coral',
  'tube_coral_block': 'Tube coral block',
  'tube_coral_fan': 'Tube coral fan',
  'tuff': 'Tuff',
  'tuff_brick_slab': 'Tuff ziegel stufe',
  'tuff_brick_stairs': 'Tuff ziegel treppe',
  'tuff_brick_wall': 'Tuff ziegel mauer',
  'tuff_bricks': 'Tuff ziegel',
  'tuff_slab': 'Tuff stufe',
  'tuff_stairs': 'Tuff treppe',
  'tuff_wall': 'Tuff mauer',
  'turtle_egg': 'Turtle ei',
  'turtle_helmet': 'Schildkrötenpanzer',
  'turtle_scute': 'Turtle scute',
  'turtle_spawn_egg': 'Schildkröte-Spawn-Ei',
  'twisting_vines': 'Twisting vines',
  'vault': 'Tresor',
  'verdant_froglight': 'Verdant froglight',
  'vex_armor_trim_smithing_template': 'Vex armor trim smithing template',
  'vex_spawn_egg': 'Plagegeist-Spawn-Ei',
  'villager_spawn_egg': 'Dorfbewohner-Spawn-Ei',
  'vindicator_spawn_egg': 'Diener-Spawn-Ei',
  'vine': 'Ranke',
  'wandering_trader_spawn_egg': 'Wandernder Händler-Spawn-Ei',
  'ward_armor_trim_smithing_template': 'Ward armor trim smithing template',
  'warden_spawn_egg': 'Wärter-Spawn-Ei',
  'warped_button': 'WirrKnopf',
  'warped_door': 'WirrTür',
  'warped_fence': 'WirrZaun',
  'warped_fence_gate': 'WirrZauntor',
  'warped_fungus': 'Warped fungus',
  'warped_fungus_on_a_stick': 'Warped fungus on a stick',
  'warped_hanging_sign': 'WirrHängeschild',
  'warped_hyphae': 'Warped hyphae',
  'warped_nylium': 'Wirr-Nylium',
  'warped_planks': 'WirrHolzbretter',
  'warped_pressure_plate': 'WirrDruckplatte',
  'warped_roots': 'Warped roots',
  'warped_shelf': 'WirrRegal',
  'warped_sign': 'WirrSchild',
  'warped_slab': 'WirrStufe',
  'warped_stairs': 'WirrTreppe',
  'warped_stem': 'Warped stem',
  'warped_trapdoor': 'WirrFalltür',
  'warped_wart_block': 'Warped wart block',
  'water_bucket': 'Wassereimer',
  'waxed_chiseled_copper': 'Waxed gemeißelt copper',
  'waxed_copper_bars': 'Waxed copper bars',
  'waxed_copper_block': 'Waxed copper block',
  'waxed_copper_bulb': 'Waxed copper bulb',
  'waxed_copper_chain': 'Waxed copper kette',
  'waxed_copper_chest': 'Waxed copper chest',
  'waxed_copper_door': 'Waxed copper tür',
  'waxed_copper_golem_statue': 'Waxed copper golem statue',
  'waxed_copper_grate': 'Waxed copper grate',
  'waxed_copper_lantern': 'Waxed copper laterne',
  'waxed_copper_trapdoor': 'Waxed copper falltür',
  'waxed_cut_copper': 'Waxed geschnitten copper',
  'waxed_cut_copper_slab': 'Waxed geschnitten copper stufe',
  'waxed_cut_copper_stairs': 'Waxed geschnitten copper treppe',
  'waxed_exposed_chiseled_copper': 'Waxed exposed gemeißelt copper',
  'waxed_exposed_copper': 'Waxed exposed copper',
  'waxed_exposed_copper_bars': 'Waxed exposed copper bars',
  'waxed_exposed_copper_bulb': 'Waxed exposed copper bulb',
  'waxed_exposed_copper_chain': 'Waxed exposed copper kette',
  'waxed_exposed_copper_chest': 'Waxed exposed copper chest',
  'waxed_exposed_copper_door': 'Waxed exposed copper tür',
  'waxed_exposed_copper_golem_statue': 'Waxed exposed copper golem statue',
  'waxed_exposed_copper_grate': 'Waxed exposed copper grate',
  'waxed_exposed_copper_lantern': 'Waxed exposed copper laterne',
  'waxed_exposed_copper_trapdoor': 'Waxed exposed copper falltür',
  'waxed_exposed_cut_copper': 'Waxed exposed geschnitten copper',
  'waxed_exposed_cut_copper_slab': 'Waxed exposed geschnitten copper stufe',
  'waxed_exposed_cut_copper_stairs': 'Waxed exposed geschnitten copper treppe',
  'waxed_exposed_lightning_rod': 'Waxed exposed lightning rod',
  'waxed_lightning_rod': 'Waxed lightning rod',
  'waxed_oxidized_chiseled_copper': 'Waxed oxidized gemeißelt copper',
  'waxed_oxidized_copper': 'Waxed oxidized copper',
  'waxed_oxidized_copper_bars': 'Waxed oxidized copper bars',
  'waxed_oxidized_copper_bulb': 'Waxed oxidized copper bulb',
  'waxed_oxidized_copper_chain': 'Waxed oxidized copper kette',
  'waxed_oxidized_copper_chest': 'Waxed oxidized copper chest',
  'waxed_oxidized_copper_door': 'Waxed oxidized copper tür',
  'waxed_oxidized_copper_golem_statue': 'Waxed oxidized copper golem statue',
  'waxed_oxidized_copper_grate': 'Waxed oxidized copper grate',
  'waxed_oxidized_copper_lantern': 'Waxed oxidized copper laterne',
  'waxed_oxidized_copper_trapdoor': 'Waxed oxidized copper falltür',
  'waxed_oxidized_cut_copper': 'Waxed oxidized geschnitten copper',
  'waxed_oxidized_cut_copper_slab': 'Waxed oxidized geschnitten copper stufe',
  'waxed_oxidized_cut_copper_stairs': 'Waxed oxidized geschnitten copper treppe',
  'waxed_oxidized_lightning_rod': 'Waxed oxidized lightning rod',
  'waxed_weathered_chiseled_copper': 'Waxed weathered gemeißelt copper',
  'waxed_weathered_copper': 'Waxed weathered copper',
  'waxed_weathered_copper_bars': 'Waxed weathered copper bars',
  'waxed_weathered_copper_bulb': 'Waxed weathered copper bulb',
  'waxed_weathered_copper_chain': 'Waxed weathered copper kette',
  'waxed_weathered_copper_chest': 'Waxed weathered copper chest',
  'waxed_weathered_copper_door': 'Waxed weathered copper tür',
  'waxed_weathered_copper_golem_statue': 'Waxed weathered copper golem statue',
  'waxed_weathered_copper_grate': 'Waxed weathered copper grate',
  'waxed_weathered_copper_lantern': 'Waxed weathered copper laterne',
  'waxed_weathered_copper_trapdoor': 'Waxed weathered copper falltür',
  'waxed_weathered_cut_copper': 'Waxed weathered geschnitten copper',
  'waxed_weathered_cut_copper_slab': 'Waxed weathered geschnitten copper stufe',
  'waxed_weathered_cut_copper_stairs': 'Waxed weathered geschnitten copper treppe',
  'waxed_weathered_lightning_rod': 'Waxed weathered lightning rod',
  'wayfinder_armor_trim_smithing_template': 'Wayfinder armor trim smithing template',
  'weathered_chiseled_copper': 'Weathered gemeißelt copper',
  'weathered_copper': 'Weathered copper',
  'weathered_copper_bars': 'Weathered copper bars',
  'weathered_copper_bulb': 'Weathered copper bulb',
  'weathered_copper_chain': 'Weathered copper kette',
  'weathered_copper_chest': 'Weathered copper chest',
  'weathered_copper_door': 'Weathered copper tür',
  'weathered_copper_golem_statue': 'Weathered copper golem statue',
  'weathered_copper_grate': 'Weathered copper grate',
  'weathered_copper_lantern': 'Weathered copper laterne',
  'weathered_copper_trapdoor': 'Weathered copper falltür',
  'weathered_cut_copper': 'Weathered geschnitten copper',
  'weathered_cut_copper_slab': 'Weathered geschnitten copper stufe',
  'weathered_cut_copper_stairs': 'Weathered geschnitten copper treppe',
  'weathered_lightning_rod': 'Weathered lightning rod',
  'weeping_vines': 'Weeping vines',
  'wet_sponge': 'Wet schwamm',
  'wheat': 'Wheat',
  'wheat_seeds': 'Wheat seeds',
  'white_banner': 'Weiß banner',
  'white_bed': 'Weiß bett',
  'white_bundle': 'Weiß bundle',
  'white_candle': 'Weiß kerze',
  'white_carpet': 'Weiß teppich',
  'white_concrete': 'Weiß beton',
  'white_concrete_powder': 'Weiß beton powder',
  'white_dye': 'Weiß farbstoff',
  'white_glazed_terracotta': 'Weiß glazed keramik',
  'white_harness': 'Weiß harness',
  'white_shulker_box': 'Weiß shulker box',
  'white_stained_glass': 'Weiß stained glas',
  'white_stained_glass_pane': 'Weiß stained glas pane',
  'white_terracotta': 'Weiß keramik',
  'white_tulip': 'Weiß tulip',
  'white_wool': 'Weiß wolle',
  'wild_armor_trim_smithing_template': 'Wild armor trim smithing template',
  'wildflowers': 'Wildflowers',
  'wind_charge': 'Wind charge',
  'witch_spawn_egg': 'Hexe-Spawn-Ei',
  'wither_rose': 'Wither rose',
  'wither_skeleton_skull': 'Wither skeleton skull',
  'wither_skeleton_spawn_egg': 'Wither-Skelett-Spawn-Ei',
  'wither_spawn_egg': 'Wither-Spawn-Ei',
  'wolf_armor': 'Wolfpanzer',
  'wolf_spawn_egg': 'Wolf-Spawn-Ei',
  'wooden_axe': 'Holzaxt',
  'wooden_hoe': 'Holzhacke',
  'wooden_pickaxe': 'Holzspitzhacke',
  'wooden_shovel': 'Holzschaufel',
  'wooden_sword': 'Holzschwert',
  'writable_book': 'Buch und Feder',
  'written_book': 'Geschriebenes Buch',
  'yellow_banner': 'Gelb banner',
  'yellow_bed': 'Gelb bett',
  'yellow_bundle': 'Gelb bundle',
  'yellow_candle': 'Gelb kerze',
  'yellow_carpet': 'Gelb teppich',
  'yellow_concrete': 'Gelb beton',
  'yellow_concrete_powder': 'Gelb beton powder',
  'yellow_dye': 'Gelb farbstoff',
  'yellow_glazed_terracotta': 'Gelb glazed keramik',
  'yellow_harness': 'Gelb harness',
  'yellow_shulker_box': 'Gelb shulker box',
  'yellow_stained_glass': 'Gelb stained glas',
  'yellow_stained_glass_pane': 'Gelb stained glas pane',
  'yellow_terracotta': 'Gelb keramik',
  'yellow_wool': 'Gelb wolle',
  'zoglin_spawn_egg': 'Zoglin-Spawn-Ei',
  'zombie_head': 'Zombie head',
  'zombie_horse_spawn_egg': 'Zombiepferd-Spawn-Ei',
  'zombie_spawn_egg': 'Zombie-Spawn-Ei',
  'zombie_villager_spawn_egg': 'Zombiedorfbewohner-Spawn-Ei',
  'zombified_piglin_spawn_egg': 'Zombifizierter Piglin-Spawn-Ei'
};

function humanizeItemId(id: string): string {
  return id
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStackSize(_id: string): number {
  return 64;
}

function findImage(name: string, id?: string): string {
  const candidates = [id, name]
    .filter(Boolean)
    .map((value) => normalizeItemName(String(value)));

  const entry = Object.entries(itemImages).find(([path]) => {
    const fileName =
      path
        .split("/")
        .pop()
        ?.replace(/\.png$/i, "") ?? "";

    return candidates.includes(normalizeItemName(fileName));
  });

  return (entry?.[1] as string | undefined) ?? "";
}

interface DatabaseItem {
  id: string;
  name: string;
  price: number;
  created_at: string;
  updated_at: string;
}

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  image: string;
  stackSize: number;
  price: number;
  inDatabase: boolean;
}

interface ItemStats {
  amount: number;
  stacks: number;
  orders: number;
}

function buildFullCatalog(
  databaseItems: DatabaseItem[],
): CatalogItem[] {
  const databaseById = new Map(
    databaseItems.map((item) => [
      normalizeId(item.id || item.name),
      item,
    ]),
  );

  return ALL_MINECRAFT_ITEM_IDS.map((id) => {
    const dbItem = databaseById.get(id);
    // Anzeige bleibt Englisch/Minecraft.
    // Deutsche Namen werden nur als Suchalias verwendet.
    const displayName =
      dbItem?.name ??
      humanizeItemId(id);

    const catalog = getCatalogData(displayName);

    return {
      id: dbItem?.id ?? id,
      name: displayName,
      category: catalog.category ?? "Sonstiges",
      icon: catalog.icon ?? "❓",
      image: findImage(displayName, id),
      stackSize: getStackSize(id),
      price: Number(dbItem?.price ?? 0) || 0,
      inDatabase: Boolean(dbItem),
    };
  });
}
export default function Items() {
  const [permissions, setPermissions] = useState<Set<Permission>>(
    new Set(),
  );
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [databaseItems, setDatabaseItems] = useState<DatabaseItem[]>([]);
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] =
    useState<CatalogItem | null>(null);
  const [editingItem, setEditingItem] =
    useState<CatalogItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const can = (permission: Permission) =>
    permissions.has(permission);

  const canView = can("items.view");
  const canCreate = can("items.create");
  const canEdit = can("items.edit");
  const canDelete = can("items.delete");
  const canChangePrice = can("items.change_price");

  useEffect(() => {
    let mounted = true;

    async function loadPermissions() {
      setPermissionsLoading(true);
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

  async function loadItems() {
    if (!canView) {
      setDatabaseItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: itemsError } = await supabase
      .from("items")
      .select("id,name,price,created_at,updated_at")
      .order("name", { ascending: true });

    if (itemsError) {
      console.error("Items laden fehlgeschlagen:", itemsError);
      setError("Die Item-Datenbank konnte nicht geladen werden.");
      setLoading(false);
      return;
    }

    setDatabaseItems((data ?? []) as DatabaseItem[]);
    setLoading(false);
  }

  useEffect(() => {
    void loadItems();
  }, [canView]);

  useEffect(() => {
    let mounted = true;

    async function loadOrderStats() {
      try {
        const loaded = await getOrders();
        if (mounted) setOrders(loaded);
      } catch (orderError) {
        console.error(
          "Bestellstatistik konnte nicht geladen werden:",
          orderError,
        );
        if (mounted) setOrders([]);
      }
    }

    void loadOrderStats();

    return () => {
      mounted = false;
    };
  }, []);

  const items = useMemo(
    () => buildFullCatalog(databaseItems),
    [databaseItems],
  );

  const itemStats = useMemo(() => {
    const stats = new Map<string, ItemStats>();

    for (const order of orders) {
      const counted = new Set<string>();

      for (const item of order.items) {
        const key = normalizeItemName(item.name);

        const existing =
          stats.get(key) ?? {
            amount: 0,
            stacks: 0,
            orders: 0,
          };

        existing.amount += item.amount;
        existing.stacks += item.stacks;

        if (!counted.has(key)) {
          existing.orders += 1;
          counted.add(key);
        }

        stats.set(key, existing);
      }
    }

    return stats;
  }, [orders]);

  const filteredItems = useMemo(() => {
    const text = normalizeItemName(search);

    if (!text) return items;

    return items.filter((item) => {
      const itemId = normalizeId(item.id || item.name);

      // Search in both English/DB name and the complete German Minecraft
      // name catalogue. This means e.g. "Fichtenholzbretter" finds
      // spruce_planks even when the database stores the English ID/name.
      const germanName =
        MINECRAFT_GERMAN_NAMES[itemId] ?? "";

      // Suche auf Deutsch UND Englisch, Anzeige bleibt Englisch.
      return [
        item.name,
        item.id,
        itemId,
        germanName,
      ].some((value) =>
        normalizeItemName(value).includes(text),
      );
    });
  }, [items, search]);

  const usedItemsCount = items.filter((item) =>
    itemStats.has(normalizeItemName(item.name)),
  ).length;

  const selectedStats = selectedItem
    ? itemStats.get(normalizeItemName(selectedItem.name))
    : undefined;

  async function handleCreateItem(
    presetName?: string,
  ) {
    if (!canCreate) return;

    const name = (presetName ?? newName).trim();
    const price = Number(newPrice.replace(",", "."));

    if (!name) {
      setError("Bitte einen Item-Namen eingeben.");
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setError("Bitte einen gültigen Preis eingeben.");
      return;
    }

    setSaving(true);
    setError("");

    const id = normalizeId(name);

    const { error: insertError } = await supabase
      .from("items")
      .insert({ id, name, price });

    if (insertError) {
      console.error("Item erstellen:", insertError);
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setNewName("");
    setNewPrice("");
    setShowCreate(false);
    setSelectedItem(null);

    await loadItems();
    setSaving(false);
  }

  function startEdit(item: CatalogItem) {
    if (!item.inDatabase) {
      setNewName(item.name);
      setNewPrice("");
      setShowCreate(true);
      setSelectedItem(null);
      return;
    }

    if (!canEdit && !canChangePrice) return;

    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setSelectedItem(null);
  }

  async function handleUpdateItem() {
    if (
      !editingItem ||
      (!canEdit && !canChangePrice)
    ) {
      return;
    }

    const name = editName.trim();
    const price = Number(editPrice.replace(",", "."));

    if (canEdit && !name) {
      setError("Bitte einen Item-Namen eingeben.");
      return;
    }

    if (
      canChangePrice &&
      (Number.isNaN(price) || price < 0)
    ) {
      setError("Bitte einen gültigen Preis eingeben.");
      return;
    }

    setSaving(true);
    setError("");

    const updateData: Partial<DatabaseItem> = {};

    if (canEdit) updateData.name = name;
    if (canChangePrice) updateData.price = price;

    const { error: updateError } = await supabase
      .from("items")
      .update(updateData)
      .eq("id", editingItem.id);

    if (updateError) {
      console.error("Item bearbeiten:", updateError);
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setEditingItem(null);
    await loadItems();
    setSaving(false);
  }

  async function handleDeleteItem(item: CatalogItem) {
    if (!canDelete || !item.inDatabase) return;

    if (!window.confirm(`Item „${item.name}“ wirklich löschen?`)) {
      return;
    }

    setSaving(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("items")
      .delete()
      .eq("id", item.id);

    if (deleteError) {
      console.error("Item löschen:", deleteError);
      setError(deleteError.message);
      setSaving(false);
      return;
    }

    setSelectedItem(null);
    await loadItems();
    setSaving(false);
  }

  if (permissionsLoading) {
    return (
      <main className="items-page">
        <div className="items-loading">
          <div className="items-spinner" />
          <p>System wird geladen...</p>
        </div>
      </main>
    );
  }

  if (!canView) {
    return (
      <main className="items-page">
        <div className="items-permission">
          <div className="items-permission-icon">🔒</div>
          <h2>Keine Berechtigung</h2>
          <p>Du hast keine Berechtigung für die Item-Datenbank.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="items-page">
      <div className="items-page-glow items-page-glow-one" />
      <div className="items-page-glow items-page-glow-two" />

      <div className="items-shell">
        <header className="items-header">
          <div className="items-title-wrap">
            <div className="items-title-icon">
              <Boxes size={24} />
            </div>

            <div>
              <span className="items-eyebrow">FALCON SYSTEM</span>
              <h1>Falcon <span>Database</span></h1>
              <p>Alle verfügbaren Minecraft-Items an einem Ort.</p>
            </div>
          </div>

          {canCreate && (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="items-create-button"
            >
              <Plus size={17} />
              Item erstellen
            </button>
          )}
        </header>

        {error && (
          <div className="items-error">
            {error}
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Fehler schließen"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <section className="items-stats">
          <MiniStat
            icon={<Package size={18} />}
            label="Items"
            value={items.length.toLocaleString("de-DE")}
            description="verfügbar"
          />
          <MiniStat
            icon={<Database size={18} />}
            label="Datenbank"
            value={databaseItems.length.toLocaleString("de-DE")}
            description="mit Preis"
          />
          <MiniStat
            icon={<ClipboardList size={18} />}
            label="Verwendet"
            value={usedItemsCount.toLocaleString("de-DE")}
            description="in Bestellungen"
          />
        </section>

        <section className="items-panel">
          <div className="items-panel-head">
            <div>
              <div className="items-panel-kicker">
                <span className="items-live-dot" />
                ITEM-DATENBANK
              </div>
              <h2>
                {filteredItems.length.toLocaleString("de-DE")}
                <span> Items</span>
              </h2>
            </div>

            <div className="items-search">
              <span className="items-search-icon">
                <Search size={16} />
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Item suchen..."
                aria-label="Item suchen"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="items-search-clear"
                  aria-label="Suche löschen"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="items-loading-panel">
              <div className="items-spinner" />
              <p>Items werden geladen...</p>
            </div>
          ) : (
            <>
              <div className="items-grid">
                {filteredItems.map((item) => {
                  const stats = itemStats.get(
                    normalizeItemName(item.name),
                  );

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="item-card"
                    >
                      <div className="item-card-image">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                          />
                        ) : (
                          <span>{item.icon}</span>
                        )}

                        {!item.inDatabase && (
                          <span className="item-card-unpriced">
                            Kein Preis
                          </span>
                        )}

                        <span className="item-card-open">
                          <ChevronRight size={14} />
                        </span>
                      </div>

                      <div className="item-card-body">
                        <span className="item-card-name">
                          {item.name}
                        </span>

                        <div className="item-card-meta">
                          {item.inDatabase && (
                            <span>
                              {item.price.toLocaleString(
                                "de-DE",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )} $
                            </span>
                          )}

                          <span>
                            {item.stackSize}/Stack
                          </span>
                        </div>

                        {stats && stats.amount > 0 && (
                          <div className="item-card-used">
                            {stats.amount.toLocaleString("de-DE")} benötigt
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredItems.length === 0 && (
                <div className="items-empty">
                  <div className="items-empty-icon">
                    <Search size={24} />
                  </div>
                  <h3>Kein Item gefunden</h3>
                  <p>Versuch einen anderen Suchbegriff.</p>
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                  >
                    Suche zurücksetzen
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          stats={selectedStats}
          canEdit={canEdit || canChangePrice}
          canDelete={canDelete && selectedItem.inDatabase}
          canCreate={canCreate}
          saving={saving}
          onClose={() => setSelectedItem(null)}
          onEdit={() => startEdit(selectedItem)}
          onCreate={() => {
            setNewName(selectedItem.name);
            setNewPrice("");
            setShowCreate(true);
            setSelectedItem(null);
          }}
          onDelete={() => void handleDeleteItem(selectedItem)}
        />
      )}

      {showCreate && canCreate && (
        <Modal
          title="Neues Item"
          eyebrow="DATENBANK"
          icon={<Plus size={18} />}
          onClose={() => setShowCreate(false)}
        >
          <div className="items-form">
            <Field
              label="Item-Name"
              value={newName}
              onChange={setNewName}
              placeholder="z. B. Diamant"
            />

            <Field
              label="Preis pro Stack"
              value={newPrice}
              onChange={setNewPrice}
              placeholder="z. B. 125.50"
              type="number"
            />

            <button
              type="button"
              disabled={saving}
              onClick={() => void handleCreateItem()}
              className="items-modal-primary"
            >
              <Save size={16} />
              {saving ? "Speichern..." : "Item speichern"}
            </button>
          </div>
        </Modal>
      )}

      {editingItem && (canEdit || canChangePrice) && (
        <Modal
          title="Item bearbeiten"
          eyebrow="ITEM EDITOR"
          icon={<Pencil size={18} />}
          onClose={() => setEditingItem(null)}
        >
          <div className="items-form">
            {canEdit && (
              <Field
                label="Name"
                value={editName}
                onChange={setEditName}
              />
            )}

            {canChangePrice && (
              <Field
                label="Preis pro Stack"
                value={editPrice}
                onChange={setEditPrice}
                type="number"
              />
            )}

            <button
              type="button"
              disabled={saving}
              onClick={() => void handleUpdateItem()}
              className="items-modal-primary"
            >
              <Save size={16} />
              {saving ? "Speichern..." : "Änderungen speichern"}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

function ItemDetailModal({
  item,
  stats,
  canEdit,
  canDelete,
  canCreate,
  saving,
  onClose,
  onEdit,
  onCreate,
  onDelete,
}: {
  item: CatalogItem;
  stats?: ItemStats;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  saving: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCreate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="items-modal-backdrop" onClick={onClose}>
      <div
        className="items-detail-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="items-detail-accent" />

        <button
          type="button"
          onClick={onClose}
          className="items-modal-close"
          aria-label="Schließen"
        >
          <X size={17} />
        </button>

        <div className="items-detail-top">
          <div className="items-detail-image">
            {item.image ? (
              <img src={item.image} alt={item.name} />
            ) : (
              <span>{item.icon}</span>
            )}
          </div>

          <div className="items-detail-heading">
            <span>ITEM DETAILS</span>
            <h2>{item.name}</h2>
            <p>
              {item.inDatabase
                ? "In der Falcon-Datenbank"
                : "Noch nicht in der Datenbank"}
            </p>
          </div>
        </div>

        <div className="items-detail-grid">
          <DetailStat
            label="Preis / Stack"
            value={
              item.inDatabase
                ? `${item.price.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} $`
                : "Nicht gesetzt"
            }
            highlight
          />
          <DetailStat
            label="Stackgröße"
            value={String(item.stackSize)}
          />
          <DetailStat
            label="Item ID"
            value={item.id}
          />
        </div>

        <div className="items-order-box">
          <div className="items-order-box-head">
            <span>
              <ClipboardList size={14} />
              BESTELLUNGEN
            </span>
          </div>

          <div className="items-order-stats">
            <DetailStat
              label="Menge"
              value={
                stats
                  ? stats.amount.toLocaleString("de-DE")
                  : "0"
              }
            />
            <DetailStat
              label="Stacks"
              value={
                stats
                  ? stats.stacks.toLocaleString("de-DE")
                  : "0"
              }
            />
            <DetailStat
              label="Bestellungen"
              value={stats ? String(stats.orders) : "0"}
            />
          </div>
        </div>

        {(canEdit || canDelete || (canCreate && !item.inDatabase)) && (
          <div className="items-detail-actions">
            {canCreate && !item.inDatabase && (
              <button
                type="button"
                onClick={onCreate}
                className="items-action-primary"
              >
                <Plus size={15} />
                Preis hinterlegen
              </button>
            )}

            {canEdit && item.inDatabase && (
              <button
                type="button"
                onClick={onEdit}
                className="items-action-secondary"
              >
                <Pencil size={15} />
                Bearbeiten
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                disabled={saving}
                onClick={onDelete}
                className="items-action-danger"
              >
                <Trash2 size={15} />
                Löschen
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Modal({
  title,
  eyebrow,
  icon,
  children,
  onClose,
}: {
  title: string;
  eyebrow: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="items-modal-backdrop" onClick={onClose}>
      <div
        className="items-form-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="items-modal-accent" />

        <div className="items-modal-heading">
          <div className="items-modal-icon">{icon}</div>
          <div>
            <span>{eyebrow}</span>
            <h2>{title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="items-modal-close"
          >
            <X size={17} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="items-field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function MiniStat({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="items-stat">
      <div className="items-stat-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
    </div>
  );
}

function DetailStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="items-detail-stat">
      <span>{label}</span>
      <strong className={highlight ? "is-highlight" : ""}>
        {value}
      </strong>
    </div>
  );
}