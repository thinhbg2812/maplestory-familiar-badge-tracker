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
      const { loadOpenCV } = await import('@opencvjs/web')
      const cv = await loadOpenCV() // call the async builder from the module
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

  const { threshold = 0.7, scales = [0.5, 0.75, 1.0, 1.25, 1.5], roiTopRatio = 0.6 } = opts

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

    // Crop top portion of template (monster artwork, ignoring bottom text/UI)
    const cropH = Math.floor(scaledTmpl.rows * roiTopRatio)
    let croppedTmpl = scaledTmpl
    if (cropH >= 4 && cropH < scaledTmpl.rows) {
      const roiRect = new cv.Rect(0, 0, scaledTmpl.cols, cropH)
      croppedTmpl = scaledTmpl.roi(roiRect)
    }

    // Template must be smaller than source
    if (croppedTmpl.rows > srcGray.rows || croppedTmpl.cols > srcGray.cols) {
      if (croppedTmpl !== scaledTmpl) croppedTmpl.delete()
      if (scale !== 1.0) {
        scaledTmpl.delete()
      }
      continue
    }

    const result = new cv.Mat()
    cv.matchTemplate(srcGray, croppedTmpl, result, cv.TM_CCOEFF_NORMED)

    // Find ALL locations above threshold (not just the single best)
    // Use full (uncropped) template dimensions for bounding box
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
    if (croppedTmpl !== scaledTmpl) croppedTmpl.delete()
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

/**  Load an image from a data URL into an HTMLCanvasElement with composited background */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      // By drawing to a canvas with a neutral gray/blue background, 
      // we eliminate transparent holes that skew CCOEFF means, 
      // preventing "0 matches" on standard backgrounds.
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      
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
