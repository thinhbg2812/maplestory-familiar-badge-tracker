/** A single familiar creature entry within a badge. */
export interface Familiar {
    id: string;
    name: string;
    icon?: string;
    boosterOnly?: boolean;
}
/** A badge that groups familiars and grants stat effects. */
export interface Badge {
    id: string;
    name: string;
    category: string;
    effects: string;
    familiars: Familiar[];
}
/** App settings persisted to localStorage. */
export interface Settings {
    threshold: number;
}
/** Shape of the localStorage-persisted state. */
export interface StorageState {
    collected?: Record<string, boolean>;
    references?: Record<string, string>;
    settings?: Partial<Settings>;
}
/** A single template-match hit from OpenCV. */
export interface MatchResult {
    x: number;
    y: number;
    w: number;
    h: number;
    confidence: number;
    scale: number;
}
/** Scan result for one familiar across a screenshot. */
export interface ScanResult {
    familiarId: string;
    matches: MatchResult[];
}
/** Progress stats for one badge. */
export interface BadgeProgress {
    total: number;
    collected: number;
    percent: number;
    complete: boolean;
}
/** Overall collection progress. */
export interface OverallProgress {
    total: number;
    collected: number;
    percent: number;
}
