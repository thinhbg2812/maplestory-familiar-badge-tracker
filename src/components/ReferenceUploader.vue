<template>
  <div class="ref-uploader animate-fade-in">
    <div class="ref-header">
      <div>
        <h2>Reference Images</h2>
        <p class="text-secondary text-sm">
          Upload cropped familiar card icons to be used as templates for scanning.
          The closer the crop matches the in-game icon, the better the matching results.
        </p>
      </div>
      <div class="ref-stats">
        <span class="tag tag-accent">{{ uploadedCount }} uploaded</span>
      </div>
    </div>

    <!-- Search + Filter -->
    <div class="ref-filters">
      <input
        v-model="search"
        class="input"
        placeholder="Search familiars…"
        type="search"
      />
      <div class="nav-tabs">
        <button
          v-for="f in filters"
          :key="f.value"
          class="nav-tab"
          :class="{ active: filter === f.value }"
          @click="filter = f.value"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Badge Groups -->
    <div class="badge-groups">
      <div
        v-for="badge in filteredBadges"
        :key="badge.id"
        class="ref-group card"
      >
        <div class="group-header" @click="toggleGroup(badge.id)">
          <h3 class="group-name">{{ badge.name }}</h3>
          <div class="group-meta">
            <span class="tag tag-primary">
              {{ getUploadedInBadge(badge) }} / {{ badge.familiars.length }}
            </span>
            <span class="expand-arrow" :class="{ open: openGroups[badge.id] }">▼</span>
          </div>
        </div>

        <div v-if="openGroups[badge.id]" class="group-familiars">
          <div
            v-for="familiar in badge.familiars"
            :key="familiar.id"
            class="ref-item"
          >
            <div class="ref-preview">
              <img
                v-if="getReferenceImage(familiar.id) || familiar.icon"
                :src="getReferenceImage(familiar.id) || familiar.icon"
                :alt="familiar.name"
                class="ref-thumb"
              />
              <div v-else class="ref-placeholder">
                <span>📤</span>
              </div>
            </div>

            <div class="ref-info">
              <div class="ref-name">{{ familiar.name }}</div>
              <div v-if="familiar.boosterOnly" class="text-xs" style="color: var(--c-warning)">
                Booster Pack Only
              </div>
              <div v-if="familiar.icon" class="text-xs" style="color: var(--c-success)">
                ✓ Built-in reference
              </div>
            </div>

            <div class="ref-actions">
              <span v-if="familiar.icon && !getReferenceImage(familiar.id)" class="tag tag-success">Built-in</span>
              <label v-else class="btn btn-ghost btn-sm upload-label">
                {{ getReferenceImage(familiar.id) ? 'Replace' : 'Upload' }}
                <input
                  type="file"
                  accept="image/*"
                  class="sr-only"
                  @change="(e) => handleUpload(e, familiar.id)"
                />
              </label>
              <button
                v-if="getReferenceImage(familiar.id)"
                class="btn btn-ghost btn-sm btn-icon"
                @click="removeRef(familiar.id)"
                title="Remove"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStorage } from '../composables/useStorage.js'
import { badges } from '../data/badges.js'

const {
  getReferenceImage,
  setReferenceImage,
  removeReferenceImage,
  getAllReferenceImages,
  getAllReferenceImagesWithBundled,
} = useStorage()

const search = ref('')
const filter = ref('all')
const openGroups = ref({})

const filters = [
  { value: 'all', label: 'All' },
  { value: 'uploaded', label: 'Uploaded' },
  { value: 'missing', label: 'Missing' },
]

const uploadedCount = computed(() => Object.keys(getAllReferenceImagesWithBundled()).length)

const filteredBadges = computed(() => {
  return badges.filter((b) => {
    const refs = getAllReferenceImagesWithBundled()

    // search match
    if (search.value) {
      const q = search.value.toLowerCase()
      const nameMatch = b.name.toLowerCase().includes(q)
      const famMatch = b.familiars.some((f) => f.name.toLowerCase().includes(q))
      if (!nameMatch && !famMatch) return false
    }

    // filter
    if (filter.value === 'uploaded') {
      return b.familiars.some((f) => refs[f.id])
    }
    if (filter.value === 'missing') {
      return b.familiars.some((f) => !refs[f.id])
    }

    return true
  })
})

function getUploadedInBadge(badge) {
  const refs = getAllReferenceImagesWithBundled()
  return badge.familiars.filter((f) => refs[f.id]).length
}

function toggleGroup(badgeId) {
  openGroups.value[badgeId] = !openGroups.value[badgeId]
}

function handleUpload(event, familiarId) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (ev) => {
    // Resize to MAX 64x64 to keep localStorage lean
    resizeImage(ev.target.result, 64, 64).then((resized) => {
      setReferenceImage(familiarId, resized)
    })
  }
  reader.readAsDataURL(file)

  // Reset input
  event.target.value = ''
}

function removeRef(familiarId) {
  removeReferenceImage(familiarId)
}

function resizeImage(dataURL, maxW, maxH) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let w = img.naturalWidth
      let h = img.naturalHeight

      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/png'))
    }
    img.src = dataURL
  })
}
</script>

<style scoped>
.ref-uploader {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ref-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.ref-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.badge-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ref-group {
  overflow: hidden;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  cursor: pointer;
  transition: background var(--dur-fast);
}

.group-header:hover {
  background: var(--c-surface-hover);
}

.group-name {
  font-size: 0.95rem;
}

.group-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-arrow {
  font-size: 0.7rem;
  color: var(--c-text-muted);
  transition: transform var(--dur-fast) var(--ease-out);
}

.expand-arrow.open {
  transform: rotate(180deg);
}

.group-familiars {
  border-top: 1px solid var(--c-border-light);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: fadeIn var(--dur-base) var(--ease-out);
}

.ref-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  transition: background var(--dur-fast);
}

.ref-item:hover {
  background: var(--c-surface-hover);
}

.ref-preview {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.ref-thumb {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  object-fit: contain;
  background: var(--c-bg);
  border: 1px solid var(--c-border-light);
}

.ref-placeholder {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  border: 1.5px dashed var(--c-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  opacity: 0.4;
}

.ref-info {
  flex: 1;
  min-width: 0;
}

.ref-name {
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ref-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
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
