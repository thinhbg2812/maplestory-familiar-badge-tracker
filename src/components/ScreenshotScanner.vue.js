/// <reference types="../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted } from 'vue';
import { useOpenCV } from '../composables/useOpenCV';
import { useStorage } from '../composables/useStorage';
import { useBadgeTracker } from '../composables/useBadgeTracker';
import { badges } from '../data/badges';
// Test image (available in public folder)
const testImageUrl = '/test-images/test-have-starter.png';
const { cvReady, cvLoading, cvError, loadOpenCV, scanScreenshot } = useOpenCV();
const { getAllReferenceImagesWithBundled, getReferenceImage, getReferenceCountWithBundled, getBundledIcon, getSettings } = useStorage();
const { isCollected, bulkSetCollected } = useBadgeTracker();
const pasteZone = ref(null);
const previewCanvas = ref(null);
const screenshotSrc = ref(null);
const isDragging = ref(false);
const scanning = ref(false);
const scanProgress = ref(null);
const scanResults = ref(null);
const referenceCount = getReferenceCountWithBundled();
onMounted(() => {
    if (!cvReady.value && !cvLoading.value) {
        loadOpenCV().catch((err) => console.error("Failed to auto-load OpenCV", err));
    }
});
const hasTestImage = !!testImageUrl;
function loadTestImage() {
    if (!testImageUrl)
        return;
    screenshotSrc.value = testImageUrl;
    scanResults.value = null;
    drawPreview(testImageUrl);
}
function handleFileUpload(e) {
    const target = e.target;
    const file = target.files?.[0];
    if (!file)
        return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        screenshotSrc.value = ev.target.result;
        scanResults.value = null;
        drawPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
    target.value = '';
}
// Build a flat lookup: familiarId → name
const familiarMap = {};
for (const b of badges) {
    for (const f of b.familiars) {
        familiarMap[f.id] = f.name;
    }
}
function getFamiliarName(id) {
    return familiarMap[id] || id;
}
const newDetectedCount = computed(() => {
    if (!scanResults.value)
        return 0;
    return scanResults.value.filter((r) => !isCollected(r.familiarId)).length;
});
async function initCV() {
    try {
        await loadOpenCV();
    }
    catch (e) {
        console.error('Failed to load OpenCV:', e);
    }
}
function focusPasteZone() {
    pasteZone.value?.focus();
}
function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items)
        return;
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            e.preventDefault();
            const blob = item.getAsFile();
            if (!blob)
                return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                screenshotSrc.value = ev.target.result;
                scanResults.value = null;
                drawPreview(ev.target.result);
            };
            reader.readAsDataURL(blob);
            return;
        }
    }
}
function drawPreview(dataURL) {
    const img = new Image();
    img.onload = () => {
        const canvas = previewCanvas.value;
        if (!canvas)
            return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
    };
    img.src = dataURL;
}
function clearScreenshot() {
    screenshotSrc.value = null;
    scanResults.value = null;
    scanProgress.value = null;
}
async function runScan() {
    if (!cvReady.value || !previewCanvas.value)
        return;
    scanning.value = true;
    scanProgress.value = 'Preparing…';
    scanResults.value = null;
    try {
        const refs = getAllReferenceImagesWithBundled();
        const settings = getSettings();
        scanProgress.value = `Scanning against ${Object.keys(refs).length} reference(s)…`;
        // Use requestAnimationFrame to allow UI to update
        await new Promise((r) => requestAnimationFrame(r));
        const results = await scanScreenshot(previewCanvas.value, refs, {
            threshold: settings.threshold,
            scales: [0.5, 0.75, 1.0, 1.25, 1.5],
        });
        scanResults.value = results;
        // Draw match rectangles on preview canvas
        if (results.length > 0) {
            drawMatchRects(results);
        }
    }
    catch (err) {
        console.error('Scan error:', err);
        scanResults.value = [];
    }
    finally {
        scanning.value = false;
        scanProgress.value = null;
    }
}
function drawMatchRects(results) {
    const canvas = previewCanvas.value;
    if (!canvas)
        return;
    const ctx = canvas.getContext('2d');
    // Redraw original image first
    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0);
        ctx.strokeStyle = '#34c759';
        ctx.lineWidth = 3;
        ctx.font = '14px Inter, sans-serif';
        ctx.fillStyle = 'rgba(52, 199, 89, 0.2)';
        for (const result of results) {
            for (const match of result.matches) {
                ctx.fillRect(match.x, match.y, match.w, match.h);
                ctx.strokeRect(match.x, match.y, match.w, match.h);
                // Label
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(match.x, match.y - 18, match.w, 18);
                ctx.fillStyle = '#fff';
                ctx.fillText(`${(match.confidence * 100).toFixed(0)}%`, match.x + 4, match.y - 4);
                ctx.fillStyle = 'rgba(52, 199, 89, 0.2)';
            }
        }
    };
    img.src = screenshotSrc.value;
}
function markAllDetected() {
    if (!scanResults.value)
        return;
    const ids = scanResults.value
        .filter((r) => !isCollected(r.familiarId))
        .map((r) => r.familiarId);
    bulkSetCollected(ids);
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['paste-zone']} */ ;
/** @type {__VLS_StyleScopedClasses['paste-zone']} */ ;
/** @type {__VLS_StyleScopedClasses['results-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "scanner animate-fade-in" },
});
/** @type {__VLS_StyleScopedClasses['scanner']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-secondary text-sm" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['text-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
if (!__VLS_ctx.cvReady) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    if (__VLS_ctx.cvLoading) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-sm']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "spinner" },
        });
        /** @type {__VLS_StyleScopedClasses['spinner']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.initCV) },
            ...{ class: "btn btn-primary" },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        if (__VLS_ctx.cvError) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm" },
                ...{ style: {} },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (__VLS_ctx.cvError);
        }
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onPaste: (__VLS_ctx.handlePaste) },
    ...{ onClick: (__VLS_ctx.focusPasteZone) },
    ...{ class: "paste-zone card" },
    ...{ class: ({
            'paste-active': __VLS_ctx.isDragging,
            'has-image': __VLS_ctx.screenshotSrc,
        }) },
    tabindex: "0",
    ref: "pasteZone",
});
/** @type {__VLS_StyleScopedClasses['paste-zone']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['paste-active']} */ ;
/** @type {__VLS_StyleScopedClasses['has-image']} */ ;
if (!__VLS_ctx.screenshotSrc) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "paste-placeholder" },
    });
    /** @type {__VLS_StyleScopedClasses['paste-placeholder']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "paste-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['paste-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "paste-title" },
    });
    /** @type {__VLS_StyleScopedClasses['paste-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "paste-hint text-sm text-muted" },
    });
    /** @type {__VLS_StyleScopedClasses['paste-hint']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "paste-actions" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['paste-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "btn btn-ghost btn-sm upload-label" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['upload-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onChange: (__VLS_ctx.handleFileUpload) },
        type: "file",
        accept: "image/*",
        ...{ class: "sr-only" },
    });
    /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
    if (__VLS_ctx.hasTestImage) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.loadTestImage) },
            ...{ class: "btn btn-ghost btn-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "paste-preview" },
    });
    /** @type {__VLS_StyleScopedClasses['paste-preview']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.canvas, __VLS_intrinsics.canvas)({
        ref: "previewCanvas",
        ...{ class: "preview-canvas" },
    });
    /** @type {__VLS_StyleScopedClasses['preview-canvas']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.clearScreenshot) },
        ...{ class: "btn btn-ghost btn-sm clear-btn" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
}
if (__VLS_ctx.screenshotSrc && __VLS_ctx.cvReady) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "scan-controls" },
    });
    /** @type {__VLS_StyleScopedClasses['scan-controls']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.runScan) },
        ...{ class: "btn btn-accent" },
        disabled: (__VLS_ctx.scanning || __VLS_ctx.referenceCount === 0),
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-accent']} */ ;
    if (__VLS_ctx.scanning) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "spinner" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['spinner']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    (__VLS_ctx.scanning ? 'Scanning…' : 'Scan Screenshot');
    if (__VLS_ctx.referenceCount === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    }
    if (__VLS_ctx.scanProgress) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "scan-progress text-sm text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['scan-progress']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        (__VLS_ctx.scanProgress);
    }
}
if (__VLS_ctx.scanResults) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "results-section animate-slide-up" },
    });
    /** @type {__VLS_StyleScopedClasses['results-section']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-slide-up']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "tag tag-accent" },
    });
    /** @type {__VLS_StyleScopedClasses['tag']} */ ;
    /** @type {__VLS_StyleScopedClasses['tag-accent']} */ ;
    (__VLS_ctx.scanResults.length);
    if (__VLS_ctx.scanResults.length > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "results-list" },
        });
        /** @type {__VLS_StyleScopedClasses['results-list']} */ ;
        for (const [result] of __VLS_vFor((__VLS_ctx.scanResults))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (result.familiarId),
                ...{ class: "result-item card card-hover" },
            });
            /** @type {__VLS_StyleScopedClasses['result-item']} */ ;
            /** @type {__VLS_StyleScopedClasses['card']} */ ;
            /** @type {__VLS_StyleScopedClasses['card-hover']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "result-icon" },
            });
            /** @type {__VLS_StyleScopedClasses['result-icon']} */ ;
            if (__VLS_ctx.getReferenceImage(result.familiarId) || __VLS_ctx.getBundledIcon(result.familiarId)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                    src: (__VLS_ctx.getReferenceImage(result.familiarId) || __VLS_ctx.getBundledIcon(result.familiarId) || undefined),
                    alt: "",
                    ...{ class: "result-thumb" },
                });
                /** @type {__VLS_StyleScopedClasses['result-thumb']} */ ;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "result-info" },
            });
            /** @type {__VLS_StyleScopedClasses['result-info']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "result-name" },
            });
            /** @type {__VLS_StyleScopedClasses['result-name']} */ ;
            (__VLS_ctx.getFamiliarName(result.familiarId));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "result-meta text-xs text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['result-meta']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (result.matches.length);
            (result.matches[0].confidence);
            (result.matches[0].scale);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "result-status" },
            });
            /** @type {__VLS_StyleScopedClasses['result-status']} */ ;
            if (__VLS_ctx.isCollected(result.familiarId)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "tag tag-success" },
                });
                /** @type {__VLS_StyleScopedClasses['tag']} */ ;
                /** @type {__VLS_StyleScopedClasses['tag-success']} */ ;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "tag tag-primary" },
                });
                /** @type {__VLS_StyleScopedClasses['tag']} */ ;
                /** @type {__VLS_StyleScopedClasses['tag-primary']} */ ;
            }
            // @ts-ignore
            [cvReady, cvReady, cvLoading, initCV, cvError, cvError, handlePaste, focusPasteZone, isDragging, screenshotSrc, screenshotSrc, screenshotSrc, handleFileUpload, hasTestImage, loadTestImage, clearScreenshot, runScan, scanning, scanning, scanning, referenceCount, referenceCount, scanProgress, scanProgress, scanResults, scanResults, scanResults, scanResults, getReferenceImage, getReferenceImage, getBundledIcon, getBundledIcon, getFamiliarName, isCollected,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.markAllDetected) },
            ...{ class: "btn btn-primary w-full" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        (__VLS_ctx.newDetectedCount);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-state" },
            ...{ style: {} },
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
}
// @ts-ignore
[markAllDetected, newDetectedCount,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
