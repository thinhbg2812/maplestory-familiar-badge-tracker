/// <reference types="../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed } from 'vue';
import { useBadgeTracker } from '../composables/useBadgeTracker';
import BadgeCard from './BadgeCard.vue';
const { badges, filterBadges, completedBadges } = useBadgeTracker();
const search = ref('');
const category = ref('all');
const categories = [
    { value: 'all', label: 'All' },
    { value: 'no-booster', label: 'No Booster' },
    { value: 'booster-required', label: 'Booster Required' },
];
const filteredBadges = computed(() => filterBadges(search.value, category.value));
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['badges-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "badge-list animate-fade-in" },
});
/** @type {__VLS_StyleScopedClasses['badge-list']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "list-header" },
});
/** @type {__VLS_StyleScopedClasses['list-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "list-stats text-sm text-secondary" },
});
/** @type {__VLS_StyleScopedClasses['list-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-secondary']} */ ;
(__VLS_ctx.completedBadges);
(__VLS_ctx.badges.length);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "list-filters" },
});
/** @type {__VLS_StyleScopedClasses['list-filters']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ class: "input" },
    placeholder: "Search badges or familiars…",
    type: "search",
});
(__VLS_ctx.search);
/** @type {__VLS_StyleScopedClasses['input']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "nav-tabs" },
});
/** @type {__VLS_StyleScopedClasses['nav-tabs']} */ ;
for (const [cat] of __VLS_vFor((__VLS_ctx.categories))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.category = cat.value;
                // @ts-ignore
                [completedBadges, badges, search, categories, category,];
            } },
        key: (cat.value),
        ...{ class: "nav-tab" },
        ...{ class: ({ active: __VLS_ctx.category === cat.value }) },
    });
    /** @type {__VLS_StyleScopedClasses['nav-tab']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    (cat.label);
    // @ts-ignore
    [category,];
}
if (__VLS_ctx.filteredBadges.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "badges-grid stagger" },
    });
    /** @type {__VLS_StyleScopedClasses['badges-grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['stagger']} */ ;
    for (const [badge] of __VLS_vFor((__VLS_ctx.filteredBadges))) {
        const __VLS_0 = BadgeCard;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            key: (badge.id),
            badge: (badge),
        }));
        const __VLS_2 = __VLS_1({
            key: (badge.id),
            badge: (badge),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        // @ts-ignore
        [filteredBadges, filteredBadges,];
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-state" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-state-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-state-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-state-title" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-state-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-state-text" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-state-text']} */ ;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
