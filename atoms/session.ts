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
/**
 * Holds the overdue notifications array for the current app session.
 * This allows global access and ensures the modal always receives up-to-date data.
 */
export const overdueNotificationsAtom = atom([] as any[]); 