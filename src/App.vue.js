/// <reference types="../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from "vue";
import AppHeader from "./components/AppHeader.vue";
import BadgeList from "./components/BadgeList.vue";
import Dashboard from "./components/Dashboard.vue";
import ReferenceUploader from "./components/ReferenceUploader.vue";
import ScreenshotScanner from "./components/ScreenshotScanner.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import { useOpenCV } from "./composables/useOpenCV";
const { cvReady, cvLoading } = useOpenCV();
const currentTab = ref("scanner");
const views = {
    dashboard: Dashboard,
    scanner: ScreenshotScanner,
    references: ReferenceUploader,
    badges: BadgeList,
    settings: SettingsPanel,
};
const currentView = computed(() => views[currentTab.value] || Dashboard);
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-layout" },
});
/** @type {__VLS_StyleScopedClasses['app-layout']} */ ;
const __VLS_0 = AppHeader;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onNavigate': {} },
    currentTab: (__VLS_ctx.currentTab),
    cvReady: (__VLS_ctx.cvReady),
    cvLoading: (__VLS_ctx.cvLoading),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onNavigate': {} },
    currentTab: (__VLS_ctx.currentTab),
    cvReady: (__VLS_ctx.cvReady),
    cvLoading: (__VLS_ctx.cvLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ navigate: {} },
    { onNavigate: (...[$event]) => {
            __VLS_ctx.currentTab = $event;
            // @ts-ignore
            [currentTab, currentTab, cvReady, cvLoading,];
        } });
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "app-main" },
});
/** @type {__VLS_StyleScopedClasses['app-main']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-container" },
});
/** @type {__VLS_StyleScopedClasses['app-container']} */ ;
let __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.KeepAlive | typeof __VLS_components.KeepAlive} */
KeepAlive;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({}));
const __VLS_9 = __VLS_8({}, ...__VLS_functionalComponentArgsRest(__VLS_8));
const { default: __VLS_12 } = __VLS_10.slots;
const __VLS_13 = (__VLS_ctx.currentView);
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({}));
const __VLS_15 = __VLS_14({}, ...__VLS_functionalComponentArgsRest(__VLS_14));
// @ts-ignore
[currentView,];
var __VLS_10;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
