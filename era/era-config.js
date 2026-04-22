/*
 * Responsibility: centralize ERA app config, storage keys and small UI timings.
 * Exports: APP_TABS, HEADER_RESOURCES, LEGACY_STORAGE_KEY, PROFILES_STORAGE_KEY,
 * APP_META_STORAGE_KEY, ERA_UI_TIMINGS, ERA_VIEWPORT.
 */

const APP_TABS = [
  { id: "ficha", label: "FICHA", icon: "[]" },
  { id: "dados", label: "DADOS", icon: "d6" },
  { id: "combate", label: "COMBATE", icon: "ATK" },
  { id: "arsenal", label: "ARSENAL", icon: "EQP" },
  { id: "sistema", label: "SISTEMA", icon: "SYS" },
];

const HEADER_RESOURCES = [
  { key: "hp", color: "#DC2626", label: "HP" },
  { key: "sp", color: "#A78BFA", label: "SP" },
  { key: "pe", color: "#FCD34D", label: "PE" },
];

const LEGACY_STORAGE_KEY = "uh_char_v2";
const PROFILES_STORAGE_KEY = "uh_profiles_v1";
const APP_META_STORAGE_KEY = "uh_app_meta_v1";

const ERA_UI_TIMINGS = Object.freeze({
  ROLL_REVEAL_MS: 350,
});

const ERA_VIEWPORT = Object.freeze({
  MOBILE_BREAKPOINT: 768,
});
