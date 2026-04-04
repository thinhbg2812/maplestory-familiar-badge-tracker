<template>
  <div class="badge-list animate-fade-in">
    <div class="list-header">
      <h2>All Badges</h2>
      <div class="list-stats text-sm text-secondary">
        {{ completedBadges }} / {{ badges.length }} completed
      </div>
    </div>

    <div class="list-filters">
      <input
        v-model="search"
        class="input"
        placeholder="Search badges or familiars…"
        type="search"
      />
      <div class="nav-tabs">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="nav-tab"
          :class="{ active: category === cat.value }"
          @click="category = cat.value"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <div v-if="filteredBadges.length" class="badges-grid stagger">
      <BadgeCard
        v-for="badge in filteredBadges"
        :key="badge.id"
        :badge="badge"
      />
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">🔎</div>
      <div class="empty-state-title">No badges found</div>
      <div class="empty-state-text">Try adjusting your search or filter.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBadgeTracker } from '../composables/useBadgeTracker.js'
import BadgeCard from './BadgeCard.vue'

const { badges, filterBadges, completedBadges } = useBadgeTracker()

const search = ref('')
const category = ref('all')

const categories = [
  { value: 'all', label: 'All' },
  { value: 'no-booster', label: 'No Booster' },
  { value: 'booster-required', label: 'Booster Required' },
]

const filteredBadges = computed(() =>
  filterBadges(search.value, category.value),
)
</script>

<style scoped>
.badge-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .badges-grid {
    grid-template-columns: 1fr;
  }
}
</style>
