<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="header-brand">
        <div class="brand-icon">🍁</div>
        <div class="brand-text">
          <h1 class="brand-title">Maple Badge Tracker</h1>
          <span class="brand-sub">Familiar Collection Scanner</span>
        </div>
      </div>

      <nav class="header-nav">
        <div class="nav-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="nav-tab"
            :class="{ active: currentTab === tab.id }"
            @click="$emit('navigate', tab.id)"
          >
            <span class="nav-tab-icon">{{ tab.icon }}</span>
            <span class="nav-tab-label">{{ tab.label }}</span>
          </button>
        </div>
      </nav>

      <div class="header-status">
        <div v-if="cvLoading" class="status-item status-loading">
          <div class="spinner"></div>
          <span>Loading OpenCV…</span>
        </div>
        <div v-else-if="cvReady" class="status-item status-ready">
          <span class="status-dot ready"></span>
          <span>OpenCV Ready</span>
        </div>
        <div v-else class="status-item status-idle">
          <span class="status-dot idle"></span>
          <span>OpenCV Idle</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  currentTab: string
  cvReady?: boolean
  cvLoading?: boolean
}>()

defineEmits<{
  navigate: [id: string]
}>()

interface Tab {
  id: string
  icon: string
  label: string
}

const tabs: Tab[] = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'scanner', icon: '🔍', label: 'Scanner' },
  { id: 'references', icon: '🖼️', label: 'References' },
  { id: 'badges', icon: '🏅', label: 'Badges' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
]
</script>

<style scoped>
.app-header {
  background: var(--c-bg-elevated);
  border-bottom: 1px solid var(--c-border-light);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.header-inner {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--content-padding);
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.brand-icon {
  font-size: 1.8rem;
  filter: drop-shadow(0 2px 4px rgba(232, 160, 49, 0.3));
}

.brand-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--c-primary-dark), var(--c-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.brand-sub {
  font-size: 0.7rem;
  color: var(--c-text-muted);
  font-weight: 500;
  letter-spacing: 0.3px;
}

.header-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-tab-icon {
  font-size: 0.9rem;
}

.header-status {
  flex-shrink: 0;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: var(--radius-full);
}

.status-loading {
  color: var(--c-primary-dark);
  background: var(--c-primary-bg);
}

.status-ready {
  color: #1a9e3c;
  background: var(--c-success-bg);
}

.status-idle {
  color: var(--c-text-muted);
  background: var(--c-bg);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-dot.ready {
  background: var(--c-success);
  box-shadow: 0 0 6px rgba(52, 199, 89, 0.5);
}

.status-dot.idle {
  background: var(--c-text-muted);
}

@media (max-width: 768px) {
  .header-inner {
    flex-wrap: wrap;
    height: auto;
    padding: 12px var(--content-padding);
    gap: 12px;
  }

  .header-brand {
    width: 100%;
    justify-content: space-between;
  }

  .header-nav {
    width: 100%;
    overflow-x: auto;
  }

  .brand-sub {
    display: none;
  }
}
</style>
