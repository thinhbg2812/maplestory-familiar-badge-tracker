<template>
  <div class="app-layout">
    <AppHeader
      :currentTab="currentTab"
      :cvReady="cvReady"
      :cvLoading="cvLoading"
      @navigate="currentTab = $event"
    />

    <main class="app-main">
      <div class="app-container">
        <KeepAlive>
          <component :is="currentView" />
        </KeepAlive>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOpenCV } from './composables/useOpenCV.js'
import AppHeader from './components/AppHeader.vue'
import Dashboard from './components/Dashboard.vue'
import ScreenshotScanner from './components/ScreenshotScanner.vue'
import ReferenceUploader from './components/ReferenceUploader.vue'
import BadgeList from './components/BadgeList.vue'
import SettingsPanel from './components/SettingsPanel.vue'

const { cvReady, cvLoading } = useOpenCV()

const currentTab = ref('dashboard')

const views = {
  dashboard: Dashboard,
  scanner: ScreenshotScanner,
  references: ReferenceUploader,
  badges: BadgeList,
  settings: SettingsPanel,
}

const currentView = computed(() => views[currentTab.value] || Dashboard)
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  padding: var(--content-padding);
}

.app-container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding-top: 8px;
}
</style>
