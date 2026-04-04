<template>
  <div class="settings animate-fade-in">
    <h2>Settings</h2>

    <!-- Match Threshold -->
    <section class="setting-section card" style="padding: 20px">
      <h3>🎯 Match Threshold</h3>
      <p class="text-sm text-muted" style="margin: 8px 0">
        Controls how strict the template matching is. Lower values find more matches but may include false positives.
      </p>
      <div class="threshold-control">
        <input
          type="range"
          min="0.3"
          max="0.95"
          step="0.05"
          :value="settings.threshold"
          @input="updateThreshold"
        />
        <div class="threshold-value">{{ (settings.threshold * 100).toFixed(0) }}%</div>
      </div>
      <div class="threshold-labels flex justify-between text-xs text-muted" style="margin-top:4px">
        <span>Lenient (30%)</span>
        <span>Strict (95%)</span>
      </div>
    </section>

    <!-- Export / Import -->
    <section class="setting-section card" style="padding: 20px">
      <h3>💾 Data Management</h3>
      <p class="text-sm text-muted" style="margin: 8px 0 16px">
        Export your data as JSON to back up, or import a previous export.
      </p>

      <div class="data-actions flex gap-sm" style="flex-wrap: wrap">
        <button class="btn btn-ghost" @click="handleExport">
          📤 Export Data
        </button>

        <label class="btn btn-ghost upload-label">
          📥 Import Data
          <input
            type="file"
            accept=".json,application/json"
            class="sr-only"
            @change="handleImport"
          />
        </label>

        <button class="btn btn-danger" @click="handleClear">
          🗑️ Clear All Data
        </button>
      </div>

      <div v-if="importMsg" class="import-msg text-sm" :style="{ color: importSuccess ? 'var(--c-success)' : 'var(--c-danger)' }" style="margin-top: 12px">
        {{ importMsg }}
      </div>
    </section>

    <!-- About -->
    <section class="setting-section card" style="padding: 20px">
      <h3>ℹ️ About</h3>
      <div class="about-content text-sm text-secondary" style="margin-top: 8px; line-height: 1.8">
        <p><strong>Maple Badge Tracker</strong> helps you track your MapleStory Familiar Card collection.</p>
        <p>• Upload reference images of familiar card icons</p>
        <p>• Paste in-game screenshots to auto-detect collected cards</p>
        <p>• Uses <strong>OpenCV.js</strong> template matching with multi-scale support</p>
        <p>• All data is stored locally in your browser — nothing is sent to any server</p>
        <p style="margin-top: 8px; color: var(--c-text-muted)">
          Badge data sourced from
          <a href="https://maplestorywiki.net/w/Familiars/Badges" target="_blank" style="color: var(--c-accent)">
            MapleStory Wiki
          </a>
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useStorage } from '../composables/useStorage.js'

const { getSettings, updateSettings, exportData, importData, clearAll } = useStorage()

const settings = reactive(getSettings())
const importMsg = ref('')
const importSuccess = ref(false)

function updateThreshold(e) {
  const val = parseFloat(e.target.value)
  settings.threshold = val
  updateSettings({ threshold: val })
}

function handleExport() {
  const data = exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `maple-badge-tracker-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function handleImport(e) {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (ev) => {
    const success = importData(ev.target.result)
    importSuccess.value = success
    importMsg.value = success
      ? '✓ Data imported successfully!'
      : '✕ Failed to import — invalid JSON file.'
    Object.assign(settings, getSettings())
    setTimeout(() => { importMsg.value = '' }, 4000)
  }
  reader.readAsText(file)
  e.target.value = ''
}

function handleClear() {
  if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
    clearAll()
    Object.assign(settings, getSettings())
     importMsg.value = '✓ All data cleared.'
    importSuccess.value = true
    setTimeout(() => { importMsg.value = '' }, 3000)
  }
}
</script>

<style scoped>
.settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 640px;
}

.setting-section h3 {
  font-size: 1rem;
}

.threshold-control {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
}

.threshold-control input[type='range'] {
  flex: 1;
}

.threshold-value {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--c-primary-dark);
  min-width: 50px;
  text-align: right;
}

.upload-label {
  cursor: pointer;
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
</style>
