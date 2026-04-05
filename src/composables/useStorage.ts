import { ref, watch } from "vue";
import type { Ref } from "vue";
import { badges } from "../data/badges";
import type { Settings, StorageState } from "../types/index";

const STORAGE_KEY = "maple-badge-tracker";

function load(): StorageState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StorageState) : {};
  } catch {
    return {};
  }
}

function save(data: StorageState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Global reactive store backed by localStorage.
 *
 * Shape:
 *   collectedFamiliars : Set<string>   – familiar IDs marked as collected
 *   referenceImages    : Record<string, string>  – familiarId → base64 dataURL
 *   settings           : { threshold: number }
 */
const state: Ref<StorageState> = ref(load());

// Persist every mutation
watch(state, (v) => save(v), { deep: true });

export function useStorage() {
  /* ── Collected familiars ─────────────────────────────────────── */
  function isCollected(familiarId: string): boolean {
    return !!(state.value.collected && state.value.collected[familiarId]);
  }

  function setCollected(familiarId: string, value = true): void {
    if (!state.value.collected) state.value.collected = {};
    state.value.collected[familiarId] = value;
  }

  function toggleCollected(familiarId: string): void {
    setCollected(familiarId, !isCollected(familiarId));
  }

  function bulkSetCollected(familiarIds: string[]): void {
    if (!state.value.collected) state.value.collected = {};
    familiarIds.forEach((id) => {
      state.value.collected![id] = true;
    });
  }

  /* ── Reference images ────────────────────────────────────────── */
  function getReferenceImage(familiarId: string): string | null {
    return state.value.references?.[familiarId] ?? null;
  }

  function setReferenceImage(familiarId: string, dataURL: string): void {
    if (!state.value.references) state.value.references = {};
    state.value.references[familiarId] = dataURL;
  }

  function removeReferenceImage(familiarId: string): void {
    if (state.value.references) {
      delete state.value.references[familiarId];
    }
  }

  function getAllReferenceImages(): Record<string, string> {
    return state.value.references ?? {};
  }

  function getReferenceCount(): number {
    return Object.keys(state.value.references ?? {}).length;
  }

  /** Build a map of bundled (asset) icons: familiarId → URL */
  function getBundledReferenceImages(): Record<string, string> {
    const bundled: Record<string, string> = {};
    for (const badge of badges) {
      for (const f of badge.familiars) {
        if (f.icon) bundled[f.id] = f.icon;
      }
    }
    return bundled;
  }

  /** Merge bundled + user-uploaded references (uploaded takes priority) */
  function getAllReferenceImagesWithBundled(): Record<string, string> {
    return {
      ...getBundledReferenceImages(),
      ...getAllReferenceImages(),
    };
  }

  function getReferenceCountWithBundled(): number {
    return Object.keys(getAllReferenceImagesWithBundled()).length;
  }

  /** Check if a familiar has a bundled icon */
  function hasBundledIcon(familiarId: string): boolean {
    for (const badge of badges) {
      for (const f of badge.familiars) {
        if (f.id === familiarId && f.icon) return true;
      }
    }
    return false;
  }

  function getBundledIcon(familiarId: string): string | null {
    for (const badge of badges) {
      for (const f of badge.familiars) {
        if (f.id === familiarId && f.icon) return f.icon;
      }
    }
    return null;
  }

  /* ── Settings ────────────────────────────────────────────────── */
  function getSettings(): Settings {
    return {
      threshold: 0.87,
      ...state.value.settings,
    };
  }

  function updateSettings(patch: Partial<Settings>): void {
    state.value.settings = { ...getSettings(), ...patch };
  }

  /* ── Data management ─────────────────────────────────────────── */
  function exportData(): string {
    return JSON.stringify(state.value, null, 2);
  }

  function importData(json: string): boolean {
    try {
      state.value = JSON.parse(json) as StorageState;
      return true;
    } catch {
      return false;
    }
  }

  function clearAll(): void {
    state.value = {};
  }

  return {
    state,
    isCollected,
    setCollected,
    toggleCollected,
    bulkSetCollected,
    getReferenceImage,
    setReferenceImage,
    removeReferenceImage,
    getAllReferenceImages,
    getAllReferenceImagesWithBundled,
    getReferenceCount,
    getReferenceCountWithBundled,
    hasBundledIcon,
    getBundledIcon,
    getSettings,
    updateSettings,
    exportData,
    importData,
    clearAll,
  };
}
