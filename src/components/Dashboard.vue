<template>
  <div class="dashboard animate-fade-in">
    <!-- Overview Stats -->
    <div class="stats-row stagger">
      <div class="stat-card card card-elevated">
        <div class="stat-icon">🃏</div>
        <div class="stat-body">
          <div class="stat-value">{{ overallProgress.collected }}</div>
          <div class="stat-label">Familiars Collected</div>
        </div>
        <div class="stat-sub">of {{ overallProgress.total }}</div>
      </div>

      <div class="stat-card card card-elevated">
        <div class="stat-icon">🏅</div>
        <div class="stat-body">
          <div class="stat-value">{{ completedBadges }}</div>
          <div class="stat-label">Badges Completed</div>
        </div>
        <div class="stat-sub">of {{ badges.length }}</div>
      </div>

      <div class="stat-card card card-elevated">
        <div class="stat-icon">🖼️</div>
        <div class="stat-body">
          <div class="stat-value">{{ referenceCount }}</div>
          <div class="stat-label">Reference Images</div>
        </div>
        <div class="stat-sub">uploaded</div>
      </div>

      <div class="stat-card card card-elevated">
        <div class="stat-icon">📈</div>
        <div class="stat-body">
          <div class="stat-value">{{ overallProgress.percent }}%</div>
          <div class="stat-label">Overall Progress</div>
        </div>
        <div class="stat-progress">
          <div class="progress-bar">
            <div
              class="progress-bar-fill"
              :class="{ complete: overallProgress.percent === 100 }"
              :style="{ width: overallProgress.percent + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Near Complete Badges -->
    <section class="section">
      <h2 class="section-title">
        🔥 Almost There
        <span class="text-sm text-muted" style="font-weight:400">Badges closest to completion</span>
      </h2>

      <div v-if="nearCompleteBadges.length" class="near-grid stagger">
        <div
          v-for="badge in nearCompleteBadges.slice(0, 6)"
          :key="badge.id"
          class="near-card card card-hover"
        >
          <div class="near-header">
            <span class="near-name">{{ badge.name }}</span>
            <span class="near-pct">{{ badgeProgress[badge.id].percent }}%</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-bar-fill"
              :style="{ width: badgeProgress[badge.id].percent + '%' }"
            ></div>
          </div>
          <div class="near-detail text-xs text-muted">
            {{ badgeProgress[badge.id].collected }} / {{ badgeProgress[badge.id].total }} familiars
          </div>
          <div class="near-effect text-xs">{{ badge.effects }}</div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-state-icon">🌟</div>
        <div class="empty-state-title">No progress yet</div>
        <div class="empty-state-text">
          Start by uploading reference images and scanning your screenshots!
        </div>
      </div>
    </section>

    <!-- Stat Caps Reference -->
    <section class="section">
      <h2 class="section-title">
        📋 Maximum Badge Stats
        <span class="text-sm text-muted" style="font-weight:400">Cumulative cap for 8 badges</span>
      </h2>
      <div class="caps-grid card" style="padding:16px">
        <div
          v-for="(val, key) in statCaps"
          :key="key"
          class="cap-item"
        >
          <span class="cap-name">{{ key }}</span>
          <span class="cap-value">{{ val }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useBadgeTracker } from '../composables/useBadgeTracker.js'
import { useStorage } from '../composables/useStorage.js'
import { statCaps } from '../data/badges.js'

const {
  badges,
  badgeProgress,
  overallProgress,
  completedBadges,
  nearCompleteBadges,
} = useBadgeTracker()

const { getReferenceCount } = useStorage()
const referenceCount = getReferenceCount()
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
}

.stat-icon {
  font-size: 2rem;
  line-height: 1;
}

.stat-body {
  flex: 1;
  min-width: 100px;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--c-text);
  line-height: 1.1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--c-text-muted);
  margin-top: 2px;
}

.stat-sub {
  font-size: 0.75rem;
  color: var(--c-text-muted);
  align-self: flex-end;
}

.stat-progress {
  width: 100%;
  margin-top: 4px;
}

.section-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.near-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.near-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.near-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.near-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.95rem;
}

.near-pct {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--c-primary-dark);
}

.near-effect {
  color: var(--c-accent);
  padding: 4px 8px;
  background: var(--c-accent-bg);
  border-radius: var(--radius-sm);
}

.caps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
}

.cap-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.83rem;
}

.cap-item:nth-child(odd) {
  background: var(--c-bg);
}

.cap-name {
  color: var(--c-text-secondary);
  font-weight: 500;
}

.cap-value {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--c-primary-dark);
}
</style>
