/// <reference types="../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed } from 'vue';
import { useBadgeTracker } from '../composables/useBadgeTracker';
const props = defineProps();
const { badgeProgress, isCollected, toggleCollected } = useBadgeTracker();
const expanded = ref(false);
const progress = computed(() => badgeProgress.value[props.badge.id] ?? { total: 0, collected: 0, percent: 0, complete: false });
const categoryLabel = computed(() => props.badge.category === 'booster-required' ? 'Booster Required' : 'No Booster');
const categoryTag = computed(() => props.badge.category === 'booster-required' ? 'tag-warning' : 'tag-success');
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['badge-percent']} */ ;
/** @type {__VLS_StyleScopedClasses['familiar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['familiar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['familiar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['collected']} */ ;
/** @type {__VLS_StyleScopedClasses['familiar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['collected']} */ ;
/** @type {__VLS_StyleScopedClasses['familiar-check']} */ ;
/** @type {__VLS_StyleScopedClasses['familiar-name']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "badge-card card" },
    ...{ class: ({ 'card-glow': __VLS_ctx.progress.complete, 'card-hover': !__VLS_ctx.progress.complete }) },
});
/** @type {__VLS_StyleScopedClasses['badge-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['card-hover']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "badge-header" },
});
/** @type {__VLS_StyleScopedClasses['badge-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "badge-info" },
});
/** @type {__VLS_StyleScopedClasses['badge-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "badge-name" },
});
/** @type {__VLS_StyleScopedClasses['badge-name']} */ ;
(__VLS_ctx.badge.name);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "tag" },
    ...{ class: (__VLS_ctx.categoryTag) },
});
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
(__VLS_ctx.categoryLabel);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "badge-percent" },
    ...{ class: ({ complete: __VLS_ctx.progress.complete }) },
});
/** @type {__VLS_StyleScopedClasses['badge-percent']} */ ;
/** @type {__VLS_StyleScopedClasses['complete']} */ ;
(__VLS_ctx.progress.percent);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "badge-effects" },
});
/** @type {__VLS_StyleScopedClasses['badge-effects']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "effects-label" },
});
/** @type {__VLS_StyleScopedClasses['effects-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "effects-value" },
});
/** @type {__VLS_StyleScopedClasses['effects-value']} */ ;
(__VLS_ctx.badge.effects);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "progress-bar" },
});
/** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "progress-bar-fill" },
    ...{ class: ({ complete: __VLS_ctx.progress.complete }) },
    ...{ style: ({ width: __VLS_ctx.progress.percent + '%' }) },
});
/** @type {__VLS_StyleScopedClasses['progress-bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['complete']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "badge-count" },
});
/** @type {__VLS_StyleScopedClasses['badge-count']} */ ;
(__VLS_ctx.progress.collected);
(__VLS_ctx.progress.total);
if (__VLS_ctx.progress.complete) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "complete-badge" },
    });
    /** @type {__VLS_StyleScopedClasses['complete-badge']} */ ;
}
if (__VLS_ctx.expanded) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "badge-familiars" },
    });
    /** @type {__VLS_StyleScopedClasses['badge-familiars']} */ ;
    for (const [familiar] of __VLS_vFor((__VLS_ctx.badge.familiars))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.expanded))
                        return;
                    __VLS_ctx.toggleCollected(familiar.id);
                    // @ts-ignore
                    [progress, progress, progress, progress, progress, progress, progress, progress, progress, badge, badge, badge, categoryTag, categoryLabel, expanded, toggleCollected,];
                } },
            key: (familiar.id),
            ...{ class: "familiar-item" },
            ...{ class: ({
                    collected: __VLS_ctx.isCollected(familiar.id),
                    'booster-only': familiar.boosterOnly,
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['familiar-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['collected']} */ ;
        /** @type {__VLS_StyleScopedClasses['booster-only']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "familiar-check" },
        });
        /** @type {__VLS_StyleScopedClasses['familiar-check']} */ ;
        if (__VLS_ctx.isCollected(familiar.id)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                viewBox: "0 0 16 16",
                fill: "currentColor",
                width: "12",
                height: "12",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z",
            });
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "familiar-name" },
        });
        /** @type {__VLS_StyleScopedClasses['familiar-name']} */ ;
        (familiar.name);
        if (familiar.boosterOnly) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "tag tag-warning" },
                ...{ style: {} },
            });
            /** @type {__VLS_StyleScopedClasses['tag']} */ ;
            /** @type {__VLS_StyleScopedClasses['tag-warning']} */ ;
        }
        // @ts-ignore
        [isCollected, isCollected,];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.expanded = !__VLS_ctx.expanded;
            // @ts-ignore
            [expanded, expanded,];
        } },
    ...{ class: "btn btn-ghost btn-sm expand-btn" },
});
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['expand-btn']} */ ;
(__VLS_ctx.expanded ? 'Hide Familiars ▲' : 'Show Familiars ▼');
// @ts-ignore
[expanded,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
