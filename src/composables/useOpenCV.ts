import { ref, shallowRef } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import type { MatchResult, ScanResult } from '../types/index'

// OpenCV.js has no official TS types — use `any` for the cv instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CvInstance = any

interface MatchTemplateOpts {
  threshold?: number
  scales?: number[]
}

const cvReady: Ref<boolean> = ref(false)
const cvLoading: Ref<boolean> = ref(false)
const cvError: Ref<string | null> = ref(null)
const cvInstance: ShallowRef<CvInstance | null> = shallowRef(null)

let loadPromise: Promise<CvInstance> | null = null

/**
 * Loads OpenCV.js via the @opencvjs/web package (async, ~8 MB).
 * Multiple calls are safe — only one load will run.
 */
async function loadOpenCV(): Promise<CvInstance> {
  if (cvReady.value) return cvInstance.value
  if (loadPromise) return loadPromise

  cvLoading.value = true
  cvError.value = null

  loadPromise = (async () => {
    try {
      const { loadOpenCV: loadCV } = await import('@opencvjs/web')
      const cv = await loadCV() // call the async builder from the module
      cvInstance.value = cv
      cvReady.value = true
      return cv
    } catch (err) {
      cvError.value = (err as Error).message || 'Failed to load OpenCV'
      throw err
    } finally {
      cvLoading.value = false
    }
  })()

  return loadPromise
}

/**
 * Run template matching at MULTIPLE SCALES on the source image.
 *
 * @param sourceEl  – the pasted screenshot
 * @param templateEl – the reference icon
 * @param opts
 * @returns array of matches
 */
function matchTemplate(
  sourceEl: HTMLImageElement | HTMLCanvasElement,
  templateEl: HTMLImageElement | HTMLCanvasElement,
  opts: MatchTemplateOpts = {},
): MatchResult[] {
  const cv = cvInstance.value
  if (!cv) throw new Error('OpenCV not loaded')

  const { threshold = 0.7, scales = [0.5, 0.75, 1.0, 1.25, 1.5] } = opts

  const src = cv.imread(sourceEl)
  const tmpl = cv.imread(templateEl)

  // Convert to grayscale for faster + more robust matching
  const srcGray = new cv.Mat()
  const tmplGray = new cv.Mat()
  cv.cvtColor(src, srcGray, cv.COLOR_RGBA2GRAY)
  cv.cvtColor(tmpl, tmplGray, cv.COLOR_RGBA2GRAY)

  const allMatches: MatchResult[] = []

  for (const scale of scales) {
    let scaledTmpl = tmplGray
    
    if (scale !== 1.0) {
      scaledTmpl = new cv.Mat()
      const newW = Math.round(tmplGray.cols * scale)
      const newH = Math.round(tmplGray.rows * scale)
      if (newW < 4 || newH < 4) {
        scaledTmpl.delete()
        continue
      }
      const dsize = new cv.Size(newW, newH)
      cv.resize(tmplGray, scaledTmpl, dsize, 0, 0, cv.INTER_AREA)
    }

    // Template must be smaller than source
    if (scaledTmpl.rows > srcGray.rows || scaledTmpl.cols > srcGray.cols) {
      if (scale !== 1.0) {
        scaledTmpl.delete()
      }
      continue
    }

    const result = new cv.Mat()
    cv.matchTemplate(srcGray, scaledTmpl, result, cv.TM_CCOEFF_NORMED)

    // Find ALL locations above threshold (not just the single best)
    const tw: number = scaledTmpl.cols
    const th: number = scaledTmpl.rows
    
    // Iterate through result matrix to find matches above threshold
    for (let y = 0; y < result.rows; y++) {
      for (let x = 0; x < result.cols; x++) {
        const conf: number = result.floatAt(y, x)
        if (conf >= threshold) {
          // Suppress nearby duplicates (non-max suppression)
          const isDuplicate = allMatches.some(
            (m) => Math.abs(m.x - x) < tw * 0.5 && Math.abs(m.y - y) < th * 0.5,
          )
          if (!isDuplicate) {
            allMatches.push({
              x,
              y,
              w: tw,
              h: th,
              confidence: Math.round(conf * 1000) / 1000,
              scale,
            })
          }
        }
      }
    }

    result.delete()
    if (scale !== 1.0) {
      scaledTmpl.delete()
    }
  }

  // Cleanup
  src.delete()
  tmpl.delete()
  srcGray.delete()
  tmplGray.delete()

  return allMatches.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Scan a screenshot against ALL reference templates.
 *
 * @param screenshotCanvas
 * @param referenceImages  – familiarId → base64 dataURL
 * @param opts  – { threshold, scales }
 * @returns scan results
 */
async function scanScreenshot(
  screenshotCanvas: HTMLCanvasElement,
  referenceImages: Record<string, string>,
  opts: MatchTemplateOpts = {},
): Promise<ScanResult[]> {
  const results: ScanResult[] = []

  for (const [familiarId, dataURL] of Object.entries(referenceImages)) {
    const img = await loadImage(dataURL)
    const matches = matchTemplate(screenshotCanvas, img, opts)
    if (matches.length > 0) {
      results.push({ familiarId, matches })
    }
  }

  return results
}

/**  Load an image from a data URL into an HTMLCanvasElement with composited background */
function loadImage(src: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      // By drawing to a canvas with a neutral gray/blue background, 
      // we eliminate transparent holes that skew CCOEFF means, 
      // preventing "0 matches" on standard backgrounds.
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      
      // Typical MapleStory card background color (#4a4e69 / neutral dark greyish)
      // This bridges the transparent .webp icon pixels to map accurately against in-game cards
      ctx.fillStyle = "#4a4e69" 
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      resolve(canvas)
    }
    img.onerror = reject
    img.src = src
  })
}

export function useOpenCV() {
  return {
    cvReady,
    cvLoading,
    cvError,
    loadOpenCV,
    matchTemplate,
    scanScreenshot,
  }
}
