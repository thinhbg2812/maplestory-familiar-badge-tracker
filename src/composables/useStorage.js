import { ref, watch } from "vue";
import { badges } from "../data/badges";
const STORAGE_KEY = "maple-badge-tracker";
function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    }
    catch {
        return {};
    }
}
function save(data) {
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
const state = ref(load());
// Persist every mutation
watch(state, (v) => save(v), { deep: true });
export function useStorage() {
    /* ── Collected familiars ─────────────────────────────────────── */
    function isCollected(familiarId) {
        return !!(state.value.collected && state.value.collected[familiarId]);
    }
    function setCollected(familiarId, value = true) {
        if (!state.value.collected)
            state.value.collected = {};
        state.value.collected[familiarId] = value;
    }
    function toggleCollected(familiarId) {
        setCollected(familiarId, !isCollected(familiarId));
    }
    function bulkSetCollected(familiarIds) {
        if (!state.value.collected)
            state.value.collected = {};
        familiarIds.forEach((id) => {
            state.value.collected[id] = true;
        });
    }
    /* ── Reference images ────────────────────────────────────────── */
    function getReferenceImage(familiarId) {
        return state.value.references?.[familiarId] ?? null;
    }
    function setReferenceImage(familiarId, dataURL) {
        if (!state.value.references)
            state.value.references = {};
        state.value.references[familiarId] = dataURL;
    }
    function removeReferenceImage(familiarId) {
        if (state.value.references) {
            delete state.value.references[familiarId];
        }
    }
    function getAllReferenceImages() {
        return state.value.references ?? {};
    }
    function getReferenceCount() {
        return Object.keys(state.value.references ?? {}).length;
    }
    /** Build a map of bundled (asset) icons: familiarId → URL */
    function getBundledReferenceImages() {
        const bundled = {};
        for (const badge of badges) {
            for (const f of badge.familiars) {
                if (f.icon)
                    bundled[f.id] = f.icon;
            }
        }
        return bundled;
    }
    /** Merge bundled + user-uploaded references (uploaded takes priority) */
    function getAllReferenceImagesWithBundled() {
        return {
            ...getBundledReferenceImages(),
            ...getAllReferenceImages(),
        };
    }
    function getReferenceCountWithBundled() {
        return Object.keys(getAllReferenceImagesWithBundled()).length;
    }
    /** Check if a familiar has a bundled icon */
    function hasBundledIcon(familiarId) {
        for (const badge of badges) {
            for (const f of badge.familiars) {
                if (f.id === familiarId && f.icon)
                    return true;
            }
        }
        return false;
    }
    function getBundledIcon(familiarId) {
        for (const badge of badges) {
            for (const f of badge.familiars) {
                if (f.id === familiarId && f.icon)
                    return f.icon;
            }
        }
        return null;
    }
    /* ── Settings ────────────────────────────────────────────────── */
    function getSettings() {
        return {
            threshold: 0.87,
            ...state.value.settings,
        };
    }
    function updateSettings(patch) {
        state.value.settings = { ...getSettings(), ...patch };
    }
    /* ── Data management ─────────────────────────────────────────── */
    function exportData() {
        return JSON.stringify(state.value, null, 2);
    }
    function importData(json) {
        try {
            state.value = JSON.parse(json);
            return true;
        }
        catch {
            return false;
        }
    }
    function clearAll() {
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
