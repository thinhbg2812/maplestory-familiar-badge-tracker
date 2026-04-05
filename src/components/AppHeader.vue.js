/// <reference types="../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
const __VLS_props = defineProps();
const __VLS_emit = defineEmits();
const tabs = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'scanner', icon: '🔍', label: 'Scanner' },
    { id: 'references', icon: '🖼️', label: 'References' },
    { id: 'badges', icon: '🏅', label: 'Badges' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
];
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['header-brand']} */ ;
/** @type {__VLS_StyleScopedClasses['header-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-sub']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "app-header" },
});
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-inner" },
});
/** @type {__VLS_StyleScopedClasses['header-inner']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-brand" },
});
/** @type {__VLS_StyleScopedClasses['header-brand']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "brand-icon" },
});
/** @type {__VLS_StyleScopedClasses['brand-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "brand-text" },
});
/** @type {__VLS_StyleScopedClasses['brand-text']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "brand-title" },
});
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "brand-sub" },
});
/** @type {__VLS_StyleScopedClasses['brand-sub']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "header-nav" },
});
/** @type {__VLS_StyleScopedClasses['header-nav']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "nav-tabs" },
});
/** @type {__VLS_StyleScopedClasses['nav-tabs']} */ ;
for (const [tab] of __VLS_vFor((__VLS_ctx.tabs))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$emit('navigate', tab.id);
                // @ts-ignore
                [tabs, $emit,];
            } },
        key: (tab.id),
        ...{ class: "nav-tab" },
        ...{ class: ({ active: __VLS_ctx.currentTab === tab.id }) },
    });
    /** @type {__VLS_StyleScopedClasses['nav-tab']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "nav-tab-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['nav-tab-icon']} */ ;
    (tab.icon);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "nav-tab-label" },
    });
    /** @type {__VLS_StyleScopedClasses['nav-tab-label']} */ ;
    (tab.label);
    // @ts-ignore
    [currentTab,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-status" },
});
/** @type {__VLS_StyleScopedClasses['header-status']} */ ;
if (__VLS_ctx.cvLoading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "status-item status-loading" },
    });
    /** @type {__VLS_StyleScopedClasses['status-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-loading']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "spinner" },
    });
    /** @type {__VLS_StyleScopedClasses['spinner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.cvReady) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "status-item status-ready" },
    });
    /** @type {__VLS_StyleScopedClasses['status-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-ready']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "status-dot ready" },
    });
    /** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['ready']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "status-item status-idle" },
    });
    /** @type {__VLS_StyleScopedClasses['status-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-idle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "status-dot idle" },
    });
    /** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['idle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
// @ts-ignore
[cvLoading, cvReady,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
