<template>
  <div class="scanner animate-fade-in">
    <h2>Screenshot Scanner</h2>
    <p class="text-secondary text-sm" style="margin-bottom: 16px">
      Paste a MapleStory screenshot (Ctrl+V / ⌘+V) to scan for familiar cards.
      Make sure you've uploaded reference images first.
    </p>

    <!-- OpenCV Status -->
    <div v-if="!cvReady" class="card" style="padding: 20px; margin-bottom: 20px">
      <div v-if="cvLoading" class="flex items-center gap-sm">
        <div class="spinner"></div>
        <span>Loading OpenCV.js… This may take a moment.</span>
      </div>
      <div v-else>
        <button class="btn btn-primary" @click="initCV">
          Load OpenCV.js to Enable Scanning
        </button>
        <p v-if="cvError" class="text-sm" style="color: var(--c-danger); margin-top: 8px">
          {{ cvError }}
        </p>
      </div>
    </div>

    <!-- Paste Zone -->
    <div
      class="paste-zone card"
      :class="{
        'paste-active': isDragging,
        'has-image': screenshotSrc,
      }"
      @paste="handlePaste"
      @click="focusPasteZone"
      tabindex="0"
      ref="pasteZone"
    >
      <div v-if="!screenshotSrc" class="paste-placeholder">
        <div class="paste-icon">📋</div>
        <div class="paste-title">Paste Screenshot Here</div>
        <div class="paste-hint text-sm text-muted">
          Click here and press Ctrl+V (or ⌘+V on Mac)
        </div>
        <div class="paste-actions" style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap">
          <label class="btn btn-ghost btn-sm upload-label">
            📂 Upload Image
            <input
              type="file"
              accept="image/*"
              class="sr-only"
              @change="handleFileUpload"
            />
          </label>
          <button v-if="hasTestImage" class="btn btn-ghost btn-sm" @click.stop="loadTestImage">
            🧪 Load Test Image
          </button>
        </div>
      </div>

      <div v-else class="paste-preview">
        <canvas ref="previewCanvas" class="preview-canvas"></canvas>
        <button class="btn btn-ghost btn-sm clear-btn" @click.stop="clearScreenshot">
          ✕ Clear
        </button>
      </div>
    </div>

    <!-- Scan Controls -->
    <div v-if="screenshotSrc && cvReady" class="scan-controls">
      <button
        class="btn btn-accent"
        :disabled="scanning || referenceCount === 0"
        @click="runScan"
      >
        <div v-if="scanning" class="spinner" style="border-top-color: white"></div>
        <span v-else>🔍</span>
        {{ scanning ? 'Scanning…' : 'Scan Screenshot' }}
      </button>

      <div v-if="referenceCount === 0" class="text-sm" style="color: var(--c-warning)">
        ⚠️ No reference images available. Upload icons in the References tab or use a badge with built-in icons.
      </div>

      <div v-if="scanProgress" class="scan-progress text-sm text-muted">
        Scanning: {{ scanProgress }}
      </div>
    </div>

    <!-- Results -->
    <div v-if="scanResults" class="results-section animate-slide-up">
      <h3>
        Scan Results
        <span class="tag tag-accent">{{ scanResults.length }} found</span>
      </h3>

      <div v-if="scanResults.length > 0" class="results-list">
        <div
          v-for="result in scanResults"
          :key="result.familiarId"
          class="result-item card card-hover"
        >
          <div class="result-icon">
            <img
              v-if="getReferenceImage(result.familiarId) || getBundledIcon(result.familiarId)"
              :src="getReferenceImage(result.familiarId) || getBundledIcon(result.familiarId)"
              alt=""
              class="result-thumb"
            />
            <span v-else>🃏</span>
          </div>
          <div class="result-info">
            <div class="result-name">{{ getFamiliarName(result.familiarId) }}</div>
            <div class="result-meta text-xs text-muted">
              {{ result.matches.length }} match(es) · Best: {{ result.matches[0].confidence }}
              · Scale: {{ result.matches[0].scale }}x
            </div>
          </div>
          <div class="result-status">
            <span v-if="isCollected(result.familiarId)" class="tag tag-success">Collected</span>
            <span v-else class="tag tag-primary">New!</span>
          </div>
        </div>

        <button class="btn btn-primary w-full" @click="markAllDetected" style="margin-top: 12px">
          ✓ Mark All {{ newDetectedCount }} New Familiars as Collected
        </button>
      </div>

      <div v-else class="empty-state" style="padding: 24px">
        <div class="empty-state-icon">🤷</div>
        <div class="empty-state-title">No matches found</div>
        <div class="empty-state-text">
          Try adjusting the match threshold in Settings, or ensure your reference images match the screenshot scale.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated } from 'vue'
import { useOpenCV } from '../composables/useOpenCV.js'
import { useStorage } from '../composables/useStorage.js'
import { useBadgeTracker } from '../composables/useBadgeTracker.js'
import { badges } from '../data/badges.js'

// Test image (available in public folder)
let testImageUrl = '/test-images/test-have-starter.png'

const { cvReady, cvLoading, cvError, loadOpenCV, scanScreenshot } = useOpenCV()

