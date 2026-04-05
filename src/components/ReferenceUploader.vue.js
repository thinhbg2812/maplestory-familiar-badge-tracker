/// <reference types="../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed } from 'vue';
import { useStorage } from '../composables/useStorage';
import { badges } from '../data/badges';
const { getReferenceImage, setReferenceImage, removeReferenceImage, getAllReferenceImagesWithBundled, } = useStorage();
const search = ref('');
const filter = ref('all');
const openGroups = ref({});
const filters = [
    { value: 'all', label: 'All' },
    { value: 'uploaded', label: 'Uploaded' },
    { value: 'missing', label: 'Missing' },
];
const uploadedCount = computed(() => Object.keys(getAllReferenceImagesWithBundled()).length);
const filteredBadges = computed(() => {
    return badges.filter((b) => {
        const refs = getAllReferenceImagesWithBundled();
        // search match
        if (search.value) {
            const q = search.value.toLowerCase();
            const nameMatch = b.name.toLowerCase().includes(q);
            const famMatch = b.familiars.some((f) => f.name.toLowerCase().includes(q));
            if (!nameMatch && !famMatch)
                return false;
        }
        // filter
        if (filter.value === 'uploaded') {
            return b.familiars.some((f) => refs[f.id]);
        }
        if (filter.value === 'missing') {
            return b.familiars.some((f) => !refs[f.id]);
        }
        return true;
    });
});
function getUploadedInBadge(badge) {
    const refs = getAllReferenceImagesWithBundled();
    return badge.familiars.filter((f) => refs[f.id]).length;
}
function toggleGroup(badgeId) {
    openGroups.value[badgeId] = !openGroups.value[badgeId];
}
function handleUpload(event, familiarId) {
    const target = event.target;
    const file = target.files?.[0];
    if (!file)
        return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        // Resize to MAX 64x64 to keep localStorage lean
        resizeImage(ev.target.result, 64, 64).then((resized) => {
            setReferenceImage(familiarId, resized);
        });
    };
    reader.readAsDataURL(file);
    // Reset input
    target.value = '';
}
function removeRef(familiarId) {
    removeReferenceImage(familiarId);
}
function resizeImage(dataURL, maxW, maxH) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let w = img.naturalWidth;
            let h = img.naturalHeight;
            if (w > maxW || h > maxH) {
                const ratio = Math.min(maxW / w, maxH / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/png'));
        };
        img.src = dataURL;
    });
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['group-header']} */ ;
/** @type {__VLS_StyleScopedClasses['expand-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['ref-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "ref-uploader animate-fade-in" },
});
/** @type {__VLS_StyleScopedClasses['ref-uploader']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "ref-header" },
});
/** @type {__VLS_StyleScopedClasses['ref-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-secondary text-sm" },
});
/** @type {__VLS_StyleScopedClasses['text-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "ref-stats" },
});
/** @type {__VLS_StyleScopedClasses['ref-stats']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "tag tag-accent" },
});
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-accent']} */ ;
(__VLS_ctx.uploadedCount);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "ref-filters" },
});
/** @type {__VLS_StyleScopedClasses['ref-filters']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ class: "input" },
    placeholder: "Search familiars…",
    type: "search",
});
(__VLS_ctx.search);
/** @type {__VLS_StyleScopedClasses['input']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "nav-tabs" },
});
/** @type {__VLS_StyleScopedClasses['nav-tabs']} */ ;
for (const [f] of __VLS_vFor((__VLS_ctx.filters))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.filter = f.value;
                // @ts-ignore
                [uploadedCount, search, filters, filter,];
            } },
        key: (f.value),
        ...{ class: "nav-tab" },
        ...{ class: ({ active: __VLS_ctx.filter === f.value }) },
    });
    /** @type {__VLS_StyleScopedClasses['nav-tab']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    (f.label);
    // @ts-ignore
    [filter,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "badge-groups" },
});
/** @type {__VLS_StyleScopedClasses['badge-groups']} */ ;
for (const [badge] of __VLS_vFor((__VLS_ctx.filteredBadges))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (badge.id),
        ...{ class: "ref-group card" },
    });
    /** @type {__VLS_StyleScopedClasses['ref-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.toggleGroup(badge.id);
                // @ts-ignore
                [filteredBadges, toggleGroup,];
            } },
        ...{ class: "group-header" },
    });
    /** @type {__VLS_StyleScopedClasses['group-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "group-name" },
    });
    /** @type {__VLS_StyleScopedClasses['group-name']} */ ;
    (badge.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "group-meta" },
    });
    /** @type {__VLS_StyleScopedClasses['group-meta']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "tag tag-primary" },
    });
    /** @type {__VLS_StyleScopedClasses['tag']} */ ;
    /** @type {__VLS_StyleScopedClasses['tag-primary']} */ ;
    (__VLS_ctx.getUploadedInBadge(badge));
    (badge.familiars.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "expand-arrow" },
        ...{ class: ({ open: __VLS_ctx.openGroups[badge.id] }) },
    });
    /** @type {__VLS_StyleScopedClasses['expand-arrow']} */ ;
    /** @type {__VLS_StyleScopedClasses['open']} */ ;
    if (__VLS_ctx.openGroups[badge.id]) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "group-familiars" },
        });
        /** @type {__VLS_StyleScopedClasses['group-familiars']} */ ;
        for (const [familiar] of __VLS_vFor((badge.familiars))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (familiar.id),
                ...{ class: "ref-item" },
            });
            /** @type {__VLS_StyleScopedClasses['ref-item']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ref-preview" },
            });
            /** @type {__VLS_StyleScopedClasses['ref-preview']} */ ;
            if (__VLS_ctx.getReferenceImage(familiar.id) || familiar.icon) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                    src: (__VLS_ctx.getReferenceImage(familiar.id) || familiar.icon),
                    alt: (familiar.name),
                    ...{ class: "ref-thumb" },
                });
                /** @type {__VLS_StyleScopedClasses['ref-thumb']} */ ;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "ref-placeholder" },
                });
                /** @type {__VLS_StyleScopedClasses['ref-placeholder']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ref-info" },
            });
            /** @type {__VLS_StyleScopedClasses['ref-info']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ref-name" },
            });
            /** @type {__VLS_StyleScopedClasses['ref-name']} */ ;
            (familiar.name);
            if (familiar.boosterOnly) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-xs" },
                    ...{ style: {} },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            }
            if (familiar.icon) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-xs" },
                    ...{ style: {} },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ref-actions" },
            });
            /** @type {__VLS_StyleScopedClasses['ref-actions']} */ ;
            if (familiar.icon && !__VLS_ctx.getReferenceImage(familiar.id)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "tag tag-success" },
                });
                /** @type {__VLS_StyleScopedClasses['tag']} */ ;
                /** @type {__VLS_StyleScopedClasses['tag-success']} */ ;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
                    ...{ class: "btn btn-ghost btn-sm upload-label" },
                });
                /** @type {__VLS_StyleScopedClasses['btn']} */ ;
                /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
                /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['upload-label']} */ ;
                (__VLS_ctx.getReferenceImage(familiar.id) ? 'Replace' : 'Upload');
                __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                    ...{ onChange: ((e) => __VLS_ctx.handleUpload(e, familiar.id)) },
                    type: "file",
                    accept: "image/*",
                    ...{ class: "sr-only" },
                });
                /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
            }
            if (__VLS_ctx.getReferenceImage(familiar.id)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.openGroups[badge.id]))
                                return;
                            if (!(__VLS_ctx.getReferenceImage(familiar.id)))
                                return;
                            __VLS_ctx.removeRef(familiar.id);
                            // @ts-ignore
                            [getUploadedInBadge, openGroups, openGroups, getReferenceImage, getReferenceImage, getReferenceImage, getReferenceImage, getReferenceImage, handleUpload, removeRef,];
                        } },
                    ...{ class: "btn btn-ghost btn-sm btn-icon" },
                    title: "Remove",
                });
                /** @type {__VLS_StyleScopedClasses['btn']} */ ;
                /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
                /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
            }
            // @ts-ignore
            [];
        }
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
