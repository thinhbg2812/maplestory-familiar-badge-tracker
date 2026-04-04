import { ref, shallowRef } from 'vue'

const cvReady = ref(false)
const cvLoading = ref(false)
const cvError = ref(null)
const cvInstance = shallowRef(null)

let loadPromise = null

/**
 * Loads OpenCV.js via the @opencvjs/web package (async, ~8 MB).
 * Multiple calls are safe — only one load will run.
 */
async function loadOpenCV() {
  if (cvReady.value) return cvInstance.value
  if (loadPromise) return loadPromise

  cvLoading.value = true
  cvError.value = null

  loadPromise = (async () => {
    try {
      const { default: cv } = await import('@opencvjs/web')
      cvInstance.value = cv
      cvReady.value = true
      return cv
    } catch (err) {
      cvError.value = err.message || 'Failed to load OpenCV'
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
 * @param {HTMLImageElement|HTMLCanvasElement} sourceEl  – the pasted screenshot
 * @param {HTMLImageElement|HTMLCanvasElement} templateEl – the reference icon
 * @param {object} opts
 * @param {number}   opts.threshold – min confidence (0-1), default 0.7
 * @param {number[]} opts.scales    – scale factors to try
 * @returns {{ x, y, w, h, confidence, scale }[]}  array of matches
 */
function matchTemplate(sourceEl, templateEl, opts = {}) {
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

  const allMatches = []

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
      if (scale !== 1.0) scaledTmpl.delete()
      continue
    }

    const result = new cv.Mat()
    cv.matchTemplate(srcGray, scaledTmpl, result, cv.TM_CCOEFF_NORMED)

    // Find ALL locations above threshold (not just the single best)
    const tw = scaledTmpl.cols
    const th = scaledTmpl.rows

    // Iterate through result matrix to find matches above threshold
    for (let y = 0; y < result.rows; y++) {
      for (let x = 0; x < result.cols; x++) {
        const conf = result.floatAt(y, x)
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
    if (scale !== 1.0) scaledTmpl.delete()
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
 * @param {HTMLCanvasElement} screenshotCanvas
 * @param {Record<string, string>} referenceImages  – familiarId → base64 dataURL
 * @param {object} opts  – { threshold, scales }
 * @returns {Promise<{ familiarId, matches }[]>}
 */
async function scanScreenshot(screenshotCanvas, referenceImages, opts = {}) {
  const results = []

  for (const [familiarId, dataURL] of Object.entries(referenceImages)) {
    const img = await loadImage(dataURL)
    const matches = matchTemplate(screenshotCanvas, img, opts)
    if (matches.length > 0) {
      results.push({ familiarId, matches })
    }
  }

  return results
}

/**  Load an image from a data URL into an HTMLImageElement */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
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
