/**
 * MapleStory Familiar Badge Data
 * Source: https://maplestorywiki.net/w/Familiars/Badges
 *
 * Categories:
 *   - 'no-booster'       → Does NOT require Booster Packs
 *   - 'booster-required'  → Requires Booster Packs (some or all familiars)
 */
import type { Badge } from '../types/index';
export declare const badges: Badge[];
/** Total familiar count across all badges */
export declare const totalFamiliars: number;
/** Maximum cumulative badge stat caps */
export declare const statCaps: Record<string, string>;
