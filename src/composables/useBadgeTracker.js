import { computed } from 'vue'
import { badges, totalFamiliars } from '../data/badges.js'
import { useStorage } from './useStorage.js'

export function useBadgeTracker() {
  const {
    isCollected,
    setCollected,
    toggleCollected,
    bulkSetCollected,
    state,
  } = useStorage()

  /** Badge progress: { badgeId → { total, collected, percent, complete } } */
  const badgeProgress = computed(() => {
    const result = {}
    for (const badge of badges) {
      const total = badge.familiars.length
      const collected = badge.familiars.filter((f) => isCollected(f.id)).length
      result[badge.id] = {
        total,
        collected,
        percent: total > 0 ? Math.round((collected / total) * 100) : 0,
        complete: collected === total,
      }
    }
    return result
  })

  /** Overall progress */
  const overallProgress = computed(() => {
    const total = totalFamiliars
    let collected = 0
    for (const badge of badges) {
      collected += badge.familiars.filter((f) => isCollected(f.id)).length
    }
    return {
      total,
      collected,
      percent: total > 0 ? Math.round((collected / total) * 100) : 0,
    }
  })

  /** Count of completed badges */
  const completedBadges = computed(() => {
    return badges.filter(
      (b) => badgeProgress.value[b.id]?.complete,
    ).length
  })

  /** Badges sorted by closest to completion (highest %) */
  const nearCompleteBadges = computed(() => {
    return [...badges]
      .filter((b) => {
        const p = badgeProgress.value[b.id]
        return p && !p.complete && p.collected > 0
      })
      .sort((a, b) => {
        const pA = badgeProgress.value[a.id]
        const pB = badgeProgress.value[b.id]
        return pB.percent - pA.percent
      })
  })

  /** Filter badges by search / category */
  function filterBadges(search = '', category = 'all') {
    return badges.filter((b) => {
      const matchesCategory =
        category === 'all' || b.category === category
      const matchesSearch =
        !search ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.familiars.some((f) =>
          f.name.toLowerCase().includes(search.toLowerCase()),
        )
      return matchesCategory && matchesSearch
    })
  }

  return {
    badges,
    badgeProgress,
    overallProgress,
    completedBadges,
    nearCompleteBadges,
    filterBadges,
    isCollected,
    setCollected,
    toggleCollected,
    bulkSetCollected,
  }
}
