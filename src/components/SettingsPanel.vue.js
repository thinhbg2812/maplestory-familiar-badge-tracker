/// <reference types="../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { reactive, ref } from "vue";
import { useStorage } from "../composables/useStorage";
const { getSettings, updateSettings, exportData, importData, clearAll } = useStorage();
const settings = reactive(getSettings());
const importMsg = ref("");
const importSuccess = ref(false);
function updateThreshold(e) {
    const val = parseFloat(e.target.value);
    settings.threshold = val;
    updateSettings({ threshold: val });
}
function handleExport() {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maple-badge-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
function handleImport(e) {
    const target = e.target;
    const file = target.files?.[0];
    if (!file)
        return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const success = importData(ev.target.result);
        importSuccess.value = success;
        importMsg.value = success
            ? "✓ Data imported successfully!"
            : "✕ Failed to import — invalid JSON file.";
        Object.assign(settings, getSettings());
        setTimeout(() => {
            importMsg.value = "";
        }, 4000);
    };
    reader.readAsText(file);
    target.value = "";
}
function handleClear() {
    if (confirm("Are you sure you want to clear ALL data? This cannot be undone.")) {
        clearAll();
        Object.assign(settings, getSettings());
        importMsg.value = "✓ All data cleared.";
        importSuccess.value = true;
        setTimeout(() => {
            importMsg.value = "";
        }, 3000);
    }
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['threshold-control']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "settings animate-fade-in" },
});
/** @type {__VLS_StyleScopedClasses['settings']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "setting-section card" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['setting-section']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-sm text-muted" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "threshold-control" },
});
/** @type {__VLS_StyleScopedClasses['threshold-control']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onInput: (__VLS_ctx.updateThreshold) },
    type: "range",
    min: "0.3",
    max: "0.95",
    step: "0.01",
    value: (__VLS_ctx.settings.threshold),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "threshold-value" },
});
/** @type {__VLS_StyleScopedClasses['threshold-value']} */ ;
((__VLS_ctx.settings.threshold * 100).toFixed(0));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "threshold-labels flex justify-between text-xs text-muted" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['threshold-labels']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "setting-section card" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['setting-section']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-sm text-muted" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "data-actions flex gap-sm" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['data-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleExport) },
    ...{ class: "btn btn-ghost" },
});
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "btn btn-ghost upload-label" },
});
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onChange: (__VLS_ctx.handleImport) },
    type: "file",
    accept: ".json,application/json",
    ...{ class: "sr-only" },
});
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleClear) },
    ...{ class: "btn btn-danger" },
});
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-danger']} */ ;
if (__VLS_ctx.importMsg) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "import-msg text-sm" },
        ...{ style: ({
                color: __VLS_ctx.importSuccess ? 'var(--c-success)' : 'var(--c-danger)',
            }) },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['import-msg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (__VLS_ctx.importMsg);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "setting-section card" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['setting-section']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "about-content text-sm text-secondary" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['about-content']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-secondary']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ style: {} },
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://maplestorywiki.net/w/Familiars/Badges",
    target: "_blank",
    ...{ style: {} },
});
// @ts-ignore
[updateThreshold, settings, settings, handleExport, handleImport, handleClear, importMsg, importMsg, importSuccess,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
