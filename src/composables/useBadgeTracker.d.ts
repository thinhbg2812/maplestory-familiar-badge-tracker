import type { ComputedRef } from 'vue';
import type { Badge, BadgeProgress, OverallProgress } from '../types/index';
export declare function useBadgeTracker(): {
    badges: Badge[];
    badgeProgress: ComputedRef<Record<string, BadgeProgress>>;
    overallProgress: ComputedRef<OverallProgress>;
    completedBadges: ComputedRef<number>;
    nearCompleteBadges: ComputedRef<Badge[]>;
    filterBadges: (search?: string, category?: string) => Badge[];
    isCollected: (familiarId: string) => boolean;
    setCollected: (familiarId: string, value?: boolean) => void;
    toggleCollected: (familiarId: string) => void;
    bulkSetCollected: (familiarIds: string[]) => void;
};
