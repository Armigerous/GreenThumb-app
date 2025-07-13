import { atom } from "jotai";

/**
 * Tracks whether the welcome subscription banner has been shown during the current app session.
 * This prevents it from re-appearing on navigation.
 */
export const hasShownWelcomeBannerAtom = atom(false);
/**
 * Tracks whether the overdue tasks modal has been shown during the current app session.
 * This prevents it from re-appearing on navigation or remounts.
 */
export const hasShownOverdueModalAtom = atom(false); 