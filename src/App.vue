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

    <footer class="app-footer">
      <div class="footer-content">
        <span class="footer-badge">PROTOTYPE</span>
        <span class="footer-version">v0.1</span>
        <span class="footer-divider">·</span>
        <span class="footer-note">Application is under construction.</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import AppHeader from "./components/AppHeader.vue";
import BadgeList from "./components/BadgeList.vue";
import Dashboard from "./components/Dashboard.vue";
import ReferenceUploader from "./components/ReferenceUploader.vue";
import ScreenshotScanner from "./components/ScreenshotScanner.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import { useOpenCV } from "./composables/useOpenCV.js";

const { cvReady, cvLoading } = useOpenCV();

const currentTab = ref("scanner");

const views = {
  dashboard: Dashboard,
  scanner: ScreenshotScanner,
  references: ReferenceUploader,
  badges: BadgeList,
  settings: SettingsPanel,
};

const currentView = computed(() => views[currentTab.value] || Dashboard);
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

.app-footer {
  margin-top: auto;
  padding: 24px 32px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: black;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 24px;
  flex-wrap: wrap;
}

.footer-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.1em;
  background: rgba(255, 160, 0, 0.15);
  border: 1px solid rgba(255, 160, 0, 0.25);
}

.footer-version {
  font-weight: 600;
  font-family: "JetBrains Mono", monospace;
  font-size: 24px;
}
</style>
