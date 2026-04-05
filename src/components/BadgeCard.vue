<template>
  <div class="badge-card card" :class="{ 'card-glow': progress.complete, 'card-hover': !progress.complete }">
    <div class="badge-header">
      <div class="badge-info">
        <h3 class="badge-name">{{ badge.name }}</h3>
        <span class="tag" :class="categoryTag">{{ categoryLabel }}</span>
      </div>
      <div class="badge-percent" :class="{ complete: progress.complete }">
        {{ progress.percent }}%
      </div>
    </div>

    <div class="badge-effects">
      <span class="effects-label">Effects:</span>
      <span class="effects-value">{{ badge.effects }}</span>
    </div>

    <div class="progress-bar">
      <div
        class="progress-bar-fill"
        :class="{ complete: progress.complete }"
        :style="{ width: progress.percent + '%' }"
      ></div>
    </div>

    <div class="badge-count">
      {{ progress.collected }} / {{ progress.total }} familiars
      <span v-if="progress.complete" class="complete-badge">✓ Complete</span>
    </div>

    <div v-if="expanded" class="badge-familiars">
      <div
        v-for="familiar in badge.familiars"
        :key="familiar.id"
        class="familiar-item"
        :class="{
          collected: isCollected(familiar.id),
          'booster-only': familiar.boosterOnly,
        }"
        @click="toggleCollected(familiar.id)"
      >
        <div class="familiar-check">
          <svg v-if="isCollected(familiar.id)" viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
          </svg>
        </div>
        <span class="familiar-name">{{ familiar.name }}</span>
        <span v-if="familiar.boosterOnly" class="tag tag-warning" style="font-size:0.65rem; padding: 1px 6px;">Booster</span>
      </div>
    </div>

    <button class="btn btn-ghost btn-sm expand-btn" @click="expanded = !expanded">
      {{ expanded ? 'Hide Familiars ▲' : 'Show Familiars ▼' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBadgeTracker } from '../composables/useBadgeTracker'
import type { Badge } from '../types/index'

const props = defineProps<{
  badge: Badge
}>()

const { badgeProgress, isCollected, toggleCollected } = useBadgeTracker()
const expanded = ref(false)

const progress = computed(() => badgeProgress.value[props.badge.id] ?? { total: 0, collected: 0, percent: 0, complete: false })

const categoryLabel = computed(() =>
  props.badge.category === 'booster-required' ? 'Booster Required' : 'No Booster',
)

const categoryTag = computed(() =>
  props.badge.category === 'booster-required' ? 'tag-warning' : 'tag-success',
)
</script>

<style scoped>
.badge-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.badge-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.badge-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.badge-name {
  font-size: 1.05rem;
  font-weight: 700;
}

.badge-percent {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--c-text-muted);
  line-height: 1;
}

.badge-percent.complete {
  color: var(--c-success);
}

.badge-effects {
  font-size: 0.8rem;
  color: var(--c-text-secondary);
  padding: 8px 12px;
  background: var(--c-accent-bg);
  border-radius: var(--radius-sm);
  line-height: 1.5;
}

.effects-label {
  font-weight: 600;
  color: var(--c-accent-dark);
  margin-right: 4px;
}

.effects-value {
  color: var(--c-accent);
}

.badge-count {
  font-size: 0.8rem;
  color: var(--c-text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
}

.complete-badge {
  color: var(--c-success);
  font-weight: 600;
}

.badge-familiars {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
  animation: fadeIn var(--dur-base) var(--ease-out);
}

.familiar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--dur-fast);
  font-size: 0.83rem;
}

.familiar-item:hover {
  background: var(--c-surface-hover);
}

.familiar-item.collected {
  background: var(--c-success-bg);
}

.familiar-item.collected .familiar-name {
  color: #1a9e3c;
  font-weight: 500;
}

.familiar-check {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1.5px solid var(--c-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--dur-fast);
}

.familiar-item.collected .familiar-check {
  background: var(--c-success);
  border-color: var(--c-success);
  color: white;
}

.familiar-name {
  flex: 1;
  color: var(--c-text-secondary);
}

.expand-btn {
  align-self: center;
  margin-top: 4px;
}
</style>