// Auto-load OpenCV when scanner is opened
onMounted(() => { if (!cvReady.value && !cvLoading.value) initCV() })
onActivated(() => { if (!cvReady.value && !cvLoading.value) initCV() })
const { getAllReferenceImagesWithBundled, getReferenceImage, getReferenceCountWithBundled, getBundledIcon, getSettings } = useStorage()
const { isCollected, bulkSetCollected } = useBadgeTracker()

const pasteZone = ref(null)
const previewCanvas = ref(null)
const screenshotSrc = ref(null)
const isDragging = ref(false)
const scanning = ref(false)
const scanProgress = ref(null)
const scanResults = ref(null)
const referenceCount = getReferenceCountWithBundled()
const hasTestImage = !!testImageUrl

function loadTestImage() {
  if (!testImageUrl) return
  screenshotSrc.value = testImageUrl
  scanResults.value = null
  drawPreview(testImageUrl)
}

function handleFileUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    screenshotSrc.value = ev.target.result
    scanResults.value = null
    drawPreview(ev.target.result)
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

// Build a flat lookup: familiarId → name
const familiarMap = {}
for (const b of badges) {
  for (const f of b.familiars) {
    familiarMap[f.id] = f.name
  }
}

function getFamiliarName(id) {
  return familiarMap[id] || id
}

const newDetectedCount = computed(() => {
  if (!scanResults.value) return 0
  return scanResults.value.filter((r) => !isCollected(r.familiarId)).length
})

async function initCV() {
  try {
    await loadOpenCV()
  } catch (e) {
    console.error('Failed to load OpenCV:', e)
  }
}

function focusPasteZone() {
  pasteZone.value?.focus()
}

function handlePaste(e) {
  const items = e.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const blob = item.getAsFile()
      const reader = new FileReader()
      reader.onload = (ev) => {
        screenshotSrc.value = ev.target.result
        scanResults.value = null
        drawPreview(ev.target.result)
      }
      reader.readAsDataURL(blob)
      return
    }
  }
}

function drawPreview(dataURL) {
  const img = new Image()
  img.onload = () => {
    const canvas = previewCanvas.value
    if (!canvas) return
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
  }
  img.src = dataURL
}

function clearScreenshot() {
  screenshotSrc.value = null
  scanResults.value = null
  scanProgress.value = null
}

async function runScan() {
  if (!cvReady.value || !previewCanvas.value) return

  scanning.value = true
  scanProgress.value = 'Preparing…'
  scanResults.value = null

  try {
    const refs = getAllReferenceImagesWithBundled()
    const settings = getSettings()

    scanProgress.value = `Scanning against ${Object.keys(refs).length} reference(s)…`

    // Use requestAnimationFrame to allow UI to update
    await new Promise((r) => requestAnimationFrame(r))

    const results = await scanScreenshot(previewCanvas.value, refs, {
      threshold: settings.threshold,
      scales: [0.5, 0.75, 1.0, 1.25, 1.5],
    })

    scanResults.value = results

    // Draw match rectangles on preview canvas
    if (results.length > 0) {
      drawMatchRects(results)
    }
  } catch (err) {
    console.error('Scan error:', err)
    scanResults.value = []
  } finally {
    scanning.value = false
    scanProgress.value = null
  }
}

function drawMatchRects(results) {
  const canvas = previewCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  // Redraw original image first
  const img = new Image()
  img.onload = () => {
    ctx.drawImage(img, 0, 0)

    ctx.strokeStyle = '#34c759'
    ctx.lineWidth = 3
    ctx.font = '14px Inter, sans-serif'
    ctx.fillStyle = 'rgba(52, 199, 89, 0.2)'

    for (const result of results) {
      for (const match of result.matches) {
        ctx.fillRect(match.x, match.y, match.w, match.h)
        ctx.strokeRect(match.x, match.y, match.w, match.h)

        // Label
        ctx.fillStyle = 'rgba(0,0,0,0.7)'
        ctx.fillRect(match.x, match.y - 18, match.w, 18)
        ctx.fillStyle = '#fff'
        ctx.fillText(
          `${(match.confidence * 100).toFixed(0)}%`,
          match.x + 4,
          match.y - 4,
        )
        ctx.fillStyle = 'rgba(52, 199, 89, 0.2)'
      }
    }
  }
  img.src = screenshotSrc.value
}

function markAllDetected() {
  if (!scanResults.value) return
  const ids = scanResults.value
    .filter((r) => !isCollected(r.familiarId))
    .map((r) => r.familiarId)
  bulkSetCollected(ids)
}
</script>

<style scoped>
.scanner {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.paste-zone {
  min-height: 260px;
  max-height:60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  border: 2px dashed var(--c-border);
  transition: all var(--dur-base) var(--ease-out);
  overflow: hidden;
}

.paste-zone:focus {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px var(--c-primary-soft);
}

.paste-zone.has-image {
  border-style: solid;
  border-color: var(--c-border-light);
}

.paste-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px;
  text-align: center;
}

.paste-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.paste-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--c-text-secondary);
}

.paste-preview {
  position: relative;
  width: 100%;
}

.preview-canvas {
  width: 100%;
  height: auto;
  display: block;
  border-radius: var(--radius-lg);
}

.clear-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(4px);
}

.scan-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.results-section h3 {
  display: flex;
  align-items: center;
  gap: 12px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-thumb {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: var(--radius-sm);
  background: var(--c-bg);
}

.result-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
}

.result-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.result-meta {
  margin-top: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.upload-label {
  cursor: pointer;
}
</style>
