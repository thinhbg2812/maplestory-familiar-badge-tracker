import type { Ref } from 'vue';
import type { MatchResult, ScanResult } from '../types/index';
type CvInstance = any;
interface MatchTemplateOpts {
    threshold?: number;
    scales?: number[];
}
/**
 * Loads OpenCV.js via the @opencvjs/web package (async, ~8 MB).
 * Multiple calls are safe — only one load will run.
 */
declare function loadOpenCV(): Promise<CvInstance>;
/**
 * Run template matching at MULTIPLE SCALES on the source image.
 *
 * @param sourceEl  – the pasted screenshot
 * @param templateEl – the reference icon
 * @param opts
 * @returns array of matches
 */
declare function matchTemplate(sourceEl: HTMLImageElement | HTMLCanvasElement, templateEl: HTMLImageElement | HTMLCanvasElement, opts?: MatchTemplateOpts): MatchResult[];
/**
 * Scan a screenshot against ALL reference templates.
 *
 * @param screenshotCanvas
 * @param referenceImages  – familiarId → base64 dataURL
 * @param opts  – { threshold, scales }
 * @returns scan results
 */
declare function scanScreenshot(screenshotCanvas: HTMLCanvasElement, referenceImages: Record<string, string>, opts?: MatchTemplateOpts): Promise<ScanResult[]>;
export declare function useOpenCV(): {
    cvReady: Ref<boolean, boolean>;
    cvLoading: Ref<boolean, boolean>;
    cvError: Ref<string | null, string | null>;
    loadOpenCV: typeof loadOpenCV;
    matchTemplate: typeof matchTemplate;
    scanScreenshot: typeof scanScreenshot;
};
export {};
